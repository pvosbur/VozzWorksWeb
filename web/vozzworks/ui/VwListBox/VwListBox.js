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


import VwHashMap from "../../util/VwHashMap/VwHashMap.js";
import VwUtils from "../../util/VwUtils/VwUtils.js";
import VwUiUtils from "../VwCommon/VwUiUtils.js";
import VwElementSelectionHandler from "../VwCommon/VwElementSelectionHandler.js";
import VwExString from "../../util/VwExString/VwExString.js";
import VwScrollBar from "../VwScrollBar/VwScrollBar.js";
import {VwClass} from "../../util/VwReflection/VwReflection.js";


VwCssImport( "/vozzworks/ui/VwListBox/style");

/**
 * ListBox object that provides a styled scrollable list. The list items can contain icon images and check boxes to the left of the item text.
 * NOTE!! If no class is specified on the list box tag then the VwListBox class defined in the style.css is used
 *
 * @param strParentId  The id of the html element holding the list content or null its a popup
 * @param aObjectList an optional array  objects to initialize the list box
 * @param listBoxProps Any additional object properties -- The following lists the available properties:
 * <br>  resourceMgr: A VwPropertyMgr instance to handle ii18n locales. Text items that start with a i18n_ (double at sign) are assumed to be property keys
 * <br>  idProp The property on the object that represents a unique id, if null a numeric sequence is assigned in the order added
 * <br>  idDisplayProp: The property on the object that represents the text to display in the list if no htmlListItemTemplate is specified
 * <br>  idImgProp The property on the object that represents the icon image to display in the list if no htmlListItemTemplate is specified
 * <br>  idCheckProp The property on the object that represents a boolean value for a checkbox if no htmlListItemTemplate is specified. This creates a checkbox before the item text
 * <br>  imgSrc: a url to an image that will be on all list items
 * <br>  textPlacement: "r" = place text to right of image (the default), "l" place text to left of image - This only matters when both text and img properties are specified
 * <br>  htmlListItemTemplate: An html list item template that will be used for each list box item.
 * <br>  showBubble:Boolean:Optional If true shows the bubble (default is an up arrow). The default is false
 * <br>  bubbleSize:String:Optional The size of the bubble. may be in px, ems The default is 10px
 * <br>  bubbleColor:String:Optional The color of the bubble The default is a light blue
 * <br>  multSel if true the list box allows multiple selections, the default is false
 * <br>  cssImageItem: A CSS class name applied to an item img if an htmlListItemTemplate is not specified. The default is VwListImg defined in style.css
 * <br>  cssTextItem:= A CSS class name applied to a item text if an htmlListItemTemplate is not specified. The default is VwListText defined in style.css
 * <br>  cssCheckItem:= A CSS class name applied to a checkbox if an htmlListItemTemplate is not specified. The default is VwListText defined in style.css
 * <br>  cssListItem:= A CSS class name applied to a each list item div if specified
 * <br>  cssItemSelected: The css class that is applied when an item is selected. The default is VwItemSelected.
 * <br>  cssItemSeparator: A CSS class name that will be used for an item separator div instead of item spacing
 * <br>  cssItemHover: The css class that is applied when an item is hovered. The default is VwItemHover.
 * <br>  cssInnerWrap: The css class that is applied to the inner wrap DIV element.
 * <br>  cssLabel: The css class to use for the label. If omitted, no class wil be used
 * <br>  sizeToWidest: if true, list box width will be sized to the widest text item
 * <br>  width: The width of the listbox may be number 12 (defaults to px) 12px, 1em -- any allowable css unit. If specified this overrides any width specified in a class.
 * <br>  height: The height of the listbox may be number 50 (defaults to px) 50px, 1em -- any allowable css unit. If specified this overrides any height specified in a class.
 * <br>  ignoreHover: if true, do not apply background color change
 * <br>  ignoreSelection: if true, do not send click events or change background color, This is typical when using checkbox controls or list items that have their own ui feedback
 * <br>  checkSelectedItem if true use a VwCheckBox instead of html input checkbox. The following properties can be used with the vwCheckbox:
 * <br>  srcArrow: If an arrow image src url is provided then it will be added at the top of the list box.
 * <br>  cssSrcArrow: Css class to be added to the srcArrow img element.
 * <br>  cssCheckBox: The css class to use for the checkbox, if omitted the VwCheckBox is used
 * <br>  checkImgUrl: The url to the image displayed in the checked state. If omitted, the "/images/icons/x_mark_black.png" is applied
 * <br>  cssCheckBoxImg: the class to use for the check image. If omitted, the VwCheckBoxImg class is used
 * <br>  label: The text label to be used with the check box. If the label is clicked on, it toggles the checkbox state
 * <br>  placement: The label placement position to the check box. "r" label to the right, "l" label to the left. Default is "r"
 * <br>  disableScrollbars: Boolean. If true custom scrollbars will not show
 * <br>  checkboxClick: Callback handler whenever a checkbox is clicked.
 *
 * @constructor
 */
