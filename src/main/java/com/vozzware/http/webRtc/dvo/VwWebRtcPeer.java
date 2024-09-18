package com.vozzware.http.webRtc.dvo;

import com.vozzware.http.VwWebSocket;

/*
============================================================================================

    Source File Name: Transaction.java

    Author:           petervosburgh
    
    Date Generated:   7/14/17

    Time Generated:   7:14 AM

============================================================================================
*/

/**
 * THis class defines the attributes about a peer connection
 */
public class VwWebRtcPeer
{
  private String m_strUserId;
  private VwWebSocket m_wsConnection;

  /**
   * Constructor
   *
   * @param strUserId  The user id of the peer
   * @param wsConnection The web socket connection for this peer
   */
  public VwWebRtcPeer( String strUserId, VwWebSocket wsConnection )
  {
    m_strUserId = strUserId;
    m_wsConnection = wsConnection;

  }


  public String getUserId()
  {
    return m_strUserId;
  }

  public void setUserId( String strUserId )
  {
    m_strUserId = strUserId;
  }

  public VwWebSocket getWsConnection()
  {
    return m_wsConnection;
  }

  public void setWsConnection( VwWebSocket wsConnection )
  {
    m_wsConnection = wsConnection;
  }
}
