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

import VwHashMap from "../util/VwHashMap/VwHashMap.js";
import {Cr8EventTypes} from "/js/Cr8Init.js";
import VwWebRtcDataChannelMgr from "./VwWebRtcDataChannelMgr.js";

/**
 * This class manages peer connections for a specific chat room
 *
 * @param peerConfigProps The config props (Required)
 * @param dataChannelProps If using data channels, the user configs (Optional)
 *
 * @constructor
 */
function VwWebRtcPeerMgr( peerConfigProps, dataChannelProps )
{
  const self = this;

  const m_eventMgr = getEventMgr();

  const m_mapPeerConnections = new VwHashMap();
  const m_mapDataChannels = new VwHashMap();
  const m_mapPeerMeta = new VwHashMap();

  let m_mapWebinarInvitees ;
  let m_fnUserListCallback;

  let m_stream;
  let m_strStreamType;

  let m_strUserId;

  // PUBLIC Methods
  this.createOffer = handleCreateOffer;
  this.send = send;
  this.leave = leave;

  this.setUserListCallback = setUserListCallback;
  this.changePresenterRequest = changePresenterRequest;
  this.changePresenterResponse = changePresenterResponse;
  this.setStream = setStream;
  this.close = closeConnection;
  this.muteAttendeeAudio = muteAudio;
  this.sendMicMuteStatus = sendMicMuteStatus;
  this.getDataChannelMap = getDataChannelMap;

  configObject();

  /**
   * Client configObject, create websocket to server
   */
  function configObject()
  {
    m_strUserId = peerConfigProps.strUserId;
    m_stream = peerConfigProps.stream;

    m_eventMgr.removeEventListener( Cr8EventTypes.WEBRTC_EVENT, "VwWebRtcPeerMgr" );
    m_eventMgr.addEventListener( Cr8EventTypes.WEBRTC_EVENT, "VwWebRtcPeerMgr", dispatchWebRtcMsg );

   } // end config()


   function getDataChannelMap()
   {
     return m_mapDataChannels;
   }

  /**
   * Updates a stream, used in webinarScreen when presenter role is changed
   *
   * @param stream
   * @param strStreamType
   */
   function setStream( stream, strStreamType )
   {
     m_stream = stream;
     m_strStreamType = strStreamType;

   }


  /**
   * Close this connection and references to any peers
   */
  function closeConnection( strUserIdClosing )
   {
     // Close local stream tracks if strUserIdClosing not null and is me
     console.log( `Leaving connection by ${strUserIdClosing}`)
     if ( strUserIdClosing )
     {
       if ( strUserIdClosing == m_strUserId && m_stream)
       {
         closeTracks( m_stream );
       }
     }
     else // chat room is closed -- session over
     {
       if ( m_stream )
       {
         closeTracks( m_stream );
       }

     }
     // close any  remote streams

     // if a user id is specified close just the user else close all peer connetctions
     if ( strUserIdClosing )
     {
       m_mapPeerMeta.remove( strUserIdClosing );

     } // end if
     else
     {
       m_mapPeerMeta.clear();
     } // end else

     const aPeerConnections = m_mapPeerConnections.values();

     if ( !aPeerConnections )
     {
       return;
     }

     if ( strUserIdClosing  )
     {
       if ( dataChannelProps && dataChannelProps.dataChannelMgr )
       {
         dataChannelProps.dataChannelMgr.close( strUserIdClosing );

       }

     }
     else
     {
       // Chat
       if ( dataChannelProps && dataChannelProps.dataChannelMgr )
       {
         dataChannelProps.dataChannelMgr.close();

       }

     }

     if ( peerConfigProps.fnOnPeerClose )
     {
       peerConfigProps.fnOnPeerClose( strUserIdClosing );

     }

     if ( strUserIdClosing  )
     {
       const peerConnection = m_mapPeerConnections.get( m_strUserId )

       if ( peerConnection )
       {
         if ( peerConnection.signalingState != "closed" )
         {
           peerConnection.close();
         }

       }

      return;
     }

     // Chat room closed so close all
     for ( let rtcPeerConnection of aPeerConnections )
     {
       if ( rtcPeerConnection.signalingState != "closed")
       {
         rtcPeerConnection.close();
       }

       rtcPeerConnection = null;

     }

     m_mapPeerConnections.clear();
   }

  /**
   * Sets the callback for user list request
   * @param fnUserListCallBack The userList callback
   *
   */
  function setUserListCallback( fnUserListCallBack )
  {
    m_fnUserListCallback = fnUserListCallBack;

  }

  /**
   * Request to change screen presenter to a new user
   * @param strUserIdNewPresenter
   */
  function changePresenterRequest( strUserIdNewPresenter )
  {

    //console.log( "Sending Presenter Request To: " + strUserIdNewPresenter );
    clearRtcConnections();

    send( {"type":"changePresenterRequest","toUserId":strUserIdNewPresenter,"fromUserId":m_strUserId});

  }
  
  /**
   * Request to change screen presenter to a new user
   * @param strUserIdNewPresenter
   */
  function changePresenterResponse( fAccept, strCurPresenterId )
  {

    clearRtcConnections();

    let strRespCode;

    if ( fAccept )
    {
      strRespCode = "accept";
    }
    else
    {
      strRespCode = "reject";
    }

    send( {"type":"changePresenterResponse","respCode":strRespCode,"curPresenterId":strCurPresenterId,"newPresenterId":m_strUserId});

  }


  /**
   * Wewbsocket message dispatcher
   *
   * @param cr8NotificationPBO message sent from server
   */
  function dispatchWebRtcMsg( cr8NotificationPBO )
  {

    const data = JSON.parse(cr8NotificationPBO.contextData );

    console.log( "Got message Type: ", data.type );

    switch ( data.type )
    {
      case "joinWebinar":

            onJoinWebinar( data );
            break;

      case "loginError":

            onLoginError();
            break;

      case "changePresenterRequest":

            onChangePresenterRequest( data );
            break;

      case "changePresenterResponse":

            onChangePresenterResponse( data );
            break;

      case "presenterChange":

            onPresenterChange( data );
            break;

      case "attendeeChange":

            onAttendeeChange( data );
            break;

      case "serverError":

            onServerError( data );
            break;


      case  "createOffer":

            handleCreateOffer( data );
            break;

      case  "chatRoomClosed":

            handleChatRoomClosed( data );
            break;

      case "offer":

            onOffer( data );
            break;

      case "answer":

            onAnswer( data );
            break;

      case "candidate":

            onCandidate( data );
            break;

      case "leave":

            onLeave( data );
            break;

      case "webinarClosed":

            onCloseWebinar( data );
            break;

      case "muteAttendeeAudio":

           onMuteAudio( data );
           break;

      case "muteStatus":

           onMuteStatus( data );
           break;


      case "userIdList":

           if ( !m_fnUserListCallback )
           {
             throw "A callback function must be specified when requesting a user list";
           }

           m_fnUserListCallback( data.userIdList );

           break;

      case "status":
      case "chatRoomStatus":

            handleRequestStatus( data );
            break;

      case "customMsg":

        handleCustomMsg( data );
        break;

      default:

            if ( peerConfigProps.msgDispatcher )
            {
              peerConfigProps.msgDispatcher.onMessage( data );
            }

            break;

    } // end switch

  } // end webSockMsgDispatcher()

  /**
   * Calls custom msg handler for this client
   * @param data
   */
  function handleCustomMsg( data )
  {
    if ( peerConfigProps.fnOnCustomMsg )
    {
      peerConfigProps.fnOnCustomMsg( data );
    }

  } // end handleCustomMsg()


  function handleRequestStatus( data )
  {

    if ( peerConfigProps.fnOnActionRequestStatus )
    {
      peerConfigProps.fnOnActionRequestStatus( data );
    }
  }

  /**
   * Request to the presenter to join the webinar
   * @param data
   */
  function onJoinWebinar( data )
  {
    if ( m_mapWebinarInvitees )
    {
      //todo only allow access to these invitees
    }
    else
    {

      send( {"type":"loginResponse", "responseCode":"accepted","userId":data.fromUserId });
      data.toUserId = data.fromUserId;

      //console.log( "Request To Join Webinar From: " + data.fromUserId );
      handleCreateOffer( data );

    }
  }

  /**
   * Chat room close event
   * @param data
   */
  function handleChatRoomClosed( attendeeClosing )
  {
    //console.log( data.streamType + " " + data.chatRoomId + " is closed by user id: " + data.userIdClosing );

    closeConnection();

    if ( peerConfigProps.fnOnChatRoomClosed )
    {
      peerConfigProps.fnOnChatRoomClosed( JSON.parse(attendeeClosing.attendee ) )
    }
  }


  /**
   * Request to make this webinar peer the new presenter
   * @param data
   */
  function onChangePresenterRequest( data )
  {
    //console.log( "Calling fnOnPresenterChangeRequest for new Presenter: "  + m_strUserId + " From: " + data.fromUserId );
    peerConfigProps.fnOnPresenterChangeRequest( data.fromUserId );

  }

  /**
   * Request to make this webinar peer the new presenter
   * @param data
   */
  function onChangePresenterResponse( data )
  {
    //console.log( "Got presenter response : " + data.respCode + " From: " + data.fromUserId );;
    peerConfigProps.fnOnPresenterChangeResponse( data.fromUserId, data.respCode );


  }

  /**
   * Fired when a pwebinar presenter changes
   * @param data
   */
  function onPresenterChange( data )
  {
    if ( peerConfigProps.fnOnPresenterChange )
    {
      peerConfigProps.fnOnPresenterChange( data.newPresenterId, data.creatorId );
    }

  } /// end onPresenterChange(()

  /**
   * Fired when a conference attendee joins or leave the conference
   * @param data
   */
  function onAttendeeChange( data )
  {

    if ( peerConfigProps.fnOnAttendeeChange )
    {
      let attendee;
      if ( data.attendee )
      {
        attendee = JSON.parse( data.attendee );
      }
      else
      {
        attendee = {};
      }

      peerConfigProps.fnOnAttendeeChange( attendee, data.status );
    }

  } // end onAttendeeChange()


  /**
   * Creates an Offer to the requesting Peer
   * @param data
   */
  async function handleCreateOffer( data )
  {
    createPeerMetaEntry( data, data.toUserId );

    const strToUserId = data.toUserId;

    console.log( `Creating Offer To: ${strToUserId}`  );

    const iceServerConfig = getIceServers();

    const rtcPeerConnection = new RTCPeerConnection( iceServerConfig );

    m_mapPeerConnections.put( strToUserId, rtcPeerConnection );

    if ( m_stream )
    {
      for( const track of m_stream.getTracks())
      {
        rtcPeerConnection.addTrack(track, m_stream );
      }
    }

    if ( dataChannelProps )
    {
      dataChannelProps.type = "create";
      dataChannelProps.dataChannelMgr = new VwWebRtcDataChannelMgr( m_mapDataChannels, m_strUserId, strToUserId, rtcPeerConnection, dataChannelProps );

    }

    rtcPeerConnection.onicecandidate = handleAddICECandidate;
    rtcPeerConnection.ontrack = ( event => handleAddPeerStream( event, strToUserId ));

    const offer = await rtcPeerConnection.createOffer();
    await rtcPeerConnection.setLocalDescription( offer );

    send( {
           type : "offer",
           offer: offer,
           toUserId:strToUserId,
           fromUserId:m_strUserId
         } );


    /**
      * Adds an ICE candidate
      * @param event
      */
     function handleAddICECandidate( event )
     {

       if ( event.candidate )  // batch these up until we gen an answer
       {
         console.log( `Batching up  icecandidate for ${strToUserId}`);

         const peerMetaEntry = m_mapPeerMeta.get( strToUserId );

         peerMetaEntry.toIceCandidate.push( event.candidate );
       }

      } // end handleAddICECandidate()


  }

  /**
   * Create a peerMeta object for batching the icecandidates and storing the attendee user object
   * @param data
   */
  function createPeerMetaEntry( data, strUserId )
  {
    const peerMeta ={};
    peerMeta.toIceCandidate = [];
    peerMeta.fromIceCandidate = []
    peerMeta.attendee = JSON.parse( data.attendee );

    m_mapPeerMeta.put( strUserId, peerMeta );

  } // end createPeerMetaEntry()


  /**
   * Adds a newely created peer stream only if this is a many to many video conference
   * @param rtcTrackEvent
   */
  function handleAddPeerStream( rtcTrackEvent, strToUserId )
  {
    console.log( `Adding ${peerConfigProps.streamType} Stream from ${strToUserId}` );

    const remoteStream = new MediaStream();
    rtcTrackEvent.streams[0].getTracks().forEach((track) =>
                                         {
                                           track.addEventListener( "mute", () => handleTrackMute(strToUserId, true) );
                                           track.addEventListener( "unmute", () => handleTrackMute(strToUserId, false) );

                                           remoteStream.addTrack( track )
                                         });
    const peerMeta = m_mapPeerMeta.get( strToUserId );

    if ( peerConfigProps.fnOnAddPeerStream )
    {
      peerConfigProps.fnOnAddPeerStream( peerMeta.attendee, remoteStream );
    }

  } // end handleAddPeerStream()

  /**
   * tracks muted/unmuted event handler
   * @param strUserId
   * @param bIsMuted
   */
  function handleTrackMute(strUserId, bIsMuted )
  {
    console.log( `User:${strUserId} muted state is ${bIsMuted}`);

  } // end handleTrackMute()


  /**
   * Clears out all current connections
   */
  function clearRtcConnections()
  {
    for (const rtcPeerConnection of m_mapPeerConnections.values() )
    {
      rtcPeerConnection.close();
    }

    m_mapPeerConnections.clear();

  }


  //when a user logs in
  function onLoginError()
  {
    alert( "Already Logged In" );
  }

  //when a user logs in
  function onServerError( message )
  {
    alert( `Server Could Not Complete Request. Reason: ${message.errorDesc}` );

  }

  //when somebody wants to call us
  async function onOffer( data )
  {
    createPeerMetaEntry( data, data.fromUserId );

    const strFromUserId = data.fromUserId;

    console.log( `Got Offer From: ${strFromUserId}` );

    const iceServerConfig = getIceServers();

    const rtcPeerConnection = new RTCPeerConnection( iceServerConfig )

    m_mapPeerConnections.put( strFromUserId, rtcPeerConnection );

    try
    {
      rtcPeerConnection.setRemoteDescription( data.offer );
    }
    catch(err)
    {
      console.log( `Error in data offer: ${err.toString()}` );

    }

    if ( m_stream )
    {
      for( const track of m_stream.getTracks())
      {
        rtcPeerConnection.addTrack( track, m_stream );
      }
    }


    rtcPeerConnection.onicecandidate = handleAddICECandidate;
    rtcPeerConnection.ontrack = ( event => handleAddPeerStream( event, strFromUserId ));

    if ( dataChannelProps )
    {
      dataChannelProps.type = "attach";
      dataChannelProps.dataChannelMgr = new VwWebRtcDataChannelMgr( m_mapDataChannels, m_strUserId, strFromUserId, rtcPeerConnection, dataChannelProps );
    }

    const answer = await rtcPeerConnection.createAnswer();
    await rtcPeerConnection.setLocalDescription( answer );

    const msgSend = {};
    msgSend.type  = "answer";
    msgSend.answer = answer;
    msgSend.fromUserId = m_strUserId;
    msgSend.toUserId = strFromUserId;

    send( msgSend );

    /**
      * Adds an ICE candidate
      * @param event
      */
     function handleAddICECandidate( event )
     {
       if ( event.candidate )
       {
         send( {
                 type     : "candidate",
                 candidate: event.candidate,
                 toUserId:strFromUserId,
                 fromUserId:m_strUserId
               });
        }

     } // end handleAddICECandidate()

  }


  /**
   *
   * when another user answers to our offer
   * @param data data from chatroom signaling server
   */
  function onAnswer( data )
  {
    const strFromUserId = data.fromUserId;

    console.log( `Got Offer Answer From: ${strFromUserId}` );
    const rtcPeerConnection = m_mapPeerConnections.get( strFromUserId );

    if(!rtcPeerConnection.currentRemoteDescription)
    {
      rtcPeerConnection.setRemoteDescription( data.answer );
    }

    const peerMetaEntry = m_mapPeerMeta.get( strFromUserId );

    peerMetaEntry.toIceCandidate.push( data.candidate );

    for ( const candidate of peerMetaEntry.toIceCandidate )
    {
      send( {
                type     : "candidate",
                candidate: candidate,
                toUserId:strFromUserId,
                fromUserId:m_strUserId
             });

    }


    for ( const candidate of peerMetaEntry.fromIceCandidate )
    {
      rtcPeerConnection.addIceCandidate( candidate );
    }

    // Reset batched arrays to be empty
    peerMetaEntry.toIceCandidate = peerMetaEntry.fromIceCandidate = null;

   }

  //when we got ice candidate from another user
  async function onCandidate( data )
  {
    const strFromUserId = data.fromUserId;
    const peerMetaEntry = m_mapPeerMeta.get( strFromUserId );

    // batch these up until we get an answer

    if ( peerMetaEntry.fromIceCandidate )
    {
      peerMetaEntry.fromIceCandidate.push( data.candidate  );
      return;
    }


    console.log( `Added ICE Candidate from: ${strFromUserId}` );
    const rtcPeerConnection = m_mapPeerConnections.get( strFromUserId );

    if ( !rtcPeerConnection )
    {
      console.log( `No Peer Candidate for: ${strFromUserId}` );
      return;
    }

    try
     {
        await rtcPeerConnection.addIceCandidate( data.candidate );
 
     }
     catch ( error )
     {
       console.error( error );
     }


  } // end onCandidate()


  /**
   * A chatroom peer is leaving, cleanup resource and call fnOnRemovePeerStream ) if defined
   *
   * @param strUserIdLeaving The id of the peer leaving the chat
   */
  function onLeave( data  )
  {
    const strFromUserId = data.userId;
    closeConnection( strFromUserId );

    if ( peerConfigProps.fnOnRemovePeerStream )
    {
      peerConfigProps.fnOnRemovePeerStream( strFromUserId  );
    }

  }

  /**
   * Stops tracks on the remote stream to prevent leakage
   * @param peerMeta
   */
  function closeTracks( remoteStream )
  {
    for ( const track of remoteStream.getTracks() )
    {
      track.stop();
    }
  }

  /**
   *
   * @param data
   */
  function onCloseWebinar( data )
  {
    closeConnection();

    if (  peerConfigProps.fnOnWebinarClosed )
    {
      peerConfigProps.fnOnWebinarClosed( data.id, data.userId );
    }

  }

  /**
   * Mutes an attendees audio usually a microphone feed
   *
   * @param fMute true to muste, false to unmute
   * @param strWhoIssuedId  The id of attendee makeing the mute request
   * @param strUserToMuteId  The id of the attendee being muted
   * @param fMute true to muste, false to unmute
   */
  function muteAudio( strWhoIssuedId, strUserToMuteId, fMute )
  {
    send( {"type":"muteAttendeeAudio","muterId":strWhoIssuedId,"toMuteId":strUserToMuteId,"action":fMute})
  }

  /**
   * Send s mic mute status to the specified user
   *
   * @param strUserId The user id receiving the status
   * @param fMuted The status, if true mic is muted, else its unmuted
   */
  function sendMicMuteStatus( strUserId, fMuted )
  {
    send( {"type":"muteStatus","toUserId":strUserId,"fromUserId":m_strUserId,"status":fMuted})

  }

  /**
   * Mutes an attendees audio
   * @param data
   */
  function onMuteAudio( data )
  {
    if ( peerConfigProps.fnOnMuteAudio )
    {
      peerConfigProps.fnOnMuteAudio( data.toMuteId, data.action == "true" );
    }

  }

  function onMuteStatus( data )
  {
    if ( peerConfigProps.fnOnMuteStatus )
    {
      peerConfigProps.fnOnMuteStatus( data.fromUserId, data.status == "true" );
    }

  }

  /**
   * Leave this chat room
   */
  function leave()
  {
    send( {"type":"leave","userId":m_strUserId});
  }

  /**
   * Sends A javascript object to the server
   *
   * @param message The message to send
   * @param strUserId The user id of the peer
   */
  function send( message )
  {

    console.log( `Sending webRtcMsg Type: ${message.type}, to User Id: ${message.toUserId} , From User: ${message.fromUserId}` );

    const strUrl = "sendWEbRtcMessage?cid=" + peerConfigProps.strChatRoomId;

    postService( strUrl, JSON.stringify( message ) );
   }

  function getIceServers()
  {

  }
} // end VwWebRtcPeerMgr{}

// WebRtc Conference types
VwWebRtcPeerMgr.AUDIO = "audio";
VwWebRtcPeerMgr.VIDEO_CONF = "videoConference";
VwWebRtcPeerMgr.DATA = "data";

export default VwWebRtcPeerMgr;