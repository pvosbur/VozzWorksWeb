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

import VwQueue from "../VwQueue/VwQueue.js";
import VwExString from "../VwExString/VwExString.js";

function VwAjaxMgr( objAjaxProps )
{
  const m_qRequests = new VwQueue();
  const m_nMaxReries = 5;

  let m_objProps;
  let m_fProcessing = false;


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

  configProps( objAjaxProps );

  /**
   * Ajax get request
   *
   * @param strUrl Url to server
   * @param fnResp  callback response on success
   * @param fnError callback on error
   */
  function get( strUrl, fnResp, fnError )
  {
    m_qRequests.add( new AjaxContext( "get", strUrl, fnResp, fnError ) );


    //console.log( "Adding GET Requesst for: " + strUrl + " QSIZE: " + nQSize );

    // If this is the only entry the start the request process
    if ( !m_fProcessing )
    {
      processNextRequest();
    }
  }


  /**
   * Ajax Post
   *
   * @param strUrl Url to server
   * @param data  The data to post
   * @param fnResp  callback response on success
   * @param fnError callback on error
   */
  function post( strUrl, data, fnResp, fnError )
  {
    m_qRequests.add( new AjaxContext( "post", strUrl, fnResp, fnError, data ) );

    const nQSize = m_qRequests.size();

    //console.log( "Adding POST Requesst for: " + strUrl + " QSIZE: " + nQSize );

    // If this is the only entry the start the request process
    if ( nQSize == 1 )
    {
      processNextRequest();   // If this is the only entry the start the request process
    }

  }

  /**
   * DVO objec for each AJAX request
   *
   * @param strType  The type get or post
   * @param strUrl   The server url
   * @param fnResp   callback function for the response
   * @param fnError  callback function for an error
   * @param objData  data to be posted if post request
   * @constructor
   */
  function AjaxContext( strType, strUrl, fnResp, fnError, objData )
  {
    const m_fnResp = fnResp;
    const m_fnError = fnError;

    let m_nRetryCount = 0;

    const self = this;

    if ( m_objProps.encryptUrls )
    {

      this.url = encryptUrl( strUrl );

    }
    else
    {
      this.url = strUrl;

    }

    // Public
    this.type = strType;

    if ( strType == "post" && objData && m_objProps.encryptUrls )
    {
      this.data = VwExString.enCrypt( objData );

    }
    else
    {
      this.data = objData;
    }

    this.ajaxReturn = ajaxReturn;
    this.ajaxError = ajaxError;

    this.getError = function ()
    {
      return m_fnError;

    }

    this.incrementRetry = function ()
    {
      ++m_nRetryCount;
    }

    this.getRetryCount = function ()
    {
      return m_nRetryCount;

    }

    /**
     * Suceess Ajax return
     * @param resp
     * @param strStatus
     * @param request
     */
    function ajaxReturn( resp, strStatus, request )
    {
      const respRaw = resp;

      //console.log( "Got successful response for url: " + this.url );
      self.resp = resp;
      const strContentType = request.getResponseHeader( 'content-type' );

      //console.log( "RETURN: CONTENT TYPE: " + strContentType );
      if ( VwExString.startsWith( strContentType, "application/vwencrypted-octet-stream" ) )
      {
        resp = VwExString.deCrypt( resp );

        if ( !resp )
        {
          console.log( "ERROR GOT NULL OBJECT For RESP: " + respRaw );
        }

        resp = JSON.parse( resp );
      }

      m_fProcessing = false;

      if ( m_fnResp )
      {

        if ( m_objProps.fnResponsePreProcessor )
        {
          if ( !m_objProps.fnResponsePreProcessor( self ) )
          {
            return;

          }
        }

        m_fnResp( resp );
      }

      processNextRequest();

    }

    /**
     * Habdles Ajax error
     * @param jqXhr
     */
    function ajaxError( jqXhr )
    {

      if ( jqXhr.status == 503 )
      {

        if ( m_nRetryCount++ < m_nMaxReries )
        {
          m_qRequests.add( self );
          var nQSize = m_qRequests.size();

          // If this is the only entry the start the request process
          if ( nQSize == 1 )
          {
            processNextRequest();   // If this is the only entry the start the request process
          }

          return;

        }
      }

      if ( jqXhr.status == 400 )  //  Bad Request, resource/url not found
      {
        console.log( "AJAX ERROR: jqXhr.status: " + jqXhr + " jqXhr.responseText: " + jqXhr.responseText );
        handleAjaxError( self, jqXhr );
        return;
      }
      
      if ( m_fnError )
      {
        m_fnError( jqXhr );

      }
      else
      {
        if ( m_objProps.fnResponsePreProcessor )
        {
          if ( !m_objProps.fnResponsePreProcessor( self ) )
          {
            return;

          }
        }
        else
        {
          handleAjaxError( self, jqXhr );
        }
      }

      if ( m_objProps.quitOnError )
      {
        m_qRequests.clear();

      }

      m_fProcessing = false;
      processNextRequest();

    }
  }


  /**
   * Recursive function that repeats until all entries in the queue have been processed
   */
  function processNextRequest()
  {

    // Next entry from queue
    const objAjaxCtx = m_qRequests.remove();

    if ( !objAjaxCtx ) // No entries, so get out
    {
      return;
    }

    m_fProcessing = true;

    // LEAVE In for future debugging console.log( "Processing: " + objAjaxCtx.type + " request for url: " + VwExString.deCrypt( objAjaxCtx.url.substring( objAjaxCtx.url.lastIndexOf("/" ) + 1 ) ) );

    // Check if device is offline
    if ( !navigator.onLine )
    {
      // Handle offline device
      if ( objAjaxProps.fnOffline )
      {
        objAjaxProps.fnOffline();
      }

      return;
    }

    if ( objAjaxCtx.type == "get" )
    {
      $.get( objAjaxCtx.url, objAjaxCtx.ajaxReturn ).fail( objAjaxCtx.ajaxError );
    }
    else
    {
      $.post( objAjaxCtx.url, objAjaxCtx.data, objAjaxCtx.ajaxReturn ).fail( objAjaxCtx.ajaxError );

    }


  } // end  processRequest()


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
   * Handle ajax error
   * @param objAjaxCtx
   * @param jqXhr
   */
  function handleAjaxError( objAjaxCtx, jqXhr )
  {

    // Returning null from the server causes this condition. Treat it as success and return null result to client
    if ( objAjaxCtx.fnResp )
    {
      objAjaxCtx.fnResp( jqXhr );

    }
    else
    {
      if ( VwExString.startsWith( jqXhr.responseText, "<html" ) )
      {
        var errWin = window.open( "", "_self", "width=800,height=600" );
        errWin.document.write( jqXhr.responseText );
      }
      else
      {
        alert( jqXhr.status + ": " + jqXhr.responseText );
      }
    }

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

} // end wAjaxMgr{}

export default VwAjaxMgr;