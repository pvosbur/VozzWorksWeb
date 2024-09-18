package com.vozzware.http.webRtc;

/*
============================================================================================

    Source File Name: Transaction.java

    Author:           petervosburgh
    
    Date Generated:   7/14/17

    Time Generated:   7:06 AM

============================================================================================
*/

import com.vozzware.http.VwWebSocket;
import com.vozzware.http.webRtc.dvo.VwWebRtcPeer;
import com.vozzware.spring.utils.VwSpringUtils;
import com.vozzware.util.VwExString;
import com.vozzware.util.VwJsonUtils;
import com.vozzware.util.VwLogger;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This class handles the WebRtc messgaes for setup and takedown of a WebRtc peer user
 */
public class VwWebRtcSignalingServer
{
  private Map<String, VwWebRtcPeer> m_mapWebRtcPeers = Collections.synchronizedMap( new HashMap<>() );
  private VwLogger m_logger;
  private String m_strChatRoomId;
  private String m_strCreatorId;
  private String m_strPresenterId;

  private VwWebSocket m_connCreator;
  private VwWebRtcPeer m_peerCreator;
  private VwWebRtcPeer m_peerPresenter;

  public enum ChatRoomStyle  {Webinar,Many2Many,One2Many,Custom};

  private ChatRoomStyle  m_eChatRoomStyle;

  /**
   * Construcotr for a WebRtc Chat room Instance
   *
   * @param creatorConnection The creators web socket connection
   * @param strChatRoomId The Chat room Id
   * @param strCreatorId  The creator Id
    */
  public VwWebRtcSignalingServer( VwWebSocket creatorConnection, String strChatRoomId, String strCreatorId, ChatRoomStyle eChatRoomStyle )  throws Exception
  {
    m_connCreator = creatorConnection ;
    m_peerCreator = new VwWebRtcPeer( strCreatorId, creatorConnection );
    m_mapWebRtcPeers.put( strCreatorId, m_peerCreator );

    m_peerPresenter = m_peerCreator;


    m_strChatRoomId = strChatRoomId;
    m_strCreatorId = strCreatorId;
    m_strPresenterId = strCreatorId; // Creator is initial presenter
    m_eChatRoomStyle = eChatRoomStyle;

    m_logger = (VwLogger) VwSpringUtils.getInstance().getBean( "loggerWebRtc" );

    logDebug( "Creating Chat Room: " + m_strChatRoomId + " By User: " + m_strCreatorId );
  }


  /**
   * Adds a user to the chat room
   *
   * @param strUserId  The user id to add
   * @param wsConnection The web socket connection of the user being added
   * @throws Exception
   */
  public void addUser( String strUserId, VwWebSocket wsConnection )  throws Exception
  {
    if ( m_mapWebRtcPeers.containsKey( strUserId ) )
    {
      logError( "User: " + strUserId + " alreay exists" );

      throw new Exception( "User: " + strUserId + " alreay exists" );
    }

    logDebug( "Adding user: " + strUserId );

    VwWebRtcPeer peer = new VwWebRtcPeer( strUserId, wsConnection );

    // Temporarily put in cache pending loginRespose acceptence
    m_mapWebRtcPeers.put( strUserId, peer );

    switch( m_eChatRoomStyle  )
    {
      case  Webinar:

        joinWebinarRequest( peer );
        break;

      case Many2Many:

        sendOffersToPeers( peer );
        break;

      case One2Many:

        sendOfferToCreator( peer );
        break;


    }

    sendAttendeeChange( strUserId, "joining");

  } // end addUser()


  /**
   * Returns the number of members in the chat room
   * @return
   */
  public int size()
  {
    return m_mapWebRtcPeers.size();

  }


  public void setPresenterId( String strPresenterId )
  {
    m_strPresenterId = strPresenterId ;
  }

  public String getPresenterId()
  {
    return m_strPresenterId;

  }
  /**
   * Return the chat room id
   * @return
   */
  public String getChatRoomId()
  {
    return m_strChatRoomId;
  }


  /**
   * Return the chat room creator id
   * @return
   */
  public String getCreatorId()
  {
    return m_strCreatorId;
  }


