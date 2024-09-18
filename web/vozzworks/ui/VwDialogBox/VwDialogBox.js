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

import VwPopupBox from "/vozzworks/ui/VwPopupBox/VwPopupBox.js";
import VwUiUtils from "/vozzworks/ui/VwCommon/VwUiUtils.js";
import VwExString from "/vozzworks/util/VwExString/VwExString.js";
import VwPromiseMgr from "/vozzworks/util/VwPromiseMgr/VwPromiseMgr.js";

/**
 * This object displays a popup dialog box which can be modal or modeless
 *
 * @param strContent   The html dialog content
 * @param dialogProps The dialog properties:
 *
 *        fnReady:Function:Optional a callback function in the form function( dialogInstance) called the the dialog box is configObject and ready
 *        modal:Boolean:Optional the default is true
 *        tearOff:Boolean:Optional If true, defines a tearoff elelment that becomes a modeless dialog when tearoFF is activated and returns the element
 *        to its original location when the element is pined. The default is false; This overrides the modal property. Tearoff dialogs are modeless.
 *        noHeader:Boolean:Optional if true, the dialog is not created with a title bar/. The default is false
 *        maxWidth:String:optional The max width in any legal css unit. The default is 80%
 *        maxHeight:String:optional The max width in any legal css unit. The default is 80%
 *        resourceMgr:VwPropertyMgr:Optional if specified ids that start with i18n_ prefix will be translated
 *        draggable:Boolean:Optional if true, allows the dialog to be dragged (Note:this is disabled if the noheader property is true). The default is false
 *        resizable:Boolean:Optional if true, allows the dialog to be re-sized. The default is false.
 *        closeRightIcon:Boolean:Optional if true a close icon will be placed on the upper right corner of the dialog
 *        closeLeftIcon:Boolean:Optional if true a close icon will be placed on the upper left corner of the dialog
 *        noCenter:Boolean:Optional if true do not center the dialog box within the browser window The default is false (center the dialog)
 *        closeOnOutsideClick:Boolean:Optional if true the dialog box will close if mouse click is outside the dialog box. The default is false.
 *        closeCallback:Optional callback when the dialog has been closed
 *        closeDialogIconImgUrl:String:optional if specified the image to use for the close icon
 *        title:String,Optional The dialog box title
 *        initialFocusId:String,Optional The id of the html element taht will be givien the focus
 *        defaultBtnId The id of the button control that will be clicked when the enter key is hit
 *        position:Object:Optional specifies an absolute positon to place the dialog
 *        CSS:
 *        height:String:Optional the height in css units to be applied to the dialog box. The default is to size the dialog around the CSS defined html content
 *        width:String:Optional  the width in css units to be applied to the dialog box. The default is to size the dialog around the CSS defined html content
 *
 *        cssDialogHdr:String:Optional The css class assigned to the dialog box header: The default is "VwDialogHdr"
 *        cssPopup:String:Optional If specified, the class will be added to the Top parent dialog. The default is the VwPopupBox
 *        cssTitle:String:Optional if specified, the class will be added to the dialog's header title component.
 *        cssContent:String:Optional if specified ,the class will be added to the dialog's content section
 *        cssCloseIcon:String:optional - if specified, The class used to style the closeicon
 * @constructor
 */
