package com.vozzware.service.manager;


import com.vozzware.http.VwHttpReader;
import com.vozzware.util.VwEncryptionUtil;
import com.vozzware.util.VwLogger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ReadListener;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/*
============================================================================================

    Source File Name: 

    Author:           petervosburgh
    
    Date Generated:   9/21/15

    Time Generated:   9:31 AM

============================================================================================
*/
public class VwEncryptionFilter implements Filter
{
  private VwLogger m_logger;

  private static Object s_semi = new  Object();

  @Override
  public void init( FilterConfig config ) throws ServletException
  {
    try
    {
      String strPropName = config.getInitParameter( "loggerProps" );

      if ( strPropName != null )
      {
        m_logger = VwLogger.getInstance( strPropName );
      }
      else
      {
        m_logger = VwLogger.getInstance();
      }

      m_logger.info( this.getClass(), "VwEncryptionFilter activated");

    }
    catch( Exception ex )
    {
      throw new ServletException( ex.toString() );

    }

    return;
  }

  @Override
  public void doFilter( ServletRequest req, ServletResponse res, FilterChain chain ) throws ServletException, IOException
  {
    HttpServletRequest request = (HttpServletRequest) req;
    String strRequestURI = request.getRequestURI();
    String strContentType = request.getContentType();
    Map<String,String>mapHeaders = new HashMap<>( );
    Enumeration<String>eHdrs =  request.getHeaderNames();
    while( eHdrs.hasMoreElements() )
    {
      String strHdrName = eHdrs.nextElement();
       mapHeaders.put ( strHdrName, request.getHeader( strHdrName ));
    }

    // Strip off mapping path /serviceReqest

    strRequestURI = strRequestURI.substring( "/serviceReqest/".length() + 1 );

    m_logger.debug( this.getClass(), "REQUEST URI: " + strRequestURI );

    try
    {
      String strDecryptedURI = VwEncryptionUtil.deCrypt( strRequestURI );
      if ( strDecryptedURI == null )
      {
        m_logger.error( this.getClass(), "FAILED DECRYPTION: " + strRequestURI );
        return;
      }

      m_logger.debug( this.getClass(), "DECRYPTED URI: " + strDecryptedURI );

      if ( strContentType != null && strContentType.startsWith( "multipart" ))
      {
        req.getRequestDispatcher(strDecryptedURI).forward( req, new EncryptionReponseWrapper((HttpServletResponse)res ));

      }
      else
      {
        req.getRequestDispatcher(strDecryptedURI).forward( new EncryptionRequestWrapper( (HttpServletRequest)req ), new EncryptionReponseWrapper((HttpServletResponse)res ));
      }


    }
    catch( Exception ex )
    {
      m_logger.error( this.getClass(), "FILTER PROCESSING ERROR: " + strRequestURI, ex );

    }

   }

  @Override
  public void destroy()
  {
    return;
  }

  class EncryptionRequestWrapper extends HttpServletRequestWrapper
  {
    HttpServletRequest m_req;
    VwEncryptionServletStream m_vwSiStream;

    public EncryptionRequestWrapper( HttpServletRequest req  )
    {
      super( req );
      m_req = req;

    }

    public ServletInputStream getInputStream() throws IOException
    {
      m_vwSiStream = new VwEncryptionServletStream( m_req );
      return m_vwSiStream;
     }

    public int getContentLength()
    {
      try
      {

        if ( m_vwSiStream == null )
        {
          return 0;
        }

        return m_vwSiStream.getContentLength();

      }
      catch( Exception ex )
      {
        throw new RuntimeException( "Invalid Servlet input stream" );

      }

    }

  }

  class VwEncryptionServletStream extends ServletInputStream
  {
    byte[] m_abData;

    int m_ndx = -1;

    VwEncryptionServletStream( HttpServletRequest req )
    {
      super();

      try
      {

        VwHttpReader rdr = new VwHttpReader( req, null );

        String strContentType = req.getContentType();

        if ( strContentType != null && strContentType.equals( "application/octet-stream" ))
        {
          m_abData = rdr.getContentAsBytes();
          return;

        }

        String strContentData  = rdr.getContentAsString();

        if ( strContentData == null || strContentData.length() == 0 )
        {
          m_abData = null;
          return;

        }

        String strDeCrypted = VwEncryptionUtil.deCrypt( strContentData );
        if ( strDeCrypted != null )
        {
          m_abData = strDeCrypted.getBytes();
        }
        else
        {
          m_abData = null;
          m_logger.error( this.getClass(), "SERVLET STREAM ENCRYPTION ERROR: "  );

        }
      }
      catch( Exception ex )
      {
        m_abData = null;
        m_logger.error( this.getClass(), "SERVLET INPUT STREAM ERROR: " , ex );

      }
    }

    int getContentLength()
    {
      if ( m_abData == null )
      {
        return 0;

      }

      return m_abData.length;

    }

    public byte[] getAbData()
    {
      return m_abData;
    }

    @Override
    public void close() throws IOException
    {
      super.close();
      m_abData = null;

    }

    @Override
    public void setReadListener(ReadListener listener) {
      throw new RuntimeException("Not implemented");
    }

    @Override
    public boolean isFinished() {
      return m_abData == null;
    }

    @Override
    public boolean isReady() {
      return true;
    }

    @Override
    public int read() throws IOException
    {

      if ( m_abData == null )
      {
        return -1;
      }

      if ( ++m_ndx >= m_abData.length )
      {
        return -1;
      }


      return m_abData[ m_ndx ];

    }

       

    @Override
    public int read( byte[] ab ) throws IOException
    {

      if ( m_abData == null )
      {
        return -1;
      }

      if ( m_ndx < 0 )
      {
        m_ndx = 0;
      }

      int nNeed = ab.length;

      if ( (nNeed + m_ndx) >= m_abData.length )
      {
        nNeed = m_abData.length - m_ndx;
      }

      if ( nNeed > 0 )
      {
        System.arraycopy( m_abData, m_ndx, ab, 0, nNeed );
      }

      m_ndx += nNeed;

      return nNeed;
    }

}

  class EncryptionReponseWrapper extends HttpServletResponseWrapper
  {
    EncryptionWriter m_vwWriter;
    HttpServletResponse m_resp;
    EncryptionReponseWrapper( HttpServletResponse resp )
    {
      super( resp );
      m_resp = resp;
    }

    public PrintWriter getWriter() throws IOException
    {
      PrintWriter writer = m_resp.getWriter();

      m_vwWriter = new EncryptionWriter( writer, m_resp );
      return m_vwWriter;

    }
  }


  class EncryptionWriter extends PrintWriter
  {
    PrintWriter m_out;
    HttpServletResponse m_resp;

    public EncryptionWriter( PrintWriter out, HttpServletResponse resp )
    {
      super( out );
      m_out = out;
      m_resp = resp;

    }

    public void print( String strData )
    {
      String strContentType = m_resp.getContentType();

      if ( strContentType != null && strContentType.startsWith( "application/json" ) )
      {
        try
        {
          m_resp.setContentType( "application/vwencrypted-octet-stream" );
          m_logger.debug( "Encrypting data: " + strData );
          strData = VwEncryptionUtil.enCrypt( strData );

        }
        catch( Exception ex )
        {
          m_logger.error( this.getClass(), "Error Encrypting data: " + strData, ex );
        }

      }

      m_logger.debug( "PRINTING DATA: " + strData );
      m_out.print( strData );
      m_out.flush();


    }
  }
}
