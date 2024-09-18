/*
============================================================================================
 
                                Copyright(c) 2000 - 2006 by

                       V o z z W a r e   L L C (Vw)

                                   All Rights Reserved

THIS PROGRAM IS PROVIDED UNDER THE TERMS OF THE Vozzware LLC PUBLIC LICENSE VER 1.0 (�AGREEMENT�),
PROVIDED WITH THIS PROGRAM. ANY USE, REPRODUCTION OR DISTRIBUTION OF THE PROGRAM
CONSTITUTES RECEIPIENTS ACCEPTANCE OF THIS AGREEMENT.

Source Name: VwHttpReader.java

============================================================================================
*/

package com.vozzware.http;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.ResourceBundle;
import java.util.zip.GZIPInputStream;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import com.vozzware.util.VwDelimString;

public class VwHttpReader
{

  private InputStream         m_in;                 // Stream to read an HTTP request

  private Map                 m_mapHdrValues;

  private ResourceBundle      m_msgs;               // ResourceBundle used for messaging

  private long                m_lBytesRead = 0;     // Bytes read on input

  private String              m_strHttpHeader;      // Holds complete http header sent

  private HttpServletRequest  m_httpServletReq;

  private static final int BLOCKSIZE = 16384;	// Chunk size to read

  /**
   * Constructs an httpclient session handler
   *
   * @param in The inputstream to read from
   * @param msgs message bundle or null for default
   */
  public VwHttpReader( InputStream in, ResourceBundle msgs ) throws Exception
  {
    m_in = in;
    m_msgs = msgs;

    if ( m_msgs == null )
    {
      m_msgs = ResourceBundle.getBundle( "resources.properties.httpmsgs" );
    }

    getRequest();
    

  } // end VwHttpReader()


  public VwHttpReader( HttpServletRequest httpServletReq, ResourceBundle msgs ) throws Exception
  {

    if ( m_msgs == null )
    {
      m_msgs = ResourceBundle.getBundle( "resources.properties.httpmsgs" );
    }

    m_httpServletReq = httpServletReq;
    m_msgs = msgs;
    m_in = m_httpServletReq.getInputStream();
    
  }
  
  /**
   * Gets the content Type
   */
  public String getContentType()
  { 
    if ( m_httpServletReq != null )
    {
      return m_httpServletReq.getContentType();
    }
    
    return (String)m_mapHdrValues.get( "content-type" );
    
  } // end getCOntentType()


  /**
   * Gets the HTTP response code
   */
  public String getResponseCode()
  { return (String)m_mapHdrValues.get( "respcode" ); }

  /**
   * Gets the content length
   */
  public int getContentLength()
  {
    if ( m_httpServletReq != null )
    {
      return m_httpServletReq.getContentLength();
    }
    
    String str = (String)m_mapHdrValues.get( "content-length" );

    if ( str == null )
    {
      return 0;
    }

    return Integer.parseInt( str );
    
  } // end  getContentLength()


  /**
   * Gets the nbr of bytes read from the input stream. If this property is called just
   * following the getRequest method, the bytes read just reflects the count for the HTTP
   * headers. Tot get the total bytes read for a complete message, this property should be
   * called following a call to one of the getContent properties.
   *
   * @return a long containing the nbr of bytes read
   */
  public long getBytesRead()
  { return m_lBytesRead; }

  /**
   * Gets a request header value or null if the header key is not present.
   *
   * @param strKey The name of the request header to get
   */
  public String getHeader( String strKey )
  { 
    
    if ( m_httpServletReq != null )
    {
      return m_httpServletReq.getHeader( strKey );
    }
    
    return (String)m_mapHdrValues.get( strKey.toLowerCase() );
    
  }


  /**
   * Returns the input stream used to read the request
   */
  public InputStream getInputStream()
  { return m_in; }


