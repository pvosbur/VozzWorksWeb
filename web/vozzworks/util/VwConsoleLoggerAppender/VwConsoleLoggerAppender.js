/*
 * Created by User: petervosburgh
 * Date: 4/23/22
 * Time: 8:07 AM
 * 
 */

import VwLogger from "/vozzworks/util/VwLogger/VwLogger.js";
import VwLoggerAppender from "/vozzworks/util/VwLoggerAppender/VwLoggerAppender.js";

function VwConsoleLoggerAppender()
{

  this.logMsgEvent = logMsgEvent;

  VwLoggerAppender.call( this, this );

  function logMsgEvent( logLevel, strMsgToLog )
  {
    return new Promise( (success, fail ) =>
    {
      switch ( logLevel )
      {
        case VwLogger.LogLevel.INFO:
        case VwLogger.LogLevel.DEBUG:

          writeToConsole( "log", strMsgToLog );
          break;

        case VwLogger.LogLevel.WARN:

          writeToConsole( "warn", strMsgToLog );

          break;

        case VwLogger.LogLevel.ERROR:
        case VwLogger.LogLevel.FATAL:

          writeToConsole( "error", strMsgToLog );
          break;

        case VwLogger.LogLevel.TRACE:
          
          writeToConsole( "trace", strMsgToLog );
          break;

      } //end switch()

      success();

    });



  } // end logEvent()


 /**
  * Wrutes the log msg to the console using the name of the console method to use
  *
  * @param strLogMethodName The console method too use I.E log, warn, error
  * @param strMsg The msg to write to the console
  */
  function writeToConsole( strLogMethodName, strMsg )
  {
    console[strLogMethodName]( `%c${strMsg}`, "font-family:Courier New;font-weight:bold" );

  }
} // end VwConsoleLoggerAppender{}

VwConsoleLoggerAppender.prototype = new VwLoggerAppender();

export default VwConsoleLoggerAppender;
