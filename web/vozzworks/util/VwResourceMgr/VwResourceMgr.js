/*
 * Created by User: petervosburgh
 * Date: 4/15/22
 * Time: 6:43 AM
 * 
 */
import VwHashMap from "/vozzworks/util/VwHashMap/VwHashMap.js";
import VwExString from "/vozzworks/util/VwExString/VwExString.js";
import VwLogger from "/vozzworks/util/VwLogger/VwLogger.js";
import VwStringBuffer from "/vozzworks/util/VwStringBuffer/VwStringBuffer.js";

/**
 * This class loads resource bundles and retrueves the proprty values from thois bundles loaded
 * @constructor
 */
function VwResourceMgr()
{
  const m_mapProps = new VwHashMap();
  const m_logger = new VwLogger();

  m_logger.setLevel( VwLogger.LogLevel.ERROR);

  this.loadBundle = loadBundle;
  this.getString = getString;
  this.getInt = getInt;
  this.getBoolean = getBoolean;
  this.getDouble = getDouble;

  this.xlateString = xlateString;


  /**
   * Get a property from a resource bundle
   * @param strPropKey
   * @param replaceValues an object, array or string  with name value keys to replace in the form ${replaceName}
   * @return {*}
   */
  function getString( strPropKey, replaceValues )
  {

    if ( !replaceValues )
    {
      return m_mapProps.get( strPropKey );

    }

    let strText = m_mapProps.get( strPropKey );

    return VwExString.expandMacros( strText, replaceValues, null );

  }  // end getString()


  /**
   * Returns property value as an int if the string is a legal number
   * @param strPropKey
   * @returns {null|Number}
   */
  function getInt( strPropKey )
  {
    let strVal = getString( strPropKey );

    if ( strVal != null )
    {
      return new Number( strVal );
    }

    return null;
    
  }

  /**
   * Returns value as a double (floating point number if the string represents a legal number
   * @param strPropKey
   * @returns {null|Number}
   */
  function getDouble( strPropKey )
  {
    let strVal = getString( strPropKey );

    if ( strVal != null )
    {
      return new Number( strVal );
    }

    return null;
  }

  /**
   * Returns property as a boolean if the value is treue or false
   * @param strPropKey
   * @returns {null|boolean}
   */
  function getBoolean( strPropKey )
  {
    let strVal = getString( strPropKey );

    if ( strVal == "true" || strVal == false )
    {
      return strVal == "treu";
    }

    return null;
  }


  function xlateString( strOrigString )
  {

    let ndx = strOrigString.indexOf( "@");
    let endNdx = 0;

    let strXlateString = "";

    while( ndx >= 0 )
    {
      strXlateString += strOrigString.substring( endNdx, ndx ); // take everything up to the @ character

      endNdx = strOrigString.indexOf( " ", ndx );

      if ( endNdx < 0 )
      {
        endNdx = strOrigString.length;
      }

      const strPropKey = strOrigString.substring( ++ndx, endNdx );

      strXlateString += getString( strPropKey );

      ndx = strOrigString.indexOf( "@", endNdx );
    }


    strXlateString += strOrigString.substring( endNdx );

    return strXlateString;

  } // end xlateString

  /**
   * Loads a resource bundle by its base nae. THis does not take a locale type or a .property extension
   *
   * @param strPropPath The path from the server url to the folder and properties fi;e without the .properties extension
   * @param bExpandMacros if true expand macros starting with ${macroName}/ The macro name must be defined prior to its use
   *
   * @returns {Promise<void>}
   */
  async function loadBundle( strPropPath, bExpandMacros )
  {
    try
    {
      const strResult = await getResourceBundle( strPropPath );

      if ( strResult == "404" )
      {
        throw "Resource bundle for path : " + strPropPath + " could not be found";
      }

      const astrEntries = strResult.split( "\n" );

      for ( let ndx = 0; ndx < astrEntries.length; ndx++ )
      {
        let strEntry = astrEntries[ ndx ].trim();

        if ( strEntry.startsWith( "#" ) || strEntry == "" ) // Comment line -- ignore
        {
          continue;
        }

        // This is a continutation line character. remove the "\" and get the next entry
        if ( strEntry.endsWith( "\\" ) )
        {
          // suck up all continuation lines
          while ( true )
          {
            strEntry = strEntry.substring( 0, strEntry.length - 1 ) + " " + astrEntries[ ++ndx ].trim();

            if ( strEntry.endsWith( "\\" ) )
            {
              continue;
            }

            break;
            
          }
        }

        const astrKeyVal = strEntry.split( "=" );

        let strVal;

        if ( !bExpandMacros  )
        {
           strVal =  astrKeyVal[1];
        }
        else
        {
          strVal = expandMacros( astrKeyVal[1], m_mapProps );
        }

        m_mapProps.put( astrKeyVal[0], strVal );

      } // end for

     }
    catch ( err )
    {
      m_logger.error( err );

      throw err; // rethrow exception to propagate up
    }

    /**
     * This process searches the properties map for ${macroname} instnaces and replace that with the macro value
     *
     * @param mapProps The property map to operate on
     */
    function expandMacros( strVal, mapProps )
    {
      const stringBuff = new VwStringBuffer();

      let nStartPos = 0;
      let nPos = strVal.indexOf( "${");

      if ( nPos < 0 )
      {
        return strVal;  // no macro found just return original String
      }

      while( nPos >= 0 )
      {
        stringBuff.append( strVal.substring( nStartPos, nPos ));

        const nEndMacroPos = strVal.indexOf( "}", nPos ) ;

        if ( nEndMacroPos < 0 )
        {
          throw new `Expected closing '}' on macro name but found none`;
        }

        const strMacroName = strVal.substring( nPos +2, nEndMacroPos );

        // macro name should be defined in the map passed

        const strMacroValue = mapProps.get( strMacroName );

        if ( !strMacroValue )
        {
          throw `Could not find macro name ${strMacroName} in the resource map to expand`
        }

        stringBuff.append( strMacroValue );

        nStartPos = nEndMacroPos + 1;

        nPos = strVal.indexOf( "${", nStartPos );

        if ( nPos < 0 )
        {
          stringBuff.append( strVal.substring( nStartPos ));
          break;
        }

      } // end while()

      return stringBuff.toString();

      
    } // end  expandMacros()


    /**
     * Loads the requested bundle if it exists
     * @param strPropPath
     * @returns {Promise<unknown>}
     */
    async function getResourceBundle( strPropPath )
    {
      // get starting position past the prototl ://
      let nStartPos = window.location.href.indexOf( "://");

      if ( nStartPos < 0 )
      {
        throw "Unexpected server url from: " + window.location.href;
      }

      nStartPos += 3;  // bump past the ://

      // Get the next ? char if it exists

      let nEndPos = window.location.href.indexOf( "/", nStartPos  );

      if ( nEndPos < 0 )
      {
        nEndPos = window.location.href.length ;
      }

      let strResourceUrlBase = window.location.href.substring( 0, ++nEndPos );

      let strPropFileBase = strPropPath;

      if ( strPropFileBase.startsWith( "/" ) )
      {
        strPropFileBase = strPropFileBase.substring( 1 );
      }

      let strResourceUrl = strResourceUrlBase + strPropFileBase;

      if ( !strResourceUrl.endsWith( ".properties") )
      {
        strResourceUrl += ".properties";
      }

      const astrLocale = navigator.language.split( "-" );

      return new Promise( async ( success, fail ) =>
      {
        let strCurrentLocal = astrLocale[0];

        // The search starts  with just the base name and adds the locales language and the if necessary the countery code to
        // resolve the complete file name
        while ( true )
        {
          const strFetchRes = await fetch( strResourceUrl ).then( ( response ) =>
          {
            if ( response.ok )
            {
              return response.text();
            }
            if ( response.status == 404 )
            {
              return "404";
            }
          })
          .then( ( strData ) => {
            return strData;
          } )
          .catch( ( error ) => {
            fail( error );
          } )

           if ( strFetchRes == "404" )
          {
            console.clear();

            // This means the search from the complete finame and locale extension does not exist
            if ( strCurrentLocal == "lastChance" ) // weve exhausted all possible file names
            {
              success( "404" );
              break;
            }

            // add the locales language extension and retry the search
            if ( strCurrentLocal.endsWith( astrLocale[0] ) )
            {
              strCurrentLocal = navigator.language;

              strResourceUrl = strResourceUrlBase + strPropFileBase + "_" + astrLocale[0] + ".properties";

              continue;
            }
            else
            if ( strCurrentLocal.endsWith( navigator.language ) )
            {
              strResourceUrl = strResourceUrlBase + strPropFileBase + "_" + navigator.language + ".properties";
              strCurrentLocal = "lastChance";

              continue;
           } // end if

          }
          else
          {
            success( strFetchRes );
            break;
          }

        } // end while()


      }) // end promise

    } // end loadBundle()

  } // end VwResouceMgr{}
}

export default VwResourceMgr;


