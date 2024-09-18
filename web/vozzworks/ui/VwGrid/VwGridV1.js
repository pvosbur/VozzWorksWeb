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

import VwComponent            from "/vozzworks/ui/VwComponent/VwComponent.js";
import VwGridDataModel from "./VwGridDataModel.js";
import VwHashMap              from "../../util/VwHashMap/VwHashMap.js";
import VwStack                from "../../util/VwStack/VwStack.js";
import VwExString             from "../../util/VwExString/VwExString.js";
import VwColResizer           from "../VwColResizer/VwColResizer.js";
import VwTile                 from "../VwTile/VwTile.js";
import VwTileRow              from "../VwTileRow/VwTileRow.js";
import VwScrollBar            from "../VwScrollBar/VwScrollBar.js";
import VwUtils                from "../../util/VwUtils/VwUtils.js";
import VwUiUtils              from "../VwCommon/VwUiUtils.js";
import VwBreadCrumbMgr        from "../VwBreadCrumbMgr/VwBreadCrumbMgr.js";
import VwButton               from "../VwButton/VwButton.js";

VwCssImport( "/vozzworks/ui/VwGrid/style");

/**
 *
 * @param strParentId   Required. The id of an HTML element (typically an empty div or span element).
 * @param dataModel  Required A class that manages the data used by the grid for display. The data model must implement the following
 * minimum functions:
 *   registerDataChangeListener( strListenerId, fnEventHandler ) and the model must invoke these events
 *     "add", objectAdded
 *     "del", objectDeleted
 *     "update", object updated
 *     "clear" this will clear the grid
 *
 *   getFolderItems( strFolderId ) this should return the object items that belong to a folder
 *
 * @param vwGridParent  Optional - Instance of a parent VwGrid.
 * @param gridMain      Optional - Instance of the top, main VwGrid instance.
 *
 * @param gridProps  Optional - The grid properties take the following form:
 *
 *  htmlHdrTemplate: String - Optional. An HTML template for what will style the header, if omitted, a standard button style header is created for each column defined.
 *  caseSensitiveSort: Boolean - If true, String sort columns are sorted case sensitive. The default is false case insensitive.
 *
 *  The Following css classes my be overridden:
 *
 *  cssGrid: String - One or more space delimited class names to be applied to the Grid control control itself -- default VwGrid.
 *  cssGridHdr: String - One or more space delimited class names to be applied to grid column header -- default - VwGridStdHdrCol.
 *  cssGridStdHdrCol: String - One or more space delimited class names to be applied to grid column header -- default - VwGridHdr.
 *  cssGridHdrImg:  String - One or more space delimited class names to be applied to grid column header img -- default - VwGridHdrImg.
 *  cssGridHdrText:String - One or more space delimited class names to be applied to grid column header -- default - VwGridHdrText.
 *  cssGridBody: String - One or more space delimited class names to be applied to grid body -- default VwGridBody.
 *  cssGridBodyWrap: String - One or more space delimited class names to be applied to grid body wrap.
 *  cssGridRow: String - One or more space delimited class names to be applied to each grid row -- default VwGridRow.
 *  cssColContainer: String - One or more space delimited class names to be applied to each grid column conttainer -- default VwGridColContainer.
 *  cssGridSortArrow: String - One or more space delimited class names to be applied to grid column sort arrow -- default VwGridSortArrow.
 *  cssRowHovered: String - The name of a css class that will be applied to a row / tile when hovered.
 *  cssRowSelected: String - the name of a css class that will be applied to a row that is selected (see below cssTileSelected for tile views).
 *  cssImg: String - the name of a class to be used for all  img properties.
 *  dataIdProp: String - The property name in the data object that uniquely identifies the row - optional but highly recommended.
 *  maintainRowNbr: Boolean - True to add a row nbr id on each div row. the default is false - optional.
 *  displayHeader: Boolean - If false, don't display a grid column header.
 *  bodyHeight: String - The initial height of the grid body. Vertical scroll bar will sown when total row height exceeds this value.
 *  maxBodyHeight: String - Max height of the grid body. Vertical scroll bar will sown when total row height exceeds this value.
 *  showGridLines: Boolean - True to show, false to hide. true is the default.
 *  rowStripOdd: String - Apply row striping on odd rows the string value is the stripe color or a # for the default which is the color value #eeeeee.
 *  rowStripEven: String - Apply row striping on even rows the string value is the stripe color or a # for the default which is the color value #eeeeee.
 *  rowSelectionColor: String - The color of the selected row if ( allowItemSelection is true, the default is false) the default is #eeeeee.
 *  allowItemSelection: Boolean - If true, allows a row / tile to be selected and provide a visual selection state.
 *  allowMultipleItemSelections: Boolean - If true, allows multiple rows / tiles to be selected.
 *  allowColumnReorder: Boolean - If true, allow the column order to be changed by dragging a column over the one it should precede.
 *  defaultForNull: String - A default value to be used on data properties that are undefined or null. The default is an empty string.
 *  postViewChange: Function - A callback function that will be invoked any time the grid is changed due to invoking  applyFilter, sort or displayAll methods. The function callback takes the form function(gridInstance, currentViewObjects (an array of your data objects representing the current view state).
 *  viewSetup: Function - A function callback that is invoked any time a showView method is invoked. It is called after the new HTML is in place so that action handlers and other configObject code can be run for the new grid state. It take the form function( gridInstance, strViewName, strViewStyle ).
 *  postRowAdd: Function - A function callback that will be invoked after a row has been added to the grid. The callback takes the form function( gridInstance, objData ). All DOM functions can be performed.
 *  postTileAdd: Function - A function callback that will be invoked after a tile has been added to the grid. The callback takes the form function( gridInstance, objData ). All DOM functions can be performed.
 *  postTileActionHandler:Function:Optional A function to invoke for re applying action handers to the newly created tiles on add update and deletes
 *  sortArrowImgDown: String - Optional image path to the header sort arrow. The default is vozzworks/images/vw_black_arrow_down.
 *  sortArrowImgUp: String - Image path to the header sort arrow. The default is vozzworks/images/vw_black_arrow_up.
 *  resizeColumns: Boolean - If true, columns width can be resized via the user drag event. Default is false.
 *
 *  Bread Crumb configuration:
 *
 *  breadCrumbParentId: String - Required. The element ID where to install the bread crumb manager.
 *  breadCrumbBaseName: String - The name for the BASE/ROOT starting state, folder or location.
 *  breadCrumbBaseNameId: Integer - Required. The ID that identifies the BASE/ROOT folder. Suggested: -1.
 *  breadCrumbIdProp: String - The data object property name with the value to identify the asset.
 *  breadCrumbLinkProp: String - The data object property name with the title value for the asset.
 *  breadCrumbClick: Function - A callback function executed when a bread crumb navigation handleClick occurs. It takes the form of function().
 *  cssBreadCrumbBar:String:Optional The css class assigned to the bread crumb bar
 *  Folder support configuration:
 *
 *  allowFolderMoves:Boolean:Optional If false folders may not be moved
 *  folderColExpanderId: String - .
 *  folderColumnId: String - .
 *  folderOpenIcon: String - The image url path to be used as the folder expand icon.
 *  folderCloseIcon: String - The image url path to be used as the folder collapse icon.
 *  folderIdProp: String - The data object property name with the value that specifies a folder type;
 *  folderIdValue: String - The data object property value that specifies the folder type;
 *  folderDataIdProp: String - The data object property name with the folder assets.
 *  folderIndentWidth: String - The indentation width to be used when expanding a folder.
 *  cssFolderAssetRow: String - Name of one or more space delimited class names.
 *  cssFolderRow: String - Name of one or more space delimited class names.
 *  fnFolderOpenEvent: Function - A call back function invoked when a folder is opened. It takes the form of function( objFolderToExpand, folderGrid ).
 *  fnFolderCloseEvent: Function - A call back function invoked when a folder is closed. It takes the form of function( folderCollapsing, folderExpanding, folderExpandingGrid ).
 *  fnFolderExpandedEvent: Function - A call back function invoked when a folder is expanded. It takes the form of function( folder ).
 *  fnFolderCollapsedEvent: Function - A call back function invoked when a folder is collapsed. It takes the form of function( folder ).
 *  fnFolderGridCreatedEvent: Function - A call back function invoked when a folder VwGrid instance is created. It takes the form of function( objFolderRow, vwRowSubGrid ).
 *  fnFolderItemMovedEvent: Function - A call back function invoked when a folder item is moved. It takes the form of function( tileBeingDropped, parentFolder, tileFolderDroppedOn ).
 *
 *  Search/filter configuration:
 *
 *  textFilterPropId: String/String Array - Defines the property in the grid data to be queried.
 *  matchType: Integer - Use one of the Grid constants: VwGrid.STARTS_WITH, VwGrid.CONTAINS, VwGrid.ENDS_WITH. Default is VwGrid.CONTAINS.
 *  caseSensitive: Boolean - If true, search is case sensitive. The default is false.
 *
 *  aHdrCols: Array - An objects array of header column definitions. Required if a Tile View is not defined
 *
 *    id: String - The grid hdr id - required
 *    dataId: String - The property in the data object that will be used to display column data.
 *    dataVal: String - A literal value to use for all rows
 *    dynamic: Function - A callback function to dynamicially resoly a value
 *    toolTipId: String - The property in the data object that will be used to display a tooltp on the column
 *    toolTip: String - A string containing the text that will display as a tooltip
 *    sortType: String: - must be one of the following "s" for string type, "n" for number type, "f" for float type,  "d" for date type.
 *
 *    htmlDataTemplate: String - An HTML template that can be used to create a custom column. The HTML defines the look of the column. Do not specify the colType property when using this.
 *    colType: String - values are 'txt' the default, 'etxt' editable text, 'img' -- image for the column data 'chk' - standard check box, 'vwChk' a VwCheckBox, 'vwCbo' a VwComboBox, 'btn' a button control, 'seq' a sequence, 'custom' a custom control: see property customInstaller below.
 *    customInstaller: Function - colType: "custom" (see line above) is required when using a custom installer. Callback invoked to install the control in the form customInstaller( strParent, objRowData ).
 *
 *    seqStartVal: Integer - The starting value of the sequence. The default is 1.
 *    title: String - Required. The text that appears in the header column.
 *    img: String - Path to the image file that displays an icon in the header instead of text. This is mutually exclusive with the title attribute.
 *    width: String - Optional. The width of the column, can be in any legal metric units or as a %.
 *    minWidth: String - Optional. The min-width of the column, can be in any legal metric units or as a %.
 *    cssColData: String - One or more space separated classes that is applied to the control type for the column.
 *    cssColContainer: String - One or more space separated classes that is applied to the parent div of the columns.
 *    handleClick: Function - A function handler for a handleClick event on this column. The function is passed the object that is used for the current row.
 *    hover: Function - A function handler for a hover event the function is passed two parameters a boolean that is true for move over and false for mouse leave and the object that represents the row. You may add any additional properties that can be used in hdrColTemplate, see hdrColTemplate below.
 *    hdrColTemplate: String - An HTML Template that defines the column. Helpful for a complex column with specialized formatting. The template can contain ${propName} placeholders that will be replaced with the values of the column header object properties.
 *
 *  tileProps: Object - An object that defines a tile view and has the following properties:
 *
 *    cssTileRow: String - Name of one or more space delimited class names. Default is "VwTileRow".
 *    cssTileSelected: String - Name of the class to add when a tile is clicked on (selected).
 *    maxRowTiles: Integer - The maximum tiles in a tile row. A New Tile row will be created when the this value is reached.
 *    tileTemplate: String - An HTML tile template to be applied to all tiles in the row unless overridden in the VwTile constructor.
 *    tileGap: String/Integer - The space gap between tiles. This may be an integer which defaults to pixels or a string with measurement units like ".2em".
 *
 * @constructor
 */
