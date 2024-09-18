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
import VwComponent from "/vozzworks/ui/VwComponent/VwComponent.js";

/**
 * This is the super class for all UI screens that are considered views i,e,Cr8PhotoViwer, Cr8VideoViewer,Cr8ProjectLibrary etc...
 * @param view  The instantiating view instance
 * @param bIsModalView if true view is modal
 * @constructor
 */
function VwView( view, bIsModalView )
{
  if ( arguments.length == 0 )  // protoype init call
  {
    return;
  }

  const self = this;
  const m_bIsModalView = bIsModalView;

  // Public Methods

  /**
   * Gets the constructor name of the view
   * @returns {string}
   */
  this.getViewName = () => view.constructor.name;

  /**
   * C;ose the view
   * @type {closeView}
   */
  this.closeView = closeView;

  /**
   * Returns true if the view is modal
   */
  this.isModalView  = () => m_bIsModalView;

  VwUi.call( self, view );

  if ( !self.close )
  {
    throw `The ui component "${self.getViewName()}"  must define a public close() method`;
  }

  configObject();

  /**
   * Puts view on top of stack and calls its render method
   */
  function configObject()
  {

    // get the current view and if its not modal call its close method
    const curView = getCurrentView();

    // Only close current view if new view is not modal
    if ( !m_bIsModalView )
    {
      if ( curView )
      {
        closeView( curView )
      }

    }

    setCurrentView( self );

  }

  /**
   * Sets this object as the current and calls its render method
   * @param view
   */
  function setCurrentView( view )
  {

    // New current view -- top of stack
    const stackViews = getViewStack();
    stackViews.push( view );

  } // end setCurrentView()


  /**
   * Closes current view and removes from stack
   */
  function closeView( curView )
  {
    
    if ( !curView )
    {
      curView = self;
    }

    // close any components registered to the view
    VwComponent.closeComponents( curView );

    // Close the view
    curView.close();

    // remove from stack 
    const stackViews = getViewStack();
    stackViews.pop();


  } // end closeView


} // end VwComponent{}

export default VwView;

VwView.prototype = new VwUi();
VwView.prototype.constructor = VwView;