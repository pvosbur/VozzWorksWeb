/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2012 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 * ============================================================================================
 *
 */

import VwHashMap from "../VwHashMap/VwHashMap.js";
import VwUtils from "../VwUtils/VwUtils.js";
import VwStringBuffer from "../VwStringBuffer/VwStringBuffer.js";

const VwExString =
{
  /**
   * Returns true if strOrigString starts with strTest String
   * @param strOrigString
   * @param strStartString
   * @param fCaseSensitive
   * @return {Boolean}
   */
  startsWith: function ( strOrigString, strStartString, fCaseSensitive )
  {
    let fUseCase = true;

    if ( !this.isEmpty( fCaseSensitive ) && !fCaseSensitive )
    {
      fUseCase = false;
    }

    if ( this.isEmpty( strOrigString ) )
    {
      return false;
    }

    strOrigString = strOrigString.toString(); // Treat numbers as strings
    if ( fUseCase )
    {
      return strOrigString.indexOf( strStartString ) == 0;
    }
    else
    {
      return strOrigString.toLowerCase().indexOf( strStartString.toLowerCase() ) == 0;
    }


  },

  /**
   * Returns true if strOrigString ends with with strEndString String
   *
   * @param strOrigString The string being tested
   * @param strEndString The end of string piece to test
   * @param fCaseSensitive
   * @return {Boolean}
   */
  endsWith: function ( strOrigString, strEndString, fCaseSensitive )
  {
    let fUseCase = true;


    if ( !this.isEmpty( fCaseSensitive ) && !fCaseSensitive )
    {
      fUseCase = false;
    }

    if ( this.isEmpty( strOrigString ) )
      return false;

    if ( fUseCase )
    {
      return strOrigString.substring( strOrigString.lastIndexOf( strEndString ) ) == strEndString;
    }
    else
    {
      strOrigString = strOrigString.toLowerCase();
      strEndString = strEndString.toLowerCase();

      return strOrigString.substring( strOrigString.lastIndexOf( strEndString ) ) == strEndString;
    }

  },

  /**
   * Returns true if the strOrgString contains the substring strTestString
   *
   * @param strOrigString
   * @param strTestString
   * @param fCaseSensitive
   * @param nIndex
   * @return {Boolean}
   */
  contains: function ( strOrigString, strTestString, fCaseSensitive, nIndex )
  {
    let fUseCase = true;

    if ( !nIndex )
    {
      nIndex = 0;
    }

    if ( !this.isEmpty( fCaseSensitive ) && !fCaseSensitive )
    {
      fUseCase = false;
    }

    if ( this.isEmpty( strOrigString ) )
    {
      return false;
    }

    if ( fUseCase )
    {
      return strOrigString.indexOf( strTestString, nIndex ) >= 0;
    }
    else
    {
      return strOrigString.toLowerCase().indexOf( strTestString.toLowerCase(), nIndex ) >= 0;
    }


  },

  /**
   * Case insensitive compare
   *
   * @param str1
   * @param str2
   * @return {boolean} true if str1 == str2 case insensitve
   */
  equalsIgnoreCase: function( str1, str2 )
  {
    return str1.toLowerCase() == str2.toLowerCase();
  },

  /**
   * Replace all occurrences of strSearch with strReplace
   *
   * @param strOrig The string to replace
   * @param strSearch The pieces to search for
   * @param strReplace  The value to replace
   * @return {String} a String with the occurrences replaced
   */
  replaceAll: function ( strOrig, strSearch, strReplace )
  {
    let strRep = "";

    if ( strSearch.length == 1 )
    {
      for ( let x = 0; x < strOrig.length; x++ )
      {
        let ch = strOrig.charAt( x );
        if ( ch == strSearch )
        {
          strRep += strReplace;
        }
        else
        {
          strRep += ch;
        }

      }
    }
    else
    {
      let nOffset = 0;
      let nPos = strOrig.indexOf( strSearch, nOffset );

      while ( nPos >= 0 )
      {
        strRep += strOrig.substring( nOffset, nPos ) + strReplace;
        nOffset = nPos + strSearch.length;
        nPos = strOrig.indexOf( strSearch, nOffset );
      }

      if ( nOffset < strOrig.length )
      {
        strRep += strOrig.substring( nOffset );
      }
    }

    return strRep;
  },


  /**
   * Search a string to find any hyperlink and convert them to an anchor tag
   *
   * @param strString The string to search
   * @param fOpenLinkNewWindow Boolean, optional. If true the HTML anchor will be created so the links open on a new window
   * @param fRejoinString Boolean, optional. If true the string will be rejoined using the new HTML anchor tags
   * @param fnReady Function, required. The callback to execute with the results
   *
   */
  replaceHyperlinks: function ( strString, fOpenLinkNewWindow, fRejoinString, fnReady )
  {

    const self = this;
    let nOffset = 0;
    let nUrlCount = 0;
    let fStartWithString = false;
    let fAppendProtocol;
    let nPos;
    let nSpaceIndex;
    let aStringPieces = [];
    let aHtmlUrls = [];

    // Begin the find url routine
    findUrl();

    // Routine to find a URL
    function findUrl()
    {
      // Find any "http" url
      nPos = strString.indexOf( "http", nOffset );
      fAppendProtocol = false;

      // If "http" isn't found, look for any "www." url
      if ( nPos == -1 )
      {
        nPos = strString.indexOf( "www.", nOffset );
        fAppendProtocol = true;
      }

      // If no url, just return
      if ( nPos == -1 && nUrlCount == 0 )
      {
        fnReady( null );
        return;
      }

      // Find the first space after the url
      nSpaceIndex = strString.indexOf( " ", nPos );

      // If the URL is at the end of the string, use string length
      if ( nSpaceIndex == -1 )
      {
        nSpaceIndex = strString.length;
      }

      // Save the initial string piece before the first url if it exists
      if ( nPos > 0 && aStringPieces.length == 0 && aHtmlUrls.length == 0 )
      {
        let tempStr = strString.substring( 0, nPos );
        aStringPieces.push( tempStr );
        fStartWithString = true;
      }

      let strUrl = strString.substring( nPos, nSpaceIndex );
      let strUrlText = strString.substring( nPos, nSpaceIndex );

      // Append protocol if necessary
      if ( fAppendProtocol )
      {
        strUrl = "http://" + strUrl;
      }

      let tempHtml = self.createHtmlAnchorTag( strUrl, strUrlText, fOpenLinkNewWindow );
      aHtmlUrls.push( tempHtml );

      // Save the string in between urls
      if ( nUrlCount > 0 )
      {
        let tempStr3 = strString.substring( nOffset, nPos );
        aStringPieces.push( tempStr3 );
      }

      // If we have more urls then recurse function
      if ( self.containsHyperlink( strString, nSpaceIndex) )
      {
        nUrlCount++;
        nOffset = nSpaceIndex;
        findUrl();
      }
      else
      {
        // Save the string after the url
        let tempStr2 = strString.substring( nSpaceIndex );
        aStringPieces.push( tempStr2 );

        if ( fRejoinString )
        {
          if ( fStartWithString )
          {
            rejoinString( aStringPieces, aHtmlUrls );
          }
          else
          {
            rejoinString( aHtmlUrls, aStringPieces );
          }
        }
        else
        {
          fnReady( aStringPieces, aHtmlUrls );
        }
      }
    }

    // rejoins the strings
    function rejoinString( aFirstArray, aSecondArray )
    {
      let strString = "";

      aFirstArray.forEach( function ( string, index )
                           {
                             strString += string;

                             if ( aSecondArray[index] )
                             {
                               strString += aSecondArray[index];
                             }
                           } );

      fnReady( strString );

    }
    

  },

  /**
   * Takes a string URL and returns an HTML string anchor tag
   * @param strUrl  String, required. The string to use for the src attribute
   * @param strText String, required. The string to use for the anchor text
   * @param fOpenLinkNewWindow Boolean, optional. If true the HTML anchor will be created so the links open on a new window
   * 
   * @return {String} The HTML string to return
   */
  createHtmlAnchorTag: function ( strUrl, strText, fOpenLinkNewWindow )
  {
    let strTarget = "_self";

    if ( fOpenLinkNewWindow )
    {
      strTarget = "_blank";
    }

    return "<a href='" + strUrl + "' target='" + strTarget + "'>" + strText + "</a>";
  },

  /**
   * Search a string to find any hyperlink
   *
   * @param strOrig The string to search
   * @param nIndex  The index to start searching
   * @return {Boolean} True is hyperlink exists.
   */
  containsHyperlink: function ( strOrig, nIndex )
  {
    let fExists = false;

    if ( !nIndex )
    {
      nIndex = 0;
    }

    if ( this.contains( strOrig, "http", false, nIndex ) || this.contains( strOrig, "www.", false, nIndex ) )
    {
      fExists = true;
    }

    return fExists;
  },



  /**
   * Replace any character found in the strSearch string with strReplace
   *
   * @param strOrig The string to test
   * @param strSearch  a string of characters to replace
   * @param strReplace  The value to replace
   * @return {String} a String with the occurrences replaced
   */
  replaceAny: function ( strOrig, strSearch, strReplace )
  {
    let strRep = "";
    for ( let x = 0; x < strOrig.length; x++ )
    {
      let ch = strOrig.charAt( x );
      if ( this.isCharIn( ch, strSearch ) )   // if char is in strSearch, replace it
      {
        strRep += strReplace;
      }
      else
      {
        strRep += ch;
      }

    }

    return strRep;
  },

  /**
   * Strips char seq fromm string
   *
   * @param strOrig The String to strip
   * @param strStripChars The character sequence to strip
   */
  strip: function ( strOrig, strStripChars )
  {

    let nOrigNdx;

    // Create string buufer of orig string size to put the no stripped characters in

    const sb = new VwStringBuffer();

    for ( nOrigNdx = 0; nOrigNdx < strOrig.length; nOrigNdx++ )
    {

      const ch = strOrig.charAt( nOrigNdx );

      // *** If not in strip list then add it to the string buffer.

      if ( strStripChars.indexOf( ch ) < 0 )
      {
        sb.append( ch );
      }

    } // end for()

    return sb.toString();
  },


  /**
   * Strips off leading white spce
   * @param strOrig
   * @returns {string}
   */
  stripWhiteSpace: function ( strOrig )
  {

    for ( let x = 0, nLen = strOrig.length; x < nLen; x++ )
    {
      if ( !VwExString.isWhiteSpace( strOrig.charAt( x ) ) )
      {
        return strOrig.substring( x );
      }
    }

    return strOrig;

  },

  /**
   * Return the file extension for a file name
   * @param strFileName a String that is a file name
   * @return {*}
   */
  getFileExt: function ( strFileName )
  {

    let nPos = strFileName.lastIndexOf( "." );

    if ( nPos < 0 )
    {
      return strFileName;
    }

    return strFileName.substring( ++nPos );

  },

  /**
   * Return the file name without the file extension
   *
   * @param strFileName a String that is a file name
   * @return {*}
   */
  getFileBaseName: function ( strFileName )
  {

    let nPos = strFileName.lastIndexOf( "." );

    if ( nPos < 0 )
    {
      return strFileName;
    }

    return strFileName.substring( 0, nPos );

  },

  /**
   * Tests to see if the character chTestChar is a character in the string strString
   *
   * @param chTestChar The character to test
   * @param strString  The string of characters to test
   *
   * @return {Boolean}
   */
  isCharIn: function ( chTestChar, strString )
  {

    for ( let x = 0; x < strString.length; x++ )
    {
      if ( chTestChar == strString.charAt( x ) )
      {
        return true;
      }
    }

    return false;

  },

  /**
   * return true if string is undefined, null or zero length
   * @param strString
   * @return {Boolean}
   */
  isEmpty: function ( strString )
  {
    if ( typeof strString == "undefined" || strString == null || strString.length == 0 )
    {
      return true;
    }

    return false;
  },


  /**
   * Checks to see if character is a whitespace character
   *
   * @param ch The character to test
   * @returns {boolean}
   */
  isWhiteSpace: function ( ch )
  {
    if ( !ch )
    {
      return false;
    }

    return ( ch == ' ') ||  (ch.charCodeAt(0) == 160) || (ch == '\t') || (ch == '\n' || (ch == '\r' ) );

  },


  /**
   * Formats a javascript Date object
   * @param dateToFormat The date to format
   *
   * @param strFormat The format string
   * @return {string}
   */
  dateTime: function ( dateToFormat, strFormat, vwPropertyMgr )
  {

    if ( !strFormat )
    {
      strFormat = "mmm dd yyyy";
    }

    let strDay;

    let todaysDate = new Date();

    let strFormattedDate = "";

    if ( todaysDate.getDate() == dateToFormat.getDate() )
    {
      strFormattedDate = dateToFormat.format( "h:mm AA" );
    }
    else
    if ( (todaysDate.getDate() - 1 ) == dateToFormat.getDate() )
    {
      if ( vwPropertyMgr )
      {
        strDay = vwPropertyMgr.getString( "yesterday");
      }
      else
      {
        strDay = "Yesterday";
      }

      strFormattedDate =strDay + " " + dateToFormat.format( "h:mm AA" );
    }
    else
    if ( (todaysDate.getDate()  ) == dateToFormat.getDate() <= 7 )
    {
      strFormattedDate = dateToFormat.format( "EEEE h:mm AA" );
    }
    else
    {
      strFormattedDate = dateToFormat.format( "MMM d, yyyy h:mm: aa" );
    }

    return strFormattedDate;

  },


  /**
   * Formats a javascript Date object
   * @param dateToFormat  The date to format
   * @param strTimeFormat The time format
   *
   * @return {string}
   */
  formatDateTime: function ( dateToFormat, strTimeFormat )
  {

    let formattedTime;
    let strTimePeriod;
    let hours = dateToFormat.getHours();
    let minutes = dateToFormat.getMinutes();


    if ( strTimeFormat == "24" )
    {
      // Use 24hr time format
      formattedTime = dateToFormat.toLocaleTimeString( [], {hour12: false} );
    }
    else
    {
      // Use 12hr time format
      strTimePeriod = dateToFormat.toLocaleTimeString( [], {hour12: true} );

      let strPeriod = strTimePeriod.charAt( strTimePeriod.length - 2 );
      strPeriod += strTimePeriod.charAt( strTimePeriod.length - 1 );

      // Need minutes as strings
      minutes = minutes.toString();

      // Can't have 60 minutes
      if ( minutes == "60" )
      {
        minutes = "00";
      }

      // If single-digit minutes, add leading zero
      if ( minutes.length == 1 )
      {
        minutes = "0" + minutes;
      }

      formattedTime = hours + ":" + minutes + " " + strPeriod.toLowerCase();
    }

    return formattedTime;

  },


  /**
   * Formats a number to a rounded size in KB, MB or TB amount
   * @param nNumberToFormat The number to format
   * @return {string}
   */
  formatSize: function ( nNumberToFormat )
  {

    let nNumber;
    let strNumber;
    let strFormatted = "";
    let nPos;

    if ( nNumberToFormat < 1000 )
    {
      nNumber = nNumberToFormat / 1000;       // Kilo
      strNumber = nNumber.toString();

      nPos = getPos( strNumber );
      return round( strNumber.substring( 0, nPos ) ) + " kb";
    }


    nNumber = nNumberToFormat / 1000000000000;  // Terabyte  test
    strNumber = nNumber.toString();
    nPos = 0;

    if ( strNumber.charAt( 0 ) != "0" && strNumber.toLowerCase().indexOf( "e-" ) < 0 )
    {
      nPos = getPos( strNumber );
      return round( strNumber.substring( 0, nPos ) ) + " tb";
    }

    nNumber = nNumberToFormat / 1000000000;  // Gig test
    strNumber = round( nNumber.toString() );

    if ( strNumber.charAt( 0 ) != "0" && strNumber.toLowerCase().indexOf( "e-" ) < 0 )
    {
      nPos = getPos( strNumber );
      return strNumber.substring( 0, nPos ) + " gb";

    }

    nNumber = nNumberToFormat / 1000000;      // Meg test
    strNumber = round( nNumber.toString() );

    if ( strNumber.charAt( 0 ) != "0" )
    {
      nPos = getPos( strNumber );
      strFormatted = strNumber.substring( 0, nPos ) + " mb";
    }
    else
    {
      nNumber = nNumberToFormat / 1000;       // Kilo
      strNumber = round( nNumber.toString() );

      nPos = getPos( strNumber );
      strFormatted = strNumber.substring( 0, nPos ) + " kb";
    }

    return strFormatted;

  },

  /**
   * formats a time insexonds to HH:MM:SS time format
   * @param nSeconds number of seconds
   * @param fLeadingZeroes if true add leading zeroes
   * @returns {string}
   */
  formatTime: function ( nSeconds, fLeadingZeroes )
  {

    let nMin = Math.floor( nSeconds / 60 );

    let nSecs = nSeconds % 60;

    let strMinSecs = "";

    if ( nMin < 10 && fLeadingZeroes )
    {
      strMinSecs = "0";
    }


    strMinSecs += nMin + ":";

    if ( nSecs < 10 )
    {
      strMinSecs += "0";
    }

    strMinSecs += nSecs;

    let nPos = strMinSecs.indexOf( "." );

    if ( nPos > 0 )
    {
      strMinSecs = strMinSecs.substring( 0, nPos );

    }


    return strMinSecs;


  },

  formatString : function( strData, strFormat )
  {
    // todo needs format impl
    return strData;
  },

  formatNumber: function( nNbrTotFormat  )
  {
    const strNumberToFormat = nNbrTotFormat.toString();
    const aDigits = [];

    let nDigitCount = 0;

    for ( let x = strNumberToFormat.length - 1; x >= 0 ; x-- )
    {
      if ( ++nDigitCount > 3 )
      {
        nDigitCount = 1,
        aDigits.unshift( ",");
      }

      aDigits.unshift( strNumberToFormat[ x ] );
    }

    let strFormattedNbr = "";
    aDigits.forEach(( strChar ) =>
                    {
                      strFormattedNbr += strChar;
                    });

    return strFormattedNbr;

  },

  /**
   * Returns an array of any ${} macro place holders or null if no place holders were found
   *
   * @param strString The string to search
   * @param fIncludeMacroChars If true, returned the replced macro text with the macro characteres i.e. ${replacedVal}
   */
  getMacroPlaceHolders: function ( strString, fIncludeMacroChars )
  {
    let mapPlaceHolders = new VwHashMap();

    let nStartPos = 0;

    let nPos;

    while ( (nPos = strString.indexOf( "${", nStartPos )) >= 0 )
    {
      nPos += 2; // bump past the ${ chars

      let nEndPos = strString.indexOf( "}", nStartPos );

      if ( nEndPos < 0 )
      {
        throw "String " + strString + "is missing end } for macro definition";
      }

      let strMacroName = strString.substring( nPos, nEndPos );

      if ( typeof fIncludeMacroChars != "undefined" && fIncludeMacroChars )
      {
        strMacroName = "${" + strMacroName + "}";

      }

      mapPlaceHolders.put( strMacroName, null );

      nStartPos = ++nEndPos;

    }

    if ( mapPlaceHolders.size() == 0 )
    {
      return null;
    }

    return mapPlaceHolders.keys();

  },


  /**
   * Replace macros in string with values from the object. The macro name must be a property on the the object
   *
   * @param strSearchString The the string with macros to be replace
   * @param objValues The object containing the macro values
   *
   *
   */
  expandMacros: function ( strSearchString, objValues, strDefaultForNull )
  {

    let aMacroNames = this.getMacroPlaceHolders( strSearchString );

    if ( aMacroNames == null )
    {
      return strSearchString;  // No macros found, return original string
    }

    let strReplaceString = strSearchString;

    for ( let x = 0; x < aMacroNames.length; x++ )
    {
      let strMacroName = aMacroNames[x];

      let strMacroValue;

      if( Array.isArray( objValues ))
      {
        strMacroValue = findFromValuesArray();
      }
      else
      {
        strMacroValue = VwUtils.getObjProperty( objValues, strMacroName );
      }
      if ( typeof strMacroValue == "undefined" )
      {
        if ( !strDefaultForNull  )
        {
          strMacroValue = strDefaultForNull;
        }
        else
        {
          continue;
        }

      }  // end if

      strReplaceString = this.replaceAll( strReplaceString, "${" + strMacroName + "}", strMacroValue );
    }

    return strReplaceString;

    // Attemp to resolve macroname for an array of objects
    function findFromValuesArray()
    {
      // THIS WAS CHANGED BECAUSE LET AND CONST INSIDE A FOR LOOP ARE NOT SUPPORTED IN IE
      let  obj;
      for(obj of objValues )
      {
        const strPropVal = VwUtils.getObjProperty( obj, strMacroName );
        if ( strPropVal )
        {
          return strPropVal;
        }
      }

      return null;

    }

  },


  /**
   * Replaces a string that has property keys with the key values in a resource bundle
   *
   * @param strPropPrefix The property key prefix i.e. @@myPropKey where '@@' is the prop prefix and 'myPropKey' is a key in the resource bundle
   * @param strOrigString The string containing the property keys to replace
   * @param vwresourceMgr The VwPropertyMgr instance
   */
  replacePropertyKeys: function ( strPropPrefix, strOrigString, vwresourceMgr )
  {

    let nKeyPos = strOrigString.indexOf( strPropPrefix );
    let nStartPos = 0;

    let strReplaced = "";

    while ( nKeyPos >= 0 )
    {
      strReplaced += strOrigString.substring( nStartPos, nKeyPos );

      let nWhiteSpacePos = this.findDelimiter( strOrigString, [" ", "\t", "\n", ",", ":", ";", "!", "<br/>", "<br>"], nKeyPos );

      if ( nWhiteSpacePos < 0 )
      {
        nWhiteSpacePos = strOrigString.length;
      }

      // Get the substring to replace

      let strPropKey = strOrigString.substring( (nKeyPos + strPropPrefix.length), nWhiteSpacePos );

      strReplaced += vwresourceMgr.getString( strPropKey );

      nStartPos = nWhiteSpacePos;

      // Look for next occurrence
      nKeyPos = strOrigString.indexOf( strPropPrefix, nStartPos );

    } // end while()


    // Add any remaining characters in the string
    if ( nStartPos < strOrigString.length )
    {
      strReplaced += strOrigString.substring( nStartPos );


    }

    return strReplaced;


  },

  /**
   * Finds the position of a whitespace character staring from the start pos
   * @param strSearchString The staring to search
   * @param nStartPos The starting position within the starting to start the search, if omitted defaults to zero
   */
  findWhiteSpacePos: function ( strSearchString, nStartPos )
  {
    if ( !nStartPos )
    {
      nStartPos = 0;

    }


    for ( let x = nStartPos, nLen = strSearchString.length; x < nLen; x++ )
    {
      let ch = strSearchString[x];

      if ( this.isWhiteSpace( ch ) )
      {
        return x;
      }
    }

    return -1; // not found


  },

  /**
   * Finds the position of a delimiter character staring from the start pos
   * @param strSearchString The staring to search
   * @param nStartPos The starting position within the starting to start the search, if omitted defaults to zero
   */
  findDelimiter: function ( strSearchString, astrDelims, nStartPos )
  {
    if ( !nStartPos )
    {
      nStartPos = 0;

    }

    for ( let x = nStartPos, nLen = strSearchString.length; x < nLen; x++ )
    {
      let ch = strSearchString[x];


      // see if the is an html line break <br/> sequence
      if ( ch == "<" )
      {
        for ( let y = x + 1; y < nLen; y++ )
        {
          ch += strSearchString[y];

          if ( strSearchString[y] == ">" )
          {

            break;
          }

        }
      }


      if ( this.isInSet( ch, astrDelims ) )
      {
        return x;
      }

    }

    return -1; // not found


  },

  /**
   * Test to see if the string is in the array set
   *
   * @param strSearch The serach string or character
   * @param astrSet array of strings/chars to search
   */
  isInSet: function ( strSearch, astrSet )
  {
    for ( let x = 0, nLen = astrSet.length; x < nLen; x++ )
    {
      if ( strSearch == astrSet[x] )
      {
        return true;
      }
    }

    return false;

  },


  /**
   * Make a primitive JSON object array from an array of primitives
   * @param strType The type name, must be one of string,int,long,double,boolean,date
   *
   * @param aPrimitives The array of primitives
   */
  makePrimitiveJSONArray: function ( strType, aPrimitives )
  {

    let fUseQuotes = ( strType == "string" || strType == "date" )

    let strJSon = "{" + strType + ":[";

    for ( let x = 0; x < aPrimitives.length; x++ )
    {
      if ( x > 0 )
      {
        strJSon += ",";
      }

      if ( fUseQuotes )
      {
        strJSon += "\"";
      }


      strJSon += aPrimitives[x];

      if ( fUseQuotes )
      {
        strJSon += "\"";
      }

    }

    strJSon += "]}";


    return strJSon;

  },

  /**
   * Return the length of the string in pixel width
   *
   * @param strListId       The DOM element ID to check for font style
   * @param strOrigString   The string to measure
   * @param strClass        A class style to be added
   * @returns {*}
   */
  getLengthInPixels: function ( strListId, strOrigString, strClass )
  {

    const  objCSSProps = {
      "font-size"  : $( "#" + strListId ).css( "font-size" ),
      "font-weight": $( "#" + strListId ).css( "font-weight" ),
      "font-family": $( "#" + strListId ).css( "font-family" )
    };

    if ( typeof String.prototype.visualLength == "undefined" )
    {

      String.prototype.visualLength = function ()
      {
        $( "#vwRuler" ).html( this.toString() );
        return $( "#vwRuler" ).width();
      }

    }

    if ( !$( "#vwRuler" )[0] )
    {
      // Put the ruler in body so we can measure strings in pixel length
      $( 'body' ).append( "<span id='vwRuler' style='visibility: hidden; display: inline-block; white-space: nowrap;'></span>" );
    }

    // Add font style and CSS to ruler
    $( "#vwRuler" ).css( objCSSProps ).addClass( strClass );

    if ( strOrigString )
    {
      return strOrigString.visualLength();
    }

  },

  /**
   * Returns an object with the width and height of the string
   *
   * @param strOrigString The string to test
   * @returns an Object that has width and height properties and numbers
   */
  getTextMetrics: function ( strOrigString, strClass, strFontSize, strFontFamily )
  {

    if ( typeof String.prototype.textMetrics == "undefined" )
    {
      String.prototype.textMetrics = function ()
      {
        $( "#vwRuler" ).html( this.toString() );

        return {"width": $( "#vwRuler" ).width(), "height": $( "#vwRuler" ).height()};
      }

    }


    if ( !$( "#vwRuler" )[0] )
    {
      // Put the ruler in body so we can measure strings in pixel length
      $( 'body' ).append( "<span id='vwRuler' style='visibility: hidden; white-space: nowrap;'></span>" );

    }

    // if a class was specified, assume a different font
    if ( strClass )
    {
      $( "#vwRuler" ).attr( "class", strClass );

    }
    else
    if ( strFontSize )
    {
      $( "#vwRuler" ).css( "font-size", strFontSize );

      if ( strFontFamily )
      {
        $( "#vwRuler" ).css( "font-family", strFontFamily );

      }
    }

    return strOrigString.textMetrics();

  },

  /**
   * Gets a url parameter value
   * @param strParamName The parameter name toget the value for
   * @returns {string|null}
   */
  getUrlParam: ( strParamName ) =>
  {
    let ndx = window.location.href.indexOf( "?");

    if ( ndx < 0 )
    {
      return null;
    }

    const aParamPairs = window.location.href.substring( ++ndx ).split( "&");

    for ( const param of aParamPairs )
    {
      const aParamParts = param.split( "=");
      if ( aParamParts[ 0 ] == strParamName )
      {
        return aParamParts[ 1 ];
      }
    }

    return null;

  },

  /**
   * Gets text selected in the browser
   * @returns {string}
   */
  getSelectedText: function()
  {
    const selected = window.getSelection();
    return selected.toString();

  },
  
  /**
   * Converts a metric unit (em,pt,cm,in... to pixel units
   * @param strMetricUnits The metric unis to convert
   */
  convertToPixels: function ( strMetricUnits )
  {
    if ( !$( "#vwMetrics" )[0] )
    {
      // Put the ruler in body so we can measure strings in pixel length
      $( 'body' ).append( "<div id='vwMetrics' style='display:none; white-space: nowrap;'></div>" );

    }


    $( "#vwMetrics" ).css( "width", strMetricUnits );

    let strVal = $( "#vwMetrics" ).css( "width" );

    return Number( strVal.substring( 0, strVal.length - 2 ) ); // strip off the px returned by css query


  },


  /**
   * Truncates the string with an ellipsis, if the string width in pixels exceeds the max size parameter
   *
   * @param strOrigString The string to test
   * @param nMaxSize The max size in pixels
   *
   * @returns {*}
   */
  toEllipsis: function ( strOrigString, nMaxSize )
  {

    let nLenInPixels = this.getLengthInPixels( strOrigString );
    let nEllipsisLen = this.getLengthInPixels( "..." );

    let strCopy = strOrigString;

    let ndx = strCopy.length;

    if ( nLenInPixels <= nMaxSize )
    {
      return strOrigString;
    }

    // Take off characters from the end until string fist into max size
    while ( (nLenInPixels + nEllipsisLen) >= nMaxSize ) // String exceeds max length,, truncate with  ellipsis
    {
      strCopy = strCopy.substring( 0, --ndx );
      nLenInPixels = this.getLengthInPixels( strCopy );
    }

    return strCopy + "...";
  },

  /**
   * Converts a number in base 10 to hex
   * @param strVal
   * @return {String}
   */
  toHex: function ( strVal )
  {

    let strHex = Number( strVal ).toString( 16 );

    if ( strHex.length == 1 )
    {
      strHex = "0" + strHex;
    }


    return strHex;

  },

  /**
   * Converts an rgb string in the form rgb(r,g,b) to a hex string
   * @param strRgb
   * @return {string}
   */
  rgbToHex: function ( strRgb )
  {

    if ( !strRgb || strRgb == "transparent" || strRgb == "rgba(0, 0, 0, 0)" )
    {
      return "transparent";
    }


    let nPos = strRgb.indexOf( "(" );


    let nEndPos = strRgb.indexOf( ")" );

    if ( nEndPos < 0 )
    {
      nEndPos = strRgb.length;
    }

    let strRgbValues = strRgb.substring( ++nPos, nEndPos );

    let aValues = strRgbValues.split( "," );

    let strResult = "";

    for ( let x = 0; x < 3; x++ )
    {
      strResult += this.toHex( aValues[x] );
    }


    return "#" + strResult;
  },

  /**
   * Converts a 6 digit hext color string to rgb
   * @param strHex The hex string - it may start with or without  the '#' character
   *
   * @return and rgb array
   */
  hexToRgb:function( strHexColor )
  {
    let strColor;

    if ( strHexColor.startsWith( "#"))
    {
      strColor = strHexColor.substring( 1);
    }
    else
    {
      strColor = strHexColor;
    }

    const aRgbHex = strColor.match(/.{1,2}/g);

    const r = parseInt(aRgbHex[0], 16);
    const g = parseInt(aRgbHex[1], 16);
    const b = parseInt(aRgbHex[2], 16);

    return [r,g,b];


  },

  /**
   * convert time in seconds to s string in MM:SS
   *
   * @param nSeconds The total time is seconds
   *
   * @param fLeadingZeroes if true format with leading zeroes
   * @param fIncludeHours if true include hours if they are zero
   * @returns {string}
   */
  secsToString: function ( nSeconds, fLeadingZeroes, fIncludeHours )
  {

    let nMin = Math.floor( nSeconds / 60 );

    let nHours = Math.floor( nMin / 60 );

    let nSecs = nSeconds % 60;

    if ( nHours > 0 )
    {
      nMin = nMin % 60;

    }

    let strTime = "";


    if ( nHours > 0 && nHours < 10 && fLeadingZeroes )
    {
      strTime = "0";
    }

    if ( nHours > 0 || fIncludeHours )
    {
      strTime += nHours + ":";
    }

    if ( nMin < 10 && fLeadingZeroes )
    {
      if ( nHours > 0 )
      {
        strTime += "0";
      }
      else
      {
        strTime = "0";

      }
    }


    strTime += nMin + ":";

    if ( nSecs < 10 )
    {
      strTime += "0";
    }

    strTime += nSecs;

    let nPos = strTime.indexOf( "." );

    if ( nPos > 0 )
    {
      strTime = strTime.substring( 0, nPos );

    }


    return strTime;


  },

  /**
   * Count occurrences of a substring within a string
   * @param strString The string to search
   * @param strSearch The caracter seq to search for
   */
  count: function ( strString, strSearch )
  {
    let nCount = 0;

    let nPos = strString.indexOf( strSearch, 0 );

    while ( nPos >= 0 )
    {
      ++nCount;

      nPos = strString.indexOf( strSearch, ++nPos );
    }


    return nCount;
  },

  enCrypt: function ( strStringToEncrypt )
  {
    // First Basse64 encode

    let astrSignitures = ["X32","MOV", "JWS", "KFV", "PBV", "RVS", "LML"];

    let strB64Encoded = $.base64Encode( strStringToEncrypt );

    strB64Encoded  = VwExString.replaceAll( strB64Encoded, "/", "@" );

    let ndx = VwUtils.getRandomInt( 0, astrSignitures.length ) % astrSignitures.length;

    let aSigPading = [ astrSignitures[ ndx ] ];

    // Generate random hex bytes around the secret 3 byte signiture
    for ( let x = 0; x < 4; x++ )
    {
      let nbr = VwUtils.getRandomInt( 1, 255 );

      let strHex = nbr.toString( 16 ).toUpperCase();

      if ( strHex.length < 2 )
      {
        strHex += strHex;
      }

      aSigPading.push( strHex );
    }

    aSigPading.sort( function()
                     {
                       return Math.random() * 1000;
                     });

    let strResult = "";

    for ( let x = 0; x < 5; x++ )
    {
      strResult += aSigPading[ x ];
    }


    // Parse the sbase64 string into 4 chunks

    let nChunkLen = Math.floor( strB64Encoded.length / 4 );
    let nChunkRemain = strB64Encoded.length % 4;

    let astrChunks = [];

    for ( let x = 0; x < 3; x++ )
    {
      astrChunks[ x ] = strB64Encoded.substring( x * nChunkLen, nChunkLen * (x + 1));
    }

    astrChunks[ 3 ] = strB64Encoded.substring( nChunkLen * 3 );

    let aChunkOrders = shuffleArray( [0,1,3,2]);

    let strDict = "";
    let strMsgChunks = "";

    for( let x = 0; x < 4; x++ )
    {
      let nChunkNbr = aChunkOrders[ x ];

      let nLen = nChunkLen;

      if ( nChunkNbr == 3 )
      {
        nLen = nChunkLen + nChunkRemain;
      }

      let strChunkLen = VwExString.lPad( nLen.toString( 16 ), "0", 6 );


      strDict += "0" + nChunkNbr + strChunkLen;

      strMsgChunks += astrChunks[ nChunkNbr ] + getChunkFiller();

    }

    let strDictB64 = $.base64Encode( strDict );

    let strDictLen = VwExString.lPad( strDictB64.length.toString( 16 ), "0", 2 );

    strResult += strDictLen + strMsgChunks + strDictB64;

    // Create an MD5 Digents of the data

    let strHash = CryptoJS.MD5( strResult).toString();

    strResult += strHash;

    return strResult;

    function shuffleArray(array)
    {
        for (let i = array.length - 1; i > 0; i--)
        {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }

        return array;
    }

    function getChunkFiller()
    {
      let strFiller = "";

      for ( let x = 0; x < 2; x++ )
      {
        let nbr = VwUtils.getRandomInt( 1, 255 );
        strFiller += VwExString.lPad( nbr.toString(16), "0", 2 );
      }

      return strFiller;
    }
  },


  /**
   * Decrypt a String that was encrypted by the enCrypt method
   * @param strStringToDecrypt
   */
  deCrypt:function( strStringToDecrypt )
  {

    if ( strStringToDecrypt.length < 43 )
    {
      return null;  // String is less than the prefix - invalid and hash

    }

    let nHashPos = strStringToDecrypt.length - 32;

    let strHash = strStringToDecrypt.substring( nHashPos );

    let strMsg = strStringToDecrypt.substring( 0, nHashPos );

    let strMsgHash = CryptoJS.MD5( strMsg ).toString();


    if ( strMsgHash != strHash )
    {
      return null;               // Msg invalid

    }


    // Get dictionary Length

    let nDictLength = getChunkLength( strMsg.substring( 11, 13 ) );

    let nPos =  strStringToDecrypt.length - 32; // 32 bytes for hash

    nPos -= nDictLength; // Dictionary is 24 bytes

    if ( nPos < 11 )
    {
      return null;          // if its less that 11 we are pointing to message prefix or its out of bounds so its invalid
    }

    let strDictionary =  strStringToDecrypt.substring( nPos, nPos + nDictLength );

    // convert from base 64

    strDictionary = $.base64Decode( strDictionary ).toString();

    let aChunkArray = ["","","",""];


    /// go through the dictionary and reconstruct the base64 message chunks

    let nChunkPos = 13;
    for ( let x = 0; x < 4; x++ )
    {
      let strEntry = strDictionary.substring( 0, 8 );
      strDictionary = strDictionary.substring( 8);

      // first 2 bytes are the chunk index - strip off first

      let nChunkNdx = Number( strEntry.substring( 0, 2 ));
      let nChunkLen = getChunkLength( strEntry.substring( 2 ) );

      let strMsgChunk = strMsg.substring( nChunkPos, nChunkPos + nChunkLen );

      aChunkArray[ nChunkNdx ] = strMsgChunk;

      nChunkPos += nChunkLen + 4;  // 4 is the filler we don't care about

    }

    let strB64Msg = "";

    for ( let x = 0; x < 4; x++ )
    {
      strB64Msg += aChunkArray[ x ];
    }

    strB64Msg = VwExString.replaceAll( strB64Msg, "@", "/" );

    return $.base64Decode( strB64Msg ).toString();

    function getChunkLength( strLength )
    {
      let nStartPos = 0;

      for ( let x = 0, nLen = strLength.length; x < nLen; x++ )
      {
        if ( strLength.charAt( x ) != "0")
        {
          break;
        }

        ++nStartPos;
      }

      // Length is in hex

      let strHexLen = strLength.substring( nStartPos );

      let nLen = parseInt( strHexLen, 16 );

      return nLen;
    }
  },


  /**
   * Left pads the string for the length requested
   * @param strString  The original string to pad
   * @param strPadChar The pad character
   * @param nLen The length of the new string
   * @returns {*}
   */
  lPad:function( strString, strPadChar, nLen )
  {
    if ( strString.length == nLen )
    {
      return strString;
    }

    let nPadAmt = nLen - strString.length;

    let strPad = "";
    for ( let x = 0; x < nPadAmt; x++ )
    {
      strPad += strPadChar;
    }

    return strPad + strString;

  },
  /**
   * Right pads the string for the length requested
   * @param strString  The original string to pad
   * @param strPadChar The pad character
   * @param nLen The length of the new string
   * @returns {*}
   */
  rPad:function( strString, strPadChar, nLen )
  {
    if ( strString.length == nLen )
    {
      return strString;
    }

    let nPadAmt = nLen - strString.length;

    let strResult = strString;

    for ( let x = 0; x < nPadAmt; x++ )
    {
      strResult += strPadChar;
    }

    return strResult;
  },
  /**
   * Generates UUID (GUID)
   * @returns {string}
   */
  genUUID:function()
  {
    let dtNow = new Date().getTime();
    let strUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function ( c )
    {
      let r = (dtNow + Math.random() * 16) % 16 | 0;

      dtNow = Math.floor( dtNow / 16 );

      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString( 16 );
    });

    return strUuid;

  },

  /**
   * Generates a hash from a string
   * @returns {string}
   */
  genHash:function( strStringToHash )
  {
    return strStringToHash.split("").reduce(function(a, b)
    {
     a = ((a << 5) - a) + b.charCodeAt(0);
     return a & a;
    }, 0);

  },

  /**
   * Translates the strVal string to a propery value if the staring starts with a # character
   * @param vwresourceMgr The VwPropertyMgr instance for property key translation
   * @param strVal The string value to translate if necessary. Tf the staring starts with a single # character its a property
   * key and will call the VwPropertyMgr toresolove the value. Use a double ## if the # character is a litereal in the string. If the strVal param does not
   * start with a # then the value is hust returned
   * @returns {*}
   */
  getValue:function( vwresourceMgr, strVal )
  {
    if ( strVal.startsWith( "##") )  // A double ## escapes the single # which means its literal text
    {
      return  strVal.substring( 1 );
    }
    else
    if ( strVal.startsWith( "#") )   // Single # is a property key
    {
      if ( !vwresourceMgr )
      {
        throw "No VwPropertyMgr instance was specified for the resourceMgr property for toolTip spec: " + strVal;
      }

      return vwresourceMgr.getString( strVal.substring( 1 ) );
    }

    // No # sign, just return the litereal string
    return strVal;

  }

}

export default VwExString;

function getPos( strNumber )
{

  let nPos = strNumber.indexOf( ".")

   if ( nPos < 0 )
   {
     nPos = strNumber.length;
   }
   else
   {
     nPos += 3;
   }

  return nPos;


}


function round( strNumber )
{

  let nVal = Number( strNumber );

  return Number(Math.round(nVal+'e'+1)+'e-'+1 ).toString();

}







