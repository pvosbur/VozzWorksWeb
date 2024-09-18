package com.vozzware.service.dao;

import java.net.URL;

import com.vozzware.util.VwLogger;

import com.vozzware.util.VwFileUtil;
import com.vozzware.util.VwResourceMgr;
import com.vozzware.util.VwResourceStoreFactory;
import org.springframework.beans.factory.InitializingBean;

public class VwServiceDictionaryDAO implements InitializingBean
{
  private String m_strDictionaryContent;

  private VwLogger m_logger;

  public VwServiceDictionaryDAO()
  {
  }

  public String getDictionaryContent()
  {
    return m_strDictionaryContent;
  }

  public void setDictionaryContent( String dictionaryContent )
  {
    m_strDictionaryContent = dictionaryContent;
  }

  @SuppressWarnings( "static-access" )
  public void setLogger( VwLogger logger )
  {
    m_logger = logger;
  }

  public void afterPropertiesSet() throws Exception
  {
    VwResourceMgr.loadBundle( "serviceManager", true );
    String strServiceContext = VwResourceMgr.getString( "serviceManager.serviceContext" );
    m_logger.info( this.getClass(), "Loading service dictionary from " + strServiceContext );
    URL urlServiceContext = VwResourceStoreFactory.getInstance().getStore().getDocument( strServiceContext );
    if (urlServiceContext == null)
    {
      throw new Exception( "Service context file: '" + strServiceContext + "' cannot be found" );
    }
    m_strDictionaryContent = VwFileUtil.readFile( urlServiceContext );
  }

}
