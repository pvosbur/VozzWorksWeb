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

/**
 * This class manages media streams. I.e. camera, microphone, screens browser extension tests
 * @constructor
 */
function VwWebRtcMediaStreamMgr()
{
  this.hasChromeScreenExtension = hasChromeScreenExtension;

  var m_fnStreamReady;

  /**
   * Test to see if the chrom screen extension is available
   * @param fnResult
   */
  function hasChromeScreenExtension( fnResult )
  {
    window.addEventListener( "message", handleContentScriptEvent );

    window.postMessage( "are-you-there", "*" );

    var fIsThere = false;

    setTimeout( function()
               {
                 window.removeEventListener( "message", handleContentScriptEvent );

                 if ( !fIsThere )
                 {
                   fnResult( false );
                 }
               }, 250 );

     /**
      * Screen share request successful
      * @param event
      */
     function handleContentScriptEvent( event )
     {

       if ( event.data && event.data == "cr8-extension-loaded" )
       {
         fIsThere = true;
         fnResult( true );

       }

     }

  }

} // end VwWebRtcMediaStreamMgr{}


/**
  * Get the stream source based on the conversation type
  */
 function setupScreenShareStream( screenShareMediaContstraints, fnStreamReady )
 {

   window.addEventListener( "message", handleScreenContentScriptEvent );

   window.postMessage( "get-sourceId", "*");

   /**
    * Screen share request successful
    * @param event
    */
   function handleScreenContentScriptEvent( event )
   {

     if (event.data && event.data.sourceId  )
     {

       window.removeEventListener( "message", handleScreenContentScriptEvent );
       screenShareMediaContstraints.video.mandatory.chromeMediaSourceId = event.data.sourceId;

       getMediaStream( screenShareMediaContstraints, fnStreamReady );
     }

   }

 }



/**
 * Gets a media stream based on the constructor media constraints
 *
 * @param fnComplete The callback function that is passed a stream instance fnComplete( stream )
 */
function getMediaStream( mediaConstraints, fnComplete, fnFail )
{

  if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia )
  {
    navigator.mediaDevices.getUserMedia( mediaConstraints ).then( handleMediaSuccess ).catch( handleMediaFailed );
  }

  function handleMediaSuccess( stream )
  {
     fnComplete( stream );
  }

  function handleMediaFailed()
  {
    if ( fnFail )
    {
      fnFail( "Could Not Get Access to webcam or microphone" );
    }
    else
    {
      alert( "Could Not Get Access to webcam or microphone or screen" );

    }
  }


} // end getMediaStream()

export default VwWebRtcMediaStreamMgr;



