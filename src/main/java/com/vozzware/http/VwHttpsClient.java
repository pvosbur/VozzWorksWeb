/*
============================================================================================
 
                                Copyright(c) 2000 - 2006 by

                       V o z z W a r e   L L C (Vw)

                                   All Rights Reserved

THIS PROGRAM IS PROVIDED UNDER THE TERMS OF THE Vozzware LLC PUBLIC LICENSE VER 1.0 (�AGREEMENT�),
PROVIDED WITH THIS PROGRAM. ANY USE, REPRODUCTION OR DISTRIBUTION OF THE PROGRAM
CONSTITUTES RECEIPIENTS ACCEPTANCE OF THIS AGREEMENT.

Source Name: VwHttpsClient.java

============================================================================================
*/

package com.vozzware.http;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.net.URL;

public class VwHttpsClient extends VwHttpClient
{
  HttpsURLConnection m_httpsConn;

  public VwHttpsClient( URL urlHttps) throws Exception
  {
    super(urlHttps);
    if ( !(m_urlConn instanceof HttpsURLConnection) )
      throw new Exception( "This is not a valid HTTPS URL");
    
    m_httpsConn = (HttpsURLConnection)m_urlConn;
    
    // Set default Verifier of true
    m_httpsConn.setHostnameVerifier( new HostnameVerifier()
    {
      public boolean verify(String hostname, SSLSession session)
      { return true; }
      
    });
  }


  /**
   * Gets the HttpsURLConnection object used by this class
   * @return
   */
  public HttpsURLConnection getHttpsConnection()
  { return m_httpsConn; }
  

  /**
   * Sets the path to the keystore used in the SSL handshake with a server
   * 
   * @param strKeystorePath
   *          The complete path and and file name of the keystore
   */
  public static void setKeystorePath( String strKeystorePath )
  {
    System.setProperty("javax.net.ssl.trustStore", strKeystorePath);
  }

  /**
   * Overrides the default host name verifier which always return true.
   * @param hostNameVerifier The verifier instance 
   */
  public void setHostNameVerifier( HostnameVerifier hostNameVerifier )
  {
    m_httpsConn.setHostnameVerifier( hostNameVerifier);

  }

  
  /**
   * Creates a default trust manager that enables all certs
   * @throws Exception
   */
  public static void enableAllCerts() throws Exception
  {
    // Create a trust manager that does not validate certificate chains
    TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager()
    {
      public java.security.cert.X509Certificate[] getAcceptedIssuers()
      {
        return null;
      }

      public void checkClientTrusted(
          java.security.cert.X509Certificate[] certs, String authType )
      {
        return;
      }

      public void checkServerTrusted(
          java.security.cert.X509Certificate[] certs, String authType )
      {
        return;
      }
    } };

    // Install the all-trusting trust manager
    SSLContext sc = SSLContext.getInstance( "SSL" );
    sc.init(null, trustAllCerts, new java.security.SecureRandom());
    HttpsURLConnection.setDefaultSSLSocketFactory( sc.getSocketFactory() );

  }
  
  
}// end class VwHttpsClient{}

// *** End VwHttpsClient.java ***
