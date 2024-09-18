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

import VwWebRtcChatRoomMgr from "../VwWebRtcChatRoomMgr.js";

VwCssImport( "/vozzworks/webRtc/VwWebRtcCanvas/style")

/**
 * Creates a Data chat room
 *
 * @param strWebSockUrl The websocket url
 * @param rtcCanvasProps The whitboard (cancvas)  config props (Required)
 * @param dataChannelProps The data channel config props (Optional)
 * @constructor
 */
function VwWebRtcCanvas( rtcCanvasProps, dataChannelProps, fnReady )
{

  const self = this;
  const VIDEO_CANVAS_PREFIX = "videoCanvasPlayer_";

  let m_strCanvasUserId = rtcCanvasProps.strUserId;
  let m_clientCanvasStream;

  rtcCanvasProps.strCanvasId = "canvas";
  rtcCanvasProps.streamType = "canvasShare";
  rtcCanvasProps.strTopic = "webRtcCanvas";


  rtcCanvasProps.fnOnAddPeerStream = ( strStreamStyle, stream, strAudioStreamId,) => addCanvasStream(strAudioStreamId, stream, false);
  rtcCanvasProps.fnOnAddLocalStream = (strAudioStreamId, stream) => addCanvasStream(strAudioStreamId, stream, true);
  rtcCanvasProps.fnOnPeerClose = removeCanvasStream;
  rtcCanvasProps.fnOnLeave = removeAllCanvasStreams;
  rtcCanvasProps.fnOnChatRoomClosed = handleChatRoomClosed;

  VwWebRtcChatRoomMgr.call( self, rtcCanvasProps, dataChannelProps, handleMediaMgrReady );

  /**
   * Called when media mgr setup is complete
   *
   * @param clientStream The clients stream -- Local stream
   */
  function handleMediaMgrReady( clientStream )
  {
    m_clientCanvasStream = clientStream;

    if ( fnReady )
    {
      fnReady();
    }

  }

  function handleChatRoomClosed( strChatRoomId, strClosedById )
  {
    removeAllCanvasStreams();

    if ( rtcCanvasProps.fnOnChatRoomClose )
    {
      rtcCanvasProps.fnOnChatRoomClose( strClosedById );
    }

  }


  /**
   * Adds a vido element to play the cancas stream
   *
   * @param strCanvasStreamId The id of the new audio tag
   * @param stream The stream source
   */
  function addCanvasStream( strCanvasStreamId, stream, fTurnOffVolume )
  {
    const strVideoCanvasPlayerId = VIDEO_CANVAS_PREFIX + strCanvasStreamId;

    $("#" + strVideoCanvasPlayerId ).remove();

    const videoCanvasPlayer = $("<video>").attr( "id", strVideoCanvasPlayerId ).attr( "autoplay", true ).addClass( "VwWebRtcVideoCanvasPlayer")[0];
    $( videoCanvasPlayer) .addClass( rtcCanvasProps.cssVideoCanvasPlayer ).attr( "width", $("#" + rtcCanvasProps.canvasId ).width() ).attr( "height", $("#" + rtcCanvasProps.canvasId ).height() );

    const canvOffset = $("#" + rtcCanvasProps.canvasId ).offset();

    $( videoCanvasPlayer ).offset( canvOffset );
 
    videoCanvasPlayer.srcObject = stream;

    $("body").append( videoCanvasPlayer );

  }


  /**
   * Removes an audio stream from the dom
   *
   * @param strUserId The id of the user to remove the stream
   */
  function removeCanvasStream( strUserId )
  {
    const strVideoCanvasPlayerId = VIDEO_CANVAS_PREFIX + strUserId;

    $("#" + strVideoCanvasPlayerId ).remove();

  }

  /**
   * Removes all audio streams from the DOM
   */
  function removeAllCanvasStreams()
  {
    $(".VwWebRtcVideoCanvasPlayer" ).remove();
  }


} // end VwWebRtcWhiteBoard{}

VwWebRtcCanvas.prototype = new VwWebRtcChatRoomMgr();

export default VwWebRtcCanvas;
