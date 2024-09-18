/*
============================================================================================
 
                                Copyright(c) 2000 - 2006 by

                       V o z z W a r e   L L C (Vw)

                                   All Rights Reserved

THIS PROGRAM IS PROVIDED UNDER THE TERMS OF THE Vozzware LLC PUBLIC LICENSE VER 1.0 (�AGREEMENT�),
PROVIDED WITH THIS PROGRAM. ANY USE, REPRODUCTION OR DISTRIBUTION OF THE PROGRAM
CONSTITUTES RECEIPIENTS ACCEPTANCE OF THIS AGREEMENT.

Source Name: VwHttpClient.java

============================================================================================
*/

package com.vozzware.http;

import javax.servlet.http.Cookie;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * @author P. VosBurgh
 * 
 * This class wraps high level functionality  around HttpURLConnection for POSTING data and retirving content from the response.
 *
 */
public class VwHttpClient extends VwURLReader
{
  private HttpURLConnection m_httpConn;
  private PrintWriter       m_pw;
  
  /**
   * Constructor
   * @param urlToConnect The url to connect to
   * @throws Exception if url is not valid dor connection could not be made
   */
  public VwHttpClient( URL urlToConnect ) throws Exception
  {
    super( urlToConnect );
    
    if ( ! (m_urlConn instanceof HttpURLConnection) )
      throw new Exception( "The url must use the http prtotcol" );
 
    m_httpConn = (HttpURLConnection)m_urlConn;
    m_httpConn.setDoOutput( true );
    
     
  } // end VwHttpClient()
  
  public VwHttpClient( URL urlToConnect, Map<String,String>mapQueryString ) throws Exception
  {
    super( urlToConnect, mapQueryString );
    
    if ( ! (m_urlConn instanceof HttpURLConnection) )
      throw new Exception( "The url must use the http prtotcol" );
 
    m_httpConn = (HttpURLConnection)m_urlConn;
    m_httpConn.setDoOutput( true );
    
     
  } // end VwHttpClient()


  public VwHttpClient( URL urlToConnect, String strQueryString ) throws Exception
  {
    super( urlToConnect, strQueryString );

    if ( ! (m_urlConn instanceof HttpURLConnection) )
      throw new Exception( "The url must use the http prtotcol" );

    m_httpConn = (HttpURLConnection)m_urlConn;
    m_httpConn.setDoOutput( true );


  } // end VwHttpClient()

  /**
   * Makes the connection to the url endpoint using the HTTP request method
   * 
   * @param strRequestMethod The HTTP request method i.e., GET POST ....
   * @throws Exception
   */
  public void connect( String strRequestMethod ) throws Exception
  { 
    m_httpConn.setRequestMethod( strRequestMethod );

    m_httpConn.connect();
    
  } // end connect()
  
  
  /**
   * Sets the Content-Type header 
   * @param strContentType The content type MIME type
   */
  public void setContentType( String strContentType )
  { m_httpConn.addRequestProperty( "Content-Type", strContentType ); }
  
  
  /**
   * Sets the Content-Length header
   * @param strContentLength The content length
   */
  public void setContentLength( String strContentLength )
  { m_httpConn.addRequestProperty( "Content-Length", strContentLength ); }

  
  
  /**
   * Sets the Content-Length header
   * @param nContentLength The content length
   */
  public void setContentLength( int nContentLength )
  { setContentLength( String.valueOf( nContentLength )); }
 
 
  /**
   * Adds an HTTP Header
   * @param strName The header name
   * @param strValue The header value
   */
  public void addHeader( String strName, String strValue )
  { m_httpConn.addRequestProperty( strName, strValue );  }

  /**
   * Adds a cookie to the request header
   *
   * @param cookieToAdd  The cookie to add
   * @throws Exception
   */
  public void addCookie( Cookie cookieToAdd ) throws Exception
  {
    m_urlConn.addRequestProperty( "Cookie", "name=" + cookieToAdd.getName() + "=" + cookieToAdd.getValue() );

  }

  /**
   * Adds a cookie to the request header
   *
   * @param strName  The cookie name
   * @param strValue The cookie value
   * @throws Exception
   */
  public void addCookie( String strName, String strValue ) throws Exception
  {
    m_urlConn.addRequestProperty( "Cookie", strName + "=" + strValue );
  }