  /**
   * Reads and parses the HTTP request on the InputStream provided
   */
  private void getRequest() throws Exception
  {

    final int   MSGBUFFLEN = 8092;      // HTTP Msg Buff Len

    m_strHttpHeader = "";            // Builds the complete message from client

    String      strMethodType = null;   // HTTP Method

    byte[]      abMsgBuff = new byte[ MSGBUFFLEN ];  // Buffer to hold incomming data

    int nGot = 0;
    int nOffset = 0;

    int nTot = 0;
    int ch = 0;

    // This loop gets the HTTP method
    while( true )
    {

      ch = m_in.read();
      if ( ch < 0 )
      {
        break;
      }

      ++m_lBytesRead;

      if ( ch == ' ' )
      {
        break;        // got our method type
      }

      m_strHttpHeader += (char)ch;   // Concat to our msg buffer

    } // end while()

    if ( ch < 0 )
    {
      throw new IOException( "Socket Read Error" );
    }

    strMethodType = m_strHttpHeader;

    m_strHttpHeader += " ";   // add back in the space character we just read

    // *** POST, M_POST and PUT have diferent stream requirements for parameter data

    if ( strMethodType.equalsIgnoreCase( "PUT" )  ||
         strMethodType.equalsIgnoreCase( "POST" )  ||
         strMethodType.equalsIgnoreCase( "M-POST" ) ||
         strMethodType.startsWith( "HTTP/" ) ||
         strMethodType.startsWith( "HTTPS/" ) )
    {
      nOffset = 0;

      while( true )
      {
        // *** Read up to the end of the header \r\n\r\n sequence,
        // *** the rest of the bytes will be used
        // *** the servlet input streams

        byte b = (byte)m_in.read();
        abMsgBuff[ nOffset++ ] = b;  // Add to buffer

        ++m_lBytesRead;

        if ( b == '\n' )
        {
          // if the next character is a '\r' we got the header

          b = (byte)m_in.read();
          abMsgBuff[ nOffset++ ] = b;

          if ( b == '\r' )           // Got complete header
          {
            abMsgBuff[ nOffset++ ] = (byte)m_in.read();    // Get the '\n' to complete header
            break;
          }

        } // ed if ( b== '\n' )

      } // end while()

      // Add the rest of the HTTP header in the array to the msg buffer

      m_strHttpHeader += new String( abMsgBuff, 0, nOffset );

    } // end if strMethodType.equalsIgnoreCase( "PUT" ) ... )
    else
    {
      // *** This loop is for all other HTTP requests that don't have content data

      while ( true )
      {
        nGot = 0;
        nOffset = 0;

        int nLen = m_in.read( abMsgBuff  );
        if ( nLen < 0 )      // EOF on stream, get out
          break;

        nGot += nLen;

        m_lBytesRead += nLen;

        // *** Concat to our string buffer

        m_strHttpHeader += new String( abMsgBuff, 0, nLen );

        // *** Look for end of request header e

        int nEndPos = m_strHttpHeader.indexOf( "\r\n\r\n", nOffset );

        if ( nEndPos >= 0 )
        {
          break;
        }

        // Add what we just got to our offset

        nOffset += nLen;

      } // end while

      abMsgBuff = null;


    } // end else


    VwHttpHeaderParser headerParser = new VwHttpHeaderParser( m_strHttpHeader );
    m_mapHdrValues = headerParser.getHdrValues();

    return;

  } // end getRequest


  /**
   * Returns the complete HTTP header read on the input stream
   */
  public String getHttpHeader()
  { return m_strHttpHeader; }


  /**
   * Returns the complete HTTP header values parsed as name/value objects in a Map
   */
  public Map getHttpHeaderMap()
  { return m_mapHdrValues; }


  /**
   * Returns the query string paramters as a Map of name value pairs
   *
   * @return a Map of query string paramters or null if no query string specified
   */
  public Map getQueryStringParams()
  {
    String strQString = null;
    
    if ( m_httpServletReq != null )
    {
      strQString = m_httpServletReq.getQueryString();
    }
    else
    {
      strQString = (String) m_mapHdrValues.get( "query_string" );
    }
    
    Map mapParams = null;


    if ( strQString != null )
    {
      mapParams = new HashMap();

      VwDelimString dlms = new VwDelimString( "&", strQString );
      String[] astr = dlms.toStringArray();

      for ( int x = 0; x < astr.length; x++ )
      {
        int nPos = astr[ x ].indexOf( '=' );

        mapParams.put( astr[ x ].substring( 0, nPos ), astr[ x ].substring( ++nPos ) );
      }

    }

    return mapParams;
  }

