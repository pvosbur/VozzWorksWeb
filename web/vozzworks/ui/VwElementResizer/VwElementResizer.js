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
 * Function to split user div horizontally or vertically
 *
 * @param resizerEle The jquery 'this' pointer to the div we're wrapping
 * @constructor
 */
function VwElementResizer( strColResizerId, strSplitterId, strResizeElementId, resizeProperties )
{
  const m_splitterEle = $(`#${strSplitterId}`)[0];
  const m_resizMarkerEle = $(`#${strColResizerId}`)[0];
  const m_colToResizeEle = $( m_resizMarkerEle).parent();
  const m_objResizeProperties = configResizerProperties();

  let   m_nPosLeftAdjustment;
  let   m_offsetResizerDiv;
  let   m_nAnchorX = -1;
  let   m_nLastXPos = -1;
  let   m_nMaxBounds;
  let   m_nMinBounds;
  let   m_nResizerWidth;
  let   m_nEmSize;
  let   m_fnOnResizeStart;
  let   m_fnOnResizeComplete;
  let   m_fnOnResize;

  this.onResizeStart = ( fnOnResizeStart ) => m_fnOnResizeStart = fnOnResizeStart;
  this.onResize = ( fnOnResize ) => m_fnOnResize = fnOnResize;
  this.onResizeComplete = ( fnOnResizeComplete ) => m_fnOnResizeComplete = fnOnResizeComplete;

  configObject();

  setupActions();

  /**
   * Wrap the users div inside this div
   */
  function configObject()
  {
    if ( m_objResizeProperties.metric == "em" )
    {
      m_nEmSize = VwUiUtils.getEmSize( strResizeElementId );
    }

    const offsetColToResize = $(m_colToResizeEle).offset();

    const strBorderLeft = $( m_colToResizeEle ).css( "border-left");

    const aBorderPieces = strBorderLeft.split( " " );

    const nBorderSize = Number( VwExString.strip( aBorderPieces[ 0 ], "px") );

    m_nPosLeftAdjustment = offsetColToResize.left + nBorderSize ;

    m_nResizerWidth = $(m_colToResizeEle).width();
    $( m_colToResizeEle).css( "min-width", m_nResizerWidth = "px");
    m_offsetResizerDiv = $( m_resizMarkerEle ).offset();

    /*todo

    const offResizeElement = $( "#" + strResizeElementId ).offset();

    m_nMinBounds = offResizeElement.left;
    m_nMaxBounds = $( "#" + strResizeElementId).parent().width() - offsetColToResize.left;

     */

  } // end configObject()


  /**
   * Setup the mouse action handlers
   */
  function setupActions()
  {
    $( m_resizMarkerEle ).unbind( "mouseDown", handleResizerMouseDown );
    $( m_resizMarkerEle ).mousedown( handleResizerMouseDown );

  } // end setupActions()


  /**
   * mouseup event handler - complete user callbacks
   * @param event
   */
  function handleResizerMouseUp( event )
  {
    $( window ).unbind( "mouseup", handleResizerMouseUp );
    $( window ).unbind( "mousemove", handleResizerMouseMove );

    //adjustResizerSplitterCssPosition( true );

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

      let nWidth;

      // If the resize event not specified then the actual column is not resized
      if ( !m_fnOnResize )
      {
        nWidth = $(m_colToResizeEle).width() + nAmt;  // original column size + the nre width amount
      }
      else
      {
        nWidth = $( "#" + strResizeElementId).width();
      }

      const strUserMetrics = convertWidthToUserMetrics( nWidth );

      // Call the users re-sized event handler if specified
      if ( m_fnOnResizeComplete )
      {
        m_fnOnResizeComplete( strResizeElementId, nWidth, strUserMetrics );
      }

    } // end if

    m_nAnchorX =  -1;

  } // end handleResizerMouseUp()

  /**
   * Mouse down handler for the splitter bar
   * @param event
   */
  function handleResizerMouseDown( event )
  {
    // This will disable text selection when dragging the mouse
    $("body" ).addClass( "VwDisableTextSelection");

    //adjustResizerSplitterCssPosition( true );

    m_nAnchorX = event.screenX;
    m_nLastXPos = m_nAnchorX;


    // Install splitter mouse up and mousemove event handlers
    $( window ).unbind( "mousemove", handleResizerMouseMove );
    $( window ).unbind( "mouseup", handleResizerMouseUp );

    $( window ).bind( "mousemove", handleResizerMouseMove );
    $( window ).bind( "mouseup", handleResizerMouseUp );

    if ( m_fnOnResizeStart )
    {
      m_fnOnResizeStart( strResizeElementId );
    }
  } // end handleResizerMouseDown(

  /**
   * Switches the resizer div to absolulute or static position
   *
   * @param bAbsolutePos if true make splitter div absolute positioning esle make it static
   */
  function adjustResizerSplitterCssPosition( bAbsolutePos )
  {
    if ( bAbsolutePos )
    {
      const offsetSplitter = $(m_splitterEle).offset();

      // move splitter to its current position
      $(m_splitterEle).css( {"top": 0, "left": offsetSplitter.left } );

    }
    else
    {
      $(m_splitterEle).css( "position", "static" );
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

  } // end handleResizerMouseMove()

  /**
   * Move the vertical split bar
   * @param event The mouse event
   */
  function moveResizerDiv( event )
  {
    const nXpos = event.screenX;

    // Move the splitter bar
    let nAmt = nXpos - m_nLastXPos;

    $(m_splitterEle).offset( {left:m_nLastXPos + nAmt} );

     /*
    adjustResizerSplitterCssPosition( true );
   if ( !checkBounds( nLeftPos, nAmt ) )
    {
      resetResizerBar( nAmt );
      return;
    }

    */

    m_nLastXPos = nXpos;

    // don't resize windows during dragging if this event handler is not defined
    if ( m_fnOnResize )
    {
      const nWidth = $(m_colToResizeEle).width() + nAmt;

      $(m_colToResizeEle).css( "width", `${nWidth}px` );
      $(m_colToResizeEle).css( "min-width", `${nWidth}px` );

      m_fnOnResize( strResizeElementId, nWidth );
    }

  } // end moveResizerDiv()

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

    } // end switch()
  }  // end convertWidthToUserMetrics()

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

    $( resizerEle ).offset( {left: nResizerPos} );

    clearTextSelection();

  } // end resetResizerBar()


  /**
   * Clear any selected text during reize drag operation
   */
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

  } // end checkBounds()

  /**
   * Configure the default properties
   * @param objSplitProps additional user properties
   */
  function configResizerProperties()
  {
    const resizeProperties = {};

    resizeProperties.metric = "px"; // Pixels is the defualt metric for width units

    $.extend( resizeProperties, resizeProperties );

    return resizeProperties;

  } // end configResizerProperties()

} // end VwElementResizer{}

export default VwElementResizer;