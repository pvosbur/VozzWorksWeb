/*
 * Created by User: petervosburgh
 * Date: 8/31/22
 * Time: 5:51 AM
 * 
 */

import VwExString     from "../../util/VwExString/VwExString.js";
import VwScrollBar    from "../VwScrollBar/VwScrollBar.js";
import VwHashMap      from "../../util/VwHashMap/VwHashMap.js";
import VwUtils        from "../../util/VwUtils/VwUtils.js";

VwCssImport( "/vozzworks/ui/VwListBox2/style");
VwCssImport("/vozzworks/ui/VwScrollBar/style");

/**
 * This class defines a list box ui. It takes an array of objects to display in a list fashion
 *
 * @param strParentId The parent id where the listbox will reside. If null, it is added to the html body element
 *                    and is absolut positioned
 * @param vwDataModel an Instance of the VwDataModel which holds the listbox items
 * @param listBoxProps The additional properties for the list box and are as follows:
 *                     idDisplayProp:this name of the property on the item that represents the value to be displayed in the listbox,
 *                     if omitted, the "text" property is assumed
 *
 *                     idImgProp the name if the image property that has the url to the image. If omitted, the "img" property is assumed
 *
 * @constructor
 */
function VwListBox( strParentId, vwDataModel, listBoxProps )
{
  if ( arguments.length == 0 ) // subclasss prototype call
  {
    return;
  }

  const self = this;
  const m_listProps = configListBoxProps();
  const m_mapItems = new VwHashMap();

  let   m_strSelectedItemId;
  let   m_containerEle;
  let   m_contentEle;
  let   m_fnClickHandler;
  let   m_strListBoxHtml;
  let   m_strListBoxId;
  let   m_vertScrollBar;
  let   m_horzScrollBar;
  let   m_strTextOnlyItemTemplate;
  let   m_strImageTextItemTemplate;
  let   m_strIdDisplayProp;
  let   m_strIdImgProp;
  let   m_bHasImgArray;

  /**
   * @deprecated
   * @param fnClickHandler
   */
  this.click = ( fnClickHandler ) => m_fnClickHandler = fnClickHandler;
  this.onClick = ( fnClickHandler ) => m_fnClickHandler = fnClickHandler;
  this.setSelectedItem = ( strItemId ) => handleItemClick( strItemId, true );
  this.getSelectedItem = () => m_strSelectedItemId;
  this.moveTo = moveTo;
  this.close = close;
  this.show = () =>  $(`#${m_strListBoxId}` ).css( "display", "flex");
  this.hide = () =>  $(`#${m_strListBoxId}` ).css( "display", "none");
  this.isShowing = () => $(`#${m_strListBoxId}` ).css( "display" ) == "flex";
  this.focus = () =>  $(`#${m_strListBoxId}` ).focus();
  this.resize = resizeScrollBars;

  configObject();

  /**
   * Setup the list box which conatins a container div, a content div and scroll bars
   */
  async function configObject()
  {
    if ( strParentId )
    {
      m_strListBoxId = strParentId;
    }
    else
    {
      m_strListBoxId = VwExString.genUUID();
    }

    if ( m_listProps.idDisplayProp )
    {
      m_strIdDisplayProp = m_listProps.idDisplayProp;
    }
    else
    {
      //todo m_strIdDisplayProp = "text";

    }

    if ( m_listProps.idImgProp )
    {
      m_strIdImgProp = m_listProps.idImgProp;
    }
    else
    {
      m_strIdImgProp = "img";

    }

    render();

    addScrollBars();

    vwDataModel.registerEventListener( self, handleDataChangeEvent );

    const dataSet = vwDataModel.getDataSet();

    self.show();

    for ( const dataItem of dataSet )
    {
      add( dataItem );
    }

  } // end configObject()

  /**
   * Renders the ListBox shell html
   */
  function render()
  {
    m_strListBoxHtml =
      `<div id="content_${m_strListBoxId}" class="${m_listProps.cssListBoxContent}"></div>`;

    m_strTextOnlyItemTemplate =
    `<div id="\${id}" class="${m_listProps.cssItem} ${strParentId}">\${item}</div>`;

    m_strImageTextItemTemplate =
      `<div id="\${id}" class="${m_listProps.cssItem}">
         <img  id="img_\${id}" src="\${strImgUrl}" class="${m_listProps.cssImg}"/>
         <span id="text_\${id}"  class="${m_listProps.cssItemText}">\${strText}</span>
      </div>`;

    $(`#${strParentId}`).addClass( m_listProps.cssListBox );

    if ( strParentId )
    {
      $(`#${strParentId}`).append( m_strListBoxHtml );
    }
    else
    {
      // Remove any old instance
      $( `#container_${m_strListBoxId}` ).remove();

      $( "body" ).append( m_strListBoxHtml );
    }

    // make sure parent element is defined as flex and flex-direction:column

    const strDisplay = $(`#${strParentId}`).css( "display");

    if ( strDisplay != "flex")
    {
      $(`#${strParentId}`).css( "display", "flex");
      $(`#${strParentId}`).css( "flex-direction", "column");
    }
    else
    {
      if ( strDisplay == "flex" )
      {
        if ( !$( `#${strParentId}` ).css( "flex-direction" ) == "column" )
        {
          $( `#${strParentId}` ).css( "flex-direction", "column" );

        }
      }

    } // end else

    m_containerEle = $(`#${m_strListBoxId}`)[0];
    m_contentEle = $(`#content_${m_strListBoxId}`)[0];


  } // end render()


  /**
   * Removes listbox from the dom
   */
  function close()
  {
    if ( strParentId )
    {
      $(`#${strParentId}`).empty();
    }
    else
    {
      $(`#content_${m_strListBoxId}`).remove();
    }

  } // end close()


  /**
   * Position the list box at the x,y coordinates specified
   * @param x The left pos
   * @param y The top pos
   */
  function moveTo( x, y )
  {
    $(`#${m_strListBoxId}` ).offset( {"left":x, "top":y});

  } // end moveTo()

  /**
   * Handles data change events from the model
   * @param strChangeId The change event id. Will be one of:
   *        "add" - The the data object to the grid
   *        "update" - Update a data object in the grid
   *        "del" - Removes the entry in the clear
   *        "clear" -- clears the grid
   *
   * @param listItem The user data item to be added to the listbox
   */
  function handleDataChangeEvent( strChangeId, listItem )
  {

    switch ( strChangeId )
    {
      case "add":

        add( listItem );
        break;

      case "update":

        update( listItem )
        break;

      case "del":

        remove( listItem );
        break;

      case "clear":

        $(`#content_${m_strListBoxId}`).empty();
        addScrollBars();
        break;

      case "addComplete":

        resizeScrollBars();
        break;
    } // end switch()
  }

  /**
   * Adds an item to the listbox
   *
   * @param item The item to add
   * @param strTemplateOverrideHtml A template override for this item
   */
  function add( item, strTemplateOverrideHtml )
  {
    const strItemId = vwDataModel.getItemId( item );
    let strItemVal;

    if ( m_strIdDisplayProp )
    {
      strItemVal = VwUtils.getObjProperty(item, m_strIdDisplayProp )
    }

    // we put all list items in the map by id for quick loopup
    m_mapItems.put( strItemId, item );

    switch ( m_listProps.templateType )
    {
      case "text":

        addFromTextTemplate( strItemId, strItemVal );
        break;

      case "imageText":

        const strImgUrl = item[m_strIdImgProp];
        addFromImageTextTemplate( strItemId, strImgUrl, strItemVal );
        break;

      default:

        addFromCustomTemplate( item, strItemId, strTemplateOverrideHtml );
        break;

    } // end switch()

    setupItemActions( `${m_listProps.itemTemplateIdPrefix}_${strItemId}` );

    if ( m_listProps.postItemAdd )
    {
      m_listProps.postItemAdd( self, item );
    }

  } // end add()

  /**
   * Resize scrollbars
   */
  function resizeScrollBars()
  {
    m_vertScrollBar.resize();
    m_horzScrollBar.resize();

  } // end resizeScrollBars()


  /**
   * Updates the item in the list box
   *
   * @param item The updated item
   */
  function update( item, strTemplateOverrideHtml )
  {
    const strItemId = vwDataModel.getItemId( item );
    const strVal = item[m_strIdDisplayProp];

    switch( m_listProps.templateType )
    {
      case "text":

         $(`#${m_listProps.itemTemplateIdPrefix}_${strItemId}`).text( strVal );
         break;

     case "imageText":

       const strImgUrl = item[m_strIdImgProp];
       $(`#img_${m_listProps.itemTemplateIdPrefix}_${strItemId})`).attr( "src", strImgUrl );
       $(`#text_${m_listProps.itemTemplateIdPrefix}_${strItemId})`).text( strVal );
       break;

      default: // **( custom template

        updateFromCustomTemplate( item, strTemplateOverrideHtml )
        break;
        
    } // end switch()
  } // end update()



  /**
   * Removes the item in the list box
   *
   * @param item The item to remove
   */
  function remove( item )
  {
    const strId = `item_${vwDataModel.getItemId( item )}`;
    $(`#${strId}`).remove();

  } // end remove()

  /**
   * Add Click and hover actions
   * @param strItemId
   */
  function setupItemActions( strItemId )
  {
    $(`#${strItemId}`).hover( () => hoverIn( strItemId ),
                              () =>  hoverOut( strItemId ));

    $(`#${strItemId}`).click( () => handleItemClick( strItemId ));


  } // end setupItemActions()

  /**
   * Item hover in
   * @param strItemId if of item hovered in
   */
  function hoverIn( strItemId )
  {
    // dont change hover on a selected item
    if ( m_strSelectedItemId == strItemId )
    {
      return;
    }

    if ( m_bHasImgArray )
    {
      swapImage( strItemId, 1 );
    }

    $(`#${strItemId}`).addClass( m_listProps.cssItemHover);

  } // end hoverIn( ()

  /**
   * Item hover out
   * @param strItemId id of item hovered out
   */
  function hoverOut( strItemId )
  {
    // dont change hover on a selected item
    if ( m_strSelectedItemId == strItemId )
    {
      return;
    }

    if ( m_bHasImgArray )
    {
      swapImage( strItemId, 0 );
    }

    $(`#${strItemId}`).removeClass( m_listProps.cssItemHover)

  } // end hoverOut()


  function swapImage( strItemId, ndx )
  {
    strItemId = stripItemPrefix( strItemId );
    const item = m_mapItems.get( strItemId );

    const strImgUrl = item[m_strIdImgProp];

    $(`#img_${m_listProps.itemTemplateIdPrefix}_${strItemId}`).attr( "src", strImgUrl[ ndx ] );

  } // end swapImage()

  /**
   * String the item prefix from the item id
   * @param strItemId
   * @return {*|string|string}
   */
  function stripItemPrefix( strItemId )
  {
    return strItemId.substring( strItemId.lastIndexOf( "_") + 1);

  } // end stripItemPrefix()

  /**
   * Click handler ofr item clicked.
   * @param strItemId
   */
  function handleItemClick( strItemId, bIgnoreClickHandler  )
  {
    // deSelect item selected if set
    if ( m_strSelectedItemId )
    {
      $(`#${m_strSelectedItemId}`).removeClass( `VwSelected ${m_listProps.cssSelectedItem}`);

    }

    // Mark the item as selected and

    m_strSelectedItemId = strItemId;

    $(`#${strItemId}`).removeClass( m_listProps.cssItemHover );
    $(`#${strItemId}`).addClass( `VwSelected ${m_listProps.cssSelectedItem}` );

    if ( bIgnoreClickHandler )
    {
      return;

    }

   if ( m_fnClickHandler )
    {
      // strip off the parent id prefix
      strItemId = stripItemPrefix( strItemId )
      const itemClicked = m_mapItems.get( strItemId );

      m_fnClickHandler( itemClicked );
    }
  }
  /**
   * Adds ann item from the buitl in text only template
   * @param item The item to add
   */
  function addFromTextTemplate( strItemId, itemVal )
  {
    const strItemHtml = VwExString.expandMacros( m_strTextOnlyItemTemplate, {"id":`${m_listProps.itemTemplateIdPrefix}_${strItemId}`, "item":itemVal} );

    $(m_contentEle).append( strItemHtml );

  } // end addFromTextTemplate()


  /**
   * Adds item using the built in image-text template
   * @param item
   */
  function addFromImageTextTemplate( strItemId, strImgUrl, strText  )
  {
    if ( Array.isArray( strImgUrl ))
    {
      strImgUrl = strImgUrl[0];
      m_bHasImgArray = true;
    }

    const strItemHtml = VwExString.expandMacros( m_strImageTextItemTemplate, {"id":`${m_listProps.itemTemplateIdPrefix}_${strItemId}`, "strImgUrl":strImgUrl,  "strText":strText} );

    $(m_contentEle).append( strItemHtml );

  } // end addFromImageTextTemplate()

  /**
   *
   * Adds item using the user defined template
   * @param item
   * @param strTemplateOverride overriding template from the one defined in the listbox props
   */
  function addFromCustomTemplate( item, strItemId, strTemplateOverride )
  {
    let strTemplate;

    if ( strTemplateOverride )
    {
      strTemplate = strTemplateOverride;
    }
    else
    {
      strTemplate = m_listProps.itemTemplate;
    }

    const strItemHtml = VwExString.expandMacros( strTemplate, item );

    $(m_contentEle).append( strItemHtml );

  } // end addFromCustomTemplate()

  /**
   * Updates an item defined from a custom template
   * @param item
   * @param strTemplateOverride overriding template from the one defined in the listbox props
   *
   */
  function updateFromCustomTemplate( item, strTemplateOverride )
  {
    let strTemplate;

    if ( strTemplateOverride )
    {
      strTemplate = strTemplateOverride;
    }
    else
    {
      strTemplate = m_listProps.itemTemplate;
    }

    const strItemHtml = VwExString.expandMacros( strTemplate, item );

    const strItemId = item[vwDataModel.getIdProp()];

    const listItemId = `${m_listProps.itemTemplateIdPrefix}_${strItemId}`
    $(`#${listItemId}`).replaceWith( strItemHtml );


  } // end updateFromCustomTemplate()


  /**
   * Add vertical and horizontal scroll bars
   */
  function addScrollBars()
  {
    m_vertScrollBar = new VwScrollBar( `content_${m_strListBoxId}`, {"orientation":"vert"} );
    m_horzScrollBar = new VwScrollBar( `content_${m_strListBoxId}`, {"orientation":"horz"} );

  } // end addScrollBars()


  /**
   * Config default list box props
   *
   * @return {{}}
   */
  function configListBoxProps()
  {
    const _listBoxProps = {};

    _listBoxProps.cssListBox = "VwListBox";
    _listBoxProps.cssListBoxContent = "VwListBoxContent";
    _listBoxProps.cssItemHover = "VwListBoxItemHover";
    _listBoxProps.cssSelectedItem = "VwListBoxSelectedItem";
    _listBoxProps.includeHorzScrollBar = false;
    _listBoxProps.templateType = "text";
    _listBoxProps.itemTemplateIdPrefix = strParentId;
    _listBoxProps.cssImg = "VwListBoxImg";
    _listBoxProps.cssItem = "VwListBoxItem";
    _listBoxProps.cssItemText = "VwListBoxItemText";

    $.extend( _listBoxProps, listBoxProps );

    return _listBoxProps;

  } // end configListBoxProps()

} // end VwListBox{}

export default VwListBox;
