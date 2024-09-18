package com.vozzware.service.manager;

import java.net.URL;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.vozzware.service.VwASYNCService;
import com.vozzware.service.VwSYNCService;
import com.vozzware.service.dvo.ServiceDef;
import com.vozzware.service.dvo.ServiceDictionary;
import com.vozzware.service.dvo.ServiceDictionaryReader;
import com.vozzware.spring.utils.VwSpringUtils;
import com.vozzware.util.VwBeanUtils;
import com.vozzware.util.VwLogger;
import com.vozzware.util.VwResourceStoreFactory;
import org.springframework.jmx.export.annotation.ManagedAttribute;
import org.springframework.jmx.export.annotation.ManagedOperation;
import org.springframework.jmx.export.annotation.ManagedResource;

/**
 * This class handles the dispatching of httpServices defined in the service dictionary which is an xml file
 * <br>that defines each service handler. This class handles a synchExec and an asynchExecMthod which both take a
 * <br>service name and an optional xml/json string. The xml/json string represents a serialized pojo.
 * 
 * @author pvosburgh
 *
 */
@ManagedResource(objectName="vozzworksWeb:name=VwServiceManager",description="Service Manager")
public class VwServiceManager
{
  private Map<String, ServiceDef>  m_mapServiceDefs;

  private VwLogger m_logger = null;

  private String m_strServiceContextFileName;

  public void setLogger( VwLogger logger )
  { m_logger = logger; }

  public void setServiceContextFileName( String strServiceContextFileName ) throws Exception
  {
    m_strServiceContextFileName = strServiceContextFileName;

    loadDictionary();


  }

  /**
   * Returns the number of active client connections
   * @return
   */
  @ManagedAttribute(description = "Returns current active connectiona")
  public int getActiveConnections()
  {
    return VwRestServlet.s_nActiveConnections;
  }


  /**
   * Returns the max concurrent connection count
   * @return
   */
  @ManagedAttribute(description = "Returns highest concurrent connection count")
  public int getMaxConcurrentConnetions()
  {
    return VwRestServlet.s_nMaxConcurrentConnectionFound;
  }


  /**
   * Returns the max concurrent connection count
   * @return
   */
  @ManagedAttribute(description = "Returns the current total service requests seen so far")
  public long getTotServiceRequestes()
  {
    return VwRestServlet.s_lTotRequests;
  }


  @ManagedOperation(description = "Returns the current java heap memory available")
  public String getAvailableMemory()
  {
    long lMemAvail = VwRestServlet.getAvailableMemory();

    DecimalFormat numFormat = new DecimalFormat("#,###,###");
    String strMemAvail = numFormat.format( lMemAvail );

    return strMemAvail;

  }
  class AsyncServiceRunner extends Thread
  {
    private ServiceDef m_serviceDef;
    private Object     m_objServiceHandler;

    AsyncServiceRunner( Object objServiceHandler, ServiceDef serviceDef )
    {
      m_objServiceHandler = objServiceHandler;
      m_serviceDef = serviceDef;

    }

    public void run()
    {

      try
      {
        String strMethod = m_serviceDef.getMethod();

        // See if there is a method name override, else method name is the same as service name
        if ( strMethod == null )
        {
          strMethod = m_serviceDef.getName();
        }


        if ( m_logger.isDebugEnabled() && m_logger.getDebugVerboseLevel() >= 3 )
        {
          m_logger.debug( this.getClass(), "About to execute Service Thread: " + m_serviceDef.getName() );
        }

        VwBeanUtils.execMethod( m_objServiceHandler, strMethod, null );

        --VwRestServlet.s_nActiveConnections;
      }
      catch ( Exception e )
      {
        m_logger.error( this.getClass(), "Error executing service " + m_serviceDef.getName(), e );

      }

    }
  }

  @ManagedOperation(description="Allows reloading Service Dictionary")
  public void loadDictionary() throws Exception
  {
    m_logger.info( this.getClass(), "Loading service dictionary from " + m_strServiceContextFileName );

    URL urlServiceContext = VwResourceStoreFactory.getInstance().getStore().getDocument( m_strServiceContextFileName );
    if (urlServiceContext == null)
    {
      throw new Exception( "Service context file: '" + m_strServiceContextFileName + "' cannot be found" );
    }
    
    ServiceDictionary listServices = ServiceDictionaryReader.read( urlServiceContext );
    makeServiceMap( listServices );
    
  }


  /**
   * Converts a List of ServiceDefs to a Map
   * 
   * @param listServices
   */
  private void makeServiceMap( ServiceDictionary listServices )
  {
    m_mapServiceDefs = new HashMap<String, ServiceDef>();

    for ( ServiceDef service : listServices.getServiceDef() )
    {
      m_mapServiceDefs.put( service.getName().toLowerCase(), service );
      m_logger.info( this.getClass(), "Loaded service : " + service.getName() );
      
    }
  }


