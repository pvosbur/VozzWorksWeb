/*
============================================================================================
 
                                Copyright(c) 2000 - 2006 by

                       V o z z W a r e   L L C (Vw)

                                   All Rights Reserved

THIS PROGRAM IS PROVIDED UNDER THE TERMS OF THE Vozzware LLC PUBLIC LICENSE VER 1.0 (�AGREEMENT�),
PROVIDED WITH THIS PROGRAM. ANY USE, REPRODUCTION OR DISTRIBUTION OF THE PROGRAM
CONSTITUTES RECEIPIENTS ACCEPTANCE OF THIS AGREEMENT.

Source Name: VwContentTypes.java

============================================================================================
*/

package com.vozzware.http;

import java.util.ResourceBundle;

public class VwContentTypes
{
  private static ResourceBundle m_msgs = ResourceBundle.getBundle( "resources.properties.httpmsgs" );

  private static String[]   m_astrContentTypes = {"class", "application/octet-stream",
                     "html", "text/html", "htm", "text/html",
                     "txt", "text/plain", "pl", "text/plain","xml","text/xml",
                     "hqx", "application/mac-binhex40", "bin", "application/octet-stream",
                     "gif", "image/gif", "ief", "image/ief",
                     "jpeg", "image/jpeg", "jpg", "image/jpeg",
                     "jpe", "image/jpeg", "tiff", "image/tiff",
                     "oda", "application/oda", "pdf", "application/pdf",
                     "ai", "application/postscript", "eps", "application/postscript",
                     "ps", "application/postscript", "rtf", "application/rtf",
                     "csh", "application/x-csh", "dvi", "application/x-dvi",
                     "hdf", "application/x-hdf", "latex", "application/x-latex",
                     "nc", "application/x-netcdf", "cdf", "application/x-netcdf",
                     "sh", "application/x-sh", "tcl", "application/x-tcl",
                     "tex", "application/x-tex", "texinfo", "application/x-texinfo",
                     "texif", "application/x-texinfo", "man", "application/x-troff-man",
                     "t", "application/x-troff", "tr", "application/x-troff",
                     "roff", "application/x-troff", "fm", "application/x-maker",
                     "me", "application/x-troff-me", "ms", "application/x-troff-ms",
                     "src", "application/x-wais-source", "zip", "application/x-zip",
                     "bcpio", "application/x-bcpio", "cpio", "application/x-cpio",
                     "gtar", "application/x-gtar", "shar", "application/x-shar",
                     "sv4cpio", "application/x-sv4cpio", "sv4crc", "application/x-sv4crc",
                     "tar", "application/x-tar", "ustar", "application/x-ustar",
                     "au", "audio/basic", "snd", "audio/basic",
                     "aif", "audio/x-aiff", "aiff", "audio/x-aiff",
                     "tif", "image/tiff", "ras", "image/x-cmu-raster",
                     "pnm", "image/x-portable-anymap", "pbm", "x-portable-bitmap",
                     "pgm", "image/x-portable-graymap", "ppm", "image/x-portable-pixmap",
                     "rgb", "image/x-rgb", "xbm", "image/x-xbitmap",
                     "xpm", "image/x-xpixmap", "xwd", "image/x-xwindowdump",
                     "rtx", "text/richtext", "tsv", "text/tab-separated-values",
                     "etx", "text/x-setext", "mpeg", "video/mpeg",
                     "mpg", "video/mpeg", "qt", "video/quicktime",
                     "mov", "video/quicktime", "avi", "video/x-msvideo",
                     "movie", "video/x-sgi-movie" };


  /**
   * The the mime content type based on the file extension
   *
   * @param strFileExt The file extension to lookup
   *
   * @return a String containg the content type
   *
   * @exception Exception if no content type exists for the file extension
   */
  public static final String getContentType( String strFileExt ) throws Exception
  {
    for ( int x = 0; x < m_astrContentTypes.length; x += 2 )
    {
      if ( strFileExt.equals( m_astrContentTypes[ x ] ) )
        return m_astrContentTypes[ x + 1 ];

    }
    throw new Exception( m_msgs.getString( "VwJWorks.http.UnknownType" ) + " " + strFileExt );

  } // end getContentType()


} // end class VwContentTypes{}

// *** End of VwContentTypes.java ***
