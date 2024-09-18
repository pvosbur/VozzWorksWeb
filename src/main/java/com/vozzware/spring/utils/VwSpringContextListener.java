package com.vozzware.spring.utils;

import javax.servlet.ServletContextEvent;

import org.springframework.web.context.ContextLoaderListener;

public class VwSpringContextListener extends ContextLoaderListener
{

  /**
   * Called when context is loaded. Does whatever spring does first, and then passes the context to our spring util so
   * we can lookup beans
   */
  @Override
  public void contextInitialized( ServletContextEvent event )
  {
    super.contextInitialized( event );
    VwSpringUtils.getInstance().setServletContext( event.getServletContext() );

  }

}
