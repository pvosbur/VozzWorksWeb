
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

import VwUiUtils from "/vozzworks/ui/VwCommon/VwUiUtils.js";
import VwUtils from "/vozzworks/util/VwUtils/VwUtils.js";
import VwExString from "/vozzworks/util/VwExString/VwExString.js";
import VwListBox from "/vozzworks/ui/VwListBox2/VwListBox.js";
import VwUiExitMgr from "/vozzworks/ui/VwCommon/VwUiExitMgr.js";

VwCssImport( "/vozzworks/ui/VwComboBox/style");

/**
 * VwComboBox Constructor
 *
 * @param strParentId The id of the combo box                                                                     m_fZeroIndexNoSelection
 * @param aobjData array of item choices to display, can be any type of object
 * @param m_comboProps Properties to specify. Properties supported and may be overridden:
 *  style:String:Optional The combo box button style must be one of "text,image or image-text". The default is text
 *  firstItem:String:Optional If specified, this value is the first item displayed. It is not part of the data array and is useful to detect when a required selection
 *  has not been made
 *  textDisplayProp:String:Optional The name of the object property that is used to display the combo item text, if omitted the data objects are assumed to be strings
 *  iconDisplayProp:String:Optional The name of the object property that is used to display the icon in the combo button
 *  cssComboBtn:String:Optional  The class name that will be appiled to the combo button, default is.VwComboBtn
 *  cssBtnText:String:Optional The class ="VwComboBtnText" CSS For the button Text
 *  cssBtnTextContainer
 *  cssComboVwComboBtnArrowImg
 *  cssBtnImage ="VwComboBtnIcon" CSS For the button Icon
 *  cssListBox = "VwComboListDropdown VwComboList" CSS for the dropdown list
 *  cssListItem = "VwComboListItem" CSS for the dropdown list item
 *  cssArrow = "VwComboArrow"       CSS for the button arrow
 *  matchDropdownWidth = If true, the dropdown list width will be set to the parent combo box width in pixels
 *  btnArrowImg = "/images/triangle_down_black.png";  The arrow img to use
 *  checkImgUrl = "images/black_checkmark.png";  The check mark img to use
 *  checkMarkSelectedImg = "vozzworks/ui/images/vw_white_checkmark.png";  The check mark selected img to use
 *  cssCheckMark = "VwComboCheckMark";            CSS for the check mark
 *  backgroundColor = "white";                    Background color
 *  textColor = "black";                          Text color
 *  useWhiteArrow:boolean if true use the white down arrow. Default is black arrow
 *  selectedBackgroundColor = "blue";             dropdown selected text background color
 *  selectedTextColor:String = "white";           dropdown selected text color
 *  resourceMgr:VwPropertyMgr - The VwPropertyMgr instance used for resource bundle "i18n" key translation
 *  htmlBtnTemplate = The HTML string or element object to load as HTML.
 *  htmlBtnParentId: Required when htmlBtnTemplate is specified = The HTML parent ID of the htmlBtnTemplate HTML being used.
 *  propKeyPrefix:String The prefix used in string literals to trigger a property bundle lookup if resourceMgr is defined default is "i18n_"
 *
 * @constructor
 */
