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

 import VwEventMgr   from "/vozzworks/util/VwEventMgr/VwEventMgr.js";
 import VwHashMap   from "/vozzworks/util/VwHashMap/VwHashMap.js";

 VwCssImport( "/vozzworks/ui/VwSlider/style");

/**
 * jQuery invoker
 */
$.fn.vwSlider = function ( objProperties )
{

  return new VwSlider( this[0].id, objProperties );

};

/**
 * Slider
 *
 * This class creates a horizontal/vertical slider control. You can provide a call back handler to get updated thumb
 * position  in real time, query the current thumb position or provide a call back handler the a moseup event
 * @param strSliderParentId  Parent id where sliders's html will be placed
 * @param nWidth width of slider bar
 * @param nHeight height of progress bar
 * @param sliderProps optional properties:
 *        orientation:String(optional) values are "vert" or "horz" The default is "horz" (Horizontal slider)
 *        cssSlider:String class for the progress bar
 *        cssSliderFill:the css applied to the distance from the start of the slider to the beginning of the thumb
 *        cssThumb:String override class for sliders thumb
 *        thumbOffset:Number if specified the offset amount in px to add to the slider file, only applied if cssSliderFill is spceifes
 *        cssSliderImage:String the name of the class for the slider image if the sliderImage property is defined
 *        sliderImage:String a url to an image to be used as the sliders background
 *        thumbImage:String a url to an image to be used as the thumb's background
 *        width:String  the width of the slider as an html units i.e px, ems, % etc
 *        height:string the height The height the the slider as an html units i.e px, ems, % etc
 *        zeroOnBottom:boolean if true, position 0 is at the bottom for a vertical slider, default is false
 *        fnPosChange:function( sliderPos ) Callback function when the sliders position changes
 *        fnMouseUp:function( sliderPos )   Callback function when the mouse is released
 * @constructor
 */
