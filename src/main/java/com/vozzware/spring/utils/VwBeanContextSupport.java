package com.vozzware.spring.utils;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;

public class VwBeanContextSupport implements BeanFactoryAware
{
  protected BeanFactory m_beanFactory;
  
  /**
   * Sets the Spring bean factory that loaded this bean
   * @param beanFactory The bean factory that loaded this bean
   * @throws BeansException
   */
  public void  setBeanFactory(BeanFactory beanFactory) throws BeansException
  { m_beanFactory = beanFactory; }

 
}
