/*
 * Created by User: petervosburgh
 * Date: 3/14/24
 * Time: 8:33 AM
 * 
 */

function VwXmlHttpRequestUploader( strUploadServiceUrl, commMgr )
{
  const m_eventMgr = getEventMgr();

  let m_fnOnFileProgress;
  let m_fnOnError;
  let m_fnOnAbort;

  this.upload = handleUpload;
  this.onFileProgress = (fnOnFileProgress ) => m_fnOnFileProgress = fnOnFileProgress;
  this.onError = ( fnOnError ) => m_fnOnError = fnOnError;
  this.onAbort = (fnOnAbort ) => m_fnOnAbort = fnOnAbort;

  async function handleUpload( fileToLoad )
  {
    return new Promise( handleUploadPromise );

    function handleUploadPromise( success, fail )
    {
      if ( commMgr && commMgr.isUrlEncrypting() )
      {
        strUploadServiceUrl = commMgr.encryptUrl( strUploadServiceUrl );
      }

      const formData = makeFormData( fileToLoad );

      const xhr = new XMLHttpRequest();

      xhr.open('POST', strUploadServiceUrl, true);
      xhr.addEventListener( "load", ( result ) =>  success( xhr.response ) );

      // Setup the other event handlers
      if ( m_fnOnFileProgress )
      {
        xhr.onprogress = m_fnOnFileProgress;
      }

      if ( m_fnOnAbort )
      {
        xhr.onabort = m_fnOnFileProgress;
        success()
      }

      if ( m_fnOnError )
      {
        xhr.onerror = m_fnOnFileProgress;
        fail()
      }

      xhr.send( formData );  // multipart/form-data

    } // end handleUploadPromise()
  } // end handleUpload()


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

    const  strFileNameSpec = fileToUpload.name;

    formData.append( strFileNameSpec, fileToUpload );

    return formData;

  } // end makeFormData()

} // end VwXmlHttpRequestUploader)

export default VwXmlHttpRequestUploader;