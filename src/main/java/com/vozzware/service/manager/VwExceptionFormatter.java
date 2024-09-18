/*
 *
 * ============================================================================================
 *
 *                                A r m o r e d  I n f o   W e b
 *
 *                                     Copyright(c) 2012 By
 *
 *                                       Armored Info LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 *  ============================================================================================
 * /
 */

package com.vozzware.service.manager;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.vozzware.util.VwLogger;

import java.util.Map;

/*
============================================================================================

    Source File Name: Transaction.java

    Author:           petervosburgh
    
    Date Generated:   10/8/12

    Time Generated:   6:10 AM

============================================================================================
*/
public class VwExceptionFormatter
{

  protected HttpServletRequest m_request;

  protected HttpServletResponse m_response;

  protected Map<String, String> m_mapParams;

  protected VwLogger m_logger;

  protected int m_nMaxStringLength = 512;

  /**
   * Return exception as a String starting with the prefix EX:
   *
   * @param clsTrowingException The oblect class throwing the exception
   * @param strMsg Additional msg in addition to the exception string
   * @param ex The Exception
   * @return
   */
  public final String formatException( Class clsTrowingException, String strMsg, Exception ex )
  {


    m_response.setContentType( "text/plain" );

    String strException = "EX:";

    if ( strMsg != null )
      strException += strMsg + ", reason: ";
    else
      strMsg = "";

    m_logger.error( clsTrowingException, strMsg, ex );


    String strEx = ex.getLocalizedMessage();

    if ( strEx == null )
      strEx = ex.toString();

    if ( strEx.length() > m_nMaxStringLength )
      strEx = strEx.substring( 0, m_nMaxStringLength ) + "...";

    strException += strEx;

    return strException;


  }
}
