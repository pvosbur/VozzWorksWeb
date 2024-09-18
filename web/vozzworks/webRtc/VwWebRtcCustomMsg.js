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
 * @param rtcCustomMsgProps Custom charoom msg props
 * @param fnReady Function:Optiona; callback when complete
 * @constructor
 */
function VwWebRtcCustomMsg( rtcCustomMsgProps, fnReady )
{

  const self = this;

  rtcCustomMsgProps.streamType = "custom";
  rtcCustomMsgProps.chatRoomType = "webRtcCustom";

  rtcCustomMsgProps.fnOnChatRoomClosed = handleChatRoomClosed;
  rtcCustomMsgProps.fnOnActionRequestStatus = fnReady;

  VwWebRtcChatRoomMgr.call( self, rtcCustomMsgProps, null, handleMediaMgrReady );

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
    if ( rtcCustomMsgProps.fnOnChatRoomClose )
    {
      rtcCustomMsgProps.fnOnChatRoomClose( strClosedById );
    }

  }


} // end VwWebRtcWhiteBoard{}

VwWebRtcCustomMsg.prototype = new VwWebRtcChatRoomMgr();

export default VwWebRtcCustomMsg;