  /**
   * Message handleing processor
   *
   * @param connection The web socket connection
   * @param mapMsg Map with message fiel
   *               ds
   */
  public void onMessage( VwWebSocket connection, Map<String,Object>mapMsg )  throws Exception
  {

    String strMsgType = mapMsg.get( "type").toString();

    switch( strMsgType )
    {

      case "login":

           addUser( mapMsg.get( "userId").toString(), connection );
           break;

      case "loginResponse":

           handleLoginResponse( connection, mapMsg );
           break;

      case "customMsg":

          handleSendCustom( mapMsg );
          break;

      case "changePresenterRequest":

           handleChangePresenterRequest( mapMsg );
           break;

      case "changePresenterResponse":

           handleChangePresenterResponse( mapMsg );
           break;

      case "presenterChange":

           handlePresenterChange( mapMsg );
           break;


      case "leave":

           removeUser( mapMsg.get( "userId").toString(), true );
           break;

      case "close":

           closeChatRoom( mapMsg.get( "userId").toString() );
           break;

      case "closeWebinar":

           closeWebinar( mapMsg.get( "userId").toString() );
           break;

      case "offer":

           handleOffer( mapMsg );
           break;

      case "answer":

           handleAnswer( mapMsg );
           break;

      case "candidate":

           handleCandidate( mapMsg );
           break;

      case "list":

           handleListUsers( mapMsg );
           break;

      case "muteAttendeeAudio":

           handleMuteAudio( mapMsg );
           break;

      case "muteStatus":

           handleMuteStatus( mapMsg );
           break;



    } // end switch()

  }

  /**
   * Foewars custom msg to all members in the chat room
   * @param mapMsg The message to send to all chat room members
   * @throws Exception
   */
  private void handleSendCustom( Map<String, Object> mapMsg ) throws Exception
  {
    // This is first user, nothing to do
    if ( m_mapWebRtcPeers.size() == 0 )
    {
      return;
    }

    VwWebRtcPeer peerSending = m_mapWebRtcPeers.get( mapMsg.get( "fromUserId") );

    for ( VwWebRtcPeer peer : m_mapWebRtcPeers.values() )
    {
      String strPeerOfferToUserId = peer.getUserId();

      if ( strPeerOfferToUserId.equals( peerSending.getUserId() ) )
      {
        continue;
      }

     sendMsg( peer, mapMsg );

    } // end for()

  } // end handleSendCustom()


  /**
   *
   * @param peerAttendee
   * @throws Exception
   */
  private void joinWebinarRequest( VwWebRtcPeer peerAttendee ) throws Exception
  {
    logDebug( "Sending 'joinWebinarRequest' to Webinar Creator: " + m_peerCreator.getUserId() + " From: " +  peerAttendee.getUserId() );
    Map<String,Object>mapMsg = createMap( "joinWebinar", peerAttendee.getUserId(), m_strPresenterId, m_strCreatorId );
    sendMsg( m_peerCreator, mapMsg );

    // Also send presenter change to the new attendee
    mapMsg.put( "type", "presenterChange");
    mapMsg.put( "newPresenterId", m_strPresenterId );

    sendMsg( peerAttendee, mapMsg );


  }

  /**
   * Informs chatroom creator to send an offer to this peer
   *
   * @param peerAttendee The attendee in the chat room to make an offer to
   * @throws Exception
   */
  private void sendOfferToCreator( VwWebRtcPeer peerAttendee ) throws Exception
  {
    sendCreateOffer( peerAttendee.getUserId(), m_peerCreator );
  }

  /**
   * Sends attendee chae to all users in chat room wen someone enters or leaves
   * @param strAttendeeId
   * @param strStatus
   * @throws Exception
   */
  private void sendAttendeeChange( String strAttendeeId, String strStatus ) throws Exception
  {
    // This is first user, nothing to do
    if ( m_mapWebRtcPeers.size() == 0 )
    {
      return;
    }

    Map<String,Object>mapMsg = new HashMap<>( );

    mapMsg.put( "type", "attendeeChange");
    mapMsg.put( "status", strStatus );

    for ( VwWebRtcPeer peer : m_mapWebRtcPeers.values() )
    {

      String strUserId = peer.getUserId();

      if ( strUserId.equals( strAttendeeId ) )
      {
        continue;
      }

      mapMsg.put( "attendeeUserId", strAttendeeId );
      sendMsg( peer, mapMsg );

    }


  }
  /**
   * Creates a message map to be serialized to JSON for all message passing
   *
   * @param strMsgType The message type
   * @param strFromUserId The sender
   * @param strToUserId  The recepient
   * @return
   */
  private Map<String,Object> createMap( String strMsgType, String strFromUserId, String strToUserId, String strCreatorId )
  {
    Map<String,Object>mapMsg = new HashMap<>(  );
    mapMsg.put( "type", strMsgType );
    mapMsg.put( "fromUserId", strFromUserId );
    mapMsg.put( "toUserId", strToUserId );
    mapMsg.put( "creatorId", m_strCreatorId );

    return mapMsg;

  }


