package com.vozzware.service;

import com.vozzware.util.VwLogger;

import java.util.Map;

public class VwASYNCServiceHelper implements VwASYNCService
{
  protected Map<String, String> m_mapParams;

  protected VwLogger m_logger;

  protected String m_strServiceName;

  /**
   * Sets the params map from the url for this request
   *
   * @param mapParams Params passed to the service
   */
  public void setASyncServiceParams( String strServiceName, Map<String,String>mapParams )
  {
    m_strServiceName = strServiceName;

    m_mapParams = mapParams;

  }


  /**
   * Writes the service name being executed to the log
   */
  protected void log()
  {
    log( null );
  }

  /**
   * Writes the service name being executed to the log
   */
  protected void log( String strMsgSuffix )
  {

    if ( m_logger != null && m_logger.isDebugEnabled() )
    {

      String strQParams = "";

      for ( String strParam : m_mapParams.keySet() )
      {

        if ( strQParams.length() > 0 )
        {
          strQParams += ", ";

        }

        strQParams += strParam + "=" + m_mapParams.get( strParam );
      }

      String strMsg = "Executing service: " + m_strServiceName;

      if ( strMsgSuffix != null )
      {
        strMsg += " " + strMsgSuffix;
      }

      if ( strQParams != null && strQParams.length() > 0 )
      {
        strMsg += " with params: " + strQParams;

      }

      m_logger.debug( this.getClass(), strMsg );
    }
  }


}
