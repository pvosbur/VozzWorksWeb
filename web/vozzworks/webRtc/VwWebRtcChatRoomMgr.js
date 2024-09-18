/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   1/7/19

 Time Generated:   6:35 AM

 ============================================================================================
 */

import VwWebRtcPeerMgr from "./VwWebRtcPeerMgr.js";
import VwUserMediaMgr from "/vozzworks/webRtc/VwUserMediaMgr.js";

/**
 * This class is the super class for WebRtc peer sharing of audio, video and canvas resources.
 *
 * @param rtcMediaProps
 * @param dataChannelProps
 * @constructor
 */
function VwWebRtcChatRoomMgr( rtcMediaProps, dataChannelProps, fnGetStream )
{
  if ( arguments.length == 0 )
  {
    return; // Subclass prototype call
  }

  let m_peerConfigProps;
  let m_webRtcPeerMgr;
  this.getPeerMgr = getPeerMgr;
  this.listAttendees = listAttendees;
  this.create = create;
  this.join = join;
  this.createOrJoin = createOrJoin;
  this.close = closeChatRoom;
  this.leave = leave;
  this.sendCustomMsg = sendCustomMsg;
  this.exists = VwWebRtcChatRoomMgr.exists( rtcMediaProps.strChatRoomId );

  configObject();

  /**
   * Setup config and ice servers
   */
  async function configObject()
  {
    m_peerConfigProps = {};
    m_peerConfigProps.fnOnAttendeeChange = handleAttendeeChange;
    m_peerConfigProps.fnOnClose = handlePeerConnClosed;

    $.extend( m_peerConfigProps, rtcMediaProps );

  } // end configObject()


  /**
   * Creates a peer connection
   *
   * @param stream The webrtc stream can be audio,video or custom
   */
  function createPeer( stream )
  {
    m_peerConfigProps.stream = stream;
    m_webRtcPeerMgr = new VwWebRtcPeerMgr( m_peerConfigProps, dataChannelProps );

  } // end createPeer()


  /**
   * Creates a chat room
   *
   * @param  strBroadcastTopic an optional broadcast topic. If specified chatroom open and close broadcasts will be sent
   */
  async function create( strBroadcastTopic )
  {
    return await setupConference( "create", strBroadcastTopic );
  } // end create()

  /**
   * Join an existing chat room
   *
   * @param strUserId The attendee user id
   */
  async function join()
  {
    return await setupConference( "join");
  } // end join()

  /**
   * Creates the conference if it doesn't exists, else joins the conference
   *
   * @param  strBroadcastTopic an optional broadcast topic. If specified chatroom open and close broadcasts will be sent
   */
  async function createOrJoin(strBroadcastTopic)
  {
    return await setupConference( "dynamic", strBroadcastTopic );

  } // end createOrJoin()


  /**
   * Sends a custom message to be sent to all useres in the chat room
   * @param msg
   */
  function sendCustomMsg( msg )
  {
    const custMsg = {};

    if ( msg.fromUserId )
    {
      custMsg.fromUserId = msg.fromUserId ;
    }
    else
    {
      custMsg.fromUserId = rtcMediaProps.strUserId;
    }

    custMsg.type = "customMsg";
    custMsg.msg = msg;

    m_webRtcPeerMgr.send( custMsg );

  } // end sendCustomMsg()

  /**
   * Setup the conference
   *
   * @param fnReady
   * @param fnFail
   */

  /**
   * Setup the conference
   *
   * @param strAction
   * @param fnSuccess
   * @param fnFail
   */
  async function setupConference( strAction, strBroadcastTopic )
  {
    if ( fnGetStream )
    {
      await fnGetStream();

    }

    createPeer( rtcMediaProps.stream );

    await setupChatRoom( strAction, strBroadcastTopic );

  } // end setupConference()


  /**
   * Setup chatroom
   * @param strAction
   * @return {Promise<*>}
   */
  async function setupChatRoom( strAction, strBroadcastTopic )
  {
    let strServiceName = `accessChatRoom?accessAction=${strAction}&cid=${rtcMediaProps.strChatRoomId}&ctype=${rtcMediaProps.chatRoomType}`;

    if ( strBroadcastTopic )
    {
      strServiceName += `&bt=${strBroadcastTopic}`;

    }
    return await getService( strServiceName );

  } // end setupChatRoom()


  /**
   * Returns the web rtc peer mgr
   * @returns {*}
   */
  function getPeerMgr()
  {
    return m_webRtcPeerMgr;

  } // end getPeerMbr()

  /**
   * Gets a list of the Attendee (AiChatRoomMember) objects
   * @param fnResult The callback that will be passed an array of user ids
   */
  async function listAttendees()
  {
    const strUrl = "listAttendees?cid=" + rtcMediaProps.strChatRoomId;
    return await getService( strUrl );

  } // end listAttendees()


  /**
   * Closes the the audio conference
   *
   * @param strWebinarName
   */
  async function closeChatRoom()
  {
 
    const strUrl = "closeChatRoom?cid=" + rtcMediaProps.strChatRoomId;
    await getService( strUrl );
    
  } // end closeChatRoom()


  /**
   * Test for the existence of a chat room
   * @param strRoomId The chat room id to test
   * @return {Promise<void>}
   */
  async function handleExistsChatRoom()
  {
    const strUrl = "existsChatRoom?cid=" + rtcMediaProps.strChatRoomId;
    return await getService( strUrl );

  } // end  handleExistsChatRoom()


  /**
   *  Leave audio conference
   */
  function leave()
  {
    if ( rtcMediaProps.fnOnLeave )
    {
      rtcMediaProps.fnOnLeave();
    }

    if ( m_webRtcPeerMgr )
    {
      m_webRtcPeerMgr.leave();
    }

    if ( dataChannelProps && dataChannelProps.dataChannelMgr )
    {
      dataChannelProps.dataChannelMgr.close( rtcMediaProps.strUserId ) ;
    }

  } // end leave()

  /**
   * Callback when a user joins or leaves the chat room
   *
   * @param strUserId The user id
   * @param strAction one of "joining" or "leaving"
   */
  function handleAttendeeChange( member, strAction )
  {
    if ( rtcMediaProps.fnOnAttendeeChange )
    {
      rtcMediaProps.fnOnAttendeeChange( member, strAction );
    }

  } // end handleAttendeeChange()

  /**
   * The Audio conference has benn closed
   * @param strUserIdClosing The user that closed the conference
   */
  function handlePeerConnClosed( strUserIdClosing )
  {
    if ( dataChannelProps && dataChannelProps.dataChannelMgr )
    {
      dataChannelProps.dataChannelMgr.close() ;
    }

    if ( rtcMediaProps.fnOnPeerClose )
    {
      rtcMediaProps.fnOnPeerClose( strUserIdClosing );
    }

  } // end handlePeerConnClosed()


} // end VwWebRtcChatRoomMgr{}

/**
 * static exists returns if a chatroom exists
 *
 * @param strChatRoomId The chatroom id to test
 * @return {Promise<*>}
 */
VwWebRtcChatRoomMgr.exists = async (strChatRoomId ) =>
{
  const strUrl = `existsChatRoom?cid=${strChatRoomId}`;
  return await getService( strUrl );

} // end VwWebRtcChatRoomMgr.exists()

export default VwWebRtcChatRoomMgr;