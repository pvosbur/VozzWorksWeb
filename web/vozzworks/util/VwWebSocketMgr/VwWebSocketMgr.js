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

/**
 * Create and manage a WebSocket Connection
 *
 * @param strTopic The topic used for this web socket connection
 * @param strServerUrl The server url
 * @param fnMesgCallback The callback used for incoming messages
 * @param fnOpenCallback The callback used when the socket is in open state
 * @param fnCloseCallback The callback used when the socket has been closed
 * @constructor
 */
 function VwWebSocketMgr( strTopic, strServerUrl, fnMesgCallback, fnOpenCallback, fnCloseCallback, fnErrorCallback )
 {

   const m_strTopic = decodeURIComponent( strTopic );
   const m_strServerUrl = strServerUrl;
   const m_fnMsgCallback = fnMesgCallback;
   const m_fnOpenCallback = fnOpenCallback;
   const m_fnCloseCallback = fnCloseCallback;
   const m_fnErrorCallback = fnErrorCallback;

   let m_socket = null;

   initialize();

   /**
    *  Setup the web socket url string
    */
   function initialize()
   {
     const url = m_strServerUrl;

     const nStartPos = url.indexOf( "//") + 2;

     let nEndPos =  url.lastIndexOf( "/") ;


     if ( (nEndPos + 1) == nStartPos )
     {
       nEndPos = url.length;
     }

     let strProtocol = "ws";

     if ( m_strServerUrl.indexOf( "https") >= 0 )
     {
       strProtocol = "wss";
     }

     strProtocol += "://";

     const wsUrl = strProtocol + url.substring( nStartPos, nEndPos ) + "/topic/" + m_strTopic;

     //alert ("connecting to :" + wsUrl );

     connect( wsUrl );

   }


   /**
    * Create the socket connection
    * @param strHostUrl
    */
   function connect( strHostUrl )
   {
     if ('WebSocket' in window)
     {
       //console.log( "Websocket Connecting to host: " + strHostUrl );
       m_socket = new WebSocket( strHostUrl );
     }
     else
     if ('MozWebSocket' in window)
     {
       //console.log( "Websocket Connecting to host: " + strHostUrl );
       m_socket = new MozWebSocket( strHostUrl );
     }
     else
     {
       alert('Error: WebSocket is not supported by this browser.');
     }

     m_socket.onopen = function ()
     {
       if ( m_fnOpenCallback  )
       {
         m_fnOpenCallback();
       }

     };

     m_socket.onclose = function ()
     {

       if ( m_fnCloseCallback  )
       {
        m_fnCloseCallback();
       }


     };

     m_socket.onmessage = function (message)
     {
       if ( m_fnMsgCallback  )
       {
         m_fnMsgCallback( message.data );
       }

     };


     m_socket.onerror = function (message)
     {
       if ( m_fnErrorCallback )
       {
         const strErr =  "Error: WebSocket could not connect to server host: " + strHostUrl + " return state: " + message.currentTarget.readyState;
         m_fnErrorCallback( strErr );

       }
     };

   } // end connect()


   /**
    * Close the websocket
    */
   this.close = function()
   {
     m_socket.close();

   }


   this.setBinaryType = function( strType )
   {
     m_socket.binaryType = strType;
   }

   /**
    * Sends a message to the server
    *
    * @param strMessage The Message to send
    */
   this.sendDirect = function( strMessage )
   {
     m_socket.send( strMessage );

   }


   /**
    *
    * @param strServiceUrl
    * @param strMessage
    */
   this.sendAsService = function( strServiceUrl, strMessage  )
   {
     doPost( strServiceUrl, strMessage );

   }
 } // end VwWebSocketMgr{}

export default VwWebSocketMgr;