/*
 * Created by User: petervosburgh
 * Date: 6/10/24
 * Time: 7:13 AM
 * 
 */

import VwPromiseMgr           from "../../util/VwPromiseMgr/VwPromiseMgr.js";
import VwXmlProcessor         from "../../util/VwXmlProcessor/VwXmlProcessor.js";
import VwXPath                from "../VwTree/VwXPath.js";
import VwGridHdr              from "./VwGridHdr.js";
import VwRowColViewMgr        from "./VwRowColViewMgr.js";
import VwScrollBar            from "../VwScrollBar/VwScrollBar.js";
import VwGridDataModel        from "./VwGridDataModel.js";
import VwHashMap              from "../../util/VwHashMap/VwHashMap.js";
import VwTileViewMgr          from "./VwTileViewMgr.js";
VwCssImport( "/vozzworks/ui/VwGrid/style");

/**
 * This class defines the VwGrid for displaying object properties in row/column display or for gallery type views. The gid can have multiple views as
 * defined in the grids propVal model. The constructor returns a promise and is resolved when the view defined is complete
 *
 * @param strParent   The grids parent element
 * @param gridModel   The grids propVal model
 * @param gridProps  The grids properties for the main view
 * @constructor
 */
function VwGrid( strParent, gridModel, gridProps )
{
  const self = this;
  const m_props = {};
  const m_strGridId = `${strParent}_vwGrid`;
  const m_strGridHdrId = `${m_strGridId}_gridHdr`;
  const m_strGridBodyId = `${m_strGridId}_gridBody`;
  const m_mapViews = new VwHashMap();
  const m_mapGridEventHandlers = new VwHashMap();

  let   m_gridHdr;
  let   m_gridViewMgr;
  let   m_strGridShellXml;
  let   m_hdrProps;
  let   m_promiseMgr;
  let   m_vertScrollBar;
  let   m_horzScrollBar;
  let   m_breadCrumbMgr;
  let   m_breadCrumbModel;
  let   m_gridModel = gridModel;
  let   m_strCrumbIdProp;
  let   m_folderOpenedId;
  let   m_dataIdProp;
  let   m_fnOnFolderOpened;
  let   m_fnOnFolderClosed;
  let   m_IsFolderIdProp;
  let   m_folderItemsIdProp;
  let   m_currentViewSpec;
  let   m_strDefaultView;

  this.getGridId = () => m_strGridId;
  this.getHdrId = () => m_strGridHdrId;
  this.getBodyId = () => m_strGridBodyId;
  this.getDataModel = () => m_gridModel;
  this.setDataModel = handleSetDataModel;
  this.setBreadCrumbMgr = handleSetBreadCrumbMgr;
  this.getBreadCrumbMgr = () => m_breadCrumbMgr;
  this.getViewMgr = handleGetViewMgr;
  this.resize = updateScrollBars;
  this.setVertScrollPos = (nScrollPos ) => m_vertScrollBar.setThumbPos( nScrollPos );
  this.setHorzScrollPos = (nScrollPos ) => m_horzScrollBar?m_horzScrollBar.setThumbPos( nScrollPos ):null;
  this.openFolder = handleOpenFolder;
  this.closeFolder = handleCloseFolder;
  this.onFolderOpened = ( fnOnFolderOpened ) => addGridEventHandler( VwGrid.FolderOpened, fnOnFolderOpened );
  this.onFolderClosed = ( fnOnFolderClosed ) => addGridEventHandler( VwGrid.FolderClosed, fnOnFolderClosed );
  this.onViewOpened = ( fnOnViewOpened ) => addGridEventHandler( VwGrid.ViewOpened, fnOnViewOpened );
  this.onViewClosed = ( fnOnViewClosed ) => addGridEventHandler( VwGrid.ViewClosed, fnOnViewClosed );

  this.show = handleShowView;

  /**
   * Renders the grid's shell
   */
  function render()
  {
    m_strGridShellXml =
    `<div id="${m_strGridId}" class="VwGrid">
       <div id="${m_strGridId}_gridHdr" style="display:none"></div>
       <div id="${m_strGridId}_gridDataContainer">
         <div id="${m_strGridId}_gridBody"></div>
       </div>
      </div>`;

  } // end render()

  /**
   * Constructor impl
   * @return {Promise<void>}
   */
  async function configObject()
  {
    render();

    $(`#${strParent}`).append( m_strGridShellXml );

    configDefaultProps();
    await configGridProps();

    if ( gridModel )
    {
      handleSetDataModel( gridModel );
    }

    m_promiseMgr.success( self );

  } // end configObject()


  /**
   * Config the grid properties from an object or XML
   * @return {Promise<void>}
   */
  async function configGridProps()
  {
    const xmlParser = new VwXmlProcessor( gridProps );
    const xmlGraph = xmlParser.toObjectGraph( null, true );
    const vwXpath = new VwXPath( xmlGraph );

    processGlobalGridProps( vwXpath );

    processViews( xmlGraph,vwXpath );

  } // end configGridProps()


  /**
   * Shows the view specified by view name
   *
   * @param strViewName The name of the view to show
   * @return {Promise<void>}
   */
  async function handleShowView( strViewName )
  {
    if ( !strViewName )
    {
      strViewName = m_strDefaultView;
    }

    const viewSpecToOpen = m_mapViews.get( strViewName );

    if ( !viewSpecToOpen )
    {
      throw `View ${strViewName} not found.`;
    }

    clearGrid( true );

    m_gridViewMgr = viewSpecToOpen.gridViewMgr;

    if ( m_currentViewSpec )
    {
      fireGridEventHandlers( VwGrid.ViewClosed, m_currentViewSpec.view.name );
     }

    m_currentViewSpec = viewSpecToOpen;


    if ( m_breadCrumbModel )
    {
      const aCrumbPath = m_breadCrumbModel.getCrumbPath();
      if ( aCrumbPath.length > 1  )
      {
        const crumb = aCrumbPath[ aCrumbPath.length - 1 ];
        const folderItem = m_gridModel.getById( crumb.id );
        await handleOpenFolder( folderItem );
        return;
      }
    }

    await fireGridEventHandlers( VwGrid.ViewOpened );

    calcGridDataContainterHeight();

    setupScrollbars();

    const viewPortProp = getArrayItemById( viewSpecToOpen.view.props.prop, "viewPortSize");

    if ( viewPortProp )
    {
      m_gridModel.setViewPortSize( viewPortProp.value );
    }

    await m_gridModel.refresh();

   } // end showView()


  /**
   * Cleard the grid elements
   */
  function clearGrid( bIncludeHdr )
  {
    if ( bIncludeHdr )
    {
      $( `#${m_strGridHdrId}` ).empty();
    }

    $( `#${m_strGridBodyId}` ).empty();

  } // end clearGrid()

  /**
   * Process views defined in the xml
   *
   * @param xmlGraph
   * @param vwXpath
   */
  function processViews( xmlGraph, vwXpath )
  {
    const aViews = xmlGraph.views.view;

    m_strDefaultView = m_props.defaultView;

    if ( !m_strDefaultView )
    {
      m_strDefaultView = aViews[0].name;
    }

    for ( const view of aViews )
    {
      const viewSpec = {};

      viewSpec.view = view;
      m_mapViews.put( view.name, viewSpec );

      if ( view.type == "rowCol" )
      {
        createRowColView( viewSpec, vwXpath );
      }
      else
      {
        createTileView( viewSpec, vwXpath );
      }

    } // end for()


  } // end processViews()

  /**
   * Process the rowCol style view
   *
   * @param view The view object from xml def
   * @param vwXpath The xpath object of the xml graph
   */
  function createRowColView( viewSpec, vwXpath )
  {

    // initial load if we get here
    m_hdrProps = vwXpath.evaluate( "//gridHdr" );

    viewSpec.gridHdr = m_gridHdr = new VwGridHdr( self, m_hdrProps, m_props );
    viewSpec.gridViewMgr = m_gridViewMgr = new VwRowColViewMgr( self, m_gridHdr, vwXpath, viewSpec.view, m_props );

    viewSpec.gridViewMgr.onPostItemAdd( handlePostItemAdded );

  } // end createRowColView()

  /**
   * Process a tile view def
   *
   * @param view The view object from xml def
   * @param vwXpath The xpath object of the xml graph
   */
  function createTileView( viewSpec, vwXpath )
  {

    let aTileProps;

    if ( !Array.isArray( viewSpec.view.props.prop ) )
    {
      aTileProps = [viewSpec.view.props.prop];
    }
    else
    {
      aTileProps = viewSpec.view.props.prop;
    }

    const tileProps = {};
    const implProps = {};

    xmlPropsToObject( aTileProps, tileProps );

    if ( viewSpec.view.implProps )
    {
      let aImplProps = vwXpath.evaluate( viewSpec.view.implProps ).prop;

      if ( !Array.isArray( aImplProps ) )
      {
        aImplProps = [aImplProps];
      }

      xmlPropsToObject( aImplProps, implProps );

    }

    viewSpec.gridViewMgr = m_gridViewMgr = new VwTileViewMgr( self, m_props, tileProps, implProps );

    viewSpec.gridViewMgr.onPostItemAdd( handlePostItemAdded );

  } // end createTileView()

  /**
   * Process the global grid props for all defined views
   * @param vwXPath
   */
  function processGlobalGridProps( vwXpath )
  {
    const aProps = toArray( vwXpath.evaluate( "/gridConfig/props/prop" ) );
    const props = {};

    if ( aProps )
    {
      xmlPropsToObject( aProps, props );
    }

    $.extend( m_props, props );

  } // end processGlobalGridProps()

  /**
   * Convert array of props defined in xml to an object
   * @param aXmlProps array of xml props
   * @param props the object to build where the prop id is the property
   */
  function xmlPropsToObject( aXmlProps, props )
  {
    for ( const prop of aXmlProps )
    {
      props[prop.id] = prop.value;
    }

  } // end xmlPropsToObject()


  /**
   * Config the default grid props
   */
  function configDefaultProps()
  {
    m_props.cssGrid  = "VwGrid";
    m_props.cssGridBody  = "VwGridBody";
    m_props.cssControlParent = "VwControlEnvelope";
    m_props.allowItemSelection = true;
    m_props.allowDrag = false;
    m_props.allowDrop = false;
    m_props.cssGridHdrResizeColSplitter = "VwGridHdrResizeColSplitter";
    m_props.cssGridColResizeSplitter = "VwGridColResizeSplitter";

  } // end configDefaultProps()


  /**
   * Calculate the absolut grid data container height which is height of the grid's parent minus the height of the grid's header
   */
  function calcGridDataContainterHeight()
  {
    const nHdrHeight = $(`#${m_strGridId}_gridHdr`).height() ;
    const nBodyContainerHeight = $(`#${strParent}`).height() - nHdrHeight;
    $(`#${m_strGridId}_gridDataContainer`).height( nBodyContainerHeight );

  } // end calcGridDataContainterHeight()

  /**
   * Sets a data model to be used with this grid instance
   * @param dataModel  The dataModel to be used with this intance
   */
  function handleSetDataModel( dataModel )
  {
    m_gridModel = dataModel;

    m_gridModel.setModelOwner( self );

    for ( const viewSpec of m_mapViews.values() )
    {
      viewSpec.gridViewMgr.setDataModel( dataModel );
    }

    if ( m_gridModel.hasFolders() )
    {
      m_IsFolderIdProp = m_gridModel.getIsFolderIdProp();
      m_folderItemsIdProp = m_gridModel.getFolderItemsProp();
      m_folderOpenedId = m_gridModel.getRootFolderId();
    }

    m_dataIdProp = m_gridModel.getDataIdProp();
    dataModel.registerDataChangeListener( self, handleDataChangeEvent );

    if ( dataModel instanceof VwGridDataModel )
    {
      dataModel.setGridProps( m_props );
    }

  } // end handleSetDataModel()


  /**
   * Postdata item add callback
   * @param dataItem
   */
  function handlePostItemAdded( dataItem )
  {
     addMouseHandlers( dataItem );
   } // end handlePostItemAdded()


  /**
   * Returns the item in the array by its id if found else null is returned
   *
   * @param aItemsToSearch The array of items to search
   * @param strId The id of the item to search
   */
  function getArrayItemById( aItemsToSearch, strId )
  {
    const item = aItemsToSearch.find( (item) => strId == item.id );
    return item;

  } // end getArrayItemById()

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
  async function handleDataChangeEvent( strChangeId, dataItem )
  {
    switch( strChangeId )
    {
      case "add":
      case "prepend":

        if ( strChangeId == "prepend")
        {
          await m_gridViewMgr.add( dataItem, "p" );
        }
        else
        {
          await m_gridViewMgr.add( dataItem );
        }

        break;

      case "update":

        await m_gridViewMgr.update( dataItem );

        break;

      case "del":

        await m_gridViewMgr.remove( dataItem );
        break;

      case "clear":

        m_gridViewMgr.clear();
        break;

      case "resize":

        updateScrollBars();
        break;

    } // end switch()

   } // end handleDataChangeEvent()

  /**
   * Setup vert and horz scrollbars
   */
  function setupScrollbars()
  {
    setupVertScrollBarContainer();

    if ( !m_props.noHorzScrollBar )
    {
      setupHorzScrollBarContainer();
    }

    updateScrollBars();

    self.setVertScrollPos( 0 );
    self.setHorzScrollPos( 0 );

  } // end setupScrollbars()

  /**
   * Updates the scrollbars to recalculate based on scrolling content size changes
   */
  function updateScrollBars()
  {
    if ( m_vertScrollBar )
    {
      m_vertScrollBar.resize();
    }

    if ( m_horzScrollBar )
    {
      m_horzScrollBar.resize();

    }
  } // end updateScrollBars()

  /**
   * Setup verticle scroll bar
   */
  function setupVertScrollBarContainer()
  {
    const scrollProps = {};
    scrollProps.orientation = "vert";

    m_vertScrollBar = new VwScrollBar( m_strGridId, `${m_strGridId}_gridBody`, scrollProps );

  } // end setupVertScrollBarContainer()

  /**
   * Setup horizontal scrollbar
   */
  function setupHorzScrollBarContainer()
  {
    const scrollProps = {};
    scrollProps.orientation = "horz";
    scrollProps.managedScrollIds = [m_strGridHdrId];

    m_horzScrollBar = new VwScrollBar( m_strGridId, `${m_strGridId}_gridBody`, scrollProps );
  } // end setupVertScrollBarContainer()


  /**
   * Converts the object passed to an array if its not already
   *
   * @param obj
   * @return {*|*[]|null}
   */
  function toArray( obj )
  {
    if ( !obj )
    {
      return null;
    }

    if ( Array.isArray( obj ))
    {
      return obj;
    }

    return [obj];

  } // end toArray()

  function handleGetViewMgr( strViewName )
  {
    if ( !strViewName )
    {
      strViewName = m_strDefaultView;
    }

    const viewSpec = m_mapViews.get( strViewName );
    return viewSpec.gridViewMgr;

  } // end handleGetViewMgr()

  /**
   * Breadcrumb entry click handler
   * @param breadCrumbMgr
   */
  function handleSetBreadCrumbMgr( breadCrumbMgr )
  {
    m_breadCrumbMgr = breadCrumbMgr;
    m_breadCrumbModel = m_breadCrumbMgr.getBreadCrumbModel();
    m_strCrumbIdProp = m_breadCrumbMgr.getCrumbIdProp();

    m_breadCrumbMgr.onCrumbClicked( handleBreadCrumbClicked );

   } // end handleSetBreadCrumbMgr()

  /**
   * Breadcrumb entry clicked
   * @param crumb the crumb object clicked on
   */
  async function handleBreadCrumbClicked( crumb )
  {
    let strCrumbId = crumb[m_strCrumbIdProp];

    if( strCrumbId == "base")
    {
      strCrumbId = m_gridModel.getRootFolderId();
    }

    if ( strCrumbId == m_folderOpenedId )
    {
      return;
    }

    let curOpenFolderItem;

    if ( m_folderOpenedId )
    {
      curOpenFolderItem = m_gridModel.getById( m_folderOpenedId );
    }

    m_folderOpenedId = strCrumbId;

    const folderToOpen = m_gridModel.getById( strCrumbId );

    m_breadCrumbModel.removeFollowing( strCrumbId );

    handleCloseFolder( curOpenFolderItem );

    await handleOpenFolder( folderToOpen, false );

  } // end handleBreadCrumbClicked()

  /**
   * Handles open folder request
   *
   * @param folderDataItem the data item representing a folder that was opened
   */
  async function handleOpenFolder( folderDataItem, bAddCrumb )
  {
    if ( bAddCrumb )
    {
      m_breadCrumbModel.addCrumb( folderDataItem );
    }

    m_folderOpenedId = folderDataItem[m_dataIdProp];
    await m_gridViewMgr.openFolder( folderDataItem, true );

    setupScrollbars();

    if ( m_fnOnFolderOpened )
    {
      m_fnOnFolderOpened( folderDataItem );
    }
  } // end handleOpenFolder()

  /**
   * Handles close folder request
   *
   * @param folderDataItem the data item representing a folder that was closed
   */
  function handleCloseFolder( folderDataItem )
  {

    if ( m_fnOnFolderClosed )
    {
      m_fnOnFolderClosed( folderDataItem );
    }

  } // end handleCloseFolder()

  /**
   * Adds the mouse handlers for each item added to the grid
   *
   * @param dataItem the data item for mouse handlers to attach to
   */
  function addMouseHandlers( dataItem )
  {
    const strDomItemId = m_gridViewMgr.getDomItemId( dataItem );

    // ** Click handlers
    $(`#${strDomItemId}`).dblclick( () => handleItemDblClick( dataItem ));
    $(`#${strDomItemId}`).click( () => handleItemClicked( dataItem ));

  } // end addMouseHandlers()


  /**
   * Item clicked handler
   * @param dataItemClicked The dataitem gor the row/tile that was clicked on
   */
  function handleItemClicked( dataItemClicked )
  {

  } // end handleItemClicked()

  /**
   * Handle the row double handleClick event
   * @param event The mouse handleClick event object
   */
  function handleItemDblClick( dataItem  )
  {
    if ( isFolder( dataItem ))
    {
      if ( typeof m_folderOpenedId != "undefined")
      {
        const curOpenFolderItem = m_gridModel.getById( m_folderOpenedId );
        handleCloseFolder( curOpenFolderItem );
      }

      handleOpenFolder( dataItem, true );
    }


  }  // end handleItemDblClick()


  /**
   * Adds a gridevent handler by event type
   *
   * @param strEventType The event handler type must be one of "itemDblClick", "folderOpened", "folderClosed", "viewOpened", "viewClosed"
   * @param fnEeventHandler   The callback handler to be invoded
   */
  function addGridEventHandler( strEventType, fnEventHandler )
  {
    let aEventHandlers = m_mapGridEventHandlers.get( strEventType );

    if ( !aEventHandlers )
    {
      aEventHandlers = [];
      m_mapGridEventHandlers.put( strEventType, aEventHandlers );
    }

    const eventNdx = aEventHandlers.findIndex( (fnHandler) => fnEventHandler == fnHandler );

    if ( eventNdx < 0 )
    {
      aEventHandlers.push( fnEventHandler );
    }

  } // end addGridEventHandler()

  async function fireGridEventHandlers( strEventType, arg )
  {
    const aEventHandlers = m_mapGridEventHandlers.get( strEventType );

    if ( !aEventHandlers )
    {
      return;
    }

    for ( const fnEventHandler of aEventHandlers )
    {
      await fnEventHandler( arg );
    }

  } // end fireGridEventHandlers()

  /**
   * Returnsw true if the data item is a folder
   *
   * @param dataItem the folderDataItem in the grid
   * @return {*|boolean}
   */
  function isFolder( dataItem )
  {
    if ( !m_IsFolderIdProp )
    {
      return false;
    }

    return dataItem[m_IsFolderIdProp];

  } // end isFolder()

  /**
   * Async constructor
   */
  return new Promise( (success, fail) =>
                      {
                        m_promiseMgr = new VwPromiseMgr( success, fail, configObject );
                      });

 } // end VwGrid{}

// Constants

VwGrid.TILE_VIEW = "tileView";
VwGrid.ROWCOL_VIEW = "rowColView";
VwGrid.ItemDblClick = "itemDblClick";
VwGrid.ViewOpened = "viewOpened";
VwGrid.ViewClosed = "viewClosed";
VwGrid.FolderOpened = "folderOpened";
VwGrid.FolderClosed = "folderClosed";

export default VwGrid;

