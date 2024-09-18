/*
 * Created by User: petervosburgh
 * Date: 10/23/22
 * Time: 8:14 AM
 * 
 */

import VwUiUtils from "/vozzworks/ui/VwCommon/VwUiUtils.js";

/**
 * This manages an exit(escape) from the html element id specified. It monitors for the escape key for a click outside the element
 *
 * @param strHtmlElementId The element to test if a mouse click was outside of the element id
 * @param fnExitHandler The exit callback which is invoked the the escape key was hit or the mouse was clicked outside the element
 *
 * @constructor
 */
function VwUiExitMgr( strHtmlElementId, fnExitHandler, bEscaprOnly )
{
  const m_vwUiutils = new VwUiUtils();

  this.remove = remove;


  configObject();

  function configObject()
  {
    if ( !bEscaprOnly )
    {
      m_vwUiutils.installOutsieClickDetector( strHtmlElementId, fnExitHandler );
    }

    // also look for escape key
    $( document ).keydown( (ke ) =>
                           {
                             if ( ke.keyCode == 27 )
                             {
                               fnExitHandler();
                             }
                           });


  } // end configObject()

  function remove()
  {
    m_vwUiutils.removeOutsideClickDetector();
    $( document ).off( "keydown");

  }
 } // end VwUiExitMgr{}

export default VwUiExitMgr;