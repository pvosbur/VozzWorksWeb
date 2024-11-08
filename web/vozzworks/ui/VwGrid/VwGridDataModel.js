/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   10/9/18

 Time Generated:   6:24 AM

 ============================================================================================
 */

import VwHashMap                from "../../util/VwHashMap/VwHashMap.js";
import VwFilterMgr              from "../../util/VwFilterMgr/VwFilterMgr.js";
import VwSortObjectImplementor  from "../../util/VwSortObjectImplementor/VwSortObjectImplentor.js";

/**
 * Internal object for managing folder data
 * @constructor
 */
function VwGridDataModel( dataModelProps )
{
  const self = this;
  const m_mapDataChangeListeners = new VwHashMap();
  const m_mapGridDataSetFlattened = new VwHashMap();
  const m_mapFolders = new VwHashMap();
  const m_filterMgr = new VwFilterMgr();

  let   m_aDataSet = [];
  let   m_aFilteredDataSet;
  let   m_gridProps;
  let   m_modelOwner;
  let   m_strRootFolderId;
  let   m_rootFolderItem;
  let   m_strFolderItemsIdProp;
  let   m_strDataIdProp = dataModelProps.dataIdProp;
  let   m_strActiveFilterName;
  let   m_activeFilterValue;
  let   m_nViewPortSize;

  this.registerDataChangeListener = registerDataChangeListener;
  this.getDataIdProp = getDataIdProp;
  this.add = add;
  this.addAll = addAll;
  this.clear = clear;
  this.update = update;
  this.updateById = updateById;
  this.remove = remove;
  this.removeAll = clear;
  this.removeById = removeById;
  this.get = get;
  this.getById = get;
  this.setModelOwner = ( modelOwner ) => m_modelOwner = modelOwner;
  this.getModelOwner = () => m_modelOwner;
  this.refresh = handleRefresh;
  this.size = size;
  this.getDataSet = handleGetDataSet;
  this.setDataSet = setDataSet;
  this.getDataItem = getDataItem;
  this.getDataSetFlattened = getDataSetFlattened;
  this.getFolderItems = handleGetFolderItems;
  this.getFolders = getFolders;
  this.hasFolders = () => m_strRootFolderId != null;
  this.setRootFolderItem = handleSetRootFolderItem;
  this.getRootFolderItem = () => m_rootFolderItem;
  this.getRootFolderId = () => m_strRootFolderId;
  this.getIsFolderIdProp = () =>  dataModelProps.isFolderIdProp;
  this.getFolderItemsProp = () => dataModelProps.folderItemsIdProp;
  this.exists = exists;
  this.existsById = existsById;
  this.filter = filter;
  this.addFilter = (strFilterName, filterProps )=> m_filterMgr.addFilter(strFilterName, filterProps);
  this.applyFilter = handleApplyFilter;
  this.applyTextFilter = ( filterValue ) => handleApplyFilter( "vwTextFilter", filterValue );
  this.setGridProps = ( gridProps ) => m_gridProps = gridProps;
  this.setViewPortSize = ( nViewPortSize ) => m_nViewPortSize = nViewPortSize;
  this.sort = handleSort;

  configObject();

  /**
   * Constructor impl
   */
  function configObject()
  {
    if ( dataModelProps.textFilterDataIds )
    {
      configFilterMgr()
    }

  } // end configObject()

  /**
   * Config the filter mgr
   * @param dataModelProps
   */
  function configFilterMgr()
  {
    const filterProps = {};
    filterProps.dataIds = dataModelProps.textFilterDataIds;
    filterProps.matchType = dataModelProps.matchType;

    m_filterMgr.addFilter( "vwTextFilter", filterProps );

  } // end configFilterMgr()


  /**
   * Returns the dataIdProp if the dataModelProps is defined
   * @returns {null|*}
   */
  function getDataIdProp()
  {
    if ( !dataModelProps )
    {
      return null;
    }

    return dataModelProps.dataIdProp;

  } // end getDataIdProp()

  /**
   * Sets the root folder item ands the folder map recursivly through its children
   * @param rootFolderItem
   */
  function handleSetRootFolderItem( rootFolderItem )
  {
    m_rootFolderItem = rootFolderItem;
    m_strFolderItemsIdProp = dataModelProps.folderItemsIdProp ;

    if( !m_strFolderItemsIdProp )
    {
      throw `Using folders requires the data model property folderItemsIdProp which identifies the array that holds the data items the folder contains`;
    }

    m_strRootFolderId = rootFolderItem[dataModelProps.dataIdProp];

    m_mapFolders.put( m_strRootFolderId, rootFolderItem );

    buildFolderMap( rootFolderItem );

    const aRootFolderItems = rootFolderItem[dataModelProps.folderItemsIdProp];

    for( const dataItem of aRootFolderItems )
    {
      m_aDataSet.push( dataItem );
    }

  } // end handleSetRootFolderItem()

  /**
   * Adds an Evenet listener
   *
   * @param owningGrid The grid instance this data model is for
   * @param callback The function callback invoked on data model change events
   */
  function registerDataChangeListener( owningGrid, fnCallback )
  {
    m_modelOwner = owningGrid;
    const strGridId = m_modelOwner.getGridId();

    m_mapDataChangeListeners.put( strGridId, fnCallback );

  } // end registerDataChangeListener()


  /**
   * Builds folder map
   *
   * @param folderDataItem the folder data item
   */
  function buildFolderMap( folderDataItem )
  {
    const aFolderDataItems = folderDataItem[m_strFolderItemsIdProp] ;

    if ( !aFolderDataItems )
    {
      throw `Folder Data Item id: ${folderDataItem[m_strDataIdProp]} returned a null array for property ${m_strFolderItemsIdProp}`;

    }

    for ( const folderDataItem of aFolderDataItems )
    {
      if ( isFolder( folderDataItem) )
      {
        const strFolderId = folderDataItem[m_strDataIdProp];

        m_mapFolders.put( strFolderId, folderDataItem  );
        buildFolderMap( folderDataItem );
      }

    } // end for()

  } // end buildFolderMap()

  /**
   * Adds a data item to the master array and class the eventHandler
   * @param dataItem
   */
  function add( dataItem, bSilent, bPrepend )
  {
    let strAddType;

    if ( bPrepend )
    {
      strAddType = "prepend";
      m_aDataSet.unshift( dataItem );
    }
    else
    {
      strAddType = "add";
      m_aDataSet.push( dataItem );
    }

    let dataIdProp;

    if ( dataModelProps && dataModelProps.dataIdProp )
    {
      dataIdProp = dataModelProps.dataIdProp ;
    }
    else
    if ( m_gridProps && m_gridProps.dataIdProp )
    {
      dataIdProp = m_gridProps.dataIdProp ;

    }

    const strDataId = dataItem[ dataIdProp ];

    if ( !isFolder( dataItem ))
    {
      m_mapGridDataSetFlattened.put( strDataId, dataItem );

      if ( dataModelProps.folderParentIdProp )
      {
        const strFolderId = dataItem[ dataModelProps.folderParentIdProp];
        if ( strFolderId )
        {
          let aFolderItems = m_mapFolderItems.get( strFolderId);
          if ( !aFolderItems )
          {
            aFolderItems = [];
            m_mapFolderItems.put( strFolderId, aFolderItems );
          }

          aFolderItems.push( dataItem );
        }
      }
    }
    else
    {
      m_mapFolders.put( strDataId, dataItem );
    }

    if ( bSilent )
    {
      return;
    }

    callEventHandler( strAddType, dataItem );

  } // end add()


  function isFolder( dataItem )
  {

    if ( dataModelProps && !dataModelProps.isFolderIdProp )
    {
      return false;
    }
    
    return dataItem[dataModelProps.isFolderIdProp];
  }


  /**
   * Updates a data item in the array
   * @param dataItem
   */
  function update( dataItem )
  {

    for ( let x = 0; x < m_aDataSet.length; x++ )
    {
      if ( Object.is( m_aDataSet[ x ], dataItem ) )
      {
        m_aDataSet[ x ] = dataItem;
        break;
      }
    }

    callEventHandler( "update", dataItem );

  } // end add()

  /**
   * Updates a data item in the array
   * @param dataItem
   */
  function updateById( dataItemToUpdate, bSilent  )
  {
    let strIdProp;

    if ( dataModelProps )
    {
      strIdProp = dataModelProps.dataIdProp;
    }
    else
    if ( m_gridProps )
    {
      strIdProp = m_gridProps.dataIdProp;
    }

    const ndx = m_aDataSet.findIndex( (data) => data[strIdProp] == dataItemToUpdate[strIdProp ] );

    if (  ndx === undefined )
    {
      throw "Cannot find grid data item for id: " + strIdProp;
    }

    m_aDataSet[ ndx ] = dataItemToUpdate;

    if ( bSilent )
    {
      return;
    }
    callEventHandler( "update", dataItemToUpdate );

  } // end add()

  /**
   * Gets a data item by its id as defined in the gridProps.dataIdProp
   * @param strId
   * @returns {*}
   */
  function get( strId )
  {
    return findById( strId );

  }

  /**
   * Removes an item by its id
   * @param strId The id of the item to remove
   */
  function removeById( strId, bSilent )
  {
    const dataItem = findById( strId );
    if ( dataItem )
    {
      removeDataItem( dataItem );

      if ( bSilent )
      {
        return;
      }

      callEventHandler( "del", dataItem );
    }

  } // end removeById()

  /**
   * Remoives the data item from the array it lives in
   * @param dataItem
   */
  function removeDataItem( dataItem )
  {
    if ( isFolder( dataItem ))
    {
      m_mapFolders.remove( dataItem[m_strDataIdProp] );
      return;
    }

    if( m_mapFolders.size() > 0 )
    {
      removeItemInFolder( dataItem );
    }
    else
    {
      removeArrayItem( dataItem, m_aDataSet );
    }
    
  } // end removeDataItem()

  /**
   * Finds the item in the folder and removes it from the foler data items
   * @param dataItemToRemove
   */
  function removeItemInFolder( dataItemToRemove )
  {
    const strFolderId =  dataItemToRemove[m_gridProps.folderIdProp];

    const containingFolder = m_mapFolders.get( strFolderId );
    if ( !containingFolder )
    {
      return;
    }

    removeArrayItem( dataItemToRemove, containingFolder[m_strFolderItemsIdProp]);

  } // end removeItemInFolder()

  /**
   * Removes the data item from the grids data set
   * @param dataItemToRemove
   * @param aItems
   */
  function removeArrayItem( dataItemToRemove, aItems )
  {
    const strDataItemId = dataItemToRemove[m_strDataIdProp];

    const itemIdex = aItems.findIndex( ( item) => item[m_strDataIdProp] == strDataItemId);
    if ( itemIdex >= 0 )
    {
      m_aDataSet.splice( itemIdex, 1 );
      return true;
    }

    return false; // item not found in this array

  } // end removeArrayItem()


  /**
   * Removes the data item  passed if it exists
   * @param dataItem
   */
  function remove( dataItem, bSilent )
  {
    let bMsgFound;

    if ( m_strDataIdProp )
    {
      removeById(  dataItem[ m_strDataIdProp ] );
      return;
    }

    //brute force attempt if no data property id is defined
    for ( let x = 0; x < m_aDataSet.length; x++ )
    {
      if ( Object.is( m_aDataSet[ x ], dataItem ) )
      {
        m_aDataSet.splice( x , 1 );
        bMsgFound = true;
        break;
      }
    }

    if ( bSilent )
    {
      return;
    }

    if ( bMsgFound )
    {
      callEventHandler( "del", dataItem );
    }

  } // end remove()

  /**
   * Removes all data items in the array
   * @param aDataItemsToMemove Array of data items to remove
   */
  function removeAll( aDataItemsToMemove )
  {
    clear();
  } // end removeAll()


  /**
   * Finds a data item by its id. NOTE the gridProps must define the dataIdProp
   * @param strId
   * @returns {{index : number, dataItemToRemove : *}}
   */
  function findById( strId )
  {
    let bHasDataIdProp = false;

    if ( m_gridProps && m_gridProps.dataIdProp )
    {
      bHasDataIdProp = true;
    }

    if (  dataModelProps && dataModelProps.dataIdProp )
    {
      bHasDataIdProp = true;
    }

    if ( !bHasDataIdProp )
    {
      throw "Attempting to use findById without defineing the 'dataIdProps'in the grid properties."
    }

    // see if the request is for a folder
    const folder = m_mapFolders.get( strId );

    if ( folder )
    {
      return  folder;
    }

    if ( m_mapGridDataSetFlattened.containsKey( strId ))
    {
       return m_mapGridDataSetFlattened.get( strId );
    }

    return null;

  } // end findById()

  /**
   *  Clears the grid of existing entries and re-adds the elements in the data set
   */
  async function handleRefresh()
  {
    let aDataItems;

    callEventHandler( "clear"  );

    if ( m_aFilteredDataSet )
    {
      aDataItems = m_aFilteredDataSet;
    }
    else
    {
      aDataItems = m_aDataSet;
    }

    if ( aDataItems.length == 0 )
    {
      return;
    }

    if ( m_nViewPortSize )
    {
      let nItemCount = -1;
      while ( true )
      {
        ++nItemCount;
        if ( nItemCount >= m_nViewPortSize || nItemCount >= aDataItems.length )
        {
          break;
        }

        await callEventHandler( "add", aDataItems[ nItemCount ] );
      }
    }
    else
    {
      for ( const dataItem of aDataItems )
      {
        await callEventHandler( "add", dataItem );
      }
    }

    callEventHandler( "resize"  );

  } // end handleRefresh

  /**
   * Returns the number of entries in the data model
   * @returns {number}
   */
  function size()
  {
    return m_aDataSet.length;

  } // end getSize


  /**
   *  clears the grid of all items
   */
  function clear()
  {
    m_aDataSet = [];
    callEventHandler( "clear"  );

  } // end

  /**
   * Add an array of items to the model
   * @param aDataItemsToAdd
   */
  function addAll( aDataItemsToAdd )
  {

    for ( const dataItem of aDataItemsToAdd )
    {
      add( dataItem );
    }

  } // end addAll()


  /**
   * Sets the data set to that array items specified, and handleRefresh the grid
   * @param aDataItems The new data set list
   */
  async function setDataSet( aDataItems, fnOnComplete )
  {
    m_filterMgr.setDataSet( aDataItems );
    m_aDataSet = aDataItems;
    await handleRefresh( fnOnComplete );  // tell grid to rehresh is html
  }

  /**
   * Returns the dataset
   *
   * @return {*|*[]}
   */
  function handleGetDataSet()
  {
    return m_aDataSet;

  } // end getDataSet()

  /**
   * Sorts the current dataset
   *
   * @param strPropName The property name to sort on
   * @param strDataType The datatype of the property
   * @param bDescending true if descending sort else is ascending sort
   */
  async function handleSort( strPropName, strDataType, bDescending )
  {
    const sortImplementor = new VwSortObjectImplementor( strPropName, strDataType, bDescending );
    m_aDataSet.sort( sortImplementor.sort );

    await handleRefresh();

  } // end sorts the dataset on the data item property to sort

  /**
   * Filters the dataSet based on users callback and repaints the grid based on the filtered data set
   * @param fnCallback The user callback for filtering, if null the fliter is cleard and the grid is refreshed with current data set
   */
  async function filter( fnCallback )
  {
    if ( !fnCallback )
    {
      await handleRefresh();
      return;
    }

    const aFilteredDataSet = m_aDataSet.filter( fnCallback );

    callEventHandler( "clear"  );

    for ( const dataItem of aFilteredDataSet )
    {
      callEventHandler( "add", dataItem  );
    }

    callEventHandler( "resize"  );

  } // end filter()

  /**
   * Applys a filter to the active datasetr
   *
   * @param strFilterName The name of the filter to apply
   * @param valueToMatch  TRhe value to match
   */
  function handleApplyFilter( strFilterName, valueToMatch )
  {
    m_strActiveFilterName = strFilterName;;
    m_activeFilterValue = valueToMatch;

    m_aFilteredDataSet = m_filterMgr.applyFilter( m_aDataSet, strFilterName, valueToMatch );
    handleRefresh();

  } // end handleApplyFilter()

  /**
   * returns array of folder items if they exist else returns empty array
   */
  function getFolders()
  {
    return m_mapFolders.values();

  } // end getFolderItems()

  /**
   * Returns an arrau of data items that the folder contains
   * @param strFolderId
   * @return {*}
   */
  function handleGetFolderItems( strFolderId )
  {
    const folder = m_mapFolders.get( strFolderId );

    if ( !folder )
    {
      throw `getFoldereItems failed for folder id: ${strFolderId} which does not exist`;
    }

    let aFolderItems = folder[m_strFolderItemsIdProp];
    m_aDataSet = aFolderItems;

    if ( m_strActiveFilterName )
    {
      aFolderItems = m_filterMgr.applyFilter( aFolderItems, m_strActiveFilterName, m_activeFilterValue );
    }

    return aFolderItems;

  } // end getFolderItems()

  /**
   * Gets the data item by id
   *
   * @param strId The data items id
   * @returns {*}
   */
  function getDataItem( strId )
  {
    let dataItem = m_mapGridDataSetFlattened.get( strId );

    if ( !dataItem )
    {
      dataItem = m_mapFolders.get( strId );
    }

    return dataItem;

  } // end getDataItem()


  /**
   * Returns the data set flattened (no folder Hierarchy)
   */
  function getDataSetFlattened()
  {
    return m_mapGridDataSetFlattened.values();

  } // end getDataSetFlattened()

  /**
   * Class the event hander with the action and the data
   * @param strEventAction  The event action
   * @param dataItem The data to pass
   */
  async function callEventHandler( strEventAction, dataItem )
  {
    const aEventHandlers = m_mapDataChangeListeners.values();

    for ( const fnEventHandler of aEventHandlers )
    {
      await fnEventHandler( strEventAction, dataItem );
    }

  } // end callEventHandler()


  /**
   * Test for the existence of an obhect in the master data array
   * @param objectTotest
   * @returns {boolean}
   */
  function exists( objectTotest )
  {
    for ( const dataItem of m_aDataSet )
    {
      if ( Object.is( dataItem, objectTotest ) )
      {
        return true;
      }
    }

    return false;

  } // end exists()


  function existsById( strId )
  {
    const findRes = findById( strId );

    return findRes != null;

  } // end existsById()

} // end class VwGridDataModel{}

export default VwGridDataModel;