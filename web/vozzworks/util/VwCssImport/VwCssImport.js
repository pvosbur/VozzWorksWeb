
/**
 * Dynamically imports cee
 *
 * @param strHref The href path to import
 * @param bWait   if true this is an await call this must be invoked from an async method
 * @returns {Promise<unknown>}
 * @constructor
 */
function VwCssImport( strHref, bWait )
{
  // Create css cache if needed
  if ( !window._vsImportCache )
  {
    window._vsImportCache = {};
  }

  if ( !strHref.endsWith( ".css"))
  {
    strHref += ".css";

  }

  // If its in cache, dont re-add the css link tag
  if ( window._vsImportCache[ strHref ])
  {
    return;

  }

  window._vsImportCache[ strHref ] = true;

  if ( !bWait )
  {
    $( "head" ).append( '<link rel="stylesheet" href="' + strHref + '">' );
    return;
  }

  return new Promise( cssLoadPromise );

  function cssLoadPromise( success, fail )
  {
    const link = document.createElement( 'link' );

    link.type = "text/css";
    link.rel = "stylesheet"
    link.href = strHref;

    link.onload = () => success();

    $( "head" ).append( link );

  } // end cssLoadPromise()

} // end VwCssImport{}