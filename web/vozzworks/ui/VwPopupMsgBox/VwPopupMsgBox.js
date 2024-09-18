/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2017 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 *  ============================================================================================
 *
 */

import VwPopupBox from "../VwPopupBox/VwPopupBox.js";
import VwUiUtils from "../VwCommon/VwUiUtils.js";
import VwHashMap from "../../util/VwHashMap/VwHashMap.js";
import VwExString from "../../util/VwExString/VwExString.js";


VwCssImport( "/vozzworks/ui/VwPopupBox/style");

/**
 *
 * @param strType
 * @param strTitle
 * @param strContent
 * @param popupProps
 * <br>  resourceMgr:Object A VwPropertyMgr instance ifr i18n
 * <br>  cssPopup: String - CSS class name for the popup parent
 * <br>  cssImg: String - CSS class name for the image
 * <br>  cssActionBtn: String - CSS class name for the buttons
 * <br>  cssContent: String - CSS class name for the content area
 * <br>  cssActionBar: String - CSS class name for the action section
 * <br>  cssContentText: String - CSS class name for the content text
 * <br>  htmlHdr: String -  HTML markup for the header
 * <br>  maxWidth: String -  Maximum width of the parent
 * <br>  hasOwnActionBar: Boolean - If true, supply your own action elements
 * <br>  htmlContent: String - String with custom HTML
 * <br>  positionByParent: String - ID name of the parent element that will be used to position and size the popup. The popup will match this parent element.
 * <br>  placeInParent: Boolean - if true, positionByParent is required. The popup will be inserted in the parent element specified in positionByParent property.
 * <br>  closeCallback: Function - Function callback when the overlay is closed
 * <br>  noHeader: Boolean - If true, don't add header HTML
 * <br>  noActionBar: Boolean - If true, don't add button action bar HTML
 * <br>  fnComplete:Optional:Function - callback complete handler
 * @constructor
 */