  /**
   * Returns true if service is an async serveice
   * @param strServiceName The name of the servoce to test
   * @return
   * @throws Exception
   */
  public boolean isAsyncService( String strServiceName ) throws Exception
  {
    ServiceDef service = m_mapServiceDefs.get( strServiceName.toLowerCase() );
    if ( service == null )
    {
      throw new Exception( "Service name: " + strServiceName + " is not defined" );
    }

    return service.getExecType().equals( "async" );

  }


  /**
   * Lookup the requested service and invoke the service handler
   * @param strServiceName The name of the service
   * @return
   * @throws Exception
   */
  public Object exec( String strServiceName, HttpServletRequest request, HttpServletResponse resp ) throws Exception
  {

    ServiceDef service = m_mapServiceDefs.get( strServiceName.toLowerCase() );
    try
    {
      if (service == null)
      {
        throw new VwServiceNotFoundException( strServiceName );
      }
      
      String strServiceClass = service.getServiceClass();

      Object objServiceHandler = null;

      String strServiceExecType = service.getExecType();

      if ( strServiceExecType == null )
      {
        String strErrMsg = "Service Exec type must not be null, Check The VwServletServices.xml and make sure the execType is defined";
        m_logger.error( this.getClass(), strErrMsg );
        throw new Exception( strErrMsg );


      }

      if (strServiceClass.startsWith( "spring:" ))
      {
        objServiceHandler = loadFromSpring( strServiceClass );
      }
      else
      {
        objServiceHandler = loadFromClassSpec( strServiceClass );
      }

      doInjections( strServiceName, strServiceExecType,  objServiceHandler, request, resp );
      
      String strMethodName = service.getMethod();

      if (strMethodName == null)
      {
        strMethodName = service.getName();
      }

      if ( m_logger.isDebugEnabled() && m_logger.getDebugVerboseLevel() >= 3 )
      {
        m_logger.debug( this.getClass(), "About to execute " + strServiceName );
      }

      if ( service.getExecType().equalsIgnoreCase( "async" ))
      {
        AsyncServiceRunner serviceThread = new AsyncServiceRunner( objServiceHandler, service );
        serviceThread.setDaemon( true );
        serviceThread.start();

        return null;


      }

      return VwBeanUtils.execMethod( objServiceHandler, strMethodName, null );


    }
    catch ( Exception ex )
    {
      m_logger.error( this.getClass(), ex.toString(), ex );
      throw ex;
    }
  }

  
  /**
   * Handle injections based on handler type. All handlers get injected with the Spring application context.
   * Handlers that imple,ent the DwrService get injected with the DwrServiceManager instncase as well.
   * @param objServiceHandler
   */
  private  void doInjections( String strServiceName, String strServiceExecType, Object objServiceHandler, HttpServletRequest request, HttpServletResponse resp ) throws Exception
  {
    if ( strServiceExecType.equals( "sync" ))
    {
      if ( ! (objServiceHandler instanceof VwSYNCService ) )
      {
        throw new Exception( objServiceHandler.getClass().getName() + " is defined as a SYNC service and must implement the VwSYNCService interface");
      }

      ((VwSYNCService)objServiceHandler).setSyncServiceParams( request, resp );

    }
    else
    {
      if ( ! (objServiceHandler instanceof VwASYNCService ) )
      {
        throw new Exception( objServiceHandler.getClass().getName() + " is defined as an ASYNC service and must implement the VwASYNCService interface");
      }

       Map mapReqParams = request.getParameterMap();

       // Clone Request Map
       Map<String,String>mapParams = new HashMap<String, String>();
       for ( Object objKey : mapReqParams.keySet() )
       {
         Object[] objValue = (Object[])mapReqParams.get( objKey );
         mapParams.put( objKey.toString(), objValue[0].toString() );

       }

      ((VwASYNCService)objServiceHandler).setASyncServiceParams( strServiceName, mapParams );

    }

  }


  /**
   * Create the object handler instance from the fully qualified class string
   * 
   * @param strClassName
   * @return
   * @throws Exception
   */
  private Object loadFromClassSpec( String strClassName ) throws Exception
  {

    if ( m_logger.isDebugEnabled() && m_logger.getDebugVerboseLevel() >= 3 )
    {
      m_logger.debug( this.getClass(), "Loading service handler class: " + strClassName );
    }

    Class<?> clsServiceHandler = Class.forName( strClassName );

    return clsServiceHandler.newInstance();
  }

  /**
   * Create the service handler instance from the bean configured in a spring
   * context
   * 
   * @param strClassName
   * @return
   * @throws Exception
   */
  private Object loadFromSpring( String strClassName ) throws Exception
  {

    int nPos = "spring:".length();

    String strSpringId = strClassName.substring( nPos );

    if ( m_logger.isDebugEnabled() && m_logger.getDebugVerboseLevel() >= 3 )
    {
      m_logger.debug( this.getClass(), "Loading service handler class from spring context with bean id: " + strSpringId );
    }

    return VwSpringUtils.getInstance().getBean( strSpringId );

  }


} // end class VwServiceManager{}
