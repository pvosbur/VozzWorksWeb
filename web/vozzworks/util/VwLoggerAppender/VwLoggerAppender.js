/*
 * Created by User: petervosburgh
 * Date: 4/23/22
 * Time: 8:10 AM
 * 
 */
function VwLoggerAppender( appenderImpl )
{
  if ( arguments.length == 0 )
  {
    return; // subclass prototype call

  }

  if ( !appenderImpl.logMsgEvent )
  {
    throw "Appender must define the logEvent( promise, logMsg ) function"
  }

  this.logEvent = logEvent;

  async function logEvent( logEventType, strMsg )
  {
    return new Promise( async (success, fail ) =>
                        {
                          await appenderImpl.logMsgEvent( logEventType,  strMsg );
                          success();
                        })
   }
} // end VwLoggerAppender

export default VwLoggerAppender;