export function VwPopupMsgBox( strType, strTitle, strContent, popupProps )
{

  if ( arguments.length == 0 )
  {
    return; // Prototype init call
  }

  const self = this;
  const m_super = this;
  let m_strYesButton = "&nbsp;Yes&nbsp;";      // text for the Yes button
  let m_strNoButton = "&nbsp;No&nbsp;";        // text for the No button
  let m_objProperties;

  // Public Methods
  this.startAnimation = startAnimation;
  this.removeAnimationShell = removeAnimationShell;

  configProps();

  if ( strType == "animate")
  {

    setupAnimationBox();
    return;

  }
  else
  if ( strType == "toast")
  {
    showToast()
    return;
  }


  this.close = close;

  // Close any currently open popups
  closeOpenAlertBoxes();

  VwPopupBox.call( this, m_objProperties );

  let m_objIds = m_super.getObjIds();

  VwPopupMsgBox.s_mapInstances.put( self, self );

  if ( self.getStackCount() == 8 )
  {
    throw "Popup boxes cannot be nested deeper than 8 levels";
  }

  createPopupShell( popupProps.placeInParent  );

  applyPopupProperties();

  if ( popupProps.draggable )
  {
    m_super.setupDraggable()
  }


  /**
   *  If positionByParent is specified, we position and size the popup to match the given parent element
   */
  function positionPopupByParent()
  {
    let parentEl = $( "#" + m_objProperties.positionByParent );
    let parentElOffset = parentEl.offset();

    // Make sure DOM element is present
    if ( parentEl && parentElOffset )
    {
      let objCssProps = {};
      objCssProps.width = parentEl.outerWidth();
      objCssProps.height = parentEl.outerHeight();
      objCssProps.top = parentElOffset.top;
      objCssProps.left = parentElOffset.left;
      objCssProps.position = "absolute";

      $( "#" + m_objIds.popupId ).css( objCssProps );
    }

  }


  /**
   * Install the popup html shell
   */
  function createPopupShell( fPlaceInParent )
  {
    let nZindex = m_super.getPopupZIndex();

    // determine if popup is being appended to the body or specific parent element
    let strParentIdEl;

    if ( fPlaceInParent && m_objProperties.positionByParent )
    {
      strParentIdEl = $( "#" + m_objProperties.positionByParent );
    }
    else
    {
      strParentIdEl = $( "body" );
    }

    // // Popup shell
    strParentIdEl.append( $("<div>").attr("id", m_objIds.popupId ).attr( "style", "z-index:" + nZindex + ";position:absolute") );

    if ( strType == "customContent")
    {
      return;

    }

    
    if ( !m_objProperties.noHeader )  // if set we don't want a header
    {
      if ( m_objProperties.htmlHdr )  // Custom header
      {
        let strHeader = VwExString.replaceAll( m_objProperties.htmlHdr, "${hdrId}", m_objIds.popupHdrId );
        strHeader = VwExString.replaceAll( strHeader, "${titleId}", m_objIds.popupTitleId );

        $( "#" + m_objIds.popupId ).append( strHeader );
      }
      else
      {
        // Default header bar
        let htmlHdrEle = $("<div>").attr( "id", m_objIds.popupHdrId ).attr( "style", "cursor:move" );

        htmlHdrEle.append( $("<span>").attr( "id",  m_objIds.popupTitleId ).addClass( m_objProperties.cssHdrText ) );
        $( "#" + m_objIds.popupId ).append( htmlHdrEle );
      }

    }

    if ( m_objProperties.htmlContent )  // Custom content html
    {
      let strContentHtml = VwExString.replaceAll( m_objProperties.htmlContent, "${contentId}", m_objIds.popupContentId );

      if ( strContentHtml.indexOf( "${textId}") >= 0  )
      {
        strContentHtml = VwExString.replaceAll( strContentHtml, "${textId}",  m_objIds.popupMsgBoxTxtId );
      }

      $("#" + m_objIds.popupId  ).append( strContentHtml );

      if ( m_objProperties.hasOwnActionBar )
      {
        return;
      }
    }
    else
    if ( strType != "input" )
    {

      // Default popup content
      $( "#" + m_objIds.popupId ).append( $("<div>" ).attr( "id", m_objIds.popupContentId ) );
      $( "#" + m_objIds.popupContentId ).append( $("<div>").attr( "id",  m_objIds.popupImgId ).append( $("<img>" ).attr( "id",  m_objIds.popupMsgBoxImgId ).addClass( m_objProperties.cssImg ) ) );
      $( "#" + m_objIds.popupContentId ).append( $("<div>").attr( "id", m_objIds.popupMsgBoxTxtDivId ).append( $("<span>" ).attr( "id",  m_objIds.popupMsgBoxTxtId ).addClass( m_objProperties.cssContentText ) ) );
    }

    if ( strType != "input" )
    {
      if ( !m_objProperties.noActionBar )
      {
        if ( m_objProperties.htmlActionbar )  // Custom Action bar html
        {
          let strActionBarHtml = VwExString.replaceAll( m_objProperties.htmlHdr, "${actionsId}", m_objIds.popupMsgBoxActionsId );


          $( "#" + m_objIds.popupId ).append( strActionBarHtml );  // Custom action Bar content
        }
        else
        {
          // default action bar
          $( "#" + m_objIds.popupId ).append( $( "<div>" ).attr( "id", m_objIds.popupMsgBoxActionsId ).addClass( m_objProperties.cssActionBar ) );
        }
      }
    }
  }

  function applyPopupProperties()
  {
    // Allow user properties to override default styles

    $( "#" + m_objIds.popupId ).addClass( m_objProperties.cssPopup ).css( "overflow", "hidden" );
    $( "#" + m_objIds.popupHdrId ).addClass( m_objProperties.cssHdr );
    $( "#" + m_objIds.popupTitleId ).addClass( m_objProperties.cssHdrText );

    $( "#" + m_objIds.popupContentId ).addClass( m_objProperties.cssContent );
    $( "#" + m_objIds.popupMsgBoxTxtDivId ).addClass( m_objProperties.cssContentTextDiv );
    $( "#" + m_objIds.popupMsgBoxTxtId ).addClass( m_objProperties.cssContentText );
    $( "#" + m_objIds.popupMsgBoxActionsId ).addClass( m_objProperties.cssActionBar );
    $( "#" + m_objIds.popupImgId ).addClass( m_objProperties.cssImg );

    if ( m_objProperties.positionByParent )
    {
      positionPopupByParent();

      window.addEventListener( "resize", positionPopupByParent );
    }

    if ( m_objProperties.width )
    {
      $( "#" + m_objIds.popupId ).css( "width", m_objProperties.width );
    }

    if ( m_objProperties.maxWidth )
    {
      $( "#" + m_objIds.popupId ).css( "max-width", m_objProperties.maxWidth );
    }

    if ( m_objProperties.height )
    {
      $( "#" + m_objIds.popupId ).css( "height", m_objProperties.height );
    }

    if ( m_objProperties.maxHeight )
    {
      $( "#" + m_objIds.popupId ).css( "max-height", m_objProperties.maxHeight );
    }

    if ( strTitle != null )
    {
      $( "#" + m_objIds.popupTitleId ).html( strTitle );
    }


    // check for i18n

    if ( strContent && strType != "input" )
    {
      if ( m_objProperties.resourceMgr )
      {
        strContent = VwExString.replacePropertyKeys( "i18n_", strContent, popupProps.resourceMgr )
      }

      if ( strType == "customContent" )
      {
        $( "#" + m_objIds.popupId ).html( strContent );
      }
      else
      {
        $( "#" + m_objIds.popupMsgBoxTxtId ).html( strContent );
      }

    }

    switch ( strType )
    {
      case "alert":

            $( "#" + m_objIds.popupHdrId ).addClass( "alert" );
            $( "#" + m_objIds.popupMsgBoxImgId ).attr( "src", m_objProperties.alertImg );

            setupOk();
            break;


      case "error":

            $( "#" + m_objIds.popupHdrId ).addClass( "error" );
            $( "#" + m_objIds.popupMsgBoxImgId ).attr( "src", m_objProperties.errorImg );

            setupOk();
            break;

      case "customError":
      case "customAlert":
      case "customInfo":

            setupOk();
            break;

      case "confirm":

            $( "#" + m_objIds.popupHdrId ).addClass( "confirm" );
            $( "#" + m_objIds.popupMsgBoxImgId ).attr( "src", m_objProperties.confirmImg );

            setupYesNo();
            break;

      case "customConfirm":
      case "customWarning":

            setupYesNo();
            break;

      case "input":

            setupInputControl();
            break;

      case "progress":

            $( "#" + m_objIds.popupHdrId ).addClass( "progress" );
            $( "#" + m_objIds.popupMsgBoxImgId ).attr( "src", m_objProperties.progressImg );

            break;

      case "info":

            $( "#" + m_objIds.popupHdrId ).addClass( "info" );
            $( "#" + m_objIds.popupMsgBoxImgId ).attr( "src", m_objProperties.infoImg );

            setupOk();
            break;

      case "custom":

            $( "#" + m_objIds.popupHdrId ).addClass( m_objProperties.cssCustom );
            $( "#" + m_objIds.popupMsgBoxImgId ).attr( "src", m_objProperties.customImg );

            break;

      case "customContent":
            break;


    } //end switch()

    if ( m_objProperties.fnComplete )
    {
      m_objProperties.fnComplete( self );

    }
  }

  /**
   * Close the popup and call user callback if specified
   * @param result
   */
  function close( result )
  {

    VwPopupMsgBox.s_mapInstances.remove( self );

    m_super.closePopup();


    if ( m_objProperties.resizable )
    {
      const elasticParent = $( "#" + m_objIds.popupId ).parent();
      elasticParent.remove();

      return;


    }


    $( "#" + m_objIds.popupId ).remove();

    if ( m_objProperties.closeCallback )
    {
      m_objProperties.closeCallback( result );

    }


  }

  /**
   * Add ok button in action bar
   */
  function setupOk ()
  {
    $( "#" + m_objIds.popupMsgBoxActionsId ).append( $("<input/>").attr( "id", m_objIds.closeBtnId ).attr( "type", "button" ).addClass( m_objProperties.cssActionBtn ).attr( "value", "OK" ).attr( "z-index", 99999) );


    $( "#" + m_objIds.closeBtnId ).click( function ()
                                        {
                                          close();

                                        });
  }

  /**
   * Add a Yes and No button in the action bar
   */
  function setupYesNo()
  {

    let strYesId = "vwYes_" + m_objIds.popupId;
    let strNoId = "vwNo_" + m_objIds.popupId;

    if ( m_objProperties.yesId )
    {
      strYesId = "vwYCustYes_" + m_objProperties.yesId;
      m_strYesButton = m_objProperties.yesButtonText;
    }

    if ( m_objProperties.noId )
    {
       strNoId = "vwCustNo_" + m_objProperties.noId;
       m_strNoButton = m_objProperties.noButtonText;
    }

    $( "#" + m_objIds.popupMsgBoxActionsId ).append( $("<div>").attr( "id", strNoId ).attr( "type", "button" ).addClass( m_objProperties.cssActionBtn ).append( $("<span>").html( m_strNoButton ) ) );
    $( "#" + m_objIds.popupMsgBoxActionsId ).append( $("<div>").attr( "id", strYesId ).attr( "type", "button" ).attr( "style", "border-left:0" ).addClass( m_objProperties.cssActionBtn ).append( $("<span>" ).html( m_strYesButton ) ) );

    $( "#" + strYesId ).click( function ()
                               {
                                 close( true );

                               } );

    $( "#" + strNoId ).click( function ()
                              {
                                close( false );

                              } );

  }

  /**
   * Setup input controlfor a textarea or single line input
   */
  function setupInputControl()
  {

    let htmlInputTextEle;

    let listBox;

    if ( m_objProperties.inputType == "textarea")
    {
      htmlInputTextEle = $("<textarea>").attr( "id", "vwInput").addClass( m_objProperties.cssInput );
    }
    else
    if ( m_objProperties.inputType == "input")
    {
      htmlInputTextEle = $("<input>").attr( "id", "vwInput").attr( "type", "input" ).addClass( m_objProperties.cssInput );

    }

    if (htmlInputTextEle )
    {
      $(htmlInputTextEle).css( "width", "100%");
    }

    $( "#" + m_objIds.popupId ).append( $("<div>" ).attr( "id", m_objIds.popupContentId ).addClass( m_objProperties.cssContent) );

    if ( strContent )
    {
      $( "#" + m_objIds.popupContentId ).append( strContent );

    }

    if ( m_objProperties.inputType == "listbox")
    {
      const htmlInputListEle = $("<div>").attr( "id", "vwListBox");
      $( "#" + m_objIds.popupContentId ).append( htmlInputListEle );

      if ( m_objProperties.width )
      {
        $(htmlInputListEle).width( m_objProperties.width )
      }

      listBox = new VwListBox( "vwListBox", m_objProperties.listBoxItems, m_objProperties.listBoxProps);
      htmlInputListEle.append( listBox );
    }
    else
    {
      $( "#" + m_objIds.popupContentId ).append( htmlInputTextEle );
    }



    $( "#" + m_objIds.popupId ).append( $( "<div>" ).attr( "id", m_objIds.popupMsgBoxActionsId ).addClass( m_objProperties.cssActionBar ) );

    const objCancel = {};
    objCancel.id = "cancel";
    objCancel.text = m_objProperties.cancelText;

    const objAccept = {};
    objAccept.id = "accept";
    objAccept.text = m_objProperties.acceptText;

    const btnGroup = new VwButtonGroup( m_objIds.popupMsgBoxActionsId, [objCancel, objAccept], {collapseBorders:true}, {cssButton:m_objProperties.cssButton} );

    const acceptBtn = btnGroup.getButton( "accept");

    if ( !m_objProperties.inputType == "listbox")
    {
      acceptBtn.disable();
    }
    
    btnGroup.onClick( function( btn )
    {
       const btnId = btn.getId();

       if ( btnId == "cancel" )
       {
         close( null );
       }
       else
       {
         if ( m_objProperties.inputType == "listbox")
         {
           close( listBox.getSelectedItem() );
         }
         else
         {
           close( $(htmlInputTextEle).val() );
         }
       }


    });


    if ( m_objProperties.initialInputText )
    {
      $(htmlInputTextEle).val( m_objProperties.initialInputText );
      acceptBtn.enable();
    }

    if( htmlInputTextEle )
    {
      htmlInputTextEle.focus();

      $( htmlInputTextEle ).keyup( function ( ke )
      {
        let strText = $( htmlInputTextEle ).val();

        if ( strText )
        {
          strText = VwExString.stripWhiteSpace( strText );
        }

        if ( strText == "" )
        {
          acceptBtn.disable();
        }
        else
        {
          acceptBtn.enable();

        }
      });
    } // end if

  }

  /**
   * Close any existing popup alert boxes
   */
  function closeOpenAlertBoxes()
  {
    const aMsgBoxKeys = VwPopupMsgBox.s_mapInstances.keys();

    if ( !aMsgBoxKeys )
    {
      return;
    }

    for ( let ndx = 0, nLen = aMsgBoxKeys.length; ndx < nLen; ndx++ )
    {
      const  msgPopup = VwPopupMsgBox.s_mapInstances.get( aMsgBoxKeys[ ndx ] );
      msgPopup.close();
    }
  }

  /**
   * Shows a toast message. Toast messges are non modal that display for a specified time
   * and use keygframes opacity to fade out
   */
  function showToast()
  {
    // The toast html block
    const strToastHtml =
            `<div class="VwToast ${popupProps.cssToast}" style="opacity:0">
              <div>${strContent}</div>
             </div>`;

    let parentEle;

    if ( popupProps.parentId )
    {
      parentEle = $(`#${popupProps.parentId}`)[0];
    }
    else
    {
      parentEle = $("body")[0];

    }

    // Sanity check to remove from dom but should always be removed by the animationend event
    $(parentEle).remove( ".VwToast");

    $(parentEle).append( strToastHtml );

    if ( popupProps.fnToastInDom )
    {
      $(parentEle).show();
      popupProps.fnToastInDom();
    }

    $(parentEle).css( "position", "relative");

     // We always center within its parent
    let nLeftPos =  ($(parentEle).width() / 2 ) - ($(`.${popupProps.cssToast}`).width() / 2 );
    $(".VwToast").css( "left", `${nLeftPos}px`);

    /*todo
    let nTopPos =  ($(parentEle).height() / 2 ) - ($(`.${popupProps.cssToast}`).height() / 2 );

    $(".VwToast").css( "top", `${nTopPos}px`);

     */


    // Remove the toast div when animation completes
    addEventListener('animationend', (event) =>
    {
      $(".VwToast").remove( );
      $(parentEle).removeClass( "VwRelative");

    });

    // start the animation
    if ( popupProps.cssAnimation )
    {
      $(".VwToast").addClass( popupProps.cssAnimation );
    }
    else
    {
      if ( popupProps.style == "longToast" )
      {
        $(".VwToast").addClass( "VwToastLong" );
      }
      else
      {
        $(".VwToast").addClass( "VwToastShort" );

      }
    }

  } // end showToast()


  /**
   * Sets up the animation alert
   *
   */
  function setupAnimationBox()
  {

    configureAnimationProps();

    // Clean up first
    $( "." +  m_objProperties.cssAnimationShell ).remove();
    $( "." +  m_objProperties.cssAnimationOverlay ).remove();

    // Determine parent DIV element
    let parentDivEl;

    if ( m_objProperties.positionByParent )
    {
      parentDivEl = $("#" + m_objProperties.positionByParent );
    }
    else
    {
      parentDivEl = $( "body" );
    }

    if ( m_objProperties.cssAnimationOverlay )
    {
      // Create overlay DIV
      parentDivEl.append( $("<div>").addClass( m_objProperties.cssAnimationOverlay ).addClass( m_objProperties.cssAnimationCloseAction ) );
    }

    // Create animation shell
    const strAnimationShell = $("<div>").attr( "id", m_objProperties.animationShellId ).addClass( m_objProperties.cssAnimationShell );

    // If animation isn't auto starting then hide the shell
    if ( m_objProperties.disableAutoStart )
    {
      strAnimationShell.hide();
    }

    parentDivEl.append( strAnimationShell );

    const shellEl = $( "." + m_objProperties.cssAnimationShell );
    shellEl.append( strContent );

    // Now that all DOM elements exist, finish animation prop configuration
    const  nAnimationShellWidth = $( "#" + m_objProperties.animationShellId ).outerWidth( true );

    if ( m_objProperties.direction == "left" )
    {

      if ( !m_objProperties.startX )
      {
        // Default start is to be hidden all the way on the right side
        m_objProperties.startX = $( window ).width() + "px";
      }

      if ( !m_objProperties.endX )
      {
        // Default animation distance to the left is just the width of the animation shell element
        m_objProperties.endX = $( window ).width() - nAnimationShellWidth + "px";

       // $( "." +  m_objProperties.cssAnimationShell ).css( "left", m_objProperties.endX );
        $( "." +  m_objProperties.cssAnimationShell ).css( "right", "5px");
      }


    }
    else
    {

      if ( !m_objProperties.startX )
      {
        // Default start is to be hidden all the way on the left side
        m_objProperties.startX = 0 - nAnimationShellWidth + "px";
      }

      if ( !m_objProperties.endX )
      {
        // Default animation distance to the right is just the width of the animation shell element
        m_objProperties.endX = "0px";

        $( "." +  m_objProperties.cssAnimationShell ).css( "left", 0 );
      }

    }

    const getUserBrowser = VwUiUtils.getBrowserName();

    switch ( getUserBrowser )
    {

      case "IE11":

            appendCSSRules( finishSetup );
            break;

      default:

            insertCSSRules( finishSetup );
            break;

    }


    /**
     * Finish the animation setup
     */
    function finishSetup()
    {
      if ( !m_objProperties.disableAutoStart )
      {
        startAnimation();
      }
      else
      {
        if ( m_objProperties.fnComplete )
        {
          m_objProperties.fnComplete( self );
        }
      }
    }

  }

  /**
   * Configure animation CSS rules using appendRule
   */
  function appendCSSRules( fnReady )
  {

    let cssRule = VwUiUtils.getCssRule( m_objProperties.keyframeNameStart, CSSRule.KEYFRAMES_RULE );

    if ( !cssRule )
    {
      vwError( "Expected to find keyFrame start rule: " + m_objProperties.keyframeNameStart + ", but got null");
      return;
    }

    cssRule.appendRule( "0% {left:" + m_objProperties.startX + ";}" );
    cssRule.appendRule( "100% {left:" + m_objProperties.endX + ";}" );

    // Configure animation end action
    if ( m_objProperties.keyframeNameEnd )
    {
      cssRule = VwUiUtils.getCssRule( m_objProperties.keyframeNameEnd, CSSRule.KEYFRAMES_RULE );

      if ( !cssRule )
      {
        vwError( "Expected to find keyFrame finish rule: " + m_objProperties.keyframeNameEnd + ", but got null");
        return;
      }

      cssRule.appendRule( "0% {left:" + m_objProperties.endX + ";}" );
      cssRule.appendRule( "100% {left:" + m_objProperties.startX + ";}" );
    }

    // Configure animation close action
    if ( m_objProperties.keyframeNameClose )
    {
      cssRule = VwUiUtils.getCssRule( m_objProperties.keyframeNameClose, CSSRule.KEYFRAMES_RULE );

      if ( !cssRule )
      {
        vwError( "Expected to find keyFrame finish rule: " + m_objProperties.keyframeNameClose + ", but got null");
        return;
      }

      cssRule.appendRule( "0% {left:" + m_objProperties.endX + ";}" );
      cssRule.appendRule( "100% {left:" + m_objProperties.startX + ";}" );
    }

    fnReady();

  }


  /**
   * Configure animation CSS rules using insertRule
   */
  function insertCSSRules( fnReady )
  {

    const  styleEl = VwUiUtils.getStylesheet( m_objProperties.styleSheet );

    // Insert keyframe start rule
    let strStartRule = "@keyframes " + m_objProperties.keyframeNameStart + " {";
    strStartRule += "0% {left:" + m_objProperties.startX + ";}";
    strStartRule += "100% {left:" + m_objProperties.endX + ";}";
    strStartRule += " }";
    styleEl.insertRule( strStartRule, styleEl.cssRules.length );


    // Configure animation end action
    let strEndRule = "@keyframes " + m_objProperties.keyframeNameEnd + " {";
    strEndRule += "0% {left:" + m_objProperties.endX + ";}";
    strEndRule += "100% {left:" + m_objProperties.startX + ";}";
    strEndRule += " }";
    styleEl.insertRule( strEndRule, styleEl.cssRules.length );


    // Configure animation close action
    let strCloseRule = "@keyframes " + m_objProperties.keyframeNameClose + " {";
    strCloseRule += "0% {left:" + m_objProperties.endX + ";}";
    strCloseRule += "100% {left:" + m_objProperties.startX + ";}";
    strCloseRule += " }";
    styleEl.insertRule( strCloseRule, styleEl.cssRules.length );


    fnReady();

  }


  /**
   * Start the animation
   */
  function startAnimation()
  {

    if ( m_objProperties.disableAutoStart )
    {
      $( "#" + m_objProperties.animationShellId ).show();
    }

    $( "#" + m_objProperties.animationShellId ).addClass( m_objProperties.cssAnimationStart );

    if ( m_objProperties.fnOnShowAnimation )
    {
      m_objProperties.fnOnShowAnimation();
    }

    // Pause for specified time and then start the animation defined by the finish class
    setTimeout( function ()
                {
                  $( "." + m_objProperties.cssAnimationShell ).addClass( m_objProperties.cssAnimationFinish );

                  setupAnimationActions( m_objProperties );

                  setTimeout( function()
                              {
                                // If disableAutoStart is set to true then fnComplete has already executed earlier
                                if ( !m_objProperties.disableAutoStart && m_objProperties.fnComplete )
                                {
                                  m_objProperties.fnComplete( self );
                                }

                                if ( m_objProperties.removeComplete )
                                {
                                  // Clean after animation is over
                                  $( "." + m_objProperties.cssAnimationShell ).remove();
                                  $( "." + m_objProperties.cssAnimationOverlay ).remove();
                                }

                              }, m_objProperties.finishTime)

                }, m_objProperties.pauseTime );

  }

  /**
   * Setup actions for the Animation
   */
  function setupAnimationActions()
  {

    if ( m_objProperties.cssAnimationCloseAction )
    {
      $("." + m_objProperties.cssAnimationCloseAction ).unbind().click( function()
      {
        closeAnimationShell();
      } );
    }

  }

  /**
   * Handles the closing of the Animation shell either by remove() or Animation CSS
   */
  function closeAnimationShell()
  {
    let shellEl;
    // Configure animation close action
    if ( m_objProperties.keyframeNameClose )
    {
      shellEl = $( "." + m_objProperties.cssAnimationShell ) ;

      shellEl.addClass( m_objProperties.cssAnimationClose );

      shellEl[0].addEventListener("webkitAnimationEnd", removeAnimationShell, false);
    }
    else
    {
      $( "." + m_objProperties.cssAnimationShell ).remove();
    }


    // Execute close action callback
    if ( m_objProperties.closeCallback )
    {
      m_objProperties.closeCallback();
    }

  }

  /**
   * Remove the animation shell
   */
  function removeAnimationShell()
  {
    $("." + m_objProperties.cssAnimationShell ).remove();
    $("." + m_objProperties.cssAnimationOverlay ).remove();
  }

  /**
   * Configure the default properties and apply any user properties
   */
  function configureAnimationProps()
  {
    // todo this doesn't belong here var sysConfig = getSystemConfig();

    const animationProps = {};

    animationProps.styleSheet = "vw_jquery_ui_popup_box";
    animationProps.styleSheet += ".css";
    animationProps.direction = "left";
    animationProps.pauseTime = 5000;
    animationProps.finishTime = 2000;
    animationProps.removeComplete = true;

    animationProps.keyframeNameStart = "vwSlideLeft";
    animationProps.keyframeNameEnd = "vwSlideRight";
    animationProps.keyframeNameClose = "vwSlideAnimation";

    animationProps.cssAnimationStart = "VwAnimationStart";
    animationProps.cssAnimationFinish = "VwAnimationFinish";
    animationProps.cssAnimationShell = "VwAnimationMsg";
    animationProps.cssAnimationClose = "VwSlideAnimationClose";

    animationProps.animationShellId = "vwAnimationShell";

    m_objProperties = $.extend( animationProps, m_objProperties );

  }


  /**
   * Setup the default properties
   */
  function configProps()
  {
    m_objProperties = {modal: true};

    m_objProperties.draggable = true;
    m_objProperties.alertImg = "/images/vw/vwExclamation.png";
    m_objProperties.errorImg = "/images/vw/vwError.png";
    m_objProperties.confirmImg = "/images/vw/vwQuestionMark.png";
    m_objProperties.progressImg = "/images/vw/vwProgress.png";
    m_objProperties.infoImg = "/images/vw/vwInfo.png";

    m_objProperties.cssPopup = "VwPopupBox VwPopupCenter";
    m_objProperties.cssHdr = "VwPopupBoxHdr";
    m_objProperties.cssHdrText = "VwPopupHdrText";
    m_objProperties.cssContent = "VwPopupBoxContent";
    m_objProperties.cssContentText = "VwPopupContentText";
    m_objProperties.cssContentTextDiv = "VwPopupContentTextDiv";

    if (popupProps.cssActionBar)
    {
      m_objProperties.cssActionBar = popupProps.cssActionBar;
    }
    else
    {
      m_objProperties.cssActionBar = "VwPopupBoxActions";
    }


    m_objProperties.cssImg = "VwPopupImg";
    m_objProperties.cssActionBtn = "VwPopupActionBtn";
    m_objProperties.maxWidth = "70%";
    m_objProperties.maxHeight = "70%";
    m_objProperties.cancelText = "Cancel";
    m_objProperties.acceptText = "OK";

    m_objProperties.cssTextArea = "VwTextArea";
    m_objProperties.cssInput = "VwInput";

    if ( popupProps )
    {
      $.extend( m_objProperties, popupProps );
    }

  }


} // end VwPopupMsgBox

