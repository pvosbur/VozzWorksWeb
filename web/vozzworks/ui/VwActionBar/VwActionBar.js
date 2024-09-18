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

import VwHashMap from "/vozzworks/util/VwHashMap/VwHashMap.js";
import VwActionBarDivider from "/vozzworks/ui/VwActionBar/VwActionBarDivider.js";
import VwActionBarFiller from "/vozzworks/ui/VwActionBar/VwActionBarFiller.js";
import {VwClass} from "/vozzworks/util/VwReflection/VwReflection.js";

VwCssImport( "/vozzworks/ui/VwActionBar/style");

/**
 * The VwActionBar Constructor
 *
 * @param strParentId The parent id of the action bar
 * @param strActionBarId The id of the action nar
 * @param objActionBarBarProps The action bar properties object. Properties are:
 *        resourceMgr:VwPropertyMgr,Optional
 *        cssActionBar:String,Optional The css class applied to the action bar parent element
 *        cssItem:String,Optional The css class applied to parent element of each item
 *        cssText:String,Optional The global css class applied to all <p> text elements unless a VwActionBarDescriptor overrides it
 *        cssImg:String,Optional The global css class applied to all <img> elements unless a VwActionBarDescriptor overrides it
 *        cssHoverImg:String,Optional The global css class applied to all <img> on hover elements unless a VwActionBarDescriptor overrides it
 *        cssSelected:String,Optional The global css class applied to a selected action item element unless a VwActionBarDescriptor overrides it
 *        cssDivider:String,Optional The global css class applied to all divider elements unless a VwActionBarDescriptor overrides it
 *        cssToolTip:String,Optional The css for tooltips if tooltips are specified
 *@param eventMgr

 * @constructor
 */
