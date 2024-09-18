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


import VwExString from "../VwExString/VwExString.js";


/**
 * This class is a communcations mgr with a web server. It uses the new fetch api for all http requests
 *
 * @param objCommProps Config properties
 * @param vwLogger VwLogger instane - may be null
 * @constructor
 */
function VwCommMgr( objCommProps, vwLogger )
{
  let m_objProps;

  // Public methods
  this.get = get;
  this.post = post;

  this.isUrlEncrypting = function ()
  {
    return m_objProps.encryptUrls;
  };

  this.setUrlEncryption = function ( fEncryptUrls )
  {
    m_objProps.encryptUrls = fEncryptUrls;

  };

  this.encryptUrl = encryptUrl;

  configProps( objCommProps );

  /**
   * If url encryption property is set, encrypt the url, else just return the url
   *
   * @param strUrl The url to process
   * @return {string|*}
   */
  function processUrlEncryption( strUrl )
  {
    if ( m_objProps.encryptUrls )
    {

      return encryptUrl( strUrl );

    }
    else
    {
      return strUrl;

    }

  } // end processUrlEncryption( strUrl )

  /**
   * Encrypts post data if encryption is turned on
   *
   * @param strPostData The post data to encrypt
   * @return {*}
   */
  function processDataEncryption( strPostData )
  {
    if ( !strPostData )
    {
      return "";
    }
    
    if ( m_objProps.encryptUrls )
    {

      return VwExString.enCrypt( strPostData );

    }
    else
    {
      return strPostData;

    }

  } // end processUrlEncryption( strUrl )

  /**
   * Ajax get request
   *
   * @param strUrl Url to server gor a get request
   */
  async function get( strUrl, objHeaders )
  {
    const strUrlToGet = processUrlEncryption( strUrl );

    if ( !objHeaders )
    {
      objHeaders = {"Access-Control-Expose-Headers":"*"};
    }

    // process get request
    return await fetch( strUrlToGet,{ method:"GET", headers: objHeaders } )
                  .then(  processResponseHeaders )
                  .then( response =>
                         {
                           return response;   // good fetch here
                         })
                  .catch( error =>
                          {
                            if ( vwLogger )
                            {
                              vwLogger.error( error );
                            }

                            throw error;
                          });


  } // end get()


  /**
   * Ajax Post
   *
   * @param strUrl Url to server
   * @param data  The data to post
   * @param objHeaders any additional headers to include in  post request
   */
  async function post( strUrl, data, objHeaders )
  {
    if ( !objHeaders )
    {
      objHeaders = {};

    }

    const strPostUrl = processUrlEncryption( strUrl );

    const strPostData = processDataEncryption( data );


    return await fetch( strPostUrl, { method:"POST", headers: objHeaders, body: strPostData })
                  .then( processResponseHeaders )
                  .then( response =>
                         {
                           return  response;
                         })
                  .catch( error =>
                          {
                            if ( vwLogger )
                            {
                              vwLogger.error( error );
                            }

                            alert( `${error} ${strUrl}` );
                          });

  } // end post

  /**
   * Process the reponse reurn status code
   *
   * @param response The response object from the fetch request
   * @return {*}
   */
  async function processResponseHeaders( response )
  {
    switch ( response.status )
    {
      case 200:

        return processResponseData( response );

      case 400:  // Exception error from server

        const strError = await response.text();

        if ( m_objProps.fnErrorResponseProcessor )
        {
          throw m_objProps.fnErrorResponseProcessor( strError );
        }

        throw strError;

      case 404:

        throw `Response Status: ${response.status} -- Request Not Found:`;

      case 500:

        throw `Response Status: ${response.status} -- Internal Server Error:`;

      default:

        throw `Response Status: ${response.status} -- Error Processing Request:`;

    } // end switch()

  } // processResponseHeaders()


  /**
   * Invoke the response data processing method based on the content type
   *
   * @param response
   * @return {*}
   */
  async function processResponseData( response )
  {

    // the response headers are returned in the entries() iterator. we look for the content type header and set it here
    let strContentType = "";

    for ( const pair of response.headers.entries())
    {
      if ( pair[0] == "content-type")
      {
        strContentType = pair[ 1 ];
        break;
      }

    }

    // Strip off anything past content type if exists
    const nPos = strContentType.indexOf( ";");

    if ( nPos > 0 )
    {
      strContentType = strContentType.substring( 0, nPos );
    }

    // This is an encrypted message
    if ( VwExString.startsWith( strContentType, "application/vwencrypted-octet-stream" ) )
    {
      const str = await response.text(); // get the encrypted string

      const strRespJson = VwExString.deCrypt( str );

      if ( !strRespJson )
      {
        throw "Decryption Error";
      }

      return  JSON.parse( strRespJson );  // return the json object
    }

    // Process standard content types here
    switch ( strContentType )
    {
      case "application/json":

        return response.json();

      case "text/plain":
      case "text/html":

        return response.text();

      case "application/octet-stream":

        return response.arrayBuffer();

      default:

        return response.text();

    } // end switch()

  } // end processResponseData()




  /**
   * Encrypts the url using the Vozzworks string encryption algorithm
   * @param strUrlToEncrypt The url to encrypt
   * @returns {string}
   */
  function encryptUrl( strUrlToEncrypt )
  {
    let nPos = strUrlToEncrypt.indexOf( "/service" );

    nPos += "/serviceRequest/".length;

    const strParams = strUrlToEncrypt.substring( nPos );
    let strBaseUrl = strUrlToEncrypt.substring( 0, nPos );

    //console.log( "ENCRYPTING: " + strUrlToEncrypt );

    const strParamsEnCrypted = VwExString.enCrypt( strParams );

    //console.log( "GOT : " + strBaseUrl + strParamsEnCrypted );

    return strBaseUrl + strParamsEnCrypted;

  }


  /**
   * Setup default and config user properties
   * @param objProps User Properties
   */
  function configProps( objProps )
  {
    m_objProps = {};

    m_objProps.quitOnError = true;

    $.extend( m_objProps, objProps );
  }

} // end VwCommMgr{}

export default VwCommMgr;