  /**
   * Sends create offer messges to the peer just added for each exists member of the chat group
   *
   * @param peerAdded The peer being added to the chat room
   * @throws Exception
   */
  private synchronized void sendOffersToPeers( VwWebRtcPeer peerAdded )  throws Exception
  {
    // This is first user, nothing to do
    if ( m_mapWebRtcPeers.size() == 0 )
    {
      return;
    }

    for ( VwWebRtcPeer peer : m_mapWebRtcPeers.values() )
    {

      String strPeerOfferToUserId = peer.getUserId();

      if ( strPeerOfferToUserId.equals( peerAdded.getUserId() ) )
      {
        continue;
      }

      sendCreateOffer( peer.getUserId(), peerAdded );

    }

  } // end sendOffsersToPeers()


  private void sendCreateOffer( String strPeerOfferToUserId, VwWebRtcPeer peerFrom ) throws Exception
  {
    Map<String,Object>mapMsg = new HashMap<>(  );
    mapMsg.put( "type", "createOffer" );

    logDebug( "Sending 'createOffer' to: "  + strPeerOfferToUserId + " from: " + peerFrom.getUserId() );

    mapMsg.put( "toUserId", strPeerOfferToUserId );
    sendMsg( peerFrom, mapMsg );

  }

  /**
   * Removes a User from the chat room
   *
   * @param strUserId The user to remove
   * @throws Exception
   */
  public void removeUser( String strUserId, boolean fNotifyUsers ) throws Exception
  {
    if ( !m_mapWebRtcPeers.containsKey( strUserId ) )
    {
      return;
    }

    VwWebRtcPeer peerLeving = m_mapWebRtcPeers.get( strUserId );

    logDebug( "Removing User: " + strUserId );

    if ( strUserId.equals( m_strCreatorId ))
    {
      m_strCreatorId = null;
    }

    m_mapWebRtcPeers.remove( strUserId );

    if ( !fNotifyUsers )
    {
      return;

    }

    if ( m_mapWebRtcPeers.size() == 0 )
    {
      closeChatRoom( null );
    }
    sendRemoveMbrToPeers( strUserId );

    sendAttendeeChange( strUserId, "leaving" );

    Map<String,Object>mapMsg = new HashMap<>(  );
    mapMsg.put( "type", "leaveComplete" );

    logDebug( "Sending 'leavComplete' to: "  + strUserId );

    mapMsg.put( "toUserId", strUserId );

    sendMsg( peerLeving,  mapMsg);

  }

  private void closeChatRoom( String strUserIdClosing ) throws Exception
  {
    if ( m_mapWebRtcPeers.size() == 0 )
    {
       return;
    }

    sendCloseToPeers( "close", strUserIdClosing );

  }

  private void closeWebinar( String strUserIdClosing ) throws Exception
  {
    if ( m_mapWebRtcPeers.size() == 0 )
    {
        return;
    }

    sendCloseToPeers( "closeWebinar", strUserIdClosing );

   }

  /**
   * Sends leave msg to peers when someone leaves the chat room
   *
   * @param strUserIdLeaving The peer being removed from the chat room
   * @throws Exception
   */
  public void sendRemoveMbrToPeers( String strUserIdLeaving )  throws Exception
  {
    // This is first user, nothing to do
    if ( m_mapWebRtcPeers.size() == 0 )
    {
      return;
    }

    Map<String,Object>mapMsg = new HashMap<>(  );
    mapMsg.put( "type", "leave" );

    for ( VwWebRtcPeer peer : m_mapWebRtcPeers.values() )
    {
      // Don't send yp ourselvs
      if ( peer.getUserId().equals( strUserIdLeaving ) )
      {
        continue;

      }
      logDebug( "Sending 'leave' message to: " + peer.getUserId() + " From: " + strUserIdLeaving );
      mapMsg.put( "userId", strUserIdLeaving );
      sendMsg( peer, mapMsg );

    }
  }

  public void sendCloseToPeers( String strCloseType, String strUserIdClosing )  throws Exception
  {
    // This is first user, nothing to do
    if ( m_mapWebRtcPeers.size() == 0 )
    {
      return;
    }

    Map<String,Object>mapMsg = new HashMap<>(  );
    mapMsg.put( "type", strCloseType );
    mapMsg.put( "id", m_strChatRoomId );

    for ( VwWebRtcPeer peer : m_mapWebRtcPeers.values() )
    {
      if ( peer.getUserId().equals( strUserIdClosing ) )
      {
        continue;
      }
       
      logDebug( "Sending " + strCloseType + " message to: " + peer.getUserId() + " From: " + strUserIdClosing );
      mapMsg.put( "userId", strUserIdClosing );
      sendMsg( peer, mapMsg );

    }
  }

