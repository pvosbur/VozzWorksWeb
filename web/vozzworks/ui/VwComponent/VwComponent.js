/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   12/10/18

 Time Generated:   8:51 AM

 ============================================================================================
 */

import VwUi from "/vozzworks/ui/VwUi/VwUi.js";

/**
 * This is the super class for all UI components that are part of a VwView
 *
 *
 * @param component  The instantiating subclass component instance
 * @param compContainer The component container objects
 *
 * @constructor
 */
function VwComponent( component, compContainer )
{
  if ( arguments.length == 0 )
  {
    return;
  }

  const self = this;

  // Public Methods
  this.getComponentName = () => compContainer.constructor.name;


  VwUi.call( self, component );

  configObject();

  /**
   * Puts view on top of stack
   */
  function configObject()
  {
    addComponent();

  }

  /**
   * Sets this object as the current and calls its render method
   * @param view
   */
  function addComponent()
  {


    // Add the components to the parnetContainer map
    const aCompoentsByContainer = getComponentsForParent()

    aCompoentsByContainer.push( self );

  } // end addComponent()


  /**
   * Get components registered to a parentContainer
   * @param parentContainer
   */
  function getComponentsForParent()
  {
    // New current view -- top of stack
    const compMap = getComponentMap();

    let aComponentsByParentView = compMap.get( self.getComponentName() );

    // Create an empty array if no components have been registered yet
    if ( !aComponentsByParentView )
    {
      aComponentsByParentView = [];
      compMap.put( compContainer, aComponentsByParentView );
    }

    return aComponentsByParentView;

  } // end getComponentsForParent()


} // end VwComponent{}

/**
 * Static method to close all components for a parent container
 * @param parentContainer The parent container that is closing
 */
VwComponent.closeComponents = ( parentContainer ) =>
{
  const compMap = getComponentMap();

  if ( !compMap )
  {
    return;   // Nothing to do, no components registered to this view
  }

  const aComponentsByView = compMap.get( parentContainer );

  if ( aComponentsByView )
  {
    for ( const VwComponent of aComponentsByView )
    {
      VwComponent.close();
    }
  }

} // end closeComponents


export default VwComponent;

VwComponent.prototype = new VwUi();
VwComponent.prototype.constructor = VwComponent;
