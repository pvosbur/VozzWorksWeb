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
import VwStringBuffer from "/vozzworks/util/VwStringBuffer/VwStringBuffer.js";
import VwExString from "/vozzworks/util/VwExString/VwExString.js";
import VwDate from "/vozzworks/util/VwDate/VwDate.js";
import VwConsoleLoggerAppender from "/vozzworks/util/VwConsoleLoggerAppender/VwConsoleLoggerAppender.js";

function VwLogger()
{
  Object.freeze(  VwLogger.LogLevel);

  const m_astrFormatSpecifiers = [ "p", "d", "m", "M", "r", "C", "n"];

  const m_strDefaultPatterLayout = "%-5p, %C [%d{dd MMM yyyy HH:mm:ss SSS}], %m%n";

  const m_aLogAppenders = [];

  let m_strPatternLayout;

  let m_curLogLevel = VwLogger.LogLevel.INFO;  // default to debug log type

  let m_bDebugEnabled;
  let m_bOff = false;
  
  this.info = logInfo;
  this.debug = logDebug;
  this.warn = logWarn;
  this.error = logError;
  this.fatal = logFatal;
  this.trace = logTrace;

  this.setLogLevelFromString = setLogLevelFromString;

  this.setLevel = (logLevel ) =>
  {
    m_curLogLevel = logLevel;
    m_bDebugEnabled = logLevel.id <= VwLogger.LogLevel.DEBUG.id;
  }

  this.getLevel = () => m_curLogLevel;

  configureAppenders();

  /**
   * Sets the log level from  one of
   * @param strLogLevel
   */
  function setLogLevelFromString( strLogLevel )
  {
    switch( strLogLevel )
    {

      case "off":

        this.setLevel( VwLogger.LogLevel.OFF );
        break;

      case "fatal":

        this.setLevel( VwLogger.LogLevel.FATAL );
        break;

      case "error":

        this.setLevel( VwLogger.LogLevel.ERROR  );
        break;

      case "warn":

        this.setLevel( VwLogger.LogLevel.WARN );
        break;

      case "info":

        this.setLevel( VwLogger.LogLevel.INFO );
        break;

      case "debug":

        this.setLevel( VwLogger.LogLevel.DEBUG );
        break;

      case "trace":

        this.setLevel( VwLogger.LogLevel.TRACE );
        break;

      case "all":

        this.setLevel( VwLogger.LogLevel.ALL );
        break;

      default:

        throw `Invalid log level ${strLogLevel}`

    } // end switch

  } // end setLogLevelFromString( strLogLevel )


  function logFatal( strMsg )
  {

    const strFormattedLogMsg = getLogMsg( VwLogger.LogLevel.FATAL, strMsg );

    if ( strFormattedLogMsg )
    {
      sendLogEvent( VwLogger.LogLevel.FATAL, strFormattedLogMsg );
    }


  } // end logInfo()

  function logTrace( strMsg )
  {

    const strFormattedLogMsg = getLogMsg( VwLogger.LogLevel.TRACE, strMsg );

    if ( strFormattedLogMsg )
    {
      sendLogEvent( VwLogger.LogLevel.TRACE, strFormattedLogMsg );
    }


  } // end logInfo()

  function logError( strMsg )
  {

    const strFormattedLogMsg = getLogMsg( VwLogger.LogLevel.ERROR, strMsg );

    if ( strFormattedLogMsg )
    {
      sendLogEvent( VwLogger.LogLevel.ERROR, strFormattedLogMsg );
    }


  } // end logInfo()

  function logInfo( strMsg )
  {

    const strFormattedLogMsg = getLogMsg( VwLogger.LogLevel.INFO, strMsg );

    if ( strFormattedLogMsg )
    {
      sendLogEvent( VwLogger.LogLevel.INFO, strFormattedLogMsg );
    }


  } // end logInfo()

  function logWarn( strMsg )
  {

    const strFormattedLogMsg = getLogMsg( VwLogger.LogLevel.WARN, strMsg );

    if ( strFormattedLogMsg )
    {
      sendLogEvent( VwLogger.LogLevel.WARN, strFormattedLogMsg );
    }


  } // end logInfo()

  function logDebug( strMsg )
  {
    if ( m_bDebugEnabled && ! m_bOff )
    {
      const strFormattedLogMsg = getLogMsg( VwLogger.LogLevel.DEBUG, strMsg );
      sendLogEvent( VwLogger.LogLevel.DEBUG, strFormattedLogMsg );

    }
  } // end logInfo()


  function getLogMsg( msgLogLevel, strMsg )
  {
    // Error messgaes are always displayed regardledd of log level
    if ( msgLogLevel.id < m_curLogLevel.id  )
    {
      return "";
    }

    let strPatternLayout;

    if ( !m_strPatternLayout )
    {
      strPatternLayout = m_strDefaultPatterLayout;
    }

    return formatLogMsg( msgLogLevel, strPatternLayout, strMsg );

  }

  async function sendLogEvent( logEventType, strLogMsg )
  {
    for ( const appender of m_aLogAppenders )
    {
      await appender.logEvent( logEventType, strLogMsg );
    }
  }

  /**
   * Configure all defined appenders
   */
  function configureAppenders()
  {
    m_aLogAppenders.push( new VwConsoleLoggerAppender() );

  } // end configureAppenders()


  /**
   * Format the log message according to the patter layout
   * @param strFormatSpecifier
   */
  function formatLogMsg( msgLogLevel, strFormatSpecifier, strMsgToFormat  )
  {
    const sbLogMsg =  new VwStringBuffer();

    for ( let x = 0; x < strFormatSpecifier.length; x++ )
    {
      const strToken = strFormatSpecifier[ x ];

      if ( strToken == "%")
      {
        // Get all characters inbetween the "%" and the format soecifier
        let strSpecifier;

        let strSpecifierString = "";

        for ( ++x; x < strFormatSpecifier.length; x++ )
        {
          strSpecifier = strFormatSpecifier[ x ];

          if ( charIsSpecifier( strSpecifier ) )
          {
            break;
          }
          else
          {
            strSpecifierString += strSpecifier;
          }
        }

        switch( strSpecifier )
        {
          case "p":

            appendLogLevel( msgLogLevel, sbLogMsg, strSpecifierString );
            break;

          case "C":

            appendFunctionName( sbLogMsg, strSpecifierString );
            break;
            
          case "m":

            appendUserMsg( sbLogMsg, strMsgToFormat, strSpecifierString );
            break;

          case "d":

            if ( strFormatSpecifier[ x + 1] == "{")
            {
              let nEndPos = strFormatSpecifier.indexOf( "}", x );


              if ( nEndPos < 0 )
              {
                throw "Invalid date for %d, a '{' was found but no ending '}' was found";
              }

              strSpecifierString += ";" + strFormatSpecifier.substring( ++x, ++nEndPos );
              x = ++nEndPos; // Bump cursor past the date pattern

            }

            appendDate( sbLogMsg, strSpecifierString );

            break;

          case "n":

            sbLogMsg.append( getPlatormLineFeedChars() );
            break;

        } //m end switch()

      }
      else
      {
        // User text in specifer, just put in buffer
        sbLogMsg.append( strToken );
      }
    }

    return sbLogMsg.toString();

  }  // end formatLogMsg()

  /**
   *   Test to see if the character is a format specifier
   *
   * @param strCharTotest  the character to test
   * @returns {boolean} returns true if character is a format specifier
   */
  function charIsSpecifier( strCharTotest )
  {
    for ( const strSpecifier of m_astrFormatSpecifiers )
    {
      if ( strSpecifier == strCharTotest )
      {
        return true;
      }
    }

    return false;

  } // end harIsSpecifier()


  function appendUserMsg( sbLogMsg, strUserMsg, strSpecifer)
  {
     formatPaddedText( sbLogMsg, strUserMsg, strSpecifer );
  }


  /**
   * Format the LogLeve and add to the string buffer
   *
   * @param sbLogMsg the log msg buffer
   * @param strPatternLayout  The pattern layout 
   */
  function appendLogLevel( msgLogLevel,sbLogMsg, strPatternLayout )
  {
    formatPaddedText( sbLogMsg, msgLogLevel.text, strPatternLayout )
    
  } // end appendLogLevel{}

  function appendFunctionName( sbLogMsg, strSpecifierString )
  {
    const strStack = new Error().stack;
    const astrEntries = strStack.split( "at");

    // last index is the origen of the log statement
    let strFunctionInvoker = astrEntries[ astrEntries.length - 1 ];

    strFunctionInvoker = strFunctionInvoker.substring( strFunctionInvoker.lastIndexOf( "/") + 1 );

    formatPaddedText( sbLogMsg, strFunctionInvoker, strSpecifierString );
    return;
  }
  /**
   * Appends the current date -- formatted if format is specified in between {}
   *
   * @param sbLogMsg The log msg buffer to append to
   * @param strDateFormat
   */
  function appendDate( sbLogMsg, strDateFormat )
  {
    const astrDatePieces = strDateFormat.split( ";");
    let strPadding = astrDatePieces[ 0 ];
    let strDateFormatSpecifier = astrDatePieces[ 1 ];

    let strFormattedDate;


    if ( strDateFormatSpecifier )
    {
      if ( astrDatePieces[1].startsWith( "{" ) )
      {
        let strDateFormatSpeifier = strDateFormatSpecifier;
        strDateFormatSpeifier = strDateFormatSpeifier.substring( 1, strDateFormatSpeifier.length - 1 );

        strFormattedDate = getFormattedDate( strDateFormatSpeifier );
      }
      else
      {
        strFormattedDate = getFormattedDate();
      }


    }
     // if we get here we have both width modifier and a date format
    formatPaddedText( sbLogMsg, strFormattedDate,strPadding )


    /**
     * Return the formatted date
     * @param strDateFormat
     * @return {string}
     */
    function getFormattedDate( strDateFormat )
    {

      return VwDate.format( new Date(), strDateFormat );

   }
  } // end appendDate()

  /**
   * Format the text according to the pad length and add it to the log msg buffer
   *
   * @param sbLogMsgBuffer The log msg buffer to added the formatted mtext to
   * @param strTextToPad  The text to pad
   * @param strPatternLayout the format specifier string
   */
  function formatPaddedText( sbLogMsgBuffer, strTextToPad, strPatternLayout )
  {
    let bLeftPad = true;

    let strPadSize = "";

    if ( !strPatternLayout )
    {
      sbLogMsgBuffer.append( strTextToPad );
      return;
    }

    for ( let x = 0; x < strPatternLayout.length; x++ )
    {
      if ( strPatternLayout[ x ] == "-" )
      {
        bLeftPad = false;
        continue;

      }
      else
      {
        if ( isNaN( strPatternLayout[ x ] ))
        {
          throw "Invalid specifer ofr LogLevel. expected a padding number but got: " + strSpecifer[ x ]
        }

        strPadSize += strPatternLayout[ x ];

      } // end else

    } // end for()

    if ( strPadSize )
    {
      const nPadSize = new Number( strPadSize );

      const strText = getFormattedText( strTextToPad , bLeftPad, nPadSize);
      sbLogMsgBuffer.append( strText );

    }

  } // end formatPaddedText()


  /**
   * Returns the formatted appded text
   *
   * @param strText The text to format
   * @param bLeftPad true if left pad, false if right pad
   * @param nPadSize The padding size
   *
   * @returns {*}
   */
  function getFormattedText( strText, bLeftPad, nPadSize  )
  {

    if ( strText.length > nPadSize )
    {
      return strText.substring( 0, nPadSize );

    }
    if( bLeftPad )
    {
      return VwExString.lPad( strText, " ",  nPadSize );
    }
    else
    {
      return VwExString.rPad( strText, " ", nPadSize );

    }

  } // end getFormattedText()

  /**
   * Get the linefeed char sequence from the navigaotr useraget
   * @return {string}
   */
  function getPlatormLineFeedChars()
  {
    const strUserAgent = navigator.userAgent;

    if ( strUserAgent.indexOf( "Macin") >= 0 || strUserAgent.indexOf( "Linux") >= 0  )
    {
      return "\n";
    }
    else
    {
      return "\r\n";

    }
  }

} // end VwLogger{}

VwLogger.LogLevel =
        {
          OFF:{id:8,text:"OFF"},
          FATAL:{id:7,text:"FATAL"},
          ERROR:{id:6, text:"ERROR"},
          WARN:{id:5,  text:"WARN"},
          INFO:{ id:4, text:"INFO"},
          DEBUG:{id:3, text:"DEBUG"},
          TRACE:{id:2, text:"TRACE"},
          ALL:{id:1, text:"ALL"}

        }


export default VwLogger;