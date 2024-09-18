/*
============================================================================================
 
                                Copyright(c) 2000 - 2006 by

                       V o z z W a r e   L L C (Vw)

                                   All Rights Reserved

THIS PROGRAM IS PROVIDED UNDER THE TERMS OF THE Vozzware LLC PUBLIC LICENSE VER 1.0 (�AGREEMENT�),
PROVIDED WITH THIS PROGRAM. ANY USE, REPRODUCTION OR DISTRIBUTION OF THE PROGRAM
CONSTITUTES RECEIPIENTS ACCEPTANCE OF THIS AGREEMENT.

Source Name: VwURLReader.java

============================================================================================
*/

package com.vozzware.http;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPInputStream;

/**
 * @author P. VosBurgh
 * 
 * This class provides functionality to read content at any given url.
 */
public class VwURLReader
{
  private static final int BLOCKSIZE = 16384;	// Chunk size to read

  protected URLConnection m_urlConn;					// The open url connection

  /**
   * This class managaes the URLConnection and adds high level methods to read content
   * 
   * @param urlToRead The URL to read
   * @throws Exception if any IO errors occur
   */
  public VwURLReader( URL urlToRead ) throws Exception
  {  m_urlConn = urlToRead.openConnection(); } 

  
  /**
   * 
   * @param urlToRead
   * @param mapQueryString
   * @throws Exception
   */
  public VwURLReader( URL urlToRead, Map<String,String>mapQueryString ) throws Exception
  {  
    String strUrl = urlToRead.toExternalForm();

    if ( mapQueryString != null )
    {
      StringBuffer sb = new StringBuffer( strUrl );
      sb.append( "?" ).append( VwHttpUtils.makeAppXFormEncodedString( mapQueryString ) );
      String strUpdatedUrl = sb.toString();

      urlToRead = new URL( strUpdatedUrl);
    }
    else
      urlToRead = new URL( strUrl);

    m_urlConn = urlToRead.openConnection();
  }


  /**
   *
   * @param urlToRead
   * @param strQueryString
   * @throws Exception
   */
  public VwURLReader( URL urlToRead, String strQueryString ) throws Exception
  {
    String strUrl = urlToRead.toExternalForm();

    if ( strQueryString != null )
    {
      StringBuffer sb = new StringBuffer( strUrl );

      if ( strQueryString.charAt( 0 ) != '?' )
         sb.append( "?" ).append( strQueryString );
      else
        sb.append( strQueryString );


      String strUpdatedUrl = sb.toString();

      urlToRead = new URL( strUpdatedUrl);
    }
    else
      urlToRead = new URL( strUrl);

    m_urlConn = urlToRead.openConnection();
  }

  /**
   * Return a Map of response header values
   * @return
   */
  public Map<String,List<String>>getRespHeaders()
  {
    return ((HttpURLConnection)m_urlConn).getHeaderFields();
  }


  public void setConnectionTimeout( int nMaxMiilisecs )
  { m_urlConn.setConnectTimeout( nMaxMiilisecs );}


  public int getConnectionTimeout()
  { return m_urlConn.getConnectTimeout();}

  /**
   * Return the value for the response header name. If more than one value is present
   * the values are delimited by new line characters
   * @param strHeaderName  The name of the header value to retgurn
   * @return
   */
  public String getRespHeader( String strHeaderName )
  {
     Map<String,List<String>> mapRespHeaders = getRespHeaders();
     List<String>listValues = mapRespHeaders.get( strHeaderName );

    if ( listValues == null )
      return null;

    if ( listValues.size() == 0 )
      return listValues.get( 0 );

    StringBuffer sb = new StringBuffer(  );

    for ( String strVal : listValues )
    {
      if ( sb.length() > 0 )
        sb.append( "\n" );

      sb.append( strVal );

    }

    return sb.toString();


  }
  /**
   * gets the MIME content type at this URL
   * 
   * @return The mime content type
   * @throws Exception
   */
  public String getContentType() throws Exception
  { return m_urlConn.getContentType(); }

  /**
   * gets the URLConnection object
   * 
   * @return the URLConnection object
   */
  public URLConnection getUrlConnection()
  { return m_urlConn; }

  
  /**
   * Get the content object at this URL
   * 
   * @return
   * @throws Exception
   */
  public Object getContent() throws Exception
  {  return m_urlConn.getContent();  }

  
  /**
   * Attempts to read the content into a String
   * 
   * @return The content read into a String or null if the content type can not be a String
   * 
   * @throws Exception
   */
  public String getContentAsString() throws Exception
  {
    Object objContent = m_urlConn.getContent();

    StringBuffer sb = new StringBuffer();

    if ( objContent instanceof InputStream )
    {
      InputStream ins = (InputStream)objContent;

      String strEncoding = getRespHeader( "Content-Encoding" );

      if ( strEncoding != null && strEncoding.equalsIgnoreCase( "gzip" ) )
        ins = new GZIPInputStream( ins  );

      byte[] abData = new byte[BLOCKSIZE];

      while ( true )
      {
        int nGot = ins.read( abData, 0, BLOCKSIZE );

        if ( nGot <= 0 )
          break;

        sb.append( new String( abData, 0, nGot ) );

      } // end while()
      
      return sb.toString();
    }
    else
    if ( objContent instanceof String )
      return (String)objContent;
    
    return null;  // Can't get a String from this content

  } // end getContentAsString()
  
  
}// end class VwURLReader()

// *** End VwURLReader.java ***