VwPopupMsgBox.prototype = new VwPopupBox();
VwPopupMsgBox.s_mapInstances = new VwHashMap();

export function vwError( strContent, strTitle, fnCallback )
{

  if ( !strTitle )
  {
    strTitle = "Error";
  }

  return new VwPopupMsgBox( "error", strTitle, strContent, {closeCallback: fnCallback} );

}

export function vwConfirm( strContent, strTitle, fnCallback )
{

  if ( !strTitle )
  {
    strTitle = "Confirm";
  }

  return new VwPopupMsgBox( "confirm", strTitle, strContent, {closeCallback:fnCallback } );
}


export function vwProgress( strContent, strTitle, fnCallback )
{

  if ( !strTitle )
  {
    strTitle = "Please Wait...";
  }

  return new VwPopupMsgBox( "progress", strTitle, strContent, {closeCallback:fnCallback } );

}


export function vwInfo( strContent, strTitle, fnCallback )
{

  if ( !strTitle )
  {
    strTitle = "Info";
  }

  return new VwPopupMsgBox( "info", strTitle, strContent, {closeCallback:fnCallback } );
}

export function vwInput( strType, strTitle, strContent, fnCallback, objProps, strInitialValue )
{

  if ( !strTitle )
  {
    strTitle = "Input";
  }

  const popupProps = {closeCallback:fnCallback,inputType:strType };
  popupProps.initialInputText = strInitialValue;

  $.extend( popupProps, objProps );

  return new VwPopupMsgBox( "input", strTitle, strContent, popupProps );

}

export function vwAlert( strContent, strTitle, fnCallback )
{

  if ( !strTitle )
  {
    strTitle = "Alert";
  }

  return new VwPopupMsgBox( "alert", strTitle, strContent, {closeCallback:fnCallback } );
}

/**
 * Creates a modeless animation alert that slides right to left from top of browser content (The default)
 *
 * @param strId The id of the user content
 * @param strContent The user
 * @param objProps
 * @returns {VwPopupMsgBox}
 */
export function vwAnimationAlert( strId, strContent, objProps )
{
  return new VwPopupMsgBox( "animate",  strId, strContent, objProps );
}

/**
 * Shows a Toast message. Toast messages are non modal messages that use animation with opacity to fade out over the spcified time
 *
 * @param strParentId The parent id where the toast will be ventered, if null the parent is the html body
 * @param strContent  The message content to be displayed
 * @param strCssToast The css applied to the toats div block
 * @param strCssAnimation The css animation that will be used to animate the fade
 *
 * @return {VwPopupMsgBox}
 */
export function vwShowToast( strParentId, strContent, toastProps )
{
  return new VwPopupMsgBox( "toast", null, strContent, toastProps );
}


