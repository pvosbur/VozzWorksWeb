package com.vozzware.service.manager;

public class VwServiceNotFoundException extends Exception
{
  private String m_strServiceNotFoundName;

  public VwServiceNotFoundException( String strServiceName )
  {
    super( "The request service :'" + strServiceName + " was not defined");
    m_strServiceNotFoundName = strServiceName;
  }

  public String getServiceNotFoundName()
  {
    return m_strServiceNotFoundName;
  }
}
