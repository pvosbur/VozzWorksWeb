/*
============================================================================================
 
                                Copyright(c) 2000 - 2006 by

                       V o z z W a r e   L L C (Vw)

                                   All Rights Reserved

THIS PROGRAM IS PROVIDED UNDER THE TERMS OF THE Vozzware LLC PUBLIC LICENSE VER 1.0 (�AGREEMENT�),
PROVIDED WITH THIS PROGRAM. ANY USE, REPRODUCTION OR DISTRIBUTION OF THE PROGRAM
CONSTITUTES RECEIPIENTS ACCEPTANCE OF THIS AGREEMENT.

Source Name: VwHttpWriter.java

============================================================================================
*/

package com.vozzware.http;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.ResourceBundle;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import com.vozzware.util.VwExString;

/**
 * This class formats an HTTP response or an error reponse base on the
 * reponse header catagories inserted by the user. The default HTTP version is 1.1
 * if it is not specified. The default scheme is HTTP if none is specified
 */
public class VwHttpWriter
{

  private Map   m_mapOptionalHdrValues;  // HashMap of the optional HTTP response heaader values
  private Map   m_mapRequiredHdrValues;  // HashMap of the required HTTP response heaader values

  private HttpServletResponse m_resp;
  
  private OutputStream        m_outStream;      // Original OutputStream
  private PrintStream         m_printStream;    // PrintStream for writing

  private ResourceBundle      m_msgs = null;    // String resource for messages

  private int                 m_nRetryCount = 3;

  private String              m_strHttpHeader;   // Complete Http header that was sent on the output stream

  private static int[]  m_anRespCodes = { 100,101,200,201,202,203,204,205,206,300,301,302,
                                          303,304,305,400,401,402,403,404,405,406,407,408,
                                          409,410,411,412,413,414,415,500,501,502,503,504,505
                                        };
  private static String[] m_astrRespDesc = { "Continue","Switching Protocols","OK","Created",
                                             "Accepted","Non-Authoritative Information",
                                             "No Content","Reset Content","Partial Content",
                                             "Multiple Choices","Moved Permanently",
                                             "Moved Temporarily","See Other","Not Modified",
                                             "Use Proxy","Bad Request","Unauthorized",
                                             "Payment Required","Forbidden","Not Found",
                                             "Method Not Allowed","Not Acceptable",
                                             "Proxy Authentication Required","Request Time-out",
                                             "Conflict","Gone","Length Required",
                                             "Precondition Failed","Request Entity Too Large",
                                             "Request-URI Too Large", "Unsupported Media Type",
                                             "Internal Server Error", "Not Implemented",
                                             "Bad Gateway","Service Unavailable",
                                             "Gateway Time-out", "HTTP Version not supported"
                                           };

  private long  m_lBytesWritten = 0;

  public VwHttpWriter( OutputStream outs )
  {
    this( outs, ResourceBundle.getBundle( "resources.properties.httpmsgs" ) )                                         ;

  }


  public VwHttpWriter( OutputStream outs, ResourceBundle msgs )
  {
    m_msgs = msgs;

    m_outStream = outs;

    m_printStream = new PrintStream( outs );


    // *** Insert defualt values

    m_mapOptionalHdrValues = new HashMap();
    m_mapRequiredHdrValues = new HashMap();

    m_mapRequiredHdrValues.put( "scheme", "HTTP" );

    m_mapRequiredHdrValues.put( "majver", "1" );  // Default major version nbr
    m_mapRequiredHdrValues.put( "minver", "1" );  // Default minor version nbr

    setResponseCode( 200, null );                 // Default code of 200 OK


  } // end constructor


  public VwHttpWriter( HttpServletResponse resp, ResourceBundle msgs ) throws Exception
  {
    this( resp.getOutputStream(), msgs );
    
    m_resp = resp;
    
  }
  
  /**
   * Gets the nbr of bytes written to the output stream. If this property is called just
   * following the sendRequest or sendResponse method, the bytes written just reflects the
   * count for the HTTP headers sent only. To get the total bytes written for a complete message,
   * this property should be called following a call to one of the sendContent properties.
   *
   * @return a long containing the nbr of bytes written
   */
  public long getBytesWritten()
  { return m_lBytesWritten; }


