/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   2/2/18

 Time Generated:   6:30 AM

 ============================================================================================
 */

function VwCookieMgr()
{

} // end VwCookieMgr

/**
 * Sets a cookie
 *
 * @param strName
 * @param strValue
 * @param dtExpire
 * @param strPath
 */
VwCookieMgr.setCookie = function( strName, strValue, dtExpire, strPath )
{
  let strCookieString = strName + "=" + strValue + ";expires=";

  if ( dtExpire )
  {
    strCookieString += dtExpire.toUTCString();
  }
  else
  {
    strCookieString += "0";
  }

  strCookieString += ";path="

  if ( strPath )
  {
    strCookieString += strPath;
  }

  else
  {
    strCookieString += "/";
  }

  document.cookie = strCookieString;
  
} // end setCookie{}

/**
 * Gets a cookie by its name
 * 
 * @param strCookieName
 * @returns {string}
 */
VwCookieMgr.getCookie = function( strCookieName )
{
  let strName = strCookieName + "=";

  // Translate special characters
  var decodedCookie = decodeURIComponent( document.cookie );

  // Split on cookie boundries
  var astrCookies = decodedCookie.split(';');

  if ( !astrCookies )
  {
    return "";  // No cookies defined
  }

  for( let strCookie of astrCookies )
  {
    strCookie = strCookie.trim();

    let nPos = strCookie.indexOf( "=");

    strName = strCookie.substring( 0, nPos );

    if ( strName == strCookieName )
    {
      return strCookie.substring( ++nPos );
    }

  }

  return "";

} // end getCookie{}

export default VwCookieMgr;