function VwActionBar( strParentId, strActionBarId, objActionBarBarProps, eventMgr )
{
  const self = this;
  const m_mapActionBarDescriptors = new VwHashMap();
  const m_mapInstancesById = new VwHashMap();
  const ACTION_BAR_ID = strActionBarId;

  let   m_htmlActionBarEl;
  let   m_strTextOrientation = "top";
  let   m_selActionBarItem;
  let   m_prevSelActionBarItem;

  // Public methods
  this.add = add;
  this.addAll = addAll;
  this.clear = clear;
  this.insert = insertItem;
  this.selectItem = selectItem;
  this.setSelectedItem = setSelectedItem;
  this.deSelectCurrentSelection = deSelectCurrentSelection;
  this.getActionBarItem = getActionBarItemDescriptor;
  this.getActionBarItemId = getActionBarItemId;
  this.updateActionBarItem = updateActionBarItem;
  this.removeActionBarItem = removeActionBarItem;
  this.getSelectedItem = getSelectedItem;
  this.getPrevSelectedItem = getPrevSelectedItem;
  this.putPersistance = putPersistence;
  this.getPersistence = getPersistence;

  setup();

  /**
   * Create the parent action html container
   */
  function setup()
  {
    m_htmlActionBarEl = $( "<actionBarContainer>" ).attr( "id", ACTION_BAR_ID ).addClass( objActionBarBarProps.cssActionBarContainer );

    $( "#" + strParentId ).append( m_htmlActionBarEl );

    if ( eventMgr )
    {
      eventMgr.addEventListener( VwActionBar.VW_ACTION_BAR_HANDLER_CLOSED, self, handleActionBarHandlerClosed );

    }

  }


  function handleActionBarHandlerClosed( strActionBarHandlerId )
  {
    if ( m_selActionBarItem && m_selActionBarItem.id == strActionBarHandlerId )
    {
      m_selActionBarItem = null;
    }
    
    const actionHandler = m_mapActionBarDescriptors.get( ACTION_BAR_ID + "_" + strActionBarHandlerId );
    actionHandler.clearInstance();
  }


  Object.defineProperty( this, "textOrientation", {
    set: function ( strTextOrientation )
    {
      m_strTextOrientation = strTextOrientation;
    },
    get: function ()
    {
      return m_strTextOrientation;
    }
  } );

  /**
   * Returns the VwActionBarDescriptor for the id specified
   *
   * @param strItemId The id of the VwActionBarDescriptor
   *
   * @exception Throw exception if the action item id does not exist
   *
   */
  function getActionBarItemDescriptor( strItemId )
  {
    const strActionBarId = ACTION_BAR_ID + "_" + strItemId;
    const actionItem = m_mapActionBarDescriptors.get( strActionBarId );

    if ( !actionItem )
    {
      throw "No action item exists for id: " + strItemId;
    }

    return actionItem;
  }

  /**
   * Returns the VwActionBarDescriptor for the id specified
   *
   * @param strItemId The id of the VwActionBarDescriptor
   *
   * @exception Throw exception if the action item id does not exist
   *
   */
  function getActionBarItemId( strItemId )
  {
    return ACTION_BAR_ID + "_" + strItemId;
  }


  /**
   * Adds all of the action item descirptoes in the array
   *
   * @param aVwActionBarDescriptor The array of VwActionBarDescriptor objects
   */
  async function addAll( aVwActionBarDescriptor )
  {
    for ( let i = 0, nLen = aVwActionBarDescriptor.length; i < nLen; i++ )
    {
      await add( aVwActionBarDescriptor[i] );
    }
  }

  /**
   * Adds an item to the action bar
   *
   * @param vwActionBarBarDescriptor The descriptor object conyaing the action item's properties
   */
  async function add( vwActionBarBarDescriptor )
  {

    const strId = vwActionBarBarDescriptor.id;
    
    if ( vwActionBarBarDescriptor instanceof VwActionBarDivider )
    {
      addDivider( vwActionBarBarDescriptor );
      return;
    }

    if ( vwActionBarBarDescriptor instanceof VwActionBarFiller )
    {
      addFiller( vwActionBarBarDescriptor );
      return;
    }

    vwActionBarBarDescriptor.actionBar = self;

    const strActionBarId = ACTION_BAR_ID + "_" + vwActionBarBarDescriptor.id;

    try
    {
      if ( getActionBarItemDescriptor( vwActionBarBarDescriptor.id ) )
      {
        throw "ActionBar Item Id: " + vwActionBarBarDescriptor.id + " already exists";
      }
    }
    catch ( strException )
    {
      // Ignore as we are expecting a not found exception
    }

    const actionSectionEl = buildActionBarItem( vwActionBarBarDescriptor );

    $( "#" + ACTION_BAR_ID ).append( actionSectionEl );

    if ( vwActionBarBarDescriptor.fnRenderer)
    {
      vwActionBarBarDescriptor.fnRenderer( $(actionSectionEl).attr( "id" ) );
    }

    m_mapActionBarDescriptors.put( strActionBarId, vwActionBarBarDescriptor );

    if ( vwActionBarBarDescriptor.clickHandlerClass || vwActionBarBarDescriptor.clickHandlerModule || vwActionBarBarDescriptor.clickHandler)
    {
      $( "#" + strActionBarId ).click( handleActionBarItemClicked );
    }

    if ( vwActionBarBarDescriptor.visibility == "hidden" )
    {
      $( "#" + strActionBarId ).css( "visibility", "hidden");

    }


    if ( vwActionBarBarDescriptor.hoverImg )
    {
      $( "#" + strActionBarId ).hover( handleActionBarItemImgHover )

    }

    if ( vwActionBarBarDescriptor.cssHover )
    {
      $( "#" + strActionBarId ).hover( function ()
                                 {
                                   $( "#" + strActionBarId ).addClass( vwActionBarBarDescriptor.cssHover );
                                 }, function ()
                                 {
                                   $( "#" + strActionBarId ).removeClass( vwActionBarBarDescriptor.cssHover );
                                 } )
    }

    if ( vwActionBarBarDescriptor.widgetHandlerClass || vwActionBarBarDescriptor.widgetHandlerModule )
    {
      $( "#" + strActionBarId ).hover( function ()
                                 {
                                   handleWidgetHover( vwActionBarBarDescriptor, true );
                                 },
                                 function ()
                                 {
                                   handleWidgetHover( vwActionBarBarDescriptor, false );

                                 } );

       await launchWidgetHandler( vwActionBarBarDescriptor );
    }


    if ( vwActionBarBarDescriptor.showOnInit )
    {
      if ( vwActionBarBarDescriptor.widgetHandlerClass || vwActionBarBarDescriptor.widgetHandlerModule )
      {
        await launchWidgetHandler( vwActionBarBarDescriptor );
      }
      else
      {
        const event = {};
        event.currentTarget = {};
        event.currentTarget.id = ACTION_BAR_ID + "_" + vwActionBarBarDescriptor.id;

        handleActionBarItemClicked( event );
      }
    }

  }

  /**
   * Adds a divider to the action bar
   *
   * @param vwDivider The VwActionBarDivider instance
   */
  function addDivider( vwDivider )
  {
    const strCssDivider = getCssDivider( vwDivider )
    const divEl = $( "<div>" );

    divEl.addClass( strCssDivider );

    $( "#" + strActionBarId ).append( divEl );

  }

  /**
   * Adds a space filler to the action bar
   *
   * @param vwFiller The VwActionBarFiller instance
   */
  function addFiller( vwFiller )
  {
    const strCssDivider = getCssFiller( vwFiller )
    const divEl = $( "<div>" );

    divEl.addClass( strCssDivider );

    if ( vwFiller.amt )
    {
      divEl.css( "height", vwFiller.amt );

    }

    $( "#" + strActionBarId ).append( divEl );

  }

  /**
   * Inserts the item after the id (of existing action id) specified.
   *
   * @param vwActionBarBarDescriptor The action bar descriptor of item being inserted
   * @param strAfterId The id of an existing item to be inserted after. NOTE ! if null
   * then the item is inserted at the top
   */
  function insertItem( vwActionBarBarDescriptor, strAfterId )
  {
    const strActionBarId = ACTION_BAR_ID + "_" + strAfterId;

    if ( getActionBarItemDescriptor( vwActionBarBarDescriptor.id ) )
    {
      throw "ActionBar Item Id: " + vwActionBarBarDescriptor.id + " already exists";
    }

    vwActionBarBarDescriptor.actionBar = self;

    const actionSectionEl = buildActionBarItem( vwActionBarBarDescriptor );

    if ( !strAfterId )
    {
      $( "#" + ACTION_BAR_ID ).prepend( actionSectionEl );
    }
    else
    {
      $( actionSectionEl ).insertAfter( "#" + strActionBarId );
    }

  }


  function clear()
  {
    m_mapActionBarDescriptors.clear();
    m_mapInstancesById.clear();
    m_prevSelActionBarItem = m_selActionBarItem = null;

    $( "#" + strActionBarId ).empty();
    
  }

  /**
   * Updates the actionitem
   *
   * @param vwActionBarBarDescriptor The VwActionBarDescriptor instance
   */
  function updateActionBarItem( vwActionBarBarDescriptor )
  {
    const actionSectionEl = buildActionBarItem( vwActionBarBarDescriptor );
    const  strActionBarId = ACTION_BAR_ID + "_" + vwActionBarBarDescriptor.id;

    $( "#" + strActionBarId ).replaceWith( actionSectionEl );

    if ( vwActionBarBarDescriptor.clickHandlerClass )
    {
      $( "#" + strActionBarId ).click( handleActionBarItemClicked );
    }
  }

  /**
   * Remives the action item by its id
   *
   * @param strIdToRemove
   */
  function removeActionBarItem( strIdToRemove )
  {
    $( "#" + strActionBarId ).remove( strIdToRemove );
  }

  /**
   * Builds a action item entry
   *
   * @param vwActionBarBarDescriptor The action bar descripto containg the item's properties
   * @returns {*|jQuery}
   */
  function buildActionBarItem( vwActionBarBarDescriptor )
  {

    const actionSectionEl = $( "<section>" ).attr( "id", ACTION_BAR_ID + "_" + vwActionBarBarDescriptor.id ).addClass( getCssItem( vwActionBarBarDescriptor ) );

    if ( vwActionBarBarDescriptor.widgetHandlerClass )
    {
      return actionSectionEl;
    }

    if ( vwActionBarBarDescriptor.css )
    {
      actionSectionEl.addClass( vwActionBarBarDescriptor.css )
    }

    if ( vwActionBarBarDescriptor.htmlTemplate )
    {
      actionSectionEl.append( vwActionBarBarDescriptor.htmlTemplate )
      return actionSectionEl;
    }

    if ( vwActionBarBarDescriptor.fnRenderer )
    {
       return actionSectionEl; // This will be executed after it has been added to the DOM
    }

    if ( textOnTop( vwActionBarBarDescriptor ) )
    {
      // Text on top of icon
      if ( vwActionBarBarDescriptor.text )
      {
        actionSectionEl.append( buildPElement( vwActionBarBarDescriptor ) );
      }

      if ( vwActionBarBarDescriptor.img )
      {
        actionSectionEl.append( buildImgElement( vwActionBarBarDescriptor ) );
      }
    }
    else
    {
      // text on bottom of icon
      if ( vwActionBarBarDescriptor.img )
      {
        actionSectionEl.append( buildImgElement( vwActionBarBarDescriptor ) );
      }

      if ( vwActionBarBarDescriptor.text )
      {
        actionSectionEl.append( buildPElement( vwActionBarBarDescriptor ) );
      }

    }

    if ( vwActionBarBarDescriptor.hoverImg )
    {
      const objAttr = {};
      objAttr.src = vwActionBarBarDescriptor.hoverImg;

      if ( vwActionBarBarDescriptor.hoverImgTitle )
      {
        objAttr.title = vwActionBarBarDescriptor.hoverImgTitle;
      }

      const hoverImgEl = $( "<img>" ).attr( objAttr );

      if ( vwActionBarBarDescriptor.tooltip )
      {
        hoverImgEl.attr( "id", vwActionBarBarDescriptor.id + "_hoverImg" ).attr( "tooltip", vwActionBarBarDescriptor.tooltip );
      }
      
      hoverImgEl.hide();

      hoverImgEl.addClass( getCssHoverImg( vwActionBarBarDescriptor ) ).addClass( "VwCursorPointer" );

      actionSectionEl.append( hoverImgEl );
    }

    return actionSectionEl;

  }

  /**
   * Selects the action bar item with the same behaviour as a mose click on that item
   * @param strActionBarItemId
   */
  function selectItem( strActionBarItemId )
  {
    const actionBarDescriptor = getActionBarItemDescriptor( strActionBarItemId );
  }


  /**
   * Puts the action item in the selected/unselected state.
   *
   * @param strItemId The id of the action item
   * @param fSelect true to select the action item false to deselect action item
   */
  function setSelectedItem( strItemId, fSelect )
  {
    if ( fSelect )
    {
      deSelectCurrentSelection();

    }

    const strActionBarId = ACTION_BAR_ID + "_" + strItemId;

    m_selActionBarItem = getActionBarItemDescriptor( strItemId );

    if ( m_selActionBarItem.widgetHandlerClass )
    {
      handleWidgetSelection( m_selActionBarItem, fSelect );
      return;
    }

    const actionItemEl = $( "#" + strActionBarId );

    const strCssSelected = getCssSelected( m_selActionBarItem );

    if ( fSelect )
    {
      $( "#" + strActionBarId ).addClass( strCssSelected );
      showImage( actionItemEl, false );
    }
    else
    {
      $( "#" + strActionBarId ).removeClass( strCssSelected );
      showImage( actionItemEl, true );

    }
  }

  /**
   * Deselects the currently selected item
   */
  function deSelectCurrentSelection()
  {

    if ( !m_selActionBarItem )
    {
      return;
    }

    m_prevSelActionBarItem = m_selActionBarItem;

    const strCssSelected = getCssSelected( m_selActionBarItem );

    $( "." + strCssSelected ).removeClass( strCssSelected );

    setSelectedItem( m_selActionBarItem.id, false );
  }

  /**
   * Call the widgets setSelected method if its defined
   *
   * @param actionBarDescriptor The descriptor for this widget
   * @param fSelect true if the widget is elected, false otherwise
   */
  function handleWidgetSelection( actionBarDescriptor, fSelect )
  {
    const actionClass = actionBarDescriptor.actionClass;

    try
    {
      const vwMethod = actionClass.getPublicMethod( "setSelected" );
      vwMethod.invoke( actionBarDescriptor.handlerInstance, [fSelect] );
    }
    catch ( strError )
    {
      // Widget doesn't care about selected state, ignore the exception
    }
  }

  /**
   * Call the widgets hover method if its defined
   *
   * @param actionBarDescriptor The descriptor for this widget
   * @param fIn true if object being ohvered in
   */
  function handleWidgetHover( actionBarDescriptor, fIn )
  {

    const actionClass = actionBarDescriptor.actionClass;

    try
    {
      const vwMethod = actionClass.getPublicMethod( "hover" );
      vwMethod.invoke( actionBarDescriptor.handlerInstance, [fIn] );
    }
    catch ( strError )
    {
      // Widget doesn't care about hover state, ignore the exception

    }
  }

  /**
   * Gets the css selected class for this item
   *
   * @param vwActionBarBarDescriptorThe vw action bar descriptor for this item
   * @returns {*}
   */
  function getCssSelected( vwActionBarBarDescriptor )
  {

    let strCssSelected;


    if ( vwActionBarBarDescriptor.cssSelected )  // See if item has select override
    {
      strCssSelected = vwActionBarBarDescriptor.cssSelected;
    }
    else
    {
      if ( objActionBarBarProps.cssSelected )      // See if global cssSelect defined
      {
        strCssSelected = objActionBarBarProps.cssSelected;
      }
      else
      {
        strCssSelected = "VwActionBarItemSelected";   // Default
      }
    }

    return strCssSelected;

  }

  /**
   * Gets the css selected class for the primary img
   *
   * @param vwActionBarDescriptor The action item descriptor
   * @returns {*}
   */
  function getCssImg( vwActionBarDescriptor )
  {
    let strCssImg;


    if ( vwActionBarDescriptor.cssImg )  // See if item has select override
    {
      strCssImg = vwActionBarDescriptor.cssImg;
    }
    else
    {
      if ( objActionBarBarProps.cssImg )      // See if global cssSelect defined
      {
        strCssImg = objActionBarBarProps.cssImg;
      }
    }

    return strCssImg;

  }

  /**
   * Gets the css class for the action item parent
   *
   * @param vwActionBarDescriptor The action item descriptor
   * @returns {*}
   */
  function getCssItem( vwActionBarDescriptor )
  {
    let strCssItem;


    if ( vwActionBarDescriptor.cssItem )  // See if item has select override
    {
      strCssItem = vwActionBarDescriptor.cssItem;
    }
    else
    {
      if ( objActionBarBarProps.cssItem )      // See if global cssSelect defined
      {
        strCssItem = objActionBarBarProps.cssItem;
      }
    }

    return strCssItem;

  }

  /**
   * Gets the css selected class for a text entry
   *
   * @param vwActionBarDescriptor The action item descriptor
   * @returns {*}
   */
  function getCssText( vwActionBarDescriptor )
  {
    let strCssText;


    if ( vwActionBarDescriptor.cssText )  // See if item has select override
    {
      strCssText = vwActionBarDescriptor.cssText;
    }
    else
    {
      if ( objActionBarBarProps.cssText )      // See if global cssSelect defined
      {
        strCssText = objActionBarBarProps.cssText;
      }
    }

    return strCssText;

  }

  /**
   * Gets the css selected class for the hover img
   *
   * @param vwActionBarDescriptor The action item descriptor
   * @returns {*}
   */
  function getCssHoverImg( vwActionBarDescriptor )
  {
    let strCssHoverImg;


    if ( vwActionBarDescriptor.cssHoverImg )  // See if item has select override
    {
      strCssHoverImg = vwActionBarDescriptor.cssHoverImg;
    }
    else
    {
      if ( objActionBarBarProps.cssImg )      // See if global cssSelect defined
      {
        strCssHoverImg = objActionBarBarProps.cssHoverImg;
      }
    }

    return strCssHoverImg;

  }

  /**
   * Gets the css selected class for this item
   * @param strItemId The item to test
   * @returns {*}
   */
  function getCssDivider( vwDivider )
  {
    let strCssDivider;


    if ( vwDivider.css )  // See if item has select override
    {
      strCssDivider = vwDivider.css;
    }
    else
    {
      if ( objActionBarBarProps.cssDivider )      // See if global cssSelect defined
      {
        strCssDivider = objActionBarBarProps.cssDivider;
      }
      else
      {
        strCssDivider = "VwActionBarDivider";   // Default
      }
    }

    return strCssDivider;

  }

  /**
   * Gets the css selected class for this item
   * @param strItemId The item to test
   * @returns {*}
   */
  function getCssFiller( vwFiller )
  {
    let strCssFiller;

    if ( vwFiller.css )  // See if item has select override
    {
      strCssFiller = vwFiller.css;
    }
    else
    {
      if ( objActionBarBarProps.cssFiller )      // See if global cssSelect defined
      {
        strCssFiller = objActionBarBarProps.cssFiller;
      }
      else
      {
        strCssFiller = "VwActionBarVertFiller";
      }
    }

    return strCssFiller;

  }

  /**
   * Handles a action bar item click event
   * @param event
   */
  function handleActionBarItemClicked( event )
  {

    const strActionBarId = event.currentTarget.id;

    const actionBarDescriptor = m_mapActionBarDescriptors.get( strActionBarId );

    if ( actionBarDescriptor.toggleOpenClose() && m_selActionBarItem && m_selActionBarItem.id == actionBarDescriptor.id )
    {
      m_selActionBarItem.close();
      m_selActionBarItem = null;
      return;
    }
    else
    if ( m_selActionBarItem )
    {
      m_selActionBarItem.close();
    }

    if ( actionBarDescriptor.clickHandlerClass || actionBarDescriptor.clickHandlerModule )
    {
      invokeActionBarItemHandler( actionBarDescriptor );
    }
    else
    if ( actionBarDescriptor.clickHandler )
    {
      actionBarDescriptor.clickHandler.call( self, actionBarDescriptor );
    }

    if ( objActionBarBarProps.contextChange )
    {
      objActionBarBarProps.contextChange( actionBarDescriptor );

    }

  }

  /**
   * Instantiates the handle for the action item
   *
   * @param actionBarDescriptor
   */
  function invokeActionBarItemHandler( actionBarDescriptor )
  {
    setSelectedItem( actionBarDescriptor.id, true );

    actionBarDescriptor.invoke();

  }

  /**
   * Launches widget handler class
   * @param vwActionBarBarDescriptor
   */
  async function launchWidgetHandler( vwActionBarBarDescriptor )
  {
    let widgetHandlerClass;

    if ( vwActionBarBarDescriptor.widgetHandlerModule )
    {
      widgetHandlerClass = await VwClass.forModule( vwActionBarBarDescriptor.widgetHandlerModule );
    }
    else
    {
      widgetHandlerClass = VwClass.forName( vwActionBarBarDescriptor.widgetHandlerClass );
    }

    vwActionBarBarDescriptor.actionClass = widgetHandlerClass;
    
    const constructor = widgetHandlerClass.getConstructor();
    const objWidget = constructor.newInstance( [ACTION_BAR_ID + "_" + vwActionBarBarDescriptor.id, self, vwActionBarBarDescriptor] );

    vwActionBarBarDescriptor.handlerInstance = objWidget;
  }


  /**
   * Handles a action bar item hover
   * @param event
   */
  function handleActionBarItemImgHover( event )
  {
    const actionHoverElement = $( "#" + event.currentTarget.id );
    const actionItem = m_mapActionBarDescriptors.get( event.currentTarget.id );

    const strCssSelected = getCssSelected( actionItem );

    // ignore hover change if this is the select item
    if ( $( actionHoverElement ).hasClass( strCssSelected ) )
    {
      return;

    }

    if ( event.type == "mouseenter" )
    {
      showImage( actionHoverElement, false );
    }
    else
    {
      showImage( actionHoverElement, true );
    }

  }

  /**
   * Displays either the first or second image
   *
   * @param actionElement The action element to update
   *
   * @param fFirst If true displays the first image which is the unselected / non hovered image else
   * displays the second image which is the hovered/selected image
   */
  function showImage( actionElement, fFirst )
  {
    if ( fFirst )
    {
      actionElement.find( "img:first" ).show();
      actionElement.find( "img:last" ).hide();
    }
    else
    {
      actionElement.find( "img:first" ).hide();
      actionElement.find( "img:last" ).show();
    }

  }

  /**
   * Determins text orientation to icon
   * @param vwActionBarBarDescriptor
   * @returns {boolean}
   */
  function textOnTop( vwActionBarBarDescriptor )
  {
    if ( !vwActionBarBarDescriptor.textO )
    {
      return m_strTextOrientation == "top"; // Top is default if not defined
    }

    return vwActionBarBarDescriptor.textO == "top";

  }


  /**
   * Build an image element
   * @returns {*|jQuery}
   */
  function buildImgElement( vwActionBarBarDescriptor )
  {
    const objAttr = {};
    objAttr.src = vwActionBarBarDescriptor.img;

    if ( vwActionBarBarDescriptor.imgTitle )
    {
      objAttr.title = vwActionBarBarDescriptor.imgTitle;
    }

    const imgEl = $( "<img>" ).attr( objAttr );

    if ( vwActionBarBarDescriptor.tooltip )
    {
      imgEl.attr( "tooltip", vwActionBarBarDescriptor.tooltip );
    }

    imgEl.attr( "id", vwActionBarBarDescriptor.id ).addClass( getCssImg( vwActionBarBarDescriptor ) ).addClass( "VwCursorPointer" );

    return imgEl;
  }


  /**
   * Build a P text element
   * @returns {*|jQuery}
   */
  function buildPElement( vwActionBarBarDescriptor )
  {
    return $( "<p>" ).html( vwActionBarBarDescriptor.text ).addClass( getCssText( vwActionBarBarDescriptor ) );
  }


  /**
   * Returns the currently selected action item
   * @returns {*}
   */
  function getSelectedItem()
  {
    return m_selActionBarItem;
  }

  /**
   * Returns the previously selected action item
   * @returns {*}
   */
  function getPrevSelectedItem()
  {
    return m_prevSelActionBarItem;
  }

  /**
   * Puts an object instance into cache
   * @param strId
   * @param objInstance
   */
  function putPersistence( strId, objInstance )
  {
    m_mapInstancesById.put( strId, objInstance );
  }

  /**
   * Puts an object instance into cache
   * @param strId
   */
  function getPersistence( strId )
  {
    return m_mapInstancesById.get( strId );
  }


} // end VwActionBar{}

VwActionBar.VW_ACTION_BAR_HANDLER_CLOSED = "vwActionBarHandlerClosed";


export default VwActionBar;