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

/**
 * Dynamic script tag loader
 *
 * @param src The script src attribute to load - required
 * @param bWait If true this function returns a promise and must be used in an async/await call
 *
 * @returns {Promise<unknown>} only if bWait param is true, otherwise the load request is issued and immediatlty returns
 * @constructor
 */
async function VwScriptImport( src, bWait )
{

  const strScript = $( `script[src='${src}']` )[0];

  if ( strScript )
  {
    return;
  }

  if ( !bWait )  // this is an async call
  {
    loadScript( false )
    return;
  }
  else
  {
    await loadScript( true )
  }

  /**
   * Loads the script
   *
   * @param fnComplete if call back is specified, we wait until the script has been loaded to return
   */
  function loadScript( bWait )
  {
    const eleScript = $( "<script>" )[0];

    eleScript.src = src;
    eleScript.async = true;

    // Just request the script to load and return (async)
    if ( !bWait )
    {
      document.body.appendChild( eleScript );
    }
    else
    {
      return new Promise( loadScriptPromise );

      function loadScriptPromise( success, fail )
      {
        // wait for script to load
        eleScript.addEventListener( "load", () =>
        {
          success();
        });

        document.body.appendChild( eleScript );

      } // end loadScriptPromise(

    } // end else

  } // end LoadScript


} // end VwScriptImport{}