  /**
   * Sets the http response code and description
   *
   * @param nRespCode The response code nbr
   * @param strDesc The response desc
   */
  public final void setResponseCode( int nRespCode, String strDesc )
  {
    if ( strDesc == null )
    {
      strDesc = getErrDesc( nRespCode );
      if ( strDesc == null )
        strDesc = "Unknown Reason";
    }

    if ( m_resp != null )
      m_resp.setStatus( nRespCode );
    
    m_mapRequiredHdrValues.put( "respcode", String.valueOf( nRespCode )
                                            + " " + strDesc );

  } // end setResponseCode()


  /**
   * Change the HTTP scheme FROM HTTP to another type
   *
   * @param  String strScheme The new scheme
   */
  public final void setScheme( String strScheme )
  { m_mapRequiredHdrValues.put( "scheme", strScheme ); }


  /**
   * Change the defualt HTTP major version number to a different number
   *
   * @param  nMajVerNbr
   */
  public final void setMajVerNbr( int nVerNbr )
  { m_mapRequiredHdrValues.put( "majver", String.valueOf( nVerNbr ) ); }



  /**
   * Change the defualt HTTP major version number to a different number
   *
   * @param  nMajVerNbr
   */
  public final void setMinVerNbr( int nVerNbr )
  { m_mapRequiredHdrValues.put( "minver", String.valueOf( nVerNbr ) ); }


  /**
   * Returns the OutputStream
   */
  public final OutputStream getOutputStream()
  { return m_outStream; }

  /**
   * Sets the Content-Type of the response data
   *
   * @param  The new Content type to apply
   */
  public final void setContentType( String strContentType )
  { m_mapOptionalHdrValues.put( "Content-Type", strContentType ); }


  /**
   * Gets the current set content type
   *
   * @return  The current ContentType setting
   */
  public final String getContentType()
  { return (String)m_mapOptionalHdrValues.get( "Content-Type" ); }


  /**
   * Sets the Content-Length header entry
   *
   * @param  nLen The content length
   */
  public final void setContentLength( int nLen )
  { m_mapOptionalHdrValues.put( "Content-Length", String.valueOf( nLen ) ); }


  /**
   * Gets the Content-Length header entry
   *
   * @return The content length or zero if the content length has not been set
   */
  public final int getContentLength()
  {
    String strLen = (String)m_mapOptionalHdrValues.get( "Content-Length" );
    if ( strLen == null )
      return 0;

    return Integer.parseInt( strLen );

  } // end getContentLength()


  /**
   * Adds additional Http reponde header entries. The string is assumed to be a valid
   * recognized header value I.E Host,  Last-Modified ....
   *
   * @param strHdrName The HTTP response name key I.E Host, Last-Modified
   * @param strValue The header value
   */
  public final void addHeader( String strHdrName, String strValue )
  {
    // Strip off the colan if specified

    int nPos = strHdrName.indexOf( ':' );
    if ( nPos > 0 )
      strHdrName = strHdrName.substring( 0, nPos );

    m_mapOptionalHdrValues.put( strHdrName, strValue );

  }

  /**
   * Gets value for the header specified
   *
   * @param strHdrName The HTTP response name key I.E Host, Last-Modified
   *
   * @return the value of the header if it exists or null otherwise
   */
  public final String getHeader( String strHdrName )
  {
    // Strip off the colan if specified

    int nPos = strHdrName.indexOf( ':' );
    if ( nPos > 0 )
      strHdrName = strHdrName.substring( 0, nPos );

    String strVal = (String)m_mapOptionalHdrValues.get( strHdrName );

    if ( strVal == null )
      strVal = (String)m_mapRequiredHdrValues.get( strHdrName );

    return strVal;

  } // end getHeader()


