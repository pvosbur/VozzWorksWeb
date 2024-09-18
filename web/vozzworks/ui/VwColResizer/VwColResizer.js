/*
 *
 * ============================================================================================
 *
 *                                 V o z z w a r e   U i   Widgets
 *
 *                                     Copyright(c) 2012 By
 *
 *                                      Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 *  ============================================================================================
 * /
 */

import VwExString from "../../util/VwExString/VwExString.js";
import VwUiUtils from "../VwCommon/VwUiUtils.js";
/**
 * jQuery invoker
 */
$.fn.vwColResizer = function( strResizeElementId, objProperties )
{

  return new VwColResizer( this, strResizeElementId, objProperties );

};



/**
 * Function to split user div horizontally or vertically
 *
 * @param thisResizerDiv The jquery 'this' pointer to the div we're wrapping
 * @constructor
 */
function VwColResizer( thisResizerDiv, strResizeElementId, objResizeProperties )
{
  "use strict";

  const m_resizerDivParent = thisResizerDiv.parent();
  const m_objResizeProperties = configResizerProperties();

  let   m_nPosLeftAdjustment;
  let   m_offsetResizerDiv;
  let   m_nAnchorX = -1;
  let   m_nLastXPos = -1;
  let   m_nMaxBounds;
  let   m_nMinBounds;
  let   m_nResizerWidth;

  let   m_nEmSize;

  setup();

  setupActions();

  /**
   * Wrap the users div inside this div
   */
  function setup()
  {
    ;

    if ( m_objResizeProperties.metric == "em" )
    {
      m_nEmSize = VwUiUtils.getEmSize( strResizeElementId );
    }

    $(m_resizerDivParent).css( "position", "relative" );
    
    const offsetParent = $( "#" + strResizeElementId).parent().offset();

    const strBorderLeft = $(m_resizerDivParent ).css( "border-left");

    const aBorderPieces = strBorderLeft.split( " " );

    const nBorderSize = Number( VwExString.strip( aBorderPieces[ 0 ], "px") );

    m_nPosLeftAdjustment = offsetParent.left + nBorderSize ;


    // todo const nSplitterSize = $(thisResizerDiv).width();

    m_nResizerWidth = $( thisResizerDiv ).width();
    $( thisResizerDiv ).css( "min-width", m_nResizerWidth = "px");
    m_offsetResizerDiv = $( thisResizerDiv ).offset();


    const offResizeElement = $( "#" + strResizeElementId ).offset();

    m_nMinBounds = offResizeElement.left;
    m_nMaxBounds = $( "#" + strResizeElementId).parent().width() - offsetParent.left;

    $( thisResizerDiv ).css( "cursor", "col-resize");


  } // end setup()


  /**
   * Setup the mouse action handlers
   */
  function setupActions()
  {

    $( thisResizerDiv ).unbind( "mouseDown", handleResizerMouseDown );
    $( thisResizerDiv ).mousedown( handleResizerMouseDown );

  } // end setupActions()


  function handleResizerMouseUp( event )
  {

    $( window ).unbind( "mouseup", handleResizerMouseUp );
    $( window ).unbind( "mousemove", handleResizerMouseMove );

    adjustResizerSplitterCssPosition( false );

    // See if we did any splitter movement
    if ( m_nAnchorX >= 0  )
    {

      const nXpos = event.screenX;

      // Move the splitter bar
      const nAmt = nXpos - m_nAnchorX;

      // This will re-enable text selection
      $("body" ).removeClass( "VwDisableTextSelection");

      const selection = window.getSelection();
        // remove all the ranges
      selection.removeAllRanges();

      moveResizerDiv( event );

      $( thisResizerDiv ).css( "left", "" );

      let nWidth;

      // If the resize event not specified then the actual column is not resized
      if ( !m_objResizeProperties.resize )
      {
        nWidth = $( "#" + strResizeElementId).width() + nAmt;  // original column size + the nre width amount
      }
      else
      {
        nWidth = $( "#" + strResizeElementId).width();
      }

      const strUserMetrics = convertWidthToUserMetrics( nWidth );

      // Call the users re-sized event handler if specified
      if ( m_objResizeProperties.resized )
      {
         m_objResizeProperties.resized( strResizeElementId, nWidth, strUserMetrics );
      }

    }

    m_nAnchorX =  -1;

  }

  /**
   * Mouse down handler for the splitter bar
   * @param event
   */
  function handleResizerMouseDown( event )
  {
    // This will disable text selection when dragging the mouse
    $("body" ).addClass( "VwDisableTextSelection");

    adjustResizerSplitterCssPosition( true );

    m_nAnchorX = event.screenX;
    m_nLastXPos = m_nAnchorX;


    // Install splitter mouse up and mousemove event handlers
    $( window ).unbind( "mousemove", handleResizerMouseMove );
    $( window ).unbind( "mouseup", handleResizerMouseUp );

    $( window ).bind( "mousemove", handleResizerMouseMove );
    $( window ).bind( "mouseup", handleResizerMouseUp );

    if ( m_objResizeProperties.resizeStart )
    {
      m_objResizeProperties.resizeStart( strResizeElementId );
    }
  }



  /**
   * Swucthes the resizer div to absolulute or static position
   *
   * @param bAbsolutePos if true make splitter div absolur positioning es;e make it static
   */
  function adjustResizerSplitterCssPosition( bAbsolutePos )
  {

    if ( bAbsolutePos )
    {
      const strMarginLeft = m_resizerDivParent[0].style.marginLeft;
      let nMarginLeft = 0;

      if ( strMarginLeft.charAt( 0 ) == "-" )
      {
        nMarginLeft = Number( VwExString.strip( strMarginLeft, "px")) * -1;

      }
      const offsetSplitter = $( thisResizerDiv ).offset();

      $( thisResizerDiv ).css( "position", "absolute" );

      // move splitter to its current position
      $( thisResizerDiv ).css( {"top": 0, "left": offsetSplitter.left - m_nPosLeftAdjustment + nMarginLeft } );
    }
    else
    {
      $( thisResizerDiv ).css( "position", "static" );

    }

  } // end adjustResizerSplitterCssPosition



  /**
   * Mouse move handler for the splitter bar
   * @param event
   */
  function handleResizerMouseMove( event )
  {
    event.stopImmediatePropagation();

    // Resize width of div is X anchor is defined
    if ( m_nAnchorX >= 0 )
    {
      moveResizerDiv( event );
    }

    return false;

  }

  /**
   * Move the vertical split bar
   * @param event The mouse event
   */
  function moveResizerDiv( event )
  {
    const nXpos = event.screenX;

    // Move the splitter bar
    let nAmt = nXpos - m_nLastXPos;

    const nLeftPos = $( thisResizerDiv ).offset().left;

    /*
    if ( !checkBounds( nLeftPos, nAmt ) )
    {
      resetResizerBar( nAmt );
      return;
    }

*/
    const nWidth = $( "#" + strResizeElementId ).width() + nAmt;

     $( thisResizerDiv ).offset( {left:nLeftPos + nAmt } );


    m_nLastXPos = nXpos;

    // don't resize windows during dragging if this event handler is not defined
    if ( m_objResizeProperties.resize )
    {

      const strUserMetrics =  convertWidthToUserMetrics( nWidth );
      $( "#" + strResizeElementId ).css( "width", strUserMetrics );
      $( "#" + strResizeElementId ).css( "min-width", strUserMetrics );
      m_objResizeProperties.resize( strResizeElementId, nWidth, strUserMetrics );
    }

  }

  /**
   * Converts units in pixels to the user specified metric type
   *
   * @param nWidth The current width of the column
   */
  function convertWidthToUserMetrics( nWidth )
  {
     switch( m_objResizeProperties.metric )
     {
       case "px":

            return nWidth + "px";

       case "em":

            return nWidth / m_nEmSize + "em";


       case "%":

            return (nWidth / m_objResizeProperties.totalWidth * 100) + "%";

     }
  }

  /**
   * Reset a splitter bar that went out of bounds to its min or max position based on the direction
   * @param nAmt
   */
  function resetResizerBar( nAmt )
  {
    let nResizerPos;

    if ( nAmt < 0 )   // going left
    {
      nResizerPos = m_nMinBounds;
    }
    else
    {
      nResizerPos = m_nMaxBounds;

    }

    $( thisResizerDiv ).offset( {left: nResizerPos} );

    clearTextSelection();

  }



  function clearTextSelection()
  {
    const sel = window.getSelection ? window.getSelection() : document.selection;
    if (sel)
    {
      if (sel.removeAllRanges)
      {
        sel.removeAllRanges();
      }
      else
      if (sel.empty)
      {
        sel.empty();
      }
    }

  } // end VwClearTextSelection{}

  /**
   * Checks to make sure the splitter is with in the min and max bounds of the divs it is splitting
   * @param nSplitPos The current splitter bar position
   * @param nAmt The amount of the increase
   * @returns true if spliiter bar is in bounds, false otherwise
   */
  function checkBounds( nSplitPos, nAmt  )
  {

    const nNewPos =  nSplitPos + nAmt;

    if ( nNewPos <= m_nMinBounds )
    {
      return false;
    }
    else
    if ( nNewPos >= m_nMaxBounds )
    {
      return false;
    }


    return true;   // In bounds
  }



  /**
   * Configure the default properties
   * @param objSplitProps additional user properties
   */
  function configResizerProperties()
  {
    const resizeProperties = {};

    resizeProperties.metric = "px"; // Pixels is the defualt metric for width units

    $.extend( resizeProperties, objResizeProperties );

    return resizeProperties;

  } // end configResizerProperties()

} // end VwColResizer{}

export default VwColResizer;