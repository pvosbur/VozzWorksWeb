package com.vozzware.http;

import com.vozzware.http.webRtc.dvo.VwWebRtcPeer;

import java.io.IOException;

/*
============================================================================================

    Source File Name: 

    Author:           petervosburgh
    
    Date Generated:   4/15/16

    Time Generated:   6:09 AM

============================================================================================
*/

/**
 * Abstraction for sending text and byte array on a websocket
 */
public interface VwWebSocket
{
  /**
   * Returns the users session id
   * @return
   */
  String getSessionId();

  /**
   * Sends a Text message on the web socket
   *
   * @param strTextMsg  The text message to send
   * @throws Exception
   */
  void sendMessage( String strTextMsg ) throws Exception;

  /**
   *
   * @param abData The byte array data to send
   * @throws IOException
   */
  void sendByteArray( byte[] abData ) throws IOException;

  /**
   * Determins if the webrtc msg needs to be forwarded to the recipients home server where the
   * web socket connection resides.
   *
   * @param peerForwardTo The the webrtc peer to forward the message to
   * @param strMsg The message to forward
   *
   * @return true if the message was forwarded else false is returned
   * @throws Exception
   */
  boolean forwardedMsg( VwWebRtcPeer peerForwardTo, String strMsg ) throws Exception;

}
