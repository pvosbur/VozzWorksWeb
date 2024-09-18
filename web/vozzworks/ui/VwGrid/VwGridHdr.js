/*
 * Created by User: petervosburgh
 * Date: 6/21/24
 * Time: 7:47 AM
 * 
 */
import VwExString   from "../../util/VwExString/VwExString.js";
import VwHashMap    from "../../util/VwHashMap/VwHashMap.js";

function VwGridHdr( vwGrid, hdrProps, gridProps )
{
  const m_mapHdrColsById = new VwHashMap();
  const m_strGridHdrId = vwGrid.getHdrId();
  const m_hdrProps = {};

  let   m_strHdrCol;
  let   m_fnOnHdrColClick;
  let   m_hdrColCommonProps;

  this.onHdrColClick = ( fnOnHdrColClick ) => m_fnOnHdrColClick = fnOnHdrColClick;
  this.getHdrCols = () => hdrProps.gridCols.col;
  this.refresh = handleRefresh;

  configObject();

  /**
   * Render col hdr template
   */
  function render()
  {
    const strStyle="width:\${width};min-width:\${width}";

    m_strHdrCol =
    `<div id="\${gridId}_\${id}" class="VwGridHdrCol" style="${strStyle}"></div>`;

  } // end render()

  function configObject()
  {
    render();

    setupHdrProps();

    setupEventHandlers();

  } // end configObject()

  /**
   * Rebulid the hear html
   */
  function handleRefresh()
  {
    buildHdrCols();

  } // end handleRefresh()


  /**
   * Builds the html for the columns defined in the spec
   */
  function buildHdrCols()
  {
    $(`#${m_strGridHdrId}` ).empty();
    $(`#${m_strGridHdrId}` ).show();

    if ( !Array.isArray( hdrProps.gridCols.col) )
    {
      setupHdrCol( hdrProps.gridCols.col );
      return;
    }

    for ( const col of hdrProps.gridCols.col )
    {
      setupHdrCol( col );
    }

  } // end buildHdrCols()

  /**
   * Setup the column html
   * @param col
   */
  function setupHdrCol( col )
  {
    m_mapHdrColsById.put( col.id, col );
    applyCommonColProps( col );

    col.gridId = m_strGridHdrId;
    col.sortDir = -1;

    const strHdrHtml = VwExString.expandMacros( m_strHdrCol, col );
    $(`#${m_strGridHdrId}`).append( strHdrHtml );

    if ( col.value )
    {
      $(`#${m_strGridHdrId}_${col.id}`).append( `<span>${col.value}</span>`)
    }

    if ( col.sortType )
    {
      setupSortableColumn( col );
    }

  } // end setupHdrCol()


  /**
   * Handles a sortable column click
   *
   * @param strColId The id of the cher col clicked
   */
  function setupSortableColumn( col )
  {
    const strCanonicalColId = `${col.gridId}_${col.id}`;

    $(`#${strCanonicalColId}`).append( `<img id="sortImg_${strCanonicalColId}" style="display:none"/>`);
    $(`#${strCanonicalColId}`).css( "cursor", m_hdrProps.sortCursor );

    $(`#${strCanonicalColId}`).click( () => handleSortColClicked( col ));

  } // end setupSortableColumn()


  /**
   * Click handler when a hdr col is click
   * @param col
   */
  function handleSortColClicked( col )
  {
    hideNonSelectedSortArrows();

    const strCanonicalColId = `${col.gridId}_${col.id}`;

    col.sortDir *= -1;    // toggle sort dir, -1 is descending, 1 is ascending

    if ( col.sortDir < 0  )
    {
      $(`#sortImg_${strCanonicalColId}`).attr( "src", m_hdrProps.sortImgArrowDownUrl );
    }
    else
    {
      $(`#sortImg_${strCanonicalColId}`).attr( "src", m_hdrProps.sortImgArrowUpUrl );
    }

    $(`#sortImg_${strCanonicalColId}`).show();

    if ( m_fnOnHdrColClick )
    {
      m_fnOnHdrColClick( col, col.sortDir < 0 )
    }

  } // end handleSortColClicked()

  /**
   * Hide all sort arrows
   */
  function hideNonSelectedSortArrows()
  {
    for ( const col of hdrProps.gridCols.col )
    {
      const strCanonicalColId = `${col.gridId}_${col.id}`;

      if ( col.sortType )
      {
        $(`#sortImg_${strCanonicalColId}`).hide();
      }
    } // end for()
  } // end hideNonSelectedSortArrows()

  /**
   * Rebuild the grid colum header
   */
  function handleOnViewOpened()
  {
    handleRefresh();

  } // end handleOnViewOpened()

  /**
   * Register event handlers
   */
  function setupEventHandlers()
  {
    vwGrid.onViewOpened( handleOnViewOpened );

  } // end setupEventHandlers()

  /**
   * Config header props
   */
  function setupHdrProps()
  {
    m_hdrProps.cssGridHdr  = "VwGridHdr";
    m_hdrProps.cssGridHdrCol  = "VwGridHdrCol";
    m_hdrProps.sortCursor = "pointer";
    m_hdrProps.sortImgArrowDownUrl = "/vozzworks/images/vw_black_arrow_down.png";
    m_hdrProps.sortImgArrowUpUrl = "/vozzworks/images/vw_black_arrow_up.png";

    if ( hdrProps.common )
    {
      m_hdrColCommonProps = toArray( hdrProps.common.prop );
    }

    $.extend( m_hdrProps, gridProps );

    $(`#${m_strGridHdrId}`).addClass( m_hdrProps.cssGridHdr );

    if ( m_hdrProps.cssUserGridHdr )
    {
      $(`#${m_strGridHdrId}`).addClass( m_hdrProps.cssUserGridHdr );
    }

  } // end setupHdrProps()


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

  /**
   * Add in global props to each col def
   * @param col
   */
  function applyCommonColProps( col )
  {
    if ( m_hdrColCommonProps )
    {
      for ( const prop of m_hdrColCommonProps )
      {
        col[prop.id] = prop.value;
      }
    }
  } // end applyGlobals()
} // end VwGridHdr{{}

export default VwGridHdr;
