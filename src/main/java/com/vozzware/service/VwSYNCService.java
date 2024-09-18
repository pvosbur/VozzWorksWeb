package com.vozzware.service;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

public interface VwSYNCService
{
  public void setSyncServiceParams( HttpServletRequest req, HttpServletResponse resp );

}
