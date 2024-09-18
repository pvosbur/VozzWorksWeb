package com.vozzware.service.manager;

import com.vozzware.spring.utils.VwSpringUtils;
import com.vozzware.util.VwDelimString;
import com.vozzware.util.VwLogger;
import com.vozzware.util.VwResourceMgr;
import org.springframework.jmx.export.annotation.ManagedResource;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/**
 * This servlet handles standard REST get and post requests
 * 
 * @author pvosburgh
 * 
 */
@SuppressWarnings( "serial" )
@ManagedResource(objectName="vozzworksWeb:name=VwRestServlet",description="REST servlet Manager")
public class VwRestServlet extends HttpServlet
{
  private VwServiceManager m_serviceDispatcher;

  private String m_strServiceContext;

  protected static int s_nActiveConnections = 0;

  protected static int s_nMaxConcurrentConnectionFound = 0;

  protected static long s_lTotRequests = 0;

  private static Object s_semi = new Object();

  private long m_lLowHeapTrigger = 0;

  private VwLogger m_logger;

  public void setLogger( VwLogger logger )
  { m_logger = logger; }


  /**
   * Standard servlet init
   */

  @Override
  public void init( ServletConfig servletConfig ) throws ServletException
  {
    super.init( servletConfig );
    try
    {


      String strLoggerProps = servletConfig.getInitParameter( "loggerProps" );

      if ( strLoggerProps != null )
      {
        if ( strLoggerProps.startsWith( "spring:" ) )
        {
          m_logger = (VwLogger) VwSpringUtils.getInstance().getBean( strLoggerProps.substring( "spring:".length() ) );
        }
        else
        {
          m_logger = VwLogger.getInstance( strLoggerProps );

        }
      }
      else
      {
        m_logger = VwLogger.getInstance();
      }

    }
    catch( Exception ex )
    {
      throw new ServletException( ex.toString() );

    }
    // See if low heap monitoring is enabled
    String strLowHeapTrigger = servletConfig.getInitParameter( "lowHeapTrigger" );

    if ( strLowHeapTrigger != null )
    {
      m_lLowHeapTrigger = Long.parseLong( strLowHeapTrigger );
      m_logger.info( this.getClass(), "**** ACTIVATING Vozzware REST Servlet Low Heap threshhold at: " +  m_lLowHeapTrigger +  " bytes ***" );

    }

    m_logger.info( this.getClass(), "**** STARTING Vozzware REST Servlet service broker ***" );
    m_strServiceContext = servletConfig.getInitParameter( "serviceContext" );

    if ( m_strServiceContext == null )
    {
      String strErrMsg = "A service context file name must be specified in your resource/docs folder";

      m_logger.error( this.getClass(), strErrMsg  );
      throw new ServletException( strErrMsg );

    }

        // Load the service manager
    m_serviceDispatcher = (VwServiceManager) VwSpringUtils.getInstance().getBean( "serviceManager" );

    try
    {
      m_serviceDispatcher.setServiceContextFileName( m_strServiceContext );

    }
    catch( Exception ex )
    {
      m_logger.error( this.getClass(), ex.getMessage(), ex  );
      throw new ServletException( ex.getMessage() );

    }

    String strBundleList = servletConfig.getInitParameter( "loadBundles" );

    if ( strBundleList != null )
    {

      VwDelimString dlms = new VwDelimString( strBundleList );
      while( dlms.hasMoreElements() )
      {

        String strBundleName = dlms.getNext();
        try
        {
          VwResourceMgr.loadBundle( strBundleName, true );
         }
        catch ( Exception ex )
        {
          m_logger.error( this.getClass(), "init failed in Servlet: " + this.getClass().getName(), ex );
          throw new ServletException( ex.toString() );
        }

      } // end while()
    }


  }