function VwDialogBox( strContent, dialogProps )
{
  if ( arguments.length == 0 )
  {
    return;  // Prototype
  }

  const m_super = this;
  const self = this;

  const m_dialogProps = configDefaultProps();

  let   m_tearOffParent;
  let   m_tearOffEle;
  let   m_tearOffSiblingEle;
  let   m_strDockOp;

  let   m_htmlPopupBoxEle;
  let   m_objIds;

  let   m_nContentWidth;
  let   m_strContentId;
  let   m_promiseMgr;

  this.close = close;
  this.undock = undockDialog;
  this.dock = dockDialog;
  this.hide = hide;
  this.show = show;
  this.getCurrentPos = getCurrentPos;
  this.setTitle = setTitle;
  this.removeOpacity = () => m_htmlPopupBoxEle.removeClass( "VwOpacityZero");

  /**
   * Setup the dialog box
   */
  function configObject()
  {
    VwPopupBox.call( self, m_dialogProps );

    if ( self.getStackCount() == 8 )
    {
      throw "Popup boxes cannot be nested deeper than 8 levels";
    }

    m_objIds = m_super.getObjIds();

    const nZIndex = m_super.getPopupZIndex();
    let   htmlPopupHeaderEle;

    m_htmlPopupBoxEle = $("<div>").attr( "id", m_objIds.popupId ).attr( "style", "z-index:"+ nZIndex + ";display:none;" ).attr( "tabindex", "0");

    m_htmlPopupBoxEle.addClass( m_dialogProps.cssPopup );

    if ( m_dialogProps.opacityZero )
    {
      m_htmlPopupBoxEle.addClass( "VwOpacityZero" );
    }

    if ( m_dialogProps.noHeader )
    {
      m_dialogProps.draggable = false;
    }
    else
    if ( m_dialogProps.customHdrHtml )
    {
      htmlPopupHeaderEle = m_dialogProps.customHdrHtml;

      m_objIds.popupTitleId = m_dialogProps.titleId;
      if ( m_dialogProps.closeId )
      {
        $("#" +  m_dialogProps.closeId ).click( )
      }

    }
    else
    {
      if ( !m_dialogProps.closeId )
      {
        m_dialogProps.closeId = "close_" + m_objIds.popupId;
      }

      htmlPopupHeaderEle = $("<div>").attr( "id", m_objIds.popupHdrId ).attr( "style", "cursor:move" );
      const htmlCloseImgEle = $("<img>").attr( "id", m_dialogProps.closeId ).attr( "src", "vozzworks/ui/images/close.png").attr( "style", "display:none;").addClass( "VwPopupCloseIcon" );

      const htmlHdrSpanEle = $("<span>").attr( "id", m_objIds.popupTitleId );
      htmlPopupHeaderEle.append( htmlCloseImgEle );
      htmlPopupHeaderEle.append( htmlHdrSpanEle );
    }

    if ( htmlPopupHeaderEle )
    {
      m_htmlPopupBoxEle.append( htmlPopupHeaderEle );
    }

    m_htmlPopupBoxEle.append( $("<div>").attr( "id", m_objIds.popupContentId ) );


    if( !m_dialogProps.tearOff  )
    {
      $( "body" ).append( m_htmlPopupBoxEle );

      buildPopup();
    }
    else
    {
      setupTearOffDialog();
    }

    m_promiseMgr.success( self );

  } // end configObject()

  /**
   * Sets/updates the fialogbox title
   *
   * @param strTitle The title to set in the dialog box/popup header
   */
  function setTitle( strTitle )
  {
    if ( m_objIds.popupTitleId )
    {
      $("#" + m_objIds.popupTitleId ).text( strTitle );
    }
  }

  /**
   * Create the tearOff and tearOff parent elements for dock/undock manipulation
   */
  function setupTearOffDialog()
  {
     //m_objProperties.fnDragStart = makeModellDialog;
     m_tearOffEle = $("#" + strContentId)[0];
     m_tearOffParent = $(m_tearOffEle).parent();

     let nextEle = $(m_tearOffEle).next();
     if ( nextEle.length > 0 )
     {
       m_tearOffSiblingEle = nextEle;  // Docking the tearoff will be inserted after this sibling
       m_strDockOp = "b";
     }
     else
     {
       nextEle = $(m_tearOffEle).prev();
       if ( nextEle.length > 0 )
       {
         m_tearOffSiblingEle = nextEle;  // Docking the tearoff will be inserted after this sibling
         m_strDockOp = "a";
       }
       else
       {
         m_tearOffSiblingEle = null; // no siblings
       }
     }

  } // end setupTearOffDialog()


  /**
   * removes the tearoff content from its parent and puts it in a modeless dialog frame
   */
  function undockDialog()
  {
    $(m_tearOffEle).detach();

    if ( m_dialogProps.tearOffPlaceholderEle )
    {
      if ( m_tearOffSiblingEle == null )
      {
        $(m_tearOffParent).append( m_dialogProps.tearOffPlaceholderEle );
      }
      else
      if ( m_strDockOp == "a")
      {
        $( m_dialogProps.tearOffPlaceholderEle ).insertAfter( m_tearOffSiblingEle );

      }
      else
      {
        $(m_dialogProps.tearOffPlaceholderEle ).insertBefore( m_tearOffSiblingEle );

      }

    }
    
    $( "body" ).append( m_htmlPopupBoxEle );

    buildPopup();
    
    m_super.setupDraggable( m_dialogProps.dragElementId );
    $("#" + m_dialogProps.dragElementId).css( "cursor", "move");

    if ( m_dialogProps.fnUnDocked )
    {
      m_dialogProps.fnUnDocked();
    }

  }

  /**
   * Returns the dialog beack to its original position and removes the dialog frame
   */
  function dockDialog()
  {

    if ( m_dialogProps.tearOffPlaceholderEle )
    {
      $( m_dialogProps.tearOffPlaceholderEle).remove();
    }

    $(m_htmlPopupBoxEle).detach();

    if ( m_tearOffSiblingEle == null )
    {
      $(m_tearOffParent).append( m_tearOffEle );
    }
    else
    if ( m_strDockOp == "a")
    {
      $( m_tearOffEle ).insertAfter( m_tearOffSiblingEle );

    }
    else
    {
      $( m_tearOffEle ).insertBefore( m_tearOffSiblingEle );

    }
    
    $("#" + m_dialogProps.dragElementId).css( "cursor", "default");

    if ( m_dialogProps.fnDocked )
    {
      m_dialogProps.fnDocked();
    }
  }

  /**
   * Builds the rest of the popup
   */
  function buildPopup()
  {
    const strCloseId = m_dialogProps.closeId;

    // apply user css and different image if specified
    if ( m_dialogProps.closeLeftIcon || m_dialogProps.closeRightIcon )
    {
      $( "#" + strCloseId ).css( "display", "block" );

      if ( m_dialogProps.cssCloseIcon )
      {
        $( "#" + strCloseId ).removeClass().addClass( m_dialogProps.cssCloseIcon );
      }

      if ( m_dialogProps.closeIconImgUrl )
      {
        $( "#" + strCloseId ).attr( "src", m_dialogProps.closeIconImgUrl );
      }

      if ( m_dialogProps.closeRightIcon )
      {
        $( "#" + strCloseId ).click( m_dialogProps.closeRightIcon );
      }
      else
      {
        $( "#" + strCloseId ).click( m_dialogProps.closeLeftIcon );
      }
    }

    if ( m_tearOffEle )
    {
      $( "#" + m_objIds.popupContentId ).append( m_tearOffEle );
    }
    else
    {
      $( "#" + m_objIds.popupContentId ).html( strContent );

    }

    m_strContentId = $("#" + m_objIds.popupContentId + " :first-child").attr( "id");
    m_nContentWidth = $("#" + m_strContentId ).width();

    if ( !m_dialogProps.customHdrHtml )
    {
      const strTitle = $( "#" + m_strContentId ).attr( "title" );

      if ( strTitle )
      {
        $( "#" + m_objIds.popupTitleId ).html( strTitle );
      }
      else
      if ( m_dialogProps.title )
      {
        if ( VwExString.startsWith( m_dialogProps.title, "i18n_" ) && m_dialogProps.resourceMgr )
        {
          $( "#" + m_objIds.popupTitleId ).html( m_dialogProps.resourceMgr.getString( m_dialogProps.title.substring( "i18n_".length ) ) );

        }
        else
        {
          $( "#" + m_objIds.popupTitleId ).html( m_dialogProps.title );
        }

      }
    } //end if ( !m_objProperties.customHdrHtml)


    // Allow user properties to override default styles
    if ( m_dialogProps.cssPopup )
    {
      $( "#" + m_objIds.popupId ).addClass( m_dialogProps.cssPopup );
    }
    else
    {
      $( "#" + m_objIds.popupId ).addClass( "VwPopupBox" );
    }

    if ( m_dialogProps.cssTitle )
    {
      $( "#" + m_objIds.popupHdrId ).addClass( m_dialogProps.cssTitle );
    }
    else
    if (!m_dialogProps.tearOff )
    {
      $( "#" + m_objIds.popupHdrId ).addClass( m_dialogProps.cssDialogHdr );

    }

    if ( m_dialogProps.cssContent )
    {
      $( "#" + m_objIds.popupContentId ).addClass( m_dialogProps.cssContent );
    }
    else
    {
      $( "#" + m_objIds.popupContentId ).addClass( "VwPopupContent" );
    }

    if ( m_dialogProps.width )
    {
      $( "#" + m_objIds.popupId ).css( "width", m_dialogProps.width );

    }

    if ( m_dialogProps.maxWidth )
    {
      $( "#" + m_objIds.popupId ).css( "max-width", m_dialogProps.maxWidth );

    }

    if ( m_dialogProps.height )
    {
      $( "#" + m_objIds.popupId ).css( "height", m_dialogProps.height );

    }

    if ( m_dialogProps.maxHeight )
    {
      $( "#" + m_objIds.popupId ).css( "max-height", m_dialogProps.maxHeight );

    }

    $( "#" + m_objIds.popupId ).css( "display", "flex" );

    if ( !m_dialogProps.noHeader )
    {
      $( "#" + m_objIds.popupId ).css( "flex-direction", "column" );

    }
    if ( m_dialogProps.noCenter )
    {
      $( "#" + m_objIds.popupId ).css( { "position": "absolute", "top": "0", "left": "0" } );
    }
    else
    if ( m_dialogProps.position )
    {
      const pos = m_dialogProps.position;

      $( "#" + m_objIds.popupId ).css( { "position": "absolute", "top": pos.top, "left": pos.left } );
    }
    else
    {

      $( "#" + m_objIds.popupId ).addClass( "VwPopupCenter" );
      completeSetup();
      return;

    }

    completeSetup();

    function completeSetup()
    {

      if ( m_dialogProps.closeOnOutsideClick )
      {

        $( "body" ).on( "click", handleOutsideMouseClick );
      }


      if ( m_dialogProps.resizable )
      {
        $( "#" + m_objIds.popupId ).vwElasticDiv();

        $( "#" + m_objIds.popupId ).css( "border", "none" );

        const elasticDiv = $( "#" + m_objIds.popupId ).parent();

        // Move the dialog class up to the elastice parent
        const strClass = $( "#" + m_objIds.popupId ).attr( "class" );
        $( "#" + m_objIds.popupId ).attr( "class", "" );

        elasticDiv.attr( "class", strClass );

        elasticDiv.css( "z-index", nZIndex );

      }

      if ( m_dialogProps.dragElementId )
      {
        m_dialogProps.draggable = true ;
      }
      

      if ( m_dialogProps.draggable )
      {
        m_super.setupDraggable( m_dialogProps.dragElementId );

      }
      // Install close click handlers if close ids are specified
      if ( m_dialogProps.astrCloseIds )
      {
        for ( let x = 0, nLen = m_dialogProps.astrCloseIds.length; x < nLen; x++ )
        {
          $( "#" + m_dialogProps.astrCloseIds[x] ).click( close );

        }
      }


      if ( m_dialogProps.resourceMgr )
      {
        VwUiUtils.doI18n( m_dialogProps.resourceMgr );
      }

      if ( m_dialogProps.initialFocusId )
      {
        $( "#" + m_dialogProps.initialFocusId ).focus();
      }

      if ( m_dialogProps.defaultBtnId )
      {
        installDefaultBtnHandler();

      }

      $( "#" + m_objIds.popupId ).css( "min-width",  m_nContentWidth );


    }

  } // end buildPopup()


  /**
   * Installs default button key down  event handler
   */
  function installDefaultBtnHandler()
  {
    // Install global keypress event to trap the enter key for default button support
    $("#" + m_objIds.popupContentId ).unbind().keydown( function( event )
                                                        {
                                                          event = event || window.event;

                                                          if ( event.keyCode == 13 )
                                                          {
                                                            $( "#" + m_dialogProps.defaultBtnId ).click();
                                                            return false;
                                                          }

                                                        });
  }

  /**
   * Handle closing of the dialog box when user clicks outside of the dialog
   * @param event
   */
 function handleOutsideMouseClick( event )
 {

   if ( event.target.id == self.getOverlayId() ) // This means a click ouside the dialog box
   {
     event.preventDefault();
     event.stopImmediatePropagation();

     $( "body" ).unbind( "click", handleOutsideMouseClick );
     close();

   }

 }

  /**
   * Setup the default properties
   */
  function configDefaultProps()
  {
    const props = {modal: true};
    props.cssDialogHdr = "VwDialogHdr";

    if ( props.tearOff )
    {
      props.modal = false;
      props.noHeader = true;
    }

    props.draggable = true;
    $.extend( props, dialogProps );

    return props;

  } // end configDefaultProps()


 
  /**
   * Close the popup and call user callback if specified
   * @param result
   */
  function close( result )
  {

    if ( m_dialogProps.closeCallback )
    {
      // A return value of false prevents the closing of the dialog
      const closeResult  =  m_dialogProps.closeCallback( result );

      if ( typeof closeResult != "undefined" &&  closeResult == false )
      {
        return;
      }

    }

    m_super.closePopup();


    if ( m_dialogProps.resizable )
    {
      const elasticParent = $( "#" + m_objIds.popupId ).parent();
      elasticParent.remove();

      return;


    }

    $( "#" + m_objIds.popupId ).remove();



  }

  /**
   * Hides the dialog
   */
  function hide()
  {
    $("#" + self.getOverlayId() ).hide();
    $( "#" + m_objIds.popupId ).hide();
  }

  /**
   * Shows the dialog
   */
  function show()
  {
    $("#" + self.getOverlayId() ).show();
    $( "#" + m_objIds.popupId ).show();

    const scrollContainerEle = $("#" + m_objIds.popupId ).find( ".VwScrollContainer" )[0];

    if ( scrollContainerEle )
    {
      const showEvent = new CustomEvent( "VwVisibleEvent", {detail: {id: m_objIds.popupId}} );
      scrollContainerEle.dispatchEvent( showEvent );
    }
  }

  /**
   * Gets the current position relative to the browser
   * @returns an offset object with the properties left and top
   */
  function getCurrentPos()
  {
    return $( "#" + m_objIds.popupId ).offset();

  }


  return new Promise( ( success, fail ) =>
  {
    m_promiseMgr = new VwPromiseMgr( success, fail, configObject );
  });

} // end VwDialogBox{}

/**
 * jQuery invoker - turns existing div on a page into a popup dialog box
 * @param dialogProps The dialog properties - optional
 */
$.fn.vwDialog = async ( dialogProps ) =>
{

  const strDialogContent = $(this )[0].outerHTML;

  const strId = this[0].id;

  $("body > #" + strId ).remove();

  return await new VwDialogBox( strDialogContent, dialogProps );

};


VwDialogBox.prototype = new VwPopupBox();

export default VwDialogBox;



