
/**
 * This object holds and manages a row of VwTile objects.
 *
 * @param strParentId       Required. The parent id of this tile row.
 * @param strRowId          Required. The id for this tile row.
 *
 * @param objTileRowProps:  Tile row properties - may be null. Property definitions follow:
 *  cssTileRow: String - Name of one or more space delimited class names. Default is "VwTileRow".
 *  tileTemplate: String - An HTML tile template to be applied to all tiles in the row unless overridden in the VwTile constructor.
 *  tileGap: String/Integer - The space gap between tiles. this may be an integer which defaults to pixels or a string with measurement units like ".2em".
 *
 * @param strAddType: String - "p" prepends the new tile row is added to the top of the grid else its added to the bottom. The default is false.
 *
 * @constructor
 */
function VwTileRow( strParentId, strRowId, objTileRowProps, strAddType )
{

  const m_strParentId = strParentId;
  const m_strRowId = strRowId;

  const m_aTiles = [];

  let   m_objProps = objTileRowProps;

  // Public methods

  this.addTile = addTile;
  this.addComponent = addComponent;

  this.findTile = findTile;

  this.getId = getId;
  this.getTileCount = getTileCount;

  this.removeTile = removeTile;

  this.updateTile = updateTile;

  buildTileRowProps( objTileRowProps );

  const strTileRowHtml =
    `<div id="${getId()}" class="${m_objProps.cssTileRow} VwScrollableContent"></div>`;

  if ( strAddType && strAddType == "p" )
  {
    $( `#${m_strParentId}` ).prepend( strTileRowHtml );
  }
  else
  {
    $( `#${m_strParentId}` ).append( strTileRowHtml );
  }

  /**
   * Returns the id for this tile row
   * @returns {string}
   */
  function getId()
  {
    return `${m_strParentId}_rowId_${m_strRowId}`;
  }


  /**
   * Adds a new VwTile object
   * @param vwTile    The VwTile instance to add
   * @param strGridId
   * @param strAddType
   */
  function addTile( vwTile, strGridId, strAddType )
  {

    const strTileId = vwTile.getId();

    const objHtmlTile = $( "#" + strTileId )[0];

    if ( objHtmlTile )
    {
      console.log( "Tile Id: " + strTileId + " already exists and cannot be added", "Duplicate Id" );
      return;
    }

    if ( strAddType == "p" )
    {
      m_aTiles.unshift( vwTile );

    }
    else
    {
      m_aTiles.push( vwTile );

    }

    vwTile.applyTemplate( this, m_objProps, strGridId, strAddType );

    if ( m_objProps.tileGap )
    {
      $( ".VwTile" ).css( "margin-left", m_objProps.tileGap );
      $( ".VwTile:first-child" ).css( "margin-left", 0 );

    }

  } // end addTile

  /**
   * Adds a component that renders the tile html
   * @param vwComponent The VeComponent to add
   */
  function addComponent( vwTile, strGridId, strAddType )
  {
    if ( strAddType == "p" )
    {
      m_aTiles.unshift( vwTile );

    }
    else
    {
      m_aTiles.push( vwTile );

    }

    const vwComponent = vwTile.getData();
    const strId = vwTile.getId();

    vwComponent.render( strId );

  } // end addComponent()


  /**
   * Updates an existing tile from updated data object
   *
   * @param vwTile the tile object to update
   * @param objTileData The updated tile data object
   * @param strGridId The grid id if grid is managing the tiles
   */
  function updateTile( vwTile, objTileData, strGridId )
  {
    vwTile.setData( objTileData );

    vwTile.applyTemplate( this, m_objProps, strGridId );

  } // end addTile


  /**
   * Find the tile in the tile row by its object representing the tile
   * @param objTile The objeject identifying a tyle
   * @returns The VwTile object if the tile exists in this row, null otherwise
   */
  function findTile( objTile )
  {
    for ( let x = 0, nLen = m_aTiles.length; x < nLen; x++ )
    {
      if ( isEqual( m_aTiles[x].getData(), objTile ) )
      {
        return {vwTile: m_aTiles[x], vwTileNdx: x};
      }
    }

    return null;

  }

  /**
   * Return the tile count
   * @returns {Number}
   */
  function getTileCount()
  {
    return m_aTiles.length;
  }

  /**
   * Compares two objects
   * @param obj1
   * @param obj2
   *
   * @returns true if theu are equal, false otherwise
   */
  function isEqual( obj1, obj2 )
  {
    if ( m_objProps.dataIdProp )
    {
      if ( obj1[m_objProps.dataIdProp] == obj2[m_objProps.dataIdProp] )
      {
        return true;
      }
      else
      {
        return false;
      }

    }
    else
    {
      return obj1 == obj2;
    }

  }

  /**
   * Initialize VwTileRow object properties
   * @param objTileRowProps
   */
  function buildTileRowProps( objTileRowProps )
  {
    m_objProps = {};
    m_objProps.cssTileRow = "VwTileRow";

    if ( objTileRowProps )
    {
      $.extend( m_objProps, objTileRowProps );
    }

    if ( m_objProps.tileGap )
    {
      m_objProps.tileGap = VwExString.convertToPixels( m_objProps.tileGap );
    }

  }


  /**
   * Removes a tile from the tile row
   *
   * @param strTileId The id of the tile to remove
   */
  function removeTile( strTileId )
  {
    var strCanonicalId = m_strRowId + "_" + strTileId;

    for ( let x = 0, nLen = m_aTiles.length; x < nLen; x++ )
    {
      if ( m_aTiles[x].getId() == strCanonicalId )
      {
        m_aTiles.slice( x, 1 );
        return;
      }
    }
  }


} // end VwTileRow{}

export default VwTileRow ;