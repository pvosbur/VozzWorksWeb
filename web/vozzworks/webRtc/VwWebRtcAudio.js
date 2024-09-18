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

import VwWebRtcChatRoomMgr  from "/vozzworks/webRtc/VwWebRtcChatRoomMgr.js";
import VwPromiseMgr         from "/vozzworks/util/VwPromiseMgr/VwPromiseMgr.js";

/**
 * Creates a Data chat room
 *
 * @param strWebSockUrl The websocket url
 * @param rtcAudioProps The audo chat room config props (Required)
 * @param dataChannelProps The data channel config props (Optional)
 * @constructor
 */
function VwWebRtcAudio( rtcAudioProps, dataChannelProps )
{
  const self = this;

  let   m_strAudioUserId = rtcAudioProps.strUserId;
  let   m_clientAudioStream;

  this.mute = mute;
  this.muteAttendeeAudio = muteAttendeeAudio;
  this.sendMicMuteStatusToPresenter = sendMicMuteStatusToPresenter;

  rtcAudioProps.strAudioId = "audio";
  rtcAudioProps.streamType = "audio";
  rtcAudioProps.chatRoomType = "webRtcAudio";

  rtcAudioProps.mediaContstraints = {audio:true};

  rtcAudioProps.fnOnAddPeerStream = ( peerAttendee, stream ) => addAudioStream(peerAttendee, stream, false);
  rtcAudioProps.fnOnAddLocalStream = (strAudioStreamId, stream) => addAudioStream(strAudioStreamId, stream, true);
  rtcAudioProps.fnOnPeerClose = removeAudioStream;
  rtcAudioProps.fnOnLeave = removeAllAudioStreams;
  rtcAudioProps.fnOnChatRoomClosed = handleChatRoomClosed;
  rtcAudioProps.fnOnMuteAudio = handleOnMuteAudio;

  configObject();

  function configObject()
  {
    // remove any audio tags

    $(".VwWebRtcAudio").remove();

    VwWebRtcChatRoomMgr.call( self, rtcAudioProps, rtcAudioProps, handleGetStream );
  }

  /**
   * Callback from VwWebRtcChatRoomMgr when a create,join or createOrJoin method is called by the client
   * @return {Promise<void>}
   */
  async function handleGetStream()
  {
    // Setup local audio tag
    const strLocalAudioId = `audio_${rtcAudioProps.strUserId}`;

    $(`#${strLocalAudioId }`).remove();

    rtcAudioProps.stream = await navigator.mediaDevices.getUserMedia( {audio:true});
    m_clientAudioStream = rtcAudioProps.stream;

    $("body").append( `<audio id="${strLocalAudioId}" class="VwWebRtcAudio" autoplay></audio>`)
    $(`#${strLocalAudioId }`)[0].srcObject = rtcAudioProps.stream;
    $(`#${strLocalAudioId }`)[0].volume = 0;

  } // end handleGetStream()


  function handleChatRoomClosed( attendeeClosing )
  {
    removeAllAudioStreams();

    if ( rtcAudioProps.fnOnChatRoomClose )
    {
      rtcAudioProps.fnOnChatRoomClose( attendeeClosing );
    }

  }


  /**
   * Adds and audio tag to the dom
   *
   * @param strAudioStreamId The id of the new audio tag
   * @param stream The stream source
   */
  function addAudioStream( peerAttendee, stream, fTurnOffVolume )
  {
    const strAudioId = `audio_${peerAttendee.userIdCk}`;

    $(`#${strAudioId}` ).remove();
    $("body").append( `<audio id="${strAudioId}" class="VwWebRtcAudio" autoplay></audio>`)

    const audio = $(`#${strAudioId}` )[0];
    audio.srcObject = stream;

    if ( fTurnOffVolume )
    {
      $(`#${strAudioId}` )[0].volume = 0;
    }
  }

  /**
   * Mutes this audio stream
   * @param fMute true to mute, false to unmute
   */
  function mute( fMute )
  {
    m_clientAudioStream.getTracks()[0].enabled = !fMute ;
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

  }

  /**
   * Removes an audio stream from the dom
   *
   * @param strUserId The id of the user to remove the stream
   */
  function removeAudioStream( strUserId )
  {
    const strAudioId = "audio_" + strUserId;

    $(`#${strAudioId}` ).remove();

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
    self.getPeerMgr().muteAttendeeAudio( m_strAudioUserId, strToMuteId, fAction );
  }



  function sendMicMuteStatusToPresenter( strPresenterId, fMuted )
  {
    self.getPeerMgr().sendMicMuteStatus( strPresenterId, fMuted );

  }

} // end VwWebRtcAudio{}

VwWebRtcAudio.prototype = new VwWebRtcChatRoomMgr();

export default VwWebRtcAudio;
