/**
 * Defines a divider elment
 * @param objProperties The properties are:
 *        css:String,Optional The css for the filler
 *        amt:String,Optional html metrics for the width/or height of the action bar
 * @constructor
 */
function VwActionBarFiller( objProperties )
{
  Object.defineProperty( this, "css", {
    set: function ( strFillerCss )
    {
      objProperties.css = strFillerCss;
    },
    get: function ()
    {
      if ( !objProperties )
      {
        return null;
      }

      return objProperties.css;
    }
  } );

  Object.defineProperty( this, "amt", {
    set: function ( strAmt )
    {
      objProperties.amt = strAmt;
    },
    get: function ()
    {
      if ( !objProperties )
      {
        return null;
      }

      return objProperties.amt;
    }
  } );

} // end VwActionBarFiller{}

export default VwActionBarFiller;