  /**
   * Returns content as a string
   *
   * @return Http content as a string
   */
  public String getContentAsString() throws Exception, IOException
  {
    if ( getContentLength() <= 0 )
    {
      String strContentType = getContentType();

      if ( strContentType != null && strContentType.startsWith( "text" ) )
      {
        return readStringContent();
      }

    }

    return new String( getContentAsBytes() );

  }


  /**
   * Returns content as a byte array
   *
   * @return Http content as a byte array
   */
  public byte[] getContentAsBytes() throws Exception, IOException
  {
    if ( m_in == null )
    {
      throw new Exception( m_msgs.getString( "Vw.Http.InputStreamNotAvail")  );
    }


    int nNeed = getContentLength();

    if ( nNeed <= 0 )
    {
      return getUnknownLenContent();
    }

    int nGot = nNeed;

    int nOffset = 0;

    byte[] abContent = new byte[ nNeed  ];

    while ( nNeed > 0 )
    {
      nGot = m_in.read( abContent, nOffset, nNeed );

      if ( nGot <= 0 )
      {
        break;
      }

      m_lBytesRead += nGot;

      nOffset += nGot;

      nNeed -= nGot;

    } // end while

    return abContent;

  } // end getContentAsBytes()


  /**
   * Reads a byte at a time from the input stream looking for
   */
  private byte[] getUnknownLenContent() throws Exception
  {
    StringBuffer sb = new StringBuffer( 1024 );

    while( true )
    {
      // *** Read up to the end of the header \r\n\r\n sequence,
      // *** the rest of the bytes will be used
      // *** the servlet input streams

      int n = m_in.read();

      if ( n < 0 )
      {
        break;
      }

      ++m_lBytesRead;

      sb.append( (char)n );

    } // end while()

    return sb.toString().getBytes();

  } // end


  public String readStringContent() throws Exception
  {


    String strEncoding = m_httpServletReq.getHeader( "Content-Encoding" );
    StringBuffer sb = new StringBuffer( );

    if ( strEncoding != null && strEncoding.equalsIgnoreCase( "gzip" ) )
    {
      m_in = new GZIPInputStream( m_in  );
    }

    byte[] abData = new byte[BLOCKSIZE];

    while ( true )
    {
      int nGot = m_in.read( abData, 0, BLOCKSIZE );

      if ( nGot <= 0 )
      {
        break;
      }

      sb.append( new String( abData, 0, nGot ) );

    } // end while()

    return sb.toString();

  }




