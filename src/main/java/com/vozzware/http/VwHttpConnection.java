/*
============================================================================================
 
                                Copyright(c) 2000 - 2006 by

                       V o z z W a r e   L L C (Vw)

                                   All Rights Reserved

THIS PROGRAM IS PROVIDED UNDER THE TERMS OF THE Vozzware LLC PUBLIC LICENSE VER 1.0 (�AGREEMENT�),
PROVIDED WITH THIS PROGRAM. ANY USE, REPRODUCTION OR DISTRIBUTION OF THE PROGRAM
CONSTITUTES RECEIPIENTS ACCEPTANCE OF THIS AGREEMENT.

Source Name: VwHttpConnection.java

============================================================================================
*/
package com.vozzware.http;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.ResourceBundle;

public class VwHttpConnection
{

  private String              m_strHost;        // Host name to connect to

  private int                 m_nPort;          // Port to use on the host

  private OutputStream        m_outStream;      // Output stream from connected socket
  private InputStream         m_inStream;       // Input stream from connected socket

  private Socket              m_soc;            // The socket connetion with the host

  private ResourceBundle      m_msgs;           // Properties message file

  /**
   * Constructs object from an existing socket connection
   *
   * @param soc a valid Socket connection
   *
   * @exception IOException if the Socket is not valid
   *
   */
  public VwHttpConnection( Socket soc ) throws IOException
  {
    m_soc = soc;

    m_outStream = m_soc.getOutputStream();
    m_inStream = m_soc.getInputStream();

  } // end VwHttpConnection()


  /**
   * Constructor Attemps to connect to the host specified using the defualt HTTP port of 80
   *
   * @param strHost The host name or ip address to connect to
   *
   * @exception Exception if any IO or other errors occur
   */
  public VwHttpConnection( String strHost ) throws Exception
  { this( strHost, 80 ); }


  /**
   * Constructor Attemps to connect to the host and port nbr specified.
   *
   * @param strHost The host name or ip address to connect to
   * @param nPort The port nbr to connect to
   *
   * @exception Exception if any IO or other errors occur
   */
  public VwHttpConnection( String strHost, int nPort ) throws Exception
  {
    m_strHost = strHost;
    m_nPort = nPort;

    m_soc = null;

    m_outStream = null;
    m_inStream = null;

    m_msgs = ResourceBundle.getBundle( "resources.properties.httpmsgs" );

  }

  /**
   * Connects to the host and port as specified in the constructor
   *
   * @exception Exception if this instance is already connected, IOEXception if the conection
   * could not be made
   */
  public void connect() throws Exception, IOException
  {
    if ( m_outStream != null )
      throw new Exception( m_msgs.getString( "Vw.Http.AlreadyConnected" ) );

    m_soc = new Socket( m_strHost, m_nPort );

    m_outStream = m_soc.getOutputStream();
    m_inStream = m_soc.getInputStream();

  } // end connect


  /**
   * Closes the current connection
   *
   */
  public void close() throws IOException
  {
    try
    {
      m_outStream.close();
      m_inStream.close();
      m_soc.close();

    }
    finally
    {
      m_soc = null;
      m_outStream = null;
      m_inStream = null;
    }

  } //end close


  /**
   * Returns an VwHttpReader for this connection if there is a valid input stream.
   *
   * @exception Exception if there is not a valid InputStream.
   */
  public VwHttpReader getReader() throws Exception
  {
    if ( m_inStream == null )
      throw new Exception( m_msgs.getString( "Vw.Http.InputStreamNotAvail" ) );

    return new VwHttpReader( m_inStream, m_msgs );

  } // end getReader()


  /**
   * Returns an VwHttpReader for this connection if there is a valid input stream.
   *
   * @exception Exception if there is not a valid InputStream.
   */
  public VwHttpWriter getWriter() throws Exception
  {
    if ( m_outStream == null )
      throw new Exception( m_msgs.getString( "Vw.Http.OutputStreamNotAvail" ) );

    return new VwHttpWriter( m_outStream, m_msgs );

  } // end getReader()

  // For Testing only

  public static void main( String[] args )
  {
    try
    {

      int nbr = -1;
      int x = -1;
      nbr = ++x % 2;
      nbr = ++x % 2;
      nbr = ++x % 2;

      File fileContent = new File( "j:\\cXML\\Examples\\ProfileRequest.xml" );

      char[] ach = new char[ (int)fileContent.length() ];

      java.io.FileReader rdr = new java.io.FileReader( fileContent );
      rdr.read( ach );

      String strContent = new String( ach );


      VwHttpConnection httpConnect = new VwHttpConnection( "localhost", 8060 );
      httpConnect.connect();
      VwHttpWriter httpWriter = httpConnect.getWriter();
      httpWriter.setContentType( "text/xml" );
      httpWriter.setContentLength( strContent.length() );
      httpWriter.sendRequest( "POST", "/OperaCXML?host=localhost&port=8070" );
      httpWriter.sendContent( strContent );
      VwHttpReader reader = httpConnect.getReader();
      strContent = reader.getContentAsString();
      System.out.println( strContent );
      return;


    }
    catch( Exception ex )
    {
      ex.printStackTrace();
    }

  }

} // end class VwHttpConnection{}

// *** End VwHttpConnection.java ***
