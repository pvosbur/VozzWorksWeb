package com.vozzware.http;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.OutputStream;
import java.util.Enumeration;

public class VwHttpRequestDumper
{

  public static void dumpHttpRequest( HttpServletRequest request, OutputStream outs  ) throws Exception
  {

    String strMethod = request.getMethod();
    String strPathInfo = request.getContextPath();
    Cookie[] aCookies = request.getCookies();
    int nContentLen = request.getContentLength();
    String strContentType = request.getContentType();
    Enumeration<String> eHeaders = request.getHeaderNames();

    for ( ; eHeaders.hasMoreElements(); )
    {
      String strHeader = eHeaders.nextElement();
      outs.write( (strHeader + ":" + request.getHeader( strHeader )).getBytes());
    }

    BufferedReader rdr = request.getReader();

    outs.write( "Content :\n".getBytes());

    String strLine = null;

    while ( (strLine = rdr.readLine()) != null )
    {
      outs.write( (strLine + "\n").getBytes() );
    }

  }
}