  /**
   * Adds a cookie to the response
   *
   * @param cookie The cookie clas containg the cookie data
   */
  public final void addCookie( Cookie cookie )
  {
    if ( m_resp != null )
    {
      m_resp.addCookie( cookie );
      return;
      
    }
    
    // *** Get current cookie setting if any
    String strCookie = (String)m_mapOptionalHdrValues.get( "Set-Cookie" );

    if ( strCookie == null )
    {
      strCookie = " ";
    }
    else
    {
      // Remove existing CR/LF to be replaced after this entry
      strCookie = VwExString.remove( strCookie, "\r\n" );
      strCookie += ", ";
    } // end else

    strCookie += cookie.getName() + "=" + cookie.getValue();

    boolean fGotSemiColan = false;

    String strVal = cookie.getComment();

    if ( strVal != null )
    {
      if ( !fGotSemiColan )
      {
        fGotSemiColan = true;
        strCookie += "; ";
      }

      strCookie += "Comment=" + strVal + " ";
    }

    strVal = cookie.getDomain();

    if ( strVal != null )
    {
      if ( !fGotSemiColan )
      {
        fGotSemiColan = true;
        strCookie += "; ";
      }

      strCookie += "Domain=" + strVal + " ";
    }


    int nAge = cookie.getMaxAge();
    if ( nAge > 0 )
     strVal = String.valueOf( nAge );
    else
     strVal = null;

    if ( strVal != null )
    {
      if ( !fGotSemiColan )
      {
        fGotSemiColan = true;
        strCookie += "; ";
      }

      strCookie += "Max-Age=" + strVal + " ";
    }

    strVal = cookie.getPath();

    if ( strVal != null )
    {
      if ( !fGotSemiColan )
      {
        fGotSemiColan = true;
        strCookie += "; ";
      }

      strCookie += "Path=" + strVal + " ";
    }


    if ( cookie.getSecure() )
    {
      if ( !fGotSemiColan )
      {
        fGotSemiColan = true;
        strCookie += "; ";
      }
      strCookie += "Secure ";
    }


    int nVer = cookie.getVersion();
    if ( nVer > 0 )
      strVal = String.valueOf( nVer );
    else
      strVal = null;

    if ( strVal != null )
    {
      if ( !fGotSemiColan )
      {
        fGotSemiColan = true;
        strCookie += "; ";
      }

      strCookie += "Version=" + strVal + " ";
    }

    // *** Add in final cr/lf for end of this entry

    strCookie += "\r\n";

    // *** Set the cookie

    m_mapOptionalHdrValues.put( "Set-Cookie", strCookie );

  } // end addCookie()


  /**
   * This method formats and sends the http response hdr based on the values
   * specified
   *
   * @exception IOException if s stream error occurs
   */
  public void sendResponse() throws IOException
  {
    if ( m_resp != null )
    {
      formatHeaders();
      return;
      
    }
    
    m_strHttpHeader = m_mapRequiredHdrValues.get( "scheme" ) + "/"
                    + m_mapRequiredHdrValues.get( "majver" )
                    + "."
                    + m_mapRequiredHdrValues.get( "minver" )
                    + " ";
    String strValue = (String)m_mapRequiredHdrValues.get( "respcode" );

    if ( strValue == null )
      throw new IOException( m_msgs.getString( "MissingHttpRespCode" ) );

    m_strHttpHeader += strValue + "\r\n";

    m_strHttpHeader += formatHeaders();

    sendHeader();


  } // end sendResponse()


  /**
   * This method formats and sends the http response hdr based on the values
   * specified
   *
   * @exception IOException if s stream error occurs
   */
  public void sendRequest( String strReqType, String strURI ) throws IOException
  {
    m_strHttpHeader = strReqType + " " + strURI + " "
                    + m_mapRequiredHdrValues.get( "scheme" ) + "/"
                    + m_mapRequiredHdrValues.get( "majver" )
                    + "."
                    + m_mapRequiredHdrValues.get( "minver" )
                    + "\r\n";

    m_strHttpHeader += formatHeaders();

    sendHeader();


  } // end sendRequest()


  /**
   *
   */
  private void sendHeader() throws IOException
  {

    // Send the HTTP header

    int nFailCount = 0;

    while ( true )
    {
      try
      {
        m_lBytesWritten += m_strHttpHeader.length();

        m_outStream.write( m_strHttpHeader.getBytes() );
        break;
      }
      catch( IOException iox )
      {

        String strReason = iox.toString();
        if ( ( strReason.indexOf( "reset" ) >= 0 ) || ( ++nFailCount > m_nRetryCount ) )
        {
          throw iox;
        }

        // Otherwise retry the write
        try
        {
          Thread.sleep( 10 );
          continue;
        }
        catch( Exception e )
        {}

      } // end catch( IOException iox

    } // end while()

  }  // end sendHeader()

