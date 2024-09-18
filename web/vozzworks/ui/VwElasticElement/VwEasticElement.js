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
 *  ============================================================================================
 * /
 */

VwCssImport( "/vozzworks/ui/VwElasticElement/style");

/**
 * JQuery wrap
 * @param props
 * @returns {VwElasticElement}
 */
$.fn.vwElasticElement = function( props )
{
  return new VwElasticElement( this[0].id, props )
}

/**
 * This class wraps an html element with re-sizeable borders to allow the resizing of an element
 * and can also move the element to a new location.
 *
 * @param strElementIdToWrap The id of the html element to wrap
 * @param props Configuration properties:
 *        allowMove:Optional:boolean if true, allows the element to be moved else only resizing is allowed. The default is true.
 *        releaseOnMove:Optional:boolean if true this wrapper is removed when the window drag is complete
 *        elementRestrictId:Optionsl:String the id of a dom element this window must be contained in
 *        cssElementWrap:Optional:String The class name used for the wrapper div, The default is "VwElementWrapContainer"
 *        cssMarker:Optional:String The class name used for the markers on the wrapper div's borders. The default is "VwStretchMarker"
 * @constructor
 */
function VwElasticElement( strElementIdToWrap, props, bReadonly )
{
  let m_props;
  let m_toWrapParentEle;
  let m_strWrapContainerId;
  let m_toWrapEle;
  let m_divWrapContainer;
  let m_strMarkerDragId;
  let m_divTopEle;
  let m_divBotEle;
  let m_divLeftEle;
  let m_divRightEle;
  let m_divTopRightCornerEle;
  let m_divBotRightCornerEle;
  let m_divTopLeftCornerEle;
  let m_divBotLeftCornerEle;
  let m_nMouseStartXPos;
  let m_nMouseStartYPos;
  let m_nWidth;
  let m_nHeight;
  let m_fIgnoreClick = true;
  let m_fMarkerClick;
  let m_eleRectRestrictContainer;

  this.getPosition = getPosition;
  this.getWidth = getWidth;
  this.getHeight = getHeight;
  this.resize = resize;

  this.remove = remove;
  this.hide = hide;
  this.show = show;
  this.release = release;
  this.moveTo = moveTo;
  this.closeOnEscapeKey = closeOnEscapeKey;
  this.mouseMove = handleMouseMove;
  this.mouseDown = handleMouseDown;
  this.mouseUp = handleMouseUp;
  this.keyPress = handleKeyDown;
  this.markerMouseDown = handleMarkerMouseDown;
  this.markerMouseMove = handleMarkerMouseMove;
  this.markerMouseUp = handleMarkerMouseUp;

  configObject();

  /**
   * Object config
   */
  function configObject()
  {
    configProps();
    buildHtml();
    installStretchMarkers();
    setupActions();

  } // end configObject()

  /**
   * Releases the elelment wrapped from the wrapper
   */
  function release()
  {
    let pos = $(m_divWrapContainer).offset();

    $( m_toWrapEle ).css( "position", "absolute" );
    $( m_toWrapEle ).remove();

    m_toWrapParentEle.append( m_toWrapEle );
    $( m_toWrapEle ).offset( pos );

    remove();

  } // end release()


  /**
   * Returns the position of the wrapper
   *
   * @returns {this|{top: number, left: number}|{top, left}|jQuery}
   */
  function getPosition()
  {
    return $(m_divWrapContainer).offset();

  }

  /**
   * Returns the width of the wrapper
   * @returns {*|jQuery}
   */
  function getWidth()
  {
    return $(m_divWrapContainer).width();

  }

  /**
   * Returns the height of the wrapper
   * @returns {*|jQuery}
   */
  function getHeight()
  {
    return $(m_divWrapContainer).height();

  }

  /**
   * Sets the width of the wrapper
   * @param nWidth
   * @returns {*|jQuery}
   */
  function setWidth( nWidth)
  {
    return $(m_divWrapContainer).width( nWidth );

  }

  /**
   * Sets the height of the wrapper
   * @param nHeight
   * @returns {*|jQuery}
   */
  function setHeight( nHeight )
  {
    return $(m_divWrapContainer).height( nHeight );

  }

  /**
   * Resize the wrapper
   */
  function resize()
  {
    installStretchMarkers( true );
  } // end resize()

  /**
   * Removes the wrapper from the element
   */
  function remove()
  {
    $(m_divWrapContainer).remove();
    $(m_divTopEle).remove();
    $(m_divBotEle).remove();
    $(m_divLeftEle).remove();
    $(m_divRightEle).remove();
    $(m_divTopRightCornerEle).remove();
    $(m_divBotRightCornerEle).remove();
    $(m_divTopLeftCornerEle).remove();
    $(m_divBotLeftCornerEle).remove();
    
  } // endremove()

  /**
   * Moves wrapper to specified x,y
   *
   * @param x the x pos
   * @param y yhe y pos
   */
  function moveTo( x, y )
  {
    hideMarkers();
    $(m_divWrapContainer).offset( {left:x, top:y});
    showMarkers();
  }

  function hide()
  {
    $(m_divWrapContainer).hide();
    hideMarkers();

  }

  function show()
  {
    $(m_divWrapContainer).show();
    showMarkers();

  }

  /**
   * Positions the stretch markers on the wrapper container border
   */
  function installStretchMarkers( fResize )
  {
    let posWinToWrap;
    if ( !fResize )
    {
      m_toWrapParentEle.append( m_divWrapContainer );
      posWinToWrap = $( m_toWrapEle ).offset();
    }


    $( m_toWrapEle ).remove();
    $( m_toWrapEle ).css( "position", "relative");
    $( m_toWrapEle ).css( "left", "0px");
    $( m_toWrapEle ).css( "top", "0px");

    $( m_divWrapContainer ).append( m_toWrapEle );

    if ( !fResize )
    {
      $( m_divWrapContainer ).offset( posWinToWrap );
    }

    $( m_divWrapContainer ).show();

    showMarkers();

  } // end installStretchMarkers()
  
  /**
   * Build the wrap html to be able to move and size element around the screen
   */
  function buildHtml()
  {
    m_toWrapEle = $("#" + strElementIdToWrap );

    m_strWrapContainerId = strElementIdToWrap + "_vwWrapContainer";

    m_divWrapContainer = $("<div>").attr( "id", m_strWrapContainerId ).attr( "tabindex", "0" ).addClass( m_props.cssElementWrap );

    m_toWrapParentEle = $(m_toWrapEle).parent();
    
    if ( m_props.elementRestrictId )
    {
      m_eleRectRestrictContainer = $("#" + m_props.elementRestrictId )[0].getBoundingClientRect();
    }

    m_divTopEle = $("<div>").attr( "id", "vwMarkerTop").addClass( m_props.cssMarker );
    m_divBotEle = $("<div>").attr( "id", "vwMarkerBot").addClass( m_props.cssMarker );
    m_divLeftEle = $("<div>").attr( "id", "vwMarkerLeft").addClass( m_props.cssMarker );
    m_divRightEle = $("<div>").attr( "id", "vwMarkerRight").addClass( m_props.cssMarker );
    m_divTopRightCornerEle = $("<div>").attr( "id", "vwTopMarkerRightCorner").addClass( m_props.cssMarker );
    m_divBotRightCornerEle = $("<div>").attr( "id", "vwBotMarkerRightCorner").addClass( m_props.cssMarker );
    m_divTopLeftCornerEle = $("<div>").attr( "id", "vwTopMarkerLeftCorner").addClass( m_props.cssMarker );
    m_divBotLeftCornerEle = $("<div>").attr( "id", "vwBotMarkerLeftCorner").addClass( m_props.cssMarker );

    m_toWrapParentEle.append( m_divTopEle ).append( m_divBotEle ).append( m_divLeftEle ).append( m_divRightEle ).append( m_divTopRightCornerEle ).append( m_divBotRightCornerEle );
    m_toWrapParentEle.append( m_divTopLeftCornerEle ).append( m_divBotLeftCornerEle );

  } // end buildHtml()

  /**
   * Hides the markers on the wrap elemement
   */
  function hideMarkers()
  {
    $( m_divTopEle ).hide();
    $( m_divBotEle ).hide();
    $( m_divLeftEle ).hide();
    $( m_divRightEle ).hide();
    $( m_divTopRightCornerEle ).hide();
    $( m_divBotRightCornerEle ).hide();
    $( m_divTopLeftCornerEle ).hide();
    $( m_divBotLeftCornerEle ).hide();

  } // end hideMarkers()

  /**
   * Shows the markers on the wrap elemement
   */
  function showMarkers()
  {
    $( m_divTopEle ).show();
    $( m_divBotEle ).show();
    $( m_divLeftEle ).show();
    $( m_divRightEle ).show();
    $( m_divTopRightCornerEle ).show();
    $( m_divBotRightCornerEle ).show();
    $( m_divTopLeftCornerEle ).show();
    $( m_divBotLeftCornerEle ).show();

    let strWrapContainerId = m_divWrapContainer.attr( "id" ) ;

    let containerPos = $( $( m_divWrapContainer ) ).offset();

    let nContainerHeight = $( "#" + strWrapContainerId ).height();
    let nContainerWidth = $( "#" + strWrapContainerId ).width();

    let nContainerBorderWidth = $("#" + strWrapContainerId ).css( "border-top-width");
    nContainerBorderWidth = Number( nContainerBorderWidth.substring( 0, nContainerBorderWidth.indexOf( "px")));

    let nMarkerHeight = $(".VwStretchMarker").height();
    let nMarkerBorderWidth = $(".VwStretchMarker").css( "border-top-width");

    nMarkerBorderWidth = Number( nMarkerBorderWidth.substring(0, nMarkerBorderWidth.indexOf( "px" )) );
    nMarkerHeight += nMarkerBorderWidth;

    $("#vwMarkerTop").css( "left", containerPos.left + (nContainerWidth / 2 - nMarkerHeight / 2)  + "px");
    $("#vwMarkerTop").css( "top", containerPos.top - (nMarkerHeight / 2 ) + nContainerBorderWidth / 2 +"px");

    $("#vwMarkerBot").css( "left", containerPos.left + (nContainerWidth / 2 - nMarkerHeight / 2) + "px");
    $("#vwMarkerBot").css( "top",  containerPos.top + nContainerHeight - (nMarkerHeight / 2 ) + nContainerBorderWidth / 2 + "px");

    $("#vwMarkerLeft").css( "left", containerPos.left - (nMarkerHeight / 2 ) + nContainerBorderWidth / 2 + "px");
    $("#vwMarkerLeft").css( "top", containerPos.top + (nContainerHeight / 2 - nMarkerHeight / 2 ) + "px");

    $("#vwMarkerRight").css( "left", containerPos.left + nContainerWidth - nMarkerHeight / 2 + nContainerBorderWidth /2 +  nContainerBorderWidth / 2 + "px");
    $("#vwMarkerRight").css( "top", containerPos.top + (nContainerHeight / 2 - (nMarkerHeight / 2 ) ) + "px");

    $("#vwTopMarkerRightCorner").css( "left", containerPos.left + nContainerWidth - nMarkerHeight / 2 + "px");
    $("#vwTopMarkerRightCorner").css( "top", containerPos.top - nMarkerHeight / 2 + "px");

    $("#vwTopMarkerLeftCorner").css( "left", containerPos.left - nMarkerHeight / 2 + "px");
    $("#vwTopMarkerLeftCorner").css( "top", containerPos.top - nMarkerHeight / 2 + "px");

    $("#vwBotMarkerLeftCorner").css( "left", containerPos.left - nMarkerHeight / 2 + "px");
    $("#vwBotMarkerLeftCorner").css( "top", containerPos.top + nContainerHeight - nMarkerHeight / 2 + "px");

    $("#vwBotMarkerRightCorner").css( "left", containerPos.left + nContainerWidth - nMarkerHeight / 2 + "px");
    $("#vwBotMarkerRightCorner").css( "top", containerPos.top + nContainerHeight - nMarkerHeight / 2 + "px");

  } // end showMarkers()


  /**
   * Install mouse actions for dragging yje slider's thumb
   */
  function setupActions()
  {
    if ( bReadonly )
    {
      return; // don't allow any mouse events if read only
    }

    if( m_props.allowMove )
    {
      $( m_divWrapContainer ).unbind( "mousedown", handleMouseDown ).bind( "mousedown", handleMouseDown );
    }
    
    $("#vwMarkerLeft").unbind( "mousedown", handleMarkerMouseDown ).bind( "mousedown", handleMarkerMouseDown );
    $("#vwMarkerTop").unbind( "mousedown", handleMarkerMouseDown ).bind( "mousedown", handleMarkerMouseDown );
    $("#vwMarkerBot").unbind( "mousedown", handleMarkerMouseDown ).bind( "mousedown", handleMarkerMouseDown );
    $("#vwMarkerRight").unbind( "mousedown", handleMarkerMouseDown ).bind( "mousedown", handleMarkerMouseDown );
    $("#vwTopMarkerLeftCorner").unbind( "mousedown", handleMarkerMouseDown ).bind( "mousedown", handleMarkerMouseDown );
    $("#vwTopMarkerRightCorner").unbind( "mousedown", handleMarkerMouseDown ).bind( "mousedown", handleMarkerMouseDown );
    $("#vwBotMarkerLeftCorner").unbind( "mousedown", handleMarkerMouseDown ).bind( "mousedown", handleMarkerMouseDown );
    $("#vwBotMarkerRightCorner").unbind( "mousedown", handleMarkerMouseDown ).bind( "mousedown", handleMarkerMouseDown );

    window.addEventListener( "resize", handleBrowserResize );

  } // end setupActions()


  /**
   * Update metrics
   */
  function handleBrowserResize()
  {
    m_nWidth = m_nHeight = -1;
  }

  function closeOnEscapeKey()
  {
    $("#" + m_strWrapContainerId).focus();
    $("#" + m_strWrapContainerId).keydown( handleKeyDown );

  }

  /**
   * Keydown handler to close the the element
   * @param event
   */
  function handleKeyDown( event, bRemote )
  {
    if ( event.keyCode == 27 || event.keyCode == 13 )
    {
      if ( !bRemote )
      {
        if ( props.fnForwardkeyboardCode )
        {
          props.fnForwardkeyboardCode( event.keyCode )
        }

      }

      let bEsc = false;

      if ( event.keyCode == 27 )
      {
        bEsc  = true;
      }

      if ( m_props.outsideClickHandler )
      {
        m_props.outsideClickHandler( bEsc );
      }

    } // end if

  } // end handleKeyDown()


  /**
   * Setup to start resizing the east west borders
   * @param event The mouse click event
   */
  function handleMarkerMouseDown( event, bRemote )
  {

    m_strMarkerDragId = event.target.id;

    m_nMouseStartXPos = getXPos( event );
    m_nMouseStartYPos = getYPos( event );

    //console.log( `Marker mouse down startX:${m_nMouseStartXPos}, startY:${m_nMouseStartYPos}` );

    if ( !bRemote )
    {
      event.stopImmediatePropagation();
      if ( props.fnForwardMarkerMouseDown )
      {
        props.fnForwardMarkerMouseDown( event );
      }

      $( window ).unbind( "mouseup", handleMarkerMouseUp ).bind( "mouseup", handleMarkerMouseUp ).bind( "mousemove", handleMarkerMouseMove );
    }

    hideMarkers();

    return false;

  } // end handleMarkerMouseDown()

  /**
   * Handler for marker mouse up
   *
   * @param event
   * @param bRemote
   */
  function handleMarkerMouseUp( event, bRemote )
  {
    m_fMarkerClick = true;
    m_nMouseStartXPos = -1;
    m_nMouseStartYPos = -1;

    m_strMarkerDragId = null;

    if ( !bRemote )
    {
      if ( props.fnForwardMarkerMouseUp )
      {
        props.fnForwardMarkerMouseUp( event );
      }

      $( window ).unbind( "mouseup", handleMarkerMouseUp ).unbind( "mousemove", handleMarkerMouseMove ).unbind( "mousedown", handleMarkerMouseDown );
    }

    if ( m_eleRectRestrictContainer )
    {
      checkBounds();
    }

    showMarkers();

  } // end handleMarkerMouseUp( event )

  /**
   * Marker move handler
   * @param event
   */
  function handleMarkerMouseMove( event, bRemote )
  {

    let nNewXDiff = 0;
    let nNewYDiff = 0;
    let pos;

    switch( m_strMarkerDragId )
    {
      case "vwMarkerLeft":
      case "vwMarkerRight":

            nNewXDiff = getXPos( event ) - m_nMouseStartXPos;

            if ( m_strMarkerDragId == "vwMarkerLeft")
            {
              pos = $( m_divWrapContainer ).offset();

              pos.left += nNewXDiff;
              $( m_divWrapContainer ).offset( pos );

              nNewXDiff *= -1;

            }

            break;

      case "vwMarkerTop":
      case "vwMarkerBot":

            nNewYDiff = getYPos( event ) - m_nMouseStartYPos;

            if ( m_strMarkerDragId == "vwMarkerTop")
            {
              pos = $( m_divWrapContainer ).offset();
              pos.top += nNewYDiff;

              $( m_divWrapContainer ).offset( pos );

              nNewYDiff *= -1;
            }

            break;

      case "vwTopMarkerRightCorner":
      case "vwBotMarkerRightCorner":

           //console.log( `x startPos: ${m_nMouseStartXPos}, y startPos: ${m_nMouseStartYPos}`);

           nNewXDiff = getXPos( event ) - m_nMouseStartXPos;
           nNewYDiff = getYPos( event ) - m_nMouseStartYPos;

           if ( m_strMarkerDragId == "vwTopMarkerRightCorner")
           {
             pos = $( m_divWrapContainer ).offset();

             pos.top += nNewYDiff;
             $( m_divWrapContainer ).offset( pos );

             nNewYDiff *= -1;

           }

           break;

      case "vwTopMarkerLeftCorner":

           nNewXDiff = getXPos( event ) - m_nMouseStartXPos;
           nNewYDiff = getYPos( event ) - m_nMouseStartYPos;

           pos = $( m_divWrapContainer ).offset();
           pos.left += nNewXDiff;
           pos.top += nNewYDiff;

           $( m_divWrapContainer ).offset( pos );

           nNewXDiff *= -1;
           nNewYDiff *= -1;

           break;

      case "vwBotMarkerLeftCorner":

           nNewXDiff = getXPos( event ) - m_nMouseStartXPos;
           nNewYDiff = getYPos( event ) - m_nMouseStartYPos;

           if ( nNewXDiff != 0 )
           {
             pos = $( m_divWrapContainer ).offset();
             pos.left += nNewXDiff;
             
             $( m_divWrapContainer ).offset( pos );

             nNewXDiff *= -1;
           }

           break;

    } // end switch()

    if ( nNewXDiff != 0 )
    {

      $( m_divWrapContainer ).width( $( m_divWrapContainer ).width() + nNewXDiff );
      if ( !m_props.resizeHandler )
      {
        $( m_toWrapEle ).width( $( m_toWrapEle ).width() + nNewXDiff );
      }

      m_nMouseStartXPos = getXPos( event );
    }

    if ( nNewYDiff != 0 )
    {
      $( m_divWrapContainer ).height( $( m_divWrapContainer ).height() + nNewYDiff );
      if ( !m_props.resizeHandler )
      {
        $( m_toWrapEle ).height( $( m_toWrapEle ).height() + nNewYDiff );
      }

      m_nMouseStartYPos = getYPos( event );
    }

    if ( m_props.onElementResize )
    {
      m_props.onElementResize( $( m_divWrapContainer ).width() - 1, $( m_divWrapContainer ).height() - 1 );
    }

    if ( m_props.resizeHandler )
    {
      m_props.resizeHandler( $( m_divWrapContainer ).width() - 1, $( m_divWrapContainer ).height() - 1 );
    }

    if ( m_props.resizedHandler )
    {
      m_props.resizedHandler( $(m_toWrapEle).width(), $(m_toWrapEle).height());
    }

    if ( !bRemote )
    {
      if ( props.fnForwardMarkerMouseMove )
      {
        props.fnForwardMarkerMouseMove( event );
      }
    }

  } // end handleMarkerMove()


  /**
   * Setup to start dragging the wrapper
   * @param event The mouse click event
   */
  function handleMouseDown( event, bRemote )
  {
    if ( !bRemote )
    {

      event.stopImmediatePropagation();

      if ( props.fnForwardMouseDown )
      {
        props.fnForwardMouseDown( event );
      }
    }

    m_nMouseStartXPos = getXPos( event );
    m_nMouseStartYPos = getYPos( event );

    if ( !bRemote )
    {
      $( m_divWrapContainer ).unbind( "mouseup", handleMouseUp ).bind( "mouseup", handleMouseUp ).bind( "mousemove", handleMouseMove );
    }

    hideMarkers();

    $("#" + m_strWrapContainerId ).focus();

    $("#" + strElementIdToWrap ).focus();

    return false;

  } // end handleMouseDown()

  /**
   * Mouse move for element wrapper
   * @param event
   */
  function handleMouseMove( event, bRemote )
  {
    if ( m_strMarkerDragId )
    {
      return; // ignore these events if dragging a marker
    }

    if ( m_nMouseStartXPos < 0 )
    {
      return;
    }

    if ( !m_nMouseStartXPos )
    {
      return;
    }

    if ( !bRemote )
    {
      if ( props.fnForwardMouseMove )
      {
        props.fnForwardMouseMove( event );
      }
    }

    let nNewXDiff = getXPos( event ) - m_nMouseStartXPos ;
    let nNewYDiff = getYPos( event ) - m_nMouseStartYPos;

    m_nMouseStartXPos = getXPos( event );
    m_nMouseStartYPos = getYPos( event );

    let pos = $( m_divWrapContainer ).offset();
    pos.left += nNewXDiff;
    pos.top +=  nNewYDiff;

    $( m_divWrapContainer ).offset( pos );
    

  } // end handleMouseMove()

  /**
   *  Wrapper element mouse up
   */
  function handleMouseUp( event,  bRemote )
  {
    if ( bReadonly )
    {
      return;
    }

    if ( !bRemote )
    {
      if ( props.fnForwardMouseUp )
      {
        props.fnForwardMouseUp();
      }

    }

    if ( m_eleRectRestrictContainer )
    {
      checkBounds();
    }

    showMarkers();
    
    m_nMouseStartXPos = -1;
    m_nMouseStartYPos = -1;

    if ( !bRemote )
    {
      $( m_divWrapContainer ).unbind( "mouseup", handleMouseUp ).unbind( "mousemove", handleMouseMove );
    }

    if ( m_props.releaseOnMove )
    {
      release();
    }

  } // end handleMouseUp()



  /**
   * Checks the location of this window and moves it within the edges if the bounding element
   */
  function checkBounds()
  {
    const posThisWindow = $(m_divWrapContainer).offset();

    let nWrapWidth = $(m_divWrapContainer).width();
    let  nWrapHeight = $(m_divWrapContainer).height();

    if ( nWrapHeight >= m_eleRectRestrictContainer.height )
    {
      nWrapHeight = m_eleRectRestrictContainer.height - 4;
      $(m_divWrapContainer).height( nWrapHeight );

    }

    if ( nWrapWidth >= m_eleRectRestrictContainer.width )
    {
      nWrapWidth = m_eleRectRestrictContainer.width - 4;
      $(m_divWrapContainer).width( nWrapWidth );
    }

    const nPosWinBot = posThisWindow.top + nWrapHeight;
    const nPosWinRight =  posThisWindow.left + nWrapWidth;

    if ( posThisWindow.left < m_eleRectRestrictContainer.x )
    {
      posThisWindow.left = m_eleRectRestrictContainer.x + 2;
    }

    if ( posThisWindow.top < m_eleRectRestrictContainer.y )
    {
      posThisWindow.top = m_eleRectRestrictContainer.y + 2;
    }


    if ( nPosWinBot > m_eleRectRestrictContainer.y + m_eleRectRestrictContainer.height )
    {
      posThisWindow.top = (m_eleRectRestrictContainer.y + m_eleRectRestrictContainer.height) - (nWrapHeight + 2 );
    }

    if ( nPosWinRight > m_eleRectRestrictContainer.x + m_eleRectRestrictContainer.width )
    {
      posThisWindow.left = (m_eleRectRestrictContainer.x + m_eleRectRestrictContainer.width) - (nWrapWidth + 2 );
    }

    $(m_divWrapContainer).offset( posThisWindow );

  } // end checkBounds()


  /**
   * Gets mouse mouse from pageY
   * @param event
   * @returns {*|boolean|number}
   */
  function getYPos( event )
  {
    return event.pageY;

  } // end getYPos()

  /**
   * Gets mouse mouse from pageX
   *
   * @param event
   * @returns {*|boolean|number}
   */
  function getXPos( event )
  {
    return event.pageX;

  } // end getXPos(


  /**
   * Setup the default properties
   */
  function configProps()
  {
    m_props = {};
    m_props.cssElementWrap = "VwElementWrapContainer" ;
    m_props.cssMarker = "VwStretchMarker";
    m_props.allowMove = true;

    $.extend( m_props, props );
    
  } // end configProps()

} // end VwElasticElement{}

export default VwElasticElement;