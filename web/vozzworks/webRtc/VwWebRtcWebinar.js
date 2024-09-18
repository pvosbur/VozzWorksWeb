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
import VwWebRtcPeerMgr from "./VwWebRtcPeerMgr.js";
import VwWebRtcAudio from "./VwWebRtcAudio.js";
import VwWebRtcMediaShare from "./VwWebRtcMediaShare.js";

/**
 * Creates A Webinar Screen shareing webinar
 *
 * @param strServerUrl The url to the server hosting the websockets (This is not the web socket url) ex. https://www.mysite.com
 * @constructor
 */
function VwWebRtcWebinar( strWebSockUrl, webinarProps, dataChannelProps )
{
  let m_webRtcPeerMgrScreenShare;
  let m_vwAudioChatRoom;
  let m_vwMediaShareChatRoom;

  let m_peerConfigProps;
  let m_strWebinarUserId;
  let m_strWebinarId;
  let m_myScreenStream;

  let m_fIsJoiner = false;
  let m_screenShareMediaContstraints;

  let m_strVideoId;

  setup();

  this.createWebinar = createWebinar;
  this.closeWebinar = closeWebinar;
  this.joinWebinar = joinWebinar;
  this.leave = leave;

  this.listAttendees = listAttendees;
  this.changePresenterRequest = changePresenterRequest;
  this.changePresenterResponse = changePresenterResponse;
  this.addVoip = addVoip;
  this.addMediaShare = addMediaShare;
  this.joinMediaShare = joinMediaShare;
  this.muteAttendeeAudio = muteAudio;
  this.sendMicMuteStatusToPresenter = sendMicMuteStatusToPresenter;
  this.muteMic = muteMic;

  function setup()
  {
    m_peerConfigProps = {};
    m_peerConfigProps.iceServers = webinarProps.iceServerConfig;

    m_strWebinarUserId = webinarProps.strUserId;
    m_strWebinarId = webinarProps.strWebinarId;

    m_peerConfigProps.strUserId = m_strWebinarUserId;
    m_peerConfigProps.streamType = webinarProps.streamType;

    m_peerConfigProps.fnOnAttendeeChange = webinarProps.fnOnAttendeeChange;
    m_peerConfigProps.fnOnPresenterChangeRequest = webinarProps.fnOnPresenterChangeRequest;
    m_peerConfigProps.fnOnPresenterChangeResponse = handlePresenterChangeResponse;
    m_peerConfigProps.fnOnPresenterChange = webinarProps.fnOnPresenterChange;
    m_peerConfigProps.fnOnActionRequestStatus = webinarProps.fnOnActionRequestStatus;
    m_peerConfigProps.fnOnWebinarClosed = handleWebinarClosed;
    m_peerConfigProps.fnOnAddStream = function ( strStreamType, stream, streamOwnerId )
    {
      $( "#" + m_strVideoId )[0].srcObject = stream;
    }

    m_strVideoId = webinarProps.strVideoId;

    m_screenShareMediaContstraints =
    {
      audio:false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            maxWidth         : 1920,
            maxHeight        : 1080
          },
          optional:[]
        }
    };

  }

  /**
   * Creates a webinar entry on the hosting server with the webinar name
   *
   * @param strWebinarId The id of the webinar to create. Must be unique
   * @param strUserIdPresenter The user id of the webinar owner and initial presenter
   */
  function createWebinar()
  {

    m_peerConfigProps.strWebSocketUrl = strWebSockUrl;

    setupScreenShareStream( m_screenShareMediaContstraints, function ( stream )
                            {
                              m_myScreenStream = stream;
                              m_peerConfigProps.stream = m_myScreenStream;
                              createWebRtcMgr();

                            });

  }  // end createWebinar()



  /**
   * Join an existing webinar
   *
   */
  function joinWebinar()
  {

    m_fIsJoiner = true;
    m_peerConfigProps.strWebSocketUrl = strWebSockUrl;

    createWebRtcMgr();
    
  }

  /**
   * Creates the WebRtcPeerMgr
   *
   */
  function createWebRtcMgr()
  {
    m_webRtcPeerMgrScreenShare = new VwWebRtcPeerMgr( m_peerConfigProps, dataChannelProps );

  }


  /**
   * Adds a data chat channel
   *
   * @param strWebSockUrl The websocket connection url
   * @param iceServerConfig The iceServer config object
   */
  function addVoip( iceServerConfig, voipProps )
  {
    const audioProps = {};
    audioProps.streamType = "audio";

    audioProps.strUserId = m_strWebinarUserId;
    audioProps.strWebSocketUserId = webinarProps.strWebSocketUserId;
    audioProps.strChatRoomId = m_strWebinarId;
    audioProps.iceServerConfig = iceServerConfig;
    audioProps.fnOnMuteAudio = webinarProps.fnOnMuteAudio;
    audioProps.fnOnMuteStatus = webinarProps.fnOnMuteStatus;
    audioProps.isAnonymousUser = webinarProps.isAnonymousUser;

    if ( voipProps )
    {
      audioProps.fnOnActionRequestStatus = voipProps.fnOnActionRequestStatus;
    }


    m_vwAudioChatRoom = new VwWebRtcAudio( audioProps );

    if ( m_fIsJoiner )
    {
      m_vwAudioChatRoom.join();

      return;

    }

    m_vwAudioChatRoom.create();
  }

  /**
   * Adds an additional media element to share like an sudio or video feed, or a vcnvas
   * @param streamableMediaElement The streamable element to share. Must be one of and audio, video or vanvas html element
   */
  function addMediaShare( streamableMediaElement )
  {
    const audioShareProps = {};
    audioShareProps.shareType = "audio";
    audioShareProps.iceServerConfig = webinarProps.iceServerConfig;
    audioShareProps.strUserId = m_strWebinarUserId;
    audioShareProps.strWebSocketUserId = webinarProps.strWebSocketUserId;

    audioShareProps.strChatRoomId = m_strWebinarId;

    m_vwMediaShareChatRoom = new VwWebRtcMediaShare( streamableMediaElement, audioShareProps );
    m_vwMediaShareChatRoom.create();

  }

  /**
   * Joins the media share chat room
   */
  function joinMediaShare()
  {
    const audioShareProps = {};
    audioShareProps.shareType = "audio";
    audioShareProps.iceServerConfig = webinarProps.iceServerConfig;
    audioShareProps.strUserId = m_strWebinarUserId;
    audioShareProps.strWebSocketUserId = webinarProps.strWebSocketUserId;

    audioShareProps.strChatRoomId = m_strWebinarId;

    m_vwMediaShareChatRoom = new VwWebRtcMediaShare( null, audioShareProps );
    m_vwMediaShareChatRoom.join();

  }

  /**
   * Sends a mic mute status update to the current presenter
   * @param strPresenterId
   * @param fMuted
   */
  function sendMicMuteStatusToPresenter( strPresenterId, fMuted )
  {
    if ( m_vwAudioChatRoom )
    {
      m_vwAudioChatRoom.sendMicMuteStatusToPresenter( strPresenterId, fMuted );
    }
  }

  /**
   * Issues a mute request on the attendee's machine
   *
   * @param strToMuteId
   * @param fAction
   */
  function muteAudio( strToMuteId, fAction )
  {
    if ( m_vwAudioChatRoom )
    {
      m_vwAudioChatRoom.muteAttendeeAudio( strToMuteId, fAction );
    }
  }

  function muteMic( fMute )
  {
    if ( m_vwAudioChatRoom )
    {
      m_vwAudioChatRoom.mute( fMute );
    }

  }
  /**
   * Gets a list of the user ids currently in the webinar
   * @param fnResult The callback that will be passed an array of user ids
   */
  function listAttendees( fnResult )
  {
    m_webRtcPeerMgrScreenShare.setUserListCallback( fnResult );
    m_webRtcPeerMgrScreenShare.send( {"type": "list", "toUserId": m_strWebinarUserId} );

  }

  /**
   * Sends a change presenter request to the user id specified
   *
   * @param strUserIdPresenter The new user id to become the webinar presenter
   * @param fnComplete Complete callback handle
   */
  function changePresenterRequest( strUserIdPresenter )
  {
    m_webRtcPeerMgrScreenShare.changePresenterRequest( strUserIdPresenter );

  }

  /**
   * The response fro the chaePresenter user request
   * @param fResponse true id change presenter request was granted by user
   * @param strUserIdPresenter The new presenter user id
   */
  function changePresenterResponse( fResponse, strUserIdPresenter )
  {
    if ( fResponse )
    {
      setupScreenShareStream( m_screenShareMediaContstraints, function( stream )
      {
        $( "#" + webinarProps.strVideoId )[0].src = "";

        m_myScreenStream = stream;
        m_webRtcPeerMgrScreenShare.setStream( m_myScreenStream, "screen");
        m_webRtcPeerMgrScreenShare.changePresenterResponse( fResponse, strUserIdPresenter );

      });
    }
    else
    {
      m_webRtcPeerMgrScreenShare.changePresenterResponse( false, strUserIdPresenter );

    }
  }

  /**
   * Stopos the current screen video stream
   */
  function stopScreenSharing()
  {
    if ( !m_myScreenStream )
    {
      return;

    }
    
    // This closes the video stream and removes the chrome window at the bottom
    m_myScreenStream.getTracks().forEach( function( track )
                                          {
                                            track.stop();
                                          });

  } // end stopScreenSharing()

  /**
   * Callback handler from the user who accepts/rejects the presenter change request
   *
   * @param strPresenterRequestId The id of the requested new presenter
   * @param strAcceptStatus The accept status
   */
  function handlePresenterChangeResponse( strPresenterRequestId,  strAcceptStatus  )
  {

    if ( strAcceptStatus == "accept" )
    {

      // requested user has accepted presenter change request. Stop sharing my screen
      stopScreenSharing();
    }


    if ( webinarProps.fnOnPresenterChangeResponse )
    {
      webinarProps.fnOnPresenterChangeResponse( strPresenterRequestId,  strAcceptStatus );
    }

  } // end handlePresenterChangeResponse(()

  /**
   * Webinar was closed
   * @param strWebinarId The webinar that was closed
   * @param strUserClosedId The user id that closed it
   */
  function handleWebinarClosed( strWebinarId, strUserClosedId )
  {
    $( "#" + m_strVideoId )[0].src = "";

    if ( m_vwAudioChatRoom )
    {
      m_vwAudioChatRoom.close();

    }
    
    if ( webinarProps.fnOnWebinarClosed )
    {
      webinarProps.fnOnWebinarClosed( strWebinarId, strUserClosedId );
    }

  } // end  handleWebinarClosed()

  /**
   * Closes the webinar
   *
   * @param strWebinarName
   */
  function closeWebinar( strUserIdClosing )
  {
    stopScreenSharing();

    m_webRtcPeerMgrScreenShare.send( {"type":"closeWebinar","userId":strUserIdClosing});

    $( "#" + m_strVideoId )[0].src = "";

    // Close video stream
    m_webRtcPeerMgrScreenShare.closeChatRoom( "webRtcWebinar_" + webinarProps.strWebinarId,  m_strWebinarUserId );

    if ( m_vwAudioChatRoom )
    {
      m_vwAudioChatRoom.close();
    }

    if ( m_vwMediaShareChatRoom )
    {
      m_vwMediaShareChatRoom.close();
    }

  } // end closeWebinar()


 function leave()
 {
   stopScreenSharing();

   $( "#" + m_strVideoId )[0].src = "";

   m_webRtcPeerMgrScreenShare.leave();

   if ( m_vwAudioChatRoom )
   {
     m_vwAudioChatRoom.leave();
   }

   if ( m_vwMediaShareChatRoom )
   {
     m_vwMediaShareChatRoom.leave();
   }

 } // end leave()

} // end class VwWebRtcWebinar{}

export default VwWebRtcWebinar;