/*
 * Created by User: petervosburgh
 * Date: 8/1/24
 * Time: 1:51 PM
 * 
 */
import {VwClass}    from "../../util/VwReflection/VwReflection.js";
import VwPromiseMgr from "../../util/VwPromiseMgr/VwPromiseMgr.js";
import VwHashMap    from "../../util/VwHashMap/VwHashMap.js";

function VwGridTileRow( strParentId, vwGrid, strTileId, tileProps, implProps )
{
  const self = this;
  const m_aTiles = [];
  const m_nMaxTiles = Number( tileProps.maxRowTiles );
  const m_strDomTileId = getDomlTileId();
  const m_dataIdProp = vwGrid.getDataModel().getDataIdProp();

  let m_strTileRowHtml;
  let m_implClass;
  let m_implConstructor;
  let m_promiseMgr;

  this.isFull = () => m_aTiles.length == m_nMaxTiles;
  this.add = handleAddTile;
  this.getDomTileId = () => m_strDomTileId;

  /**
   * Constructor impl
   */
  async function configObject()
  {
    render();

    if ( tileProps.prepend )
    {
      $( `#${strParentId}` ).prepend( m_strTileRowHtml );
    }
    else
    {
      $( `#${strParentId}` ).append( m_strTileRowHtml );
    }

    if ( tileProps.tileImplClass.endsWith( "js") )
    {
      m_implClass = await VwClass.forModule( tileProps.tileImplClass );
    }
    else
    {
      m_implClass = await VwClass.forName( tileProps.tileImplClass );
    }

    m_implConstructor = m_implClass.getConstructor();

    m_promiseMgr.success( self );

  } // end configObject()


  /**
   * REdnder tile row html
   */
  function render()
  {
    m_strTileRowHtml =
     `<div id="${m_strDomTileId}" class="${tileProps.cssTileRow} VwGridTileRow VwScrollableContent"></div>`;

  } // end render()


  /**
   * Adds the tile to the tile ropw
   *
   * @param dataItem The data item that populates the tile
   */
  async function handleAddTile( dataItem, bPrePend )
  {
    const strTileId = `${m_strDomTileId}_${dataItem[m_dataIdProp]}`;
    const tile = await m_implConstructor.newInstance( [m_strDomTileId, strTileId, vwGrid, dataItem, implProps]);

    if ( tileProps.prepend || bPrePend )
    {
      m_aTiles.unshift( tile );
    }
    else
    {
      m_aTiles.push( tile );
    }

  } // end addTile()


  /**
   * Makes row id for this tile row
   * @returns {string}
   */
  function getDomlTileId()
  {
    return `${strParentId}_tileId_${strTileId}`;
  }


  return new Promise( ( success, fail ) =>
                      {
                        m_promiseMgr = new VwPromiseMgr( success, fail, configObject );
                      });

} // end VwGridTileRow{}

export default VwGridTileRow;