function  VwComboBox( strParentId, comboListDataModel, comboProps )
{

  if ( arguments.length == 0 )
  {
    return; // This is the prototype call
  }

  const self = this;

  const COMBO_BTN_IMG_ID = "vwSelItemImg_" + strParentId;
  const COMBO_BTN_ARROW_ID = "vwSelItemArrow_" + strParentId;
  const m_strIdProp = comboListDataModel.getIdProp();
  const m_comboProps = configProps();

  let m_uiExitMgr;

  let   COMBO_BTN_ID = m_comboProps.comboBtnId;
  let   COMBO_LIST_ID = `${strParentId}_comboBoxListBox`;

  let   COMBO_BTN_TXT_ID = m_comboProps.htmlBtnTextId;
  let   COMBO_LIST_INNER_ID;
  let   COMBO_ITEM_PREFIX = "vwComboList_" + strParentId + "_";

  let m_listBox;
  let m_aobjData =  comboListDataModel.getDataSet();

  let m_objSelectedItem = null;
  let m_nSelectedIndex = -1;
  let m_nComboWidth;
  let m_nComboHeight = 0;
  let m_fnOnClickHandler;

  let m_afnChangeCallBacks = [];

  let m_itemHilited = null;
  let m_nHiLitedNdx = -1;

  let m_fZeroIndexNoSelection = false;

  let m_nLastKeyboardSelIndex = -1;

  let m_fEnabled = true;
  let m_dropdownEle;


  this.clear = clear;
  this.close = closeCombobox;

  /**
   * @Deprecated Use onClick
   * @type {setComboboxClickHandler}
   */
  this.click = ( fnOnClickHandler ) =>  m_fnOnClickHandler = fnOnClickHandler;

  this.onClick = ( fnOnClickHandler ) =>  m_fnOnClickHandler = fnOnClickHandler;

  this.enabled = enabled;

  this.getSelectedIndex = getSelectedIndex;
  this.getSelectedItem = getSelectedItem;
  this.getSelectedId = getSelectedId;
  this.getSelectedValue = getSelectedValue;
  this.add = add;
  this.setData = setData;
  this.setSelectedIndex = setSelectedIndex;
  this.setSelectedItem = setSelectedItem;
  this.setSelectedItemByValue = setSelectedItemByValue;
  this.setSelectedItemById = setSelectedItemById;
  this.onSelectionChange = selectionChange;
  this.isSelectedItem = isSelectedItem;
  this.isOpen = isComboListShowing;
  this.zeroIndexNoSelection = zeroIndexNoSelection;

  // Begin configObject
  configObject();


  /**
   * Setup combo box
   */
  function configObject()
  {
    render();

    if ( m_comboProps.resourceMgr )
    {
      doI18nDataTranslations();
    }

    buildComboBtn();

    if ( m_aobjData && !m_comboProps.placeHolder )
    {
      setSelectedIndex( 0, true );
    }

  }

  function render()
  {
    const strHtml =
     `<div id="${strParentId}_comboBoxBtn" style="height:100%"></div>
      <div id="${strParentId}_comboBoxListBox" class="VwComboBoxListBox"></div>`;

    $(`#${strParentId}`).html( strHtml);

  } // end render()

  /**
   * Do i18n Translation of data values
   */
  function doI18nDataTranslations()
  {
    if ( m_aobjData )
    {
      for ( let x = 0, nLen = m_aobjData.length; x < nLen; x++ )
      {
        if ( m_comboProps.textDisplayProp )
        {
         const strVal = xlateIi8n(m_aobjData[x][m_comboProps.textDisplayProp] );
          m_aobjData[x][m_comboProps.textDisplayProp] = strVal;

        }

        if ( typeof m_aobjData[x] == "string" )
        {
          m_aobjData[x] = xlateIi8n( m_aobjData[x] );
        }
      }
    }


  }

  /**
   * Extract property key from "i18n_" string and return the resource bundle property
   *
   * @param strVal The propert string to translate
   * @returns {*}
   */
  function xlateIi8n( strVal )
  {
    let strPropKey;

    if ( strVal.startsWith( "i18n"))
    {
      strPropKey = strVal.substring( "i18n_".length );
      return m_comboProps.resourceMgr.getString( strPropKey );

    }
    else
    {
      return strVal;

    }

   }


  /**
   * Build the ComboBox button
   */
  function buildComboBtn()
  {
    // Remove any previous installation

    if ( m_comboProps.htmlBtnTemplate )
    {
      $(`#${strParentId}_comboBoxBtn`).append( m_comboProps.htmlBtnTemplate );
    }
    else
    {
      buildVwDefaultBtn();
    }

    m_nComboWidth = $( `#${COMBO_BTN_ID}`).outerWidth();
    m_nComboHeight = $( `#${COMBO_BTN_ID}`).outerHeight();

    // listbox needs to be visible to calculate position, but set op[acity to 0 to prevent a flash
    $(`#${strParentId}_comboBoxListBox`).css( "opacity", "0");

    // First install the popup list
    buildPopupList();

    calculateListboxPosition();

    setupActions();

    clear();

    $(`#${strParentId}_comboBoxListBox`).css( "position", "absolute");

    m_listBox.resize();
    m_listBox.hide();

    $(`#${strParentId}_comboBoxListBox`).css( "opacity", "1");

    if ( m_comboProps.fnReady )
    {
      m_comboProps.fnReady( self );
    }


  }

  function buildVwDefaultBtn()
  {

    switch( m_comboProps.style )
    {
      case "text":

        $(`#${strParentId}_comboBoxBtn`).addClass( m_comboProps.cssComboBtn );
        $(`#${strParentId}_comboBoxBtn`).append( `<span id="${COMBO_BTN_TXT_ID}"></span>` );
        $(`#${strParentId}_comboBoxBtn`).append( `<img id="${COMBO_BTN_ARROW_ID}" src="${m_comboProps.btnArrowImg}" class="${m_comboProps.cssArrow}"></img>` );

        break;

      case "image-text":

        $(`#${strParentId}_comboBoxBtn`).addClass( m_comboProps.cssComboBtn );
        const strImgHtml = `<img id="${COMBO_BTN_IMG_ID}" src="${m_comboProps.btnImgSrc}" class="${m_comboProps.cssBtnImage}"/>`;
        const strSpanHtml = `<span id="${COMBO_BTN_TXT_ID}"></span>`

        $(`#${strParentId}_comboBoxBtn`).append( strImgHtml ).append( strSpanHtml );
        $(`#${strParentId}_comboBoxBtn`).append( `<img id="${COMBO_BTN_ARROW_ID}" src="${m_comboProps.btnArrowImg}" class="${m_comboProps.cssArrow}"></img>` );
        break;

    }  // end switch()

    if ( m_comboProps.showBubble )
    {
      $(`#${strParentId}_comboBoxBtn`).append( `<div class="VwBubble" id="vwBubble_${strParentId}></div>` );

    }

    if ( m_comboProps.idImgProp )
    {
      const strBtnImgHtml = `<img id="${COMBO_BTN_IMG_ID}" class="${m_comboProps.cssBtnImage}"/>`;
      $(`#${strParentId}_comboBoxBtn`).append( strBtnImgHtml );

    }

   }

  /**
   * Clears the selected state of the combo box
   */
  function clear()
  {
    if ( m_comboProps.placeHolder )
    {
      buildSelItemFromObject( m_comboProps.placeHolder )
    }
    else
    if ( m_comboProps.defaultId )
    {
      setSelectedItemById( m_comboProps.defaultId );
    }
    else
    if ( m_comboProps.defaultValue )
    {
      setSelectedItemByValue( m_comboProps.defaultValue );
    }
    else
    {
      buildComboBtnSelItem( -1 );
    }

  }

  /**
   * Setup event actions
   */
  function setupActions()
  {
    $( `#${COMBO_BTN_ID}` ).unbind().click( showComboPopupList );

  }


  /**
   * Build the combo box button with img (optional and text
   *
   * @param nItemIndex The item index or -1 if it uses the default initial item text
   */
  function buildComboBtnSelItem( nItemIndex )
  {
    if ( nItemIndex < 0 )
    {
      buildDefaultFirstItem();
    }

  } // end buildComboBtnSelItem


  /**
   * Build combo box button from the default
   */
  function buildDefaultFirstItem()
  {
    if ( !m_aobjData || m_aobjData.length == 0 )
    {
      return;
    }

    // If a first default item was not defined then the initial item is the first item in the data list
    if ( !m_comboProps.placeHolder )
    {
      m_nSelectedIndex = 0;
      buildSelItemFromObject( m_aobjData[0], true );
      return;

    }

    buildSelItemFromPlaceholder();

  } // end buildDefaultFirstItem()


  /**
   * Builds the selected item from the place holder value
   */
  function buildSelItemFromPlaceholder()
  {
    $( `#${COMBO_BTN_TXT_ID}` ).html( m_comboProps.placeHolder );

    m_objSelectedItem = null;
  }


  /**
   * Build the popup listbox selection items from the item data array list passed
   */
  function buildPopupList()
  {

    m_comboProps.idProp = m_comboProps.valueProp;
    m_comboProps.bubbleCenterParent = strParentId;
    m_comboProps.noHorzScroll = true;
    m_comboProps.selectOnKeyPress = true;
    m_comboProps.deferKeyPressTillShow = true;

    let strHtmlListItemTemplate = m_comboProps.htmlListItemTemplate;

    if ( !strHtmlListItemTemplate )
    {
      strHtmlListItemTemplate = buildDefaultListItemTemplate();
    }

    m_comboProps.htmlListItemTemplate = strHtmlListItemTemplate;

    const listBoxProps = {};
    listBoxProps.itemTemplate = strHtmlListItemTemplate;
    listBoxProps.templateType = "custom";
    listBoxProps.cssListBox = m_comboProps.cssListBox;
    listBoxProps.idDisplayProp = m_comboProps.idDisplayProp;
    listBoxProps.idProp = m_strIdProp;
    listBoxProps.itemTemplateIdPrefix = m_comboProps.itemTemplateIdPrefix

    m_listBox = new VwListBox( `${strParentId}_comboBoxListBox`, comboListDataModel, listBoxProps );
    m_listBox.click( handleComboListClick );

    const objCss = {
      "position":"absolute", "z-index":"99999", "width":m_nComboWidth + "px"
    };

    $( `#${COMBO_LIST_ID}` ).css( objCss );

  }// End buildPopupList


  /**
   * Calculates the listbox position based on its height and relation to the combo btn
   */
  function calculateListboxPosition()
  {
    const nBtnWidth = $(`#${COMBO_BTN_ID}`).width();

    $( `#${COMBO_LIST_ID}` ).outerWidth( nBtnWidth);

    const nListBoxHeight = $( `#${COMBO_LIST_ID}` ).height();

    let nBtnHeight = $(`#${COMBO_BTN_ID}`).outerHeight() + 1;

    const offsetBtn = $( `#${COMBO_BTN_ID}` ).offset();

    if ( (offsetBtn.top + nListBoxHeight ) > (window.innerHeight - 32 ) )
    {
      const nMaxHeight = window.innerHeight - (offsetBtn.top + nBtnHeight) - 32;

      $( `#${COMBO_LIST_ID}` ).css( "height", nMaxHeight + "px");
      $( `#${COMBO_LIST_ID}` ).css( "max-height", nMaxHeight + "px");
     }

    $( `#${COMBO_LIST_ID}` ).offset( {left:offsetBtn.left, top:offsetBtn.top + nBtnHeight});

  } //end calculateListboxPosition()


  /**
   * Builds the default dropdown list item template
   */
  function buildDefaultListItemTemplate()
  {
    let strListItemTemplate =
        `<div id="${COMBO_LIST_ID}_\${${m_strIdProp}}" style="cursor:pointer" class="${m_comboProps.cssListItem}">
           <img id="${strParentId}_check_${m_comboProps.valueProp}" src="${m_comboProps.checkImgUrl}" class="${m_comboProps.cssCheckMark} VwCheckHide" />
           `

    if ( m_comboProps.idImgProp )
    {
      strListItemTemplate += `<img class="${m_comboProps.cssBtnImage}" src="\${${m_comboProps.idImgProp}}"/>`;
    }

    strListItemTemplate += `<span class="${m_comboProps.cssDropdownText}">\${${m_comboProps.idDisplayProp}}</span></div>`;

    return strListItemTemplate;

  } // end buildDefaultListItemTemplate()

  /**
   * Handles the popup list key up event
   */
  function popupListKeyUpEvent( event )
  {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  /**
   * Handles the popup list key down event
   */
  function popupListKeyDownEvent( event )
  {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    const nKeyCode = event.keyCode;

    switch ( nKeyCode )
    {

      case 27:   // Escape key

        $( "#" + COMBO_LIST_ID ).hide();
        $( "#" + COMBO_LIST_INNER_ID ).unbind( "click" );

        return;

      case 40:   // Down Arrow

        handleMoveDownArrow();
        return;

      case 38:  // Up Arrow

        handleMoveUpArrow();
        break;

      case 13:  // Enter key

        handleEnter();
        break;

      default:

        if ( nKeyCode < 48 && nKeyCode > 128 )
        {
          return;
       }
    } // end switch()

    let strKey = String.fromCharCode( nKeyCode );

    if ( !strKey )
    {
      return;
    }

    strKey = strKey.toLowerCase();

    let strListItemId = null;

    const astrDivItems = $( "#" + COMBO_LIST_INNER_ID ).children();

    for ( let  x = ++m_nLastKeyboardSelIndex, nLen = astrDivItems.length; x < nLen; x++ )
    {
      const item = astrDivItems[x];

      const strItemText = $( "#" + item.id + " > span" ).text();

      if ( strItemText.charAt( 0 ).toLowerCase() == strKey )
      {
        strListItemId = item.id;

        if ( m_itemHilited != null )
        {
          setItemSelectedColor( m_itemHilited, false );
        }

        m_nHiLitedNdx = x;

        setItemSelectedColor( item.id, true );

        break;
      }
    } // end for()


    if ( strListItemId != null )
    {
      item.scrollIntoView();

    }
  } // end popupListKeyDownEvent()

  /**
   * Handler for key down event
   */
  function handleMoveDownArrow()
  {
    if ( m_nHiLitedNdx < 0 )
    {
      return;
    }

    ++m_nHiLitedNdx;

    if ( m_nHiLitedNdx >= m_aobjData.length )
    {
      m_nHiLitedNdx = m_aobjData.length - 1;
      return;
    }

    setItemSelectedColor( m_itemHilited, false );

    const strItemHiliteId = COMBO_ITEM_PREFIX + m_nHiLitedNdx;
    setItemSelectedColor( strItemHiliteId, true );

  } // end  handleMoveDownArrow()

  /**
   * handler for key up event
   */
  function handleMoveUpArrow()
  {
    if ( m_nHiLitedNdx < 0 )
    {
      return;

    }

    --m_nHiLitedNdx;

    if ( m_nHiLitedNdx < 0 )
    {
      m_nHiLitedNdx = 0;
      return;
    }

    setItemSelectedColor( m_itemHilited, false );

    const strItemHiliteId = COMBO_ITEM_PREFIX + m_nHiLitedNdx;
    setItemSelectedColor( strItemHiliteId, true );

  } // end handleMoveUpArrow()

  /**
   * Handles the keyboard enter key event
   */
  function handleEnter()
  {
    if ( m_nHiLitedNdx < 0 )
    {
      return;
    }

    const event = {};
    event.currentTarget = {};
    event.currentTarget.id = m_itemHilited;

    handleComboListClick( event );

  } // end handleEnter()


  /**
   * Handle the item that was clicked
   * @param event
   * @param listItemClicked
   */
  function handleComboListClick( listItemClicked )
  {

    selectComboBoxItem( listItemClicked );

    closeCombobox();

    if ( m_fnOnClickHandler )
    {
      m_fnOnClickHandler( listItemClicked );
    }

  } // end handleComboListClick()

  /**
   * Selects a combobox item
   * @param listItemClicked
   */
  function selectComboBoxItem( listItemClicked )
  {
    let fSelChange;

    m_nSelectedIndex = findItemArrayIndex( listItemClicked );

    if ( m_comboProps.valueProp == "VwSeq" )
    {
      fSelChange = m_objSelectedItem != m_aobjData[m_nSelectedIndex];
    }
    else
    {
      if ( m_objSelectedItem != null )
      {
        fSelChange = listItemClicked[m_comboProps.valueProp] != m_objSelectedItem[m_comboProps.valueProp];
      }
      else
      {
        fSelChange = true;
      }
    }

    if ( m_objSelectedItem )
    {
      displayItemCheck( m_objSelectedItem, false );
    }

    displayItemCheck( listItemClicked, true );

    m_objSelectedItem = listItemClicked;

    buildSelItemFromObject( m_objSelectedItem );

    $( "#" + COMBO_LIST_ID ).css( "display", "hide" );
    $( "#" + COMBO_LIST_INNER_ID ).unbind( "click" );

    if ( fSelChange )
    {
      fireComboBoxChangeHandlers();
    }


  }

  /**
   * Finds the array index of this object
   *
   * @param itemToFind
   * @returns {number}
   */
  function findItemArrayIndex( itemToFind )
  {
    let x = -1;
    for ( const dataItem of m_aobjData )
    {
      ++x;

      if ( m_comboProps.valueProp && m_comboProps.valueProp != "VwSeq" )
      {
        const idDataItem = VwUtils.getObjProperty( dataItem, m_comboProps.valueProp );
        const idFindItem = VwUtils.getObjProperty( itemToFind, m_comboProps.valueProp );

        if ( idDataItem == idFindItem )
        return x;
      }
      else
      if ( m_aobjData[x] == itemToFind )
      {
        return x;

      }
    }
  }

  /**
   * Fire any combobox change handlers defined
   */
  function fireComboBoxChangeHandlers()
  {

    for ( let x = 0, nLen = m_afnChangeCallBacks.length; x < nLen; x++ )
    {
      m_afnChangeCallBacks[x]( m_objSelectedItem )
    }
  }


  /**
   * Shows/hides the item check ark in the popup list
   *
   * @param listItem  The item index to set the checkmark state
   * @param fShow     True to show, false to hide
   */
  function displayItemCheck( listItem, fShow )
  {
    let strItemId;

    if ( m_comboProps.valueProp == "VwSeq" )
    {
      strItemId = findItemArrayIndex( listItem );
    }
    else
    {
      strItemId = listItem[m_comboProps.valueProp];

    }

    const strCheckId = "#" + strParentId + "_check_" + strItemId;
    if ( fShow )
    {
      $( strCheckId ).removeClass( "VwCheckHide" )
    }
    else
    {
      $( strCheckId ).addClass( "VwCheckHide" )

    }
  }


  /**
   * Display the combo box selection list
   */
  function showComboPopupList( event )
  {
    // Dont show if disabled
    if ( !m_fEnabled )
    {
      return;
    }

    if ( m_comboProps.fnBtnClickCallback )
    {
      m_comboProps.fnBtnClickCallback( isComboListShowing );
    }

    if (isComboListShowing())
    {
      closeCombobox();
      m_uiExitMgr.remove();
      return;
    }

    m_uiExitMgr = new VwUiExitMgr( COMBO_LIST_ID, self.close );

    event.preventDefault();
    event.stopImmediatePropagation();

    if ( m_comboProps.showBubble )
    {
      $( "#vwBubble_" + strParentId ).show();
    }

    $( "#" + COMBO_BTN_ID ).addClass( "Selected" );
    $( "#" + COMBO_BTN_ARROW_ID ).attr( "src", m_comboProps.btnSelectedArrowImg );

    if ( m_objSelectedItem )
    {
      displayItemCheck( m_objSelectedItem, true );
    }

    m_listBox.show();
    m_listBox.focus();

    calculateListboxPosition();

    m_dropdownEle = $( "#" + COMBO_LIST_ID )[0];

   }


  /**
   * Handle the mouse outside click
   * @param event   The event object
   * @param element The DOM element
   */
  function handleMouseClick( event, element )
  {
    // Check the DOM element exists
    if ( !m_dropdownEle )
    {
      window.removeEventListener( "mousedown", handleMouseClick );
      return;
    }
    // This means a click outside the dialog box
    if ( !m_dropdownEle.contains( event.target ) )
    {
      window.removeEventListener( "mousedown", handleMouseClick );
      closeCombobox();
    }
  }


  /**
   * Clear any hilited items
   */
  function clearHilites()
  {
    const strSelector = "[id^=" + COMBO_ITEM_PREFIX + "]";

    $( strSelector ).css( {"background-color": m_comboProps.backgroundColor, "color": m_comboProps.textColor} );

  }


  /**
   * Set the item selected color
   * @param strItemId
   * @param fSelected
   */
  function setItemSelectedColor( strItemId, fSelected )
  {

    let  cssProps;

    if ( fSelected )
    {
      m_itemHilited = strItemId;

      cssProps = {
        "background-color": m_comboProps.selectedBackgroundColor,
        "color"           : m_comboProps.selectedTextColor
      };

      $( "#" + strItemId ).css( cssProps );

      $( "#" + strItemId + "_txt" ).css( cssProps );

      $( "#" + strItemId + "_chk" ).css( "background-color", m_comboProps.selectedBackgroundColor ).attr( "src", m_comboProps.checkMarkSelectedImg )

    }
    else
    {
      cssProps = {
        "background-color": m_comboProps.backgroundColor,
        "color"           : m_comboProps.textColor
      };

      $( "#" + strItemId ).css( cssProps );

      $( "#" + strItemId + "_txt" ).css( cssProps );

      $( "#" + strItemId + "_chk" ).css( "background-color", m_comboProps.backgroundColor ).attr( "src", m_comboProps.checkImgUrl );
    }

  }



  /**
   * Build a selected item entry from the selected object
   * @param objItem  The object that was selected in the array
   */
  function buildSelItemFromObject( objItem, fDefaultItem )
  {
    m_objSelectedItem = objItem;

    if ( m_comboProps.fnComboBtnFormatter )
    {
      m_comboProps.fnComboBtnFormatter( VwUiUtils.doI18n( objItem ) );
      return;

    }

    let  strItemText = null;

    if ( m_comboProps.placeHolder && objItem == m_comboProps.placeHolder )
    {
      strItemText = objItem;
      m_nSelectedIndex = -1;
    }
    else
    {
      if ( m_comboProps.idDisplayProp && m_comboProps.idDisplayProp != "self" )
      {
        strItemText = VwUtils.getObjProperty( objItem, m_comboProps.idDisplayProp );

      }
      else
      {
        strItemText = objItem;

      }
    }

    if ( m_comboProps.resourceMgr )
    {
      VwUiUtils.doI18n( m_comboProps.resourceMgr );
    }

    if ( m_comboProps.idImgProp )
    {

      const strImgUrl = objItem[m_comboProps.idImgProp];
      $( "#" + COMBO_BTN_IMG_ID ).attr( "src", strImgUrl );
    }

    $( "#" + COMBO_BTN_TXT_ID ).html( strItemText );

  }

  /**
   * Apply property translation if specified
   * @param strComboItem The combobox item to test form translation
   *
   * @return the translated string if the text starts with the property key prefix
   */
  function doI18n( strComboItem )
  {
    if ( m_comboProps.resourceMgr )
    {
      if ( VwExString.startsWith( strComboItem, m_comboProps.propKeyPrefix ) )
      {
        return m_comboProps.resourceMgr.getString( strComboItem.substring( m_comboProps.propKeyPrefix.length ) );
      }
    }

    return strComboItem; // Doesn't need translation
  }


  /**
   * Build the combo box config properties by extening the defualts with any user overrides
   *
   * @param objUserProps The user properties object
   */
  function configProps()
  {

    // Defaults
    const defaultProps = {};
    defaultProps.style = "text";
    defaultProps.cssComboBtn = "VwComboBtn";
    defaultProps.cssBtnTextContainer = "VwComboBtnTextContainer";
    defaultProps.cssBtnImage = "VwComboBtnIcon";
    defaultProps.cssListBox = "VwComboListDropdown VwComboList";
    defaultProps.cssListItem = "VwComboListItem";
    defaultProps.cssListItemImg = "VwComboListItemImg";
    defaultProps.cssArrow = "VwComboBtnArrowImg";
    defaultProps.cssDropdownText = "VwDropdownText";
    defaultProps.btnArrowImg = "/vozzworks/ui/images/vw_black_arrow_down.png";
    defaultProps.btnSelectedArrowImg = defaultProps.btnArrowImg;
    defaultProps.checkMarkSelectedImg = "/vozzworks/ui/images/vw_white_checkmark.png";
    defaultProps.checkImgUrl = "/vozzworks/ui/images/vw_black_checkmark.png";
    defaultProps.cssCheckMark = "VwComboCheckMark";
    defaultProps.cssImageItem = "VwComboListItemImg";
    defaultProps.propKeyPrefix = "i18n_";
    defaultProps.calculateListHeight = false;
    defaultProps.dropDownWidth = "parent";
    defaultProps.displayType = "block";
    defaultProps.comboBtnId = `${strParentId}_comboBoxBtn`;
    defaultProps.comboBoxListId = `${strParentId}_vwComboBtnId`;
    defaultProps.htmlBtnTextId = "vwComboBoxBtnText";

    if ( !defaultProps.valueProp )
    {
      defaultProps.valueProp = "VwSeq";
    }

    if ( !defaultProps.idDisplayProp )
    {
      defaultProps.idDisplayProp = "self";
    }

    $.extend( defaultProps, comboProps );
    if ( defaultProps.useWhiteArrow )
    {
      defaultProps.btnArrowImg = defaultProps.btnSelectedArrowImg = "/vozzworks/ui/images/vw_white_arrow_down.png";
    }

    return defaultProps;

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
   * Adds an item to the dropdown list
   * @param comboItem
   */
  function add( comboItem )
  {
    if ( !m_aobjData )
    {
      m_aobjData = [];
    }

    m_aobjData.push( comboItem );
    
    m_listBox.add( comboItem );
  }


  /**
   * Set combo box data
   * @param aObjData
   */
  function setData( aObjData )
  {

    m_listBox.clear();
    m_listBox.addAll( m_aobjData );

    buildComboBtnSelItem( -1 );

  }

  /**
   * Set zero index no selection flag
   * @param fNoSelection
   */
  function zeroIndexNoSelection( fNoSelection )
  {
    m_fZeroIndexNoSelection = fNoSelection;

  }

  /**
   * Set enabled flag
   * @param fEnabled
   */
  function enabled( fEnabled )
  {
    m_fEnabled = fEnabled;

    if ( m_fEnabled )
    {
      $(`#${COMBO_BTN_ID}`).css( "cursor", "pointer");
    }
    else
    {
      $(`#${COMBO_BTN_ID}`).css( "cursor", "not-allowed");

    }

  }


  /**
   * Return true if a valid selection has been made. If the selected index is zero and the noZeroIndex is set the
   * no valid selection has been made
   *
   * @returns {boolean}
   */
  function isSelectedItem()
  {
    if ( m_nSelectedIndex < 0 )
    {
      return false;

    }

    const selectedItem = getSelectedItem();

    if ( m_comboProps.placeHolder && ( selectedItem == m_comboProps.placeHolder ) )
    {
      return false;

    }

    if ( m_nSelectedIndex == 0 && m_fZeroIndexNoSelection )
    {
      return false;
    }

    return true;

  }


  /**
   * Sets the selection change callback
   *
   * @param fnChangeCallBack The function callback
   */
  function selectionChange( fnChangeCallBack )
  {

    if ( !existHandler( m_afnChangeCallBacks, fnChangeCallBack ) )
    {
      m_afnChangeCallBacks.push( fnChangeCallBack );
    }


  }


  /**
   * Get the index of the currently selected item. Will be -1 if a first item  place holder was defined and is the selected item
   *
   * @returns the idnex of the item araay selected or -1 if the first item place holder is selected
   */
  function getSelectedIndex()
  {
    return m_nSelectedIndex;
  }


  /**
   * Gets the selected item object that was specified in the item data array
   * @returns {*}
   */
  function getSelectedItem()
  {
    if ( m_nSelectedIndex >= 0 )
    {
      if ( m_nSelectedIndex == 0 && m_fZeroIndexNoSelection )
      {
        return null;

      }

      return m_aobjData[m_nSelectedIndex];
    }

    return null;
  }

  /**
   * Returns the id value of the selected item. Requires the idProp property to be passed to the constructor of the VwModel
   * @returns {*}
   */
  function getSelectedId()
  {
    const strIdProp = comboListDataModel.getIdProp();

    if ( !strIdProp )
    {
      throw "getSelectedId() requires the data model defines the idProp property";
    }

    const objItem = self.getSelectedItem();

    return objItem[ strIdProp ];

  } // end getSelectedId()

  /**
   * Gets the value of the selected combo box item. If a valueProp was defied, that is returned, else f a displayProp was defined,
   * that is returned else the object itself is returned
   *
   * @returns {*}
   */
  function getSelectedValue()
  {
    const objItem = self.getSelectedItem();

    if ( !objItem )
    {
      return null;
    }

    const strIdProp = comboListDataModel.getIdProp();

    if ( strIdProp )
    {
      return objItem[ strIdProp]
    }
    else
    if ( m_comboProps.valueProp )
    {
      if ( m_comboProps.valueProp != "VwSeq" )
      {
        return objItem[m_comboProps.valueProp];
      }
      else
      {
        return objItem;
      }
    }
    else
    {
      if ( m_comboProps.idDisplayProp )
      {
        return objItem[m_comboProps.idDisplayProp];
      }
    }

    return objItem; // Assume array of strings for combo box values

  }


  /**
   * Sets the selected item to the specified index. If a first item place holder was defined use -1 to set that
   * as the selected item
   *
   * @param nIndex  The index in the item data array to select or -1 to select the first item place holder
   * @param bDontFireHandlers - Dont fire the change handlers if true
   */
  function setSelectedIndex( nIndex, bDontFireHandlers )
  {

    m_nSelectedIndex = nIndex;

    if ( nIndex < 0 )
    {
      if ( !m_comboProps.placeHolder )
      {
        throw "A First Item Value must be specified in the drop down properties if setting index < zero";
      }

      buildSelItemFromPlaceholder();

    }

    if ( nIndex >= m_aobjData.length )
    {
      throw "Selected index is greater then the items in the list";
    }

    buildSelItemFromObject( m_aobjData[nIndex] );

    if ( bDontFireHandlers )
    {
      return;
    }

    fireComboBoxChangeHandlers();

  }


  /**
   * Sets the selected item by passing an object instance that exists in the item data array
   * @param objItem
   * @param fDontFireHandlers -- - if true dont fire handlers on set
   */
  function setSelectedItem( objItem, fDontFireHandlers )
  {

    m_objSelectedItem = objItem;

    // Also ficd its index
    m_nSelectedIndex = findItemArrayIndex( m_objSelectedItem );

    buildSelItemFromObject( objItem );

    if ( fDontFireHandlers )
    {
      return;
    }

    fireComboBoxChangeHandlers();
  }

  function setSelectedItemBy( objItem, fDontFireHandlers )
  {

    m_objSelectedItem = objItem;

    // Also ficd its index
    m_nSelectedIndex = findItemArrayIndex( m_objSelectedItem );

    buildSelItemFromObject( objItem );

    if ( fDontFireHandlers )
    {
      return;
    }

    fireComboBoxChangeHandlers();
  }

  /**
   * Returns boolean value of combolist open/close state
   *
   * @returns {*|jQuery|HTMLElement}
   */
  function isComboListShowing()
  {
    return m_listBox.isShowing();

  }

  /**
   * Closes the combobox list and resets the combobox style to deselected
   */
  function closeCombobox()
  {
    $( "#" + COMBO_BTN_ID ).removeClass( "Selected" );
    $( "#" + COMBO_BTN_ARROW_ID ).attr( "src", m_comboProps.btnArrowImg );
    $( "#vwBubble_" + strParentId ).hide();

    m_listBox.hide();

    if ( m_comboProps.fnOutsideClickClose )
    {
      m_comboProps.fnOutsideClickClose();
    }
  }


  /**
   * Set the combo box selected item by finding the object whose valueProp matches the objValue passed
   * @param objValue The object value to search
   */
  function setSelectedItemByValue( objValue, bNoFireHandlers )
  {

    if ( !m_comboProps.valueProp )
    {
      throw "The setSelectedItemByValue method was called on the VwComboBox, but the valueProp was not defined on the combo box properties";
      return;
    }

    if ( !m_aobjData )
    {
      return;
    }

    let ndx = -1;
    for ( const objItem of m_aobjData )
    {
      ++ndx;
      if ( objItem[m_comboProps.valueProp] == objValue )
      {
        m_nSelectedIndex = ndx;
        buildSelItemFromObject( objItem );

        if ( bNoFireHandlers )
        {
          return;
        }

        fireComboBoxChangeHandlers();
        return;

      }
    }

    throw "Combo box did not contain an object with a valueProp equal to:  " + objValue;

  }

  /**
   * Select the item by id
   * @param strId
   */
  function setSelectedItemById( strId, bNoFireChange  )
  {

    const strIdProp = comboListDataModel.getIdProp();

    if ( !strIdProp )
    {
      throw "The setSelectedItemById method was called on the VwComboBox, but the idProp was not defined on tVwDataModel properties";
      return;
    }

    if ( !m_aobjData )
    {
      return;
    }

    let ndx = -1;
    for ( const objItem of m_aobjData )
    {
      ++ndx;
      if ( objItem[strIdProp] == strId )
      {
        m_nSelectedIndex = ndx;
        buildSelItemFromObject( objItem );

        if ( bNoFireChange )
        {
          return;

        }
        fireComboBoxChangeHandlers();
        return;

      }
    }

  } // end setSelectedItemById()

} // end VwComboBox

export default VwComboBox;