function VwSlider( strSliderParentId, sliderProps, bNoResize )
{

  if ( arguments.length == 0 )
  {
    return;  // sub class protoype call
  }

  const self = this;
  const m_strSliderId = strSliderParentId;
  const m_strThumbId = m_strSliderId + "_thumb";
  const m_strFillId = m_strSliderId + "_fill";
  const m_strSliderImgId = m_strSliderId + "_img";
  const m_mapAnnotionMarkers = new VwHashMap();
  const m_eventMgr = new VwEventMgr();

  let m_nWidth = -1;
  let m_nHeight = -1;
  let m_nThumbWidth;
  let m_nThumbHeight;
  let m_nThumbOffset = 0;
  let m_sliderProps;
  let m_nPixPerUnit;
  let m_nPosInUserUnits;
  let m_fVertSilder = false;
  let m_fUseThumbSizeInBoundsCheck;
  let m_nMouseStartPos = -1;
  let m_nCurThumbPos;
  let m_offsetSlider;
  let m_sliderEl;
  let m_thumbEl;
  let m_bIgnoreBrowserResize;

  // PUBLIC Methods

  this.setThumbPos = setThumbPos;
  this.getThumbPos = getThumbPos;
  this.setPositionChangeCallback = (fnAllowPosChange ) => m_sliderProps.fnAllowPosChange = fnAllowPosChange;
  this.setThumbPosFromMouseEvent = handleSliderMouseDown;
  this.updateFromMouseWheel = handleUpdateFromMouseWheel;
  this.getWidth = getWidth;
  this.getHeight = getHeight;
  this.getThumbHeight = () => m_nThumbHeight;
  this.getThumbWidth = () => m_nThumbWidth;

  this.setThumbLength = setThumbLength;
  this.getPixelsPerUnit = getPixelsPerUnit;
  this.mouseEventToUserUnits = mouseEventToUserUnits;
  this.addAnnotationMarker = addAnnotationMarker;
  this.removeAnnotationMarker = removeAnnotationMarker;
  this.clearAnnotationMarkers = clearAnnotationMarkers;
  this.isMouseDown = isMouseDown;
  this.updateScrollUnits = computeThumbMetrics;
  this.doResize = resize;
  this.setIgnoreBrowserResize = ( bIgnoreBrowserResize ) => m_bIgnoreBrowserResize = bIgnoreBrowserResize;
  this.show = show;
  this.hide = hide;
  this.showThumb = showThumb;
  this.hideThumb = hideThumb;

  this.sliderMouseDown = handleSliderMouseDown;
  this.getXPos = getXPos;
  this.getYPos = getYPos;

  configObject();
  setupActions();

  /**
   * Begin configObject
   */
  function configObject()
  {
    configProps( sliderProps );

    // Configure slider parent element
    m_sliderEl = $( `#${m_strSliderId}` );
    m_sliderEl.css( "position", m_sliderProps.position ).addClass( m_sliderProps.cssSlider ).empty();

    // Add slider image if available
    if ( m_sliderProps.sliderImage )
    {
      m_sliderEl.append( $( "<img>" ).attr( "id", m_strSliderImgId ).src( m_sliderProps.sliderImage ).addClass( m_sliderProps.cssSliderImage ) );
    }

    // Configure thumb element
    m_thumbEl = $( "<div>" ).attr( "id", m_strThumbId ).css( "position", "absolute" ).addClass( m_sliderProps.cssThumb );

    if ( m_sliderProps.fHideThumb )
    {
      m_thumbEl.hide() ;
    }

    m_sliderEl.append( m_thumbEl );
    if ( m_sliderProps.thumbImage )
    {
      m_thumbEl.append( $( "<img>" ).attr( "src", m_sliderProps.thumbImage ).addClass( m_sliderProps.cssThumbImage ) );
    }


    if ( m_sliderProps.fShowThumbOnHover )
    {
      m_thumbEl.hide();

      $(`#${strSliderParentId}` ).hover( showThumb, null );
      $(`#${strSliderParentId}` ).mouseup( hideThumb );

    }


    // Configure filler element
    const fillerEl = $( "<div>" ).attr( "id", m_strFillId ).css( "position", "absolute" ).hide();

    if ( m_sliderProps.cssSliderFill )
    {
      fillerEl.show().addClass( m_sliderProps.cssSliderFill );
    }

    m_sliderEl.append( fillerEl );

    getSliderMetrics();

    setThumbPos( m_sliderProps.initialThumbPos );

  } // end configObject()


  function show()
  {
    $( `#${strSliderParentId}` ).show();
  }

  function hide()
  {
    $( `#${strSliderParentId}` ).hide();
  }


  /**
   *
   * Show the sliders thumb
   */
  function showThumb()
  {
    m_thumbEl.show();

  }

  /**
   *
   * Hide the sliders thumb
   */
  function hideThumb()
  {
    m_thumbEl.hide();

  }

  /**
   * Handles resize events when the container holding the slider changes width or height
   * @param nWidth
   * @param nHeight
   */
  function resize( nWidth, nHeight, nNbrUnits )
  {
    m_nWidth = nWidth;
    m_nHeight = nHeight;

    getSliderMetrics( nNbrUnits );

  } // end resize()


  /**
   * Gets width and height of the slider.
   */
  function getSliderMetrics( nNbrUnits )
  {
    // Get thumb metrics from css if not computing thumb from scroll units
    if ( !m_sliderProps.computeThumb )
    {
      m_nThumbHeight = $( `#${m_strThumbId}` ).height();
      m_nThumbWidth = $( `#${m_strThumbId}` ).width();
    }

    if ( m_nWidth < 0 ) // Was not defined in props, so get it from css
    {
      m_nWidth = $( `#${m_strSliderId}` ).width();
    }
    else
    {
      $( `#${m_strSliderId}` ).width( m_nWidth );
      m_nWidth = $( `#${m_strSliderId}` ).width(); // Get it back in pixels
    }

    if ( m_nHeight < 0 ) // Was not defined in props, so get it from css
    {
      m_nHeight = $( `#${m_strSliderId}` ).height();
    }

    if ( nNbrUnits )
    {
      m_sliderProps.nbrOfUnits =  nNbrUnits;
    }

    computeThumbMetrics( m_sliderProps.nbrOfUnits, m_nWidth, m_nHeight );

  } // end getSliderMetrics()


  /**
   * Computes the thumb metrics and pixels per scroll unit ratio
   * @param nNbrUnits
   */
  function computeThumbMetrics( nNbrUnits, nWidth, nHeight )
  {
    if (isNaN( nNbrUnits ) ||  nNbrUnits == 0 )
    {
      return;
    }

    m_nWidth = nWidth;
    m_nHeight = nHeight;

    if ( !m_nWidth || m_nWidth < 0 )
    {
      m_nWidth = $( `#${m_strSliderId}` ).width();

    }

    if ( !m_nHeight || m_nHeight < 0 )
    {
      m_nHeight = $( `#${m_strSliderId}` ).height();

    }

    m_sliderProps.nbrOfUnits = nNbrUnits;

    if ( !m_fVertSilder )
    {
      m_nThumbHeight = $( `#${m_strThumbId}` ).height();

      // Horizontal slider
      m_nPixPerUnit = m_nWidth / nNbrUnits;

      if ( sliderProps.thumbOffset )
      {
        m_nThumbOffset = sliderProps.thumbOffset;
      }

       // If this prop set, the thumb height is computed on the pct of units showing in the container
      if ( m_sliderProps.computeThumb )
      {

        let nPctShowing = m_nWidth / nNbrUnits * 100;  // % of units showing
        if ( nPctShowing < 0 || nPctShowing > 100 )
        {
          nPctShowing = 1;
        }

        m_nThumbWidth = m_nWidth * (nPctShowing / 100)

        if ( m_nThumbWidth < 2 )
        {
          m_nThumbWidth = 2;
        }
      }

      $( `#${m_strThumbId}` ).width( m_nThumbWidth );

    }
    else
    {
      m_nThumbWidth = $( `#${m_strThumbId}` ).width();
      
      // Vertical slider
      m_nPixPerUnit = m_nHeight / nNbrUnits;

      if ( sliderProps.thumbOffset )
      {
        m_nThumbOffset = sliderProps.thumbOffset;
      }


      // If this prop set, the thumb height is computed on the pct of units showing in the container
      if ( m_sliderProps.computeThumb )
      {
        let nPctShowing = m_nHeight / nNbrUnits * 100;  // % of units showing
        if ( nPctShowing < 0 || nPctShowing > 100 )
        {
          nPctShowing = 1;
        }

        m_nThumbHeight = m_nHeight * (nPctShowing / 100);  // Height from % of units showng to the height of the scrollable container
        if ( m_nThumbHeight < 2 )
        {
          m_nThumbHeight = 2;
        }
      }

      $( `#${m_strThumbId}` ).height( m_nThumbHeight );

    }

  } // end computeThumbMetrics


  /**
   * Adds an annotation marker element, The element to be added is a DOM element
   *
   * @param nPos The posotopn on the slider to add
   * @param htmlMarkerEl The html element to add
   * @param fCenterAtPos if true, centers the marker at the position added
   */
  function addAnnotationMarker( nPos, htmlMarkerEl, fCenterAtPos )
  {
    m_mapAnnotionMarkers.put( nPos, null);

    $( htmlMarkerEl ).attr( "id", "markerPos_" + nPos );

    m_sliderEl.append( htmlMarkerEl )

    let nMarkerPos = nPos * m_nPixPerUnit;
    let nMarkerCenter = 0;
    let nMarkerOffset = 0;

    if ( m_fVertSilder )
    {
      if ( fCenterAtPos )
      {
        nMarkerCenter = $( htmlMarkerEl ).height() / 2;
      }

      // Adjust if zero is on the bottom of the slider
      if ( m_sliderProps.zeroOnBottom )
      {
       nMarkerPos = m_nHeight - nMarkerPos  - nMarkerCenter;
      }
      else
      {
        nMarkerPos  = nThumbPos - nMarkerCenter;
      }

      if ( nMarkerPos > (m_nHeight + nMarkerCenter) )
      {
        nMarkerPos  = m_nHeight - nMarkerCenter;
      }
      else
      {
        if ( nMarkerPos < (0 - nMarkerCenter) )
        {
          nMarkerPos = 0 - nMarkerCenter;
        }
      }

      $( htmlMarkerEl ).css( {"top": nMarkerPos} );

    } // end if (m_fVerSlider )
    else
    {
      nMarkerOffset = m_nHeight / 2 - $( htmlMarkerEl ).height() / 2;

      if ( fCenterAtPos )
      {
        nMarkerCenter = $( htmlMarkerEl ).width() / 2;
      }
      
      nMarkerPos = nMarkerPos - nMarkerOffset;
      let nMarkerTop = m_nHeight / 2 - $(htmlMarkerEl).height() / 2;

      if ( nMarkerTop < 0 )
      {
        nMarkerTop = 0;

      }
      // Horizontal slider
      $( htmlMarkerEl ).css( { "left": nMarkerPos} );

    }

  } // end addAnnotationMarker()

  /**
   * Removes an seek bar marker at the position specified
   *
   * @param nPos The position of the market
   */
  function removeAnnotationMarker( nPos )
  {
    m_mapAnnotionMarkers.remove( nPos );
    $( `#${markerPos}_${nPos}` ).remove();

  }

  /**
   * Removes all annotation markers
   */
  function clearAnnotationMarkers()
  {
    for ( const nAnnoPos of m_mapAnnotionMarkers.keys() )
    {
      removeAnnotationMarker( nAnnoPos );
    }

  } // end clearAnnotationMarkers()


  /**
   * Returns true if the mouse is currently in a pressed state
   * @returns {boolean}
   */
  function isMouseDown()
  {
    return m_nMouseStartPos >= 0;
  }

  /**
   * Install mouse actions for dragging the slider's thumb
   */
  function setupActions()
  {
    $( `#${m_strThumbId}`).unbind( "mousedown", handleMouseDown ).bind( "mousedown", handleMouseDown );
    $( `#${m_strSliderId}` ).bind( "mousedown", handleSliderMouseDown );

    if ( bNoResize )
    {
      return;   // handled by subclass

    }

    window.addEventListener( "resize", handleBrowserResize );

  } // end setupActions()


  /**
   * Update metrics
   */
  function handleBrowserResize()
  {
   if ( m_bIgnoreBrowserResize )
   {
     return;

   }

   m_nWidth = m_nHeight = -1;
   m_offsetSlider = null;
   getSliderMetrics( sliderProps.nbrOfUnits );

  } // end handleBrowserResize()


  /**
   * Setup to start dragging the thumb
   * @param event The mouse click event
   */
  function handleMouseDown( event )
  {
    event.stopImmediatePropagation();

    if ( m_fVertSilder )
    {
      m_eventMgr.fireEvent( VwSlider.VW_VERT_MOUSE_DOWN, event );
      m_nMouseStartPos = getYPos( event );
    }
    else
    {
      m_eventMgr.fireEvent( VwSlider.VW_HORZ_MOUSE_DOWN, event );
      m_nMouseStartPos = getXPos( event );

    }

    $(window).unbind( "mouseup", handleMouseUp ).bind( "mouseup", handleMouseUp ).unbind( "mousemove", handleMouseMove ).bind( "mousemove", handleMouseMove );

    return false;

  } // end handleMouseDown()


  /**
   * Mouse down on the slider itself. This will change the position of the thumb
   * @param event
   */
  async function handleSliderMouseDown( event )
  {
    let nNewMousePos;

    if ( m_fVertSilder )
    {

      nNewMousePos = getYPos( event );

      nNewMousePos = calcVertBounds( nNewMousePos );
      if ( m_sliderProps.zeroOnBottom )
      {
        nNewMousePos = m_nHeight - nNewMousePos;

      }

      nNewMousePos /= m_nPixPerUnit;
    }
    else
    {
      nNewMousePos = getXPos( event );

      nNewMousePos = calcHorzBounds( nNewMousePos );

      nNewMousePos /= m_nPixPerUnit;
    }

    if ( m_sliderProps.fnAllowPosChange )
    {
      const bAllow = await m_sliderProps.fnAllowPosChange()
      if ( !bAllow )
      {
       return;
      }

     continuePosChange();
    }
    else
    {
      continuePosChange() ;
    }
    
    function continuePosChange()
    {
      setThumbPos( nNewMousePos );
    }

    return false;

  } // end handleSliderMouseDown()


  /**
   * Release mouse listeners
   */
  function handleMouseUp( event )
  {
    if ( m_fVertSilder )
    {
      m_eventMgr.fireEvent( VwSlider.VW_VERT_MOUSE_UP, event );
    }
    else
    {
      m_eventMgr.fireEvent( VwSlider.VW_HORZ_MOUSE_UP, event );
    }

    m_nMouseStartPos = -1;


    $(window).unbind( "mouseup", handleMouseUp ).unbind( "mousemove", handleMouseMove );

    window.removeEventListener( "resize", handleBrowserResize );

    // Call mouse up handler if specified with the last position computed fro mousemove
    if ( m_sliderProps.fnMouseUp )
    {
      m_sliderProps.fnMouseUp( m_nPosInUserUnits );

    }

  } // end handleMouseUp()


  /**
   * The mousemove thumb drag handler
   *
   * @param event mousemove event
   * @returns {boolean}
   */
  function handleMouseMove( event )
  {

    if ( m_nMouseStartPos < 0 )
    {
      return;
    }

    event.stopImmediatePropagation();

    const nNewMousePos = getMouseOffset( event );

    const nIncrement = nNewMousePos - m_nMouseStartPos;

    const nNewThumbPos = m_nCurThumbPos + nIncrement;

    m_nMouseStartPos = nNewMousePos;

    let bContinue;

    if ( m_fVertSilder )
    {
      bContinue = handleVertSliderMove( nNewThumbPos );
    }
    else
    {
      bContinue = handleHorzSliderMove( nNewThumbPos );
    }

    if ( !bContinue )
    {
      return false;
    }

    // Convert the mouse pos to the units specified by client
    m_nPosInUserUnits /= m_nPixPerUnit;

    if ( m_sliderProps.fnPosChange )
    {
      m_sliderProps.fnPosChange( m_nPosInUserUnits );
    }

    return false;

  } // end handleMouseMove()

  /**
   * Updates the vertical scroll position from a mouse weel event
   * @param nNewThumbPos The new thumb position
   * @returns {boolean}
   */
  function handleUpdateFromMouseWheel( nNewThumbPos )
  {
    const fContinue = handleVertSliderMove( nNewThumbPos );
    if ( !fContinue )
    {
      return false;
    }

    m_nPosInUserUnits /= m_nPixPerUnit;

    if ( m_sliderProps.fnPosChange )
    {
      m_sliderProps.fnPosChange( m_nPosInUserUnits );
    }

  }  // end handleUpdateFromMouseWheel()


  /**
   * Handles vertical slider move events
   *
   * @param nNewThumbPos The new thumb position
   */
  function handleVertSliderMove( nNewThumbPos )
  {

    nNewThumbPos = calcVertBounds( nNewThumbPos );

    if ( nNewThumbPos == m_nCurThumbPos )
    {
      //console.log( "Thumb Pos Same: " + nNewThumbPos + ", " + m_nCurThumbPos);
      return false; // ThumbPos the same as before
    }

    m_nCurThumbPos = nNewThumbPos;

    m_nPosInUserUnits = m_nCurThumbPos;

    // Reverse position if zero is on bottom
    if ( m_sliderProps.zeroOnBottom )
    {
      m_nPosInUserUnits = m_nHeight - m_nPosInUserUnits;
    }

    $( `#${m_strThumbId}` ).css( "top", m_nCurThumbPos );

    if ( m_sliderProps.cssSliderFill )
    {
      doVertSliderFill();
    }

    return true;

  } // end handleVertSliderMove()

  /**
   * Calculates thumb position based on vertical slider metrics
   *
   * @param nNewThumbPos The new thumb position by the mouse drag
   * @returns {*}
   */
  function calcVertBounds( nNewThumbPos )
  {
    // Keep the thumb in bounds
    if ( nNewThumbPos < 0 )
    {
      nNewThumbPos = 0;
    }
    else
    {
      if ( m_fUseThumbSizeInBoundsCheck )
      {
        if ( nNewThumbPos > (m_nHeight - m_nThumbHeight) )
        {
          nNewThumbPos = m_nHeight - m_nThumbHeight;
        }
      }
      else
      {
        if ( nNewThumbPos > m_nHeight )
        {
          nNewThumbPos = m_nHeight;
        }

      }
    }

    return nNewThumbPos;

  } // end calcVertBounds()

  /**
   *
   * @param nNewThumbPos
   * @returns {*}
   */
  function calcHorzBounds( nNewThumbPos )
  {
    // Keep the thumb in bounds
    if ( nNewThumbPos < 0 )
    {
      nNewThumbPos = 0;
    }
    else
    {
      if ( m_fUseThumbSizeInBoundsCheck )
      {
        if ( nNewThumbPos > (m_nWidth - m_nThumbWidth) )
        {
          nNewThumbPos = m_nWidth - m_nThumbWidth;
        }
      }
      else
      {
        if ( nNewThumbPos > m_nWidth )
        {
          nNewThumbPos = m_nWidth ;
        }
      }

    }

    return nNewThumbPos;

  } // end calcHorzBounds()


  /**
   * Handles horizontal slider move events
   *
   * @param nNewThumbPos The new thumb position
   */
  function handleHorzSliderMove( nNewThumbPos )
  {
    nNewThumbPos = calcHorzBounds( nNewThumbPos );

    if ( nNewThumbPos == m_nCurThumbPos )
    {
      //console.log( "Thumb Pos Same: " + nNewThumbPos + ", " + m_nCurThumbPos);
      return false; // ThumbPos the same as before
    }

    m_nCurThumbPos = nNewThumbPos;
    m_nPosInUserUnits = m_nCurThumbPos;

     $( `#${m_strThumbId}` ).css( "left", m_nCurThumbPos );

    if ( m_sliderProps.cssSliderFill )
    {
      doHorzSliderFill();
    }

    return true;
    
  } // end handleHorzSliderMove()

  /**
   * Gets the mouse Y pos offset within the slider container
   * @param event
   * @returns {number}
   */
  function getYPos( event )
  {
    if ( !m_offsetSlider )
    {
      m_offsetSlider = $( `#${m_strSliderId}` ).offset();
    }

    return event.clientY - m_offsetSlider.top;

  } // end getYPos()

  /**
   * Gets the mouse X pos offset within the slider container
   * @param event
   * @returns {number}
   */
  function getXPos( event )
  {
    if ( !m_offsetSlider )
    {
      m_offsetSlider = $( `#${m_strSliderId}` ).offset();

    }

    return event.clientX - m_offsetSlider.left;

  } // end getXPos()

  /**
   * Convert converts a mouse event to user units in the slider
   * @param event
   * @returns {number}
   */
  function mouseEventToUserUnits( event )
  {
    let nMousePos;

    if ( m_fVertSilder )
    {
      nMousePos = getYPos( event );
    }
    else
    {
      nMousePos = getXPos( event );

    }

    return nMousePos / m_nPixPerUnit;

  }
  /**
   * Compute inner div fill height and top position
   */
  function doVertSliderFill()
  {
    const nFillHeight = m_nHeight - (m_nCurThumbPos + m_nThumbHeight + m_nThumbOffset );

    $( `#${m_strFillId}` ).height( nFillHeight ).css( "top", m_nCurThumbPos + m_nThumbHeight + m_nThumbOffset );
  }


  /**
   * Compute inner div fill height and top position
   */
  function doHorzSliderFill()
  {
    const fillerEl = $( `#${m_strFillId}` );

    fillerEl.css( "left", 0 );

    fillerEl.width( m_nCurThumbPos + 4);
  }

  /**
   * Gets the current thumbPos in units
   * @returns {*}
   */
  function getThumbPos()
  {
    return m_nCurThumbPos;
  }

  /**
   * Gets the slider width
   * @returns {number}
   */
  function getWidth()
  {
    return m_nWidth;

  }


  /**
   * Gets the slider height
   * @returns {number}
   */
  function getHeight()
  {
    return m_nHeight;

  }

  function setThumbLength( nLength )
  {
    if ( m_fVertSilder )
    {
      m_nThumbHeight = nLength;
      $( m_thumbEl ).height( nLength );
    }
    else
    {
      m_nThumbWidth = nLength;
      $( m_thumbEl ).width( nLength );

    }
  }

  /**
   * Returns the current pixels ratio per slider unit
   * @returns {*}
   */
  function getPixelsPerUnit()
  {
    return m_nPixPerUnit  ;

  }


  /**
   * Sets the slider's thumb position
   * @param nPctComplete
   */
  function setThumbPos( nNewThumbPos, fNoCallback )
  {
    if ( isNaN( nNewThumbPos ))
    {
      nNewThumbPos = 0;
    }

    m_nPosInUserUnits = nNewThumbPos;

    // Keep the thumb in bounds
     if ( m_nPosInUserUnits < 0 )
     {
       m_nPosInUserUnits = 0;
     }
     else
     {
       if ( m_nPosInUserUnits > m_sliderProps.nbrOfUnits )
       {
         m_nPosInUserUnits = m_sliderProps.nbrOfUnits;
       }
     }

    if ( m_fVertSilder )
    {

      // Reverse position if zero is on bottom
      if ( m_sliderProps.zeroOnBottom )
      {
        m_nPosInUserUnits = m_sliderProps.nbrOfUnits - m_nPosInUserUnits;
      }

      m_nCurThumbPos = m_nPosInUserUnits * m_nPixPerUnit;

      $( `#${m_strThumbId}` ).css( "top", m_nCurThumbPos );

      if ( m_sliderProps.cssSliderFill )
      {
        doVertSliderFill();
      }

    }
    else
    {
      // Horizontal scrollbar
      m_nCurThumbPos = m_nPosInUserUnits * m_nPixPerUnit;

      $( `#${m_strThumbId}` ).css( "left", m_nCurThumbPos );

      if ( m_sliderProps.cssSliderFill )
      {
        doHorzSliderFill();
      }


    }  // end else

    if ( fNoCallback )
    {
      return;
    }

    if ( m_sliderProps.fnPosChange )
    {
      m_sliderProps.fnPosChange( m_nPosInUserUnits );

    }

  } // end setThumbPos


  /**
   * Returns the proper offset based on whether its a horizontal or vertical slider
   * @param event
   * @returns {*}
   */
  function getMouseOffset( event )
  {
    if ( m_fVertSilder )
    {
      return getYPos( event );
    }
    else
    {
      return getXPos( event );

    }
  }

  /**
   * Setups the slider's default props and add anu user props
   *
   * @param objProps Optional user props
   */
  function configProps( objProps )
  {
    m_sliderProps = {};

    m_sliderProps.cssSlider = "VwSlider";
    m_sliderProps.cssThumb = "VwSliderThumb";
    m_sliderProps.position = "relative";
    m_sliderProps.initialThumbPos = 0;
    
    m_fUseThumbSizeInBoundsCheck = objProps.useThumbSizeInBoundsCheck;

    $.extend( m_sliderProps, objProps );

    if ( m_sliderProps.width )
    {
      m_nWidth = m_sliderProps.width; //VwExString.convertToPixels( _objProps.width.toString() );
    }

    if ( m_sliderProps.height )
    {
      m_nHeight = m_sliderProps.height; //VwExString.convertToPixels( _objProps.height.toString() );
    }


    if ( !m_sliderProps.nbrOfUnits )
    {
      throw "VwSlider control requires the nbrOfUnits property to be set.";
    }

    if ( m_sliderProps.orientation && m_sliderProps.orientation == "vert" )
    {
      m_fVertSilder = true;
    }

    return m_sliderProps;

  }

} // end VwSlider{}

VwSlider.VW_VERT_MOUSE_DOWN  = "vwVertMouseDown";
VwSlider.VW_VERT_MOUSE_UP    = "vwVertMouseUp";
VwSlider.VW_HORZ_MOUSE_DOWN  = "vwHorzMouseDown";
VwSlider.VW_HORZ_MOUSE_UP    = "vwHorzMouseDown";

export default VwSlider;