  /**
   * Handles a joinWebinar response
   *
   * @param connection
   * @param mapMsg
   * @throws Exception
   */
  private void handleLoginResponse( VwWebSocket connection, Map<String, Object> mapMsg ) throws Exception
  {
    if ( !mapMsg.get( "responseCode").toString().equals( "accepted" ))
    {
      String strUserId = mapMsg.get( "userId").toString();

      m_mapWebRtcPeers.remove( strUserId, strUserId );
    }
  }


  /**
   * Sends offer message to a peer user
   * @param mapMsg
   * @throws Exception
   */
  private void handleOffer( Map<String,Object>mapMsg ) throws Exception
  {
    //for ex. UserA wants to call UserB
    
    String strToUserId = mapMsg.get( "toUserId").toString();

    logDebug( "Sending Offer To: " + strToUserId + " From: " + mapMsg.get( "fromUserId").toString());

    VwWebRtcPeer peerTo = m_mapWebRtcPeers.get( strToUserId );

    if ( peerTo != null )
    {
      sendMsg( peerTo, mapMsg );;

    }

  }

  /**
   * Sends an answer message to the to candidate
   * @param mapMsg
   * @throws Exception
   */
  private void handleAnswer( Map<String,Object>mapMsg ) throws Exception
  {
    String strToUserId = mapMsg.get( "toUserId").toString();
    VwWebRtcPeer peerTo = m_mapWebRtcPeers.get( strToUserId );

    if ( peerTo == null )
    {
      return;
    }

    String strIdFrom = mapMsg.get( "fromUserId").toString();

    logDebug( "Sending Answer To: " + strToUserId + " From: " + strIdFrom );

    sendMsg( peerTo, mapMsg );
      
  }

  /**
   * Exchanges a peer candidate message
   * @param mapMsg
   * @throws Exception
   */
  private void handleCandidate( Map<String,Object>mapMsg ) throws Exception
  {
    String strToUserId = mapMsg.get( "toUserId").toString();
    VwWebRtcPeer peerTo = m_mapWebRtcPeers.get( strToUserId );

    if ( peerTo == null )
    {
      return;
    }

   // logDebug( "Sending candidate to: " + strToUserId );

    sendMsg( peerTo, mapMsg );;

  }

  /**
   * Lists the current user ids in the chat room
   */
  private void handleListUsers( Map<String,Object>mapMsg ) throws Exception
  {
    String strToUserId = mapMsg.get( "toUserId").toString();

    VwWebRtcPeer peerTo = m_mapWebRtcPeers.get( strToUserId );

    if ( peerTo == null )
    {
      return;
    }

    Map<String,Object>mapValues = new HashMap<>();

    List<String> listUserIds = new ArrayList<>();

    for( String strUserId : m_mapWebRtcPeers.keySet() )
    {
      // Dont list ourselvs

      if( strUserId.equals( strToUserId ))
      {
        continue;
      }

      listUserIds.add( strUserId );
    }

    logDebug( "Sending User List To: " + strToUserId );
    mapValues.put( "type", "userIdList" );
    mapValues.put( "userIdList", listUserIds );

    sendMsg( peerTo, mapValues );

  }

  /**
   * Sends message to the attendee that is to have their audio muted
   *
   * @param mapMsg
   * @throws Exception
   */
  private void handleMuteAudio( Map<String,Object>mapMsg ) throws Exception
  {
    String strToMuteId = mapMsg.get( "toMuteId").toString();
    VwWebRtcPeer peerTo = m_mapWebRtcPeers.get( strToMuteId );

    if ( peerTo == null )
    {
      return;

    }

    sendMsg( peerTo, mapMsg );

  }

  /**
   * Sends message to the attendee that is to have their audio muted
   *
   * @param mapMsg
   * @throws Exception
   */
  private void handleMuteStatus( Map<String,Object>mapMsg ) throws Exception
  {
    String strToUserId = mapMsg.get( "toUserId").toString();
    VwWebRtcPeer peerTo = m_mapWebRtcPeers.get( strToUserId );

    if ( peerTo == null )
    {
      return;

    }

    sendMsg( peerTo, mapMsg );

  }

  /**
   * Sends changePresenterRequest request to the toUserId
   */
  private void handleChangePresenterRequest( Map<String,Object>mapMsg ) throws Exception
  {
    String strToUserId = mapMsg.get( "toUserId").toString();

    VwWebRtcPeer peerTo = m_mapWebRtcPeers.get( strToUserId );

    if ( peerTo == null )
    {
      return;
    }

    logDebug( "Sending 'changePresenterRequest' To: " + strToUserId );
    
    Map<String,Object>mapValues = new HashMap<>();
    mapValues.put( "type", "changePresenterRequest" );
    mapValues.put( "fromUserId", mapMsg.get( "fromUserId") );

    sendMsg( peerTo, mapValues );


  }

