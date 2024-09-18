package com.vozzware.spring.utils;

import java.util.Map;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

public class VwSpringUtils
{

  private static VwSpringUtils s_instance;

  private WebApplicationContext m_webAppCtx;  // Context for Web apps

  private ApplicationContext m_appCtx;        // Context for non web apps

  private ServletContext      m_servletContext;

  public static VwSpringUtils getInstance()
  {
    synchronized ( VwSpringUtils.class )
    {
      if ( s_instance == null )
      {
        s_instance = new VwSpringUtils();
      }
      return s_instance;
    }
  }

  /**
   * Provide this class with the servlet context in which the WebContent app is running. Must be called before getting beans.
   * 
   * @param ctx
   */
  public void setServletContext( ServletContext ctx )
  {
    m_webAppCtx = WebApplicationContextUtils.getRequiredWebApplicationContext( ctx );
    m_servletContext = ctx;

  }


  public ServletContext getServletContext()
  { return m_servletContext; }
  /**
   * Get a bean of the given class from spring context, in the case of multiple beans of same type returns first
   * s_instance.
   * 
   * @param <BeanClass>
   * @param beanClass
   * @return
   */
  public <BeanClass> BeanClass getBean( Class<BeanClass> beanClass )
  {
    BeanClass bean = null;
    for ( BeanClass firstBean : getBeans( beanClass ).values() )
    {
      bean = firstBean;
      break;
    }
    return bean;
  }

  /**
   * Returns a map<String, BeanClass> of all the beans of a given type.
   * 
   * @param <BeanClass>
   * @param beanClass
   * @return
   */
  public <BeanClass> Map<String, BeanClass> getBeans( Class<BeanClass> beanClass )
  {
    @SuppressWarnings( "unchecked" )
    // needed because springs method is not generic

    Map<String, BeanClass> beansOfType = null;

    if ( m_webAppCtx != null )
      beansOfType = m_webAppCtx.getBeansOfType( beanClass );
    else
      beansOfType = m_appCtx.getBeansOfType( beanClass );

    return beansOfType;
  }



  /**
   * Get a bean by a given name.
   * 
   * @param beanId
   * @return
   */
  public Object getBean( String beanId )
  {
    if ( m_webAppCtx != null )
      return m_webAppCtx.containsBean( beanId ) ? m_webAppCtx.getBean( beanId ) : null;
    else
      return m_appCtx.containsBean( beanId ) ? m_appCtx.getBean( beanId ) : null;

  }

  public Object getBean( String beanId, Object[] objParams )
  {
    if ( m_webAppCtx != null )
      return m_webAppCtx.containsBean( beanId ) ? m_webAppCtx.getBean( beanId, objParams ) : null;
    else
      return m_appCtx.containsBean( beanId ) ? m_appCtx.getBean( beanId, objParams ) : null;

  }

  public <BeanClass extends Object> void outject( String beanId, BeanClass bean )
  {
    ConfigurableApplicationContext outjectCtx = (ConfigurableApplicationContext) getCtx();
    DefaultListableBeanFactory beanFactory = (DefaultListableBeanFactory) outjectCtx.getBeanFactory();
    beanFactory.registerSingleton( beanId, bean );
  }

  public WebApplicationContext getCtx()
  {
    return m_webAppCtx;
  }

  public void setCtx( WebApplicationContext ctx )
  {
    m_webAppCtx = ctx;
  }


  public void setAppCtx( ApplicationContext appCtx )
  { m_appCtx = appCtx; }


  public  ApplicationContext getAppCtx()
  { return m_appCtx; }

}
