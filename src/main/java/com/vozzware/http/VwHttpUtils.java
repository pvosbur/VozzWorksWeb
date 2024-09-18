package com.vozzware.http;

import javax.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.util.Map;

public class VwHttpUtils
{
  
  /**
   * Makes an url encoded string from the name value pairs in the map that can be used
   * with the application/x-www-form-urlencoded mime type
   * 
   * @param mapNameValues The map of name/values to be encoded
   * 
   * @return
   */
  public static String makeAppXFormEncodedString( Map<String,String> mapNameValues )
  { 
    try
    {
      return makeAppXFormEncodedString( mapNameValues, "UTF-8" );
      
    }
    catch( Exception ex )
    {
      ; //This won't happen because UTF-8 encoding scheme is valid
    }
    
    return null;
    
  } // end makeAppXFormEncodedString()
  
  
  /**
   * Makes an url encoded string from the name value pairs in the map that can be used
   * with the application/x-www-form-urlencoded mime type
   * 
   * @param mapNameValues The map of name/values to be encoded
   * @param strEncodingScheme The character encoding scheme
   * 
   * @return
   */
  public static String makeAppXFormEncodedString( Map<String,String> mapNameValues, String strEncodingScheme ) throws Exception
  {
    if ( strEncodingScheme == null )
      strEncodingScheme = "UTF-8";
    
    StringBuffer sbUrlEncoded = new StringBuffer();
    
    int nCount = 0;
    
    for ( String strUrlName : mapNameValues.keySet() )
    {
      if ( ++nCount > 1 )
        sbUrlEncoded.append( "&" );
      
      sbUrlEncoded.append( strUrlName ).append( "=" );

      String strValue = mapNameValues.get(  strUrlName );
      if ( strValue == null )
        strValue = "";

      sbUrlEncoded.append( URLEncoder.encode( strValue, strEncodingScheme ) );
      
    }
    
    return sbUrlEncoded.toString();
  }

  /**
   * Makes http param string from a map of name/valure pairs
   * with the application/x-www-form-urlencoded mime type
   *
   * @param mapNameValues The map of name/values to be encoded
   *
   * @return
   */
  public static String map2HttpParamString( Map<String,String> mapNameValues ) throws Exception
  {

    StringBuffer sbParamString = new StringBuffer();

    int nCount = 0;

    for ( String strUrlName : mapNameValues.keySet() )
    {
      if ( ++nCount > 1 )
        sbParamString .append( "&" );

      sbParamString .append( strUrlName ).append( "=" );

      String strValue = mapNameValues.get(  strUrlName );
      if ( strValue == null )
        strValue = "";

      sbParamString .append( strValue );

    }

    return sbParamString .toString();
  }


}