  /**
   * Handle the client request
   */
  @Override
  public  void service( HttpServletRequest req, HttpServletResponse resp ) throws ServletException
  {


    String strUrl = req.getRequestURI();

    if ( m_logger.isDebugEnabled() && m_logger.getDebugVerboseLevel() >= 3  )
    {
      m_logger.debug( this.getClass(), "in service method using url request: " + strUrl + " from: " + req.getRemoteHost() );
    }

    // Strip off the context
    int nPos =  strUrl.indexOf( "/", 1);

    if ( nPos < 0 )
    {
      String strErrMsg = "Invalid service request url";
      m_logger.error( this.getClass(), strErrMsg );
      throw new ServletException( strErrMsg );

    }


    String strServiceName = strUrl.substring( ++nPos );

    // see if there is a / at end of service name

    nPos = strServiceName.indexOf( "/" );

    if ( nPos < 0 )
    {
      nPos = strServiceName.indexOf( "?" );
    }

    if ( nPos > 0 )
    {
      strServiceName = strServiceName.substring( 0, nPos );

    }

    if ( strServiceName == null )
    {
      String strErrMsg = "Invalid service request url";
      m_logger.error( this.getClass(), strErrMsg );
      throw new ServletException( strErrMsg );

    }

    long lServiceStartTime = 0;

    try
    {

      if ( m_logger.isDebugEnabled() )
      {
        lServiceStartTime = System.currentTimeMillis();

      }

      if ( m_lLowHeapTrigger > 0 )
      {
        if ( getAvailableMemory() <= m_lLowHeapTrigger )
        {
          m_logger.info( this.getClass(), "Low Heap detected below threshold of: " + m_lLowHeapTrigger + " bytes, return 503 status code" );

          resp.setStatus( 503 );
          return;

        }

      }

      synchronized ( s_semi )
      {
        ++s_nActiveConnections;
        ++s_lTotRequests;

        if ( s_nActiveConnections > s_nMaxConcurrentConnectionFound )
        {
          s_nMaxConcurrentConnectionFound = s_nActiveConnections;

        }
      }

      Object objResp = m_serviceDispatcher.exec( strServiceName, req, resp );

      if ( m_logger.isDebugEnabled() && m_logger.getDebugVerboseLevel() >= 2 )
      {
        m_logger.debug( this.getClass(), "Response From Service " + strServiceName  + " took " + (System.currentTimeMillis() - lServiceStartTime) + " milliseconds to complete" );

      }

      if ( m_serviceDispatcher.isAsyncService( strServiceName ))
      {
        return; // Nothing left to do
      }

      synchronized ( s_semi )
      {
        --s_nActiveConnections;

      }

      if ( objResp != null )
      {

        String strContentType = resp.getContentType();
        if ( strContentType == null )
        {
           resp.setContentType( "text/plain" );
        }

        String strResponse = objResp.toString();

        if ( m_logger.isDebugEnabled() && m_logger.getDebugVerboseLevel() >= 3 )
        {
          m_logger.debug( this.getClass(), "Got Response from service : " + strServiceName + "response data: " + strResponse );
        }

        resp.getWriter().print( strResponse );
      }
    }
    catch ( Exception ex )
    {
      synchronized ( s_semi )
      {
        --s_nActiveConnections;

      }

      m_logger.error( this.getClass(), "ERROR Executing Service: " + strServiceName, ex );

      String strErrMsg = ex.getMessage()  ;
      int nErrorCode = 500;

      if ( ex instanceof  VwServiceNotFoundException )
      {
        strErrMsg = "Service Name: " + ((VwServiceNotFoundException)ex).getServiceNotFoundName() + " was not defined in the file: " + m_strServiceContext;
        nErrorCode = 400;
      }
      else
      if ( ex instanceof  ServletException )
      {
        throw (ServletException) ex;
      }

      try
      {
         resp.sendError( nErrorCode, strErrMsg );
      }
      catch( Exception ex2)
      {
        m_logger.error( this.getClass(), "ERROR Sending Exception response to client" );

      }

    }

  }

  /**
   * Gets the availe heap memory
   * @return
   */
  protected static long getAvailableMemory()
  {
    Runtime runtime = Runtime.getRuntime();
    long totalMemory = runtime.totalMemory();  // current heap allocated to the VM process
    long freeMemory = runtime.freeMemory();    // out of the current heap, how much is free
    long maxMemory = runtime.maxMemory();      // Max heap VM can use e.g. Xmx setting
    long usedMemory = totalMemory - freeMemory; // how much of the current heap the VM is using
    long availableMemory = maxMemory - usedMemory; // available memory i.e. Maximum heap size minus the current amount used
    return availableMemory;
  }


}
