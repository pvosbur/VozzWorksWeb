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

import VwSlider from "../VwSlider/VwSlider.js";

await  VwCssImport( "/vozzworks/ui/VwScrollBar/style", true);

/**
 * Scrollbar
 *
 * This class creates a horizontal/vertical scrollbar based on the orientation property". It extends the VwSlider class
 *
 * @param strScrollContainerParentId The parent contatiner id the the scrollbar will live in
 * @oaram scrollbarProps:
 *        orientation:String:Required must be one of "vert" (for a vertical scrollbar) or "horz" (for a horizontal scrollbar)
 *        cssScrollContainer:String:Optional One or more Css Class names to be added to the scroll data container
 * @constructor
 */
function VwScrollBar( strScrollContainerParentId, strScrollContentId, scrollbarProps )
{

  const self = this;
  const m_aScrollListeners = [];
  const m_scrollContainerParentEle = $(`#${strScrollContainerParentId}`)[0];
  const SCROLL_CONTAINER_ID = `${strScrollContainerParentId}_${scrollbarProps.orientation}_container`;
  const m_scrollablContainerEle = $(`#${strScrollContentId}` )[0];
  const m_scrollContentParentEle = $(m_scrollablContainerEle).parent()[0];

  let   m_vertScrollContainerEle;
  let   m_horzScrollContainerEle;
  let   m_bVertScrollShowing = false;
  let   m_nCurThumbPos;
  let   m_fVertScrollBar;
  let   m_scrollbarProps;
  let   m_nPixelsPerPage;
  let   m_bInScrollBar;

  this.getScrollContainer = () => SCROLL_CONTAINER_ID;
  this.isVertScroll = () => scrollbarProps.orientation == "vert";
  this.resize = resize;
  this.addScrollListener = addScrollListener;
  this.getWidth = () => $(m_scrollablContainerEle).width();
  this.getHeight = () => $(m_scrollablContainerEle).height();
  this.show = () => $(`#${SCROLL_CONTAINER_ID}`).show();
  this.hide = () => $(`#${SCROLL_CONTAINER_ID}`).hide();

  configObject();

  /**
   * Begin configObject
   */
  async function configObject()
  {
    m_scrollbarProps = configProps();

    if ( self.isVertScroll() )
    {
      createVertScrollContainer();
    }
    else
    {
      createHorzScrollContainer();
    }

    $( m_scrollContentParentEle ).css( "overflow", "hidden" );
    $( m_scrollContentParentEle ).css( "position", "relative" );

    VwSlider.call( self, SCROLL_CONTAINER_ID, m_scrollbarProps, false );

    m_nPixelsPerPage = $( m_scrollContentParentEle).outerHeight();

    setupEventListeners();

  } // end configObject()


  /**
   * Updates the scrollbars size from external size modifications (mostly browawer resizes)
   *
   */
  function resize()
  {
    if ( m_fVertScrollBar )
    {
      resizeVertScrollbar();
     }
    else
    {
      resizeHorzScrollbar();
    }

  } // end resize()

  /**
   * Recompute the scroll units based on the new height of the scrollable data container
   */
  function resizeVertScrollbar()
  {
    calculateVertScrollContainerPosition();
    try
    {
      $( `#${SCROLL_CONTAINER_ID}` ).show();
      const nNbrUnits = $( `#${strScrollContentId}` ).height();

      if ( nNbrUnits <= 0 )
      {
        return;
      }

      self.doResize( -1, -1, nNbrUnits );
    }
    finally
    {
      $( `#${SCROLL_CONTAINER_ID}` ).hide();
    }

  } // end resizeVertScrollbar( nHeight )


  /**
   * Recompute the scroll units based on the new width of the scrollable data container
   */
  function resizeHorzScrollbar( nWidth )
  {
    calculateHorzScrollContainerPosition();
    const nCurWidth = $( m_scrollablContainerEle).width();

    if ( nCurWidth == 0 )
    {
      return;
    }

    let nNbrUnits;
    nNbrUnits = m_scrollablContainerEle.scrollWidth;
    self.doResize( -1, -1, nNbrUnits );

    if ( nWidth > nCurWidth )
    {
      const nCurThumbPos = self.getThumbPos();
      self.setThumbPos( nCurThumbPos );
    }
    else
    {
      if ( $(`#${strScrollContainerParentId}`)[0] )
      {
        $(`#${strScrollContainerParentId}`)[0].style.marginLeft = "0px";
      }

      moveManagedScrollIds( 0 );
    }
  } // end resizeHorzScrollbar(


  /**
   * Adds a scroll Listener
   *
   * @param fnListsner The listener instance
   */
  function addScrollListener( fnListsner )
  {
    m_aScrollListeners.push( fnListsner );
  }


  /**
   * Update margin offsets based on scroll position
   * @param nThumbPos
   */
  function handleThumbPosChanged( nThumbPos )
  {

    //console.log( "ScrollPos: " + nThumbPos + " Thumb Pos: " + self.getThumbPos() );

    m_nCurThumbPos = nThumbPos;

    const nScrollUnits = nThumbPos * -1;

    if ( m_fVertScrollBar )
    {
      $( m_scrollablContainerEle ).css( "margin-top", nScrollUnits );
    }
    else
    {
      $( m_scrollablContainerEle ).css( "margin-left", nScrollUnits );

    }

    if ( m_scrollbarProps.managedScrollIds )
    {
      moveManagedScrollIds( nScrollUnits );
    }

    if ( m_aScrollListeners.length > 0 )
    {
      doScrollListenerCallbacks( nThumbPos );
    }

  } // end handleThumbPosChanged()


  /**
   * Scroll other content on a scroll event for each id specified
   * @param nScrollUnits
   */
  function moveManagedScrollIds( nScrollUnits )
  {
    if ( !m_scrollbarProps || !m_scrollbarProps.managedScrollIds )
    {
      return;
    }

    for ( const strId of m_scrollbarProps.managedScrollIds )
    {
      if ( m_fVertScrollBar )
      {
        $( `#${strId}` ).css( "margin-top", nScrollUnits );

      }
      else
      {
        $( `#${strId}` ).css( "margin-left", nScrollUnits );
      }
    } // end for()

  } // end moveManagedScrollIds()


  /**
   * Call any scroll listenres on this scroll event
   * @param nThumbPos
   */
  function doScrollListenerCallbacks( nThumbPos )
  {
    for ( const fnListenerCallback of m_aScrollListeners )
    {
      fnListenerCallback.onScroll( nThumbPos );
    }

  } // end doScrollListenerCallbacks()


  /**
   * Create the vertical scrollbar container that will house the vertical slider
   * @returns {string}
   */
  function createVertScrollContainer()
  {
    $( m_scrollablContainerEle ).addClass( "VwScrollContainer").addClass( scrollbarProps.cssScrollParent );

    if ( !$( m_scrollablContainerEle ).attr( "tabindex"))
    {
      $( m_scrollablContainerEle ).attr( "tabindex", "0");
    }

    m_vertScrollContainerEle = $( "<div>").attr( "id", SCROLL_CONTAINER_ID ).addClass( "VwVertScroll").addClass( scrollbarProps.cssScrollContainer )[0];
    $( m_scrollContainerParentEle ).append( m_vertScrollContainerEle );

    //todocalculateVertScrollContainerPosition();

    const observer = new MutationObserver((mutationRecords) =>
                                          {
                                            //resize();

                                          });

    observer.observe(m_scrollablContainerEle,
                     {
                       childList:true,
                       subtree: true
                     });

   } // end createVertScrollContainer()

  function calculateVertScrollContainerPosition()
  {
    const strPadding = $(m_scrollContainerParentEle).css("padding" );
// strip off the px at end
    const nPadding = Number( strPadding.substring( 0, strPadding.length - 2 ) );
    const strBorder = $(m_scrollContainerParentEle).css("border-left" ).split( " ")[0];
// strip off the px at end
    const nBorder = Number( strBorder.substring( 0, strBorder.length - 2 ) );

    const nContainerWidth = $(m_scrollContainerParentEle).width() ;

    const nHeight = $( m_scrollContainerParentEle ).height();
    $( m_vertScrollContainerEle).height( nHeight );

    const offsetParent = $( m_scrollContainerParentEle).offset();

    if ( scrollbarProps.scrollBarsOutsideEdge )
    {
      offsetParent.left += nContainerWidth  + (nPadding * 2 ) + nBorder * 2;
    }
    else
    {
      offsetParent.left += (nContainerWidth + nBorder + (nPadding * 2)) - $( m_vertScrollContainerEle ).width();
    }

    offsetParent.top += nBorder;

    $( m_vertScrollContainerEle).css( "top", `${offsetParent.top }px`)
    $( m_vertScrollContainerEle).css( "left", `${offsetParent.left }px`)


  } // end calculateVertScrollContainerPosition()
  
  /**
   * Create the horizontal scrollbar container that will house the horizontal slider
   * @returns {string}
   */
  function createHorzScrollContainer()
  {
    $( m_scrollablContainerEle ).addClass( "VwScrollContainer").addClass( scrollbarProps.cssScrollParent );
    $( m_scrollablContainerEle ).css( "white-space", "nowrap" );

    m_horzScrollContainerEle = $( "<div>").attr( "id", SCROLL_CONTAINER_ID).addClass( "VwHorzScroll").addClass( scrollbarProps.cssScrollContainer )[0];

    $( m_scrollContainerParentEle ).append( m_horzScrollContainerEle );

    calculateHorzScrollContainerPosition();

  } // end createHorzScrollContainer()

  /**
   * Calulate the horizontal scroll container
   */
  function calculateHorzScrollContainerPosition()
  {
    const offsetHorzScroll = $( m_scrollContentParentEle).offset();

    offsetHorzScroll.top += $( m_scrollContentParentEle ).height();
    $( m_horzScrollContainerEle).width( m_scrollContainerParentEle.offsetWidth );

    $( m_horzScrollContainerEle).css( "top", `${offsetHorzScroll.top }px`)
    $( m_horzScrollContainerEle).css( "left", `${offsetHorzScroll.left }px`)

  } // end calculateHorzScrollContainerPosition()

  /**
   * Install the DOM data container change listener to up date the scroll bar change
   */
  function setupEventListeners()
  {
    m_scrollContentParentEle.addEventListener( "mousewheel", handleMouseWheelMove, false );

    m_scrollablContainerEle.addEventListener( "VwVisibleEvent", handleResize );

    $( m_scrollContainerParentEle ).hover( () =>
                                        {
                                          if ( m_fVertScrollBar )
                                          {
                                            handleVertScrollHover();
                                          }
                                          else
                                          {
                                            handleHorzScrollHover();
                                          }

                                        }, () =>
    { // hover out
      if ( !self.isMouseDown() )
      {
        if ( scrollbarProps.scrollableContainerId )
        {
         $( `#${strScrollContainerParentId}` ).hide();
        }
        else
        {
          $( `#${SCROLL_CONTAINER_ID}` ).hide();
        }
      }

    });


    if ( scrollbarProps.scrollableContainerId )
    {
      $(`#${strScrollContainerParentId}`).mouseenter( () =>
                                      {
                                        m_bInScrollBar = true;
                                        $( `#${strScrollContainerParentId}` ).show();
                                      });

       $(`#${strScrollContainerParentId}`).mouseleave( () =>
       {
         $( `#${strScrollContainerParentId}` ).hide();
       });

    } // end if


    window.addEventListener( "resize", () =>
    {
      self.setThumbPos( 0 );
      resize();
    });


    if ( self.isVertScroll() )
    {
      $(m_scrollablContainerEle).on( "keydown", handleKeyDownEvent );
    }

  } // end setupEventListeners()


  /**
   * Keydown event handler
   * @param ke
   */
  function handleKeyDownEvent( ke )
  {
    switch( ke.keyCode )
    {
      case 33:

        handlePageUpEvent();
        break;

      case 34:

        handlePageDownEvent();
        break;

       case 35:

        if ( ke.metaKey )
        {
          handleGoToBottom();
        }

        break;

      case 36:

        if ( ke.metaKey )
        {
          handleGoToTop();
        }

        break;

      case 38:

        handleLineUp();
        break;

      case 40:

        handleLineDownDown();
        break;

    } // end switch()

  } // handleKeyDownEvent()


  /**
   * Pageup key event handler
   */
  function handlePageUpEvent()
  {
    m_nCurThumbPos -= m_nPixelsPerPage;

    if ( m_nCurThumbPos < 0 )
    {
      m_nCurThumbPos = 0;
    }

    self.setThumbPos( m_nCurThumbPos );

  } // end handlePageUpEvent()


  /**
   * Pagedown key event handler
   */
  function handlePageDownEvent()
  {
    const nScrollContainerHeight = $(m_scrollablContainerEle ).height();

    m_nCurThumbPos += m_nPixelsPerPage;

    if ( (m_nCurThumbPos + m_nPixelsPerPage ) > nScrollContainerHeight )
    {
      m_nCurThumbPos = nScrollContainerHeight - m_nPixelsPerPage;
    }

    self.setThumbPos( m_nCurThumbPos );

  } // end handlePageUpEvent()


  /**
   * Home ket event handler
   */
  function handleGoToTop()
  {
    m_nCurThumbPos = 0;
    self.setThumbPos( m_nCurThumbPos );

  } // end handleGotoTop()


  /**
   * End key event handler
   */
  function handleGoToBottom()
  {
    const nScrollContainerHeight = $(m_scrollablContainerEle ).height();

    m_nCurThumbPos = nScrollContainerHeight - m_nPixelsPerPage;
    self.setThumbPos( m_nCurThumbPos );

  } // end handleGotoBottom()

  /**
   * Up array key event handler
   */
  function handleLineUp()
  {
    m_nCurThumbPos -= 16;

    if ( m_nCurThumbPos < 0 )
    {
      m_nCurThumbPos = 0;
    }

    self.setThumbPos( m_nCurThumbPos );

  } // end handleLineUp()

  /**
   * Down array event handler
   */
  function handleLineDownDown()
  {
    const nScrollContainerHeight = $(m_scrollablContainerEle ).height();

    m_nCurThumbPos += 16;

    if ( (m_nCurThumbPos + m_nPixelsPerPage ) > nScrollContainerHeight )
    {
      m_nCurThumbPos = nScrollContainerHeight - m_nPixelsPerPage;
    }

    self.setThumbPos( m_nCurThumbPos );


  } // end handleLineDownDown()


  /**
   * Window resize event handler
   * @param event
   * @return {boolean}
   */
  function handleResize( event )
  {
    event.stopPropagation();
    //event.stopImmediatePropagation();

    if ( scrollbarProps.orientation == "vert" )
    {
      resizeVertScrollbar();
    }

    if ( scrollbarProps.orientation == "horz" )
    {
      resizeHorzScrollbar();

    }

    return false;
  }

  /**
   * Verticle scroll event handler
   */
  function handleVertScrollHover()
  {
    const nScrollContainerHeight = $(m_scrollablContainerEle).height();
    const nScrollContainerParentHeight = $( m_scrollContentParentEle).height();
    const nThumbHeight = self.getThumbHeight();

    if ( isNaN( nThumbHeight ) || nScrollContainerHeight <= nScrollContainerParentHeight + 3 )
    {
      m_bVertScrollShowing = false;
      return; // Nothing to scroll
    }

    m_bVertScrollShowing = true;

    $(`#${SCROLL_CONTAINER_ID}` ).show()

  } // handleVertScrollHover()

  /**
   * Horizontal scroll hover event handler
   */
  function handleHorzScrollHover()
  {
    if ( !$(`#${strScrollContainerParentId}`)[0] )
    {
      return;
    }

    const nScrollContainerWidth = m_scrollablContainerEle.scrollWidth;
    const nScrollContainerParentWidth = $( m_scrollContentParentEle).width();
    const nThumbWidth = self.getThumbWidth();

    if ( isNaN( nThumbWidth ) || nScrollContainerWidth <= nScrollContainerParentWidth + 3 )
    {
      return; // Nothing to scroll
    }

    $(`#${SCROLL_CONTAINER_ID}` ).show()

  } // end handleHorzScrollHover()


  /**
   * Mouse wheel event handler
   * 
   * @param event
   * @returns {boolean}
   */
  function handleMouseWheelMove( event )
  {
    if ( !m_bVertScrollShowing )
    {
      return;
    }

    const nDeltaY = event.deltaY;

    const nNewThumbPos = self.getThumbPos() + nDeltaY;

    self.updateFromMouseWheel( nNewThumbPos );
    return false;

  } // end handleMouseWheelMove()



  /**
   * Congig scrollbar default props
   */
  function  configProps()
  {
    const props = {};
    props.computeThumb = true;
    props.useThumbSizeInBoundsCheck = true;

    props.position = "absolute";
    props.fnPosChange = handleThumbPosChanged;

    if ( scrollbarProps.orientation == "vert" )
    {
      m_fVertScrollBar = true;
      props.cssSlider = "VwVertScroll";
      props.cssThumb = "VwVertThumb";
      props.nbrOfUnits = $( m_scrollablContainerEle ).height();
    }
    else
    {
      props.cssSlider = "VwHorzScroll";
      props.cssThumb = "VwHorzThumb";
      props.nbrOfUnits = $( m_scrollContentParentEle ).scrollWidth;

    }

    if ( typeof props.nbrOfUnits == "undefined" || props.nbrOfUnits <= 0 )
    {
      props.nbrOfUnits = 1 ;
    }

    $.extend( props, scrollbarProps );

    return props;

  } // end configProps()

} // end VwScrollBar{}

VwScrollBar.prototype = new VwSlider();

export default VwScrollBar;


