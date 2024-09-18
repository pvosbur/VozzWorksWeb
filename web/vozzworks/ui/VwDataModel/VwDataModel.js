/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2020 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 *  ============================================================================================
 *
 */
import VwHashMap from "/vozzworks/util/VwHashMap/VwHashMap.js";
import VwUtils from "/vozzworks/util/VwUtils/VwUtils.js";

/**
 * This is the super class for data models. This class can be subclassed or used as is
 *
 * @param modelProps required - The model props define the id property of an item or a function on the item that returns the item's  id
 *                   property values are: these properties are mutually exclusive
 *                   idProp:String: the name property id for the item
 *                   fnIdProp a function on the item that returns the item's id
 * @constructor
 */
function VwDataModel( modelProps, aDataSet )
{
  if ( arguments.length == 0 )
  {
    return;            // prototype call
  }

  const self = this;
  const m_mapDataChangeListeners = new VwHashMap();
  const m_mapItemsById = new VwHashMap();

  let   m_aDataSet = [];
  let   m_strIdProp;
  let   m_fnIdProp;

  this.registerEventListener = registerEventListener;
  this.add = addDataItem;
  this.addToTop = (dataItem ) => addDataItem( dataItem, true);
  this.remove = removeDataItem;
  this.removeById = removeById;
  this.update = updateDataItem;
  this.clear = clear;
  this.refresh = refresh;
  this.getItemId = getItemId;
  this.get = get;
  this.setDataSet = ( aDataSet ) => m_aDataSet = aDataSet;
  this.getDataSet = () => m_aDataSet;
  this.size = () => m_aDataSet.length;
  this.getIdProp = getIdProp;
  this.existsById = (strId ) => m_mapItemsById.containsKey( strId );

  configObject();

  function configObject()
  {
    if ( aDataSet )
    {
      m_aDataSet = aDataSet;
    }

    if ( !modelProps )
    {
      m_strIdProp = "id";
      return;
    }


    if ( modelProps.fnIdProp )
    {
      m_fnIdProp = modelProps.fnIdProp;
    }
    else
    if ( modelProps.idProp )
    {
      m_strIdProp = modelProps.idProp ;
    }
    else
    {
       throw "Model props must define either the idProp or the fnIdProp";
    }

    if ( m_aDataSet )
    {
      buildDataMap();
    }
  } // end configObject()


  function buildDataMap()
  {
    for ( const dataItem of m_aDataSet )
    {
      const strItemId = getItemId( dataItem );
      m_mapItemsById.put( strItemId, dataItem );

    }
  } // end buildDataMap()


  /**
   * Ret5ursnthe item id prop that was specified in the constructor
   * @return {*}
   */
  function getIdProp()
  {
    if ( m_fnIdProp )
    {
      return m_fnIdProp;
    }

    return m_strIdProp;

  } // end getIdProp()


  /**
   * Registers a data change listener
   *
   * @param listenerId unique id for the listenerhandler
   * @param fnHandler The event callback handler which takes the form myCallBack( eventid, eventData ) where eventId will be one of<br/>
   *        "add", "update", "del", "clear" and eventData will be a VwTreeNode instance
   */
  function registerEventListener( listenerId, fnHandler )
  {
    m_mapDataChangeListeners.put( listenerId, fnHandler );
  }

  /**
   *  Clears the tree of existing entries and re-adds the elements in the data set
   */
  function refresh()
  {
    callEventHandler( "clear"  );

    for ( const dataItem of m_aDataSet )
    {
      callEventHandler( "add", dataItem  );
    }

    // Notify all items added
    callEventHandler( "addComplete" );

  } // end refresh ()

  /**
   * Class the event handler with the action and the data
   * @param strEventAction  The event action
   * @param dataItem The data to pass
   */
  function callEventHandler( strEventAction, dataItem )
  {
    const aEventHandlers = m_mapDataChangeListeners.values();

    for ( const fnEventHandler of aEventHandlers )
    {
      fnEventHandler( strEventAction, dataItem );
    }

  } // end callEventHandler()


  /**
   * Removes all data items
   */
  function clear()
  {
    m_aDataSet = [];
    m_mapItemsById.clear();

    callEventHandler( "clear"  );

  } // end clear()

  /**
   * Returns the id of an item based on the id props set in the modelProps
   * @param item
   * @return {*}
   */
  function getItemId( item )
  {

    if ( m_fnIdProp )
    {
      return item[m_fnIdProp]();
    }
    else
    {
      return VwUtils.getObjProperty( item, m_strIdProp );
      //item[m_strIdProp];
    }

  } // end getItemId()

  /**
   * Gets the item by id
   *
   * @param strId The id of the item to get
   * @return {*}
   */
  function get( strId )
  {
    return m_mapItemsById.get( strId );
  }

  /**
   * Adds data item to the master dataset and calls the add event handler
   * @param dataItem
   */
  function addDataItem( dataItem, bPutAtTop )
  {
    const strItemId = getItemId( dataItem );
    m_mapItemsById.put( strItemId, dataItem );

    if ( bPutAtTop )
    {
      m_aDataSet.unshift( dataItem );

    }
    else
    {
      m_aDataSet.push( dataItem );
    }

    if ( m_mapDataChangeListeners.size() == 0 )
    {
      return;
    }

    callEventHandler( "add",  dataItem );

  } // end


  /**
   * Updates a dataitem in the master dataset
   *
   * @param dataItemToUpdate The data item in the dataset to update
   */
  function updateDataItem( dataItemToUpdate )
  {
    const nDataItemNdx = findDataItemIndex( dataItemToUpdate );

    if ( nDataItemNdx < 0 )
    {
      throw "Data Item Id: " + dataItemToUpdate[modelProps.idProp] + " does not exist, cannot update";
    }

    m_aDataSet[ nDataItemNdx] = dataItemToUpdate;

    callEventHandler( "update", dataItemToUpdate );

  } // end update()

  /**
   * Removes a dataitem from the master dataset
   *
   * @param dataItemToRemove The data item object to remove
   */
  function removeDataItem( dataItemToRemove )
  {
    const nDataItemNdx = findDataItemIndex( dataItemToRemove );

    if ( nDataItemNdx < 0 )
    {
      throw "Data Item Id: " + dataItemToRemove[modelProps.idProp] + " does not exist, cannot remove";
    }

    m_aDataSet.splice( nDataItemNdx, 1 );

    callEventHandler( "del", dataItemToRemove );

  } // end removeDataItem()


  /**
   * Removes an item by its id
   *
   * @param strId The id of the item to remove
   */
  function removeById( strId )
  {
    const itemToRemove = m_mapItemsById.get( strId );

    if ( !itemToRemove )
    {
      throw `Item ${strId} does not exist. It cannot be removed.`
    }

    m_mapItemsById.remove( strId );

    removeDataItem( itemToRemove );

  } // end removeById()


  /**
   * Finds the index of the data item
   * @param dataItem The data item to find the index in the dataset
   * @returns {number} the index of the data item or -1 if not found
   */
  function findDataItemIndex( dataItem )
  {
    // The  index of the data item to remove

    for ( let x = 0; x < m_aDataSet.length; x++ )
    {
      const dataSetItemId = getItemId(  m_aDataSet[ x ] );
      const dataItemId = getItemId( dataItem );

      if ( dataSetItemId == dataItemId )
      {
        return x;

      }
      
    } // end for()

    return -1;  // Not found

  } // end findDataItemIndex()

} // end VwDataModel{}

export default VwDataModel;
