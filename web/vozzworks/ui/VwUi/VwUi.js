/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   2/17/22

 Time Generated:   1:52 PM

 ============================================================================================
 */

import VwHashMap from "/vozzworks/util/VwHashMap/VwHashMap.js";

/**
 * Superclass for all UI Objects
 *
 * @param uiObject Any UI OBject that is a subclass of VwView or VwComponent
 *
 * @constructor
 */
function VwUi( uiObject )
{
  if ( arguments.length == 0 )
  {
    return;  // Prototype call
  }

  const self = this;

  if ( !self.render )
  {
    throw `The ui component "${uiObject.constructor.name}"  must define a public render() method`;

  }
  else
  {
    self.render();
  }

  const m_mapExtras = new VwHashMap();

  /**
   * Get an extra object given its key
   *
   * @param key The key of the extra object to retrieve
   * @returns {*}
   */
  this.getExtras = (key) => m_mapExtras.get( key );

  /**
   *
   * @param key The key of the extra to put
   * @param val  The value of the extra to put
   */
  this.putExtras = (key, val ) => m_mapExtras.put( key, val );

  /**
   * Removes an extra
   *
   * @param key The key of the extra to remoce
   * @returns {*}
   */
  this.removeExtras = ( key ) => m_mapExtras.remove( key );

  /**
   * Returns the UI object instance of this view or component
   */
  this.getUiObject = () => uiObject;

}

export default VwUi