  /**
   * Returns the complete HTTP header that was sent on the output stream
   */
  public String getHttpHeader()
  { return m_strHttpHeader; }

  /**
   * Sends content data on the stream.
   *
   * @param strContent The content data as a String
   */
  public void sendContent( String strContent ) throws IOException
  {
    m_lBytesWritten += strContent.length();
    if ( m_strHttpHeader != null )
      m_printStream.print( m_strHttpHeader );
    
    m_printStream.print( strContent );
    m_printStream.flush();

  } // end sendContent()


  /**
   * Sends content data on the stream.
   *
   * @param abContent The content data as an array of bytes
   */
  public void sendContent( byte[] abContent ) throws IOException
  {
    m_lBytesWritten += abContent.length;
    m_outStream.write( abContent );
    m_outStream.flush();
  } // end sendContent()


  /**
   * This method formats and sends and html body error message response
   *
   * @param nErrCode The error code nbr
   * @param strErrCodeDesc The short reponse line eror code desc. This will also be
   * the html title
   * @param strHtmlHdrReason an optional more verboce reason. If null short
   * desc. will be used
   *
   * @exception IOException if s stream error occurs
   */
  public void sendHtmlError( int nErrCode, String strErrCodeDesc, String strHtmlHdrReason )
    throws IOException
  {

    if ( strErrCodeDesc == null )
      strErrCodeDesc = getErrDesc( nErrCode );

    String strHtml = "<HTML><TITLE>" + strErrCodeDesc + "</TITLE>\r\n<H1>";

    if ( strHtmlHdrReason != null )
      strHtml += strHtmlHdrReason;
    else
      strHtml += strErrCodeDesc;

    strHtml += "</H1>\r\n</HTML>";

    String strResp = m_mapRequiredHdrValues.get( "scheme" ) + "/"
                   + m_mapRequiredHdrValues.get( "majver" )
                   + "."
                   + m_mapRequiredHdrValues.get( "minver" )
                   + " "
                   + String.valueOf( nErrCode )
                   + " "
                   + strErrCodeDesc
                   + "\r\n"
                   + "Content-Type:text/html\r\n"
                   + "Content-Length:"
                   + String.valueOf( strHtml.length() )
                   + "\r\n\r\n"
                   + strHtml;

    m_printStream.print( strResp );

  } // end sendHtmlError()


  /**
   * Gets the HTTP error description for a given error code
   *
   * @param nErrCode the error code nbr to retrieve the description for
   *
   * @return The error description ofr the error code nbr or null if error code is
   * undefined
   */
  public static String getErrDesc( int nErrCode )
  {
    for ( int x = 0; x < m_anRespCodes.length; x++ )
    {
      if ( m_anRespCodes[ x ] == nErrCode )
        return m_astrRespDesc[ x ];

    }

    return null;      // Not Found

  } // end getErrDesc()

  /**
   * Formats the HTTP header
   */
  private String formatHeaders() throws IOException
  {
    String strHeaders = "";

    Iterator iRespHdrs = m_mapOptionalHdrValues.keySet().iterator();

    while( iRespHdrs.hasNext() )
    {
      String strHdrName = (String)iRespHdrs.next();

      String strValue = (String)m_mapOptionalHdrValues.get( strHdrName );

      if ( strValue == null || strValue.length() == 0 )
        throw new IOException( m_msgs.getString( "MissingHttpHdrValue" )
                             + " " + strHdrName );


      if ( m_resp != null )
      {
        m_resp.setHeader( strHdrName, strValue );
        continue;
      }
      strHeaders += strHdrName + ": " + strValue + "\r\n";

    } // end while()

    if ( m_resp != null )
      return null;
    
    strHeaders += "\r\n";        // Final response header terminator

    return strHeaders;

  } // end formatHeaders()

} // end class VwHttpWriter{}

// *** End VwHttpWriter.java ***
