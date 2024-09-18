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

import VwStack from "/vozzworks/util/VwStack/VwStack.js";
import VwUiUtils from "/vozzworks/ui/VwCommon/VwUiUtils.js";

VwCssImport( "/vozzworks/ui/VwPopupBox/style");

/**
 * This is the super class for all Vw Popup boxes (alert and dialog)
 *
 * @param popupProps
 * @param fCloseOpen
 *
 *
 * @constructor
 */
function VwPopupBox( popupProps, fCloseOpen )
{
  if ( arguments.length == 0 )
  {
    return; // prototype call
  }
  
  let m_curObjIds = configPopupIds( popupProps.modal );
  let m_objProperties = popupProps;

  let m_nStartX;
  let m_nStartY;
  let m_nStartDivX;
  let m_nStartDivY;
  let m_strOverlayId;
  let m_strDetachedHtml;

  // Public methods
  this.closeAll = closeAll;
  this.closePopup = close;

  this.getOverlayId = getOverlayId;
  this.getParentId = getParentId;

  this.getObjIds = getObjIds;
  this.getPopupZIndex = getPopupZIndex;
  this.setZIndex = setZindex;

  this.getStackCount = getStackCount;

  this.hide = hide;
  this.restore = restore;
  this.detach = detach;

  this.move = move;

  this.position = position;

  this.resize = resize;

  this.setupDraggable = setupDraggable;
  this.show = show;

  this.width = width;
  this.setWidth = setWidth;

  this.height = height;
  this.setHeight = setHeight;

  // Close all popups
  if ( fCloseOpen )
  {
    closeAll();
  }

  // Setup popup overlay if specified
  if ( popupProps.modal )
  {
    setupPopupOverlay( true );
    VwPopupBox.m_popupStack.push( m_curObjIds );
  }


  /**
   * Create / remove the full screen transparent div overlay
   * @param fCreate If true create new overlay else remove the one at the top of the overlay stack
   */
  function setupPopupOverlay( fCreate )
  {

    let nPopupStackSize = VwPopupBox.m_popupStack.size();

    if ( fCreate )
    {
      m_strOverlayId = "vwMsgBoxOverlay_" + nPopupStackSize;

      // Compute z-index each popup takes two zindexs, one for the overlay and one for the popup
      let nZindex = 99980 + nPopupStackSize * 2;

      let overlayEle = $("<div>").attr( "id", m_strOverlayId ).attr( "style", "z-index:" + nZindex + ";").addClass( "VwOverlay" ).addClass( m_objProperties.cssOverlay );
      $( "body" ).append( overlayEle );

    }
    else
    {

      $( "#" + m_strOverlayId ).remove();
      if ( nPopupStackSize == 0  )
      {
        return;
      }

      VwPopupBox.m_popupStack.pop();

    }

  }


  /**
   * Configure the ids based on where they sit in the overlay stack
   * @returns {Object}
   */
  function configPopupIds( fModal )
  {
    let objIds = {};

    let nId;

    if ( fModal )
    {
      nId = VwPopupBox.m_popupStack.size();
    }
    else
    {
      let date = new Date();
      nId = date.getTime();
    }

    objIds.popupId = "vwPopup_" + nId;
    objIds.popupHdrId = "vwPopupBoxHdr_" + nId;
    objIds.popupTitleId = "vwMsgBoxTitle_" + nId;
    objIds.popupContentId = "vwPopupBoxContent_" + nId;
    objIds.popupImgId = "vwImgDiv_" + nId;
    objIds.popupMsgBoxImgId = "vwMsgBoxImg_" + nId;
    objIds.popupMsgBoxContentId = "vwMsgBoxContent_" + nId;
    objIds.popupMsgBoxTxtDivId = "vwMsgBoxTextDiv_" + nId;
    objIds.popupMsgBoxTxtId = "vwMsgBoxText_" + nId;
    objIds.popupMsgBoxActionsId = "vwPopupBoxActions_" + nId;
    objIds.closeBtnId = "vwClose_" + nId;

    return objIds;

  }

  /**
   * Handle resize event
   */
  function resize()
  {

    // Dialog was closed before resize ran if stack length is 0
    if ( VwPopupBox.m_popupStack.size() == 0 )
    {
      return;
    }

    let nLeft, nTop;
    const popUpEl = $( `#${m_curObjIds.popupId}` );

    if ( m_objProperties.posInParentId )
    {

      const parent = $( `#${m_objProperties.posInParentId}` )[0];
      nLeft = $( parent ).width() / 2 - $(popUpEl).width() / 2;
      nTop = $( parent ).height() / 2 - $(popUpEl).height() / 2;

      const offsetParent = $( parent ).offset();
      const offsetPopup =  $(popUpEl).offset();

      nTop += offsetParent.top;
      nLeft += offsetParent.left;
    }
    else
    {
      nLeft = window.innerWidth / 2 - popUpEl.width() / 2;
      nTop = window.innerHeight / 2 - popUpEl.height() / 2;
    }

    popUpEl.css( {"left": nLeft, "top": nTop} );

  }

  /**
   * Setup draggable action
   */
  function setupDraggable( strHdrOverride )
  {
    if ( strHdrOverride )
    {
      m_curObjIds.popupHdrId = strHdrOverride ;
    }

    $( "#" + m_curObjIds.popupHdrId ).mousedown( handleMouseDown );

  }

  /**
   * Handle mouse down event
   *
   * @param event
   */
  function handleMouseDown( event )
  {

    VwUiUtils.vwClearTextSelection();

    // Install Drag drop handlers
    var body = document.getElementsByTagName( "body" );

    // Install drag drop event handlers
    body[0].addEventListener( "drop", handleDrop );

    body[0].addEventListener( "dragover", allowDrop );
    body[0].addEventListener( "dragenter", allowDrop );
    body[0].addEventListener( "dragleave", allowDrop );

    var strDraggableId = m_curObjIds.popupId;

    if ( m_objProperties.resizable )
    {
      strDraggableId += "_envelope";
    }

    $( "#" + strDraggableId ).attr( "draggable", "true" );

    var msgBox = document.getElementById( strDraggableId );

    msgBox.addEventListener( "dragstart", dragStart );

  }


  /**
   * Handle drop event
   *
   * @param event
   */
  function allowDrop( event )
  {
    event.preventDefault();
  }


  /**
   * Handle drag start event
   *
   * @param event
   */
  function dragStart( event )
  {

    var strDraggableId = m_curObjIds.popupId;

    event.dataTransfer.setData( "Text", strDraggableId );
    event.dataTransfer.effectAllowed = "move";
    m_nStartX = event.screenX;
    m_nStartY = event.screenY;

    m_nStartDivX = $( "#" + strDraggableId ).offset().left;
    m_nStartDivY = $( "#" + strDraggableId ).offset().top;

    if ( m_objProperties.fnDragStart )
    {
      m_objProperties.fnDragStart();
    }

  }

  /**
   * Handle drop event
   * @param ev
   */
  function handleDrop( ev )
  {

    ev.preventDefault();

    const strDraggableId = m_curObjIds.popupId;

    const body = document.getElementsByTagName( "body" );

    // Remove drag drop event handlers
    body[0].removeEventListener( "drop", handleDrop );
    body[0].removeEventListener( "dragover", allowDrop );

    const msgBox = $( "#" + m_curObjIds.popupId );

    $( "#" + strDraggableId ).attr( "draggable", null );

    msgBox[0].removeEventListener( "dragstart", dragStart );

    const data = ev.dataTransfer.getData( "Text" );

    let x, y;

    const nOffX = ev.screenX - m_nStartX;
    const nOffY = ev.screenY - m_nStartY;

    x = m_nStartDivX + nOffX;

    y = m_nStartDivY + nOffY;

    const popupOffset = {top: y, left: x};

    $( "#" + data ).offset( popupOffset );

    if ( popupProps.fnOnMove )
    {
      popupProps.fnOnMove.call( self, popupOffset );
    }
  }

  /**
   * Gets current position of dialog
   *
   * @returns {{top, left}|jQuery}
   */
  function position()
  {
    return $( "#" + m_curObjIds.popupId ).offset();
  }

  /**
   * Move the dialog to absolute x,y
   */
  function move( nXpos, nYpos )
  {

    var objPos = $( "#" + m_curObjIds.popupId ).offset();

    if ( nXpos < 0 )
    {
      nXpos = objPos.left;
    }

    if ( nYpos < 0 )
    {
      nYpos = objPos.top;
    }

    const popupOffset = {top: nYpos, left: nXpos};

    $( "#" + m_curObjIds.popupId ).offset( popupOffset );


    if ( popupProps.fnOnMove )
    {
      popupProps.fnOnMove.call( self, popupOffset );
    }

  }

  /**
   * Returns the popup width
   * @returns {*|jQuery}
   */
  function width()
  {
    return $( "#" + m_curObjIds.popupId ).width();
  }

  /**
   * Returns the popup height
   * @returns {*|jQuery}
   */
  function height()
  {
    return $( "#" + m_curObjIds.popupId ).height();
  }


  function setWidth( strWidth )
  {
    $( "#" + m_curObjIds.popupId ).css( "width", strWidth );
  }


  function setHeight( strHeight )
  {
    $( "#" + m_curObjIds.popupId ).css( "height", strHeight );

  }

  
  /**
   * Return overlay DOM element ID
   * @returns {*}
   */
  function getOverlayId()
  {
    return m_strOverlayId;
  }


  function getParentId()
  {
    return m_curObjIds.popupId;
  }


  /**
   * Return object IDs
   * @returns {Object|*}
   */
  function getObjIds()
  {
    return m_curObjIds;
  }

  /**
   * Return total stack count
   * @returns {*|Number}
   */
  function getStackCount()
  {
    return VwPopupBox.m_popupStack.size();
  }

  /**
   * Return popup z-index value
   * @returns {number}
   */
  function getPopupZIndex()
  {
    return 99980 + (VwPopupBox.m_popupStack.size() * 2 ) - 1;
  }


  function setZindex( strZIndex )
  {
    $( "#" + m_curObjIds.popupId ).css( "z-index", strZIndex )
  }

  /**
   * Hide popup
   */
  function hide()
  {
    $( "#" + m_strOverlayId ).hide();
    $( "#" + m_curObjIds.popupId ).hide();
  }

  /**
   * Show popup
   */
  function show()
  {
    $( "#" + m_strOverlayId ).show();
    $( "#" + m_curObjIds.popupId ).show();
  }

  /**
   * Detachs the dialog html (removes it from the dom) but preserves the associated data actions
   */
  function detach()
  {
    $( "#" + m_strOverlayId ).hide();
    m_strDetachedHtml = $( "#" + m_curObjIds.popupId ).detach();

  }

  /**
   * Restores the detachednhtml from a previous detach call
   */
  function restore()
  {
    $( "#" + m_strOverlayId ).show();
    $("body").append( m_strDetachedHtml );

  }

  /**
   * Close model popup
   */
  function close()
  {
    if ( m_objProperties.modal )
    {
      setupPopupOverlay( false );
    }

  }

  /**
   * Close all popups
   */
  function closeAll()
  {
    for ( var x = 0, nLen = VwPopupBox.m_popupStack.size(); x < nLen; x++ )
    {
      setupPopupOverlay( false );
    }
  }


} // end VwPopupBox{}

// Initialize static stack
VwPopupBox.m_popupStack = new VwStack();

export default VwPopupBox;