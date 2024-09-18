/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2017 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 *  ============================================================================================
 * /
 */

import {VwFileUploadMgr} from "../util/VwFileUploadMgr/VwFileUploadMgr.js";
import VwFileReader from "../util/VwFileReader/VwFileReader.js";


function VwWebRtcDataChannelMgr( mapDataChannels, strUserId, strUserIdPeer, rtcPeerConnection, dataChannelProps )
{

  let m_strImgData;
  let m_fIsBlobData = false;
  let m_aBlobChunks;
  let m_strFileName;
  let m_nFileChunkSize = 8 * 1024;
  let m_strBlobSenderId;
  
  // Public Fuctions

  this.clear = clearDataChannels;
  this.sendTextMsg = sendTextMsg;
  this.sendFile = handleSendFile;
  this.sendImage = handleSendImg;
  this.close = close;

  setup();
  
  function setup()
  {
    if ( dataChannelProps.type == "attach")
    {
      console.log( "Attaching data channel")
      rtcPeerConnection.ondatachannel = handleAddDataChannel;
    }
    else
    {
      createDataChannel();
    }
  }

  function clearDataChannels()
  {
    close();
    mapDataChannels.clear();

  }

  function close( strUserIdToClose )
  {

    if ( strUserIdToClose )
    {
      let rtcPeerDataChannel = mapDataChannels.get( strUserIdToClose );
      mapDataChannels.remove( strUserIdToClose );

      if ( !rtcPeerDataChannel )
      {
        return;
      }

      if ( rtcPeerDataChannel.readyState != "closed" )
      {
        rtcPeerDataChannel.close();
      }
      
      rtcPeerDataChannel = null;
      return;

    }

    // If no user id specified, close all channels
    for ( const rtcPeerDataChannel of mapDataChannels.values() )
    {
      if ( rtcPeerDataChannel.readyState != "closed" )
      {
        rtcPeerDataChannel.close();
      }

    } // end for()

    mapDataChannels.clear();


  } //end close()


  /**
   * Setus up the data channnel for text and file sharing
   * @param rtcPeerDataChannel
   */
  function setupDataChannel( rtcPeerDataChannel )
  {

    //Error Handler
    rtcPeerDataChannel.onerror = function( error )
    {
      handleDataChannelError( rtcPeerDataChannel, error );

    }

    // Message passing
    rtcPeerDataChannel.onmessage = function( event )
     {
       handleDataChannelMessage( rtcPeerDataChannel, event );

     }

    rtcPeerDataChannel.onopen = () =>
    {
      console.log( "data Chanel " + rtcPeerDataChannel.label + " is open");
    };

    rtcPeerDataChannel.onclose = () =>
    {
      console.log("data Chanel " + rtcPeerDataChannel.label + " is closed");
    };

  }

  /**
   * Creates a data channel from a peer connection
   * @param rtcPeerConnection
   */
  function createDataChannel( )
  {
    // Create data channel for text and file sharing
    const rtcPeerDataChannel = rtcPeerConnection.createDataChannel( "chatChannel", {reliable:true});
    rtcPeerDataChannel.userId = strUserIdPeer;

    const readyState = rtcPeerDataChannel.readyState;

    console.log( "Creating data channel for peer: " + strUserIdPeer );
    setupDataChannel( rtcPeerDataChannel );

    mapDataChannels.put( strUserIdPeer, rtcPeerDataChannel );

  }

  function handleAddDataChannel( event )
  {
    // Create data channel for text and file sharing
    const rtcPeerDataChannel = event.channel;

    rtcPeerDataChannel.userId = strUserIdPeer;

    setupDataChannel( rtcPeerDataChannel );
    mapDataChannels.put( strUserIdPeer, rtcPeerDataChannel );

  }


  /**
   * Sends a text message in the data channel to all users in the chatroom unless the userid is specified, in which
   * only the userid spcified gets the message
   *
   * @param strTextMsg The text message to send
   * @param strUserId If specifed only send message to this user id
   */
  function sendTextMsg( strTextMsg, strUserId )
  {

    const strMsgJSON = createMsgEnvelopeJSON( "text", strTextMsg );

    // Only send to this user id if specified

    if ( strUserId )
    {
      const rtcPeerDataChanel = mapDataChannels.get( strUserId );

      if ( !rtcPeerDataChanel )
      {
        throw "Invalid user id: " + strUserId + "specified in sendTextMsg";
      }

      rtcPeerDataChanel.send( strMsgJSON );
      return;

    }


    const aDataChannels = mapDataChannels.values();

    if( !aDataChannels )
    {
      return;
    }


    for ( const rtcPeerDataChanel of aDataChannels )
    {
      const readyState = rtcPeerDataChanel.readyState;
      rtcPeerDataChanel.send( strMsgJSON );
    }

  } // end sendTextMsg()

  function handleSendImg()
  {
    readImgFile(( strImage64 ) =>
                {
                  let nStartPos = 0;

                  const aDataChannels = mapDataChannels.values();


                  while( true )
                  {

                    const strChunk = strImage64.substring( nStartPos, nStartPos + m_nFileChunkSize );

                    let strMsgType;

                    if ( nStartPos == 0 )
                    {
                      strMsgType = "img"
                    }
                    else
                    if ( nStartPos + m_nFileChunkSize < strImage64.length )
                    {
                      strMsgType = "imgChunk"
                    }
                    else
                    {
                      strMsgType = "imgEnd";

                    }

                    let strMsgJSON = createMsgEnvelopeJSON( strMsgType, strChunk );

                    for ( const rtcPeerDataChanel of aDataChannels )
                    {
                        rtcPeerDataChanel.send( strMsgJSON );
                    }

                    if ( nStartPos + m_nFileChunkSize >= strImage64.length )
                    {
                      if( strMsgType != "imgEnd")
                      {
                        strMsgJSON = createMsgEnvelopeJSON( "imgEnd", "" );

                        for ( const rtcPeerDataChanel of aDataChannels )
                        {
                          rtcPeerDataChanel.send( strMsgJSON );

                        } // end for()

                      } // end if

                      break;
                    }

                    nStartPos += m_nFileChunkSize;

                  } // end while()

                });
  } // handleSendImg()



  function createMsgEnvelopeJSON( strMsgType, strData )
  {
    const msgEnvelope = {};
    msgEnvelope.strType = strMsgType;
    msgEnvelope.data = strData;
    msgEnvelope.strSenderId = strUserId;

    return JSON.stringify( msgEnvelope );

  }

  /**
   * Open the os platform file chooser dialog box
   */
  function handleSendFile( fileToSend )
  {
    // If File object provided send it else put up the file selection dialog to choose
    if ( fileToSend )
    {
      sendFileInChunks( file );
      return;


    }

    const uploadMgr = new VwFileUploadMgr();
    uploadMgr.showFileOpenDialog( false, null, function( file )
    {
      sendFileInChunks( file );
    });

  }

  /**
   * Sends a file in chunks
   * @param file The file to send in chunks
   */
  function sendFileInChunks( file )
  {
    const nStartTime = new Date().getTime();

    const nStartPos = 0;
    const nEnd = nStartPos + m_nFileChunkSize;

    const aDataChannels = mapDataChannels.values();

    const strMsg = "Sending 'blobStart' for File: " + file.name;

    console.log( strMsg );

    let strEnvelopeJSON = createMsgEnvelopeJSON( "blobStart", file.name );

    // Send start blob message
    sendDataChannel( aDataChannels, strEnvelopeJSON );

    sendBlobChunk( aDataChannels, nStartPos, nEnd, file, function()
    {
      strEnvelopeJSON = createMsgEnvelopeJSON( "blobEnd", "" );
      sendDataChannel( aDataChannels, strEnvelopeJSON );

      console.log( "File: " + file.name + " Took " + (new Date().getTime() -nStartTime) + " seconds to transfer");
    });



  }


  function sendBlobChunk( aDataChannels, nStart, nEnd, file, fnComplete )
  {
    if ( nStart >= file.size - 1 )
    {
      fnComplete();
      return;
    }

    const blob = file.slice( nStart, nEnd );

    const fr = new FileReader();

    fr.onload = function( event )
    {

      sendDataChannel( aDataChannels, event.target.result  );

      nStart = nEnd;
      nEnd = nStart + m_nFileChunkSize;

      sendBlobChunk(  aDataChannels, nStart, nEnd, file, fnComplete );

    };


    fr.readAsArrayBuffer( blob );
  }



  /**
   * Sends data on the data channel
   *
   * @param aDataChanbels
   * @param data
   */
  function sendDataChannel( aDataChannels, data )
  {

    for ( const rtcPeerDataChanel of aDataChannels )
    {
      rtcPeerDataChanel.send( data );
    }

  } // end sendDataChannel()


  /**
   * Read an image file to nsend
   * @param fnResult
   */
  function readImgFile( fnResult  )
  {
    const uploadMgr = new VwFileUploadMgr();
    uploadMgr.showFileOpenDialog( false, "image/*", async function( file )
    {

      const result = VwFileReader.readAsDataUrl( file );
      if ( result )
      {
        fnResult( result );
      }

    });

  }

  function handleDataChannelMessage( rtcPeerDataChannel, event )
  {

    const strDataType = typeof event.data;

    if ( strDataType == "object" )
    {
      console.log( "Got Blob Chunk For File Name: " + m_strFileName );
      handleBuildBlockChunks( event.data );
      return;

    }

    const msgEnvelope = JSON.parse( event.data );

    console.log( "Got Data Channel Message Type " + msgEnvelope.strType );

    switch( msgEnvelope.strType )
    {
      case "text":

            if ( dataChannelProps.onTextMessage )
            {
              dataChannelProps.onTextMessage( msgEnvelope.strSenderId, msgEnvelope.data );
            }

            break;

      case "img":

           m_strImgData = msgEnvelope.data;
           break;

      case "imgChunk":

           m_strImgData += msgEnvelope.data;
           break;

      case "imgEnd":

           m_strImgData += msgEnvelope.data;
           if ( dataChannelProps.onImageMessage )
           {
              dataChannelProps.onImageMessage( msgEnvelope.strSenderId, m_strImgData );
           }

           m_strImgData = null;

           break;

      case "blobStart":

           m_aBlobChunks = [];
           m_fIsBlobData = true;

           m_strFileName = msgEnvelope.data;
           m_strBlobSenderId = msgEnvelope.strSenderId;
           console.log( "Got Blob start Msg for File: " + m_strFileName );
           break;


      case "blobEnd":

            console.log( "Got blobEnd Msg for File: " + m_strFileName );

            saveBlob();

           break;


    }

  }


  function saveBlob()
  {
    m_fIsBlobData = false;

    let blobComplete = new Blob( m_aBlobChunks );

    if ( dataChannelProps.onFileBlobMessage )
    {
      dataChannelProps.onFileBlobMessage( m_strBlobSenderId, m_strFileName, blobComplete );
    }

    blobComplete = null;


  }


  function handleBuildBlockChunks( blob  )
  {

    m_aBlobChunks.push( blob );

  }


  /**
   * Data Channel error handler
   * @param rtcPeerDataChannel
   * @param error
   */
  function handleDataChannelError( rtcPeerDataChannel, error )
  {
    const strReadyState = rtcPeerDataChannel.readyState;

    console.error( "Data Channdel For User: " + rtcPeerDataChannel.userId + " had an error : " + error.toString() );
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
    objResult.nChunkSize = m_nFileChunkSize;

    if ( nFileSize < m_nFileChunkSize )
    {
      objResult.nChunkSize = nFileSize;
      objResult.nNbrChunks = 1;
      return objResult;
    }

    objResult.nNbrChunks = Math.floor( nFileSize / m_nFileChunkSize );

    const nRemmainder = nFileSize % m_nFileChunkSize;

    if ( nRemmainder > 0 )
    {
      ++objResult.nNbrChunks;
    }

    return objResult;


  } // end configOptimumChunks()

} // end

export default VwWebRtcDataChannelMgr;