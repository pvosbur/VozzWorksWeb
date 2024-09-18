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

import VwWebRtcChatRoomMgr from "./VwWebRtcChatRoomMgr.js";

/**
 * Creates a Data chat room
 *
 * @param strWebSockUrl The websocket url
 * @param rtcMediaShareProps The audo chat room config props (Required)
 * @param dataChannelProps The data channel config props (Optional)
 * @constructor
 */
function VwWebRtcMediaShare( htmlShareElement, rtcMediaShareProps, fnReady )
{

  const self = this;

  let m_loacalShareStream;

  this.mute = mute;

  rtcMediaShareProps.streamType = "mediaShare";
  rtcMediaShareProps.chatType = "webRtcMediaShare";

  if ( htmlShareElement )
  {
    rtcMediaShareProps.stream = setupShareStream();
  }

  rtcMediaShareProps.fnOnAddPeerStream = ( strStreamStyle, stream, strStreamId,) => addShareStream(strStreamId, stream );

  rtcMediaShareProps.fnOnPeerClose = removeAudioStream;
  rtcMediaShareProps.fnOnLeave = removeAllAudioStreams;
  rtcMediaShareProps.fnOnChatRoomClosed = handleChatRoomClosed;

  VwWebRtcChatRoomMgr.call( this, rtcMediaShareProps, rtcMediaShareProps, handleMediaMgrReady );


  function setupShareStream()
  {
    if ( htmlShareElement.captureStream )
    {
      return htmlShareElement.captureStream();
    }
    else
    {
      throw "Html Share Element: " + htmlShareElement.constructor.name + " does not support the captureStram API"
    }
  }
  /**
   * Called when media mgr setup is complete
   *
   * @param clientStream The clients stream -- Local stream
   */
  function handleMediaMgrReady( clientStream )
  {

    if ( fnReady )
    {
      fnReady();
    }

  }

  function handleChatRoomClosed( strChatRoomId, strClosedById )
  {
    removeAllAudioStreams();

    if ( rtcMediaShareProps.fnOnChatRoomClose )
    {
      rtcMediaShareProps.fnOnChatRoomClose( strClosedById );
    }

  }


  /**
   * Adds and audio tag to the dom
   *
   * @param strStreamOwnerId The id of the owner (pserson sharing the stream)
   * @param stream The stream source
   */
  function addShareStream( strStreamOwnerId, stream )
  {

    switch( rtcMediaShareProps.shareType )
    {
      case "audio":

       setupAudioShare( strStreamOwnerId, stream );
       break;


    } // end switch()


  } // end addShareStream()

  /**
   * Instals an audio element in the dome
   *
   * @param strStreamOwnerId
   * @param stream
   */
  function setupAudioShare( strStreamOwnerId, stream )
  {
    const strAudioId = "audioShare_" + strStreamOwnerId;

    $("#" + strAudioId ).remove();
    $("body").append( $("<audio>").attr( "id", strAudioId).attr( "autoplay", true).addClass( "VwWebRtcAudio") );

    const audio = $("#" + strAudioId )[0];
    audio.srcObject = stream;

  } // end setupAudioShare()


  /**
   * Instals an audio element in the dome
   *
   * @param strStreamOwnerId
   * @param stream
   */
  function setupVideoShare( strStreamOwnerId, stream )
  {
    const strVideoId = "videoShare_" + strStreamOwnerId;

    $("#" + strVideoId ).remove();
    $("body").append( $("<video>").attr( "id", strVideoId).addClass( "VwWebRtcVideo") );

    const video = $("#" + strVideId )[0];
    video.srcObject = stream;

  } // end setupAudioShare()

  /**
   * Mutes this audio stream
   * @param fMute true to mute, false to unmute
   */
  function mute( fMute )
  {
    m_loacalShareStream.getAudioTracks()[0].enabled = !fMute ;
  }
  
  /**
   * Mutes/unmutes the audio stream
   *
   * @param strAudioUserId The audio user id
   * @param fMute true to mute, false to unmute
   */
  function handleOnMuteAudio( strAudioUserId, fMute )
  {
    mute( fMute );

    if ( rtcMediaShareProps.fnOnMuteAudio )
    {
      rtcMediaShareProps.fnOnMuteAudio( strAudioUserId, fMute );
    }
  }

  /**
   * Removes an audio stream from the dom
   *
   * @param strUserId The id of the user to remove the stream
   */
  function removeAudioStream( strUserId )
  {
    const strAudioId = "audio_" + strUserId;

    $("#" + strAudioId ).remove();

  }

  /**
   * Removes all audio streams from the DOM
   */
  function removeAllAudioStreams()
  {
    $(".VwWebRtcAudio" ).remove();
  }


  function muteAttendeeAudio( strToMuteId, fAction )
  {
    m_webRtcPeerMgr.muteAttendeeAudio( m_strAudioUserId, strToMuteId, fAction );
  }



  function sendMicMuteStatusToPresenter( strPresenterId, fMuted )
  {
    m_webRtcPeerMgr.sendMicMuteStatus( strPresenterId, fMuted );

  }
} // end VwWebRtcAudio{}

VwWebRtcMediaShare.prototype = new VwWebRtcChatRoomMgr();

export default VwWebRtcMediaShare;
