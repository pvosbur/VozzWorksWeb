/*
============================================================================================
 
                                Copyright(c) 2000 - 2006 by

                       V o z z W a r e   L L C (Vw)

                                   All Rights Reserved

THIS PROGRAM IS PROVIDED UNDER THE TERMS OF THE Vozzware LLC PUBLIC LICENSE VER 1.0 (�AGREEMENT�),
PROVIDED WITH THIS PROGRAM. ANY USE, REPRODUCTION OR DISTRIBUTION OF THE PROGRAM
CONSTITUTES RECEIPIENTS ACCEPTANCE OF THIS AGREEMENT.

Source Name: VwHttpHeaderParser.java

============================================================================================
*/

package com.vozzware.http;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.vozzware.util.VwBase64;
import com.vozzware.util.VwDelimString;

public class VwHttpHeaderParser
{

  private Map   m_mapHttpMsgValues;       // Hastable of the General and request header values

  // Array of Request header keywords

  static String[] m_astrReqHdrs = { "Accept", "Accept-Charset", "Accept-Encoding",
                                    "Accept-Language", "Authorization", "From",
                                    "Host", "If-Modified-Since", "If-Match",
                                    "If-None-Match", "If-Range", "If-Unmodified-Since",
                                    "Max-Forwards", "Proxy-Authorization", "Range",
                                    "Referer", "User-Agent"
                                 };


  /**
   * Class Constructor
   */

  VwHttpHeaderParser( String strMsg ) throws IOException
  {

    m_mapHttpMsgValues = new HashMap();

    newMsg( strMsg );

    return;

   } // end BVwHttpHeaderParser()


  /**
   * Gets the data for the key specified
   *
   * @param strKey The key of the data to retireve
   *
   * @return a String containg the data for the key or null if the key does not exists
   */
  public String get( String strKey )
  { return (String)m_mapHttpMsgValues.get( strKey ); }


  /**
   * Gets the map of http header values
   */
  public Map getHdrValues()
  { return m_mapHttpMsgValues; }


  /**
   * Gets the contentent type
   */
  /**
   * Parses the incomming http message into name valuee (key/object) pairs in a hashtable
   *
   * @param strMsg - The message to parse
   *
   * @exception IOException if a protocol error occurs
   */
  void newMsg( String strMsg ) throws IOException
  {
    //System.out.println( strMsg );   // For debugging

    // *** Determine Method type

    String strMsgBody = null;
    String strPiece = null;

    VwDelimString strParams = null;

    int nPosMethod = strMsg.indexOf( ' ' );

    if ( nPosMethod < 0 )                             // Invalid URL Request
      throw new IOException();

    String strMethodType = strMsg.substring( 0, nPosMethod );
    strParams = new VwDelimString( "\r\n", strMsg );

    if ( strMethodType.startsWith( "HTTP" ) )   // This is a response message
    {
      String strVersion = strMethodType.substring( 5 );

      if ( strVersion == null )
        throw new IOException( "HTTP Version Expected" );

      int nPos = strVersion.indexOf( '.' );

      if ( nPos >= 0 )
      {
        m_mapHttpMsgValues.put( "majver", strVersion.substring( 0, nPos ) );
        m_mapHttpMsgValues.put( "minver", strVersion.substring( nPos + 1 ) );
      }

      else
      {
        m_mapHttpMsgValues.put( "majver", strVersion );
        m_mapHttpMsgValues.put( "minver", "0" );
      }

      strPiece = strParams.getNext();

      if ( strPiece == null )
        throw new IOException( "Invalid HTTP Header");

      int nLen = strPiece.length();


      if ( nPosMethod <= 0 )
        throw new IOException( "Invalid HTTP Header");

      String strRespCode = strPiece.substring( nPosMethod + 1, nPosMethod + 4 );
      m_mapHttpMsgValues.put( "respcode", strRespCode );
      m_mapHttpMsgValues.put( "respdesc", strPiece.substring( nPosMethod + 5 ) );


    }
    else
    {
      // *** Parse Paramater string First param acct nbr is required, 2cd ( effective date is optional )

      // *** First component is the request line -- Must start with GET, HEAD, PUT

      strPiece = strParams.getNext();

      if ( strPiece == null )
        throw new IOException( "Invalid HTTP Header" );


      VwDelimString strLine = new VwDelimString(" ", strPiece );

      String strEntry = strLine.getNext();

      if ( strEntry == null )
        throw new IOException();

      m_mapHttpMsgValues.put( "method", strEntry );

      strEntry = strLine.getNext();

      if ( strEntry == null )
        throw new IOException();


      // *** NOTE! if file name is HTTP then no file name was passed meaning use the default htm defined file
      // *** Set the file name to NULL;

      if ( strEntry.equals( "/" ) )
        strEntry = "";
      else
      {
        int nQueryPos = strEntry.indexOf( '?' );

        if ( nQueryPos > 0 )
        {
          m_mapHttpMsgValues.put( "query_string", strEntry.substring( nQueryPos + 1 ) );
          strEntry = strEntry.substring( 0, nQueryPos );
        } // end if

      } // end else

      m_mapHttpMsgValues.put( "uri", strEntry );


      strEntry = strLine.getNext();

      if ( strEntry == null || !strEntry.startsWith( "HTTP" )  )
        throw new IOException();


      strEntry = strEntry.substring( 5 );

      if ( strEntry == null )
        throw new IOException();

      int nPos = strEntry.indexOf( '.' );

      if ( nPos >= 0 )
      {
        m_mapHttpMsgValues.put( "majver", strEntry.substring( 0, nPos ) );
        m_mapHttpMsgValues.put( "minver", strEntry.substring( nPos + 1 ) );
      }

      else
      {
        m_mapHttpMsgValues.put( "majver", strEntry );
        m_mapHttpMsgValues.put( "minver", "0" );
      }
    }


    // *** Get the rest of any hdr attributes

    while ( (strPiece = strParams.getNext() ) != null  )
    {

      int nPos = strPiece.indexOf( ':' );

      if ( nPos < 0 )
        throw new IOException( "Incorrect Header entry: " + strPiece );

      m_mapHttpMsgValues.put( strPiece.substring( 0, nPos ).toLowerCase(), strPiece.substring( nPos + 1 ).trim() );


    } // end  while()


    return;

  } // end newMsg()


  /**
   * Returns an Iterator class to enumerate the request headers found in this client request
   */
  public Iterator getRequestHeaders()
  { return m_mapHttpMsgValues.keySet().iterator(); }


  /**
   *
   */
  public String getUidPwd( String strAuthorize )
  {
    int nPos = strAuthorize.indexOf( "Basic" );
    if ( nPos < 0 )
      return null;              // Not a valid response

    nPos += "Basic".length();

    String strbase64 = strAuthorize.substring( nPos );
    return new String( VwBase64.decode( strbase64.getBytes() ) );

  } // end getUidPwd()


} // end class VwHttpHeaderParser{}

// *** End VwHttpHeaderParser.java ***