  /**
   * Gets the cookie header values from this response
   * @return
   * @throws Exception
   */
  public Map<String,String>getCookies() throws Exception
  {
    Map<String,String>mapCookies = new HashMap<>(  );
    Map<String,List<String>> mapHeaderFields = m_urlConn.getHeaderFields();

    for ( String strHeaderName : mapHeaderFields.keySet() )
    {
      if ( strHeaderName == null )
      {
        continue;
      }

      if ( strHeaderName.equalsIgnoreCase( "set-cookie" ))
      {
        List<String>listCookie = mapHeaderFields.get( strHeaderName );

        String[] astrCookieVal = listCookie.get( 0 ).split( ( "=") );

        mapCookies.put( astrCookieVal[ 0], astrCookieVal[ 1 ] );

      }

    } // end for(

    if ( mapCookies.size() == 0 )
    {
      return null;
    }

    return mapCookies;
  }
  /**
   * Set request header from the map
   * @param mapReqHeaders
   */
  public void setRequestHeaders( Map<String,String>mapReqHeaders  )
  {
    for ( String strKey : mapReqHeaders.keySet() )
    {
      String strValue = mapReqHeaders.get( strKey );
      m_httpConn.addRequestProperty( strKey, strValue );
    }

  }

  /**
   * Gets the Printwriter for sending text content
   * @return
   * @throws Exception
   */
  public PrintWriter getWriter() throws Exception
  { 
    
    if ( m_pw == null )
      m_pw = new PrintWriter( m_httpConn.getOutputStream() );

    return m_pw; 
    
  }


  /**
   * Gets the content object from the url specified
   * @return
   * @throws Exception
   */
  public Object getContent() throws Exception
  {
    try
    {
      if ( m_pw != null )
        m_pw.close();
    }
    catch( Exception ex )
    {
      ex.printStackTrace(); 
    }  // User may have closed the stream, so just ignore
    
    return super.getContent();
    
  }

  /**
   * Gets the content as String type
   * @return
   * @throws Exception
   */
  public String getContentAsString() throws Exception
  {
    try
    {
      if ( m_pw != null )
        m_pw.close();
    }
    catch( Exception ex )
    {
       ex.printStackTrace();
    }  // User may have closed the stream, so just ignore
    
    return super.getContentAsString();
  }

  /**
   * Gets the resp[onse code from the request
   * @return
   * @throws Exception
   */
  public int getResponseCode() throws Exception
  {
    return m_httpConn.getResponseCode();
  }

  public String getResponseText() throws Exception
  {
    return m_httpConn.getResponseMessage();
  }

  /**
   * Do a POST operation with parameters
   * @param mapParams The map of parameters to be form url encodeed. May be null if no parameters are required
   * @throws Exception
   */
  public void doPost( Map<String,String>mapParams ) throws Exception
  {
    doPost( mapParams, true );

  }
  /**
   * Do a POST operation with parameters
   * @param mapParams The map of parameters to be form url encodeed. May be null if no parameters are required
   * @throws Exception
   */
  public void doPost( Map<String,String>mapParams, boolean fUrlEncode ) throws Exception
  {
    String strParams = null;
    if ( fUrlEncode )
      strParams = VwHttpUtils.makeAppXFormEncodedString( mapParams );
    else
      strParams = VwHttpUtils.map2HttpParamString( mapParams );

    setContentLength( strParams.length() );
    getWriter().write( strParams );
    m_pw.flush();
  }

  /**
   * Do a POST operation with the content specified
   * @param strContent The content to send as part of the HTTP post request
   * @throws Exception
   */
  public void doPost( String strContent ) throws Exception
  {
    setContentLength( strContent.length() );
    getWriter().write( strContent);
    m_pw.flush();
  }

  /**
   * Do a get operation using the URL specified in the constructor
   * @throws Exception
   */
  public void doGet() throws Exception
  {
     connect( "GET" );
  }

  /**
   * Do a DELETE
   * @throws Exception
   */
  public void doDelete() throws Exception
  {
    connect( "DELETE");
  }
} // end class VwHttpClient()

// *** End VwHttpClient.java ***