function VwListBox( strParentId, aObjectList, listBoxProps )
{
  if ( arguments.length == 0 )
  {
    return;

  }
  const self = this;
  const m_afnMouseOutHandlers = [];
  const m_afnMouseOverHandlers = [];
  const m_mapListItems = new VwHashMap();
  const m_listBoxProps = configProperties();
  const m_resourceMgr = m_listBoxProps.resourceMgr

  let   m_aObjectList = [];
  let   m_parentDivEl;
  let   m_strParentId;
  let   LISTBOX_DATA_CONTAINER_ID;
  let   m_vertScrollBar;
  let   m_HorzScrollBar;

  let   m_nSeqId = -1;
  let   m_afnClickHandlers = [];
  let   m_afnItemChangeHandlers = [];
  let   m_fnDeferSelChangeHandler;
  let   m_strPrevItemIdSelected = null;
  let   m_strCurItemIdSelected = null;
  let   m_elementSelHandler = null;
  let   m_bDeferredHandlerInvoked = false;
  let   m_bIsShowing = false;
  let   m_nKeySelNdx = -1;
  let   m_strCurKeyPressChar;
  let   m_aKeyPresElements;
  let   m_offsetListBox;

  // public methods
  this.addObject = addObject;
  this.addObjects = addObjects;
  this.addListItem = addListItem;
  this.add = addObject;
  this.addAll = addObjects;

  this.click = click;
  this.clear = clear;
  this.clearSelections = clearSelections;
  this.close = close;

  this.deferSelectionChange = deferSelectionChange;

  this.getObjects = getObjects;
  this.getSelectedItem = getSelectedItem;
  this.getSelectedItems = getSelectedItems;
  this.getInnerParentId = getInnerParentId;
  this.getListItemsMap = getListItemsMap;
  this.getItemById = getItemById;
  this.getDataContainerId = getDataContainerId;

  this.hasItemKey = hasItemKey;
  this.hide = hide;

  this.itemChange = itemChange;
  this.isOpen = isListboxOpen;

  this.mouseOver = mouseOver;
  this.mouseOut = mouseOut;

  this.refresh = refresh;
  this.remove = removeObject;
  this.removeById = removeById;
  this.removeByElementId = removeByElementId;
  this.removeByRowNbr = removeByRowNbr;

  this.show = show;
  this.setListHeight = setListHeight;
  this.setSelectedItem = setSelectedItem;
  this.setSelectedItemById = setSelectedItemById;
  this.setSelectedIndex = setSelectedIndex;
  this.size = size;

  this.toggle = toggle;
  this.width = width;
  this.height = height;
  this.getVertScrollBar = () => m_vertScrollBar;
  this.getHorzScrollBar = () => m_HorzScrollBar;
  this.focus = () => $("#" + LISTBOX_DATA_CONTAINER_ID).focus();
  
  // Begin configObject
  setup();

  /**
   * Setup listbox
   */
  function setup()
  {

    if (!strParentId ) // this is a popup
    {
      m_strParentId = "popup_scrollableElements";
      LISTBOX_DATA_CONTAINER_ID = m_strParentId;
      m_parentDivEl = $("<div>").attr( "id", LISTBOX_DATA_CONTAINER_ID ).addClass( m_listBoxProps.cssListBox );
      $(m_parentDivEl).attr( "style", "position:absolute;overflow:hidden;display:none;" );
      $("body").append( m_parentDivEl );
    }
    else
    {
      m_strParentId = strParentId;
      LISTBOX_DATA_CONTAINER_ID = m_strParentId + "_scrollableElements";
      m_parentDivEl = $( "#" + m_strParentId );
      $(m_parentDivEl).attr( "style", "overflow:hidden" );
      m_parentDivEl.append( $("<div>").attr( "id", LISTBOX_DATA_CONTAINER_ID ).addClass( m_listBoxProps.cssListBox ) );

    }

    if ( m_listBoxProps.width )
    {
      m_parentDivEl.css( "width", m_listBoxProps.width + 2 );
    }

    if ( m_listBoxProps.height )
    {
      m_parentDivEl.css( "height", m_listBoxProps.height + 2 );
    }

    if ( aObjectList )
    {
      addObjects( aObjectList );
    }

    if ( m_listBoxProps.ignoreSelection )
    {
      $( "#" + m_strParentId ).css( "cursor", "default" );
    }

    if ( m_listBoxProps.calculateListHeight )
    {
      calculateListHeight( makeListId( m_aObjectList[0] ), aObjectList.length );
    }

    if ( m_listBoxProps.dropDownWidth == "widest" )
    {
      calculateListWidth();
    }

    if ( m_listBoxProps.orientation == "horizontal" )
    {
      m_HorzScrollBar = new VwScrollBar( LISTBOX_DATA_CONTAINER_ID, {orientation:"horz", cssScrollParent:"VwHorizontalList"} );

    }
    else
    {
      m_vertScrollBar = new VwScrollBar( LISTBOX_DATA_CONTAINER_ID, {orientation: "vert"} );

      if ( !m_listBoxProps.noHorzScroll )
      {
        m_HorzScrollBar = new VwScrollBar( LISTBOX_DATA_CONTAINER_ID, {orientation: "horz"} );
      }
    }

    if ( m_listBoxProps.selectOnKeyPress && !m_listBoxProps.deferKeyPressTillShow)
    {
      setupKeyboardSelectionHandler();
    }
  }

  /**
   * Select and scroll to item in list box that starts with the keystrok character
   */
  function setupKeyboardSelectionHandler()
  {
    m_offsetListBox = $("#" + strParentId).offset();
    // Instal jquery custom selector
    $.expr[":"].startsWith = $.expr.createPseudo( (arg ) =>
                                                  {
                                                    return (elem) =>
                                                    {
                                                      if ( $(elem).text().charAt( 0 ).toLowerCase() == arg.toLowerCase() )
                                                      {

                                                        return elem;
                                                      }
                                                    }
                                                  });

    $("#" + LISTBOX_DATA_CONTAINER_ID).attr( "tabindex", "0")
    $( "#" + LISTBOX_DATA_CONTAINER_ID ).keydown( (event ) =>
    {
      selectKeyPressItem( event.key );
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    });

  }

  function selectKeyPressItem( strKeyHit )
  {
    // if new keypress char get new result set for items matching thr first character
    if ( strKeyHit != m_strCurKeyPressChar )
    {
      m_aKeyPresElements = $("#" + LISTBOX_DATA_CONTAINER_ID + " span:startsWith('" + strKeyHit + "')" );

      if ( m_aKeyPresElements.length == 0 )
      {
        m_strCurKeyPressChar = "";
        return;
      }
      else
      {
        m_nKeySelNdx = 0;
      }

      m_strCurKeyPressChar = strKeyHit;

    }
    else
    {
      ++m_nKeySelNdx;
      if ( m_nKeySelNdx >= m_aKeyPresElements.length )
      {
        m_nKeySelNdx = 0;
      }
    }

    moveElementInView();


  } // end selectKeyPressItem()

  
  /**
   * Select the item and scroll to the item if necessry
   */
  function moveElementInView()
  {
    const eleSelected = m_aKeyPresElements[m_nKeySelNdx];

    let strItemId = $( eleSelected ).attr( "id" );

    if ( !strItemId )
    {
      strItemId = $( eleSelected ).parent().attr( "id" );
    }
    
    if ( !strItemId )
    {
      return;
    }


    const nItemHeight = $( eleSelected ).height() + 2;

    const offsetElement = $( eleSelected ).offset();

    const nLbBottom = m_offsetListBox.top + $("#" + strParentId ).height();

    // Is elemement currently in view
    if ( offsetElement.top < m_offsetListBox.top || offsetElement.top >= nLbBottom )
    {
      // element no in view -- scroll yo element
      let nThumbPos = offsetElement.top - m_vertScrollBar.getThumbHeight();
      m_vertScrollBar.setThumbPos( nThumbPos );

      // lopp adjusting scrollbar until item is in view
      while( true )
      {
        const offsetElement = $( eleSelected ).offset();

        if ( offsetElement.top >= m_offsetListBox.top && (offsetElement.top + nItemHeight) < nLbBottom )
        {
          break;
        }

        if ( offsetElement.top < m_offsetListBox.top )
        {
          --nThumbPos;

        }
        else
        {
          ++nThumbPos;
        }

        m_vertScrollBar.setThumbPos( nThumbPos );


      } // end while()

    }

    const event = {};
    event.currentTarget = {};
    event.currentTarget.id = strItemId;

    itemClicked( event, true );

    

  } // end moveElementInView()


  /**
   * Calculates the listbox height
   */
  function calculateListHeight( strItemId, nItemsLength )
  {

    // Execute on vertical orientation only
    if ( m_listBoxProps.orientation != "vertical" )
    {
      return;
    }

    const nItemHeight = $( "#" + strItemId ).outerHeight( true );

    const nComboListHeight = nItemHeight * nItemsLength;

    const nWindowHeight = $( window ).height();

    let  nListHeight = 0;

    if ( nComboListHeight > nWindowHeight )
    {
      nListHeight = nWindowHeight;
    }
    else
    {
      nListHeight = nComboListHeight;
    }

    $( "#" + m_strParentId ).css( {"max-height": nListHeight, "height": nListHeight} );

  }

  /**
   * FInds the widest item in the list
   * @returns {number}
   */
  function calculateListWidth()
  {
    let nMaxWidth = 0;
    let nStringWidth = 0;

    for ( let x = 0; x < m_aObjectList.length; x++ )
    {
      const strItemId =  makeListId( m_aObjectList[ x ] );

      if ( $("#" + strItemId ).width() > nMaxWidth )
      {
        nMaxWidth = nStringWidth;
      }

    } // end for()


    return nMaxWidth;

  }


  function size()
  {
    return m_aObjectList.length;
  }


  /**
   * Returns current width of the listbox
   */
  function width()
  {
    return $( m_parentDivEl ).width();
  }


  /**
   * Returns current height of the listbox
   */
  function height()
  {
    return $( m_parentDivEl ).height();

  }

  /**
   * Show the listbox at the x,y pos specified
   *
   * @param nXpos The left position
   * @param nYpos The Y position
   */
  function show( nXpos,  nYpos )
  {
    
    const objCss = {};

    if ( nYpos )
    {
      objCss.top = nYpos;
    }

    if ( nXpos )
    {
      objCss.left = nXpos;
    }

    $("#" + m_strParentId ).show();

    $( "#" + m_strParentId ).css( objCss );

    refresh();
    m_bIsShowing = true;


    // Scrollbars need to be resized when shown
    if ( m_vertScrollBar )
    {
      m_vertScrollBar.resize( -1, $( "#" + m_strParentId ).height() );
    }

    if ( m_HorzScrollBar )
    {
      m_HorzScrollBar.resize( $( "#" + m_strParentId ).width(), -1 );
    }

    if ( m_listBoxProps.selectOnKeyPress )
    {
      m_nKeySelNdx = -1;
      m_strCurKeyPressChar = "";
      setupKeyboardSelectionHandler();
    }
  }

  /**
   * Handle hide the list box
   */
  function hide()
  {
    $( "#" + m_strParentId ).hide();
    m_bIsShowing = false;
  }

  /**
   * Handles showing or hiding the listbox
   *
   * @param objPos  Object with top and left positions
   */
  function toggle( objPos )
  {
    if ( m_bIsShowing )
    {
      hide();
    }
    else
    {
      show( objPos );
    }

  }

  /**
   * Returns boolean whether the listbox is open or not
   * @returns {boolean}
   */
  function isListboxOpen()
  {
    return m_bIsShowing;
  }

  /**
   * Setup the default listbox properties
   * @param objListboxProperties User properties for this listbox
   */
  function configProperties()
  {

    // Setup the defaults

    const lbProps = {};
    
    lbProps.cssListBox = "VwListBox";
    lbProps.cssItemSelected = "VwItemSelected";
    lbProps.cssItemHover = "VwItemHover";
    lbProps.cssListItem = "VwListItem";
    lbProps.orientation = "vertical";
    lbProps.multSel = false;

    if (!lbProps.textPlacement )
    {
      lbProps.textPlacement = "r";
    }

    lbProps.defaultForNull = "";
    lbProps.sizeToWidestItem = true;
    lbProps.checkImgUrl = "vozzworks/ui/images/vw_black_checkmark.png";
    lbProps.displayType = "flex";

    //todo -- m_objProperties.calculateListHeight = true;
    lbProps.invokeClickOnSelectedItem = true;

    lbProps.cssImageItem = "VwListImg";
    lbProps.cssTextItem = "VwListText";
    lbProps.cssCheckItem = "VwCheckBox";


    // Add in any user properties if specified
    $.extend( lbProps, listBoxProps );

    if ( lbProps.orientation == "horizontal" )
    {
      lbProps.cssInnerWrap = "VwHorizontalList";
    }

    if ( lbProps.idCheckProp )
    {
      if ( typeof lbProps.ignoreHover == "undefined" )
      {
        lbProps.ignoreHover = true; // this is the default when using checkboxes if user has not define this property
      }
      if ( typeof lbProps.ignoreSelected == "undefined" )
      {
        lbProps.ignoreSelection = true; // this is the default when using checkboxes if user has not define this property
      }
    }

    return lbProps;

  }


  /**
   * Determines if an item id is in the list
   *
   * @param strItemId The object item id to test
   *
   * @return {boolean} return if item id is in the list, false otherwise
   */
  function hasItemKey( strItemId )
  {
    const strCanonItemId = m_strParentId + "_" + strItemId;

    return m_mapListItems.containsKey( strCanonItemId );

  }


  /**
   * Adds an object to the list
   * @param objItem   The object to add to the listbox
   * @param strHtmlListItemTemplate The listbox item templte to use if specified
   */
  function addListItem( objItem, strHtmlListItemTemplate, fnClickHandler )
  {

    // check to see if global htmlListItemTemplate was specified

    if ( !strHtmlListItemTemplate )
    {
      strHtmlListItemTemplate = m_listBoxProps.htmlListItemTemplate;
    }

    m_aObjectList.push( objItem );

    ++m_nSeqId;

    const strItemId = makeListId( objItem );

    m_mapListItems.put( strItemId, new VwListItem( strItemId, objItem, strHtmlListItemTemplate, fnClickHandler ) );

    let strDivListItem = null;

    // Default template if none specified by user
    if ( !strHtmlListItemTemplate )
    {
      setupNonTemplateListItem( objItem, strItemId );
    }
    else
    {
      strDivListItem = `<div id="${strItemId}">`;

      let objParams = {};

      if ( m_listBoxProps.idDisplayProp == "self" )
      {
        objParams.self = objItem;
      }
      else
      {
        objParams = objItem;
      }

      if ( m_listBoxProps.idProp == "VwSeq" )
      {
        objParams.VwSeq = m_nSeqId;
      }

      strDivListItem += VwExString.expandMacros( strHtmlListItemTemplate, objParams, m_listBoxProps.defaultForNull );
      strDivListItem += "</div>";

      $( "#" + LISTBOX_DATA_CONTAINER_ID ).append( strDivListItem );

      $( "#" + strItemId ).addClass( m_listBoxProps.cssListItem );


    }

    installActions( strItemId );

    let strSelectionHandlerId = m_strParentId;

    // Add item separator div if css property is defined
    if ( m_listBoxProps.cssItemSeparator )
    {
      $( "#" + LISTBOX_DATA_CONTAINER_ID ).append( "<div class='" + m_listBoxProps.cssItemSeparator + "'/>" );

      strSelectionHandlerId = LISTBOX_DATA_CONTAINER_ID;
    }

    if ( m_aObjectList.length == 1 )
    {
      m_elementSelHandler = new VwElementSelectionHandler( strSelectionHandlerId, m_listBoxProps.multSel, m_listBoxProps.cssItemHover, m_listBoxProps.cssItemSelected );
    }


  } // end addListItem()


  /**
   * Setup a non template list item
   *
   * @param objItem The object that the list item is created from
   * @param strListItemId The id of the list item
   */
  function setupNonTemplateListItem( objItem, strListItemId )
  {

    const htmlDivListItemEle = $( "<div>" ).attr( {
                                                  "id"         : strListItemId,
                                                  "data-rowNbr": m_nSeqId
                                                } ).css( "white-space", "nowrap" ).addClass( m_listBoxProps.cssListItem );

    $( "#" + LISTBOX_DATA_CONTAINER_ID ).append( htmlDivListItemEle );

    if ( m_listBoxProps.fnCheckBox )
    {
      createCheckBox( htmlDivListItemEle, objItem );
    }
    else
    {
      doStandardListBoxEntry( htmlDivListItemEle, objItem );
    }



  }

  /**
   * The parent dom element object
   * @param parentEle The parent DOM element object
   * @param lbEntry   The users listbox data
   */
  async function createCheckBox( parentEle, lbEntry )
  {
    let fChecked;

    if ( m_listBoxProps.idCheckProp || m_listBoxProps.checkSelectedItem )
    {
      if ( m_listBoxProps.idCheckProp )
      {
        fChecked = lbEntry[m_listBoxProps.idCheckProp];

        if ( !typeof m_listBoxProps.idCheckProp == "boolean" )
        {
          fChecked = new Boolean( fChecked );
        }
      }

    }

    const checkBoxProps = {};
    checkBoxProps.label = VwUtils.getObjProperty( lbEntry, m_listBoxProps.idDisplayProp );
    checkBoxProps.color = m_listBoxProps.color;
    checkBoxProps.fnCheckboxClickHandler = m_listBoxProps.fnCheckboxClickHandler;
    checkBoxProps.idCheckProp = m_listBoxProps.idCheckProp;

    let checkBoxClass;

    if ( listBoxProps.fnCheckBox.endsWith( ".js") )
    {
      checkBoxClass = await VwClass.forModule( listBoxProps.fnCheckBox )
    }
    else
    {
      checkBoxClass = VwClass.forName( listBoxProps.fnCheckBox );
    }
    const constructor = checkBoxClass.getConstructor();

    const strParentId = $( parentEle ).attr( "id") ;
    const checkBox = constructor.newInstance( [ strParentId, fChecked, checkBoxProps, lbEntry ] );

    if ( checkBoxProps.fnCheckboxClickHandler )
    {
      checkBox.click( checkBoxProps.fnCheckboxClickHandler );
    }


  }


  /**
   * Formats a listbox entry from img, text or both
   * @param parentEle The parent DOM element object
   * @param lbEntry   The users listbox data
   */
  function doStandardListBoxEntry( parentEle, lbEntry )
  {
    // If an icon was specified that gets added first
    let htmlImgEle;

    if ( m_listBoxProps.idImgProp || m_listBoxProps.imgSrc )
    {
      let strSrc = null;

      if ( m_listBoxProps.idImgProp )
      {
        strSrc = lbEntry[m_listBoxProps.idImgProp];
      }
      else
      {
        strSrc = m_listBoxProps.imgSrc;
      }

      htmlImgEle = $( "<img>" ).attr( "src", strSrc ).addClass( m_listBoxProps.cssImageItem );
      parentEle.append( htmlImgEle );
    }


    let strListText;

    let strDisplayProp = "display";

    if ( m_listBoxProps.idDisplayProp )
    {
      strDisplayProp = m_listBoxProps.idDisplayProp;

    }

    // Get text from object property if the idDisplayProp was defined

    strListText = lbEntry[strDisplayProp];

    // If no idDisplayProp was specified and no idImgProp was specified, assume item text is the object

    if ( strListText == null && !m_listBoxProps.idImgProp )
    {
      strListText = lbEntry;
    }

    let htmlTextEle;

    if ( strListText )
    {
      strListText = VwExString.getValue( m_resourceMgr, strListText );

      htmlTextEle = $( "<span>" ).addClass( m_listBoxProps.cssTextItem ).text( strListText );

      if (m_listBoxProps.textPlacement == "l")
      {
        parentEle.prepend( htmlTextEle );
      }
      else
      {
        parentEle.append( htmlTextEle );
      }


    }

  }


  /**
   * Makes the unique list id from the object id or sequence nbr
   * @param objListItem
   * @returns {string}
   */
  function makeListId( objListItem )
  {

    let  strListId = m_strParentId + "_";

    if ( m_listBoxProps.idProp )
    {
      if ( m_listBoxProps.idProp == "VwSeq" )
      {
        strListId += getObjNdx( objListItem );
      }
      else
      {
        strListId +=  VwUtils.getObjProperty(objListItem, m_listBoxProps.idProp );
      }
    }
    else
    {
      strListId += getObjNdx( objListItem );

    }

    return strListId;

  }

  /**
   * Find the object index in the master list object array
   *
   * @param objToFind The object to find
   * @returns {number} The index of te object in the array, else -1 for not found
   */
  function getObjNdx( objToFind )
  {

    for ( let x = 0, nLen = m_aObjectList.length; x < nLen; x++ )
    {
      if ( m_aObjectList[x] == objToFind )
      {
        return x;
      }

    }

    return -1; // Not found

  }


  /**
   * Install mouse handler actions
   *
   * @param strItemId
   */
  function installActions( strItemId )
  {
    $( "#" + strItemId ).unbind().hover( itemMouseOver, itemMouseOut ).click( itemClicked );
  }



  /**
   * Handler of VwCheckBox item click
   * @param strBtnId
   */
  function vwCheckBoxItemClicked( strBtnId )
  {
    // Recreate list item ID
    itemClicked( {currentTarget: {id: strBtnId}} );
  }

  /**
   * Gets the VwListItem wrapper from the the mouse click id
   * @param event The mouse event
   */
  function itemClicked( event, bIgnoreClickHandler )
  {

    const strSelRowIdId = event.currentTarget.id;


    const vwListItem = m_mapListItems.get( strSelRowIdId );
    let   vwPrevListItem = null;

    if ( m_strPrevItemIdSelected )
    {
      vwPrevListItem = m_mapListItems.get( m_strPrevItemIdSelected );
    }


    if ( m_fnDeferSelChangeHandler && m_strPrevItemIdSelected )
    {


      VwUiUtils.vwClearTextSelection();

      // Just get out if we are still waiting a response from a previous deferred handler call
      if ( m_bDeferredHandlerInvoked )
      {
        return;

      }

      const objListContext = {};
      objListContext.requestedItem = vwListItem;
      objListContext.curItem = vwPrevListItem;
      objListContext.event = event;


      // Call deferred handle
      m_fnDeferSelChangeHandler( objListContext, deferredSelectionProceed );

      return;


    }

    if ( m_bDeferredHandlerInvoked )
    {
      return;

    }

    m_elementSelHandler.elementClicked( event, m_listBoxProps.ignoreSelection );
 
    itemSelected( event, vwListItem, vwPrevListItem, bIgnoreClickHandler );

  }


  /**
   * Called by an object that is granting permission for the listbox to move to the item that was clicked
   *
   * @param objListContext The list context that contains the data to move to the deferred selection
   */
  function deferredSelectionProceed( objListContext )
  {
    m_bDeferredHandlerInvoked = false;

    m_elementSelHandler.elementClicked( objListContext.event, m_listBoxProps.ignoreSelection );

    itemSelected( objListContext.requestedItem, objListContext.curItem );

  }


  /**
   * Internal item selection handler
   *
   * @param event
   * @param vwListItem
   * @param vwPrevListItem
   */
  function itemSelected( event, vwListItem, vwPrevListItem, bIgnoreClickHandler )
  {

    const userListObject = vwListItem.userObj;

    const strItemId = vwListItem.strItemId;

    m_strCurItemIdSelected = strItemId;

    if ( m_listBoxProps.idCheckProp || m_listBoxProps.checkSelectedItem )
    {

      let strCheckMarkId = strItemId + "_chk";

      $( "#" + strCheckMarkId ).css( "visibility", "visible" );

      if ( m_listBoxProps.idCheckProp )
      {
        // update the user's object property the the current chckbox state
        userListObject[m_listBoxProps.idCheckProp] = true;
      }

      if ( vwPrevListItem )
      {
        let strCheckMarkId = vwPrevListItem.strItemId + "_chk";

        $( "#" + strCheckMarkId ).css( "visibility", "hidden" );

        if ( m_listBoxProps.idCheckProp )
        {
          // update the user's object property the the current chckbox state
          userListObject[m_listBoxProps.idCheckProp] = false;
        }

      }
    }

    // Leave here if selection feedback is turned off
    if ( !m_listBoxProps.ignoreSelection && !m_elementSelHandler )
    {

      // Change background to selected color

      $( "#" + strItemId ).addClass( m_listBoxProps.cssItemSelected );

      if ( m_strPrevItemIdSelected != null && m_strPrevItemIdSelected != strItemId )
      {
        $( "#" + m_strPrevItemIdSelected ).removeClass( m_listBoxProps.cssItemSelected );

      }

    }

    // See if item click handler was specified

    const fIsSelected = m_elementSelHandler.isSelected( strItemId );

    if ( vwListItem.fnCallback )
    {
      vwListItem.fnCallback( userListObject, fIsSelected );
      m_strPrevItemIdSelected = strItemId;
    }
    else
    {
      if ( m_afnClickHandlers != null && !bIgnoreClickHandler )
      {
        m_strPrevItemIdSelected = strItemId;

        if ( m_listBoxProps.invokeClickOnSelectedItem )
        {
          for ( let x = 0, nLen = m_afnClickHandlers.length; x < nLen; x++ )
          {
            m_afnClickHandlers[x]( userListObject, fIsSelected );
          }
        }

      }
    } // end else

    // fire any itemChange event handlers

    for ( let x = 0, nLen = m_afnItemChangeHandlers.length; x < nLen; x++ )
    {
      m_afnItemChangeHandlers[x]( userListObject, vwPrevListItem ? vwPrevListItem.userObj : null );
    }

  }


  /**
   * Handle mouse over event
   * @param event The mouse event
   */
  function itemMouseOver( event )
  {
    if ( m_listBoxProps.ignoreHover )
    {
      return;
    }

    const strItemId = event.currentTarget.id;

    const vwListItem = m_mapListItems.get( strItemId );


    if ( m_strCurItemIdSelected != strItemId )
    {
      $( "#" + strItemId ).addClass( m_listBoxProps.cssItemHover );

      for ( let x = 0, nLen = m_afnMouseOverHandlers.length; x < nLen; x++ )
      {
        m_afnMouseOverHandlers[x]( vwListItem );
      }
    }

  }


  /**
   * Handle Mouseout handler
   *
   * @param event The mouse event
   */
  function itemMouseOut( event )
  {

    if ( m_listBoxProps.ignoreHover )
    {
      return;
    }

    const strItemId = event.currentTarget.id;

    const vwListItem = m_mapListItems.get( strItemId );

    if ( m_strCurItemIdSelected != strItemId )
    {
      $( "#" + strItemId ).removeClass( m_listBoxProps.cssItemHover );

    }

    for ( let x = 0, nLen = m_afnMouseOutHandlers.length; x < nLen; x++ )
    {

      m_afnMouseOutHandlers[x]( vwListItem );
    }

  } // end itemMouseOut()


  /**
   * Internal user object wrapper
   * @param strItemId The item id
   * @param userObj The user object
   * @param strHtmlItemTemplate the html item template for this object
   * @param fnCallBack The call back
   * @constructor
   */
  function VwListItem( strItemId, userObj, strHtmlItemTemplate, fnCallBack )
  {
    this.strItemId = strItemId;
    this.userObj = userObj;
    this.htmlItemTemplate = strHtmlItemTemplate;
    this.fnCallback = fnCallBack;
  }



  /**
   * The inner DIV element that contains the listbox data
   * @returns {*|jQuery}
   */
  function getInnerDivEl()
  {
    return $( "<div>" ).attr( "id", LISTBOX_DATA_CONTAINER_ID ).addClass( CUSTOM_SCROLL_INNER_CLASS ).addClass( m_listBoxProps.cssInnerWrap );
  }

  /**
   * Set the list height
   * @param nNewHeight
   */
  function setListHeight( nNewHeight )
  {
    $( "#" + m_strParentId ).height( nNewHeight );
  }


  /**
   * Adds a list item click callback handler
   * @param fnClickHandler The callback function
   */
  function click( fnClickHandler )
  {
    if ( !existHandler( m_afnClickHandlers, fnClickHandler ) )
    {
      m_afnClickHandlers.push( fnClickHandler );
    }
  }


  /**
   * Re-installs the listbox actions.
   */
  function refresh()
  {
    const astrKeys = m_mapListItems.keys();

    for ( let x = 0, nLen = astrKeys.length; x < nLen; x++ )
    {
      installActions( astrKeys[x] );
    }

  }


  /**
   * Select and item in the list box
   *
   * @param nIndex The index of the item id to select
   */
  function setSelectedIndex( nIndex )
  {

    const listItem = m_aObjectList[nIndex];
    self.setSelectedItem( listItem );

  }


  /**
   * Adds an item change event handler. This is fired any time an item is clicked but unlike the click event,
   * this passes the current and the previous selected items
   *
   * @param fnItemChangeHandler The callback function
   */
  function itemChange( fnItemChangeHandler )
  {
    if ( !existHandler( m_afnItemChangeHandlers, fnItemChangeHandler ) )
    {
      m_afnItemChangeHandlers.push( fnItemChangeHandler );
    }
  }


  /**
   * Allows the list item click event to be deferred until the event listener gives permission to accept the
   * newly clicked item. This is useful when the listbox is used as a navigation list and you want to validate data
   * on a current form/view before allowing the listbox to change to the newly clicked item.
   *
   * @param fnDeferSelChangeHandler The event handler NOTE! Only one handler is allow per listbox instance. Use a null to clear current handler.
   */
  function deferSelectionChange( fnDeferSelChangeHandler )
  {

    if ( m_fnDeferSelChangeHandler && fnDeferSelChangeHandler )
    {
      throw "A handler has already been defined for this instance. Only one deferSelectionChange is allowed per instance";
    }

    m_fnDeferSelChangeHandler = fnDeferSelChangeHandler;
  }


  /**
   * Adds a mouse over event handler
   * @param fnMouseOverHandler The callback function
   */
  function mouseOver( fnMouseOverHandler )
  {
    if ( !existHandler( m_afnMouseOverHandlers, fnMouseOverHandler ) )
    {
      m_afnMouseOverHandlers.push( fnMouseOverHandler );
    }

  }


  /**
   * Adds a mouseout event handler
   * @param fnMouseOutHandler The callvack function
   */
  function mouseOut( fnMouseOutHandler )
  {
    if ( !existHandler( m_afnMouseOutHandlers, fnMouseOutHandler ) )
    {
      m_afnMouseOutHandlers.push( fnMouseOutHandler );
    }

  }


  /**
   * Returns the object list (if this list was created from objects and not VwListItems
   * @return {null}
   */
  function getObjects()
  {
    return m_aObjectList;
  }


  /**
   * Removes all objects from the list
   */
  function clear()
  {
    m_nSeqId = -1;
    
    if ( m_listBoxProps.disableScrollbars )
    {
      $( "#" + m_strParentId ).empty();
    }
    else
    {
      $( "#" + LISTBOX_DATA_CONTAINER_ID ).empty();
    }

    m_mapListItems.clear();

    m_aObjectList = [];

    if ( m_elementSelHandler )
    {
      m_elementSelHandler.clear();
    }

  }


  /**
   * Clears any currently selected items
   */
  function clearSelections()
  {
    m_strCurItemIdSelected = m_strPrevItemIdSelected = null;

    m_elementSelHandler.clearSelections( m_listBoxProps.ignoreSelection );

    if ( m_listBoxProps.idCheckProp )
    {
      // uncheck all checkboxs

      const aElements = $( "#" + LISTBOX_DATA_CONTAINER_ID ).children();

      for ( let x = 0, nLen = aElements.length; x < nLen; x++ )
      {

        const strId = "#" + aElements[x].id + "_chk";

        $( strId ).prop( "checked", false );
      }

      for ( let i = 0, nLen = m_aObjectList.length; i < nLen; i++ )
      {
        m_aObjectList[x][m_listBoxProps.idCheckProp] = false;
      }
    }

  }


  /**
   * Select item in the list box
   *
   * @param objSelectedItem The object to select in the list box
   */
  function setSelectedItem( objSelectedItem )
  {
    const strId = makeListId( objSelectedItem );

    const event = {};

    event.currentTarget = {};

    event.currentTarget.id = strId;

    itemClicked( event );

  }

  /**
   * Closes/removes list box
   */
  function close()
  {
    $("#" + m_strParentId).remove();

  } // end close()


  /**
   * Return the selected item (may be null )
   * @returns {*}
   */
  function getSelectedItem()
  {
    const aSelIds = m_elementSelHandler.getSelectedElementIds();

    if ( !aSelIds )
    {
      return null;

    }

    const aSelItems = [];

    for ( let x = 0, nLen = aSelIds.length; x < nLen; x++ )
    {
      const vwListItem = m_mapListItems.get( aSelIds[x] );

      aSelItems.push( vwListItem.userObj );

    }

    return aSelItems;


  }


  /**
   * Returns an array of selected items
   * @returns {Array}
   */
  function getSelectedItems()
  {
    const aSelIds = m_elementSelHandler.getSelectedElementIds();

    if ( !aSelIds )
    {
      return null;

    }

    const aSelItems = [];

    for ( let x = 0, nLen = aSelIds.length; x < nLen; x++ )
    {
      let vwListItem = m_mapListItems.get( aSelIds[x] );

      aSelItems.push( vwListItem.userObj );

    }

    return aSelItems;

  }


  /**
   * Selects the list box item by the object id
   * @param strObjId
   */
  function setSelectedItemById( strObjId )
  {
    const strItemId = m_strParentId + "_" + strObjId;

    const vwListObj = m_mapListItems.get( strItemId );

    m_elementSelHandler.setSelectedElementId( strItemId );

    self.setSelectedItem( vwListObj.userObj );

  }


  /**
   * Adds the array of objects to the list
   */
  function addObjects( aObjectsToAdd )
  {
    for ( const listItem of aObjectsToAdd)
    {
      addListItem( listItem, m_listBoxProps.htmlListItemTemplate );

    } 

    if ( m_listBoxProps.cssItemSeparator )
    {
      $( "." + m_listBoxProps.cssItemSeparator + ":last-child" ).hide();

    }


  }


  /**
   * Adds an object to the list
   *
   * @param objToAdd  The object to add
   * @param strHtmlListItemTemplate The item template to use (optional)
   */
  function addObject( objToAdd, strHtmlListItemTemplate )
  {
    addListItem( objToAdd, strHtmlListItemTemplate );

  }

  /**
   * Removes the object from the list.NOTE this method requires the object id property (3rd constructor parameter be defined)
   *
   * @param objToRemove The object to remove from the list
   */
  function removeObject( objToRemove )
  {

    if ( !m_listBoxProps.idProp)
    {
      alert( "Cannot not remove object because idProp on the listBoxProps was not defined" );
      return;
    }

    const strObjId = objToRemove[m_listBoxProps.idProp];

    const strItemId = m_strParentId + "_" + strObjId;

    $( "#" + strItemId ).remove();

    m_mapListItems.remove( strItemId );

    removeFromObjectList( strItemId )


  }


  /**
   * Removes an item in the list by the row id
   *
   * @param strId  The row id to remove
   */
  function removeById( strId )
  {

    const strItemId = m_strParentId + "_" + strId;

    removeFromObjectList( strItemId )
  }

  /**
   * Removes an item in the list by the DOM element row id
   *
   * @param strElementId  The row id to remove
   */
  function removeByElementId( strElementId )
  {
    removeFromObjectList( strElementId )
  }


  /**
   * Removes a list item by its row number
   * @param nRowNbr
   */
  function removeByRowNbr( nRowNbr )
  {

    const listItems = $( "#" + LISTBOX_DATA_CONTAINER_ID ).children();
    const listItem = listItems[nRowNbr];

    removeFromObjectList( listItem.itemId )
  }


  /**
   * Removes the object and corresponding list item from the list box
   * @param strId The id of the object to remove
   */
  function removeFromObjectList( strId )
  {
    if ( m_aObjectList == null || m_aObjectList.length == 0 )
    {
      return;
    }

    m_elementSelHandler.removeId( strId );


    $( "#" + strId ).remove();

    $( "#" + strId + "_spacer" ).remove();

    m_mapListItems.remove( strId );

    const strObjectId = strId.substring( strId.lastIndexOf( "_") + 1 );

    for ( let x = 0; x < m_aObjectList.length; x++ )
    {
      const obj = m_aObjectList[x];

      if ( obj[m_listBoxProps.idProp] == strObjectId )
      {
        m_aObjectList.splice( x, 1 );
        return;
      }
    }
  }

  /**
   * Test for existence of a callback in the array
   *
   * @param afnHandlers Array of handlers to check
   * @param fnHandler  The handler to check
   */
  function existHandler( afnHandlers, fnHandler )
  {
    for ( let x = 0, nLen = afnHandlers.length; x < nLen; x++ )
    {
      if ( afnHandlers[x] == fnHandler )
      {
        return true; // Handler exists
      }
    }

    return false;

  }

  /**
   * Return the list box inner parent element ID
   * @returns {string}
   */
  function getInnerParentId()
  {
    return LISTBOX_DATA_CONTAINER_ID;
  }

  /**
   * Return the list items hash map
   * @returns {VwHashMap}
   */
  function getListItemsMap()
  {
    return m_mapListItems;
  }

  function getItemById( strId )
  {
    const listItem = m_mapListItems.get( strId );
    return listItem.userObj;

  }

  function getDataContainerId()
  {
    return LISTBOX_DATA_CONTAINER_ID;
  }
  
} // end VwListBox{}

export default VwListBox;

