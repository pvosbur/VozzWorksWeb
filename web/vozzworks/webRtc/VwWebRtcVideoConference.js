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

import VwWebRtcChatRoomMgr from "/vozzworks/webRtc/VwWebRtcChatRoomMgr.js";

/**
 * Creates A video conference . This creates a many to many view. Everybody sees everybody on the conference video camera
 *
 * @param The video conference configuration props (required)
 * @param dataChannelProps If text and file sharing need the configurations (Optional)
 *
 * @constructor
 */
function VwWebRtcVideoConference(  conferenceProps, dataChannelProps )
{
  const self = this;
  let   m_webRtcPeerMgrVideoShare;
  let   m_peerConfigProps;
  let   m_strVidConfUserId;
  let   m_strVidConfId;
  let   m_videoShareMediaConstraints;
  
  configObject();

  /**
   * Config configObject for WEbRtcPeer
   */
  function configObject()
  {
    m_peerConfigProps = {};

    $.extend( m_peerConfigProps, conferenceProps );
    m_peerConfigProps.chatRoomType = "webRtcVideoconference";
    m_peerConfigProps.fnOnAttendeeChange = handleOnAttendeeChange;
    m_peerConfigProps.fnOnClose = handlePeerConnClosed;

    m_strVidConfId = conferenceProps.strChatRoomId;

    m_videoShareMediaConstraints = {audio:true, video:true };

    VwWebRtcChatRoomMgr.call( self, m_peerConfigProps, dataChannelProps );

  } // end configObject()



  /**
   * Callback when peers enter or leave a  chat room
   * @param strUserId
   * @param strAction
   */
  function handleOnAttendeeChange( attendee, strStatus )
  {

    if ( conferenceProps.onAttendeeChange )
    {
      conferenceProps.onAttendeeChange( attendee, strStatus );
    }

  }

  /**
   * Handles the add stream from peer
   *
   * @param strStreamType The stream type
   * @param stream The peers video stream
   * @param streamOwnerId The streams owner ud
   */
  function handleOnAddPeerStream( strStreamType, stream, streamOwnerId )
  {
    addVideoFeed( streamOwnerId, stream, false );

  }

  /**
   * Callback when the chat room has been closed
   */
  function handlePeerConnClosed( strIdClosing )
  {
    $("#" + conferenceProps.strVideoContainerId ).empty();

    if ( conferenceProps.onClose )
    {
      conferenceProps.onClose( strIdClosing );
    }

  }

  /**
   * Closes the video conference
   *
   * @param strWebinarName
   */
  function closeVideoConference()
  {
    m_webRtcPeerMgrVideoShare.send( {
                            "type"         : "admin",
                            "adminAction"  : "removeChatRoom",
                            "chatRoomId"   : conferenceProps.type + "_" + m_strVidConfId,
                            "userIdClosing": m_strVidConfUserId
                          });

  }

  /**
   * Leave the video conference
   */
  function leaveVideoConference()
  {
    removeVideoFeed( m_strVidConfUserId );
    
    m_webRtcPeerMgrVideoShare.send( {
                            "type"         : "leave",
                             "userId": m_strVidConfUserId
                          });

  }


} // end VwWebRtcVideoConference{}

VwWebRtcVideoConference.prototype = new VwWebRtcChatRoomMgr();

export default VwWebRtcVideoConference;