  public void handleChangePresenterResponse( Map<String,Object>mapMsg ) throws Exception
  {
    String strRespCode = mapMsg.get( "respCode").toString();

    mapMsg.put( "type", "changePresenterResponse" );
    mapMsg.put( "toUserId", mapMsg.get( "curPresenterId").toString() );
    mapMsg.put( "fromUserId", mapMsg.get( "newPresenterId").toString() );

    VwWebRtcPeer peer = m_mapWebRtcPeers.get( mapMsg.get( "curPresenterId").toString() );
    sendMsg( peer, mapMsg );

    if ( strRespCode.equals( "accept") )
    {
      doChangePresenter( mapMsg );
    }
  }


  private void doChangePresenter( Map<String,Object>mapMsg ) throws Exception
  {
    String strCurPresenterId = mapMsg.get( "curPresenterId").toString();
    String strNewPresenterId = mapMsg.get( "newPresenterId").toString();

    // This is first user, nothing to do
    if ( m_mapWebRtcPeers.size() == 0 )
    {
      return;
    }

    mapMsg.clear();
    mapMsg.put( "type", "presenterChange" );
    mapMsg.put( "newPresenterId", strNewPresenterId );
    mapMsg.put( "prevPresenterId", strCurPresenterId );

    for ( VwWebRtcPeer peer : m_mapWebRtcPeers.values() )
    {
      if ( peer.getUserId().equals( strNewPresenterId ) )
      {
        continue;
      }

      logDebug( "Sending 'presenterChange' message to: " + peer.getUserId() );
      sendMsg( peer, mapMsg );

    }

    sendOffersToPeers( m_mapWebRtcPeers.get( strNewPresenterId ) );
  }

  /**
   * Send presenter change msg to the attendee identified by the toUserId
   *
   * @param mapMsg The data map
   * @throws Exception
   */
  private void handlePresenterChange( Map<String,Object>mapMsg ) throws Exception
  {
    String strToUserId = mapMsg.get( "toUserId").toString();

    VwWebRtcPeer peerTo = m_mapWebRtcPeers.get( strToUserId );

    if ( peerTo == null )
    {
      return;
    }

    sendMsg( peerTo, mapMsg );
  }


  private void handlePresenterChangeStatus( Map<String,Object>mapMsg ) throws Exception
  {
    String strToUserId = mapMsg.get( "toUserId").toString();

    m_strPresenterId = strToUserId;
    
    VwWebRtcPeer peerTo = m_mapWebRtcPeers.get( strToUserId );

    if ( peerTo == null )
    {
      return;
    }

    sendMsg( peerTo, mapMsg );

  }


  /**
   * Sends a web socket message to the peer
   *
   * @param peer The peer to send the message to
   * @param mapMsg The map of message parameters
   */
  private void sendMsg( VwWebRtcPeer peer, Map<String, Object> mapMsg ) throws Exception
  {

    String strMsgJSON = VwJsonUtils.toJson( mapMsg );

    strMsgJSON = VwExString.replace( strMsgJSON, "\\\\", "\\" );

    VwWebSocket peerConn = peer.getWsConnection();

    //todo PBV 1/05/19 needs revisiting --if ( !peerConn.forwardedMsg( peer, strMsgJSON ) )
    {
      peerConn.sendMessage( strMsgJSON );
    }


  }


  /**
   * Logs debug message and prefixes  the chat room id
   * @param strMsg
   */
  private void logDebug( String strMsg )
  {
    m_logger.debug( getClass(), "Chat Room Id:" + m_strChatRoomId + ", " + strMsg );

  }

  /**
   * Logs error message and prefixes  the chat room id
   * @param strMsg
   */
  private void logError( String strMsg)
  {
    m_logger.error( getClass(), "Chat Room Id:" + m_strChatRoomId + ", " + strMsg );

  }

  /**
   * Logs error message and prefixes  the chat room id
   * @param strMsg
   */
  private void logError( String strMsg, Exception ex )
  {
    m_logger.error( getClass(), "Chat Room Id:" + m_strChatRoomId + ", " + strMsg, ex );

  }

  /**
   * Logs info message and prefixes  the chat room id
   * @param strMsg
   */
  private void logInfo( String strMsg )
  {
    m_logger.info( getClass(), "Chat Room Id:" + m_strChatRoomId + ", " + strMsg );

  }

} // end class VwWebRtcSignalingServer{}
