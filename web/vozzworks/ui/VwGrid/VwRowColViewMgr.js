/*
 * Created by User: petervosburgh
 * Date: 6/27/24
 * Time: 8:23 AM
 * 
 */
import VwHashMap                from "../../util/VwHashMap/VwHashMap.js";
import VwExString               from "../../util/VwExString/VwExString.js";
import VwDate                   from "../../util/VwDate/VwDate.js";
import {VwClass}                from "../../util/VwReflection/VwReflection.js";
import VwMouseClickMgr          from "../../util/VwMouseClickMgr/VwMouseClickMgr.js";
import VwGridHdr                from "./VwGridHdr.js";

function VwRowColViewMgr( vwGrid, vwXPath, viewSpec, gridProps )
{
  const self = this;
  const m_strGridId = vwGrid.getGridId();
  const m_strGridBodyId = vwGrid.getBodyId();
  const m_mapColFormatters = new VwHashMap();
  const m_mapCustomControlImpl = new VwHashMap();
  const m_mapCustomControlCreated = new VwHashMap();
  const m_mapPostRowAddListeners = new VwHashMap();
  const m_mapEventListeners = new VwHashMap();
  const m_viewProps = {};
  const m_strControlCreate = "customControlCreate";
  const m_strControlCreated = "customControlCreated";
  const m_strRowDeSelected = "rowDeSelected";
  const m_strRowSelected = "rowSelected";
  const m_strRowHoveredIn = "rowHoveredIn";
  const m_strRowHoveredOut = "rowHoveredOut";
  const m_strRowDblClicked = "rowDblClicked";

  let   m_aHdrCols;

  let   m_gridHdr;
  let   m_dataModel = vwGrid.getDataModel();
  let   m_dataIdProp;
  let   m_curSelectedItem;

  this.add = handleAddItem;
  this.remove = handleRemoveItem;
  this.update = handleUpdateItem;
  this.clear = handleClear;
  this.getName = ()=> viewSpec.name;
  this.getProperty = (strPropId ) => m_viewProps[strPropId];
  this.onColFormat = ( strColId, fnOnColFormat) => m_mapColFormatters.put( strColId, fnOnColFormat );
  this.onControlCreate = ( strColId, fnOnControlCreate) => m_mapCustomControlImpl.put( strColId, fnOnControlCreate );
  this.onControlCreated = ( strColId, fnOnControlCreated) => m_mapCustomControlCreated.put( strColId, fnOnControlCreated );
  this.onRowDeSelected = ( fnOnRowDeSelected ) => addEventListener( m_strRowDeSelected, fnOnRowDeSelected );
  this.onRowSelected = ( fnOnRowSelected ) => addEventListener( m_strRowSelected, fnOnRowSelected );
  this.onRowHoveredIn = ( fnOnRowHoveredIn ) => addEventListener( m_strRowHoveredIn, fnOnRowHoveredIn );
  this.onRowHoveredOut = ( fnOnRowHoveredOut ) => addEventListener( m_strRowHoveredOut, fnOnRowHoveredOut );
  this.onRowDblClicked = ( fnOnRowDblClicked ) => addEventListener( m_strRowDblClicked, fnOnRowDblClicked );
  this.setDataModel = handleSetDataModel;
  this.getRowId = getRowId;
  this.getColContainerId = (row, strColId ) => `${getRowId(row)}_colContainer_${strColId}`;
  this.getDomItemId = (rowItem ) => getRowId( rowItem );
  this.openFolder = handleOpenFolder;
  this.onPostItemAdd = (fnPostRowListener ) => m_mapPostRowAddListeners.put( fnPostRowListener, fnPostRowListener );

  configObject();

  function configObject()
  {
    setupGridHdr();

    setupBodyProps();
    setupRowColProps();
    setupEventListeners();

  } // end configObject()

  /**
   * Render html
   *
   * @param rowData
   * @return {string}
   */
  function render( rowData )
  {
    let strRowClass = m_viewProps.cssGridRow;
    if ( m_viewProps.cssUserGridRow )
    {
      strRowClass += " " + m_viewProps.cssUserGridRow ;
    }

    return `<div id="${m_strGridBodyId}_${rowData[m_dataIdProp]}" class="${strRowClass}"></div>`;

  } // end render()

  /**
   * Sets the girds data model
   *
   * @param dataModel the grids data model
   */
  function handleSetDataModel( dataModel )
  {
    m_dataModel = dataModel;
    m_dataIdProp = m_dataModel.getDataIdProp();

  } // end handleSetDataModel()


  /**
   * Setup row/cpl view's grid header
   */
  function setupGridHdr()
  {
    const hdrProps = vwXPath.evaluate( "//gridHdr" );
    m_gridHdr = new VwGridHdr( vwGrid, hdrProps, gridProps );

    m_aHdrCols = toArray( m_gridHdr.getHdrCols() );
  } // end setupGridHdr()


  /**
   * Event Listener handlers defined here
   */
  function setupEventListeners()
  {
    m_gridHdr.onHdrColClick( handleHdrColClicked )
    vwGrid.onViewOpened( self,() =>
                         {
                           m_gridHdr.refresh()
                         } );

  } // end setupEventListeners()

  /**
   * Click handle when a sort column is clicked
   * @param strColId
   */
  async function handleHdrColClicked( hdrCol, bDescending )
  {

    let strPropName;

    if ( hdrCol.dataId )
    {
      strPropName =  hdrCol.dataId;
    }
    else
    {
      strPropName = hdrCol.id;
    }

    const strDataType = sortTypeToDataType( hdrCol.sortType );

    await m_dataModel.sort( strPropName, strDataType, bDescending );

  } // end handleHdrColClicked()


  /**
   * Converts gdr col sortType property to internal sort data type
   * @param strSortType
   * @return {string}
   */
  function sortTypeToDataType( strSortType )
  {
    switch( strSortType )
    {
      case "text":

        if ( m_viewProps.caseSensitiveSort )
        {
          return "s";
        }

        return "i";

      case "number":
      {
        return "n";
      }

      case "float":
      {
        return "f";
      }

      case "date":
      {
        return "d";
      }

    } // end sortTypeToDataType()

  } // end sortTypeToDataType()

  /**
   * Adds an event handler for rowcol allowd events
   * @param strEventId  The event id to add
   * @param fnEventHandler the handler for thatevent
   */
  function addEventListener( strEventId, fnEventHandler )
  {
    let aEventHandlers = m_mapEventListeners.get( strEventId );
    if ( !aEventHandlers )
    {
      aEventHandlers = [];
      m_mapEventListeners.put( strEventId, aEventHandlers );
    }

    aEventHandlers.push( fnEventHandler );

  } // end addEventListener()


  function addRowActionListeners( strRowId, dataItem )
  {
    if ( m_viewProps.cssRowSelected || m_mapEventListeners.containsKey( m_strRowSelected ) || m_mapEventListeners.containsKey( m_strRowDblClicked ) )
    {
      new VwMouseClickMgr( strRowId, dataItem, handleRowSelected, handleRowDblClicked );
    }

    // ** Hover handlers
    if ( m_viewProps.cssRowHovered || m_mapEventListeners.containsKey( m_strRowHoveredIn ) )
    {
      $(`#${strRowId}`).on( "mouseenter", () => handleIRowHoveredIn( strRowId, dataItem )).on ( "mouseleave", () => handleIRowHoveredOut( strRowId, dataItem ));
    }

  } // end addRowActionHListeners()


  /**
   * Fire registered event listeners for the specified event
   *
   * @param strEventId The event listener id
   * @param dataItem   The dataItem assocaited with the event
   */
  function fireEventListeners( strEventId, strRowDOMId, dataItem )
  {
    const aEventListeners = m_mapEventListeners.get( strEventId );

    if ( aEventListeners )
    {
      for ( const fnEventListener of aEventListeners )
      {
        fnEventListener( strRowDOMId, dataItem );
      }
    }
  } // end fireEventListeners()

  /**
   *
   */
  function handleClear()
  {
    $(`#${m_strGridBodyId}` ).empty();
  }

  /**
   * Adds a data item to the row col view
   *
   * @param dataItemToAdd the data item to be added
   * @param bPrePend if true, prepend
   */
  async function handleAddItem( dataItemToAdd, bPrePend )
  {
    await addRow( dataItemToAdd, bPrePend );

  } // end handleAddItem()

  /**
   * Removes a data item from the grid
   *
   * @param dataItemToRemove The data item object to remove
   */
  function handleRemoveItem( dataItemToRemove )
  {
    const strRowId = getRowId( dataItemToRemove );

    $(`#${strRowId}`).remove();

  } // end handleRemoveItem()

  /**
   * Updates a data item
   *
   * @param dataItemToUpdate the data item object to update inthe grid
   */
  function handleUpdateItem( dataItemToUpdate )
  {

  } // end handleUpdateItem()


  /**
   * Config header props
   */
  function setupBodyProps()
  {
    $(`#${m_strGridBodyId}`).addClass( m_viewProps.cssGridBody );

    if ( m_viewProps.cssUserGridBody )
    {
      $(`#${m_strGridBodyId}`).addClass( m_viewProps.cssUserGridBody );
    }

  } // end setupHdrProps()

  /**
   * Setup specific actions for this view
   */
  function setupRowColProps()
  {
    m_viewProps.cssGridRowCol  = "VwGridRowCol";
    m_viewProps.cssGridRow  = "VwGridRow";

    $.extend( m_viewProps, gridProps );

    for ( const prop of viewSpec.props.prop )
    {
      m_viewProps[prop.id] = prop.value;
    } // end for()

  } // end setupRowColProps()


  /**
   * Loads the row/col data
   */
  async function loadRows()
  {
    const aRowData = m_dataModel.getDataSet();

    if ( !aRowData )
    {
      return;
    }

    for ( const dataRow of aRowData )
    {
      await addRow( dataRow );

    } // end for()

  } // end loadRows()


  /**
   * Adds a row to the grid data body
   *
   * @param dataRow the data object representing the row
   */
  async function addRow( dataRow, bPrepend )
  {
    const strRowEnvelopeHtml = render( dataRow );

    if ( bPrepend )
    {
      $(`#${m_strGridBodyId}`).prepend( strRowEnvelopeHtml );
    }
    else
    {
      $(`#${m_strGridBodyId}`).append( strRowEnvelopeHtml );
    }

    for ( const col of m_aHdrCols )
    {
      await addCol( dataRow, col, vwXPath );
    } // end for()

    const strRowId = getRowId( dataRow );

    firePostRowAddEvent( dataRow );

    addRowActionListeners( strRowId, dataRow );

  } // end addRow()

  /**
   * Call listeners callback for row just added
   * @param dataRow The data item added
   */
  function firePostRowAddEvent( dataRow )
  {
    for( const fnPostRowAddListener of m_mapPostRowAddListeners.values() )
    {
      fnPostRowAddListener( dataRow );
    }
  } // end firePostRowAddEvent()


  /**
   * Row click selection handler
   *
   * @param strRowDOMId the row's DOM Id
   * @param dataItem The row data item
   */
  function handleRowSelected( strRowDOMId, dataItem )
  {
    if ( m_curSelectedItem )
    {
      const strSelectedRowId = getRowId( m_curSelectedItem );

      if ( m_viewProps.cssRowSelected )
      {
        $(`#${strSelectedRowId}`).removeClass( m_viewProps.cssRowSelected );
      }

      fireEventListeners( m_strRowDeSelected, strRowDOMId, m_curSelectedItem )
    }

    m_curSelectedItem = dataItem;

    if ( m_viewProps.cssRowHovered )
    {
      $(`#${strRowDOMId}`).removeClass( m_viewProps.cssRowHovered );
    }

    if ( m_viewProps.cssRowSelected )
    {
      $(`#${strRowDOMId}`).addClass( m_viewProps.cssRowSelected );
    }

    fireEventListeners( m_strRowSelected, strRowDOMId, dataItem )

  } // end handleRowSelected()


  /**
   * Row double click handler
   *
   * @param strRowDOMId the row's DOM Id
   * @param dataItem The row data item
   */
  function handleRowDblClicked( strRowDOMId, dataItem )
  {
    // call thge single click handler to perform activate/deactivate previous selection
    handleRowSelected( strRowDOMId, dataItem );

    fireEventListeners( m_strRowDblClicked, strRowDOMId, dataItem )

  } // end handleRowDblClicked()

  /**
   * Adds a column to the row
   *
   * @param rowData The row data object
   * @param hdrColSpec the column hdr spec
   */
  async function addCol( rowData, hdrColSpec, vwXPath )
  {
    let strColClasses = m_viewProps.cssGridRowCol;
    if ( m_viewProps.cssUserGridRowCol )
    {
      strColClasses += " " + m_viewProps.cssUserGridBodyCol ;
    }

    // add the column envelope to the row
    const strRowId = getRowId( rowData );
    const strColContainerId = `${strRowId}_colContainer_${hdrColSpec.id}`;

    let strMinWidth;
    if ( hdrColSpec.minWidth )
    {
      strMinWidth = hdrColSpec.minWidth ;
    }
    else
    {
      strMinWidth = hdrColSpec.width ;

    }

    const strDataColHtml =
     `<div id="${strColContainerId}" class="${strColClasses}" style="width:${hdrColSpec.width};min-width:${strMinWidth}"></div>`

    $(`#${strRowId}`).append( strDataColHtml );

    const strColHtml = await renderColHtml( rowData, hdrColSpec, strColContainerId, vwXPath );

    // add the column rendering to the col envelope
    $(`#${strColContainerId}`).append( strColHtml );

  } // end addCol()

  /**
   * Renders column html for the data type of the column
   *
   * @param rowData
   * @param hdrColSpec
   * @param strColContainerId
   *
   * @return {*}
   */
  async function renderColHtml( rowData, hdrColSpec, strColContainerId, vwXpath )
  {
    let strColDataType;

    if ( hdrColSpec.sortType )
    {
      strColDataType = hdrColSpec.sortType;
    }
    else
    {
      strColDataType = hdrColSpec.type;
    }

    if ( !strColDataType )
    {
      strColDataType = "text";
    }

    switch( strColDataType )
    {
      case "text":
      case "number":
      case "float":
      case "filler":

        return renderTextDataCol( rowData, hdrColSpec, vwXpath );

      case "img":

        return renderImgDataCol( rowData, hdrColSpec, vwXPath );

      case "date":

        return renderDateDataCol( rowData, hdrColSpec, vwXpath );

      case "custom":

        return await renderCustomControl( rowData, hdrColSpec, strColContainerId, vwXpath );

    } // end switch()

  } // end renderColHtml()

  /**
   * Renders html for a text column type
   * @param rowData
   * @param hdrColSpec
   */
  function renderTextDataCol( rowData, hdrColSpec )
  {
    const strColId = getColId( rowData, hdrColSpec );

    let strClass = getColClass( hdrColSpec );

    let strColData;

    if ( hdrColSpec.format )
    {
      strColData = processColDataFormat( rowData, hdrColSpec );
    }
    else
    {
      let strId;
      if ( hdrColSpec.dataId )
      {
        strId = hdrColSpec.dataId ;
      }
      else
      {
        strId = hdrColSpec.id ;

      }

      if ( hdrColSpec.type == "filler" )
      {
        strColData = "&nbsp;";
      }
      else
      {
        strColData = rowData[strId];
      }
    }

    return `<span id="${strColId}" class="${strClass}"}>${strColData}</span>`;
    
  } // end renderTextDataCol()

  /**
   * Return html for an img col type
   *
   * @param rowData
   * @param hdrColSpec
   * @return {string}
   */
  function renderImgDataCol( rowData, hdrColSpec )
  {
    const strColId = getColId( rowData, hdrColSpec );
    let strClass = getColClass( hdrColSpec );

    let strDataId;
    if ( hdrColSpec.dataId )
    {
      strDataId = hdrColSpec.dataId ;
    }
    else
    {
      strDataId = hdrColSpec.id ;
    }
    return `<img id="${strColId}" src="${rowData[strDataId]}" class="${strClass}"}/>`;

  } // end renderImgDataCol()


  /**
   * Renders a date
   * @param rowData
   * @param hdrColSpec
   * @return {string}
   */
  function renderDateDataCol( rowData, hdrColSpec )
  {
    const strColId = getColId( rowData, hdrColSpec );

    let strClass = getColClass( hdrColSpec );
    let strColData;

    if ( hdrColSpec.format )
    {
      strColData = processColDataFormat( rowData, hdrColSpec );
    }
    else
    {
      strColData = rowData[hdrColSpec.id];
    }

    return `<span id="${strColId}" class="${strClass}"}>${strColData}</span>`;

  } // end renderTextDataCol()


  /**
   * Renders a custom control
   *
   * @param rowData  The data item representing the row
   * @param hdrColSpec The header column spec
   * @param strColContainerId the columns container id
   *
   * @return {Promise<void>}
   */
  async function renderCustomControl( rowData, hdrColSpec, strColContainerId )
  {
    if ( hdrColSpec.impl == "callback" )
    {
      const fnOnControlCreate = m_mapCustomControlImpl.get( hdrColSpec.id );
      if ( !fnOnControlCreate )
      {
        throw `No callback handler was specified for custom control for col id: ${hdrColSpec.id}. You invoke the onControlCreate function on the gridViewer`;
      }

      hdrColSpec.controlInstance = fnOnControlCreate( strColContainerId, hdrColSpec, rowData );

      return;
    }

    let vwClass;

    if ( hdrColSpec.impl.endsWith( ".js") )
    {
      vwClass =  await VwClass.forModule( hdrColSpec.impl );
    }
    else
    {
      vwClass =  await VwClass.forName( hdrColSpec.impl );
    }

    const constructor = vwClass.getConstructor();

    const strControlParentId = `${getRowId(rowData)}_envelope`;

    $(`#${strColContainerId}`).addClass( `${hdrColSpec.class}`);

    const strControlEnvelopeHtml = `<div id="${strControlParentId}"></div>`;
    $(`#${strColContainerId}`).append( strControlEnvelopeHtml );

    const aConstructorArgs = getControlConstructorArgs( hdrColSpec, rowData, strControlParentId, vwXPath );

    hdrColSpec.controlInstance = await constructor.newInstance( aConstructorArgs );

    const fnOnControlCreated = m_mapCustomControlCreated.get( hdrColSpec.id );

    if ( fnOnControlCreated )
    {
      await fnOnControlCreated( rowData, hdrColSpec.controlInstance );
    }

  } // end renderCustomControl()


  function getControlConstructorArgs( hdrColSpec, rowData, strColContainerId )
  {
    let controlProps;

    if ( !hdrColSpec.args )
    {
      return null; // No constructor args, so we're done
    }

    if ( hdrColSpec.props  )
    {
      controlProps = {};

      let aControlProps;

      if ( hdrColSpec.props.prop )
      {
        aControlProps = hdrColSpec.props.prop ;
      }
      else
      {
        aControlProps = vwXPath.evaluate(hdrColSpec.props ).prop;
      }

      for( const prop of aControlProps )
      {
        controlProps[prop.id] = prop.value;
      }
    }

    const constructorArgs = [];

    const aArgs = hdrColSpec.args.value.split( ",");

    for ( const arg of aArgs )
    {
      let argVal;

      switch( arg )
      {
        case "$parentId":

          argVal = strColContainerId;
          break;

        case "$null":

          argVal = null;
          break;

        case "$props":

          argVal = controlProps;
          break;

        case "$data":

          argVal = rowData ;
          break;

        default:

          argVal = arg;
          break;

      } // end switch()

      constructorArgs.push( argVal );

    } // end for()

    return constructorArgs;

  } // end getControlConstructorArgs()
  /**
   * Calls the column formater
   *
   * @param rowData The data item
   * @param hdrColSpec
   * @return {*}
   */
  function processColDataFormat( rowData, hdrColSpec)
  {
    let strColData;

    if ( hdrColSpec.format == "dynamic")
    {
      const fnFormatHandler = m_mapColFormatters.get( hdrColSpec.id  );
      if ( !fnFormatHandler )
      {
        throw `Format specifer for column id: ${hdrColSpec.id} was specified as dynamic but no functionhandler was specified. Use onColFormat api to define.`
      }

      strColData = fnFormatHandler( rowData[hdrColSpec.id] );
    }
    else
    {
      let strColType;

      if ( hdrColSpec.type )
      {
        strColType = hdrColSpec.type
      }
      else
      if ( hdrColSpec.sortType )
      {
        strColType = hdrColSpec.sortType
      }
      else
      {
        strColType = "text";
      }

      if ( strColType == "date" )
      {
        strColData = VwDate.format( rowData[hdrColSpec.id], hdrColSpec.format );
      }
      else
      {
        strColData = VwExString.formatString(rowData[hdrColSpec.id], hdrColSpec.format )
      }

    } // end else

    return strColData;

  } // end processColDataFormat()

  /**
   * Open the request folder
   * 
   * @param folderDataItem
   */
  async function handleOpenFolder( folderDataItem )
  {
    const aFolderItems = m_dataModel.getFolderItems( folderDataItem[m_dataIdProp] );

    handleClearView();

    for ( const dataItem of aFolderItems )
    {
      await addRow( dataItem );
    }

  } // end handleOpenFolder()

  function handleClearView()
  {
    $(`#${m_strGridBodyId}`).empty();
  }

  /**
   * Item hover in handler
   *
   * @param dataItem The associated data for the row hovered
   */
  function handleIRowHoveredIn( strRowId, dataItem )
  {
    if ( m_viewProps.cssRowHovered )
    {
      $(`#${strRowId}`).addClass( m_viewProps.cssRowHovered );
    }

    fireEventListeners( m_strRowHoveredIn, strRowId, dataItem );

  } // end handleIRowHoveredIn()


  /**
   * Item hover in handler
   *
   * @param dataItem The associated item on the hover
   */
  function handleIRowHoveredOut( strRowId, dataItem )
  {
    if ( m_viewProps.cssRowHovered )
    {
      $(`#${strRowId}`).removeClass( m_viewProps.cssRowHovered );
    }

    fireEventListeners( m_strRowHoveredOut, strRowId, dataItem );

  } // end handleIRowHoveredIn()

  /**
   *
   * @param rowData
   * @return {string}
   */
  function getRowId( rowData )
  {
    return `${m_strGridBodyId}_${rowData[m_dataIdProp]}`;

  } // end getRowId()

  /**
   * Returns the column id from the row data object and col hdr spec
   *
   * @param rowData The row data containing  the unique id
   * @param hdrColSpec The hdr col spec containing the hdr column id
   * @return {string}
   */
  function getColId( rowData, hdrColSpec )
  {
    return `${getRowId(rowData)}_col_${hdrColSpec.id}`;

  } // end getColId()

  /**
   * Returns class list for column
   *
   * @param hdrColSpec The col hdr spec
   * @return {string}
   */
  function getColClass( hdrColSpec )
  {
    let strClass= m_viewProps.cssGridRowCol;

    if ( hdrColSpec.class )
    {
      strClass += " " + hdrColSpec.class;
    }
    else
    if ( m_viewProps.cssUserGridRowCol )
    {
      strClass += " " + m_viewProps.cssUserGridRowCol;
    }

    return strClass;

  } // end getColClass()

  /**
   * Converts obj to an array if not an array
   * @param obj
   * @return {*|*[]}
   */
  function toArray( obj )
  {
    if (Array.isArray( obj ))
    {
      return obj;
    }

    return [obj];

  } // end toArray()

} // end VwRowColViewMgr{}

export default VwRowColViewMgr;
