/*
 * Created by User: petervosburgh
 * Date: 8/1/24
 * Time: 11:23 AM
 * 
 */
import VwGridTileRow from "./VwGridTileRow.js";
import VwHashMap from "../../util/VwHashMap/VwHashMap.js";

function VwTileViewMgr( vwGrid, gridProps, tileProps, implProps )
{
  const self = this;
  const m_strGridId = vwGrid.getGridId();
  const m_strGridBodyId = vwGrid.getBodyId();
  const m_mapPostTileAddListeners = new VwHashMap();
  const m_mapDataItemDomIds = new VwHashMap();

  let   m_aTileRows = [];
  let   m_dataModel = vwGrid.getDataModel();
  let   m_dataIdProp;

  this.openFolder = handleOpenFolder;
  this.setDataModel = handleSetDataModel;
  this.add = handleAddTile;
  this.remove = handleRemoveItem;
  this.update = handleUpdateItem;
  this.clear  = handleClearView;
  this.onPostItemAdd = ( fnPostItemAddistener ) => m_mapPostTileAddListeners.put( fnPostItemAddistener, fnPostItemAddistener );
  this.getDomItemId = (dataItem ) => m_mapDataItemDomIds.get( dataItem[m_dataIdProp] );
  this.refresh = handleRefresh;

  /**
   * Sets the data model
   * @param dataModel
   *
   */
  function handleSetDataModel( dataModel )
  {
    m_dataModel = dataModel;
    m_dataIdProp = m_dataModel.getDataIdProp();

  } // end handleSetDataModel()


  /**
   * Adds a new tile
   *
   * @param dataItem the tiles data item
   * @param bPrepend if true prepend the item to front of tile row
   */
  async function handleAddTile( dataItem, bPrepend )
  {
    let tileRow;
    if( m_aTileRows.length == 0 || m_aTileRows[m_aTileRows.length -1].isFull() )
    {
      tileRow = await new  VwGridTileRow( m_strGridBodyId, vwGrid, m_aTileRows.length, tileProps, implProps );
      m_aTileRows.push( tileRow );
    }
    else
    {
      tileRow = m_aTileRows[m_aTileRows.length -1];
    }

    m_mapDataItemDomIds.put( dataItem[m_dataIdProp], `${tileRow.getDomTileId()}_${dataItem[m_dataIdProp]}` );

    await tileRow.add( dataItem, bPrepend );

    firePostTileAddEvent( dataItem );

  } // end handleAddTile()

  function handleRemoveItem()
  {

  } // end handleRemoveItem()

  function handleUpdateItem()
  {

  } // end handleUpdateItem()

  function handleClearView()
  {
    m_aTileRows = [];
    m_mapDataItemDomIds.clear();

    $(`#${m_strGridBodyId}` ).empty();

  } // end handleClearView()


  async function handleRefresh()
  {
    handleClearView();

    const aDataItems = m_dataModel.getDataSet();

    let nViewPortSize = tileProps.viewPortSize;
    let nNbrTiles = 0;

    for ( const dataItem of aDataItems )
    {
      if ( nViewPortSize  )
      {

        if ( ++nNbrTiles > nViewPortSize || nNbrTiles > aDataItems.length )
        {
          break;
        }

        await handleAddTile( dataItem );

      }
      else
      {
        await handleAddTile( dataItem );
      }
    } // end for()

  } // end handleRefresh()

  /**
   * Open the request folder
   *
   * @param folderDataItem
   */
  async function handleOpenFolder( folderDataItem )
  {
    const aFolderItems = m_dataModel.getFolderItems( folderDataItem[m_dataIdProp] );

    handleClearView();

    let nViewPortSize = tileProps.viewPortSize;
    let nNbrTiles = 0;

    for ( const dataItem of aFolderItems )
    {
      if ( nViewPortSize )
      {
        if ( ++nNbrTiles > nViewPortSize || nNbrTiles > aFolderItems.length )
        {
          break
        }

        await handleAddTile( dataItem );
      }
      else
      {
        await handleAddTile( dataItem );
      }
    }  // end for()

  } // end handleOpenFolder()

  /**
   * Call listeners callback for row just added
   * @param dataRow The data item added
   */
  function firePostTileAddEvent( dataRow )
  {
    for( const fnPostTileAddListener of m_mapPostTileAddListeners.values() )
    {
      fnPostTileAddListener( dataRow );
    }

  } // end firePostTileAddEvent()


}

export default VwTileViewMgr;

