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

import VwStack from "../../util/VwStack/VwStack.js";

VwCssImport( "/vozzworks/ui/VwSplitter/style");

/**
 * jQuery invoker
 */
$.fn.vwSplitter = function( objProperties )
{
  "use strict";

  return new VwSplitter( this, objProperties );

};



/**
 * Function to split user div horizontally or vertically
 *
 * @param m_SplitterDiv The jquery 'this' pointer to the div we're wrapping
 * @constructor
 */
function VwSplitter( splitterDiv, splitProperties )
{

  const self = this;
  const m_positionStack = new VwStack();

  let   m_htmlSplitterDiv;
  let   m_strSplitDivId;
  let   m_splitterDiv;

  let   m_splitParentOffset;
  let   m_divSplit1;
  let   m_divSplit2;
  let   m_divSplitParent;
  let   m_fExpanded = false;
  let   m_nPrevDivSplit2Top;
  let   m_nPrevDivSplit1Left;
  let   m_nSplitterSize;
  let   m_fHorzSplitter = false;
  let   m_curOffsetSplitPos;
  let   m_nAnchorX = -1;
  let   m_nLastXPos = -1;
  let   m_nAnchorY = -1;
  let   m_nLastYPos = -1;
  let   m_nMaxBounds;
  let   m_nMinBounds;

  const m_slitProperties =  configSplitProperties( splitProperties );;

  this.resizePanels = resizePanels;
  this.hide = hide;
  this.show = show;
  this.savePos = savePos;
  this.restoreSavedPos = restoreSavedPos;
  this.setPos = setPos;
  this.getPos = getPos;
  this.update = update;

  setup();

  setupActions();

  /**
   * Wrap the users div inside this div
   */
  function setup()
  {
    if ( ! splitterDiv )  // if null, its a movable spiltter for multiple columns
    {
      return;
    }

    m_fHorzSplitter = splitProperties.orientation == "h";

    update( splitterDiv );

  } // end setup()


  function update( splitterDiv )
  {
    m_splitterDiv = splitterDiv;

    m_htmlSplitterDiv = splitterDiv[0];
    m_strSplitDivId = m_htmlSplitterDiv.id;

    // Get the div we are wrapping parent and html

     // Get any positioning styles
     m_divSplitParent = m_splitterDiv.parent()[0];

     m_splitParentOffset = $( m_divSplitParent ).offset();

     if (m_slitProperties.leftSplitId || m_slitProperties.topSplitId )
     {
       assignSplitElements();
     }
     else
     {
       const aParentChildren = $(m_divSplitParent).children();
       findDivsToSplit( aParentChildren );

     }

     setupCss();

     if ( m_fHorzSplitter )
     {
       m_nSplitterSize = $(splitterDiv).height();
       setupHorizontalSplit();
     }
     else
     {
       m_nSplitterSize = $(splitterDiv).width();

       setupVerticalSplit();

     }

  } // end update();


  /**
   * Assigns the html elements to move based on property settings
   */
  function assignSplitElements()
  {
    const strSplit1id = m_slitProperties.leftSplitId || m_slitProperties.topSplitId;
    const strSplit2id = m_slitProperties.rightSplitId || m_slitProperties.bottomSplitId;

    m_divSplit1 = $("#" + strSplit1id )[0];
    m_divSplit2 = $("#" + strSplit2id )[0];

  } // end assignSplitElements()


  /**
   * finds the two adjacent divs to the split bar div
   * @param aElements array of child html elements (all child elements of the split bars parent
   */
  function findDivsToSplit( aElements )
  {

    for ( let x = 0, nLen = aElements.length; x < nLen; x++ )
    {

      if ( aElements[ x ].id == m_strSplitDivId )
      {
        m_divSplit1 = aElements[ x - 1 ];
        m_divSplit2 = aElements[ x + 1 ];

        return;

      }
    }

  } //end findDivsToSplit()

  /**
   * Hides the split bar
   */
  function hide()
  {
    $( m_htmlSplitterDiv ).hide();

  } // end hide()


  /**
   * Shows the split bar
   */
  function show()
  {
    $( m_htmlSplitterDiv ).show();

    // re-establish splitter bounds
    // Move splitter bar to bottom of top panel
    let offset = $( m_divSplit1 ).offset();

    m_curOffsetSplitPos = offset;

    m_nMinBounds = offset.top;

    offset = $( m_divSplit2 ).offset();
    $( m_htmlSplitterDiv ).offset( {top:offset.top});

  } // end show()


  /**
   * Save the current position of the splitter bar
   */
  function savePos()
  {

    m_curOffsetSplitPos = $(m_splitterDiv).offset();

    m_positionStack.push( m_curOffsetSplitPos );

  } // end savePos()


  /**
   * Restores splitter to last save pos
   */
  function restoreSavedPos()
  {
    m_curOffsetSplitPos = m_positionStack.pop();

    if ( !m_curOffsetSplitPos )
    {
      return;
    }

    if ( m_fHorzSplitter )
    {
      restoreHorzSplit( m_curOffsetSplitPos.top )
    }
    else
    {
      restoreVertSplit( m_curOffsetSplitPos.left )

    }

  } // end restoreSavedPos()


  /**
   * Resize panels and adjust the split bar position
   * @param nPanel1Size The new panel1 size (will be top or left div
   * @param nPanel2Size The new panel2 size (will be bottom or right div
   */
  function resizePanels( nPanel1Size, nPanel2Size )
  {

    const nSplitterMargin = m_nSplitterSize / 2;

    if ( m_fHorzSplitter )
    {
      const nDivSplit1Size = nPanel1Size - nSplitterMargin;
      const nDivSplit2Size = nPanel2Size - nSplitterMargin;

      $( m_divSplit1 ).height( nDivSplit1Size );
      $( m_divSplit2 ).height( nDivSplit2Size );


      // Move splitter bar to bottom of top panel
      let  offset = $( m_divSplit1 ).offset();
      m_nMinBounds = offset.top;

      offset = $( m_divSplit2 ).offset();
      $( m_htmlSplitterDiv ).offset( {top:offset.top});

      m_nMaxBounds = offset.top + $(m_divSplit2 ).height();
     }

  } // end resizePanels()



  /**
   * Horizontal split bar setup
   */
  function setupHorizontalSplit()
  {
    const offParent = $( m_divSplitParent ).offset();

    m_nMinBounds = offParent.top;
    m_nMaxBounds = offParent.top + $( m_divSplitParent ).height() - m_nSplitterSize;

    if ( m_slitProperties.maximizeThumb )
    {
      const strThumbId = m_strSplitDivId + "_thumb";
      const strThumbDiv = "<div id='" + strThumbId + "' style='cursor:pointer;margin-left:auto;margin-right:auto;height:4px;width:30px;background-color:" + m_slitProperties.thumbColor + "'/>";

      $(m_htmlSplitterDiv ).html( strThumbDiv );

      $( "#" + strThumbId ).unbind( "click", handleHorzThumbClick );
      $( "#" + strThumbId ).bind( "click", handleHorzThumbClick );

    }


    const nCurTop = $(m_divSplit2 ).offset().top;

    m_curOffsetSplitPos = $(m_htmlSplitterDiv ).offset();


    /* The following code is a fixup for certain fixed divs above the splitter  content that
       causes a bug when the browser scroll bar is scrolled. The offset positions are off the the fix div height.
       Setting the splitter div to css("top" 0 ) and then getting the offset().top positions gives us the adjustment amount.
    */
    $(m_htmlSplitterDiv ).css( "top", 0 );

    $(m_htmlSplitterDiv ).offset( {top:nCurTop } );


    // Make sure spliiter left pos is adjusted if browser is re-sized
    $( window ).resize( function()
    {

      const parent = $(m_htmlSplitterDiv ).parent();

      const nWidth = $(parent ).width();

      if ( m_fHorzSplitter )
      {
        $(m_htmlSplitterDiv ).width( nWidth );
      }

      const offset = $(m_divSplit1 ).offset();
      $(m_htmlSplitterDiv ).offset( {left:offset.left} );

    });


  } // end setupHorizontalSplit()

  /**
   * Setup css for the split bar
   */
  function setupCss()
  {
    const offsetParent = $(m_divSplitParent ).offset();
    const offsetSplitter = $(m_splitterDiv).offset();

    // Make sure position is relative on the parent container

    const strCssPosition = $(m_divSplitParent ).css( "position" );

    if ( !strCssPosition || strCssPosition != "relative" )
    {
      $(m_divSplitParent ).css( "position", "relative" );
    }

    // Make sure splitter div as absolute positioning

    const strCssSplitterPosition = $( m_splitterDiv ).css( "position" );

    if ( !strCssSplitterPosition || strCssSplitterPosition != "absolute")
    {
      $( m_splitterDiv ).css( "position", "absolute" );
    }

    const strCursor =  $( m_splitterDiv ).css( "cursor" );

    if ( !strCursor || strCursor== "auto" )
    {
      $( m_splitterDiv ).css( "cursor", "col-resize" );
    }

  } // end setupCss()


  /**
   * Vertical split bar setup
   */
  function setupVerticalSplit()
  {

    const offsetParent = $(m_divSplitParent ).offset();
    const offsetSplitter = $(m_splitterDiv).offset();


    const nSplit1Width = $(m_divSplit1).width();

    // move splitter to its current position
    $( m_splitterDiv ).css( {"top":0, "left":nSplit1Width} );

    m_nMinBounds = offsetParent.left;
    m_nMaxBounds = $(m_divSplitParent ).width() + offsetParent.left - m_nSplitterSize;


    if ( m_slitProperties.maximizeThumb )
    {
      const strThumbId = m_strSplitDivId + "_thumb";

      const strThumbDiv = "<div id='" + strThumbId + "' style='position:absolute;top:50%;margin-top:-15px;cursor:pointer;height:4px;width:4px;height:30px;background-color:" + m_slitProperties.thumbColor + "'/>";
      $(m_htmlSplitterDiv ).html( strThumbDiv );
      $( "#" + strThumbId ).unbind( "click",  handleVertThumbClick );
      $( "#" + strThumbId ).bind( "click", handleVertThumbClick );

    }


    // Make sure splitter left pos is adjusted if browser is re-sized
    $( window ).resize( function()
    {
      const nWidth = $(m_divSplit1 ).width();

      const offset = $(m_divSplit1 ).offset();

      $(m_htmlSplitterDiv ).offset( {left:offset.left + nWidth - 2 } );

    });

  } // end setupVerticalSplit()

  /**
   * Setup the mouse action handlers
   */
  function setupActions()
  {

    $( m_htmlSplitterDiv ).unbind( "mouseDown", handleSplitterMouseDown );
    $( m_htmlSplitterDiv ).mousedown( handleSplitterMouseDown );

  } // end setupActions()


  function handleSplitterMouseUp( event )
  {

    $( window ).unbind( "mouseup", handleSplitterMouseUp );
    $( window ).unbind( "mousemove", handleSplitterMouseMove );

    if ( VwExString.endsWith( event.target.id, "_thumb") )
    {
        m_nAnchorX = m_nAnchorY = -1;
    }

    // See if we did any splitter movement
    if ( m_nAnchorX >= 0 || m_nAnchorY >= 0 )
    {

      // This will re-enable text selection
      $("body" ).removeClass( "VwDisableTextSelection");

      const selection = window.getSelection();

      // remove all the ranges
      selection.removeAllRanges();

      const offset  = $( m_htmlSplitterDiv ).offset();

      if ( m_fHorzSplitter )
      {
        $( m_divSplit2 ).height( 0 );
        $( m_divSplit1 ).height( offset.top - m_splitParentOffset.top );
        $( m_divSplit2 ).height( $(m_divSplitParent).height() - $(m_divSplit1).height()  );
      }
      else
      {
        $( m_divSplit2 ).width( 0 );
        $( m_divSplit1 ).width(  offset.left  - m_splitParentOffset.left);
        $( m_divSplit2 ).width( $(m_divSplitParent).width() - $(m_divSplit1).width() );

      }


      // Call the users re-sized event handler if specified
      if ( m_slitProperties.resized )
      {
        if ( m_fHorzSplitter )
        {
          m_slitProperties.resized( "resized", $( m_divSplit1 ).height(), $( m_divSplit2 ).height() );
        }
        else
        {
          m_slitProperties.resized( "resized", $( m_divSplit1 ).width(), $( m_divSplit2 ).width() );
        }
      }

    }

    m_nAnchorX = m_nAnchorY = -1;

  } // end handleSplitterMouseUp()

  /**
   * Mouse down handler for the splitter bar
   * @param event
   */
  function handleSplitterMouseDown( event )
  {
    // This will disable text selection when dragging the mouse
    $("body" ).addClass( "VwDisableTextSelection");

    if ( m_fHorzSplitter )
    {

      m_nAnchorY = event.screenY;
      m_nAnchorX = -1;
      m_nLastYPos = m_nAnchorY;

    }
    else
    {

      m_nAnchorX = event.screenX;
      m_nAnchorY = -1;
      m_nLastXPos = m_nAnchorX;

    }

    // Install splitter mouse up and mousemove event handlers
    $( window ).unbind( "mousemove", handleSplitterMouseMove );
    $( window ).unbind( "mouseup", handleSplitterMouseUp );

    $( window ).bind( "mousemove", handleSplitterMouseMove );
    $( window ).bind( "mouseup", handleSplitterMouseUp );


  } // end handleSplitterMouseDown()


  /**
   * Mouse move handler for the splitter bar
   * @param event
   */
  function handleSplitterMouseMove( event )
  {
    event.stopImmediatePropagation();

    if ( m_fExpanded )
    {
      return false;

    }

    // Resize width of div is X anchor is defined
    if ( m_nAnchorX >= 0 )
    {
      moveVerticalSlitter( event );
      return false;
    }

    if ( m_nAnchorY < 0 )
    {
      return false;

    }

    moveHorizonatlSlitter( event );

    return false;


  } // end handleSplitterMouseMove()

  /**
   * Move the vertical split bar
   * @param event The mouse event
   */
  function moveVerticalSlitter( event )
  {
    $(m_divSplitParent).css( "cursor", "ew-resize");
    const nXpos = event.screenX;

    // Move the splitter bar
    const nAmt = nXpos - m_nLastXPos;

    const nLeftPos = $( m_htmlSplitterDiv ).offset().left;

    if ( !checkBounds( nLeftPos, nAmt ) )
    {
      resetSplitterBar( nAmt );
      return;
    }

    $( m_htmlSplitterDiv ).offset( {left:nLeftPos + nAmt } );

    m_nLastXPos = nXpos;

    // don't resize windows during dragging if this event handler is not defined
    if ( m_slitProperties.resize )
    {

      $( m_divSplit2 ).width( 0 );
      $( m_divSplit1 ).width(  nLeftPos  - m_splitParentOffset.left);
      $( m_divSplit2 ).width( $(m_divSplitParent).width() - $(m_divSplit1).width() );

      m_slitProperties.resize( "resize", $( m_divSplit1 ).width(), $( m_divSplit2 ).width() );
    }

  } // end moveVerticalSlitter()


  /**
   * Move the horizontal split bar
   * @param event The mouse event
   */
  function moveHorizonatlSlitter( event )
  {
    // Resize div height if we get here
    const nYpos = event.screenY;

    const nAmt = nYpos - m_nLastYPos;

    const nTop = $( m_htmlSplitterDiv ).offset().top;


    if ( !checkBounds( nTop, nAmt ) )
    {

      resetSplitterBar( nAmt );
      return;
    }


    $( m_htmlSplitterDiv ).offset( {top:nTop + nAmt } );

    m_nLastYPos = nYpos;

    if ( m_slitProperties.resize )
    {
      const nYSplitTop = $( m_divSplit1 ).height();
      const nYSplitBot = $( m_divSplit2 ).height();

      $( m_divSplit1 ).height( nYSplitTop + nAmt );
      $( m_divSplit2 ).height( nYSplitBot - nAmt );

      m_slitProperties.resize( "resize", $( m_divSplit1 ).height(), $( m_divSplit2 ).height() );

    }

  } // end moveHorizonatlSlitter()

  /**
   * Reset a splitter bar that went out of bounds to its min or max position based on the direction
   * @param nAmt
   */
  function resetSplitterBar( nAmt )
  {
    let nSplitPos;

    if ( nAmt < 0 )   // going left or up
    {
      nSplitPos = m_nMinBounds;
    }
    else
    {
      nSplitPos = m_nMaxBounds;

    }

    if ( m_fHorzSplitter )
    {
      $( m_htmlSplitterDiv ).offset( {top: nSplitPos} );
    }
    else
    {
      $( m_htmlSplitterDiv ).offset( {left: nSplitPos} );

    }

    clearTextSelection();

  } // end resetSplitterBar()


  function clearTextSelection()
  {
    const  sel = window.getSelection ? window.getSelection() : document.selection;

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
   * Handles the horizontal scrollbar thumb click to expand or reset the split bar
   * @param event mouse event
   */
  function handleHorzThumbClick( event )
  {

    if (  !m_fExpanded )
    {
      m_fExpanded = true;
      m_nPrevDivSplit2Top = $( m_htmlSplitterDiv ).offset().top;

      $( m_htmlSplitterDiv ).css( "top", "auto" );
      $( m_divSplit1 ).height( 0 );
      $( m_divSplit1 ).css( "display", "none" );
      $( m_divSplit2 ).height( m_nMaxBounds - m_nMinBounds );

      if ( m_slitProperties.expanded )
      {
        m_slitProperties.expanded( "expanded", 0, $( m_divSplit2 ).height() );
      }

    }
    else
    {
      m_fExpanded = false;
      $( m_divSplit1 ).css( "display", "block" );
      restoreHorzSplit( m_nPrevDivSplit2Top );
    }

  } // end handleHorzThumbClick()

  /**
   * Gets the position  of this split bar
   * @returns offset position of the splitter
   */
  function getPos()
  {

    if ( m_fHorzSplitter )
    {
      return $( m_htmlSplitterDiv ).offset().top;

    }
    else
    {
      return $( m_htmlSplitterDiv ).offset().left;
    }

  } // end getPos()


  /**
   * Sets the position of the split bar and adjusts the divs
   * @param nPos
   */
  function setPos( nPos )
  {
    if ( m_fHorzSplitter )
    {
      restoreHorzSplit( nPos )
    }
    else
    {
      restoreVertSplit( nPos );
    }

  } // end setPos()

  /**
   * Move the horizontal split bar to position specified by nTopPos
   * @param nTopPos The top position to move to
   */
  function restoreHorzSplit( nTopPos )
  {

    $( m_htmlSplitterDiv ).offset( {top:nTopPos } );

    const nHeightTop = nTopPos - m_nMinBounds;
    $( m_divSplit1 ).height( nHeightTop );

    const nHeightBot = m_nMaxBounds - nTopPos + $( m_htmlSplitterDiv ).height();

    $( m_divSplit2 ).height( nHeightBot );

    if ( m_slitProperties.restored )
    {
       m_slitProperties.restored( "restored", $( m_divSplit1 ).height(), $( m_divSplit2 ).height() );
    }

  }  // end restoreHorzSplit()




  /**
   * Handles the vertical scrollbar thumb click to expand or reset the split bar
   * @param event mouse event
   */
  function handleVertThumbClick( event )
  {
    event.stopImmediatePropagation();

    if ( !m_fExpanded )
    {
      m_fExpanded = true;
      m_nPrevDivSplit1Left = $( m_htmlSplitterDiv ).offset().left;

      $( m_htmlSplitterDiv ).css( "left", "auto" );
      $( m_divSplit1 ).width( m_nMaxBounds - m_nMinBounds );
      $( m_divSplit2 ).width( 0 );
      $( m_divSplit2 ).css( "display", "none" );

      if ( m_slitProperties.expanded )
      {
        m_slitProperties.expanded( "expanded", $( m_divSplit1 ).width(), 0 );
      }
    }
    else
    {
      m_fExpanded = false;

      restoreVertSplit( m_nPrevDivSplit1Left )
    }

  } // end handleVertThumbClick()

  /**
     * Move the vertical horizontal split bar to position specified by nLeftPos
     * @param nLeftPos The left position to move to
     */
   function restoreVertSplit( nLeftPos )
   {

     $( m_htmlSplitterDiv ).css( "left",  nLeftPos );
     $( m_divSplit1 ).width( $( m_htmlSplitterDiv ).offset().left - m_nMinBounds );
     $( m_divSplit2 ).width( m_nMaxBounds - $( m_htmlSplitterDiv ).offset().left );
     $( m_divSplit2 ).css( "display", "inline-block" );

     if ( m_slitProperties.restored )
     {
        m_slitProperties.restored( "restored", $( m_divSplit1 ).width(), $( m_divSplit2 ).width() );
     }

   } // end restoreVertSplit()

  /**
   * Configure the default properties
   * @param objSplitProps additional user properties
   */
  function configSplitProperties( objSplitProps )
  {

    const splitProperties = {};

    splitProperties.color = "black";
    splitProperties.maximizeThumb = true;
    splitProperties.thumbColor = "lightgray";
    //todo splitProperties.border = true;
    splitProperties.cssSplitter = "VwSplitter";

    $.extend( splitProperties, objSplitProps );

    if (splitProperties.orientation == "h" || splitProperties.orientation == "horizontal")
    {
      m_fHorzSplitter = true;
    }
    else
    {
      // determine splitter by length vs. width

      if ( $("#" + m_strSplitDivId).width() > $("#" + m_strSplitDivId).height() )
      {
        m_fHorzSplitter = true;
      }
    }

    if ( m_fHorzSplitter )
    {
      m_nSplitterSize = $( m_splitterDiv ).height();
    }
    else
    {
      m_nSplitterSize = $( m_splitterDiv ).width();

    }

    return splitProperties;

  } // end  configSplitProperties()

} // end VwSpitter{}

export default VwSplitter;