  /**
   * Gets any cookies associated with this request
   *
   * @return an array of Cookie objects if any cookies exist or null
   */
  public Cookie[] getCookies()
  {

    if ( m_httpServletReq != null )
    {
      return m_httpServletReq.getCookies();
    }

    String strCookie = (String)m_mapHdrValues.get( "cookie" );

    if ( strCookie == null )
    {
      return null;
    }

    VwDelimString dlmsCookie = new VwDelimString( ";", strCookie );

    String[] astrCookies = dlmsCookie.toStringArray();

    Cookie[] aCookies = new Cookie[ astrCookies.length ];

    for ( int x = 0; x < astrCookies.length; x++ )
    {
      // *** Find = sign for name / value pair

      int nPos = astrCookies[ x ].indexOf( '=' );
      if ( nPos < 0 )     // Invalid syntax
      {
        continue;         // Skip to next entry
      }

      // *** Creat cookie object form name value pair

      aCookies[ x ] = new Cookie( astrCookies[ x ].substring( 0, nPos ).trim(),
                                  astrCookies[ x ].substring( nPos + 1 ).trim() );

      // *** Look for attributes

      nPos = astrCookies[ x ].indexOf( ';' );

      if ( nPos <= 0 )
      {
        continue;        // All done
      }

      int nEndPos = 0;
      int nPosEq = 0;

      int nValuePos = astrCookies[ x ].indexOf( "Comment", nPos );

      if ( nValuePos >= 0 )
      {
        nEndPos = astrCookies[x ].indexOf( ' ', nValuePos ); // Space terminates
        if ( nEndPos < 0 )
        {
          nEndPos = astrCookies[ x ].length();            // Might be last oone defined
        }

        nPosEq = astrCookies[ x ].indexOf( '=', nValuePos );
        if ( nPosEq < 0 )
        {
          continue;            // Mal formed cookie
        }

        aCookies[ x ].setComment( astrCookies[ x ].substring( nPosEq + 1, nEndPos ).trim() );

      }


      nValuePos = astrCookies[ x ].indexOf( "Domain", nPos );

      if ( nValuePos >= 0 )
      {
        nEndPos = astrCookies[x ].indexOf( ' ', nValuePos ); // Space terminates
        if ( nEndPos < 0 )
        {
          nEndPos = astrCookies[ x ].length();            // Might be last oone defined
        }

        nPosEq = astrCookies[ x ].indexOf( '=', nValuePos );
        if ( nPosEq < 0 )
        {
          continue;            // Mal formed cookie
        }

        aCookies[ x ].setDomain( astrCookies[ x ].substring( nPosEq + 1, nEndPos ).trim() );

      }

      nValuePos = astrCookies[ x ].indexOf( "Max-Age", nPos );

      if ( nValuePos >= 0 )
      {
        nEndPos = astrCookies[x ].indexOf( ' ', nValuePos ); // Space terminates
        if ( nEndPos < 0 )
        {
          nEndPos = astrCookies[ x ].length();            // Might be last oone defined
        }

        nPosEq = astrCookies[ x ].indexOf( '=', nValuePos );
        if ( nPosEq < 0 )
        {
          continue;            // Mal formed cookie
        }

         int nAge = 0;

        try
        {
          nAge = Integer.parseInt( astrCookies[ x ].substring( nPosEq + 1, nEndPos ).trim() );
        }
        catch( Exception e )
        {
          continue;     // Value not numeric
        }

        aCookies[ x ].setMaxAge( nAge );

      }


      nValuePos = astrCookies[ x ].indexOf( "Path", nPos );

      if ( nValuePos >= 0 )
      {
        nEndPos = astrCookies[x ].indexOf( ' ', nValuePos ); // Space terminates
        if ( nEndPos < 0 )
        {
          nEndPos = astrCookies[ x ].length();            // Might be last oone defined
        }

        nPosEq = astrCookies[ x ].indexOf( '=', nValuePos );
        if ( nPosEq < 0 )
        {
          continue;            // Mal formed cookie
        }

        aCookies[ x ].setPath( astrCookies[ x ].substring( nPosEq + 1, nEndPos ).trim() );

      }


      nValuePos = astrCookies[ x ].indexOf( "Secure", nPos );

      if ( nValuePos >= 0 )
      {
        aCookies[ x ].setSecure( true );

      }

      nValuePos = astrCookies[ x ].indexOf( "Version", nPos );

      if ( nValuePos >= 0 )
      {
        nEndPos = astrCookies[x ].indexOf( ' ', nValuePos ); // Space terminates
        if ( nEndPos < 0 )
        {
          nEndPos = astrCookies[ x ].length();            // Might be last oone defined
        }

        nPosEq = astrCookies[ x ].indexOf( '=', nValuePos );
        if ( nPosEq < 0 )
        {
          continue;            // Mal formed cookie
        }

         int nVer = 0;

        try
        {
          nVer = Integer.parseInt( astrCookies[ x ].substring( nPosEq + 1, nEndPos ).trim() );
        }
        catch( Exception e )
        {
          continue;     // Value not numeric
        }

        aCookies[ x ].setVersion( nVer );

      }

    } // end for()

    astrCookies = null;

    return aCookies;      // Return the cookie array

  } // end getCookies


} // end class VwHttpReader{}

// *** End VwHttpReader.java ***



