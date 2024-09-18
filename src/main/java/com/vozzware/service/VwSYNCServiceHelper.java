package com.vozzware.service;

import com.vozzware.service.manager.VwExceptionFormatter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class VwSYNCServiceHelper extends VwExceptionFormatter implements VwSYNCService
{

  /**
   * Sets the request and response servlet classes
   * @param req the request object
   * @param resp the reponse object
   */
  public void setSyncServiceParams( HttpServletRequest req, HttpServletResponse resp )
  {
    m_request = req;
    m_response = resp;


  }


  /**
   * Writes the service name being executed to the log with no user defined msg prefix or suffix
   */
  protected void log()
  {
    log( null, null );
  }


  /**
   * Writes the service name being executed to the log with a user defind msh prefix
   *
   * @param strMsgPrefix The msg prefix
   */
  protected void log( String strMsgPrefix )
  {
    log( strMsgPrefix, null );
  }


  /**
   * Writes the service name being executed to the log with a user define msg prefix and suffix
   *
   * @param strMsgPrefix  The message prefix ( may be null )
   * @param strMsgSuffix  The message suffix ( may be null )
   */
  protected void log( String strMsgPrefix, String strMsgSuffix )
  {

    if ( m_logger != null && m_logger.isDebugEnabled() )
    {
      String strServiceName = m_request.getPathInfo();
      String strQParams = m_request.getQueryString();

      String strMsg = "";

      if ( strMsgPrefix != null )
      {
        strMsg = strMsgPrefix;
      }

      strMsg += "Executing service: " + strServiceName.substring( 1 );


      if ( strQParams != null && strQParams.length() > 0 )
      {
        strMsg += " with params: " + strQParams;

      }

      if ( strMsgSuffix != null )
      {
        strMsg += " " + strMsgSuffix;
      }

      m_logger.debug( this.getClass(), strMsg );
    }
  }
}