function VwGridV1( strParentId, dataModel, gridProps, vwGridParent, gridMain )
{
  if ( arguments.length == 0 )
  {
    return; // subclass prototype call
  }
  const self = this;
  const m_mapGridDataByRowId = new VwHashMap();
  const m_mapRowSubGrids = new VwHashMap();
  const m_mapSortDescriptors = new VwHashMap();
  const m_mapPrivateMethods = new VwHashMap();

  let   m_mapGridViews = new VwHashMap();

  let   m_strParentId = strParentId;
  let   m_strGridId = strParentId;

  let VW_ROW_ID_PREFIX = m_strParentId + "_";
  let VW_DATA_OBJ_PREFIX = "data-objndx='" + m_strParentId + "_";
  let VW_GRID_PREFIX = "vwGridBody_";
  let VW_GRID_EXTENDER_SUFFIX = "_extender";
  let VW_GRID_HDR_ID = "vwGridHdr_" + m_strParentId;
  let VW_GRID_BODY_ID = VW_GRID_PREFIX + m_strParentId;

  let m_gridParent = vwGridParent;
  let m_gridMain;
  let m_vwVertScrollBar;
  let m_vwHorzScrollBar;

  let m_tileDndMgr;
  let m_strTileBeingDraggedId;
  let m_colDndMgr;
  let m_strDataIdProp;

  let DATA_TRANSFER_TYPE = "text/plain";

  let m_aSubFolders = [];
  let m_aTileRows = [];

  let m_aColOverlays = [];
  let m_objSort;
  let m_nSeqNbr;
  let m_elementDragged;
  let m_nBodyDiff;

  let m_breadCrumbMgrUi;
  let m_breadCrumbModel;
  let m_bLoading = false;
  let m_aHdrCols = [];
  let m_nTotColWidth = 0;
  let m_nRowCount = 0;
  let m_curSortColId = null;
  let m_fnSelectionHandler = null;
  let m_fnDblClickHandler = null;
  let m_fnCellSelectionHandler = null;
  let m_fnRowHoverHandler = null;
  let m_thisGrid = this;
  let m_aSelectedItemIds = null;
  let m_fItemMoving = false;
  let m_nEmSize;
  let m_gridProps;
  let m_fColEleEditMode;
  let m_colorThemeMgr;

  // Public methods

  this.setHdrColumnSortArrow = setHdrColumnSortArrow;
  this.addView = addView;
  this.handleDataChangeEvent = handleDataChangeEvent;
  this.addAllColClass = addAllColClass;
  this.addColClass = addColClass;
  this.addColContainerClass = addColContainerClass;
  this.addColSelectionHandler = addColSelectionHandler;
  this.addFilter = addFilter;
  this.addRowSubGrid = addRowSubGrid;
  this.addRowHoverHandler = addRowHoverHandler;
  this.addRowClass = addRowClass;
  this.applyRowStriping = applyRowStriping;
  this.applyActiveSort = applyActiveSort;
  this.applyFilter = applyFilter;
  this.applyTextFilter = applyTextFilter;
  this.applyGridFilter = applyGridFilter;
  this.createRowContentExtender = createRowContentExtender;
  /**
   * @deprecates
   * @type {handleClick}
   */
  this.click = handleClick;
  this.onClick = handleClick;

  /**
   * @deprecated
   * @type {handleDblClick}
   */
  this.dblClick = handleDblClick;
  this.onDblClick = handleDblClick;

  this.displayAll = displayAll;
  this.displaySortArrow = displaySortArrow;
  this.displayRowCol = displayRowCol;
  this.expand = expandToTop;
  this.existsByRowId = existsByRowId;
  this.existsByColVal = existsByColVal;
  this.getAllRowSubGrids = getAllRowSubGrids;
  this.getAllFolders = getAllFolders;
  this.getBreadCrumbModel = getBreadCrumbModel;
  this.updateColumnProps = handleUpdateColumnProps;
  this.getColClass = getColClass;
  this.colNbrFromColId = colNbrFromColId;
  this.getColDataByRowId = getColDataByRowId;
  this.getColId = getColId;
  this.getColOverlayDataByRowId = getColOverlayDataByRowId;
  this.getCanonicalColId = getCanonicalColId;
  this.getCanonicalColContainerId = getCanonicalColContainerId;
  this.getCanonicalObjectId = getCanonicalObjectId
  this.getCurrentSortColumn = getCurrentSortColumn;
  this.getCurrentFilter = getCurrentFilter;
  this.getCurrentViewName = getCurrentViewName;
  this.getCurrentStyle = getCurrentStyle;
  this.getCustomControl = getCustomControl;
  this.getDataByEvent = getDataByDragEvent;
  this.getDataByClickEvent = getDataByClickEvent;
  this.getDataObjectById = getDataObjectById;
  this.getDataModel = getDataModel;
  this.setDataModel = setDataModel;
  this.getFilteredSize = getFilteredSize;
  this.getFolders = getFolders;
  this.getGridBodyId = getGridBodyId;
  this.getGridConfig = getGridConfig;
  this.getGridId = getGridId;
  this.getGridProps = getGridProps;
  this.getHeaderHeight = getHeaderHeight;
  this.getManagedFolderId = getManagedFolderId;
  this.getNonFilteredData = getNonFilteredData;
  this.getParentGrid = getParentGrid;
  this.getParentHdrId = getParentHdrId;
  this.getParentId = getParentId;
  this.getRowClass = getRowClass;
  this.getRowId = getRowId;
  this.getRowSubGrid = getRowSubGrid;
  this.getSize = getSize;
  this.getSelectedObject = getSelectedObject;
  this.getSelectedObjects = getSelectedObjects;
  this.getSelectedRowCount = getSelectedRowCount;
  this.getVertScrollBar = getVertScrollBar;
  this.getHorzScrollBar = getHorzScrollBar;
  this.hasColClass = hasColClass;
  this.hasColHdr = hasColHdr;
  this.moveFolder = moveFolder;
  this.moveFolderItem = moveFolderItem;
  this.openFolder = openFolder;
  this.closeFolder = closeFolder;
  this.isFolderOpen = isFolderOpen;
  this.refreshHdr = refreshHdr;
  this.removeColClass = removeColClass;
  this.removeColContainerClass = removeColContainerClass;
  this.removeAllColClass = removeAllColClass;
  this.removeRowSubGrid = removeRowSubGrid;
  this.removeRowClass = removeRowClass;
  this.reopenOpenedFolders = reopenOpenedFolders;
  this.refresh = refresh;
  this.refreshData = refreshGridRowData;
  this.select = select;
  this.unselect = unselect;
  this.selectRow = selectRow;
  this.selectRows = selectRows;
  this.setBodyHeight = setBodyHeight;
  this.setBodyWrapHeight = setBodyWrapHeight;
  this.setBreadCrumbModel = setBreadCrumbModel;
  this.setGridId = setGridId;
  this.setGridLineColor = setGridLineColor;
  this.setGridLineAttrs = setGridLineAttrs;
  this.setGridProps = setGridProps;
  this.setMaxBodyHeight = setMaxBodyHeight;
  this.setRowGridLineColor = setRowGridLineColor;
  this.setRowGridLineAttrs = setRowGridLineAttrs;
  this.setColContainerStyle = setColContainerStyle;
  this.setColGridLineColor = setColGridLineColor;
  this.setColGridLineAttrs = setColGridLineAttrs;
  this.setColStyle = setColStyle;
  this.setToolTipOnRowCol = setToolTipOnRowCol;
  this.setColorThemeMgr = (colorThemeMgr ) => m_colorThemeMgr == colorThemeMgr;
  this.setItemMoving = setItemMoving;
  this.showColumns = showColumns;
  this.showExtender = showExtender;
  this.showGridLines = showGridLines;
  this.showRowSubGrid = showRowSubGrid;
  this.showView = showView;
  this.sort = sort;
  this.sortColumn = sortColumn;
  this.toggleRowHoverOverlays = toggleRowHoverOverlays;
  this.updateColByRowNbr = updateColByRowNbr;
  this.updateColById = updateColById;
  this.updateColForAllRows = updateColForAllRows;
  this.updateColOverlayData = updateColOverlayData;
  this.resize = resizeScrollBars;

  if ( gridMain )
  {
    m_gridMain = gridMain;
  }
  else
  {
    m_gridMain = getTopLevelGrid();
  }

  if ( dataModel )
  {
    if ( !m_gridParent )
    {
      setDataModel( dataModel );
    }
  }
  else
  {
    throw "A Grid Data Model is required. Either the VwGridDataModel or a custom data model that implememnts the required public methods/Funtopns is required";
  }

  m_gridProps = configProperties( gridProps );


  if ( window.navigator.userAgent.indexOf( "Trident/7.0" ) > 0 )
  {
    DATA_TRANSFER_TYPE = "Text";
  }

  let strViewName = m_gridProps.viewName;

  if ( !strViewName )
  {
    strViewName = "main";
  }

  m_mapGridViews.put( strViewName, m_gridProps );

  if ( m_gridProps.breadCrumbParentId )
  {
    setupFolderPathBreadCrumbMgr();
  }

  if ( m_gridProps.folderIdProp )
  {

    if ( typeof gridProps.allowDrag != "undefined" )
    {
      m_gridProps.allowDrag = gridProps.allowDrag;
    }
    else
    {
      m_gridProps.allowDrag = true;
    }

    if ( typeof gridProps.allowDrop != "undefined" )
    {
      m_gridProps.allowDrop = gridProps.allowDrop;
    }
    else
    {
      m_gridProps.allowDrop = true;
    }
  }


  // Install hidden functions
  if ( !vwGridParent )
  {
    this["_mapFilteredDataIds"] = new VwHashMap();
    this["_mapFilterProps"] = new VwHashMap();
    this["_folderMeta"] = new VwHashMap();
    this["_mapSubGrids"] = new VwHashMap();
    this["_mapGridDataById"] = new VwHashMap();
    this["_mapCustomControlByRowColId"] = new VwHashMap();
    this["_folderParentStack"] = new VwStack();
    this["_fFolderExpanding"] = false;
    this["_aAllFolders"] = [];
    this["_strCurFilter"] = null;
    this["_expandedViewGrid"] = null;
    this["_itemDragged"] = null;
    this["_fNoDragEnter"] = false;
    this["_setParentGrid"] = setParentGrid;
    this["_strBodyId"] = VW_GRID_BODY_ID;
    this["_strResizeColMetric"] = "";
    this["_strCurViewStyle"] = "";
    this["_strCurViewName"] = "";
    this["_nOrigRowWidth"] = 0;
    this["_mapGridViews"] = m_mapGridViews;
    this["_curExpandedFolder"];

    if ( m_gridProps.textFilterPropId )
    {
      const filterProps = {};

      const aFilterPropIds = m_gridProps.textFilterPropId.split( "," );

      filterProps.textFilterPropId = aFilterPropIds;
      filterProps.caseSensitive = m_gridProps.caseSensitive;
      filterProps.matchType = m_gridProps.matchType;

      addFilter( "VwTextFilter", filterProps );
    }


  } // end if (!vwGridParent)

  //apply these to all grids
  m_mapPrivateMethods.put( "add", add );
  m_mapPrivateMethods.put( "prepend", add );
  m_mapPrivateMethods.put( "addAll", addAll );
  m_mapPrivateMethods.put( "remove", removeEntry );
  m_mapPrivateMethods.put( "update", update );
  m_mapPrivateMethods.put( "clear", clear );

  this["_mapPrivateMethods" ] = m_mapPrivateMethods;
  this["_sortGridData"] = sortGridData;
  this["_removeGridData"] = removeGridData;

  showView( strViewName, m_gridMain._strCurViewStyle );

  /**
   * Creates an div element following the last column for the purpose of having sub row content
   *
   * @param strRowId The id of the row to create the extender div element
   * @param strCssExtender Optional class added to this div
   *
   * @return "" The id of the new div extender
   */
  function createRowContentExtender( strRowId, strCssExtender )
  {
    const strGridRowId = m_strGridId + "_" + strRowId;

    const strRowExtenderId = strGridRowId + VW_GRID_EXTENDER_SUFFIX;

    // See if one already exists and return the id if it does

    if ( $( "#" + strRowExtenderId ).length > 0 )
    {
      return strRowExtenderId;

    }

    $( "<div id='" + strRowExtenderId + "' style='display:none'></div>" ).insertAfter( "#" + strGridRowId );

    $( "#" + strRowExtenderId ).addClass( strCssExtender );

    return strRowExtenderId;

  }

  /**
   * Show/Hide Extender
   *
   * @param strRowId
   * @param fShow
   */
  function showExtender( strRowId, fShow )
  {
    const strGridRowId = m_strGridId + "_" + strRowId;
    const strRowExtenderId = strGridRowId + VW_GRID_EXTENDER_SUFFIX;


    if ( fShow )
    {
      $( "#" + strRowExtenderId ).show();
      $( "#" + strRowExtenderId ).next().css( "margin-top", "-4px" );
    }
    else
    {
      $( "#" + strRowExtenderId ).hide();
      $( "#" + strRowExtenderId ).next().css( "margin-top", "0px" );

    }

  }

  /**
   * Handles data change events from the model
   * @param strChangeId The change event id. Will be one of:
   *        "add" - The the data object to the grid
   *        "update" - Update a data object in the grid
   *        "del" - Removes the entry in the clear
   *        "clear" -- clears the grid
   *
   * @param dataItem The user data item to be added to the grid
   */
  function handleDataChangeEvent( strChangeId, dataItem )
  {
    let curGrid  = m_gridMain;

    let strFolderParent;

    // Get the data item's parent grid
    if ( gridProps.parentFolderIdProp && dataItem)
    {
      strFolderParent = dataItem[gridProps.parentFolderIdProp];
      const gridParent = m_gridMain._mapSubGrids.get( strFolderParent );
      
      if ( gridParent )
      {
        curGrid = gridParent;
      }

     }

    switch( strChangeId )
    {
      case "add":
      case "prepend":

        const fnAdd = curGrid._mapPrivateMethods.get( "add" );

        if ( strChangeId == "prepend")
        {
          fnAdd( dataItem, null, "p" );
        }
        else
        {
          fnAdd( dataItem );
        }
        break;

      case "update":

        const fnUpdate = curGrid._mapPrivateMethods.get( "update");
        fnUpdate( dataItem );

        break;

      case "del":

        const fnRemove = curGrid._mapPrivateMethods.get( "remove");
        fnRemove( dataItem );
        break;

      case "clear":

        const fnClear = curGrid._mapPrivateMethods.get( "clear");
        fnClear();
        break;

      case "resize":

        resizeScrollBars();
        break;

    } // end switch()

    // If the current folder is affected by the operation, and is currently open then close and reopen the folder
    // to visually see the result
    if ( strFolderParent )
    {
      if ( isFolderOpen( strFolderParent) )
      {
        closeFolder( strFolderParent );
        openFolder( strFolderParent );

      }
    }
  } // end handleDataChangeEvent()

  /**
   * Returns the grids data model
   * @returns {*|VwGridDataModel}
   */
  function getDataModel()
  {
    return m_gridMain._gridDataModel;
  }

  /**
   * Refresh (repaints) the grid using the current view name and style.
   */
  function refresh()
  {
    showView( m_thisGrid.getCurrentViewName(), self.getCurrentStyle() );

    // Invoke callback handler if defined
    if ( m_gridProps.postViewChange )
    {
      m_gridProps.postViewChange.call( self, self, getDataModel().getDataSet() );
    }
  }

  /**
   * Refresh all grid row data
   */
  function refreshGridRowData()
  {
    //$( "#" + VW_GRID_BODY_ID ).empty();
    $( "#" + m_gridMain._strBodyId ).remove();
    buildGridRowData();

  }

  /**
   * Expand folder or grid to the top
   * @param objFolderToExpand
   * @param fClosing Boolean. If TRUE we're expanding. FALSE we're collapsing.
   */
  function expandToTop( objFolderToExpand, fClosing )
  {

    if ( self.getGridId() != m_gridMain.getGridId() )
    {
      m_gridMain.expand( objFolderToExpand, fClosing );
      return;
    }
    
    m_gridMain._fFolderExpanding = true;
    m_gridMain._gridParent = true;

    if ( objFolderToExpand.assetIdPk > 0  )
    {
      m_gridMain._curExpandedFolder = objFolderToExpand;
    }
    else
    {
      m_gridMain._curExpandedFolder = null  ;
    }

    const objExpandProperties = m_gridMain.getGridProps();

    objExpandProperties.hdrWidth = getGridHdrWidth();

    self.setGridProps( objExpandProperties );

    displayNonFilteredResults();

    if ( m_gridProps.resizeColumns )
    {
      convertGridToPx();
      convertGridToMetric( m_gridMain._strResizeColMetric );
    }

    m_gridMain._fFolderExpanding = false;

    if ( fClosing )
    {
      closeAllFolders();
    }

  }

  /**
   * Adds a subgrid to a row
   *
   * @param objFolderRow The row id to add the sub grid too
   * @param objGridProps The grid properties object
   * @param aGridData Array of obejcts to be added to the grid at creation time. (optional)
   * @return The VwGrid instance of the sub grid
   * @exception Throw exception if a sub grid already exists for the row id specified, or the grid does not contain a row column view
   */
  function addRowSubGrid( objFolderRow, objGridProps, aGridData )
  {
    if ( !hasRowView() )
    {
      throw "Grid id: " + m_strParentId + "does not have a row-column grid configuration and cannot create a sub grid";
    }

    m_gridMain._fFolderExpanding = false;

    const folderMeta = getFolderMeta( objFolderRow );

    const strFolderRowId = objFolderRow[m_strDataIdProp];

    // Clone Properties and remove display header

    const objFolderProps = getFolderProps( m_gridProps );

    if ( aGridData )
    {
      for ( let x = 0, nLen = aGridData.length; x < nLen; x++ )
      {
        const folderMetaItem = getFolderMeta( aGridData[x] );
        folderMetaItem.parentFolder = objFolderRow;
      }
    }

    if ( !folderMeta.parentFolder )
    {
      folderMeta.parentFolder = m_gridMain._folderParentStack.peek();
    }

    // We have a new folder parent
    //todom_gridMain._folderParentStack.push( objFolderRow );

    const strExtenderId = createRowContentExtender( strFolderRowId, objGridProps.cssFolderRow );

    if ( objFolderProps.folderIndentWidth )
    {
      adjustSubFolderIndentation( strExtenderId, getFolderDepth( objFolderRow ), objFolderProps );
    }

    const strExpandedFolder = m_gridMain._curExpandedFolder;

    m_gridMain._curExpandedFolder = null; // disable this property when building sub grids
    //todo const vwRowSubGrid = new VwGrid( strExtenderId, m_gridMain["_gridDataModel"], objFolderProps, self, m_gridMain );

    // restore expanded folder property
    m_gridMain._curExpandedFolder = strExpandedFolder;

    folderMeta.strExtenderId = strExtenderId;
    // todo m_gridMain._mapSubGrids.put( strFolderRowId, vwRowSubGrid );

    m_aSubFolders.push( objFolderRow );

    /*
    folderMeta.folderGrid = vwRowSubGrid;

    if ( folderMeta.parentFolder )
    {
      const folderParentMeta = getFolderMeta( folderMeta.parentFolder );

      if ( folderParentMeta.fIsOpen )
      {
        $("#" + folderParentMeta.strExtenderId ).show() ;
      }
    }
    
    const fGridDataExistsInMaster = (aGridData && m_gridMain._mapGridDataById.containsKey( aGridData[0][m_strDataIdProp] ) );

    if ( m_gridProps.fnFolderGridCreatedEvent && !m_gridMain._fFolderExpanding && !fGridDataExistsInMaster )
    {
      m_gridProps.fnFolderGridCreatedEvent( objFolderRow, vwRowSubGrid )
    }

    m_gridMain._folderParentStack.pop();
    return vwRowSubGrid;

     */

  }

  /**
   * Get folder data depth
   * @param folderRow
   * @returns {number}
   */
  function getFolderDepth( folderRow )
  {
    let nDepth = 1;

    let folderMeta = getFolderMeta( folderRow );

    while ( folderMeta.parentFolder )
    {
      ++nDepth;
      folderMeta = getFolderMeta( folderMeta.parentFolder );
    }

    return nDepth;
  }

  /**
   * Gets the folder meta data for a grid item. It creates an empty object if one does not exists
   * @param userDataObject The row id of the grid item to get the folder meta data for
   */
  function getFolderMeta( userDataObject )
  {

    if ( !userDataObject )
    {
      return null;

    }

    const strId = userDataObject[m_strDataIdProp];

    let folderMeta = m_gridMain._folderMeta.get( strId );

    if ( !folderMeta )
    {
      folderMeta = {};
      folderMeta[m_strDataIdProp] = userDataObject[m_strDataIdProp];
      m_gridMain._folderMeta.put( strId, folderMeta );
    }

    return folderMeta;

  }

  /**
   * Configure folder (sub grid props ) from the main views props
   * @param objGridProps The main view props
   * @returns {{}}
   */
  function getFolderProps( objGridProps )
  {
    const objFolderProps = {};
    $.extend( objFolderProps, objGridProps );

    objFolderProps.aHdrCols = $.map( objGridProps.aHdrCols, function ( obj )
    {
      return $.extend( true, {}, obj );
    } );

    objFolderProps.displayHeader = false;
    objFolderProps.breadCrumbParentId = null;

    if ( objFolderProps.cssGridRow )
    {
      if ( objGridProps.cssFolderAssetRow )
      {
        objFolderProps.cssGridRow += " " + objGridProps.cssFolderAssetRow;
      }

    }
    else
    {
      objFolderProps.cssGridRow = objGridProps.cssFolderAssetRow
    }

    return objFolderProps;
  }


  /**
   * Adjusts the width of the first column following the folder icon column
   * @param objGridProps
   */
  function adjustSubFolderIndentation( strExtenderId, nFolderDepth, objGridProps )
  {

    const hdrCol = getHdrColFromId( objGridProps.columnToShrinkId );

    const objColMetrics = stripMetrics( hdrCol.width );
    const nColToShortenWidth = getHdrColWidth( hdrCol );

    const objFolderIndentMetric = stripMetrics( objGridProps.folderIndentWidth );

    let nIndentAmt;

    let nEmSize = 1;

    if ( objFolderIndentMetric.metric == "em" )
    {
      const strHdrId = m_gridMain.getGridId() + "_" + hdrCol.id + "_container";

      nEmSize = VwUiUtils.getEmSize( strHdrId );

      nIndentAmt = nEmSize * (objFolderIndentMetric.nVal * nFolderDepth);

    }
    else
    {
      nIndentAmt = objFolderIndentMetric.nVal * nFolderDepth;

    }

    hdrCol.nWidthInPx = nColToShortenWidth - nIndentAmt;

    const nRowWidth = $( "#vwGridHdr_" + m_gridMain.getGridId() ).width();

    if ( objColMetrics.metric == "em" )
    {
      hdrCol.width = hdrCol.nWidthInPx / nEmSize + "em";
    }
    else
    {
      if ( objColMetrics.metric == "%" )
      {
        const nColWidth = (hdrCol.nWidthInPx / nRowWidth) * 100;
        hdrCol.width = nColWidth + "%";
      }

    }

    $( "#" + strExtenderId ).css( "margin-left", objGridProps.folderIndentWidth );

 
  } // end adjustSubFolderIndentation()


  /**
   * Return data object by ID from the entire data collection
   * @param strId
   */
  function getDataObjectById( strId )
  {
    return m_gridMain._mapGridDataById.get( strId );
  }

  /**
   * Show/hides sub grid for the row id specified
   *
   * @param strRowId The row id of the sub grid to  sow/hide
   *
   * @param fShow true to show, false to hide
   * @exception Throw exception if no sub grid exists for the row specified
   */
  function showRowSubGrid( strRowId, fShow )
  {
    const vwRowSubGrid = m_mapRowSubGrids.get( strRowId );

    if ( !vwRowSubGrid )
    {
      throw "No sub grid exists for row id: " + strRowId;
    }

    const strExtenderId = vwRowSubGrid.getGridId();

    if ( fShow )
    {
      $( "#" + strExtenderId ).show();
    }
    else
    {
      $( "#" + strExtenderId ).hide();

    }

  }

  /**
   * Gets the depth of this folder
   *
   * @returns {*}
   */
  function getGridDepth()
  {
    let nDepth = 1;

    let parentGrid = self;

    while ( parentGrid.getParentGrid() != null )
    {

      ++nDepth;
      parentGrid = parentGrid.getParentGrid();

    }

    return nDepth;
  }


  /**
   * Removes a subgrid from the row specified by the strRowId
   *
   * @param strRowId The row id to remove the subgrid
   * @return the sub grid object that was removed or null if no sub grid existed
   */
  function removeRowSubGrid( strRowId )
  {
    return m_mapRowSubGrids.remove( strRowId );
  }

  /**
   * Gets the VwGrid instance of the sub grid for the strRowId specified
   * @param strRowId The row id to get the sub grid for
   */
  function getRowSubGrid( strRowId )
  {
    return m_mapRowSubGrids.get( strRowId );
  }

  /**
   * Returns an array of VwGrid objects for all added sub grids or null if no subgrids defined
   */
  function getAllRowSubGrids()
  {
    return m_mapRowSubGrids.values();
  }


  /**
   * Function to recurse into folders to get all data rows
   *
   * @param aDataStart The initial data
   * @param aDataComplete
   */
  function getAllDataRows( aDataStart, aDataComplete )
  {

    if ( !aDataStart )
    {
      return;
    }

    aDataStart.forEach( function ( data )
                        {
                          aDataComplete.push( data );

                          if ( isFolder( data ) )
                          {
                            getAllDataRows( data[m_gridProps.folderDataIdProp], aDataComplete );

                          }
                        } );
  }


  /**
   * Shows the view
   * @param strViewName
   * @param strViewStyle one of grid constants VwGrid.TILE_VIEW or VwGrid.ROWCOL_VIEW
   */
  function showView( strViewName, strViewStyle )
  {

    // If still no view style default to rowColView if defined in the grid properties, else assume tile view
    if ( !strViewStyle )
    {
      if ( hasRowView() )
      {
        m_gridMain._strCurViewStyle = VwGridV1.ROWCOL_VIEW;

      }
      else
      {
        m_gridMain._strCurViewStyle = VwGridV1.TILE_VIEW;
      }
    }
    else
    {
      if ( m_gridMain._strCurViewStyle == VwGridV1.TILE_VIEW && strViewStyle == VwGridV1.ROWCOL_VIEW )
      {
        doTileToRowFixups();
      }

      m_gridMain._strCurViewStyle = strViewStyle;

    }

    m_gridMain._strCurViewName = strViewName;

    if ( !m_gridProps )
    {
      alert( "Grid View " + strViewName + " has not been defined" );
      return;
    }

    if ( m_gridProps.restoreProps )
    {
      updateGridPropsFromRestoreProps();

    }

    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {

      if ( !m_gridParent || m_gridParent._fFolderExpanding )
      {
        $( "#" + m_strParentId ).empty();

      }

      setupRowColView();
    }
    else
    {
      m_gridMain._strCurViewStyle = VwGridV1.TILE_VIEW;
      setupTileView();
    }

    m_nSeqNbr = null;  // clear this or sequence will keep incrementing

    m_aSelectedItemIds = null;


    if ( m_gridProps.viewSetup )
    {
      m_gridProps.viewSetup( m_thisGrid, strViewName, strViewStyle, (vwGridParent != null) );
    }

    if ( !vwGridParent )
    {
      setupActionHandlers();

      setupContainerDrop();
    }

  }


  /**
   * Update scrollbars based on items being add or deleted
   */
  function resizeScrollBars()
  {
    if ( m_vwVertScrollBar)
    {
      m_vwVertScrollBar.resize();
    }

    if ( m_vwHorzScrollBar)
    {
      m_vwHorzScrollBar.resize();
    }

  } // end resizeScrollBars()

  /**
   *  Restore the main grid data
   */
  function doTileToRowFixups()
  {
    m_strParentId = m_gridMain.getParentId();
    m_strGridId = m_gridMain.getGridId();

    const breadCrumbModel = m_gridMain.getBreadCrumbModel();
    if ( breadCrumbModel )
    {
      const lastCrumb = breadCrumbModel.getLastCrumb();

      let   strKey;

      if ( lastCrumb[m_gridProps.breadCrumbIdProp] == m_gridProps.breadCrumbBaseNameId )
      {
        strKey = "main";
      }
      else
      {
        strKey = lastCrumb[m_gridProps.breadCrumbIdProp];
      }
    }

    m_gridParent = null;

    VW_ROW_ID_PREFIX = m_strParentId + "_";
    VW_DATA_OBJ_PREFIX = "data-objndx='" + m_strParentId + "_";

    VW_GRID_HDR_ID = "vwGridHdr_" + m_strParentId;
    VW_GRID_BODY_ID = VW_GRID_PREFIX + m_strParentId;
    m_mapGridViews = m_gridMain._mapGridViews;


  }

  /**
   * Returns the grid configuration
   * @param strViewName
   * @returns {*}
   */
  function getGridConfig( strViewName )
  {

    const gridProps = m_gridMain._mapGridViews.get( strViewName );

    const aHdrConfig = [];

    const objRestoreProps = {};

    objRestoreProps.aHdrProps = aHdrConfig;

    gridProps.aHdrCols.forEach( function ( hdrCol )
                                   {
                                     const hdrProp = {};
                                     hdrProp.id = hdrCol.id;
                                     hdrProp.width = hdrCol.width;

                                     aHdrConfig.push( hdrProp );

                                   } );

    objRestoreProps.hdrWidth = gridProps.hdrWidth;

    return objRestoreProps;

  }


  /**
   * Gets the current width of the grid's header
   * @returns {*}
   */
  function getGridHdrWidth()
  {
    const strTopGridHdrId = m_gridMain.getParentHdrId();

    const style = $( "#" + strTopGridHdrId )[0].style;

    if ( style )
    {

      if ( style.width )
      {
        return style.width;

      }

    }


  }


  /**
   * Update the grid props from the restore props
   */
  function updateGridPropsFromRestoreProps()
  {
    // TODO:  IF YOU ADD A NEW COLUMN TO GRID IN FUTURE THIS ROUTINE WILL PREVENT IT FROM SHOWING
    // HOW DO YOU HIDE/UNHIDE A COLUMN
    return;

    const aNewHdrCols = [];

    // The column order could also be different from the original so loop also reorders the hsr col array as well
    m_gridProps.restoreProps.aHdrProps.forEach( function ( hdrProp )
                                                   {
                                                     const hdrCol = findHdrCol( hdrProp.id );
                                                     $.extend( hdrCol, hdrProp );

                                                     aNewHdrCols.push( hdrCol );
                                                   } );

    m_gridProps.aHdrCols = aNewHdrCols;
    m_gridProps.hdrWidth = m_gridProps.restoreProps.hdrWidth;

    m_gridProps.restoreProps = null; // prevent doing this routine again

    function findHdrCol( strHdrId )
    {
      for ( const hdrCol of m_gridProps.aHdrCols )
      {
        if ( hdrCol.id == strHdrId )
        {
          return hdrCol;
        }
      } // end for

    } // end findHdrCol()

  } // updateGridPropsFromRestoreProps()


  /**
   * Setup routines for the tile view
   *
   * @oaram fInAppyFilter if true this is a recursive call from appyly filter so as not to call apllyFilter again
   */
  function setupTileView( fInAppyFilter, fnFilterReady )
  {

    setupTileDragnDropMgr();

    setupTileBodyHtml();

    m_vwVertScrollBar = new VwScrollBar( VW_GRID_BODY_ID, {"orientation":"vert"} );
    m_vwHorzScrollBar = new VwScrollBar( VW_GRID_BODY_ID, {"orientation":"horz"} );

    let strFolderId;

    if ( m_gridMain._curExpandedFolder )
    {
      strFolderId = m_gridMain._curExpandedFolder[m_strDataIdProp];
    }

    m_aTileRows = [];

    const strCurrentFilterName = getCurrentFilter();

    let aGridData;

    if ( strFolderId )
    {
      aGridData = getDataModel().getFolderItems( strFolderId );
    }
    else
    {
      aGridData = getDataModel().getDataSet();
    }

    if ( strCurrentFilterName && !fInAppyFilter )
    {
      const filterProps = m_gridMain._mapFilterProps.get( strCurrentFilterName );
      applyTileFilter( strCurrentFilterName, filterProps, false, aGridData );
    }
    else
    {
      // Add the grid rows if defined
      for ( const dataItem of aGridData )
      {
        const strId = dataItem[m_strDataIdProp];

        if ( m_gridMain._mapFilteredDataIds.containsKey( strId ))
        {
          continue;
        }

        const vwTile = new VwTile( getCanonicalObjectId( dataItem ), dataItem, m_gridProps );

        if ( dataItem instanceof VwComponent )
        {
          addTileComponent( vwTile )
        }
        else
        {
          addTile( vwTile );;
        }

      }

      if ( fnFilterReady )
      {
        fnFilterReady();
      }

    }

  }  // end setupTileView()

  /**
   * Creates the html body config for tile views
   */
  function setupTileBodyHtml()
  {
    const strGridId = m_gridMain.getGridId();

    const parentIdEl = $( "#" + strGridId );

    parentIdEl.empty().addClass( m_gridProps.cssGrid );

    const strGridBodyId = VW_GRID_PREFIX + strGridId;
    const gridDataContainerEl = $( "<div>" ).addClass( "VwGridDataContainer" );

    const gridBodyEl = $( "<div>" ).attr( "id", strGridBodyId ).addClass( m_gridProps.cssGridBody );

    gridDataContainerEl.append( gridBodyEl )
    parentIdEl.append( gridDataContainerEl );

  }

  /**
   * Instalss the tile drag and drop mgr for folders
   */
  function setupTileDragnDropMgr()
  {

    if ( !m_gridProps.allowItemReorder && !m_gridProps.allowDrop && !m_gridProps.allowDrag )
    {
      return;

    }

    if ( m_tileDndMgr )
    {
      return;

    }

    const dndProps = {};
    dndProps.onDragStart = onTileDragStart;
    dndProps.onDragDrop = onTileDragDrop;
    dndProps.isValidDropZone = isTileValidDropZone;
    dndProps.dataTransferType = "text/plain";
    dndProps.cssItemDragEnter = "VwTileDragEnter";

    dndProps.allowDrag = true;
    dndProps.allowDrop = true;

    m_tileDndMgr = new VwDragNDropMgr( dndProps );


    function onTileDragStart( strTileBeingDraggedId )
    {
      m_strTileBeingDraggedId = strTileBeingDraggedId;

      const strObjId = extractGridId( strTileBeingDraggedId );

      return m_gridMain._mapGridDataById.get( strObjId );

    }

    function onTileDragDrop( strTileDroppedOnEleId, objBeingDropped )
    {
      const strObjId = extractGridId( strTileDroppedOnEleId );

      const objDroppedOnTileData = m_gridMain._mapGridDataById.get( strObjId );

      moveTileFolder( objDroppedOnTileData, objBeingDropped );


    }

    function isTileValidDropZone( strTileOverEleId )
    {
      const strObjId = extractGridId( strTileOverEleId );

      const objTileData = m_gridMain._mapGridDataById.get( strObjId );

      return isFolder( objTileData ) && strObjId != objTileData[m_gridProps.folderIdProp];

    }
  }


  function moveTileFolder( tileFolderDroppedOn, tileBeingDropped )
  {

    const tileBeingDroppedMeta = getFolderMeta( tileBeingDropped );

    const objFolderParent = tileBeingDroppedMeta.parentFolder;

    // Remove the tile being moved from its parent

    removeEntry( tileBeingDropped );

    // Add it to the folder its being dropped on

    if ( tileFolderDroppedOn )
    {
      let aFolderData = tileFolderDroppedOn[m_gridProps.folderDataIdProp];
      if ( !aFolderData )
      {
        aFolderData = [];
        objFolderParent[m_gridProps.folderDataIdProp] = aFolderData;
      }

      aFolderData.push( tileBeingDropped );

    }

    m_strTileBeingDraggedId = null;

    if ( m_gridProps.fnFolderItemMovedEvent )
    {
      m_gridProps.fnFolderItemMovedEvent( tileBeingDropped, tileBeingDroppedMeta.parentFolder, tileFolderDroppedOn );
    }


  }

  /**
   * Returns a array of all non filtered grid data
   * @returns {*}
   */
  function getNonFilteredData()
  {
    let aDataSet;

    let strExpandedFolderId;

    if ( m_gridMain._curExpandedFolder )
    {
       strExpandedFolderId = m_gridMain._curExpandedFolder[m_strDataIdProp];
    }
    else
    {
      const folderExpanding = m_gridMain._folderParentStack.peek();

      if ( folderExpanding )
      {
        strExpandedFolderId = folderExpanding[m_strDataIdProp];
      }
    }

    if ( strExpandedFolderId )
    {
      aDataSet = getDataModel().getFolderItems( strExpandedFolderId );
    }
    else
    {
      aDataSet = getDataModel().getDataSet();
    }

    const aNonFilteredDataSet = [];

    if ( aDataSet )
    {
      buildNonFilteredDataSet( aDataSet, aNonFilteredDataSet );
    }

    return aNonFilteredDataSet;

    /**
     * Recursive function to get non filtered data items
     *
     * @param aDataSethe DataSet to traverse
     * @param aNonFilteredDataSet The non filtered item array to add to fir non fiktered data items
     */
    function buildNonFilteredDataSet( aDataSet, aNonFilteredDataSet )
    {
      for ( const dataItem of aDataSet )
      {
        const strDataItemId = dataItem[m_strDataIdProp];

        if ( m_gridMain._mapFilteredDataIds.containsKey( strDataItemId) )
        {
          continue;
        }

        aNonFilteredDataSet.push( dataItem );

      } // end for()

    } // end buildNonFilteredDataSet()

  } // end getNonFilteredData



  /**
   * Get the Canonical object id which is the id of the object prefixed with the grid id
   * @param objUserData  The object data
   * @returns {*}
   */
  function getCanonicalObjectId( objUserData )
  {
    if ( objUserData instanceof VwComponent )
    {
      return m_strGridId + "_" + objUserData.getId();

    }
    return m_strGridId + "_" + objUserData[m_strDataIdProp];
  }


  /**
   * Install view for the row column view
   */
  function setupRowColView()
  {

    m_nRowCount = 0;
    m_nTotColWidth = 0;

    const strFolderId = self.getManagedFolderId();

    let aobjGridData;

    if ( !strFolderId )
    {
      aobjGridData = m_gridMain._gridDataModel.getDataSet();
    }
    else
    {
      aobjGridData = m_gridMain._gridDataModel.getFolderItems( strFolderId );
    }
    
    if ( m_gridParent && !m_gridParent._fFolderExpanding )
    {
      $( "#" + m_strParentId ).empty().addClass( m_gridProps.cssGridExtender );
    }
    else
    {
      $( "#" + m_strParentId ).empty().addClass( m_gridProps.cssGrid );
    }

    if ( m_gridProps.displayHeader && !m_gridParent )
    {
      buildGridHeader();
      if ( gridProps.defaultSortDescriptor && !gridMain )
      {
        sortDataSet( gridProps.defaultSortDescriptor, gridProps.defaultSortDescriptor.sortDir, true );
        setHdrColumnSortArrow( gridProps.defaultSortDescriptor.dataId, gridProps.defaultSortDescriptor.sortDir );
      }

    }
    else
    {
      processGridHeaderProps();
    }

    if ( !m_gridParent )
    {

      m_objSort = m_mapSortDescriptors.get( m_gridMain._strCurViewName );

      self._nOrigRowWidth = $( "#" + m_strParentId ).width();

      if ( m_gridProps.width )
      {
        $( "#" + m_strParentId ).css( "width", m_gridProps.width );
        $( "#" + VW_GRID_HDR_ID ).css( "width", m_gridProps.hdrWidth );
        $( "#" + m_gridMain._strBodyId ).css( "width", m_gridProps.hdrWidth );

      }

    }  // end if (!mgridParent

    if ( m_gridMain._curExpandedFolder )
    {
      expandToTop( m_gridMain._curExpandedFolder, true );
    }
    else
    {
      buildGridRowData( aobjGridData );
    }

    if ( m_gridMain._strCurFilter )
    {
      applyFilter( m_gridMain._strCurFilter );
    }
  
  }


  /**
   * Build the grid sort header
   */
  function buildGridHeader()
  {
    if ( m_gridProps.allowColumnReorder )
    {
      setupColumnDragnDropMgr();

    }

    $("#" + VW_GRID_HDR_ID ).empty();

    const divHdrEl = $( "<div>" ).attr( "id", VW_GRID_HDR_ID ).addClass( m_gridProps.cssGridHdr ).addClass( "VwDisableTextSelection" );

    if ( m_gridProps.showGridLines )
    {
      divHdrEl.addClass( m_gridProps.cssGridHdrBorders )
    }

    $("#" + strParentId ).append( divHdrEl );

    if ( m_gridProps.hdrWidth )
    {
      $( "#" + VW_GRID_HDR_ID ).css( "width", m_gridProps.hdrWidth );
    }

    let nColNbr = -1;
    for ( const hdrCol of m_gridProps.aHdrCols )
    {
      m_aHdrCols.push( new VwSortableHdrColumn( hdrCol, ++nColNbr ) );
      if ( m_gridProps.allowColumnReorder )
      {
        const strColId = m_strGridId + "_" + hdrCol.id + "_container";

        if ( hdrCol.noReorder )
        {
          continue;
        }

        m_colDndMgr.installDragDrop( strColId );
      }

    }

    // See if a default sor column was specified

    if ( m_gridProps.sortColId )
    {
      const hdrCol = getHdrColFromId( m_gridProps.sortColId );

      const objSort = {};
      objSort.sortType = hdrCol.sortType;
      objSort.dataId = hdrCol.dataId;
      objSort.id = m_gridProps.sortColId;
      objSort.sortDir = Number( m_gridProps.sortDir );

      m_mapSortDescriptors.put( m_gridMain._strCurViewName, objSort );

    }
  } // end  buildGridHeader()


  /**
   * Sets up drag and drop for column re-ordering
   */
  function setupColumnDragnDropMgr()
  {

    const dndProps = {};

    dndProps.onDragDrop = onColDragDrop;
    dndProps.isValidDropZone = isColValidDropZone;
    dndProps.dataTransferType = "text/plain";
    dndProps.cssItemDragEnter = "VwTileDragEnter";
    dndProps.dragType = "move";

    dndProps.allowDrag = true;
    dndProps.allowDrop = true;

    m_colDndMgr = new VwDragNDropMgr( dndProps );

    /**
     * Reorsers the hdr column
     * @param strColDroppedOnEleId
     * @param strColIdBeingDropped
     */
    function onColDragDrop( strColDroppedOnEleId, strColIdBeingDropped )
    {
      const strColDroppedOnId = extractColIdFromEventId( strColDroppedOnEleId );
      strColIdBeingDropped = extractColIdFromEventId( strColIdBeingDropped );

      // Cant drop on yourself
      if ( strColDroppedOnId == strColIdBeingDropped )
      {
        return;
      }

      const nDroppedNdx = findColNbrFromId( strColIdBeingDropped );

      // save the hdr object being removed
      const colProps = m_gridProps.aHdrCols[nDroppedNdx];

      m_gridProps.aHdrCols.splice( nDroppedNdx, 1 );

      // Find hdr index of the dropped on hdr
      const nDroppOnNdx = findColNbrFromId( strColDroppedOnId );

      // reinsert the dropped hdr before the column it was dropped on
      m_gridProps.aHdrCols.splice( nDroppOnNdx, 0, colProps );

      // Rebuild the grid with the new header structure
      setupRowColView();

      return;
    }

    /**
     * Determins if the header column can receive a drop
     * @param strHdrColOverEleId
     * @returns {boolean}
     */
    function isColValidDropZone( strHdrColOverEleId )
    {
      const strHdrId = extractColIdFromEventId( strHdrColOverEleId );

      try
      {
        const hdrCol = getHdrColFromId( strHdrId );

        if ( hdrCol.noReorder )
        {
          return false;
        }
      }
      catch ( err )
      {
        return false; // Not a a header column
      }


      return true;
    }

  } // end setupColumnDragnDropMgr

  /**
   * Extracts the column id as specified in the header cols props
   * @param strColDroppedOnEleId
   * @returns {string|*|*|string}
   */
  function extractColIdFromEventId( strColDroppedOnEleId )
  {
    const strColId = strColDroppedOnEleId.substring( strColDroppedOnEleId.indexOf( "_" ) + 1 );

    return strColId.substring( 0, strColId.lastIndexOf( "_" ) );
  }

  /**
   * Define a VwGrid header column object
   *
   * @param colHdrProps object containg the properties for a hdr column
   * @constructor
   */
  function VwSortableHdrColumn( colHdrProps, nColNbr )
  {

    const strColId = m_strGridId + "_" + colHdrProps.id;
    const strColContainerId = strColId + "_container";

    // If the dataId was not specified, set to the column id
    if ( !colHdrProps.dataId )
    {
      colHdrProps.dataId = colHdrProps.id;

    }

    let htmlColContainerEl = null;
    let htmlColEl = null;

    let m_nSortDir = -1;

    if ( colHdrProps.hdrColTemplate )
    {
      colHdrProps.GRID_ID = m_strGridId;

      htmlColEl = $( "<div>" ).attr( "id", strColId ).addClass( colHdrProps.cssColContainer );
      htmlColEl.append( VwExString.expandMacros( colHdrProps.hdrColTemplate, colHdrProps ) );

      $( "#" + VW_GRID_HDR_ID ).append( htmlColEl );

      colHdrProps.nWidthInPx = getHdrColWidth( colHdrProps );

      return;
    }
    else
    {
      htmlColContainerEl = $( "<div>" ).attr( "id", strColContainerId ).addClass( m_gridProps.cssGridHdrColContainer );

      htmlColEl = $( "<div>" ).attr( "id", strColId ).addClass( colHdrProps.cssGridHdrCol ).addClass(  );

      htmlColContainerEl.append( htmlColEl );

      if (m_gridProps.showGridLines && !m_gridProps.resizeColumns )
      {
        htmlColContainerEl.addClass( m_gridProps.cssGridColBorder );
      }

      switch( colHdrProps.colType )
      {
        case "img":

          doImgHdrColType( htmlColEl, colHdrProps );
          break;

        case "vwBtn":

          doBtnHdrColType( htmlColEl, colHdrProps );
          break;

        case "custContainer":

          doCustomContainerColType( htmlColEl, colHdrProps );
          break;

        case "txt":
        default:

          doTextHdrColType( htmlColEl, colHdrProps );
          break;

      } // end switch()


    } // end else

    $( "#" + VW_GRID_HDR_ID ).append( htmlColContainerEl );

    if ( m_gridProps.resizeColumns )
    {
      const htmlBorderOrColResizerEl = $( "<div>" ).attr( "id", strColId + "_resizeBorder" ).addClass( m_gridProps.cssGridResizeCol );
      $( "#" + VW_GRID_HDR_ID ).append( htmlBorderOrColResizerEl );
      installColResizeSplitter( htmlBorderOrColResizerEl, strColContainerId );
    }


    const colContainerCss = {};

    if ( colHdrProps.width )
    {
      colContainerCss.width = colHdrProps.width;
    }

    colContainerCss["min-width"] = colHdrProps.width;

    if ( colHdrProps.maxWidth )
    {
      colContainerCss["max-width"] = colHdrProps.maxWidth;
    }

    $( "#" + strColContainerId ).css( colContainerCss );

    m_nTotColWidth += $( "#" + strColContainerId ).width();


    if ( colHdrProps.sortType )
    {
      $( "#" + strColId ).css( "cursor", "pointer" );
    }

    $( "#" + strColId ).unbind().click( vwHdrColClickHandler );

    if ( m_gridProps.resizeColumns )
    {
      if ( colHdrProps.noSeparator || colHdrProps.noResize )
      {
        colHdrProps.nWidthInPx = getHdrColWidth( colHdrProps );
        return;
      }

      const widthComponent = stripMetrics( colHdrProps.width );


      if ( !m_gridMain._strResizeColMetric )
      {
        m_gridMain._strResizeColMetric = widthComponent.metric;
      }

      if ( widthComponent.metric == "em" )
      {
        m_nEmSize = VwUiUtils.getEmSize( strColContainerId );
      }

      colHdrProps.nWidthInPx = getHdrColWidth( colHdrProps );


    } // end if

    /**
     * Adds an enmty
     * @param htmlColEl
     * @param colHdrProps
     */
    function doCustomContainerColType( htmlColEl, colHdrProps )
    {
      const htmlDivEl = $( "<div id='custContainer_" + strColId + "'>" );
      htmlColEl.append( htmlDivEl );
      htmlColEl.addClass( colHdrProps.cssCustContainer );

    } // end doCustomContainerColType()

    /**
     * 
     * @param htmlColEl
     * @param colHdrProps
     */
    function doTextHdrColType( htmlColEl, colHdrProps )
    {
      const htmlSpanEl = $( "<span id='span_" + strColId + "'>" );
      htmlColEl.append( htmlSpanEl );

      let strTitle;

      if ( !colHdrProps.title )
      {
        strTitle = "";
      }
      else
      {
        strTitle = VwExString.getValue( m_gridProps.resourceMgr, colHdrProps.title );
      }

      htmlSpanEl.text( strTitle ).addClass( m_gridProps.cssGridHdrText );

      if ( colHdrProps.sortType )
      {
        htmlColEl.append( $( "<img id = 'imgSortArrow_" + strColId + "'>" ).addClass( m_gridProps.cssGridSortArrow ) );

      }

    }

    /**
     * Do image col header type
     * @param htmlColEl
     * @param colHdrProps
     */
    function doImgHdrColType( htmlColEl, colHdrProps )
    {
      if ( colHdrProps.img )
      {
        const htmlImgEl = $( "<img src='" + colHdrProps.img + "'>" ).addClass( colHdrProps.cssImg );
        htmlColEl.append( htmlImgEl );
      }
    }

    /**
     * Creates a VwButton header
     * @param htmlColEl
     * @param colHdrProps
     */
    function doBtnHdrColType( htmlColEl, colHdrProps )
    {

    }


    /**
     * Sets the row body width based on the the tot widthds of all the columns
     *
     * @param nTotoRowWidth The new total row width
     */
    function setRowBodyWidth( nTotRowWidth, strMetric )
    {

      if ( strMetric == "px" )
      {
        ++nTotRowWidth; // add in border
      }
      else
      {
        if ( strMetric == "em" )
        {
          nTotRowWidth += .05; // add in border
        }
      }

      $( "#" + m_gridMain._strBodyId ).width( nTotRowWidth + strMetric );
      $( "#" + VW_GRID_HDR_ID ).width( nTotRowWidth + strMetric );

      $( ".VwGridColBorder" ).css( "left", "" );

    }

    /**
     * Handles sortable header column handleClick event
     */
    function vwHdrColClickHandler()
    {

      if ( !colHdrProps.sortType || colHdrProps.sortType == null )
      {
        return; // Not a sortable column
      }

      m_nSortDir *= -1;

      sortDataSet( colHdrProps, m_nSortDir );

    } // end vwHdrColClickHandler{}

  } // end VwSortableHdrColumn()

  /**
   * Install splitter in the resizer div
   * @param htmlBorderOrColResizerEl
   */
  function installColResizeSplitter( htmlBorderOrColResizerEl, strColId )
  {
    const colResizerProps = {};
    colResizerProps.resize = handleColResize;
    colResizerProps.resized = handlesResizedComplete;
    colResizerProps.resizeStart = handleResizeStart;
    colResizerProps.metric = "px"; // Always use px for col resize and convert to user metircs on mouseup
    colResizerProps.totalWidth = m_gridProps.width;
    colResizerProps.noAdjustRightSide = true;
    
    new VwColResizer( htmlBorderOrColResizerEl, strColId, colResizerProps );

  } // end installColResizeSplitter()


  /**
    * Event handler on a mouse down event on the column being resized
    *
    * @param strColId The id of the column being resized
    */
   function handleResizeStart( strColId )
   {
     // Strip off the _container from id to get the column nbr
     strColId = strColId.substring( 0, strColId.lastIndexOf( "_" ) );

     // Strip off grid id
     strColId = strColId.substring( m_strGridId.length + 1 );

     const hdrCol = getHdrColFromId( strColId );

     const strColMetric = hdrCol.width;

     // We convert everything to px when resizing a column
     if ( VwExString.endsWith( strColMetric, "%" ) || VwExString.endsWith( strColMetric, "em" ) )
     {
       convertGridToPx();
     }

   }

   /**
    * Resizes event handler
    *
    * @param strColId The id the column to resize
    * @param nWidthInPixels The width in raw numeric units
    * @param strWidthUnits The new column width in the units specified by the properties. will be px, em or %
    */
   function handleColResize( strColId, nWidthInPixels, strWidthUnits )
   {
     return;
     /* todo
     // Strip off the _container from id to get the column nbr
     strColId = strColId.substring( 0, strColId.lastIndexOf( "_" ) );

     // Strip off grid id
     strColId = strColId.substring( m_strGridId.length + 1 );

     resizeRowCol( strColId, nWidthInPixels, strWidthUnits );
     */

   } // end handleColResize()

   /**
    * Final resize event handler a mouse up event
    *
    * @param strColId The id the column to resize
    * @param nWidthInPixels The width in raw numeric units
    * @param strWidthUnits The new column width in the units specified by the properties. will be px, em or %
    */
   function handlesResizedComplete( strColId, nWidthInPixels, strWidthUnits )
   {
      strColId = strColId.substring( 0, strColId.lastIndexOf( "_" ) );

      const hdrCol = getHdrColFromId( strColId.substring( strColId.indexOf( "_") + 1 ) );
      hdrCol.nWidthInPx = nWidthInPixels;
      
     // Removes the drag offset left pos on completion
     $( "#" + strColId + "_border" ).css( "left", "" );

     if ( m_gridMain._strResizeColMetric == "%" || m_gridMain._strResizeColMetric == "em" )
     {
       convertGridToMetric( m_gridMain._strResizeColMetric );
     }

     // sript off gridId from col id

     strColId = strColId.substring( strColId.indexOf( "_") + 1 );
     resizeRowCol( strColId, nWidthInPixels, strWidthUnits );

     const nWidth = $(".VwGridBody").width();

     m_vwHorzScrollBar.resize( nWidth );
     
   } // end handlesResizedComplete()


  /**
   * Loops through all rows in the grid resizing the column specified by strColId
   *
   * @param strColId The id the column to resize
   * @param nWidthInPixels The width in raw numeric units
   * @param strWidthUnits The new column width in the units specified by the properties. will be px, em or %
   */
  function resizeRowCol( strColId, nWidthInPixels, strWidthUnits )
  {

    const hdrCol = getHdrColFromId( strColId );

    // Get the current width of the columns
    let nTotColWidth = 0;

    m_gridProps.aHdrCols.forEach( function ( hdrCol )
                                     {
                                       nTotColWidth += hdrCol.nWidthInPx;
                                     } );

    const aAllGridProps = getAllGridProps();

    // Remove the current width of the column being resized

    nTotColWidth -= hdrCol.nWidthInPx;

    // Add in new width
    nTotColWidth += nWidthInPixels;
    const nDiff = nWidthInPixels - hdrCol.nWidthInPx;

    // Update grid instance hdr properties

    aAllGridProps.forEach( function ( gridProps )
                           {
                             hdrCol.nWidthInPx += nDiff;
                           } );
    const aAllRows = [];

    getAllDataRows( getNonFilteredData(), aAllRows );

    aAllRows.forEach( function ( objRow )
                      {
                        const nColNbr = findColNbrFromId(hdrCol.id );

                        setColSize( objRow, hdrCol.nWidthInPx + "px", nColNbr );

                      } );

    setRowBodyWidth( nTotColWidth, "px" );

  } // end resizeRowCol()

  /**
   * Sets the row body width based on the the tot widthds of all the columns
   *
   * @param nTotoRowWidth The new total row width
   */
  function setRowBodyWidth( nTotRowWidth, strMetric )
  {

    if ( strMetric == "px" )
    {
      ++nTotRowWidth; // add in border
    }
    else
    {
      if ( strMetric == "em" )
      {
        nTotRowWidth += .05; // add in border
      }
    }

    $( "#" + m_gridMain._strBodyId ).width( nTotRowWidth + strMetric );
    $( "#" + VW_GRID_HDR_ID ).width( nTotRowWidth + strMetric );

    $( ".VwGridColBorder" ).css( "left", "" );

  }


  /**
   * Sort the data set with any sub folders
   *
   * @param strSortType The sort type, "s" for string, "n" for whole number, "f" for floating point and "d" for date
   * @param strDataId The data property id of the object column being sorted
   * @param nSortDir Sor direction -1 for ascending, 1 for descending
   * @param bSortOnly if true, do not display the results
   */
  function sortDataSet( objColProps, nSortDir, bSortOnly )
  {

    // Save Sort params
    m_objSort = {id: objColProps.id, sortType: objColProps.sortType, dataId: objColProps.dataId, sortDir: nSortDir};

    m_gridProps.sortColId = objColProps.id;
    m_gridProps.sortDir = nSortDir;

    m_mapSortDescriptors.put( m_gridMain._strCurViewName, m_objSort );

    setHdrColumnSortArrow( objColProps.dataId, nSortDir );

    // Sorting rebuilds
    m_aSubFolders = [];

    const aDataSet = getDataModel().getDataSet();

    if (!aDataSet )
    {
      return;
    }
    
    sortAll( aDataSet );

    if ( bSortOnly )
    {
      return;
    }

    displayNonFilteredResults();
 
    // Invoke callback handler if defined
    if ( m_gridProps.postViewChange )
    {
      m_gridProps.postViewChange.call( self, self, aDataSet );
    }

    /**
     * Recursive function to sort all data with folders
     * @param aDataSet
     */
    function sortAll( aDataSet )
    {
      sortGridData( aDataSet, objColProps, nSortDir);

      for ( const dataItem of aDataSet )
      {
        if ( isFolder( dataItem ) )
        {
          const aFolderDataSet =  dataItem[ gridProps.folderDataIdProp ];

          if ( aFolderDataSet )
          {
            sortAll( aFolderDataSet );
          }
        }
      }  // end for()

    } // end function SortAll

    if ( m_gridProps.viewSetup )
    {
      m_gridProps.viewSetup( m_thisGrid, strViewName, VwGridV1.ROWCOL_VIEW, (vwGridParent != null) );
    }

  } // end sortDataSet()




  /**
   * Recalc the column widths. This happens on a browser resize event
   */
  function recalcColWidths()
  {
    m_gridProps.aHdrCols.forEach( function ( hdrCol )
                                     {
                                       hdrCol.nWidthInPx = getHdrColWidth( hdrCol );
                                     } );

  }

  /**
   * Converts the grid column widths during a re-size operation if the widths are defined in ems or pct.
   */
  function convertGridToPx()
  {
    // Convert header

    m_gridProps.aHdrCols.forEach( function ( hdrCol )
                                     {
                                       const strHdrId = m_strGridId + "_" + hdrCol.id + "_container";

                                       if ( hdrCol.noResize || hdrCol.noSeparator )
                                       {
                                         return;
                                       }

                                       $( "#" + strHdrId ).css( "width", hdrCol.nWidthInPx + "px" );
                                     } );

    const aAllRows = [];

    getAllDataRows( getNonFilteredData(), aAllRows );

    aAllRows.forEach( function ( objRow )
                      {
                        let nColNbr = -1;
                        m_gridProps.aHdrCols.forEach( function ( hdrCol )
                                                         {
                                                           ++nColNbr;

                                                           if ( hdrCol.noResize || hdrCol.noSeparator )
                                                           {
                                                             return;
                                                           }

                                                           setRowColPct2Px( objRow, nColNbr );

                                                         } );

                      } );

    $( "#" + m_gridMain._strBodyId ).width( $( "#" + m_gridMain._strBodyId ).width() );
    $( "#" + VW_GRID_HDR_ID ).width( $( "#" + VW_GRID_HDR_ID ).width() );


  } // end convertGridToPx()


  /**
   *
   * @param nUpdateColNbr
   * @param nWidthInPixels
   */
  function convertGridToMetric( strToMetric )
  {
    let nHdrColNbr = -1;
    let nTotColWidth = 0;

    // Get to row width
    m_gridProps.aHdrCols.forEach( function ( hdrCol )
                                     {

                                       if ( !hdrCol.nWidthInPx )
                                       {
                                         hdrCol.nWidthInPx = getHdrColWidth( hdrCol );
                                       }

                                       nTotColWidth += hdrCol.nWidthInPx;

                                     } );

    // Now go through and update new pcts based on new row width
    m_gridProps.aHdrCols.forEach( function ( hdrCol )
                                     {

                                       if ( hdrCol.noResize || hdrCol.noSeparator )
                                       {
                                         return;
                                       }

                                       if ( strToMetric == "%" )
                                       {
                                         hdrCol.minWidth = hdrCol.width = hdrCol.nWidthInPx / nTotColWidth * 100 + "%";
                                       }
                                       else
                                       if ( strToMetric == "em" )
                                       {
                                         hdrCol.minWidth = hdrCol.width = hdrCol.nWidthInPx / m_nEmSize + "em";
                                       }
                                       else
                                       {
                                         hdrCol.minWidth = hdrCol.width = hdrCol.nWidthInPx     ;
                                       }

                                       const strHdrId = m_strGridId + "_" + hdrCol.id + "_container";

                                       $( "#" + strHdrId ).css( "width", hdrCol.width );
                                       $( "#" + strHdrId ).css( "min-width", hdrCol.width );

                                     } );

    const aAllRows = [];

    getAllDataRows( getNonFilteredData(), aAllRows );

    // *** All rows and columns need to be set with adjusted column pct
    aAllRows.forEach( function ( objRow )
                      {
                        nHdrColNbr = -1;

                        const gridProps = getGridPropsByFolderMeta( objRow );

                        gridProps.aHdrCols.forEach( function ( hdrCol )
                                                    {
                                                      ++nHdrColNbr;

                                                      if ( hdrCol.noResize || hdrCol.noSeparator )
                                                      {
                                                        return;
                                                      }

                                                      let strWidtUnits;

                                                      if ( strToMetric == "%" )
                                                      {
                                                        strWidtUnits = hdrCol.nWidthInPx / nTotColWidth * 100 + "%";
                                                      }
                                                      else
                                                      if ( strToMetric == "em" )
                                                      {
                                                        strWidtUnits = hdrCol.nWidthInPx / m_nEmSize + "em";

                                                      }
                                                      else
                                                      {
                                                        strWidtUnits = hdrCol.nWidthInPx;
                                                      }

                                                      setColSize( objRow, strWidtUnits, nHdrColNbr );
                                                    } );
                      } );

    const strNewWidth = nTotColWidth / m_gridMain._nOrigRowWidth * 100 + "%";

    $( "#" + m_gridMain._strBodyId ).width( strNewWidth );
    $( "#" + VW_GRID_HDR_ID ).width( strNewWidth );

    m_gridProps.hdrWidth = strNewWidth;

    $( ".VwGridColBorder" ).css( "left", "" );

  }

  /**
   * Gets the grid properties for the grid/sub grid this data item is in
   *
   * @param objGridItem
   */
  function getGridPropsByFolderMeta( objGridItem )
  {
    const folderMeta = getFolderMeta( objGridItem );
    if ( folderMeta.parentGrid )
    {
      return folderMeta.parentGrid.getGridProps( m_gridMain._strCurViewName );
    }
    else
    {

      return m_gridProps;

    }

  }


  /**
   * Gets grid properties for the main grid and all sub grids
   * @returns {Array}
   */
  function getAllGridProps()
  {
    const aAllGridProps = [];
    aAllGridProps.push( m_gridProps );

    m_gridMain._mapSubGrids.values().forEach( function ( subGrid )
                                              {
                                                const objGridProps = subGrid.getGridProps( m_gridMain._strCurViewName );

                                                aAllGridProps.push( objGridProps );
                                              } );

    return aAllGridProps;

  }

  /**
   * Sets the column size in the specific row
   *
   * @param objRow The row object containg the column to be resized
   * @param strWidthUnits Yhe new column size
   * @param nColNbr The column number in the row to be resized
   */
  function setColSize( objRow, strWidthUnits, nColNbr )
  {
    nColNbr = getColNbr( nColNbr );
    let strRowId = getRowId( objRow );

    strRowId += "_" + nColNbr;

    const strCanonicalRowColId = $("[id$=" + strRowId  + "]").attr( "id")

    $( "#" + strCanonicalRowColId ).css( "width", strWidthUnits );
    $( "#" + strCanonicalRowColId ).css( "min-width", strWidthUnits );

  } // end setColSize()


  /**
   * Converts a column if ( defined in ems or % to pixels (px)
   * @param objRow
   * @param nColNbr
   */
  function setRowColPct2Px( objRow, nColNbr )
  {
    const gridProps = getGridPropsByFolderMeta( objRow );

    const strRowId = getRowId( objRow );
    const strRowColId = "#colContainer_" + strRowId + "_" + nColNbr;

    $( strRowColId ).css( "width", gridProps.aHdrCols[nColNbr].nWidthInPx + "px" );

  } // end setRowColPct2P()

  /**
   * Gets the width of a column header
   * @param hdrCol The hdr column object
   */
  function getHdrColWidth( hdrCol )
  {
    let   strHdrId;
    const strGridId = m_gridMain.getGridId();


    if ( hdrCol.hdrColTemplate )
    {
      strHdrId = strGridId + "_" + hdrCol.id;
    }
    else
    {
      strHdrId = strGridId + "_" + hdrCol.id + "_container";

    }

    return $( "#" + strHdrId ).width();

  }


  /**
   * Does Id fixup -- this is only called when displayHeader is false
   */
  function processGridHeaderProps()
  {

    for ( const hdrCol of m_gridProps.aHdrCols )
    {
      const colProps = hdrCol;

      // If the dataId was not specified, set to the column id
      if ( !colProps.dataId )
      {
        colProps.dataId = colProps.id;

      }

    }

  }

  /**
   * Build the grid body div elements and add any rows if specified on the constructor
   * @param aobjGridData  An array of row objects - may be null
   */
  function buildGridRowData( aDataSet )
  {
    m_mapGridDataByRowId.clear();
    m_mapRowSubGrids.clear();

    // Build grid body HTML structure
    let parentDivEl = $( "#" + m_strParentId );

    // Empty grid body
    $( "#" + m_strParentId + " > .VwGridDataContainer" ).remove();

    const gridDataContainerEl = $( "<div>" ).addClass( "VwGridDataContainer" );

    if ( m_gridProps.showGridLines )
    {
      gridDataContainerEl.attr( "style", "margin-top:-7px");
    }
    
    const gridBodyEl = $( "<div>" ).attr( "id", VW_GRID_BODY_ID ).addClass( m_gridProps.cssGridBody );

    gridDataContainerEl.append( gridBodyEl );
    
    parentDivEl.append( gridDataContainerEl );

    if ( !gridMain || gridMain && m_gridMain._fFolderExpanding )
    {
      m_vwVertScrollBar = new VwScrollBar( VW_GRID_BODY_ID, {"orientation":"vert"} );

      if ( !m_gridProps.noHorzScroll )
      {
        m_vwHorzScrollBar = new VwScrollBar( VW_GRID_BODY_ID, {"orientation":"horz", "managedScrollIds":[VW_GRID_HDR_ID]} );
      }
    }

    if ( m_gridProps.maxBodyHeight )
    {
      parentDivEl.css( "max-height", m_gridProps.maxBodyHeight );
    }

    if ( m_gridProps.bodyHeight )
    {
      parentDivEl.css( "height", m_gridProps.bodyHeight );
    }

    // Only set the body wrap if its the top level
    if ( m_gridProps.hdrWidth && !m_gridParent )
    {
      $( "#" + m_gridMain._strBodyId ).css( "width", m_gridProps.hdrWidth );
    }

    if ( !aDataSet )
    {
      return;
    }

    m_bLoading = true;
    // Add the grid rows if defined
    for ( const dataItem of  aDataSet )
    {
      add( dataItem, null, null, null );
    }

    m_bLoading = false;
   }


  /**
   * Strip metrics from a css width or height value
   * @param strValue The value to strip
   * @returns an opject that has the number part "nVal" property and metric part "metric" property
   */
  function stripMetrics( strValue )
  {
    if ( isNaN( strValue ) )
    {
      let x = strValue.length - 1;

      // find first number character
      for ( ; x >= 0; x-- )
      {
        if ( isNaN( strValue[x] ) )
        {
          continue;
        }

        break;
      }

      ++x; //  bump x up to point to the first char of the metric unit

      const nbrPart = strValue.substring( 0, x );
      const strMetric = strValue.substring( x );

      return {"nVal": Number( nbrPart ), "metric": strMetric};

    } // end if (isNAN)

    //This is already a number with no metric,  default is px
    return {"nVal": strValue, "metric": "px"};

  }


  /**
   * Returns true if the grid has a row view
   * @returns {boolean}
   */
  function hasRowView()
  {
    if ( gridProps.aHdrCols )
    {
      return true;
    }

    return false;

  }


  /**
   * Returns true if the grid has a tile view
   * @returns {boolean}
   */
  function hasTileView()
  {

    if ( m_gridProps.tileProps )
    {
      return true;
    }

    return false;

  }

  /**
   * Shows/Hides a column in a row
   *
   * @param fShow true to show, false to hide
   * @param dataItem The data item representing the row
   * @param strColId The hdr column id
   */
  function displayRowCol( fShow, dataItem, strColId )
  {
    const hdrColSpec = getColHdrSpec( strColId );

    const strRowColId = getColId( dataItem, strColId );
    
    if ( !hdrColSpec )
    {
      return;
    }

    let strCannonicleId;

    switch( hdrColSpec.colType )
    {
      case "vwBtn":

        const vwButton = m_gridMain._mapCustomControlByRowColId.get( strRowColId );

        strCannonicleId = vwButton.getCanonicalId();


        break;

      default:

        strCannonicleId = self.getColId( dataItem, strColId );
        break;

    } // end switch()

    let strVisibility;

    if ( fShow )
    {
      strVisibility = "visible"
    }
    else
    {
      strVisibility = "hidden"

    }

    $("#" + strCannonicleId).css( "visibility", strVisibility );


  } // end displayRowCol()


  /**
   * Adds an array of objects to the grid
   *
   * @param aObjdata  The data to add
   * @param fPrepend  If true, prepend the data
   */
  function addAll( aDataSet, fPrepend )
  {

    if ( !aDataSet )
    {
      return;
    }

    const fnAdd = self._mapPrivateMethods.get( "add" );

    for ( const dataItem of aData )
    {
      fnAdd( dataItem, fPrepend );
    }
  }


  /**
   * Inserts an object above or below the specified object id
   *
   * @param objData The data object being inserted
   * @param strWhere  Where to insert "a" = after the insertDd, "b" before the insertId
   * @param strInsertId The id of the object where the insertion will happen
   */
  function insert( objData, strWhere, strInsertId )
  {
    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      addRow( objData, null, strWhere, strInsertId );

    }

  }


  /**
   * Adds a Row and/or Tile based on what is defined in the grid properties object
   *
   * @param objData The data to be added in either row and or tile views
   * @param strRowClass optional a string of one or more css classes to be added to this specfic row instance
   * @param strAddType "" = append, "p" = prepend, "a" = insert after the strInsertId row, "b" insert before the strInsertId Row
   * @param strInsertId the id of the row if adding before or after a specific row
   *
   */
  function add( objData, strRowClass, strAddType, strInsertId )
  {

    m_gridMain._mapGridDataById.put( objData[m_strDataIdProp], objData );

    if ( m_gridProps.folderIdProp )
    {
      // if the row being added is not part of the current folder, ignore the add
      if ( m_gridMain._curExpandedFolder && objData[m_gridProps.parentFolderIdProp] != m_gridMain._curExpandedFolder.id )
      {
        return;
      }
    }

    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      addRow( objData, strRowClass, strAddType, strInsertId )
    }
    else
    {

      const strTileId = getCanonicalObjectId( objData );

      if ( objData instanceof VwComponent )
      {
        addTileComponent( new VwTile( "", objData, gridProps.tileProps ), strAddType );

      }
      else
      {
        addTile( new VwTile( strTileId, objData, gridProps.tileProps ), strAddType );
      }

    }

  }


  /**
   * Moves an item in a folder to a different folder
   *
   * @param itemToMove The item to move
   * @param newFolder The new folder to move the item to
   * @returns {boolean}
   */
  function moveFolderItem( itemToMove, newFolder )
  {

    const itemToMoveMeta = getFolderMeta( itemToMove );

    let strParentFolderTitle;

    if ( itemToMoveMeta.parentFolder )
    {
      strParentFolderTitle = itemToMoveMeta.parentFolder;
    }
    else
    {
      strParentFolderTitle = "root";
    }

    let strDebug = "moveFolderItem: " + itemToMove.title + " id: " + itemToMove.assetIdPk + " from Folder : " + strParentFolderTitle + " to Folder: ";

    if ( newFolder )
    {
      strDebug += newFolder.title + " id: " + newFolder.assetIdPk;
    }
    else
    {
      strDebug += "root";
    }

    let newFolderMeta;

    if ( newFolder )
    {
      newFolderMeta = getFolderMeta( newFolder );
    }

    // Make sure we are not trying to move with in the same folder
    if ( !itemToMoveMeta.parentFolder && !newFolder )
    {
      return false; // Dropping with in folder
    }

    if ( itemToMoveMeta.parentFolder == newFolder )
    {
      return false; // Dropping with in folder
    }

    // remove object from its parents grid
    const fnRemove = itemToMoveMeta.parentGrid._mapPrivateMethods.get( "remove");
    fnRemove( itemToMove );

    let newFolderGrid;

    if ( newFolder == null )
    {
      newFolderGrid = m_gridMain;
    }
    else
    {
      newFolderGrid = newFolderMeta.folderGrid;
    }

    // Adjust item meta for new location
    itemToMoveMeta.parentFolder = newFolder;
    itemToMoveMeta.parentGrid = newFolderGrid;

    // Update the new folderId (parent folder of item being moved )

    if ( newFolder )
    {
      itemToMove[gridProps.parentFolderIdProp] = newFolder[m_strDataIdProp];
    }
    else
    {
      itemToMove[gridProps.parentFolderIdProp] = getDataModel().getRootFolderId();

    }

    newFolderGrid.setItemMoving( true );

    const fnAdd = newFolderGrid._mapPrivateMethods.get( "add");
    fnAdd( itemToMove );

    return true;

  }


  /**
   * Moves a folder from the original parent to the newFolder
   * @param folderToMove
   * @param newFolder
   */
  function moveFolder( folderToMove, newFolder )
  {
    const folderToMoveMeta = getFolderMeta( folderToMove );

    let strDebug = "moveFolder: " + folderToMove.title + " id: " + folderToMove.assetIdPk + " from " + folderToMoveMeta.title + " to Folder: ";

    if ( newFolder )
    {
      strDebug += newFolder.title + " id: " + newFolder.assetIdPk;
    }
    else
    {
      strDebug += "root";
    }

    //console.log( strDebug );


    let aNewFolderItems;


    if ( newFolder )
    {
      aNewFolderItems = newFolder[gridProps.folderDataIdProp];
      aNewFolderItems.push( folderToMove );
    }

    // Fix up parent folder id
    let newFolderMeta;

    // Make sure we are not trying to move with in the same folder
    if ( !folderToMoveMeta.parentFolder && !newFolder )
    {
      return false; // Dropping with in folder
    }

    if ( folderToMoveMeta.parentFolder == newFolder )
    {
      return false; // Dropping with in folder
    }

    // Update the parent folder's id property
    if ( newFolder )
    {
      newFolderMeta = getFolderMeta( newFolder );
      folderToMove[gridProps.parentFolderIdProp] = newFolder[m_strDataIdProp];
    }
    else
    {
      folderToMove[gridProps.parentFolderIdProp] = m_gridMain.getDataModel().getRootFolderId();
    }

    // remove object from its parents grid
    const fnRemove = folderToMoveMeta.parentGrid._mapPrivateMethods.get( "remove");
    fnRemove( folderToMove );

    let newFolderGrid;

    if ( newFolder == null )
    {
      newFolderGrid = m_gridMain;
    }
    else
    {
      newFolderGrid = newFolderMeta.folderGrid;
    }

    // Adjust folder meta for new location
    folderToMoveMeta.parentFolder = newFolder;
    folderToMoveMeta.parentGrid = newFolderGrid;
    folderToMoveMeta.fIsOpen = false;
    newFolderGrid.setItemMoving( true );

    // Add the folder to the new parent grid
    const fnAdd = newFolderGrid._mapPrivateMethods.get( "add");
    fnAdd( folderToMove );

    return true;
  }

  /**
   * Returns the folders in this grid
   * @returns {Array}
   */
  function getFolders()
  {
    return m_aSubFolders;

  }

  /**
   * Opens the folder
   *
   * @param strFolderId The folder Id to open
   */
  function openFolder( strFolderId )
  {
    const folderItem = getDataModel().getDataItem( strFolderId);

    openOrCloseFolder( folderItem, true  );

  } // end openFolder()

  /**
   * Closes all folders
   */
  function closeAllFolders()
  {
    const aFolders = getDataModel().getFolders();

    for ( const folderItem of aFolders )
    {
      closeFolder( folderItem[m_strDataIdProp ] );
    }
  }


  /**
   * Closes the folder
   *
   * @param strFolderId The folder id to close
   */
  function closeFolder( strFolderId )
  {
    const folderItem = getDataModel().getDataItem( strFolderId);

    openOrCloseFolder( folderItem, false  );

  }

  /**
   * Returns true if the folder is currently open,
   * false otherwise
   *
   * @param strFolderId The folder id to test
   * @returns {*|boolean}
   */
  function isFolderOpen( strFolderId )
  {
    const folderMeta = getFolderMeta( getDataModel().getDataItem( strFolderId ) );

    if ( folderMeta )
    {
      return folderMeta.fIsOpen;
    }
    else
    {
      return false;
    }

  } // end isFolderOpen()

  /**
   * Adds / prepends a row to the grid
   * @param objData  The object containing the data for the row
   * @param strRowClass a string with one or more class names separated by a space -- optional
   * @param strAddType "" = append, "p" = prepend, "a" = insert after the strInsertId row, "b" insert before the strInsertId Row
   * @param strInsertId the id of the row if adding before or after a specific row
   */
  function addRow( objData, strRowClass, strAddType, strInsertId )
  {

    const aDataSet = getDataModel().getDataSet();

    if ( aDataSet.length == 0  )
    {
      m_nRowCount = 0; // reset row counter
    }

    let strRowId = null;

    let folderMeta;

    if ( m_gridProps.folderIdProp )
    {
      folderMeta = getFolderMeta( objData );
      folderMeta.parentGrid = self;
    }

    const nRowNbr = aDataSet.length + 1;

    if ( m_strDataIdProp == "vwSeqId")
    {
      objData.vwSeqId = VW_ROW_ID_PREFIX + nRowNbr;
      strRowId = objData.vwSeqId;
    }
    else
    {
      strRowId = VW_ROW_ID_PREFIX + objData[m_strDataIdProp];

    }

    // Put data ref in map for quick selection lookups

    m_mapGridDataByRowId.put( strRowId, objData );

    let strAllRowClasses = "VwScrollableContent";

    if ( m_gridProps.cssGridRow )
    {
      strAllRowClasses += " " + m_gridProps.cssGridRow;
    }

    if ( strRowClass )
    {
      strAllRowClasses += " " + strRowClass;
    }


    if (  m_gridProps.showGridLines ||  m_gridProps.showRowLines )
    {
      strAllRowClasses += " " + m_gridProps.cssGridRowBorder;
    }

    let strRowDiv = "<div id='" + strRowId + "' class='" + strAllRowClasses + "'";

    strRowDiv += "/>";

    if ( strAddType == "p"  )
    {
      $( "#" + VW_GRID_BODY_ID ).prepend( strRowDiv );
    }
    else
    {
      if ( (strAddType == "a" || strAddType == "b")  )
      {
        if ( strAddType == "b" )
        {
          $( strRowDiv ).insertBefore( "#" + strInsertId );
        }
        else
        {
          $( strRowDiv ).insertAfter( "#" + strInsertId );

        }

      }
      else
      {
        $( "#" + VW_GRID_BODY_ID ).append( strRowDiv );

      }
    }

    // Add any row classes if needed
    if ( strAllRowClasses != "" )
    {
      $( "#" + strRowId ).addClass( strAllRowClasses );
      objData["userClass"] = strAllRowClasses;             // reserve added user classes so they can be re-applied on sorting

    }

    //  focus out of row select
    $( "#" + strRowId ).mousedown( handleRowSelection );

    if ( m_gridProps.fnFocusout)
    {
      $( "#" + strRowId ).focusout(()=>
                                   {
                                     m_gridProps.fnFocusout( objData)
                                   });
    }


    $( "#" + strRowId ).hover( handleRowHoverIn, handleRowHoverOut );

    $( "#" + strRowId ).dblclick( handleRowDblClick );

    addRowColumns( strRowId, objData );

    setupDragDropEvents( strRowId );

    if ( m_gridProps.applyRowStriping )
    {
      applyRowStriping();
    }

    if ( m_gridProps.folderIdProp )
    {
      if ( isFolder( objData ) )
      {
        buildFolderGrid( objData );
      }
      else
      {
        if ( m_fItemMoving && folderMeta.parentFolder )
        {
          m_fItemMoving = false;
          const folderParent = folderMeta.parentFolder;
          let aFolderParentData = folderParent[m_gridProps.folderDataIdProp];

          if ( !aFolderParentData )
          {
            aFolderParentData = [];
            folderParent[m_gridProps.folderDataIdProp] = aFolderParentData;
          }

          aFolderParentData.push( objData );

          const folderParentMeta = getFolderMeta( folderMeta.parentFolder, m_gridMain );
          if ( folderParentMeta.fIsOpen && aFolderParentData.length == 1 )
          {
            openOrCloseFolder( folderMeta.parentFolder, true );
          }
        }
      }
    }

    if ( m_gridProps.postRowAdd && !m_fItemMoving )
    {
      m_gridProps.postRowAdd.call( self, self, objData );

    }

  } // end addRow


  /**
   * Adds the columns to the parent row div
   */
  function addRowColumns( strRowId, objRow )
  {
    // Add the columns

    for ( let x = 0; x < m_gridProps.aHdrCols.length; x++ )
    {
      let strOverLayColId = null;

      let strColId = strRowId + "_" + x;

      // see if this column is a hover overlay

      if ( m_gridProps.aHdrCols[x].rowHover  )
      {
        strOverLayColId = strRowId + "_" + m_gridProps.aHdrCols[x].rowHover + "_overlay";
        strColId = strRowId + "_" + m_gridProps.aHdrCols[x].rowHover;

        if ( !inArray( m_aColOverlays, m_gridProps.aHdrCols[x].rowHover ) )
        {
          const rowHover = {};
          rowHover.nColNbr = m_gridProps.aHdrCols[x].rowHover;
          rowHover.fMaintainOnSelectedRow = m_gridProps.aHdrCols[x].keepOnSelected;
          m_aColOverlays.push( rowHover );
        }
      }


      if ( strOverLayColId == null )
      {
        const nColWidth = m_gridProps.aHdrCols[x].width;

        let strDataClass = m_gridProps.cssColContainer;

        if ( m_gridProps.aHdrCols[x].cssColContainer )
        {
          strDataClass = m_gridProps.aHdrCols[x].cssColContainer;
        }

        let colDivEl = $( "<div>" ).attr( "id", "colContainer_" + strColId ).addClass( strDataClass ).css( {"width":nColWidth,
                                                                                           "min-width":nColWidth, "max-width":m_gridProps.aHdrCols[x].maxWidth
                                                                                         } );
        $( "#" + strRowId ).append( colDivEl );

      }

      $( "#colContainer_" + strColId ).unbind().click( handleCellClicked );

      if ( m_gridProps.aHdrCols[x].hover )
      {
        $( "#colContainer_" + strColId ).hover( handleCellHoverIn, handleCellHoverOut );
      }

      if ( m_gridProps.showGridLines || m_gridProps.showColLines )
      {
        $( "#colContainer_" + strColId ).addClass( m_gridProps.cssGridColBorder );
      }

      let colData;

      if ( m_gridProps.aHdrCols[x].dataId )
      {
        colData = VwUtils.getObjProperty( objRow, m_gridProps.aHdrCols[x].dataId );

      }

      // dataVal trumps dataId from object
      if ( m_gridProps.aHdrCols[x].dataVal )
      {
        colData = m_gridProps.aHdrCols[x].dataVal;

      }

      if ( m_gridProps.aHdrCols[x].colType == "seq" )
      {
        if ( !m_nSeqNbr )
        {
          if ( m_gridProps.aHdrCols[x].seqStartVal )
          {
            m_nSeqNbr = m_gridProps.aHdrCols[x].seqStartVal;
          }
          else
          {
            m_nSeqNbr = 1;

          }
        }

        colData = m_nSeqNbr++;

      }

      if ( !colData && (typeof colData != "boolean") )
      {
        colData = m_gridProps.defaultForNull;

      }

      // Apply formatter if specified
      if ( m_gridProps.aHdrCols[x].format )
      {
        colData = applyFormat( colData, m_gridProps.aHdrCols[x] );

      }

      // Apply formatter if specified
      if ( m_gridProps.aHdrCols[x].dynamic )
      {
        colData = m_gridProps.aHdrCols[x].dynamic( objRow );
      }

      if ( m_gridProps.aHdrCols[x].htmlDataTemplate )
      {
        const strExpandHtml = VwExString.expandMacros( m_gridProps.aHdrCols[x].htmlDataTemplate, objRow );
        $( "#colContainer_" + strColId ).html( strExpandHtml );
      }
      else
      {
        installColumnDataRenderer( objRow, strRowId, strColId, m_gridProps.aHdrCols[x], colData );

        if ( m_gridProps.aHdrCols[x].toolTipId  )
        {
          let strToolTipText;

          if ( m_gridProps.aHdrCols[x].toolTipId )
          {
            strToolTipText = objRow[m_gridProps.aHdrCols[x].toolTipId];
          }
          else
          {
            strToolTipText = m_gridProps.aHdrCols[x].toolTip;
          }

          $( "#colContainer_" + strColId + " :first-child").attr( "title", strToolTipText );
        }
        else
        if ( m_gridProps.aHdrCols[x].tooltip  )
        {
          $( "#colContainer_" + strColId + " :first-child").attr( "tooltip", m_gridProps.aHdrCols[x].tooltip );

        }


      } // end else

      // Folder support if defined
      if ( m_gridProps.folderColExpanderId && isFolder( objRow ) )
      {
        if ( m_gridProps.aHdrCols[x].id == m_gridProps.folderColExpanderId )
        {
          $( "#" + strColId ).css( "visibility", "visible" );
          $( "#" + strColId ).unbind().click( handleFolderExpanderClicked )

        }

        if ( m_gridProps.folderColExpanderId && m_gridProps.aHdrCols[x].id == m_gridProps.folderColumnId )
        {
          $( "#" + strColId ).unbind().dblclick( handleFolderDoubleClicked );
        }

      }


    } // end for( x...

  } // end addRowColumns

  /**
   * The new grid for a folder asset
   * @param objFolder
   */
  function buildFolderGrid( objFolder )
  {
    if ( !folderExists( m_gridMain._aAllFolders, objFolder ) )
    {
      m_gridMain._aAllFolders.push( objFolder );
    }

    let aFolderData = objFolder[m_gridProps.folderDataIdProp];

    if ( aFolderData && aFolderData.length == 0 )
    {
      aFolderData = null;
    }

    addRowSubGrid( objFolder, m_gridProps, aFolderData );

  }

  /**
   * Searches the array of data for the existence of the search object
   * @param aData The array of data to search
   * @param objSearch The object in the array to search for
   */
  function folderExists( aData, objSearch )
  {
    for ( const dataItem of aData )
    {
      if ( dataItem[m_strDataIdProp] == objSearch[m_strDataIdProp] )
      {
        return true;
      }
    }

    return false;
  }

  /**
   * Test if the grid entry is defined as a folder
   * @param objEntry
   */
  function isFolder( objEntry )
  {
    if ( !m_gridProps.folderIdProp )
    {
      return false;
    }

    return objEntry[m_gridProps.folderIdProp] == m_gridProps.folderIdValue;

  } // end isFolder()

  /**
   * Folder double handleClick -- expand folder data to overlay current grid body
   * @param event
   */
  function handleFolderDoubleClicked( event )
  {
    const strRowId = getRowIdFromEvent( event );
    const objFolder = m_mapGridDataByRowId.get( strRowId );

    openRowFolder( objFolder, true );

  }

  /**
   * Expands a folder to replace the current view
   * @param objFolderToExpand The folder object to be expanded
   */
  function openRowFolder( objFolderToExpand, fAdjustBreadCrumb )
  {

    const expandFolderMeta = getFolderMeta( objFolderToExpand );

    //m_gridMain._expandedViewGrid = expandFolderMeta.folderGrid;
    //m_gridMain._expandedViewGrid.expand( objFolderToExpand );

    m_gridMain.expand( objFolderToExpand );
    if ( m_gridProps.fnFolderOpenEvent )
    {
      m_gridProps.fnFolderOpenEvent( objFolderToExpand, expandFolderMeta.folderGrid );
    }

    if ( !fAdjustBreadCrumb )
    {
      return;
    }

    const aFolderParents = getFolderParents( objFolderToExpand );

    m_breadCrumbModel = m_gridMain.getBreadCrumbModel();

    aFolderParents.forEach( function ( folderParent )
                            {
                              // Dont add if crumb alread exists
                              if ( m_breadCrumbModel.getCrumb( folderParent[m_gridProps.breadCrumbIdProp] ) )
                              {
                                return;
                              }

                              m_breadCrumbModel.addCrumb( folderParent );


                            } );

    // add in the folder expanded
    m_breadCrumbModel.addCrumb( objFolderToExpand );


  }

  /**
   * Returns
   * @param objFolder
   * @returns {Array}
   */
  function getFolderParents( objFolder )
  {
    const aFolderParents = [];

    let curParent = objFolder;

    while ( true )
    {
      const folderParentMeta = getFolderMeta( curParent );
      if ( !folderParentMeta.parentFolder )
      {
        break;
      }

      aFolderParents.unshift( folderParentMeta.parentFolder );
      curParent = folderParentMeta.parentFolder;
    }

    return aFolderParents;
  }

  /**
   * Collapses a folder
   *
   * @param folderExpanding   The folder to expand
   * @param folderCollapsing  The folder to collapse
   */
  function closeRowFolder( folderCollapsing, folderExpanding )
  {
    // User clicked on the last bread crumb which is already showing
    if ( folderCollapsing == folderExpanding )
    {
      return;
    }

    if ( m_gridMain._strCurViewStyle == VwGridV1.TILE_VIEW )
    {
      closeTileFolder( folderCollapsing, folderExpanding );
      return;

    }

    /* todo
    const folderExpandingMeta = getFolderMeta( folderExpanding );

    let folderExpandingGrid = folderExpandingMeta.folderGrid;

    if ( folderExpandingGrid )
    {
      const objExpandProperties = m_gridMain.getGridProps();
      folderExpandingGrid.setGridProps( objExpandProperties );
    }

    m_gridMain._expandedViewGrid = folderExpandingGrid;

    if ( !folderExpandingGrid )
    {
      folderExpandingGrid = m_gridMain;
      folderExpanding = null;
    }

     */

    m_gridMain.expand( folderExpanding, true );

    if ( m_gridProps.fnFolderCloseEvent )
    {
      m_gridProps.fnFolderCloseEvent( folderCollapsing, folderExpanding, m_gridMain );
    }

  }

  /**
   * Folder expander icon handleClick
   * @param event
   */
  function handleFolderExpanderClicked( event )
  {
    const strRowId = getRowIdFromEvent( event );

    const folder = m_mapGridDataByRowId.get( strRowId );

    const folderMeta = getFolderMeta( folder );

    folderMeta.fIsOpen = !folderMeta.fIsOpen;

    openOrCloseFolder( folder, folderMeta.fIsOpen );

  }

  /**
   * Open or close a folder based on fOpen
   *
   * @param folder The folder to open or close
   * @param fOpen true to open the folder / false to close
   */
  function openOrCloseFolder( folder, fOpen )
  {
    const folderMeta = getFolderMeta( folder );

    const strColId = getColId( folder, m_gridProps.folderColExpanderId );

    folderMeta.fIsOpen = fOpen;

    try
    {

      if ( fOpen )
      {
        $( "#" + strColId ).attr( "src", m_gridProps.folderCloseIcon );

        const aFolderChildren = folder[m_gridProps.folderDataIdProp];

        if ( !aFolderChildren || aFolderChildren.length == 0 )
        {
          // Folder is now empty hide the extender
          $( "#" + folderMeta.strExtenderId ).hide();
          return;

        }

        $( "#" + folderMeta.strExtenderId ).show();

        if ( m_gridProps.fnFolderExpandedEvent )
        {
          m_gridProps.fnFolderExpandedEvent( folder );
        }
      }
      else
      {
        $( "#" + strColId ).attr( "src", m_gridProps.folderOpenIcon );
        $( "#" + folderMeta.strExtenderId ).hide();

        if ( m_gridProps.fnFolderCollapsedEvent )
        {
          m_gridProps.fnFolderCollapsedEvent( folder );
        }

      }
    }
    finally
    {
      $("#" + VW_GRID_BODY_ID ).trigger( "DOMSubtreeModified", {} );
    }
  }

  /**
   * Finds the top level grid. walks up the grid parent
   * @returns {VwGridV1}
   */
  function getTopLevelGrid()
  {
    let gridParent = self;

    while ( true )
    {
      if ( gridParent.getParentGrid() != null )
      {
        gridParent = gridParent.getParentGrid();
      }
      else
      {
        return gridParent;

      }
    }
  }

  /**
   * Returns the column number for the column id if colId is a string
   *
   * @param colId If colId is not a number then it is assumed to be the id as specified the the VwGrid header properties
   * @returns {*}
   */
  function getColNbr( colId )
  {
    if ( isNaN( colId ) ) // Look through grid header properties for a match
    {
      return findColNbrFromId( colId );
    }
    else
    {
      // Its a number -- make srue its a valid index
      if ( colId < 0 || colId >= m_gridProps.aHdrCols.length )
      {
        throw "Column number: " + colId + " is out of range for the number of columns defined: " + m_gridProps.aHdrCols.length;
      }

      return colId;

    }

  }

  /**
   * Returns the Column Header object
   *
   * @param strColHdrId The id of the column header to get
   * @returns {*}
   */
  function getColHdrSpec( strColHdrId )
  {
    return getHdrColFromId( strColHdrId  );

  } // end getColHdrSpec()


  function findColNbrFromId( strColId )
  {
    let nColNbr = -1;
    for ( const hdrCol of m_gridProps.aHdrCols )
    {
      ++nColNbr;
      if ( strColId == hdrCol.id )
      {
        return nColNbr;
      }
    }

    throw "Column id: " + strColId + " was not defined in the grid header properties";

  }

  /**
   * Updates a Grids colum properties
   *
   * @param strColumnId The column id to update
   * @param updateColProps The properties to update
   * @param bRefreshModel if true handleRefresh the data model. If, multiple columns are going to be update, set this falg to true on the ;last one for effientcy
   */
  function handleUpdateColumnProps( strColumnId, updateColProps, bRefreshModel )
  {
    const hdrColProps = getHdrColFromId( strColumnId );
    if ( ! hdrColProps )
    {
      throw `UpdateColumnProps failed because requestwed column id '${strColumnId} does not exist`;
    }

    $.extend( hdrColProps, updateColProps );

    // Update the header column inn the dom as well
    $(`#${strParentId}_${strColumnId}_container`).css( "width", hdrColProps.width );
    $(`#${strParentId}_${strColumnId}_container`).css( "min-width", hdrColProps.minWidth );
    $(`#${strParentId}_${strColumnId}_container`).css( "max-width", hdrColProps.maxWidth );

    if ( bRefreshModel)
    {
      m_gridMain._gridDataModel.refresh();
    }

  } // end handleUpdateColumnProps()

  /**
   * Returns the hdr col object as defined in the grid properties
   * @param strColId
   * @returns {*}
   */
  function getHdrColFromId( strColId )
   {
     for ( const hdrCol of m_gridProps.aHdrCols )
     {

       if ( strColId == hdrCol.id )
       {
         return hdrCol;
       }
     }

     throw "Column id: " + strColId + " was not defined in the grid header properties";

   }

  /**
   * Finds the column number by its id prop in the header definition
   *
   * @param strColDataId The id of the column as defined in the header properties
   * @returns {number}
   */
  function getHdrColPropsById( strColId )
  {
    for ( const hdrCol of m_gridProps.aHdrCols )
    {

      if ( strColId == hdrCol.id )
      {
        return hdrCol;
      }
    }

    throw "Column id: " + strColId + " was not defined in the grid header properties";

  }


  /**
   * Test to see if an item is in the array
   *
   * @param aArrItems The array to search
   * @param itemtoFind  The item to find in the array
   * @returns {boolean}
   */
  function inArray( aArrItems, itemtoFind )
  {
    for ( const item of aArrItems )
    {
      if ( item.nColNbr == itemtoFind )
      {
        return true;
      }
    }

    return false;
  }

  /**
   * Adds a tile to grid
   *
   * @param vwTile The VwTile object to add
   */
  function addTile( vwTile, strAddType )
  {

    let tileRow = getTileRow( strAddType );

    const objTileData = vwTile.getData();

    if ( !m_gridProps.tileProps )
    {
      alert( "The tileProps object is not defined for the tile view. Please see tile property doc for details." );
      return;
    }

    if ( !m_gridProps.tileProps.maxRowTiles )
    {
      alert( "The maxRowTiles property is not defined for the tile view. Please see tile property doc for details." );
      return;
    }

    const nMaxTileCount = m_gridProps.tileProps.maxRowTiles;

    const nNbrTiles = tileRow.getTileCount();
    
    tileRow.addTile( vwTile, m_gridMain.getGridId(), strAddType );

    if ( isFolder( objTileData ) )
    {
      vwTile.dblClick( function ( event, vwTile )
                       {
                         openTileFolder( vwTile.getData(), true );

                       } );
    }
    else
    {
      vwTile.click( handleTileClicked );
    }


    if ( m_gridProps.postTileAdd )
    {
      m_gridProps.postTileAdd.call( self, self, objTileData );
    }

    if ( m_gridProps.postTileActionHandler )
    {
      m_gridProps.postTileActionHandler.call( self, self );
    }

    if ( strAddType == "p" && m_aTileRows.length > 1  )
    {
      rebuildTileRows();
    }

    if ( m_aTileRows.length == 1 && tileRow.getTileCount() == 1 )
    {
      computeTileSizeMetrics( vwTile );

    }

    const strTileId = vwTile.getId();

    if ( m_tileDndMgr )
    {
      m_tileDndMgr.installDragDrop( strTileId );
    }

  }


  function computeTileSizeMetrics( vwTile )
  {
    m_gridProps.tileProps.tileWidth = vwTile.getWidth();
    m_gridProps.tileProps.tileHeight = vwTile.getHeight();
  }


  function rebuildTileRows()
  {
    setupTileView();
  }

  /**
   * Get the last tile row and create the first one if needed
   * @returns {*}
   */
  function getTileRow( strAddType )
  {
    // get the current tile row
    let tileRow = m_aTileRows[m_aTileRows.length - 1];

    if ( m_aTileRows.length == 0 )
    {
      m_gridProps.tileProps.aTileRows = m_aTileRows;

      tileRow = makeTileRow( strAddType );

      m_aTileRows.push( tileRow );

    }
    else
    if ( tileRow.getTileCount() == m_gridProps.tileProps.maxRowTiles )
    {
      tileRow = makeTileRow( strAddType );
      if ( strAddType == "p" )
      {
        m_aTileRows.unshift( tileRow );

      }
      else
      {
        m_aTileRows.push( tileRow );
      }
    }
    else
    {
      tileRow = m_aTileRows[m_aTileRows.length - 1];

    }

    return tileRow;


  }

  function addTileComponent( vwTile, strAddType )
  {
    let tileRow = getTileRow( strAddType );

    if ( !m_gridProps.tileProps )
    {
      alert( "The tileProps object is not defined for the tile view. Please see tile property doc for details." );
      return;
    }

    const nMaxTileCount = m_gridProps.tileProps.maxRowTiles;

    const nNbrTiles = tileRow.getTileCount();

    if ( nNbrTiles == nMaxTileCount )
    {

      tileRow = makeTileRow( strAddType );

      if ( strAddType == "p" )
      {
        m_aTileRows.unshift( tileRow );

      }
      else
      {
        m_aTileRows.push( tileRow );

      }
    }

    vwTile.setId( tileRow.getId() );

    tileRow.addComponent( vwTile, self.getGridId(), strAddType );
  }

  /**
   * Create a new VwTileRow instance
   * @returns {VwTileRow}
   */
  function makeTileRow( strAddType )
  {
    if ( typeof m_gridProps.tileProps.defaultForNull == "undefined" )
    {
      // Check for global view override
      m_gridProps.tileProps["defaultForNull"] = m_gridProps.defaultForNull;

    }

    // Propagate the dataIdProp to the tile props if not defined
    if ( !m_gridProps.tileProps.dataIdProp )
    {
      m_gridProps.tileProps.dataIdProp = m_strDataIdProp;
    }


    m_gridProps.tileProps.cssSelected = m_gridProps.cssRowSelected;
    m_gridProps.tileProps.cssHover = m_gridProps.cssRowHovered;

    const strRowParent = VW_GRID_PREFIX + m_gridMain.getGridId();

    return new VwTileRow( strRowParent, m_aTileRows.length, m_gridProps.tileProps, strAddType );

  }

  /**
   * Formats the data according to the formatter
   * @param data The data to format
   * @param colHdr The column header passed on the object properties
   */
  function applyFormat( data, colHdr )
  {

    if ( typeof colHdr.format == "function" )
    {
      return colHdr.format( data );
    }

    let strFormatDataType = "s"; // Assume string

    if ( colHdr.sortType )
    {
      strFormatDataType = colHdr.sortType;
    }
    else
    {
      if ( colHdr.formatType )
      {
        strFormatDataType = colHdr.formatType;

      }
    }

    switch ( strFormatDataType.charAt( 0 ) )
    {
      case "d":

        // Attempt to convert date string to date if not a date object
        if ( !(data instanceof Date) )
        {
          data = new Date( data );
        }

        return data.format( colHdr.format );

      case "n":
      case "f":

        if ( isNaN( data ) )
        {
          return data;

        }

        if ( colHdr.format == "#MB" )
        {
          return VwExString.formatSize( Number( data ) );
        }

      case "t":  // Time format

        if ( isNaN( data ) )
        {
          return data;

        }

        if ( VwExString.contains( colHdr.format, "m:s" ) )
        {
          let fLeadingZero = false;

          if ( VwExString.contains( colHdr.format, "mm" ) )
          {
            fLeadingZero = true;
          }

          return VwExString.secsToString( data, fLeadingZero );
        }

        // for Now just return data until other format's defined

        return data;

      default:

        return data;
    }

  }


  /**
   * Apply row striping
   * @returns The row striping class to add
   */
  function applyRowStriping()
  {
    const astrBodyClasses = m_gridProps.cssGridBody.split( " " );

    if ( m_gridProps.cssRowStripeEven )
    {
      // Reset all rows
      $( `.${m_gridProps.cssGridRow}` ).removeClass( m_gridProps.cssRowStripeEven );

      $( `.${m_gridProps.cssGridRow}:nth-child(2n)` ).addClass( m_gridProps.cssRowStripeEven );
    }
    else
    if ( m_gridProps.cssRowStripeOdd )
    {
      // Reset all rows
      $( `.${m_gridProps.cssGridRow}` ).removeClass( m_gridProps.cssRowStripeOdd );

      $( `.${m_gridProps.cssGridRow}:nth-child(2n)` ).addClass( m_gridProps.cssRowStripeOdd );
    }

  } // end applyRowStriping()


  /**
   * Setup grid drag drop listeners
   */
  function setupContainerDrop()
  {
    const domGridBody = $( "#" + m_strGridId )[0];

    if ( domGridBody )
    {
      if ( m_gridProps.allowDrop )
      {
        // Install drag drop event handlers
        domGridBody.addEventListener( "drop", handleDropEvent );
        domGridBody.addEventListener( "dragover", handleContainerDragOverEvent );
        domGridBody.addEventListener( "dragleave", handleContainerDragLeave );
        domGridBody.addEventListener( "dragend", handleContainerDragEnd );

      }
    }

  } // end setupContainerDrop()

  /**
   * Add drag drop events for a row
   * @param strRowId
   */
  function setupDragDropEvents( strRowId )
  {

    if ( !m_gridProps.allowItemReorder && !m_gridProps.allowDrop && !m_gridProps.allowDrag )
    {
      return;

    }

    const domGridRow = $( "#" + strRowId )[0];

    if ( m_gridProps.allowItemReorder || m_gridProps.allowDrag )
    {
      $( domGridRow ).attr( "draggable", "true" );
      domGridRow.addEventListener( "dragstart", handleDragStart, false );

    }

    if ( m_gridProps.allowItemReorder || m_gridProps.allowDrop )
    {
      domGridRow.addEventListener( "drop", handleDropEvent, false );

    }

    domGridRow.addEventListener( "dragover", handleItemDragOverEvent, false );
    domGridRow.addEventListener( "dragenter", handleItemDragEnter, false );
    domGridRow.addEventListener( "dragleave", handleItemDragLeave, false );
    domGridRow.addEventListener( "dragend", handleDragEnd, false );

  } // end setupDragDropEvents()

  function handleContainerDragEnd( ev )
  {

    ev.preventDefault();

    if ( m_gridProps.cssContainerDragEnter )
    {
      $( "#" + VW_GRID_BODY_ID ).removeClass( m_gridProps.cssContainerDragEnter );
    }
  }

  /**
   * Drag end callback
   * @param event
   */
  function handleDragEnd( event )
  {

    event.preventDefault();

    // If a column text is being edited, don't drag
    if ( m_fColEleEditMode )
    {
      return false;
    }

    if ( m_gridProps.cssContainerDragEnter )
    {
      $( "#" + VW_GRID_BODY_ID ).removeClass( m_gridProps.cssContainerDragEnter );
    }

    if ( m_elementDragged )
    {
      m_elementDragged.style.opacity = "";
    }

    let strDropAcceptKey = m_strGridId + "_dropAccept";

    if ( window[strDropAcceptKey] )
    {
      // drop was accepted

      delete window[strDropAcceptKey];
    }

  }

  /**
   * Drag start callback
   * @param event
   */
  function handleDragStart( event )
  {
    // If a column text is being edited, don't drag, prevent all defaults
    if ( m_fColEleEditMode )
    {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      return false;
    }

    const aSelObjects = m_thisGrid.getSelectedObjects();

    if ( aSelObjects == null )
    {
      return;

    }

    m_gridMain._itemDragged = aSelObjects[0];
    m_gridMain._fNoDragEnter = false;

    aSelObjects[0].gridId = m_strGridId;

    const strRowId = aSelObjects[0].gridId + "_" + aSelObjects[0][m_strDataIdProp];

    const strJson = JSON.stringify( aSelObjects );

    m_elementDragged = $( "#" + strRowId )[0];
    m_elementDragged.style.opacity = '0.6';

    event.dataTransfer.setData( DATA_TRANSFER_TYPE, strJson );

    event.dataTransfer.effectAllowed = m_gridProps.dragType;

  } // end handleDragStart()


  /**
   * Grid row drag event
   * @param ev
   * @returns {boolean}
   */
  function handleItemDragOverEvent( ev )
  {

    if ( !m_gridProps.allowItemReorder && !m_gridProps.allowDrop )
    {
      return;

    }


    if ( m_gridMain._itemDragged )
    {
      if ( !allowedDropZone( m_gridMain._itemDragged, ev.currentTarget.id ) )
      {
        m_gridMain._fNoDragEnter = true;
        return;
      }
    }

    ev.preventDefault();

    m_gridMain._fNoDragEnter = false;

    return false;

  } // end handleItemDragOverEvent()

  /**
   * Check to see if item being dragged can be dropped on the target item
   *
   * @param itemDragged The item being dragged
   * @param strDragOverItemId The id of the target item
   * @returns {boolean}
   */
  function allowedDropZone( itemDragged, strDragOverItemId )
  {
    if ( itemDragged == null )
    {
      return false;
    }

    const targetItem = m_mapGridDataByRowId.get( strDragOverItemId );

    if ( m_gridProps.folderIdProp )
    {
      const itemDraggedMeta = getFolderMeta( itemDragged );
      const targetMeta = getFolderMeta( targetItem );

      if ( targetItem == null )
      {
        return itemDraggedMeta.parentFolder != null;
      }

      // Cant drop on same item
      if ( targetItem[m_strDataIdProp] == itemDragged[m_strDataIdProp] )
      {
        return false;

      }


      if ( isChild( targetMeta, itemDragged ) )
      {
        return false;
      }

      if ( isFolder( targetItem ) )
      {
        // Can't drop on items with same parent
        if ( itemDraggedMeta.parentFolder == targetItem )
        {
          return false;
        }
      }
      // Dont allow parent folders to be droppen on any of ots children

      if ( itemDraggedMeta.parentFolder == targetMeta.parentFolder && !isFolder( targetItem ) )
      {
        return false
      }
    }


    return true;

  }


  /**
   * Determines if the item being dragged is a child of the target of the drag
   * @param itemBeingDragged folder meta of item being dragged
   * @param targetItem The item target (item being dragged over)
   * @returns {boolean}
   */
  function isChild( targetItemMeta, itemBeingDragged )
  {
    let itemParentMeta = getFolderMeta( targetItemMeta.parentFolder );

    while ( true )
    {
      if ( itemParentMeta == null )
      {
        return false;
      }

      if ( itemParentMeta[m_strDataIdProp] == itemBeingDragged[m_strDataIdProp] )
      {
        return true;

      }

      itemParentMeta = getFolderMeta( itemParentMeta.parentFolder );
    }

  }  // end isChild()

  /**
   * Grid container  drag over event
   * @param ev
   * @returns {boolean}
   */
  function handleContainerDragOverEvent( ev )
  {

    if ( !m_gridProps.allowDrop )
    {
      return;

    }

    ev.preventDefault();


    return false;

  }

  /**
   *
   * @param ev
   * @returns {boolean}
   */
  function handleItemDragEnter( ev )
  {

    if ( m_gridMain._fNoDragEnter )
    {
      return false;

    }

    if ( m_gridProps.cssItemDragEnter && m_gridProps.allowDrop )
    {
      $( "#" + ev.currentTarget.id ).addClass( m_gridProps.cssItemDragEnter );
    }

    return false;

  }


  function handleContainerDragLeave( ev )
  {

    if ( m_gridProps.cssContainerDragEnter && m_gridProps.allowDrop )
    {
      $( "#" + VW_GRID_BODY_ID ).removeClass( m_gridProps.cssContainerDragEnter );
    }


    return false;

  }


  function handleItemDragLeave( ev )
  {
    this.style.opacity = "";

    if ( m_gridProps.cssItemDragEnter && m_gridProps.allowDrop )
    {
      $( "#" + ev.currentTarget.id ).removeClass( m_gridProps.cssItemDragEnter );
    }

    return false;

  } // end handleItemDragLeave()

  function handleDropEvent( ev )
  {

    ev.preventDefault();
    ev.stopImmediatePropagation();

    this.style.opacity = "";

    if ( m_gridProps.cssContainerDragEnter )
    {
      $( "." + m_gridProps.cssContainerDragEnter ).removeClass( m_gridProps.cssContainerDragEnter );

    }

    if ( m_gridProps.cssItemDragEnter )
    {
      $( "." + m_gridProps.cssItemDragEnter ).removeClass( m_gridProps.cssItemDragEnter );

    }

    if ( m_gridMain._itemDragged && !allowedDropZone( m_gridMain._itemDragged, ev.currentTarget.id ) )
    {
      m_gridMain._itemDragged = null;
      return;

    }

    let objDropData;

    const strTransferType = findDataTransferType( ev.dataTransfer.types );

    switch ( strTransferType )
    {
      case DATA_TRANSFER_TYPE:

        objDropData = ev.dataTransfer.getData( DATA_TRANSFER_TYPE );
        if ( objDropData.charAt( 0 ) != "{" && objDropData.charAt( 0 ) != "[")
        {
          return;
        }
        
        objDropData = JSON.parse( objDropData );

        break;

      case "Files":

        objDropData = ev.dataTransfer.files;

        break;

      default:

        objDropData = ev.dataTransfer.files;

        break;


    }

    const data = objDropData[0];


    if ( m_gridProps.allowItemReorder && data.gridId == m_strGridId )
    {

      doItemReorder( objDropData, ev.currentTarget.id );

      if ( m_gridProps.fnItemReorderHandler )
      {
        m_gridProps.fnItemReorderHandler( data );
        return;
      }

    }

    if ( m_gridProps.fnDropHandler )
    {
      m_gridProps.fnDropHandler( ev );

      return;

    }

    if ( m_gridProps.folderIdProp && m_gridProps.allowFolderMoves )
    {
      doFolderItemMove( data, ev );
      return;

    }



    if ( objDropData[0].gridId == m_strGridId )
    {
      return; // drop not allowd on same grid as drag
    }


    // Add in new rows
    for ( const dataItem of objDropData )
    {
      // make sure we dont have a duplication row

      addRow( dataItem, dataItem.userClass );
    }
  }


  /**
   * Finds the specific transfer type  from a drop event
   * @param astrTransferTypes
   * @returns {*}
   */
  function findDataTransferType( astrTransferTypes )
  {
    for ( const transferType of astrTransferTypes )
    {
      if ( transferType == DATA_TRANSFER_TYPE )
      {
        return transferType;
      }
    }

    return null;
  }


  /**
   * Moves folders/folder items to their new place based on the drag and drop event
   *
   * @param objDropped The object that was dropped a folder or an item in a folder
   */
  function doFolderItemMove( objDropped, event )
  {

    const breadCrumbModel = m_gridMain.getBreadCrumbModel();

    let objDroppedOn = getDataByDragEvent( event );

    const folderDroppedMeta = getFolderMeta( objDropped );
    let folderMetaDroppedOn;

    const oldParent = folderDroppedMeta.parentFolder;

    let newParent;

    let fMoveSuccess;

    if ( objDroppedOn )
    {
      folderMetaDroppedOn = getFolderMeta( objDroppedOn );
    }

    try
    {
      if ( objDroppedOn == null )
      {
        objDroppedOn = getParentFromBreadCrumb( breadCrumbModel );

        // This is the toplevel master grid
        if ( objDroppedOn == null )
        {
          if ( isFolder( objDropped ) )
          {
            fMoveSuccess = self.moveFolder( objDropped, null );
          }
          else
          {
            fMoveSuccess = self.moveFolderItem( objDropped, null );

          }

          folderDroppedMeta.parentGrid = self;
          return;
        }
      }  // end if

      if ( isFolder( objDroppedOn ) )
      {

        if ( isFolder( objDropped ) )
        {
          fMoveSuccess = folderMetaDroppedOn.folderGrid.moveFolder( objDropped, objDroppedOn );

        }
        else
        {
          fMoveSuccess = folderMetaDroppedOn.folderGrid.moveFolderItem( objDropped, objDroppedOn );

        }

        newParent = objDroppedOn;
      }
      else
      {
        if ( isFolder( objDropped ) )
        {
          const folderDroppedParentMeta = getFolderMeta( folderDroppedMeta.parentFolder );

          let folderMovingGrid;

          if ( folderDroppedParentMeta == null )
          {
            folderMovingGrid = m_gridMain;
          }
          else
          {
            folderMovingGrid = folderDroppedParentMeta.folderGrid;
          }
          fMoveSuccess = folderMovingGrid.moveFolder( objDropped, folderMetaDroppedOn.parentFolder );
          newParent = folderDroppedMeta.parentFolder;
        }
        else
        {
          // This happens when user drags an item on top of an expanded folders item
          if ( !folderMetaDroppedOn.parentFolder )
          {
            fMoveSuccess = self.moveFolderItem( objDropped, null );
            newParent = null;
            return;
          }
          else
          {
            newParent = folderMetaDroppedOn.parentFolder;

          }

          fMoveSuccess = folderMetaDroppedOn.parentGrid.moveFolderItem( objDropped, newParent );

        }
      } // end else
    }
    finally
    {
      if ( m_gridProps.fnFolderItemMovedEvent && fMoveSuccess )
      {
        m_gridProps.fnFolderItemMovedEvent( objDropped, oldParent, newParent );
      }
    }

  }

  function getParentFromBreadCrumb( breadCrumbModel )
  {
    // We need to find the actual parent based on the last breadcrumb

    const breadcrumb = breadCrumbModel.getLastCrumb();

    const crumbId = breadcrumb[m_gridProps.breadCrumbIdProp];

    if ( crumbId == m_gridProps.breadCrumbBaseNameId )
    {
      return null;
    }
    else
    {
      return breadcrumb;
    }

  }

  /**
   * Hande the row reorder from the drop zone. The row dragged will be inserted above the row it was dropped on
   * @param objDropData The row object that was dragged and needs to be moved
   * @param strDropId The id of the row it was dropped on
   */
  function doItemReorder( objDropData, strDropId )
  {

    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      removeEntry( objDropData[0] );

      if ( strDropId == m_strGridId )
      {
        addRow( objDropData[0] )
      }
      else
      {
        insert( objDropData[0], "b", strDropId );
      }
    }
    else
    {
      setupTileView();

    }
  }


  /**
   * Remove grid object
   *
   * @param strId  The row number to remove
   * @param fRemoveData if defined and true the row object in the data array will be removed, else only the grid row will be removed
   */
  function removeEntry( objectToRemove )
  {

    m_gridMain._mapGridDataById.remove( objectToRemove[m_strDataIdProp] );

    m_gridMain._removeGridData( objectToRemove, null );

  }

  /**
   * Removes the html for the row and from the master data arrays
   * @param objectToRemove
   */
  function removeGridData( objectToRemove, folderMeta )
  {

    let strRemoveId;
    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      // Remove from grid view
      strRemoveId = objectToRemove[m_strDataIdProp];

      // This happens if using a vwSeqId for the data id
      if ( !VwExString.startsWith( strRemoveId, m_strGridId ) )
      {
        strRemoveId = VW_ROW_ID_PREFIX + strRemoveId;
      }

      // Remove html for this row
      $( "#" + strRemoveId ).remove();

      applyRowStriping();
    }
    else
    {
      setupTileView();
    }

    /**
     * Removes a folder item from its parent folder
     */
    function removeFromParentFolderData( folderMeta )
    {

      // remove all old folder rows if this is a folder being removed
      if ( isFolder( objectToRemove ) )
      {
        const strExtender = strRemoveId + VW_GRID_EXTENDER_SUFFIX;
        $( "#" + strExtender ).remove();
      }

      if ( !folderMeta.parentFolder )
      {
        return; // This is the main top level grid it doesn't have folder data
      }

      const aFolderData = folderMeta.parentFolder[m_gridProps.folderDataIdProp];

      for ( let x = 0; x < aFolderData.length; x++ )
      {
        if ( aFolderData[x][m_strDataIdProp] == objectToRemove[m_strDataIdProp] )
        {
          aFolderData.splice( x, 1 );
          break;
        }
      }

      // If folder is now empty hide the extender

      if ( aFolderData.length == 0 )
      {
        const  folderParentMeta = getFolderMeta( folderMeta.parentFolder );

        $( "#" + folderParentMeta.strExtenderId ).hide();

      }
    }

  } // end removeGridData()


  /**
   * Updates a row or tile based on the current view with data from the object passed
   *
   * @param objNewData The data object with new values to display.
   */
  function update( objNewData, fAddIfNoExists, fnCallback )
  {

    const strKey = m_strGridId + "_" + objNewData[m_strDataIdProp];

    m_mapGridDataByRowId.put( strKey, objNewData );

    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      updateRow( objNewData );
    }
    else
    {
      updateTile( objNewData );
    }

    if ( fnCallback )
    {
      fnCallback();
    }
  }


  /**
   * Updates the data for a specific row by clearing the row's children's (column data) and
   * re-adding the columns with updated values back in
   *
   * @param objNewData The new data object being updated
   */
  function updateRow( objNewData )
  {

    const strRowId = getRowId( objNewData );

    $( "#" + strRowId ).empty();

    // re-add the column data from updated object properties
    addRowColumns( strRowId, objNewData );

    if ( m_gridProps.postRowAdd && !m_fItemMoving )
    {
      m_gridProps.postRowAdd.call( self, self, objNewData );

    }


  }

  /**
   * Updates an existing tile with the new data values
   *
   * @param objNewData The object with the values to update
   */
  function updateTile( objNewData )
  {

    const tileLocObj = findTile( objNewData );
    tileLocObj.tileRow.updateTile( tileLocObj.tile, objNewData, m_strGridId );

    if ( m_gridProps.postTileAdd )
    {
      m_gridProps.postTileAdd.call( self, self, objNewData );
    }

    if ( m_gridProps.postTileActionHandler )
    {
      m_gridProps.postTileActionHandler.call( self, self );
    }

  }


  /**
   * Updates the column data based on the data type
   *
   * @param nRowNbr The row nbr the column is in
   * @param colId The column number or the id as specified in the grid header properties
   * @param colData
   */
  function updateColByRowNbr( nRowNbr, colId, colData )
  {
    const aGridData = getDataModel().getDataSet();

    const objRow = aGridData[nRowNbr];

    updateColDataByColType( colId, objRow, colData );

  }


  /**
   * Updates the column data based on the data type
   *
   * @param strObjId This should the id defined by the object's id grid config property (dataIdProp)
   * @param colId May either be the actual zero column number or the id as specified in the grid header properties
   * @param colData
   */
  function updateColById( strObjId, colId, colData )
  {

    const nColNbr = getColNbr( colId );
    const objData = m_gridMain._mapGridDataById.get( strObjId );

    if ( !objData )
    {
      throw "The column id '" + colId + "' was not defined in the grid header aHdrCols configuration";
    }

    updateColDataByColType( nColNbr, objData, colData );

  }

  /**
   * Update column for all rows
   * @param colId
   * @param colData
   */
  function updateColForAllRows( colId, colData )
  {
    const aDataSet = getGridDataSet();

    for ( const dataItem of aDataSet )
    {
      const objRow = dataItem;

      updateColDataByColType( colId, objRow, colData );

    }

  }


  /**
   * Updates the column data based on the data type
   *
   * @param strRowId The row id the column is in
   * @param colId The column number or the column id as defined in the grid header properties
   * @param colData
   */
  function updateColOverlayData( strRowId, colId, colData )
  {

    const objRow = m_mapGridDataByRowId.get( VW_ROW_ID_PREFIX + strRowId );

    updateColDataByColType( colId, objRow, colData, true );

  }


  /**
   * Adds a css class to a column in a specific row
   *
   * @param strRowId The row id the column is in
   * @param colId The column number or the column id as defined in the grid header properties
   * @param strClassName
   */
  function addColClass( strRowId, colId, strClassName )
  {
    const nColNbr = getColNbr( colId );

    if ( !VwExString.startsWith( strRowId, VW_ROW_ID_PREFIX ) )
    {
      strRowId = VW_ROW_ID_PREFIX + strRowId;
    }

    const strColId = strRowId + "_" + nColNbr;

    $( "#" + strColId ).addClass( strClassName );

  }

  /**
   *
   * Adds a css class to a column's container
   *
   * @param strRowId The row id the column is in
   * @param colId The column number or the column id as defined in the grid header properties
   * @param strClassName
   */
  function addColContainerClass( strRowId, colId, strClassName )
  {
    const nColNbr = getColNbr( colId );

    if ( !VwExString.startsWith( strRowId, VW_ROW_ID_PREFIX ) )
    {
      strRowId = VW_ROW_ID_PREFIX + strRowId;
    }

    const strColContainerId = "colContainer_" + strRowId + "_" + nColNbr;

    $( "#" + strColContainerId ).addClass( strClassName );


  }

  function refreshHdr()
  {
    buildGridHeader();

    m_gridMain.getDataModel().refresh();

  }

  /**
   * Removes a css class name for the row/column
   *
   * @param strRowId The row id in the grid
   * @param colId
   * @param strClassName
   */
  function removeColClass( strRowId, colId, strClassName )
  {

    const nColNbr = getColNbr( colId );

    const objRow = getDataObjectById( strRowId );

    const strColId = getRowId( objRow ) + "_" + nColNbr;

    $( "#" + strColId ).removeClass( strClassName );

  }

  /**
   * Removes a css class name for the row/column
   *
   * @param strRowId The row id in the grid
   * @param colId
   * @param strClassName
   */
  function removeColContainerClass( strRowId, colId, strClassName )
  {
    const nColNbr = getColNbr( colId );

    if ( !VwExString.startsWith( strRowId, VW_ROW_ID_PREFIX ) )
    {
      strRowId = VW_ROW_ID_PREFIX + strRowId;

    }

    const strColContainerId = "colContainer_" + strRowId + "_" + nColNbr;

    $( "#" + strColContainerId ).removeClass( strClassName );

  }

  /**
   * Adds a class  name for the column id for all rows
   *
   * @param colId May be the column id as specified id the column definition properties or the actual number of the column
   * @param strClassName The name of the css class to add to the column
   */
  function addAllColClass( colId, strClassName )
  {
    const  nColNbr = getColNbr( colId );

    const aGridData = getDataModel().getDataSet();

    for ( const dataItem of aGridData )
    {

      const strColId = getRowId( dataItem );

      $( "#" + strColId + "_" + nColNbr ).addClass( strClassName );

      if ( gridProps.parentFolderIdProp )
      {
        const strParentFolderId = dataItem[ gridProps.parentFolderIdProp ];

        // If we have a sub grid for this asset, apply class to all its rows
        const subGrid = m_gridMain._mapSubGrids.get( strParentFolderId );

        if ( subGrid )
        {
          subGrid.addAllColClass( colId, strClassName );
        }
      }

    }

  } // end addAllColClass()


  /**
   * Removes a css class from all rows for the column id specified
   *
   * @param colId  The column id as defined in grid header properties or the column number (zero based)
   * @param strClassName The name of the class to be removed
   */
  function removeAllColClass( colId, strClassName )
  {
    const nColNbr = getColNbr( colId );

    const aGridData = getDataModel().getDataSet();

    for ( const dataItem of aGridData  )
    {

      const strColId = getRowId( dataItem );

      $( "#" + strColId + "_" + nColNbr ).removeClass( strClassName );

      if ( gridProps.parentFolderIdProp )
      {
        const strParentFolderId = dataItem[gridProps.parentFolderIdProp];

        // If we have a sub grid for this asset, apply class to all its rows
        const subGrid = m_gridMain._mapSubGrids.get( strParentFolderId );
        if ( subGrid )
        {
          subGrid.removeAllColClass( colId, strClassName );
        }
      }
    } // end for()
  }

  /**
   * Deteremis if a column number in a row has the class specified
   *
   * @param strRowId  The row id
   * @param colId The column id as specified in the grid header properties or the zero based column number
   * @param strClassName The class name to test for
   * @returns {*|jQuery}
   */
  function hasColClass( strRowId, colId, strClassName )
  {

    const nColNbr = getColNbr( colId );

    const objRow = getDataObjectById( strRowId );

    const strColId = getRowId( objRow ) + "_" + nColNbr;

    return $( "#" + strColId ).hasClass( strClassName );

  }

  /**
   * Returns true if the column hdr specified by strHdrId exists
   * @param strHdrId
   * @returns {boolean}
   */
  function hasColHdr( strHdrId )
  {
    for ( let colHdr of m_gridProps.aHdrCols )
    {

      if ( strHdrId == colHdr.id )
      {
        return true;
      }
    }

    return false;

  }

  /**
   * Return all classes assigned to a column element
   * @param strRowId
   * @param colId
   * @returns {*|jQuery}
   */
  function getColClass( strRowId, colId )
  {

    const nColNbr = getColNbr( colId );

    const objRow = getDataObjectById( strRowId );

    const strColId = getRowId( objRow ) + "_" + nColNbr;

    return $( "#" + strColId ).attr( "class" );

  }

  /**
   * Gets the data for a specific row/column
   *
   * @param strRowId The row id
   * @param colId The column id as defined in the grid header properties or the zero based column number
   * @returns {*}
   */
  function getColDataByRowId( strRowId, colId )
  {

    const nColNbr = getColNbr( colId );

    const objRow = getDataObjectById( strRowId );

    const strColId = getRowId( objRow ) + "_" + nColNbr;

    return getColDataByColType( m_gridProps.aHdrCols[nColNbr].colType, strColId );

  }

  /**
   * Returns the data object from the evenys currenttarget event id
   *
   * @param event The event generated by a drag or  event
   */
  function getDataByDragEvent( event )
  {
    const aIdPieces = event.currentTarget.id.split( "_" );

    if ( aIdPieces.length < 2 )
    {
      return null;   // expecting at least 2 pieces gridId and row id

    }

    let strRowId = "";

    for ( const idPiece of aIdPieces )
    {
      if ( strRowId )
      {
        strRowId += "_";
      }

      strRowId += idPiece;

    }

    return m_mapGridDataByRowId.get( strRowId );

  }

  /**
   * Gets user data from the id of a mouse event
   * @param event
   */
  function getDataByClickEvent( event )
  {
    let strId = event.currentTarget.id.substring( 0, event.currentTarget.id.lastIndexOf( "_" ) );
    strId = strId.substring( strId.lastIndexOf( "_" ) + 1 );

    return m_gridMain._mapGridDataById.get( strId );
  }

  /**
   * Gets the column overlay data for the row id.coliid
   *
   * @param strRowId The row id
   * @param colId The column id as defined in the grid header properties or the zero based column number
   * @returns {*}
   */
  function getColOverlayDataByRowId( strRowId, colId )
  {

    const nColNbr = getColNbr( colId );

    if ( !VwExString.startsWith( strRowId, VW_ROW_ID_PREFIX ) )
    {
      strRowId = VW_ROW_ID_PREFIX + strRowId;

    }

    const objRow = m_mapGridDataByRowId.get( strRowId );

    const strColId = getRowId( objRow ) + "_" + nColNbr + "_overlay";

    return getColDataByColType( m_gridProps.aHdrCols[nColNbr + 1].colType, strColId );

  }

  /**
   * Updates column data based on the column data renderer type
   *
   * @param colId May either be the actual column number or the id as specified in the grid header properties
   * @param objRow   The user data object for the row
   * @param colData  The new column data
   */
  function updateColDataByColType( colId, objRow, colData, fOverlay )
  {
    let nColNbr = getColNbr( colId );

    const strRowId = getRowId( objRow );

    // Update the data object if dataId was specifed for this column type

    if ( !objRow )
    {
      return;
    }

    if ( m_gridProps.aHdrCols[nColNbr].dataId )
    {
      objRow[m_gridProps.aHdrCols[nColNbr].dataId] = colData;

    }

    let strColId = strRowId + "_" + nColNbr;


    if ( fOverlay )
    {
      strColId += "_overlay";
      ++nColNbr; // Overlay hdr spec

    }

    switch ( m_gridProps.aHdrCols[nColNbr].colType )
    {
      case "txt":
      case "etxt":

        updateTextCol( strColId, colData );
        break;

      case "chk":

        updateCheckBoxCol( strColId, colData );
        break;

      case "vwChk":

        updateVwCheckBoxCol( strColId, colData );
        break;

      case "img":

        updateImgCol( strColId, colData );
        break;


    } // end switch()

  } // end updateColDataByColType()


  /**
   * Update text col data
   *
   * @param strColId The id of the html element containing to the text
   * @param colData The data to update
   */
  function updateTextCol( strColId, colData )
  {
    $( "#" + strColId ).html( colData );

  }


  /**
   * Updates a checkbox checked state
   *
   * @param strColId The id of the checkbox
   * @param fCheck The new check state true to check, false to uncheck
   */
  function updateCheckBoxCol( strColId, fCheck )
  {
    $( "#" + strColId ).attr( "checked", fCheck );

  }

  /**
   * Updates a VwCheckBox with new checked state
   * @param strColId The col id of the checkbox
   * @param fCheck
   */
  function updateVwCheckBoxCol( strColId, fCheck )
  {
    const vwCheckBox = m_gridMain._mapCustomControlByRowColId.get( strColId );

    if ( vwCheckBox )
    {
      vwCheckBox.setChecked( fCheck );

    }

  }

  /**
   * Updates a an img url
   *
   * @param strColId The id of the checkbox
   * @param imgUrl The updated  img url
   */
  function updateImgCol( strColId, imgUrl )
  {

    if ( !imgUrl )
    {
      $( "#" + strColId ).css( "visibility", "hidden" );
    }
    else
    {
      $( "#" + strColId ).css( "visibility", "visible" );

    }


    $( "#" + strColId ).attr( "src", imgUrl );

  }


  function setHdrColumnSortArrow( strDataId, nSortDir )
  {
    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      const strColId = m_strGridId + "_" + colIdFromDataId( strDataId );

      if ( strColId && m_gridProps.displayHeader )
      {
        displaySortArrow( strColId, nSortDir );
      }

    }

  }


  /**
   * Reopens and previously open folders prior to sort
   */
  function reopenOpenedFolders()
  {

    for ( const subFolder of m_aSubFolders )
    {
      const folder = subFolder;

      const folderMeta = getFolderMeta( folder );

      // We stop at the first closed folder
      if ( !folderMeta.fIsOpen )
      {
        return false;
      }

      openOrCloseFolder( folder, true );
    }

    return true;


  }


  /**
   * Displays the sort arrow on the column id
   * @param strColId The column id to display the sort is on
   * @param nSortDir The sort direction 1 for descending (down arrow) or -1 to sort ascending
   */
  function displaySortArrow( strColId, nSortDir )
  {
    // This happens when called as a method from the client as opposed to the handleClick handler
    if ( !VwExString.startsWith( strColId, m_strGridId ) )
    {
      strColId = m_strGridId + "_" + strColId;
    }

    $( "#imgSortArrow_" + strColId ).show();

    if ( m_curSortColId != null && m_curSortColId != strColId )
    {
      // hide sort arrow on previous column
      $( "#imgSortArrow_" + m_curSortColId ).hide();
    }

    m_curSortColId = strColId; // Make this the current sort column


    const strArrowUpImg = m_gridProps.sortArrowImgUp;
    const strArrowDownImg = m_gridProps.sortArrowImgDown;

    if ( nSortDir < 0 )
    {
      $( "#imgSortArrow_" + strColId ).attr( "src", strArrowUpImg );
    }
    else
    {
      $( "#imgSortArrow_" + strColId ).attr( "src", strArrowDownImg );

    }

  } // end displaySortArrow()

  /**
   * Returns an object description of the current sort column or null if none exists
   * The properties of interest are: dataId which is the column id as defined in the aHdrProps portion of the grid properties
   * and sortDir which is -1 for ascending
   * @returns {*}
   */
  function getCurrentSortColumn( strViewName )
  {
    return m_mapSortDescriptors.get( strViewName );
  }

  /**
   * Sorts the column as defined in the grid header props
   *
   * @param strColId The column id as defined in the aHdrCols of the grid props
   * @param nSortDir    -1 for an ascending sort, 1 for a descending sort
   * @param fDisplayResult if false supress the display of data, this is useful when you sort and them apply a filter
   */
  function sortColumn( strColId, nSortDir, fDisplayResult )
  {
    const nColNbr = findColNbrFromId( strColId );
    const objColProps = m_gridProps.aHdrCols[nColNbr];

    sortDataSet( objColProps, nSortDir, fDisplayResult );

  } // end sortColumn()

  /**
   * Public function for sorting non column grid data, i.e.tile views
   *
   * @param strSortType The sort type "s" for string, "d" for date, "n" for number and "f" for floating point
   * @param strDataIdId The data id as defined in the object being sorted
   * @param nSortDir The sort direction -1 for ascending, 1 for descing
   */
  function sort( strSortType, strDataIdId, nSortDir )
  {

    const objSortProps = {};
    objSortProps.sortType = strSortType;
    objSortProps.dataId = strDataIdId;

    // Save Sort params
    m_objSort = {sortType: strSortType, dataId: strDataIdId, sortDir: nSortDir};

    sortDataSet( objSortProps, nSortDir );

  }


  /**
   * Sort the grids data and redraw the grid
   *
   * @param objColOrops The column properties as defined in the aHdrCols array inn the grid's properties
   * @param nSortDir  -1 for an ascending sort, 1 for a descending sort
   * @paran fDisplayResult if false supress the display of data, this is useful when you sort and them apply a filter
   */
  function sortGridData( aObjDataToSort, objColProps, nSortDir )
  {
    // Sort the grid data
    aObjDataToSort.sort( function ( a, b )
                         {

                           let aData = VwUtils.getObjProperty( a, objColProps.dataId );
                           let bData = VwUtils.getObjProperty( b, objColProps.dataId );

                           if ( objColProps.sortType == "s" && !m_gridProps.caseSensitiveSort )
                           {
                             if ( aData )
                             {
                               aData = aData.toLowerCase();

                             }

                             if ( bData )
                             {
                               bData = bData.toLowerCase();

                             }

                           }

                           // Check to see if we are dealing with undefined fields
                           if ( !aData || !bData )
                           {

                             if ( !aData && !bData )
                             {
                               return 0; // Both fields are undefined so they are equal
                             }

                             if ( nSortDir < 0 )  // ascending sort
                             {
                               if ( !aData )
                               {
                                 return -1;
                               }
                               else
                               {
                                 return 1;
                               }
                             }
                             else
                             {
                               if ( !aData )
                               {
                                 return 1;
                               }
                               else
                               {
                                 return -1;
                               }

                             }

                           }

                           switch ( objColProps.sortType )
                           {

                             case "s":  //String

                               if ( nSortDir < 0 )  // ascending sort
                               {
                                 if ( aData > bData )
                                 {
                                   return 1;
                                 }
                                 else
                                 {
                                   if ( aData < bData )
                                   {
                                     return -1;
                                   }
                                   else
                                   {
                                     return 0;
                                   }
                                 }

                               }
                               else
                               {
                                 // Descending sort
                                 if ( aData < bData )
                                 {
                                   return 1;
                                 }
                                 else
                                 {
                                   if ( aData > bData )
                                   {
                                     return -1;
                                   }
                                   else
                                   {
                                     return 0;
                                   }
                                 }

                               }


                             case "n": // Number

                               if ( nSortDir < 0 )  // ascending sort
                               {
                                 return parseInt( aData ) - parseInt( bData );
                               }
                               else
                               {
                                 return parseInt( bData ) - parseInt( aData );
                               }

                             case "f": // Float


                               if ( nSortDir < 0 )  // ascending sort
                               {
                                 return parseFloat( aData ) - parseFloat( bData );
                               }
                               else
                               {
                                 return parseFloat( bData ) - parseFloat( aData );
                               }

                             case "d": // Date

                               const aDate = new Date( aData );
                               const bDate = new Date( bData );

                               if ( nSortDir < 0 )  // descending sort
                               {
                                 return aDate - bDate;
                               }
                               else
                               {
                                 return bDate - aDate;
                               }

                           } // end switch

                         } );


  } // end sort


  function setItemMoving( fItemMoving )
  {
    m_fItemMoving = fItemMoving;

  }
  /**
   * Sets the tooltip for a specific column
   * @param strColId The column property as specidied in the id property of the column header properties
   * @param strToolTipText The tooltip text to apply
   */
  function setToolTipOnRowCol( strRowColId, strToolTipText )
  {

    $( "#" + strRowColId ).attr( "title", strToolTipText );

  }


  /**
   * Do property key translation if specified
   * @param strVal
   * @returns {*}
   */
  function doI18n( strVal )
  {
    if ( !m_gridProps.resourceMgr )
    {
      return strVal;

    }

    if ( VwExString.startsWith( strVal, m_gridProps.propKeyPrefix ) )
    {
      return m_gridProps.resourceMgr.getString( strVal.substring( m_gridProps.propKeyPrefix.length ) );

    }


  } // end VwUiUtils.doI18n()


  /**
   *
   * @param strDataId
   * @returns {*}
   */
  function colIdFromDataId( strDataId )
  {
    for ( const hdrCol of m_gridProps.aHdrCols )
    {
      if ( hdrCol.dataId == strDataId )
      {
        return hdrCol.id;
      }
    }

  } // end colIdFromDataId()

  /**
   * Retrieves the header col index nbr givin its header id value
   * @param strColId
   * @return {number}
   */
  function colNbrFromColId( strColId )
  {
    for ( let x = 0; x <  m_gridProps.aHdrCols.length; x++  )
    {
      if ( m_gridProps.aHdrCols[x].id == strColId )
      {
        return x;
      }
    }

    return -1;

  } // end colIdFromDataId()

  /**
   * Display all non filtered data objects
   */
  function displayNonFilteredResults( bDisplayAll)
  {

    // Remove existing rows or tiles in table
    $( `#${m_gridMain._strBodyId}` ).remove();

    let aDataSet;

    if ( bDisplayAll )
    {
      aDataSet = getDataModel().getDataSet()
    }
    else
    {
     aDataSet = getNonFilteredData();
    }

    if ( aDataSet == null )
    {
      return;
    }

    m_aTileRows = [];

    m_nRowCount = 0;

    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      buildGridRowData( aDataSet );
    }
    else
    {
      setupTileView();
    }

  } // end displayNonFilteredResults()



  /**
   * Gets the row id of the object
   * @param objRowData
   * @returns {string}
   */
  function getRowId( objRowData )
  {
    const folderMeta = getFolderMeta( objRowData );

    if ( objRowData.vwSeqId )
    {
      return objRowData[m_strDataIdProp];
    }
    
    let strGridId;

    if ( folderMeta && folderMeta.parentGrid )
    {
      strGridId = folderMeta.parentGrid.getGridId();
    }
    else
    {
      strGridId = m_strGridId;
    }

    return strGridId + "_" + objRowData[m_strDataIdProp];

  } // end getRowId()


  /**
   * Extracs the row id from a mouse event
   * @param event
   * @returns {string}
   */
  function getRowIdFromEvent( event )
  {
    const aIdPieces = event.currentTarget.id.split( "_" );

    let   strId = "";
    for ( let x = 0, nLen = aIdPieces.length - 1; x < nLen; x++ )
    {
      if ( strId.length > 0 )
      {
        strId += "_";
      }

      strId += aIdPieces[x];

    }

    return strId;

  }


  /**
   * Gets the canonical column id
   * @param objRowData
   * @param colId
   * @returns {string}
   */
  function getColId( objRowData, colId )
  {
    let nColNbr;

    if ( isNaN( colId ) )
    {
      nColNbr = findColNbrFromId( colId );
    }
    else
    {
      nColNbr = colId;
    }

    return getCanonicalColId( objRowData, nColNbr );


  } // end getColId()


  /**
   * Makes a canonical column id from the row id and column nbr
   *
   * @param objRowData The data representing a grid row
   * @param nColNbr The column nbr of the grid
   * @returns {string}
   */
  function getCanonicalColId( objRowData, nColNbr )
  {
    const strRowId = getRowId( objRowData );

    return strRowId + "_" + nColNbr;

  } // end getCanonicalColId()

  /**
   * Gets canonical id for a columns container
   * @param objRowData
   * @param colNbr
   * @returns {string}
   */
  function getCanonicalColContainerId( objRowData, colNbr )
  {
    if ( isNaN( colNbr ) )
    {
      colNbr = findColNbrFromId( colNbr );

    }

    const strRowId = getRowId( objRowData );

    return "colContainer_" + strRowId + "_" + colNbr;

  } // end getCanonicalColContainerId()


  /**
   * Get the html to render the column data type
   *
   * @param strColId The column id
   * @param colHdrProps The column hdr property object
   */
  function installColumnDataRenderer( rowItem, strRowId, strColId, colHdrProps, objColData )
  {
    const strColType = colHdrProps.colType;

    let   strControlHtml;

    if ( !strColType )
    {
      colHdrProps.colType = "txt";

    }

    // Get the html renderer for the column type specified

    switch ( colHdrProps.colType )
    {
      case "etxt": // Editable text

        doETextHtml( strColId, colHdrProps, objColData );
        break;

      case "txta": // Text area

        doTextAreaHtml( strColId, colHdrProps, objColData );
        break;

      case "img": // image area

        doImageHtml( strColId, colHdrProps, objColData );
        break;


      case "chk": // Checkbox

        doCheckBoxHtml( strColId, colHdrProps, objColData );
        break;

      case "vwBtn": // push button

        doVwButton( strColId, colHdrProps, objColData );
        break;

      case "vwCbo": // VwComboBox

        doVwComboBoxHtml( strRowId, strColId, colHdrProps, objColData );
        break;

      case "vwChk": // VwCheckBox

        doVwCheckBoxHtml( strRowId, strColId, colHdrProps, objColData );
        break;

      case "div":

        doCustomDivHtml( strColId, colHdrProps );
        break;

      case "custom": // Custom control - call is installer
      case "customContainer": // Custom control - call is installer

        doCustomControl( rowItem, strColId, colHdrProps );
        break;

      default:   // Plain un-editable text

        doTextHtml( strColId, colHdrProps, objColData );
        break;

    } // end switch()

    return strControlHtml;


  } // end doColumnDataRendererHtml


  /**
   * Get column data by its col type
   * @param strColType
   * @param strColId
   * @returns {*}
   */
  function getColDataByColType( strColType, strColId )
  {
    switch ( strColType )
    {
      case "txt":
      case "etxt":
      case "txta":

        return $( "#" + strColId ).text();

      case "img":

        return $( "#" + strColId ).attr( "src" );


      default:

        return "";

    }
  }


  /**
   * Clears any filter and displays all rows
   */
  function displayAll( fIgnorePostViewCallback )
  {
    m_gridMain._strCurFilter = null;
    m_gridMain._mapFilteredDataIds.clear();

    const aGridData = getDataModel().getDataSet();

    try
    {
      // If were in ROW_COL view just remove the VwDisplayNone css class
      if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
      {
        $( ".VwDisplayNone" ).show().removeClass( "VwDisplayNone" );

        if ( !m_gridProps.folderIdProp )
        {
          return;
        }

      }

      if ( m_gridMain._strCurViewStyle != VwGridV1.ROWCOL_VIEW )
      {
        displayNonFilteredResults( true );
      }
      else
      {
        return;
      }

      if ( fIgnorePostViewCallback )
      {
        return;

      }

      // Invoke callback handler if defined
      if ( m_gridProps.postViewChange )
      {
        m_gridProps.postViewChange.call( self, self, aGridData );
      }
    }
    finally
    {
      resizeScrollBars();
    }

  }

  /**
   * Adds a filter specification
   *
   * @param strFilterName The name of the filter
   * @param objFilterProps The filter properties object:
   *        <br>callBack:function a call back function called on each row or tile in the grid depending on the view type
   *        <br>The parameters are callBack( strFilterName, objGridData ) where the strFilterName is the name of the filter
   *        <br> being invoked, objGridData is the object for the row or tile. The callBack function returns true to
   *        <br> hide the row/tile or false to keep it visible.
   *        <br?
   *        <br> The following properties apply when a callBack function is not defined:
   *
   *        <br>filterDataProperty:String that defines the property in the grid data to be queried
   *        <br>matchType:Number Use one of the Grid constants: VwGrid.STARTS_WITH, VwGrid.CONTAINS, VwGrid.ENDS_WITH;
   *        <br>matchValue:String The value to match on
   *        <br>caseSensitive:boolean if true, search is case sensitive. The default is false
   */
  function addFilter( strFilterName, objFilterProps )
  {
    m_gridMain._mapFilterProps.put( strFilterName, objFilterProps );
  }

  /**
   * Returns current applied filter
   * @returns {*}
   */
  function getCurrentFilter()
  {
    return m_gridMain._strCurFilter;
  }

  /**
   * If a sort exists on a column or tile view, this method will apply that sort
   */
  function applyActiveSort()
  {
    if ( m_objSort )
    {
      if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
      {
        const objColProps = getHdrColPropsById( m_objSort.id );

        sortDataSet( objColProps, m_objSort.sortDir );
      }
      else
      {
        sort( m_objSort.sortType, m_objSort.dataId, m_objSort.sortDir );
      }

    }
  }

  /**
   * Applies a user definded grid filter
   *
   * @param strFilterName  The filter name to apply
   * @param fDisplayResult
   * @param strFilterSearchValue
   */
  function applyFilter( strFilterName, fDisplayResult, strFilterSearchValue )
  {

    m_gridMain._mapFilteredDataIds.clear();

    const filterProps = m_gridMain._mapFilterProps.get( strFilterName );

    if ( !filterProps )
    {
      throw "applyFilter was called for filter name: " + strFilterName + " but no filter was defined for this name."
    }

    if ( strFilterSearchValue || ( strFilterSearchValue == "" ) )
    {
      filterProps.matchValue = strFilterSearchValue;
    }

    m_gridMain._strCurFilter = strFilterName;

    if ( m_gridMain._strCurViewStyle == VwGridV1.TILE_VIEW )
    {
      applyTileFilter( strFilterName, filterProps, fDisplayResult );
      return;
    }

    // Apply filters to main grid an any sub (extender grids)

    let gridToFilter;

    if ( m_gridMain._curExpandedFolder )
    {
      gridToFilter = m_gridMain._mapSubGrids.get( m_gridMain._curExpandedFolder[m_strDataIdProp]);
    }
    else
    {
      gridToFilter = m_gridMain      ;
    }

    gridToFilter.applyGridFilter( filterProps, strFilterName, fDisplayResult, false );

  }

  /**
   * filterDataProperty: String that defines the property in the grid data to be queried
   * matchType: Number. Use one of the Grid constants: VwGrid.STARTS_WITH, VwGrid.CONTAINS, VwGrid.ENDS_WITH;  Default is CONTAINS.
   * matchValue: String The value to match on
   * caseSensitive: Boolean if true, search is case sensitive. The default is false
   *
   * @param strFilterSearchValue
   */
  function applyTextFilter( strFilterSearchValue )
  {
    applyFilter( "VwTextFilter", true, strFilterSearchValue );
    resizeScrollBars();
  }

  function applyTileFilter( strFilterName, filterProps, fDisplayResult, aTileData )
  {
    applyTileGridFilter( strFilterName, filterProps, fDisplayResult, aTileData );
    resizeScrollBars();
  }


  function applyTileGridFilter( strFilterName, filterProps, fDisplayResult, aTileSetData )
  {

    // Clear any previous selections
    clearSelections();

    if ( !filterProps )
    {
      throw "applyFilter was called but the filter name: " + strFilterName + " does not exist";
      return;
    }

    if ( filterProps.callBack )
    {
      doFilterByCallback( strFilterName, filterProps, aTileSetData );
    }
    else
    {
      doFilterByValues( filterProps, aTileSetData );
    }

    setupTileView( true, filterProps.fnReady );

    // Invoke callback handler if defined
    if ( m_gridProps.postViewChange )
    {
      m_gridProps.postViewChange.call( self, self, getNonFilteredData() );
    }

    resizeScrollBars();
  }

  /**
   * Apply a defined filter
   *
   * @param filterProps
   * @param strFilterName The name of the filter to apply
   * @param fDisplayResult
   * @param fIsSubGrid
   */
  function applyGridFilter( filterProps, strFilterName, fDisplayResult, fIsSubGrid )
  {
    // Clear any previous selections
    clearSelections();

    // Clear any previously filtered  data

    if ( !fIsSubGrid && filterProps && m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      displayAll( true );
    }

    if ( filterProps.matchValue == "" )
    {
      return;
    }

    m_gridMain._strCurFilter = strFilterName;

    if ( !filterProps )
    {
      throw "applyFilter was called but the filter name: " + strFilterName + " does not exist";
    }

    let aFilterDataSet;

    const strManagedFolderId = self.getManagedFolderId();

    if ( strManagedFolderId )
    {
      aFilterDataSet = m_gridMain.getDataModel().getFolderItems( strManagedFolderId );
    }

    if ( filterProps.callBack )
    {
      doFilterByCallback( strFilterName, filterProps, aFilterDataSet );
    }
    else
    {
      doFilterByValues( filterProps, aFilterDataSet );
    }

    if ( m_gridMain._strCurViewStyle == VwGridV1.TILE_VIEW )
    {
      if ( fDisplayResult || typeof fDisplayResult == "undefined" )
      {
        displayNonFilteredResults();
      }
    }

    // Invoke callback handler if defined
    if ( m_gridProps.postViewChange )
    {
      m_gridProps.postViewChange.call( self, self, getNonFilteredData() );
    }

  }


  /**
   * Invoke callback for each data item
   * @param strFilterName The name of the filter
   * @param fnCallBack The filter callback
   * @param aFilterDataSet This is an override dataset  used in tile folder views
   */
  function doFilterByCallback( strFilterName, filterProps, aFilterDataSet )
  {

    let aGridData;

    if ( aFilterDataSet )
    {
      aGridData = aFilterDataSet;
    }
    else
    {
      aGridData = getDataModel().getDataSet();
    }

    if ( !aGridData )
    {
      return;

    }

    for ( const userData of aGridData )
    {
      // Don't filter folders
      if ( isFolder( userData ) )
      {
          continue;
      }

      const bFilter = filterProps.callBack.call( self, strFilterName, userData );

      handleFilterResult( bFilter, userData );

    } // end for()

  } // end doFilterByCallback()


  /**
   * Filters (hides rows that don't match the filter criteria)
   *
   * @param filterProps
   * @param aFilterDataSet
   */
  function doFilterByValues( filterProps, aFilterDataSet )
  {

    let  aGridData;

    if ( aFilterDataSet )
    {
      aGridData = aFilterDataSet;
    }
    else
    {
      aGridData = getDataModel().getDataSet();
    }

    for ( const userData of aGridData )
    {
      // Don't filter folders
      if ( isFolder( userData ) )
      {
          continue;
      }

      doFilterByPropId( filterProps, filterProps.textFilterPropId, userData );

    }

  } // end doFilterByValues()


  /**
   * Filter data by data property name
   *
   * @param filterProps
   * @param aFilterPropIds
   * @param userData
   */
  function doFilterByPropId( filterProps, aFilterPropIds, userData )
  {

    let bPassed;

    for ( let x = 0; x < aFilterPropIds.length; x++ )
    {
      let strData = userData[aFilterPropIds[x]];

      if ( !strData )
      {
        continue;  // Not all filter properties defined exist so move to next if the data is null
      }

      bPassed = doFilterByValue( filterProps, strData );

      if ( bPassed )
      {
         break;
      }

    }

    //handleFilterResult( nFilterCount > 0, userData );
    handleFilterResult( bPassed, userData );

  } // end doFilterByPropId()


  /**
   * Filter data by value
   *
   * @param filterProps
   * @param strData
   * @returns {boolean}
   */
  function doFilterByValue( filterProps, strData )
  {

    const fCaseSensitive = filterProps.caseSensitive;
    let   strMatchValue = filterProps.matchValue;
    let   fOrCond = true;

    if ( strMatchValue && strMatchValue.charAt( 0 ) == "!" )
    {
      strMatchValue = strMatchValue.substring( 1 );
      fOrCond = false;
    }

    const aFilterValues = strMatchValue.split( "," );

    let   bMatch = false;

    switch ( filterProps.matchType )
    {

      case VwGridV1.STARTS_WITH:

        if ( fOrCond )
        {
          bMatch = doOrCondStartsWith( strData, aFilterValues, fCaseSensitive )
        }
        else
        {
          bMatch = doNotCondStartsWith( strData, aFilterValues, fCaseSensitive )
        }

        break;

      case VwGridV1.ENDS_WITH:

        if ( fOrCond )
        {
          bMatch = doOrCondEndsWith( strData, aFilterValues, fCaseSensitive )
        }
        else
        {
          bMatch = doNotCondEndsWith( strData, aFilterValues, fCaseSensitive )
        }

        break;

      default:

        if ( fOrCond )
        {
          bMatch = doOrCondContains( strData, aFilterValues, fCaseSensitive )
        }
        else
        {
          bMatch = doNotCondContains( strData, aFilterValues, fCaseSensitive )
        }

        break;

    } // end switch()

    // We return true if the filter passed the criteria
    return bMatch;

  } // end doFilterByValue()


  /**
   * Handles the result of the filter. Hides the element if the filter apply's else
   * adds the users data object to the non filtered array
   *
   * @param bPass false to filter - hide row or remove a tile - false to show the row or tile
   * @param gridData
   */
  function handleFilterResult( bPass, gridData )
  {

    if ( bPass )
    {
      return;
    }

    m_gridMain._mapFilteredDataIds.put( gridData[m_strDataIdProp] );

    // Only apply class if view is ROW_COL,  Tiles have to be completely rebuilt
    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      const strRowId = getRowId( gridData );

      $( "#" + strRowId ).hide().addClass( "VwDisplayNone" );
    }
 
  } // end handleFilterResult()

  /**
   * Loop through values and hide the row if the data value starts with on any of the filter values
   *
   * @param strData The data to test
   * @param aFilterValues array of filter values
   * @param fCaseSensitive match on case if true
   */
  function doOrCondStartsWith( strData, aFilterValues, fCaseSensitive )
  {
    for ( let x = 0, nValLen = aFilterValues.length; x < nValLen; x++ )
    {
      if ( VwExString.startsWith( strData, aFilterValues[x], fCaseSensitive ) )
      {
        return true;

      }

    }

    return false;

  } // end doOrCondStartsWith()


  /**
   * Loop through values and hide the row if the data value does not start with  any of the filter values
   *
   * @param strData The data to test
   * @param aFilterValues array of filter values
   * @param fCaseSensitive match on case if true
   */
  function doNotCondStartsWith( strData, aFilterValues, fCaseSensitive )
  {

    let  fFilter = true;
    for ( let x = 0, nValLen = aFilterValues.length; x < nValLen; x++ )
    {
      if ( VwExString.startsWith( strData, aFilterValues[x], fCaseSensitive ) )
      {

        fFilter = false;  // found a match which means the  not condition fails

        break;

      }

    }

    return fFilter;

  } // end doNotCondStartsWith()


  /**
   * Loop through values and hide the row if the data value ends with any of the filter values
   *
   * @param strData The data to test
   * @param aFilterValues array of filter values
   * @param fCaseSensitive match on case if true
   */
  function doOrCondEndsWith( strData, aFilterValues, fCaseSensitive )
  {
    for ( let x = 0, nValLen = aFilterValues.length; x < nValLen; x++ )
    {
      if ( VwExString.endsWith( strData, aFilterValues[x], fCaseSensitive ) )
      {
        return true;

      }

    }

    return false;

  } // end doOrCondEndsWith()


  /**
   * Loop through values and hide the row if the data value does not end with any of the filter values
   *
   * @param strData The data to test
   * @param aFilterValues array of filter values
   * @param fCaseSensitive match on case if true
   */
  function doNotCondEndsWith( strData, aFilterValues, fCaseSensitive )
  {

    let  fFilter = true;
    for ( let x = 0, nValLen = aFilterValues.length; x < nValLen; x++ )
    {
      if ( VwExString.endsWith( strData, aFilterValues[y], fCaseSensitive ) )
      {

        fFilter = false;  // found a match which means the  not condition fails

        break;

      }

    }

    return fFilter;

  }  // end doNotCondEndsWith()


  /**
   * Loop through values and hide the row if the data value contains any of the filter values
   *
   * @param strData The data to test
   * @param aFilterValues array of filter values
   * @param fCaseSensitive match on case if true
   */
  function doOrCondContains( strData, aFilterValues, fCaseSensitive )
  {
    for ( let x = 0, nValLen = aFilterValues.length; x < nValLen; x++ )
    {
      if ( !fCaseSensitive )
      {
        if ( strData.toLowerCase().indexOf( aFilterValues[x].toLowerCase() ) >= 0 )
        {
          return true;
        }

      }
      else
      {
        if ( strData.indexOf( aFilterValues[x] ) >= 0 )
        {
          return true;
        }

      }

    }  // end for

    return false;

  } // end doOrCondContains()


  /**
   * Loop through values and hide the row if the data value does not contain any of the filter values
   *
   * @param strData The data to test
   * @param aFilterValues array of filter values
   * @param fCaseSensitive match on case if true
   */
  function doNotCondContains( strData, aFilterValues, fCaseSensitive )
  {
    let fFilter = true;

    for ( let y = 0, nValLen = aFilterValues.length; y < nValLen; y++ )
    {
      if ( !fCaseSensitive )
      {
        if ( strData.toLowerCase().indexOf( aFilterValues[y].toLowerCase() ) >= 0 )
        {
          fFilter = false;
          break;

        }
      }
      else
      {
        if ( strData.indexOf( aFilterValues[y] ) >= 0 )
        {
          fFilter = false;
          break;

        }

      } // end else

    }

    return fFilter;

  } // end doNotCondContains{}


  /**
   * Returns the managed folder id if this is a sub grid with an extender
   * @returns {*}
   */
  function getManagedFolderId()
  {
    if ( gridMain == null )
    {
      return null;
    }
    
    const astrIdPieces = getGridId().split( "_");

    if ( astrIdPieces.length >= 2 )
    {
      return astrIdPieces[ astrIdPieces.length - 2 ];  // This gives me id before the last extender selection
    }

    return null;  // No folders ir the main grid

    
  } // end getManagedFolderId


  /**
   * Hides/shows columns
   * @param cols  Either an array of column numbers to hide/show or the number of the column to hide/show
   * @param fShow true to show, false to hide
   */
  function showColumns( cols, fShow )
  {
    let aCols = null;

    if ( Array.isArray( cols ) )
    {
      aCols = cols;
    }
    else
    {
      aCols = [cols];
    }

    const aRows = $( "#" + VW_GRID_BODY_ID ).children();

    // First hide/show column headers

    for ( let x = 0, nLen = aCols.length; x < nLen; x++ )
    {
      const strHdrId = m_strGridId + "_" + m_gridProps.aHdrCols[aCols[x]].id;

      const strCurDisplayState = $( "#" + strHdrId ).css( "display" );

      if ( !fShow )
      {
        $( "#" + strHdrId ).hide();
      }

      // Only adjust the grid  when action is opposite the view state.
      if ( fShow && strCurDisplayState == "none" )
      {
        m_nTotColWidth += (m_gridProps.aHdrCols[aCols[x]].width + 2);
      }
      else
      {
        if ( !fShow && strCurDisplayState != "none" )
        {
          m_nTotColWidth -= (m_gridProps.aHdrCols[aCols[x]].width + 2);

        }
      }
    }

    // Hide/show data row columns

    for ( let x = 0, nLen = aRows.length; x < nLen; x++ )
    {

      for ( let y = 0, nColsLen = aCols.length; y < nColsLen; y++ )
      {
        const strColId = "#colContainer_" + aRows[x].id + "_" + aCols[y];

        if ( !fShow )
        {
          $( strColId ).hide();
        }
      }

    }


    // Readjust grid size for new column structure
    if ( m_nTotColWidth > 0 )
    {
      $( "#" + m_gridMain._strOuterId ).width( m_nTotColWidth );
    }

  }

  // Data Renderers'


  /**
   * Editable text. The editable text is initially a span tag, that when clicked on changes to a text input tage
   *
   * @param strColId The column id odf the span tag
   * @param colHdrProps The hdr peoperties object for this column
   *
   * @param objColData The display data for this column
   */
  function doETextHtml( strColId, colHdrProps, objColData )
  {

    // First install the span column
    doTextHtml( strColId, colHdrProps, objColData );

    const objESpanProps = {};
    objESpanProps.fnEditMode = editMode;
    objESpanProps.fnDataChange = eColDataChange;
    objESpanProps.cssSelected = colHdrProps.cssSelected;

    // Install span to input text handler
    if ( $( "#" + strColId )[0] )
    {
      $( "#" + strColId ).VwEditableElement( objESpanProps );
    }

    function eColDataChange( strSpanId, strNewVal, fnAcceptChange )
    {
      const  objRow = getObjDataFromColId( strColId );
      colHdrProps.dataChange( objRow, strNewVal, fnAcceptChange );

    }

    // Function handler executed when entering and exiting text html edit mode
    function editMode( fEditMode )
    {
      m_fColEleEditMode = fEditMode;
    }
  }


  function doTextAreaHtml( strColId, colHdrProps, objColData )
  {

  }

  function doImageHtml( strColId, colHdrProps, objColData )
  {
    let strHtml;

    if ( colHdrProps.rowHover )
    {
      strHtml = "<img id='" + strColId + "_overlay'";
    }
    else
    {
      strHtml = "<img id='" + strColId + "'";
    }

    let strImgClass = null;

    // specific column definition class overrides global column class
    if ( colHdrProps.cssColData )
    {
      strImgClass = colHdrProps.cssColData;

    }
    else
    if ( colHdrProps.cssImg )
    {
      strImgClass = colHdrProps.cssImg;
    }
    else
    if ( m_gridProps.cssImg )
    {
      strImgClass = m_gridProps.cssImg;
    }

    if ( !strImgClass )
    {
      strImgClass = "VwImgCol";

    }
    else
    {
      strImgClass = "VwImgCol " + strImgClass;

    }

    strHtml += " class='" + strImgClass + "'";


    if ( objColData )
    {
      strHtml += " src='" + objColData + "'";
    }
    else
    {
      strHtml += " src=''";

    }


    strHtml += "/>";

    $( "#colContainer_" + strColId ).append( strHtml );


    if ( !objColData )
    {
      $( "#" + strColId ).css( "visibility", "hidden" );

    }

    if ( colHdrProps.click )
    {
      let  strClickId = strColId;

      if ( typeof colHdrProps.rowHover != "undefined" )
      {
        strClickId += "_overlay";

      }


      $( "#" + strClickId ).unbind().click( function ()
                                            {
                                              const objRow = getObjDataFromColId( strColId );
                                              colHdrProps.click.call( self, objRow, strColId )
                                            } );
    }


  }

  /**
   * Create html for the input checkbox control
   * @param strColId
   * @param colHdrProps
   * @param objColData
   */
  function doCheckBoxHtml( strColId, colHdrProps, objColData )
  {


    let strCheckHtml = "<input id='" + strColId + "' type='checkbox'";

    if ( colHdrProps.cssColData )
    {
      strCheckHtml += " class='" + colHdrProps.cssColData + "'";
    }

    strCheckHtml += "/>";

    $( "#colContainer_" + strColId ).append( strCheckHtml );

    const nParentHeight = $( "#colContainer_" + strColId ).height();

    const nCheckHeight = $( "#" + strColId ).height();

    let   nMargTop = (nParentHeight - nCheckHeight) / 2;

    if ( nMargTop < 0 )
    {
      nMargTop = 0;

    }

    $( "#" + strColId ).attr( "checked", objColData );
    // vertical center check box
    $( "#" + strColId ).css( "margin-top", nMargTop );


    if ( colHdrProps.dataId )
    {
      $( "#" + strColId ).unbind().click( function ()
                                          {
                                            const objData = getObjDataFromColId( strColId );

                                            objData[colHdrProps.dataId] = $( "#" + strColId ).prop( "checked" );
                                          } );
    }

    if ( colHdrProps.click )
    {
      $( "#" + strColId ).unbind().click( function ()
                                          {
                                            const objRow = getObjDataFromColId( strRowId );
                                            colHdrProps.click.call( self, objRow )
                                          } );
    }

  }

  /**
   * Setup for using a VwCheckbox Control
   * @param strRowId
   * @param strColId
   * @param colHdrProps
   * @param objColData
   */
  function doVwCheckBoxHtml( strRowId, strColId, colHdrProps, objColData )
  {

    // Return if element doesn't exist in the DOM
    if ( !$( "#colContainer_" + strColId )[0] )
    {
      return;
    }

    const checkParentEl = $( "<div>" ).attr( "id", strColId + "_container" ).append( $( "<div>" ).attr( "id", strColId ) );

    $( "#colContainer_" + strColId ).addClass( colHdrProps.cssColData ).append( checkParentEl );

    const vwCheckBox = $( "#" + strColId ).VwCheckBox( objColData, colHdrProps.vwControlProps );

    m_gridMain._mapCustomControlByRowColId.put( strColId, vwCheckBox );

    if ( colHdrProps.click )
    {
      vwCheckBox.click( function ( fChecked )
                        {
                          const objRow = getObjDataFromColId( strColId );

                          if ( !objRow )
                          {
                            return;
                          }
                          
                          if ( colHdrProps.dataId )
                          {
                            objRow[colHdrProps.dataId] = vwCheckBox.isChecked();
                          }

                          colHdrProps.click.call( self, fChecked, objRow )

                        } );
    }
    else
    {
      if ( colHdrProps.dataId )
      {
        vwCheckBox.click( function ()
                          {
                            const objRow = getObjDataFromColId( strColId );

                            objRow[colHdrProps.dataId] = vwCheckBox.isChecked();

                          } );
      }
    }

  }


  /**
   * Create a VwButton for the column
   * @param strColId
   * @param colHdrProps
   * @param colData
   */
  function doVwButton( strColId, colHdrProps, colData )
  {
    const vwButton = new VwButton( "colContainer_" + strColId,  colHdrProps )

    m_gridMain._mapCustomControlByRowColId.put( strColId, vwButton );

    if ( colHdrProps.click )
    {
      vwButton.click( () =>
                      {
                        const gridRow = getObjDataFromColId( strColId );
                        colHdrProps.click.call( self, gridRow );

                      });
    }

  }

  function doVwComboBoxHtml( strRowId, strColId, colHdrProps, objColData )
  {

  }

  function doProgressBar( strRowId, strColId, colHdrProps, objColData )
  {

  }

  function doTextHtml( strColId, colHdrProps, objColData )
  {

    const htmlSpanEl = $( "<span id='" + strColId + "'>" );

    if ( colHdrProps.cssColData )
    {
      $( htmlSpanEl ).addClass( "VwTextCol " + colHdrProps.cssColData );
    }
    else
    {
      $( htmlSpanEl ).addClass( "VwTextCol" );
    }


    htmlSpanEl.append( objColData );

    $( "#colContainer_" + strColId ).append( htmlSpanEl );

    if ( colHdrProps.dataAlign )
    {
      switch( colHdrProps.dataAlign )
      {
        case "left":

          $( "#colContainer_" + strColId ).css( "justify-content", "flex-start");
          break;

        case "right":

           $( "#colContainer_" + strColId ).css( "justify-content", "flex-end");
           break;

      } // end switch()

    } // end if

  } // end

  /**
   * Install empty div tag for custom control
   * @param strColId
   * @param colHdrProps
   */
  function doCustomDivHtml( strColId, colHdrProps )
  {

    let strDiv = "<div id='" + strColId + "'";

    if ( colHdrProps.cssColData )
    {
      strDiv += " class='" + colHdrProps.cssColData + "'";
    }

    strDiv += "></div>";

    $( "#colContainer_" + strColId ).append( strDiv );

    const strMarginLeft = $( "#" + strColId ).css( "margin-left" );

    if ( strMarginLeft == "0px" )
    {
      $( "#" + strColId ).css( "margin-left", "2px" );
    }

  } // end doCustomDivHtml()

  /**
   * Call the custom control installer
   * @param strColId
   * @param colHdrProps
   */
  function doCustomControl( objRow, strColId, colHdrProps )
  {

    if ( colHdrProps.customInstaller )
    {
      const custControl = colHdrProps.customInstaller( "colContainer_" + strColId, objRow, colHdrProps );
      m_gridMain._mapCustomControlByRowColId.put( strColId, custControl );

    }

  } // end doCustomControl()


  /**
   * Return the custom control instance for the column id
   * @param objRow The object representing the row or tile
   * @param colId The column id its its a row
   */
  function getCustomControl( objRow, colId )
  {

    const strColId = getColId( objRow, colId );

    return m_gridMain._mapCustomControlByRowColId.get( strColId );

  }

  /**
   * Return the row object from a column handleClick event
   * @param strRowColId The column id
   * @returns {*}
   */
  function getObjDataFromColId( strRowColId )
  {
    strRowColId = strRowColId.substring( 0, strRowColId.lastIndexOf( "_" ) );

    /*
    let assetId;

    if ( strRowColId.includes( "extender") )
    {
      assetId = strRowColId.substring( strRowColId.indexOf( "extender_")  + "extender_".length + 1);
    }
    else
    {
      const strGridId = m_gridMain.getGridId() ;
      assetId = strRowColId.substring( strRorColId.indexOf( strGridId ) + strGridId.length + 2 );
    }

    const dataModel = m_gridMain.getDataModel();

    const rowData = dataModel.getById( assetId );


     */
    return m_mapGridDataByRowId.get( strRowColId );

  }

  /**
   * Config the default properties
   *
   * @param objUserGridProps  Grid body/row properties
   */
  function configProperties( objUserGridProps )
  {

    const objGridProps = {};
    objGridProps.showGridLines = true;
    objGridProps.cssGridParent = "VwGridParent";
    objGridProps.cssGrid = "VwGrid";
    objGridProps.cssGridExtender = "VwGridExtender";
    objGridProps.cssGridHdr = "VwGridStdHdrCol";
    objGridProps.cssGridHdrBorders = "VwGridHdrBorders";
    objGridProps.cssGridBodyWrap = "VwGridBodyWrap";
    objGridProps.cssGridHdrColContainer = "VwGridColContainer";
    objGridProps.cssColContainer = "VwGridColContainer";
    objGridProps.cssGridHdrCol = "VwGridHdrCol"
    objGridProps.cssGridBody = "VwGridBody";
    objGridProps.cssGridRow = "VwGridRow";
    objGridProps.cssGridSortArrow = "VwGridSortArrow";
    objGridProps.cssGridHdrImg = "VwGridHdrImg";
    objGridProps.cssGridHdrText = "VwGridHdrText";
    objGridProps.cssGridRowBorder = "VwGridRowBorder";
    objGridProps.cssGridColBorder = "VwGridColBorder";
    objGridProps.cssContainerDragEnter = "VwContainerDragEnter";
    objGridProps.cssItemDragEnter = "VwRowDragEnter";
    objGridProps.cssFolderAssetRow = "VwGridFolderAssetRow";
    objGridProps.cssFolderRow = "VwGridFolderRow";
    objGridProps.cssFixedVerticalScrollbar = "VwFixedVerticalScrollbar";
    objGridProps.cssAbsoluteVerticalScrollbar = "VwAbsoluteVerticalScrollbar";
    objGridProps.cssGridResizeCol = "VwGridResizeCol";
    objGridProps.maintainRowOrder = false;
    objGridProps.cssRowSelected = "VwGridRowSelected";
    objGridProps.cssRowHovered = "VwGridRowSelected";
    objGridProps.allowItemSelection = true;

    objGridProps.allowDrag = false;
    objGridProps.allowDrop = false;
    objGridProps.dragType = "move";
    objGridProps.defaultForNull = "";

    objGridProps.sortArrowImgUp = "vozzworks/ui/images/vw_black_arrow_up.png";
    objGridProps.sortArrowImgDown = "vozzworks/ui/images/vw_black_arrow_down.png";

    if ( hasRowView() )
    {
      m_gridMain._strCurViewStyle = VwGridV1.ROWCOL_VIEW;
      objGridProps.displayHeader = true;
    }
    else
    {
      m_gridMain._strCurViewStyle = VwGridV1.TILE_VIEW;
    }

    if ( objUserGridProps.allowMultipleItemSelections )
    {
      objUserGridProps.allowItemSelection = true;
    }

    if ( !objUserGridProps )
    {
      throw "The VwGrid requires the grid properties object to be defined with either the aHdrCols array or tileViewProps specified. Please refer to VwGrid doc for details"
    }

    $.extend( objGridProps, objUserGridProps );

    // add in view context object

    objGridProps.objContext = {};


    if ( objGridProps.resourceMgr )
    {
      if ( !objGridProps.propKeyPrefix )
      {
        objGridProps.propKeyPrefix = "i18n_";
      }

    }

    let strDataIdProp = m_gridMain._gridDataModel.getDataIdProp();

    if ( !strDataIdProp  )
    {
      m_strDataIdProp = "vwSeqId";
    }
    else
    {
      m_strDataIdProp = strDataIdProp ;
    }

    return objGridProps;

  }


  /**
   * Setup all grid action handlers
   */
  function setupActionHandlers()
  {

    // We need to scroll the grid header horizontally if the grid body is scrolled
    $( "#" + m_gridMain._strBodyId ).scroll( function ( evt )
                                                 {
                                                   const nOffset = evt.target.scrollLeft * -1;

                                                   $( "#" + VW_GRID_HDR_ID ).css( "margin-left", nOffset )
                                                 } );

  }

  function handleGridResize()
  {
    const strGridId = self.getGridId();
    const strMainGridId = m_gridMain.getGridId();


    if ( strGridId != strMainGridId )
    {
      return; // this is a subgrid so exit here

    }


    // only resize if this is the top level folder
    m_gridMain._nOrigRowWidth = $( "#" + strParentId ).width();

    if ( m_gridMain._strResizeColMetric == "%" )
    {
      // new column widths must be calculated
      recalcColWidths();
    }

  } // end  handleGridResize()


  /**
   *  Sets the breadcrumb manager for folder path expansion
   */
  function setupFolderPathBreadCrumbMgr()
  {
    const breadCrumbProps = {};
    breadCrumbProps.strLinkNameProp = m_gridProps.breadCrumbLinkProp;
    breadCrumbProps.strLinkIdProp = m_gridProps.breadCrumbIdProp;
    breadCrumbProps.click = handleCrumbClicked;
    breadCrumbProps.cssBreadCrumbContainer = m_gridProps.cssBreadCrumbContainer;
    
    m_breadCrumbMgrUi = new VwBreadCrumbMgr( m_gridProps.breadCrumbParentId, breadCrumbProps );
    m_breadCrumbModel = m_breadCrumbMgrUi.getBreadCrumbMgr();

    const breadCrumbEntry = {};
    breadCrumbEntry[m_gridProps.breadCrumbIdProp] = m_gridProps.breadCrumbBaseNameId;
    breadCrumbEntry[m_gridProps.breadCrumbLinkProp] = m_gridProps.breadCrumbBaseName;

    m_mapRowSubGrids.put( m_gridProps.breadCrumbBaseNameId, self );

    m_breadCrumbModel.addCrumb( breadCrumbEntry );

  }

  /**
   * Click handler for bread crumbs
   * @param crumbEntryClicked The bread crumb object that was clicked on
   */
  function handleCrumbClicked( crumbEntryClicked )
  {
    const lastCrumb = m_breadCrumbModel.getLastCrumb();

    closeRowFolder( lastCrumb, crumbEntryClicked );
    m_breadCrumbModel.removeFollowing( crumbEntryClicked[m_gridProps.breadCrumbIdProp] );

    const curCrumb = m_breadCrumbModel.getLastCrumb();

    if ( curCrumb[m_gridProps.breadCrumbIdProp] == m_gridProps.breadCrumbBaseNameId )
    {
      m_gridMain._curExpandedFolder = null;
    }
    else
    {
      m_gridMain._curExpandedFolder = curCrumb;
    }
    
    if ( m_gridProps.breadCrumbClick )
    {
      m_gridProps.breadCrumbClick();
    }

    self.resize();

  }


  /**
   * Handles the mouseenter event of the hover
   * @param event
   */
  function handleRowHoverIn( event )
  {
    const objRow = m_mapGridDataByRowId.get( event.currentTarget.id );

    if ( m_gridProps.cssRowHovered )
    {
      $( "#" + event.currentTarget.id ).addClass( m_gridProps.cssRowHovered );
    }

    if ( m_fnRowHoverHandler != null )
    {
      m_fnRowHoverHandler.call( self, true, objRow, event );
    }

    toggleRowHoverOverlays( true, event );

  }


  /**
   * Handles the mouseleave event of the hover
   * @param event
   */
  function handleRowHoverOut( event )
  {

    const objRow = m_mapGridDataByRowId.get( event.currentTarget.id );

    if ( m_gridProps.cssRowHovered )
    {
      if ( m_gridProps.cssRowHovered != m_gridProps.cssRowSelected)
      {
        $( `#${event.currentTarget.id}` ).removeClass( m_gridProps.cssRowHovered );
      }
      else
      {
        // Row hivered and row select css are the same, only removed row hovered if the row is not selected
        if ( !$( `#${event.currentTarget.id}` ).hasClass( "VwSelected") )
        {
          $( `#${event.currentTarget.id}` ).removeClass( m_gridProps.cssRowHovered );

        }
      }
    }

    if ( m_fnRowHoverHandler != null )
    {
      m_fnRowHoverHandler.call( self, false, objRow, event );
    }

    toggleRowHoverOverlays( false, event.currentTarget.id );

  }


  /**
   * Handles the mouseenter event of the column hover
   * @param event
   */
  function handleCellHoverIn( event )
  {
    const nColNbr = Number( event.currentTarget.id.substring( event.currentTarget.id.lastIndexOf( "_" ) + 1 ) );

    let strRowId = event.currentTarget.id.substring( 0, event.currentTarget.id.lastIndexOf( "_" ) );

    // Strip off column parent id

    strRowId = strRowId.substring( strRowId.indexOf( "_") + 1 );
    
    const objRow = m_mapGridDataByRowId.get( strRowId );

    m_gridProps.aHdrCols[nColNbr].hover.call( self, true, objRow, event );

  }


  /**
   * Toggles the rowHover overlay if any defined
   * @param fShow if true show the overlay else hide it
   * @param strRowId
   */
  function toggleRowHoverOverlays( fShow, strRowId )
  {

    // Toggle the display attribute on any overlay column
    if ( m_aColOverlays.length > 0 )
    {
      for ( let x = 0, nLen = m_aColOverlays.length; x < nLen; x++ )
      {
        const strCol = "#" + strRowId + "_" + m_aColOverlays[x].nColNbr;

        if ( m_aColOverlays[x].fMaintainOnSelectedRow )
        {
          if ( isSelectedRow( strRowId ) )
          {
            return;
          }
        }

        if ( fShow )
        {
          $( strCol ).hide();
          $( strCol + "_overlay" ).show();

        }
        else
        {
          $( strCol ).show();
          $( strCol + "_overlay" ).hide();
        }
      }
    }
  }


  /**
   * Handles the mouseleave event of the column hover
   * @param event
   */
  function handleCellHoverOut( event )
  {

    const nColNbr = Number( event.currentTarget.id.substring( event.currentTarget.id.lastIndexOf( "_" ) + 1 ) );

    const strRowId = event.currentTarget.id.substring( 0, event.currentTarget.id.lastIndexOf( "_" ) );

    const objRow = m_mapGridDataByRowId.get( strRowId.substring( 3 ) );

    m_gridProps.aHdrCols[nColNbr].hover.call( self, false, objRow, event );

  }


  /**
   * Handle the selection color when one or a range is selected
   * @param event The mouse handleClick event object
   * @param fNoFireCallback
   */
  function handleRowSelection( event, fNoFireCallback )
  {

    let strSelRowIdId = event.currentTarget.id;

    if ( m_gridProps.allowItemSelection )
    {

      if ( m_aSelectedItemIds == null )
      {
        m_aSelectedItemIds = [];
      }

      if ( !event.metaKey && !event.shiftKey ) // this is a single selection - no meta or shift key
      {
        clearSelections();

        const rowSelection = makeRowSelectionObj( strSelRowIdId );

        toggleRowHoverOverlays( true, strSelRowIdId );

        m_aSelectedItemIds.push( rowSelection ); // This is the first in a multiple selection

        $( `#${strSelRowIdId}` ).addClass( `VwSelected ${m_gridProps.cssRowSelected}` );

        // Apply callback if specified

        if ( m_fnSelectionHandler && !fNoFireCallback )
        {
          m_fnSelectionHandler.call( self, getSelectedObjectByRowId( event.currentTarget.id ) );

        }

        return true;

      }

      if ( (event.metaKey || event.shiftKey) && m_gridProps.allowMultipleItemSelections )
      {
        if ( event.shiftKey )
        {
          handleShiftKeySelection( strSelRowIdId )
        }
        else
        {
          handleCmdKeySelection( strSelRowIdId )

        }
      }
    }

    return true;

  }

  function handleUnselectRow( event, fNoFireCallback )
  {
    const strSelRowIdId = event.currentTarget.id;

    if ( m_gridProps.allowItemSelection )
    {

      if ( m_aSelectedItemIds == null )
      {
        m_aSelectedItemIds = [];
      }

      if ( !event.metaKey && !event.shiftKey ) // this is a single selection - no meta or shift key
      {
        clearSelections();

        const objSelection = makeRowSelectionObj( strSelRowIdId );

        toggleRowHoverOverlays( true, strSelRowIdId );

        m_aSelectedItemIds.push( objSelection ); // This is the first in a multiple selection

        $( `#${strSelRowIdId}` ).removeClass( m_gridProps.cssRowSelected );

        // Apply callback if specified

        if ( m_fnSelectionHandler && !fNoFireCallback )
        {
          m_fnSelectionHandler.call( self, getSelectedObjectByRowId( event.currentTarget.id ) );

        }

        return true;

      }
    }
  }


  /**
   * Handle the row double handleClick event
   * @param event The mouse handleClick event object
   */
  function handleRowDblClick( event )
  {

    if ( m_fnDblClickHandler != null )
    {
      const rowAsset = m_mapGridDataByRowId.get( event.currentTarget.id );

      if ( isFolder( rowAsset ))
      {
        openRowFolder( rowAsset, true );
        self.resize();

        return;
      }

      m_fnDblClickHandler( rowAsset );

    }

  }  // end handleRowDblClick()


  /**
   * Test to see if row id in the event object is a row that is selected
   *
   * @param strRowId The row ID
   * @returns {boolean}
   */
  function isSelectedRow( strRowId )
  {
    if ( m_aSelectedItemIds == null )
    {
      return false;
    }

    for ( let x = 0, nLen = m_aSelectedItemIds.length; x < nLen; x++ )
    {
      if ( m_aSelectedItemIds[x].id == strRowId )
      {
        return true;
      }
    }

    return false;

  }


  /**
   * Selects a row or tile based on the current view style
   *
   * @param objToSelect The data object representing the row or tile
   * @param fNoFireCallback if true do not filre callback selected
   */
  function select( objToSelect, fNoFireCallback )
  {
    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      selectRow( objToSelect, fNoFireCallback );
    }
    else
    {
      selectTile( objToSelect, fNoFireCallback );
    }

  }

  /**
   * Unselectes the row or tile for the object specified
   *
   * @param objToSelect The row or tile to unselect
   * @param fNoFireCallback if true do not filre callback unselected
   */
  function unselect( objToSelect, fNoFireCallback )
  {
    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      unselectRow( objToSelect, fNoFireCallback );
    }
    else
    {
      unselectTile( objToSelect, fNoFireCallback );
    }

  }


  /**
   * Forces a selection of the row associated with a data object
   * @param objToSelect The data object of the row to select
   * @param fNoForeCallback
   */
  function selectRow( objToSelect, fNoForeCallback )
  {
    const event = makeEventFromObject( objToSelect );
    handleRowSelection( event, fNoForeCallback );
  }

  /**
   * Forces a selection of the row associated with a data object
   * @param objToSelect The data object of the row to select
   * @param fNoForeCallback
   */
  function unselectRow( objToSelect, fNoForeCallback )
  {
    const event = makeEventFromObject( objToSelect );
    handleUnselectRow( event, fNoForeCallback );
  }


  /**
   * Select multiple rows if the allowMultipleRowSelction property is true
   *
   * @param aObjToSelect Array of data objects to select
   */
  function selectRows( aObjToSelect )
  {
    const event = {};
    event.currentTarget = {};
    event.currentTarget.id = aObjToSelect[0][m_strDataIdProp];

    handleRowSelection( event );

  }


  /**
   * Selects a Tile based on the data object representing the tile
   *
   * @param objToSelect The data object representing tghe tile
   */
  function selectTile( objToSelect, fNoFireCallback )
  {
    const event = makeEventFromObject( objToSelect );

    const vwTileLoc = findTile( objToSelect );

    handleTileClicked( event, vwTileLoc.tile, fNoFireCallback );
  }

  /**
   * Unselect Tile
   * @param objToSelect
   * @param fNoFireCallback
   */
  function unselectTile( objToSelect, fNoFireCallback )
  {
    const event = makeEventFromObject( objToSelect );

    if ( m_gridProps.allowItemSelection )
    {

      if ( m_aSelectedItemIds == null )
      {
        m_aSelectedItemIds = [];
      }

      if ( !event.metaKey && !event.shiftKey ) // this is a single selection - no meta or shift key
      {
        clearSelections();
      }

    }

  }

  /**
   *
   * @param dataObj
   * @returns {{}}
   */
  function makeEventFromObject( dataObj )
  {
    const event = {};
    event.currentTarget = {};
    event.currentTarget.id = getCanonicalObjectId( dataObj );

    return event;
  }

  /**
   * Finds the tile specified by its tile data
   * @returns a tile found object withe the tilerow and tile instance
   */
  function findTile( objTiltData )
  {
    for ( let x = 0, nLen = m_aTileRows.length; x < nLen; x++ )
    {
      const vwTileSpec = m_aTileRows[x].findTile( objTiltData );

      if ( vwTileSpec )
      {
        return {tileRow: m_aTileRows[x], tile: vwTileSpec.vwTile, tileNdx: vwTileSpec.vwTileNdx};
      }
    }

    return null;

  }

  /**
   * Handle selection color for the row clicked holding down the cmd (meta) key
   * @param strRowId The row id that was clicked
   */
  function handleCmdKeySelection( strRowId )
  {
    // see if clicked row is already selected, and de-select it if it is

    for ( let x = 0, nLen = m_aSelectedItemIds.length; x < nLen; x++ )
    {
      const objSelection = m_aSelectedItemIds[x];

      if ( objSelection.id == strRowId )
      {
        // de-select row

        $( `#${objSelection.id}` ).removeClass( m_gridProps.cssRowSelected );
        m_aSelectedItemIds.splice( x, 1 ); // remove ot from array

        return;

      }
    } // end for()


    // Not already selected so added it

    const objSelection = makeRowSelectionObj( strRowId );
    m_aSelectedItemIds.push( objSelection );

    $( `#${strRowId}` ).addClass( m_gridProps.cssRowSelected );

  }


  /**
   * Handle selection color for the row clicked holding down the cmd (meta) key
   * @param strTileId The row id that was clicked
   */
  function handleTileCmdKeySelection( strTileId )
  {
    // see if clicked tile is already selected, and de-select it if it is

    for ( let x = 0, nLen = m_aSelectedItemIds.length; x < nLen; x++ )
    {
      const strSelId = m_aSelectedItemIds[x].id;

      if ( strSelId == strTileId )
      {
        // de-select row

        if ( m_gridProps.tileProps.cssTileSelected )
        {
          $( "#" + strSelId ).removeClass( m_gridProps.tileProps.cssTileSelected );
        }

        m_aSelectedItemIds.splice( x, 1 ); // remove ot from array

        return;

      }
    } // end for()


    // Not already selected so added it

    const objSelection = makeRowSelectionObj( strTileId );
    m_aSelectedItemIds.push( objSelection );

    if ( m_gridProps.tileProps.cssTileSelected )
    {
      $( "#" + strTileId ).addClass( m_gridProps.tileProps.cssTileSelected );
    }

  }

  /**
   * Handles the row range selection when the shift key is clicked
   * @param strRowIdLast
   */
  function handleShiftKeySelection( strRowIdLast )
  {
    if ( m_aSelectedItemIds.length == 0 )
    {
      const objSelection = makeRowSelectionObj( strRowIdLast );
      m_aSelectedItemIds.push( objSelection );
      $( `#${strRowIdLast}` ).addClass( m_gridProps.cssRowSelected );

      return;
    }

    // Get the child divs from the body

    const nFirstSel = Number( extractNbrFromId( $( "#" + m_aSelectedItemIds[0].id ).attr( "data-objndx" ) ) );

    const nLastSel = Number( extractNbrFromId( $( "#" + strRowIdLast ).attr( "data-objndx" ) ) );
    // this completes a set

    let nInc = 1;

    if ( nFirstSel > nLastSel )
    {
      nInc = -1;
    }

    const nCount = Math.abs( nLastSel - nFirstSel ) + 1;

    const aRowDivs = $( "#" + VW_GRID_BODY_ID ).children();

    for ( let x = 0, y = nFirstSel; x < nCount; x++ )
    {

      if ( aRowDivs[y].id == m_aSelectedItemIds[0].id )
      {
        y += nInc;
        continue;
      }
      else
      {
        const objSelection = makeRowSelectionObj( aRowDivs[y].id );
      }

      m_aSelectedItemIds.push( objSelection ); // This is the first in a multiple selection

      $( `#${aRowDivs[y].id}` ).addClass( m_gridProps.cssRowSelected );
      y += nInc;

    }

  } // end handleShiftKeySelection()

  /**
   * Returns the selected object by row ID
   * @param strRowId
   * @returns {null}
   */
  function getSelectedObjectByRowId( strRowId )
  {
    if ( m_aSelectedItemIds == null || m_aSelectedItemIds.length == 0 )
    {
      return null;

    }

    for ( let x = 0, nLen = m_aSelectedItemIds.length; x < nLen; x++ )
    {

      if ( m_aSelectedItemIds[x].id == strRowId )
      {
        return m_mapGridDataByRowId.get( strRowId );
      }
    }  // end for()

    return null; // no selection found
  }


  /**
   * Make a row selection object
   * @param strRowId The rowId of the selected row
   * @returns {{}}
   */
  function makeRowSelectionObj( strRowId )
  {
    const selected = {};
    selected.id = strRowId;

    return selected;
  }


  /**
   * Reset any selected items to the original color or origional css
   */
  function clearSelections()
  {
    if ( m_aSelectedItemIds == null )
    {
      return;
    }

    for ( let x = 0; x < m_aSelectedItemIds.length; x++ )
    {

      const objSelection = m_aSelectedItemIds[x];

      m_aSelectedItemIds.splice( x, 1 );

      if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
      {
        toggleRowHoverOverlays( false, objSelection.id );
        $( `#${objSelection.id}` ).removeClass( `VwSelected ${m_gridProps.cssRowSelected}`);
      }
      else
      {
        if ( m_gridProps.tileProps.cssTileSelected )
        {
          $( `#${objSelection.id}` ).removeClass( m_gridProps.tileProps.cssTileSelected );
        }
      }

    }

  }


  /**
   * Handle handleClick event on individual cell
   * @param event
   */
  function handleCellClicked( event )
  {

    if ( m_fnCellSelectionHandler != null )
    {
      var strCellId = event.currentTarget.id;

      var nPos = strCellId.lastIndexOf( "_" );

      var strRowId = strCellId.substring( 3, nPos );

      // Get object associated with the row
      var objRow = m_mapGridDataByRowId.get( strRowId );

      // column nbr is 2nd part of id
      var nColNbr = Number( strCellId.substring( ++nPos ) );

      var objCellData = objRow[m_gridProps.aHdrCols[nColNbr].dataId];

      m_fnCellSelectionHandler.call( self, nColNbr, objCellData );
    }

  }

  /**
   * Close a tile folder
   * @param folderCollapsing
   * @param folderOpening
   */
  function closeTileFolder( folderCollapsing, folderOpening )
  {
    openTileFolder( folderOpening, false );
  }

  /**
   * Opens a tile folder and redisplays tiles that are part of the folder  being opened
   *
   * @param folderOpening The tile userData object
   * @param bAdjustBreadCrumb if true ajust breadcrumb to match expanded folder
   */
  function openTileFolder( folderOpening, bAdjustBreadCrumb )
  {

    let strDataKey;
    if ( folderOpening[m_strDataIdProp] == m_gridProps.breadCrumbBaseNameId )
    {
      m_gridMain._curExpandedFolder = null;
    }
    else
    {
       m_gridMain._curExpandedFolder = folderOpening;

    }

    if ( bAdjustBreadCrumb )
    {
      m_breadCrumbModel = m_gridMain.getBreadCrumbModel();

      // add in the folder expanded
      m_breadCrumbModel.addCrumb( folderOpening );
    }

    setupTileView();

  }  // end openTileFolder


  /**
   * Handle handleClick event on individual cell
   * @param event
   */
  function handleTileClicked( event, vwTile, fNoFireCallback )
  {
    var strTileId = vwTile.getId();

    var objTileData = vwTile.getData();

    if ( m_gridProps.allowItemSelection )
    {

      if ( m_aSelectedItemIds == null )
      {
        m_aSelectedItemIds = [];
      }

      if ( !event.metaKey && !event.shiftKey ) // this is a single selection - no meta or shift key
      {
        clearSelections();

        const objSelection = makeRowSelectionObj( strTileId );
        m_aSelectedItemIds.push( objSelection );

        $( "#" + strTileId ).addClass( m_gridProps.tileProps.cssTileSelected );

        if ( m_fnSelectionHandler )
        {

          if ( typeof fNoFireCallback == "undefined" )
          {
            m_fnSelectionHandler.call( self, objTileData );
          }
          else
          {
            if ( !fNoFireCallback )
            {
              m_fnSelectionHandler.call( self, objTileData );
            }
          }
        }

        return;

      }

      if ( (event.metaKey || event.shiftKey) && m_gridProps.allowMultipleItemSelections )
      {
        if ( event.shiftKey )
        {
          handleTileShiftKeySelection( strTileId )
        }
        else
        {
          handleTileCmdKeySelection( strTileId )
        }
      }

    }


  } // end handleTileClicked()


  /**
   * Handles the row range selection when the shift key is clicked
   * @param strTileIdLast
   */
  function handleTileShiftKeySelection( strTileIdLast )
  {
    VwUiUtils.clearTextSelections();
    var objSelection;

    if ( m_aSelectedItemIds.length == 0 )
    {
      objSelection = makeRowSelectionObj( strTileIdLast );
      m_aSelectedItemIds.push( objSelection );

      if ( m_gridProps.tileProps.cssTileSelected )
      {
        $( "#" + strTileIdLast ).addClass( m_gridProps.tileProps.cssTileSelected );

      }

      return;

    }

    // Get the child divs from the body

    var nFirstSel = Number( extractNbrFromId( $( "#" + m_aSelectedItemIds[0] ).attr( "data-objndx" ) ) );

    var nLastSel = Number( extractNbrFromId( $( "#" + strTileIdLast ).attr( "data-objndx" ) ) );
    // this completes a set

    var nInc = 1;

    if ( nFirstSel > nLastSel )
    {
      nInc = -1;
    }

    var nCount = Math.abs( nLastSel - nFirstSel ) + 1;

    for ( var x = 0, y = nFirstSel; x < nCount; x++ )
    {

      var strTileId = ($( "[" + VW_DATA_OBJ_PREFIX + y + "']" )[0]).id;
      if ( strTileId == m_aSelectedItemIds[0] )
      {
        y += nInc;
        continue;
      }

      objSelection = makeRowSelectionObj( strTileId );
      m_aSelectedItemIds.push( objSelection );

      $( "#" + strTileId ).addClass( m_gridProps.tileProps.cssTileSelected );
      y += nInc;

    }

  } // end handleTileShiftKeySelection()


  /**
   * Extract the row id from the event id
   * @param event Event object
   *
   * @returns {string}
   */
  function extractRowId( event )
  {
    var strId = event.currentTarget.id;

    // Remove the grid id's prefix
    return strId.substring( strId.lastIndexOf( "_" ) + 1 );

  }

  /**
   * Extract and return the grid ID name
   * @param strId
   * @returns {string|*|*|string}
   */
  function extractGridId( strId )
  {
    return strId.substring( strId.indexOf( "_" ) + 1 );
  }

  /**
   * Extracts and returns the number from the ID name
   * @param strId
   * @returns {number}
   */
  function extractNbrFromId( strId )
  {
    if ( !strId )
    {
      return 0;
    }
    return Number( strId.substring( strId.lastIndexOf( "_" ) + 1 ) );

  }

  /**
   * Make a column id from the row id and column nbr
   *
   * @param strRowId  The row id minus the gridId prefix
   * @param nColNbr   The column nbr
   * @returns {string}
   */
  function makeColId( strRowId, nColNbr )
  {
    return strRowId + "_" + nColNbr;
  }


  /**
   * Returns the grid element ID
   * @returns {*}
   */
  function getGridId()
  {
    return m_strGridId;
  }

  /**
   * Set the grid element ID
   * @param strGridId
   */
  function setGridId( strGridId )
  {
    m_strGridId = strGridId;
  }

  /**
   * Returns the grid body element ID
   * @returns {string}
   */
  function getGridBodyId()
  {
    return VW_GRID_BODY_ID;
  }

  /**
   * Returns the grid initial parent element ID where the grid was installed
   * @returns {*}
   */
  function getParentId()
  {
    return m_strParentId;
  }

  /**
   * Returns the parent header element ID
   * @returns {string}
   */
  function getParentHdrId()
  {
    return VW_GRID_HDR_ID;
  }

  /**
   * Returns the grid properties
   * @param strViewName
   */
  function getGridProps( strViewName )
  {
    if ( !strViewName )
    {
      strViewName = "main";

    }

    return m_mapGridViews.get( strViewName );

  }

  /**
   * Set the grid properties
   * @param objGridProps
   * @param strViewName
   */
  function setGridProps( objGridProps, strViewName )
  {
    if ( !strViewName )
    {
      strViewName = "main";

    }

    m_gridProps = objGridProps;
    m_mapGridViews.put( strViewName, objGridProps );

  }

  /**
   * Returns the grid master data size
   */
  function getSize()
  {
    return getDataModel().getDataSet().length;
  }

  /**
   * Get filtered data size
   * @returns {number}
   */
  function getFilteredSize()
  {

    return getNonFilteredData().length;
  }


  /**
   * Returns the name the current view being displayed.
   * @returns {*}
   */
  function getCurrentViewName()
  {
    return m_gridMain._strCurViewName;
  }

  /**
   * Return the style within the current showing view. Will be either rowColView or tileView.
   * @returns {*}
   */
  function getCurrentStyle()
  {
    return m_gridMain._strCurViewStyle;
  }

  /**
   * Clears the grid of all rows
   */
  function clear()
  {
    $( "#" + VW_GRID_BODY_ID + " > .VwScrollableContent" ).remove();

    m_aTileRows = [];

  }

  /**
   * Sets the initial height of the grid body. if you want a more dynamic expansion use the setMaxBodyHeight instead.
   * @param strHeight The height in any standard HTML format i,e. px, emd, pt ...
   */
  function setBodyHeight( strHeight )
  {
    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      if ( isNaN( strHeight ) )
      {
        $( "#" + m_strParentId ).css( "height", strHeight );
      }
      else
      {
        $( "#" + m_strParentId ).height( strHeight );

      }
    }
    else
    {
      $( "#" + m_strParentId ).css( "height", strHeight );
    }

  }

  /**
   * Sets the initial height of the grid body wrap.
   * @param strHeight The height in any standard HTML format i,e. px, emd, pt ...
   */
  function setBodyWrapHeight( strHeight )
  {
    $( "#" + m_gridMain._strBodyId ).height( strHeight );
  }

  /**
   * Sets the max body height. Important for scrolling. Vertical scroll bar shows when rows exceed height.
   * @param strHeight The height in any standard HTML format i,e. px, emd, pt ...
   */
  function setMaxBodyHeight( strHeight )
  {
    if ( m_gridMain._strCurViewStyle == VwGridV1.ROWCOL_VIEW )
    {
      $( "#" + m_strParentId ).css( "max-height", strHeight );
    }
    else
    {
      $( "#" + m_strParentId ).css( "max-height", strHeight );
    }
  }

  /**
   * Sets the color of the grid lines (row and column)
   * @param strColor The color value to set
   */
  function setGridLineColor( strColor )
  {
    $( ".VwGridRowBorder" ).css( "border-color", strColor );
    $( ".VwGridColBorder" ).css( "border-color", strColor );
  }

  /**
   * Sets the color of the row grid lines
   * @param strColor The color value to set
   */
  function setRowGridLineColor( strColor )
  {
    $( ".VwGridRowBorder" ).css( "border-color", strColor );
  }

  /**
   * Sets the color of the column grid lines
   * @param strColor The color value to set
   */
  function setColGridLineColor( strColor )
  {
    $( ".VwGridColBorder" ).css( "border-color", strColor );
  }

  /**
   * Sets the row and column grid lines to the css object defined
   *
   * @para, objLineCss
   * And object that defines legal css border properties.
   * ex. var objCss = {}; objCss["border-style"} = "groove"; objCss["border-color"} = "white";
   * or standard shorthand {border:"1px solid lightgray" }
   * setGridLineAttrs( objCss )
   */
  function setGridLineAttrs( objLineCss )
  {
    $( ".VwGridRowBorder" ).css( objLineCss );
    $( ".VwGridColBorder" ).css( objLineCss );
  }

  /**
   * Sets the row grid lines to the css object defined
   *
   * @para, objLineCss
   * And object that defines legal css border properties.
   * ex. var objCss = {}; objCss["border-style"} = "groove"; objCss["border-color"} = "white";
   * or standard shorthand {border:"1px solid lightgray" }
   * setGridLineAttrs( objCss )
   */
  function setRowGridLineAttrs( objLineAttrs )
  {
    $( ".VwGridRowBorder" ).css( objLineAttrs );
  }

  /**
   * Sets the column grid lines to the css object defined
   *
   * @para, objLineCss
   * And object that defines legal css border properties.
   * ex. var objCss = {}; objCss["border-style"} = "groove"; objCss["border-color"} = "white";
   * or standard shorthand {border:"1px solid lightgray" }
   * setGridLineAttrs( objCss )
   */
  function setColGridLineAttrs( objLineAttrs )
  {
    $( ".VwGridColBorder" ).css( objLineAttrs );
  }

  /**
   * Add a callback event handler when any cell in the row is clicked
   * @param fnClickHandler The call back handler which takes the row id in param 1 and the object data in param 2
   */
  function handleClick( fnClickHandler )
  {
    m_fnSelectionHandler = fnClickHandler;
  }

  /**
   * Add a callback event handler when any cell in the row is double-clicked
   * @param fnDblClickHandler The call back handler which takes the row id in param 1 and the object data in param 2
   */
  function handleDblClick( fnDblClickHandler )
  {
    m_fnDblClickHandler = fnDblClickHandler;
  }

  /**
   * Add a callback event handler for the cell in the row that was clicked
   * @param fnCellSelectionHandler The call back handler which takes the column number in param 1 and the object data in param 2
   */
  function addColSelectionHandler( fnCellSelectionHandler )
  {
    m_fnCellSelectionHandler = fnCellSelectionHandler;
  }

  /**
   * Add a row hover handler
   * @param fnRowHoverHandler
   */
  function addRowHoverHandler( fnRowHoverHandler )
  {
    m_fnRowHoverHandler = fnRowHoverHandler;

    $( ".VwGridRow" ).hover( handleRowHoverIn, handleRowHoverOut );

  }

  /**
   * Add a class specified by the strRowId, Note multiple classes may be added my separating them with a space i.e. "class1 class2"
   *
   * @param strRowId The row Id to add the class
   * @param strCssRowClass The row class or classes to be added
   */
  function addRowClass( objRow, strCssRowClass )
  {
    const strRowId = getRowId( objRow );

    $( "#" + strRowId ).addClass( strCssRowClass );
  }

  /**
   * Remove class specified by the rowid, Note multiple classes may be removed my separating them with a space i.e. "class1 class2"
   *
   * @param strRowId The row Id to remove the class
   * @param strCssRowClass The row class or classes to be removed
   */
  function removeRowClass( objRow, strCssRowClass )
  {
    const strRowId = getRowId( objRow );
    $( "#" + strRowId ).removeClass( strCssRowClass );
  }

  /**
   * Gets the class/classes the row has
   *
   * @param strObjId The object id as defined by dataIdProp grid props property
   * @returns a String with one or more class names
   */
  function getRowClass( stObjId )
  {
    const strCanonicalRowId = $("[id$='" + strObjId + "']").attr( "id")
    return $( "#" + strCanonicalRowId ).attr( "class" );
  }

  /**
   * Sets a style on a row/column
   *
   * @param strObjId The object id as defined by dataIdProp grid props property
   * @param colId The column id as defined in the grid header properties or the column nbr (zero based) the cell
   * @param strAttr The styles attribute name
   * @param strVal The styles attribute value
   */
  function setColStyle( strObjId, colId, strAttr, strVal )
  {
    const nColNbr = getColNbr( colId );
    const strCanonicalRowColId = strParentId + "_" + strObjId + "_" + nColNbr;

    $( "#" + strCanonicalRowColId ).css( strAttr, strVal );

  }

  /**
   * Sets a style on a row/column
   *
   * @param strRowId The row id
   * @param colId The column id as defined in the grid header properties or the column nbr (zero based) the cell
   * @param strAttr The styles attribute name
   * @param strVal The styles attribute value
   */
  function setColContainerStyle( strRowId, colId, strAttr, strVal )
  {
    const nColNbr = getColNbr( colId );
    const strCanonicalRowColId = $("[id$='" + strObjId + "_" + nColNbr + "']").attr( "id")

    $( "#" + strCanonicalRowColId ).parent().css( strAttr, strVal );

  }

  /**
   * Sets a data model to be used with this grid instance
   * @param dataModel  The dataModel to be used with this intance
   */
  function setDataModel( dataModel )
  {
    self["_gridDataModel"] = dataModel;
    dataModel.registerDataChangeListener( self, handleDataChangeEvent );
    self["_dataChangeEvent"] = handleDataChangeEvent;

    if ( dataModel instanceof VwGridDataModel )
    {
      dataModel.setGridProps( gridProps );
    }

  } // end setDataModel()


  /**
   * Returns the select object. If multiple objects were selected, it return the first in the list
   * @returns The user assign data object for the row selected
   */
  function getSelectedObject()
  {
    if ( m_aSelectedItemIds == null || m_aSelectedItemIds.length == 0 )
    {
      return null;   // No rows Selected
    }

    return m_mapGridDataByRowId.get( m_aSelectedItemIds[0].id )

  }

  /**
   * Returns a array of one or more selected objects
   *
   * @returns The user assign data object for the row selected
   */
  function getSelectedObjects()
  {

    if ( m_aSelectedItemIds == null || m_aSelectedItemIds.length == 0 )
    {
      return null;   // No rows Selected
    }

    var aObjSelected = [];

    for ( var x = 0, nLen = m_aSelectedItemIds.length; x < nLen; x++ )
    {
      var objData = m_mapGridDataByRowId.get( m_aSelectedItemIds[x].id );
      aObjSelected.push( objData );
    }

    return aObjSelected;

  }


  /**
   * Gets the nu,ber of selected rows
   *
   * @returns The number of selected rows
   */
  function getSelectedRowCount()
  {
    if ( m_aSelectedItemIds == null )
    {
      return 0;
    }

    return m_aSelectedItemIds.length;

  }

  /**
   * Returns the vertical scrollbar instance
   * @returns {*}
   */
  function getVertScrollBar()
  {
    return m_vwVertScrollBar;
  }

  /**
   * Returns the horizontal scrollbar instance
   * @returns {*}
   */
  function getHorzScrollBar()
  {
    return m_vwHorzScrollBar;
  }

  /**
   * Test for the existence of a row by row id
   * @param strRowId The row id to test
   * @returns {boolean}
   */
  function existsByRowId( strRowId )
  {
    return ($( "#" + VW_ROW_ID_PREFIX + strRowId ).length > 0 );
  }

  /**
   * Test for the existence of a row by row id
   * @param strRowId The row id to test
   * @param colId The id of the column as specified in the grid header properties or the zero based column number
   * @param strColVal
   * @returns {boolean}
   */
  function existsByColVal( strRowId, colId, strColVal )
  {
    var nColNbr = getColNbr( colId );

    var strColId = makeColId( strRowId, nColNbr );
    var strVal = getColDataByColType( m_gridProps.aHdrCols[nColNbr].colType, strColId );

    return (strVal == strColVal);

  }

  /**
   * This displays/hides the grid lines
   * @param fShow Thrie to show the grid lines, false to hide
   */
  function showGridLines( fShow )
  {

    if ( fShow )
    {
      $( ".VwGridRow" ).addClass( "VwGridRowBorder" );
      $( ".VwGridCol" ).addClass( "VwGriColBorder" );
    }
    else
    {
      $( ".VwGridRow" ).removeClass( "VwGridRowBorder" );
      $( ".VwGridCol" ).removeClass( "VwGridColBorder" );
    }
  }


  /**
   * Return Grid Parent
   * @returns {*}
   */
  function getParentGrid()
  {
    return m_gridParent;
  }


  /**
   * Returns the array of folder objects for this grid
   * @returns {Array}
   */
  function getAllFolders()
  {
    return m_gridMain._aAllFolders;

  }

  /**
   * Sets the grid parent
   * @param gridParent
   */
  function setParentGrid( gridParent )
  {
    m_gridParent = gridParent;
  }

  /**
   * Returns the breadcrumb manager model
   * @returns {*}
   */
  function getBreadCrumbModel()
  {
    return m_breadCrumbModel;
  }

  /**
   * Set the breadcrumb model
   * @param breadCrumbModel
   */
  function setBreadCrumbModel( breadCrumbModel )
  {
    m_breadCrumbModel = breadCrumbModel;
  }


  /**
   * Retuns the height of the Grids header
   * @returns {*|jQuery}
   */
  function getHeaderHeight()
  {
    return $( "#" + VW_GRID_HDR_ID ).height();
  }

  /**
   * Adds a new grid view to this instance
   *
   * @param strViewName The name of the view
   * @param objGridViewProps  The grid configuration props
   */
  function addView( strViewName, objGridViewProps )
  {

    var objGridViewProps = configProperties( objGridViewProps );

    m_mapGridViews.put( strViewName, objGridViewProps );

  }


} // end VwGrid()

export default VwGridV1;

// Public static constants

VwGridV1.STARTS_WITH = 0;
VwGridV1.CONTAINS = 1;
VwGridV1.ENDS_WITH = 2;
VwGridV1.TILE_VIEW = "tileView";
VwGridV1.ROWCOL_VIEW = "rowColView";

