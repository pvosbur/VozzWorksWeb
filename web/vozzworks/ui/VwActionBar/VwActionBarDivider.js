/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   8/21/20

 Time Generated:   8:26 AM

 ============================================================================================
 */

/**
 * Defines a divider element
 * @param objProperties The properties are:
 *        css:String,Optional The css for the divider
 * @constructor
 */
function VwActionBarDivider( objProperties )
{
  Object.defineProperty( this, "css", {
    set: function ( strCss )
    {
      objProperties.css = strrCss;
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

} // end VwActionBarDivider{}

export default VwActionBarDivider;