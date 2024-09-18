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
 * Creates A Data Only Chat Room
 *
 * @param chatRoomProps The data chat properties
 *
 * @constructor
 */
function VwWebRtcDataChat( chatRoomProps )
{
  const self = this;

  const m_dataChannelProps = {};

  this.sendTextMsg = sendTextMsg;
  this.sendImage = sendImage;
  this.sendFile = sendFile;

  configObject();

  function configObject()
  {
    chatRoomProps.streamType = "custom";
    chatRoomProps.chatRoomType = "webRtcDataChat";

    m_dataChannelProps.onTextMessage = chatRoomProps.onTextMessage;
    m_dataChannelProps.onImageMessage = chatRoomProps.onImageMessage;
    m_dataChannelProps.onFileBlobMessage = chatRoomProps.onFileBlobMessage;

    VwWebRtcChatRoomMgr.call( self, chatRoomProps, m_dataChannelProps );

  } // end configObject()
  


  /**
   * Sends a text message in the data channel to all users in the chatroom unless the userid is specified, in which
   * only the userid spcified gets the message
   *
   * @param strTextMsg The text message to send
   * @param strUserId If specifed only send message to this user id
   */
  function sendTextMsg( strTextMsg, strUserId )
  {
    m_dataChannelProps.dataChannelMgr.sendTextMsg( strTextMsg, strUserId );
  }

  /**
   * Sends an image file in the data channel
   *
   * @param fileImage The image file to send or null to have the file chooser dialog invoked
   */
  function sendImage( fileImage )
  {
    m_dataChannelProps.dataChannelMgr.sendImage( fileImage );
  }

  /**
   * Sends a file in the data channel
   * @param fileToSend  The file to send or null to have the file chooser dialog invoked
   */
  function sendFile( fileToSend )
  {
    m_dataChannelProps.dataChannelMgr.sendFile( fileToSend );
  }



} // end VwWebRtcDataChat{}

VwWebRtcDataChat.prototype = new VwWebRtcChatRoomMgr();

export default VwWebRtcDataChat;
