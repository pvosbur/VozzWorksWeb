/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2012 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 * ============================================================================================
 *
 */

import VwHashMap from "../VwHashMap/VwHashMap.js";
import VwQueue from "../VwQueue/VwQueue.js";

/**
 * This class manages various ways to upload file(s) to a server
 *
 * @param objProps properties that define uploaed behaviour call back handlers
 * @param eventMgr A VwEventMgr instance
 * @param commMgr the communications manager
 * @constructor
 */
export function VwFileUploadMgr( objProps, eventMgr, commMgr )
{
  const self = this;
  const m_mapBlobChunks = new VwHashMap();
  const m_qFIleChunks = new VwQueue();
  const MAX_RETRIES = 10;

  let MAX_CONCURRENT_AJAX_REQ = 3; // The default
  let m_nChunksComplete = 0;
  let m_nTotalChunks;
  let m_fUseSlowNetworkDetection = false;
  let m_nMaxChunkReturnTime = 15000; // 15 second default (in millisecs)
  let m_nMaxChunkSize =  5000000; // 5 meg default
  let m_objProps;
  let m_fCancelAllUploads = false;
  let m_fCancelAllUploadsSilent = false;
  let m_xhr;
  let m_fileUploading;
  let m_strFileCompleteEventId;
  let m_qUploadFiles;
  let m_nRetryCount = 0;
  let m_strUrl;
  let m_strFileNameExtension;

  // PUBLIC METHODS

  this.getFileToUpload = getFileToUpload;
  this.getFilesToUpload = getFilesToUpload;
  this.showFileOpenDialog = showFileOpenDialog;
  this.uploadFiles = uploadFiles;
  this.uploadFile = uploadFile;
  this.clear = clearUploadQueue;
  this.cancelUpload = cancelUpload;
  this.killAll = killAll;
  this.removeFromUploadList = removeFromUploadList;
  this.addFile = addFile;
  this.hasUploadFiles = hasUploadFiles;
  this.useFileCompleteEventListener  = useFileCompleteEventListener;
  this.setExternalAbortEventHandler = setExternalAbortEventHandler;
  this.setMaxChunkUploadSize = setMaxChunkUploadSize;
  this.setMaxConcurrentAjaxReq = setMaxConcurrentAjaxReq;
  this.setUseSlowNetworkDetection = setUseSlowNetworkDetection;
  this.setSlowNetworkDetectionTime = setSlowNetworkDetectionTime;
  
  configProps( objProps );

  /**
   * If this method is called, the upload mgr will wait for a push notitfcation from the server to signle
   * that the file upload has completed as opposed to the ajax onload event
   *
   * @param strEventId
   */
  function useFileCompleteEventListener( strEventId )
  {

    m_strFileCompleteEventId = strEventId;

    eventMgr.removeEventListener( strEventId, "VwFileUploadMgr", handleFileCompleteEvent );
    eventMgr.addEventListener( strEventId, "VwFileUploadMgr", handleFileCompleteEvent );

  }

  /**
   * Installs an abort listener from an external abort process like a second stage upload going from a server to a CDN
   *
   * @param strEventId The event id to listen for
   */
  function setExternalAbortEventHandler( strEventId )
  {
    eventMgr.removeEventListener( strEventId, "VwFileUploadMgr", handleExternalAbortEvent );
    eventMgr.addEventListener( strEventId, "VwFileUploadMgr", handleExternalAbortEvent );

  }

  /**
   * Sets the maximum chunk upload size. Default is 5 meg
   *
   * @param nSize
   */
  function setMaxChunkUploadSize( nSize )
  {
    m_nMaxChunkSize = nSize;
  }

  /**
   * Sets the maximum concurrent ajax requests. The default is 3
   * @param nMaxRequest The maximum concurrent ajax requests
   */
  function setMaxConcurrentAjaxReq( nMaxRequest )
  {
    MAX_CONCURRENT_AJAX_REQ = nMaxRequest;
    
  }

  function clearUploadQueue()
  {
    m_qUploadFiles.clear();

  }
  /**
   * Ensables the slow network detection which fires a VW_SLOW_NETWORK_DETECTED event
   * if Ajax chunk request doesn't return in the time expected. Use the setSlowNetworkDetectionTime to set the 
   * max wait time. The default is 15000 milli seconds
   * 
   * @param fUseSlowNetworkDetection true to set false to disable
   */
  function setUseSlowNetworkDetection( fUseSlowNetworkDetection )
  {
    m_fUseSlowNetworkDetection = fUseSlowNetworkDetection;
  }


  /**
   * Sets the time (in milliseconds) that a returned ajax upload chunk returns 
   * @param nTimeInMilleSecs The expected time that a response from the server will take
   */
  function setSlowNetworkDetectionTime( nTimeInMilleSecs )
  {
    m_nMaxChunkReturnTime = nTimeInMilleSecs;
    
  }
  /**
   * Displays the file systems file open dialog for file selection and uploads the selected file.
   *
   * @param strUrl The server upload url
   * @param strFilter A mime type filter passed to the file open dialog
   * @param strFileMetaData Any user extension data to be appended to the file name on the FormData
   */
  function getFileToUpload( strUrl,  strFilter, strFileMetaData )
  {
    showFileOpenDialog( false, strFilter, function( fileToUpload )
    {
      if ( m_objProps.preFileUpload )
      {
        if ( ! m_objProps.preFileUpload( fileToUpload ) )
        {
          return; // User cancelled upload
        }

      }

      uploadFile( strUrl, fileToUpload, strFileMetaData );

    });

  }

  /**
   * Opens the FileOpenDialog and allows user to choose the files to upload
   * @param strUrl The server url where the files will be uploaded to
   * @param strFilter  A filter to allow files with matching extensions
   * @param strFileNameExtension
   */
  function getFilesToUpload( strUrl, strFilter, strFileNameExtension )
  {
    showFileOpenDialog( true, strFilter, function( aFilesToUpload )
    {
      if ( ! Array.isArray( aFilesToUpload ) )  // User only chose one file from the ffile open dialog
      {
        uploadFile( strUrl, aFilesToUpload, strFileNameExtension );

      }
      else
      {
        uploadFiles( strUrl, aFilesToUpload, strFileNameExtension );
      }

    });

  }

  /**
   * Kill all uploads in silent mode
   */
  function killAll()
  {
    cancelUpload( true, true );

  }



  /**
   * Attempts to cancel to the current file being uploaded
   */
  function cancelUpload( fCancelAll, fKillAll )
  {
    m_fCancelAllUploadsSilent = fKillAll;
    m_fCancelAllUploads = fCancelAll;

    if ( !m_fileUploading )
    {
      return;

    }

    if ( m_objProps.useFileChunks )
    {
      sendAbortToServer();
      m_mapBlobChunks.clear();

      return;
    }


    // we are using FormData Upload if we ge here
    if ( m_xhr )
    {
      m_xhr.abort(); // kill current process

    }

  }

  /**
   * Removes a file from the list of files to be uploaded
   * @param strFileName
   */
  function removeFromUploadList( strFileName )
  {
    m_qUploadFiles.remove( strFileName );
  }


  /**
   * Upload a single file
   *
   * @param strUrl  The server to upload to
   * @param fileToUpload The file to upload
   * @param strFileNameExtension optional extension in the forma data to append
   */
  async function uploadFile( strUrl, fileToUpload, strFileNameExtension )
  {
    return new Promise( proceedWithUpload );

    async function proceedWithUpload( success, fail )
    {
      m_fileUploading = fileToUpload;
      m_strUrl = strUrl;

      fireUploadEvent( VwFileEvents.VW_START_UPLOAD_FILE, fileToUpload.name );

      // Use file chunk uploader and not single FormData method
      if ( m_objProps.useFileChunks )
      {
        doUploadFileInChunks();
        success( {result:"ok"})
      }
      else
      if ( m_objProps.doMultipartPut )
      {
        const strResp = await doMultipartPut( strUrl, fileToUpload, strFileNameExtension );
        success(strResp);
      }
      else
      {
        const formData = makeFormData( m_fileUploading );

        doFormDataUpload( strUrl, formData,  ( result ) =>
        {
          success( result );
        } );
      }

    }
  }

  /**
   * Create a multipart put operation
   *
   * @param strUrl The upload url
   * @param fileToUpload The File obkect to upload
   * @param strFileNameExtension
   */
  function doMultipartPut( strUrl, fileToUpload, strFileNameExtension )
  {
    return new Promise( proceedWithSend );

    function proceedWithSend( success, fail )
    {
      // Use the FileReader API to access file content

      const reader = new FileReader();
      let fileData;

      // Because FileReader is asynchronous, store its
      // result when it finishes to read the file
      reader.addEventListener( "load", () =>
      {
        fileData = reader.result;
        sendPutFile();
      });

      // todo reader.readAsBinaryString( fileToUpload );

      sendPutFile();


      function sendPutFile()
      {
        const XHR = new XMLHttpRequest();

        const formData = new FormData();

        formData.append( fileToUpload.name, fileToUpload );
        /*
        // Store our body request in a string.
        let uploadData = "";

        // To construct our multipart form data request,
        // We need an XMLHttpRequest instance

        // We need a separator to define each part of the request
        const boundary = "blob";

        // Start a new part in our body's request
        uploadData += "--" + boundary + "\r\n";

        // Describe it as form data
        uploadData += 'content-disposition: form-data; '
                // Define the name of the form data
                + 'name="' + fileToUpload.name + '"; '
                // Provide the real name of the file
                + 'filename="' + fileToUpload.name + '"\r\n';
        // And the MIME type of the file
        uploadData += 'Content-Type: ' + fileToUpload.type + '\r\n';

        // There's a blank line between the metadata and the data
        uploadData += '\r\n';

        // Append the binary data to our body's request
        uploadData += fileData + '\r\n';

        // Close the multipart bounder
        uploadData += "--" + boundary + "--";

*/

        XHR.upload.onprogress = handleFileUploadProgress;

        // Define what happens on successful data submission
        XHR.addEventListener( 'load', function ( event )
        {
          success( "ok" );
        });

        // Define what happens in case of error
        XHR.addEventListener( 'error', ( event ) =>
        {
         fail( "Upload of File: " + fileToUpload + " Failed" );
        } );

        // Set up our request
        XHR.open( 'PUT', strUrl );
        // Add the required HTTP header to handle a multipart form data POST request
        //todo XHR.setRequestHeader( 'Content-Type', 'multipart/form-data; boundary=' + boundary );

        // And finally, send our data.
        XHR.send( formData );


      } // end sendPutFile

    } // end proceedWithSend()
  } // end sendPutFile()

  /**
   * Returns true if there are are were files to upload
   * @returns {boolean}
   */
  function hasUploadFiles()
  {
    return m_qUploadFiles != null;
  }


  /**
   * Adds a file to an existing file upload list
   * @param fileToUpload
   */
  function addFile( fileToUpload )
  {
    m_qUploadFiles.add( fileToUpload );

  }


  /**
   * Upload a set of files
   *
   * @param strUrl The upload server url
   *
   * @param aFilesToUpload Array of files to be uploaded
   *
   * @param strFileNameExtension If specified, appended data to the file name extension
   */
  function uploadFiles( strUrl, aFilesToUpload, strFileNameExtension )
  {
    m_qUploadFiles = new VwQueue();


    m_strUrl = strUrl;
    m_strFileNameExtension = strFileNameExtension;

    //Clone the array, so user modifications don't effect us
    for ( let x = 0, nLen = aFilesToUpload.length; x < nLen; x++ )
    {
      m_qUploadFiles.add( aFilesToUpload[ x ] );
    }

    // Setup event data for the start of the file upload set
    const astrFileNames = [];

    for ( let x = 0, nLen = aFilesToUpload.length; x < nLen; x++ )
    {
      astrFileNames.push( aFilesToUpload[ x ].name );

    }

    fireUploadEvent( VwFileEvents.VW_START_UPLOAD_SET, astrFileNames );

    m_fCancelAllUploads = false;

    doUpload();


  }

  /**
   * Uploads the next file in the list
   * @param nFileNdx The index on the fileuploads array of the file to upload
   */
  function doUpload()
  {
    m_nRetryCount = 0;
    m_fileUploading = null;

    if ( m_fCancelAllUploadsSilent )
    {
      return; // Dont propagate activity if silent mode
    }

    if ( m_fCancelAllUploads )
    {
      fireUploadEvent( VwFileEvents.VW_UPLOAD_SET_COMPLETE, null );
      return;
    }

    if ( !m_qUploadFiles || m_qUploadFiles.size() == 0  )
    {
      fireUploadEvent( VwFileEvents.VW_UPLOAD_SET_COMPLETE, null );

      return;
    }

    m_fileUploading = m_qUploadFiles.remove();
    fireUploadEvent( VwFileEvents.VW_START_UPLOAD_FILE, m_fileUploading.name );

    if ( m_objProps.preFileUpload )
    {
      if ( ! m_objProps.preFileUpload( m_fileUploading ) )
      {
        // client cancelled this file upload
        fireUploadEvent( VwFileEvents.VW_UPLOAD_ABORTED, m_fileUploading );

        // Upload next file
        doUpload();

      }

    }

    // Use file chunk uploader and not single FormData method
    if ( m_objProps.useFileChunks )
    {
      doUploadFileInChunks();
      return;
    }
    
    
    const formData = makeFormData( m_fileUploading );

    m_xhr = new XMLHttpRequest();

    doFormDataUpload( m_strUrl, formData, function( result )
    {
      handleFileUploadComplete( result, () =>
      {
        doUpload();

      });


    });


  }  // end doUpload()


  /**
   *  Uploads the file in blob file chumks as opposed to using the FormData for the single file
   *  A chunk can be resent if the connection gets interrupted
   */
  function doUploadFileInChunks()
  {
    m_mapBlobChunks.clear();
    m_qFIleChunks.clear();

    m_nChunksComplete = 0;
    
    const nSize = m_fileUploading.size;

    const objChunkConfig = configOptimumChunks( nSize );

    let strUrl = m_strUrl;

    strUrl += getChunkFileSpec( strUrl, objChunkConfig.nNbrChunks );

    let nStart = 0;
    
    let nEnd = objChunkConfig.nChunkSize;
    
    // Queue upp all the chunks
    
    for ( let x = 0; x < objChunkConfig.nNbrChunks; x++ )
    {
      if ( m_fCancelAllUploads )
      {
        return;

      }

      let blobChunkToUpload;
      
      if ( x == (objChunkConfig.nNbrChunks - 1) )
      {
        blobChunkToUpload = m_fileUploading.slice( nStart );
      }
      else
      {
        blobChunkToUpload = m_fileUploading.slice( nStart, nEnd );
      }

      let nChunkNbr = x + 1;

      const chunkDesc = {};
      chunkDesc.strUrl = strUrl + "&vwcn=" + nChunkNbr + "&vwclen=" + blobChunkToUpload.size;
      chunkDesc.nChunkNbr = nChunkNbr;
      chunkDesc.blobUploading = blobChunkToUpload;

      if ( commMgr.isUrlEncrypting() )
      {
        chunkDesc.strUrl  = commMgr.encryptUrl( chunkDesc.strUrl  );
      }

      m_qFIleChunks.add( chunkDesc );
         
      nStart = nEnd;
      nEnd = nStart + objChunkConfig.nChunkSize;
      

    } // end for()
    
    for ( let x = 0; x < MAX_CONCURRENT_AJAX_REQ; x++ )
    {
      const chunkDesc = m_qFIleChunks.remove();
      if ( !chunkDesc )
      {
        return;
      }

      uploadChunk( chunkDesc );
    }
    
    if ( m_fUseSlowNetworkDetection )
    {
      setTimeout( function()
                  {
                    
                    if ( m_nChunksComplete == 0 )
                    {
                      eventMgr.fireEvent( VwFileEvents.VW_SLOW_NETWORK_DETECTED );
                    }
                  }, m_nMaxChunkReturnTime );
    }
    
  }

  /**
   * Uploads a file chunk (Blob)
   *
   * @param blobToUpload The blob to upload
   * @param strUrl
   */
  function uploadChunk( chunkDesc )
  {
    const objUploadChunk = {};

    const xhr = new XMLHttpRequest();

    objUploadChunk.xhr = xhr;
    objUploadChunk.blobUploading = chunkDesc.blobUploading;

    m_mapBlobChunks.put( chunkDesc.nChunkNbr, objUploadChunk );

    xhr.chunkDesc = chunkDesc;

    xhr.open('POST', chunkDesc.strUrl, true );

    xhr.setRequestHeader('Content-Type', 'application/octet-stream');

    xhr.onload = handleChunkUploaded;

    xhr.onabort = handleFileUploadAbort;

    xhr.onerror = handleFileUploadError;
   
    xhr.send( chunkDesc.blobUploading );

   }


  /**
   * Finds a chunk size of at least 100k by reducing the nbr of chunks to send
   *
   * @param nFileSize The size of the file to upload
   * @returns chunk object that has the number of chunks to send and the chunk size
   */
  function configOptimumChunks( nFileSize )
  {
    const objResult = {};
    objResult.nChunkSize = m_nMaxChunkSize;

    if ( nFileSize < m_nMaxChunkSize )
    {
      objResult.nChunkSize = nFileSize;
      objResult.nNbrChunks = 1;
      m_nTotalChunks = 1;
      return objResult;
    }

    objResult.nNbrChunks = Math.floor( nFileSize / m_nMaxChunkSize );

    const nRemmainder = nFileSize % m_nMaxChunkSize;

    if ( nRemmainder > 0 )
    {
      ++objResult.nNbrChunks;
    }

    m_nTotalChunks = objResult.nNbrChunks;
    return objResult;


  } // end configOptimumChunks()

  /**
   * Sends abort request to the server
   * @param fnComplete
   */
  function sendAbortToServer( fnComplete )
  {
    const xhr = new XMLHttpRequest();

    let strUrl = m_strUrl;

    strUrl += getChunkFileSpec( strUrl, 1 );

    strUrl += "&vwAbort=1";
    
    if ( commMgr.isUrlEncrypting() )
    {
      strUrl = commMgr.encryptUrl( strUrl );
    }


    xhr.vwUrl = strUrl;


    xhr.open('POST', strUrl, true );
    xhr.setRequestHeader('Content-Type', 'text/plain');

    xhr.send( null );

    const aBlobChunks = m_mapBlobChunks.values();

    for ( let ndx = 0, nLen = aBlobChunks.length; ndx < nLen; ndx++  )
    {
      aBlobChunks[ndx].xhr.abort();
    }
  }
  

  /**
   * Handles the response of an uploaded blob chunk
   * @param resp
   */
  function handleChunkUploaded( resp )
  {
    const xhr = resp.currentTarget;

    const nChunkNbr = Number( xhr.responseText.substring( xhr.responseText.indexOf( ":") + 1 ) );

    //DEBUG console.log( "Return from Chunk nbr :" + nChunkNbr );

    if ( VwExString.startsWith( xhr.responseText , "VwOk" ) )
    {
      // Remove chunk ref from map as we don't need it anymore
      m_mapBlobChunks.remove( nChunkNbr );

      ++m_nChunksComplete;

      const nPctComplete = Math.floor((m_nChunksComplete / m_nTotalChunks) * 100);

      //DEBUG
      //console.log( "Pct Complete from chunk: " + nChunkNbr + " is " + nPctComplete );

      fireUploadEvent( VwFileEvents.VW_UPLOAD_PROGRESS, nPctComplete );

      if ( m_objProps.pctComplete )
      {
        m_objProps.pctComplete( nPctComplete );
      }

      // Get the next chunk to upload

      const chunkDesc = m_qFIleChunks.remove();

      if ( chunkDesc )
      {
        uploadChunk( chunkDesc);
      }


      return;

    }

    if ( xhr.responseText == "VwComplete" || xhr.responseText == "VwAllChunksComplete")
    {
      m_mapBlobChunks.clear();
      m_qFIleChunks.clear();

      fireUploadEvent( VwFileEvents.VW_UPLOAD_PROGRESS, 100 );

      if ( m_objProps.pctComplete )
      {
        m_objProps.pctComplete( 100 );
      }
      
      if ( m_strFileCompleteEventId ) // We will get an event when server processing is complete
      {
        return;
      }

      doUpload(); // get next file as no other server side processing is required
      return;

    }

    // Chunk error if we get here if this was due to a user abort clear map and get out

    if( m_fCancelAllUploads )
    {
      m_mapBlobChunks.clear();
      m_qFIleChunks.clear();

      return;

    }

    // Get the blob from the map to resend

    const objUploadChunk = m_mapBlobChunks.get( nChunkNbr );

    if ( !objUploadChunk ) // Can possibly be undefined if file abort took place
    {
      return;
    }

    uploadChunk( objUploadChunk.blobUploading, xhr.chunkDesc.strUrl, nChunkNbr );

  }



  /**
   * Complete the upload url with any user added parameters
   * @returns {string|*}
   */
  function getChunkFileSpec( strUrl, nNbrUploadChunks )
  {

    let strFileSpec = "";
    let strClientFileParams = "";

    // See if there is additional information to add from the user of this upload
    if ( m_objProps.processFormData )
    {
      strClientFileParams = m_objProps.processFormData( m_fileUploading );

    }

    // See which suffix we need
    if ( strUrl.indexOf( "?") < 0 )
    {
      strFileSpec = "?";
    }
    else
    {
       strFileSpec = "&";
    }

    strFileSpec += "vwFileSpec=";


    if ( strClientFileParams )  // Assume client is providing the client name in the params
    {
      strFileSpec += $.base64Encode( strClientFileParams );
    }
    else
    {
      strFileSpec += $.base64Encode( m_fileUploading.name );
    }

    strFileSpec += "&vwtchunks=" + nNbrUploadChunks;

    if ( m_strFileNameExtension )
    {
        strFileSpec += "&" + m_strFileNameExtension;
    }
    
    return strFileSpec;

  }

  /**
   * Fires the named event if a VwEventMgr was specified
   * @param strEventName
   * @param objEventData
   */
  function fireUploadEvent( strEventName, objEventData )
  {
    if ( eventMgr  )
    {
      eventMgr.fireEvent( strEventName, objEventData );

    }
  }


  /**
   * Uploads the formdata object
   * @param strUrl  The url to the server we are uploading to
   * @param formData The form data object being uploaded
   */
  function doFormDataUpload( strUrl, formData, fnComplete )
  {

    if ( commMgr && commMgr.isUrlEncrypting() )
    {
      strUrl = commMgr.encryptUrl( strUrl );
    }

    m_xhr = new XMLHttpRequest();

    m_xhr.open('POST', strUrl, true);
    if ( fnComplete )
    {
      m_xhr.addEventListener( "load", ( result ) =>
      {
         fnComplete( m_xhr.response );
      });
     }
    else
    {
      m_xhr.onload = handleFileUploadComplete;

    }

    // Setup the other event handlers
    m_xhr.onprogress = handleFileUploadProgress;
    
    m_xhr.onabort = handleFileUploadAbort;
    m_xhr.onerror = handleFileUploadError;

    m_xhr.send( formData );  // multipart/form-data
  }


  /**
   * XHR File upload complete handler
   *
   * @param response
   */
  function handleFileUploadComplete( response, fnComplete )
  {
    // if responseText is 'stage1', then file complete is handled via a push notification from the server
    if ( response.currentTarget.responseText == "stage1" )
    {
      return;
    }

    const objUploadComplete = {};
    objUploadComplete.readyState = response.currentTarget.readyState;
    objUploadComplete.responseText = response.currentTarget.responseText;
    objUploadComplete.response = response.currentTarget.response;
    objUploadComplete.fileUploaded = m_fileUploading;

    fireUploadEvent( VwFileEvents.VW_UPLOAD_COMPLETE, objUploadComplete );

    if ( m_objProps.uploadComplete  )
    {
       m_objProps.uploadComplete( objUploadComplete, fnComplete );
    }
    else
    if ( fnComplete )
    {
      fnComplete();
    }

  }

  /**
   * File Upload push notification from server
   * @param eventContextData
   */
  function handleFileCompleteEvent( eventContextData )
  {
    const response = {};
    response.currentTarget = {};
    response.currentTarget.readyState = 200;
    response.currentTarget.responseText = "ok";
    response.currentTarget.response = eventContextData;

    handleFileUploadComplete( response, function()
    {
      doUpload();
    });

  }


  /**
   * File upload progress event handler
   * @param event
   */
  function handleFileUploadProgress( event )
  {
    if ( event.lengthComputable )
    {

      const nPctComplete = (event.loaded / event.total) * 100;

      fireUploadEvent( VwFileEvents.VW_UPLOAD_PROGRESS, nPctComplete );

      if ( m_objProps.pctComplete )
      {
        m_objProps.pctComplete( m_fileUploading, nPctComplete );
      }

    }

  }

  /**
   * File upload progress event handler
   * @param event
   */
  function handleChunkUploadProgress( event )
  {
    console.log( "In handleChunkUploadProgress, event.lengthComputable is " + event.lengthComputable )
    if ( event.lengthComputable )
    {

      const nPctComplete = (event.loaded / event.total) / m_nTotalChunks * 100;

      console.log( "In handleChunkUploadProgress, pct complete is " + nPctComplete );

      fireUploadEvent( VwFileEvents.VW_UPLOAD_PROGRESS, nPctComplete );

      if ( m_objProps.pctComplete )
      {
        m_objProps.pctComplete( nPctComplete );
      }

    }

  }
  
  /**
   * File upload abort handler
   * @param event The event from the XHR abort
   */
  function handleFileUploadAbort( event )
  {

    if ( m_fileUploading == null )
    {
      return;
      
    }
    const objAbortData = {};
    objAbortData.jqXhr = event;
    objAbortData.fileAborted = m_fileUploading;

    fireUploadEvent( VwFileEvents.VW_UPLOAD_ABORTED, objAbortData );

    if ( m_objProps.uploadAborted )
    {
       m_objProps.uploadAborted( objAbortData, function()
       {
          // Continue to next file in list
          doUpload();

       });
    }
    else
    {
      // Continue to next file in list
      doUpload();

    }



  }


  /**
   * Handeler for external transfer abort
   * @param strFileNameAborted
   */
  function handleExternalAbortEvent( strFileNameAborted )
  {

    handleFileUploadAbort( null );

  }


  /**
   * File upload error handler
   * @param event the XHR event object
   */
  function handleFileUploadError( event )
  {
    const objErrorData = {};
    objErrorData.jqXhr = event;
    objErrorData.fileInError = m_fileUploading;

    fireUploadEvent( VwFileEvents.VW_UPLOAD_ERROR, objErrorData );

    if ( m_objProps.uploadError )
    {
       m_objProps.uploadError( objErrorData );
    }
  }


  /**
   * Displays the file selection dialog
   * @param fMultiple true if multiple files are allowed
   * @param fnResult A file or a list of file objects
   */
  function showFileOpenDialog( fMultiple, strFilter,  fnResult )
  {

    let strFileInput = "<input id='vwFileInput' type='file' style='display:none'" ;

    if ( fMultiple )
    {
      strFileInput += " multiple";

    }


    if ( strFilter )
    {
      strFileInput += " accept='" + strFilter + "'"
    }

    strFileInput += ">";

    const strInput = $("#vwFileInput")[0];

    if ( strInput)
    {
      $("#vwFileInput" ).remove();

    }

    $("body" ).append( strFileInput );

    $("#vwFileInput" ).off( "change", handleFilesSelected );

    $("#vwFileInput" ).on( "change", handleFilesSelected );

    $('input[type="file"]').click();

    function handleFilesSelected( event )
    {
      $("#vwFileInput" ).off( "change", handleFilesSelected );

      if ( fMultiple )
      {
        fnResult( event.currentTarget.files )

      }
      else
      {
        fnResult( event.currentTarget.files[0] );
      }

    }

  }

  
  /**
   * Makes a FormData object from the file to load and adds addition data to the file name if strFileNameExt is specified
   *
   * @param fileToUpload The file object being uploaded
   *
   * @returns {FormData}
   */
  function makeFormData( fileToUpload )
  {
    const formData = new FormData();

    let  strFileNameSpec;
    if ( m_objProps.getFileSpec )
    {
      strFileNameSpec = m_objProps.getFileSpec( fileToUpload );
    }
    else
    {
      strFileNameSpec = fileToUpload.name + ";" +  fileToUpload.size;
    }

    if ( fileToUpload.id )
    {
      strFileNameSpec += ";" + fileToUpload.id;

    }

    formData.append( strFileNameSpec, fileToUpload );

    if ( m_objProps.processFormData )
    {
      m_objProps.processFormData( formData, m_fileUploading );
    }

    return formData;

  }

  /**
   * Create default file upload properties
   * @param userProps User properites (optional)
   */
  function configProps( userProps )
  {

    m_objProps = {};
    $.extend( m_objProps, userProps );

  }
} // end VwFileUploadMgr{}

// FILE EVENTS

export const VwFileEvents =
{
  VW_START_UPLOAD_FILE:"VwStartFileUploadFile",
  VW_UPLOAD_PROGRESS:"VwUploadProgress",
  VW_UPLOAD_ERROR:"VwUploadError",
  VW_UPLOAD_COMPLETE:"VwUploadComplete",
  VW_UPLOAD_ABORTED:"VwUploadAborted",
  VW_UPLOAD_SET_COMPLETE:"VwUploadSetComplete",
  VW_START_UPLOAD_SET:"VwStartUploadSet",
  VW_SLOW_NETWORK_DETECTED:"VwSlowNetworkDetected"

} // end VwFileEvents{}

export default VwFileUploadMgr;

