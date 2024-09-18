package com.vozzware.service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

public interface VwASYNCService
{
  public void setASyncServiceParams( String strServiceName, Map<String,String> mapParams );

}
