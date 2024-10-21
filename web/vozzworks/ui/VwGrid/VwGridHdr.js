/*
 * Created by User: petervosburgh
 * Date: 6/21/24
 * Time: 7:47 AM
 * 
 */
import VwExString       from "../../util/VwExString/VwExString.js";
import VwHashMap        from "../../util/VwHashMap/VwHashMap.js";
import VwElementResizer from "../VwElementResizer/VwElementResizer.js";
import VwMetrics from "../VwMetrics/VwMetrics.js";

function VwGridHdr( vwGrid, hdrProps, gridProps )
{
  const self = this;

  const m_mapHdrColsById = new VwHashMap();
  const m_strGridHdrId = vwGrid.getHdrId();
  const m_strGridId = vwGrid.getGridId();
  const m_strGridSplitterId = `${m_strGridId}_splitter`;

  const m_hdrProps = {};

  let   m_strHdrCol;
  let   m_fnOnHdrColClick;
  let   m_hdrColCommonProps;
  let   m_strResizeColSplitterDivTemplate;
  let   m_strGridSplitterDiv;
  let   m_strResizeGridSplitterId;
  let   m_colResized;
  let   m_nOrigSizeInPx;
  let   m_bAllowColResize;

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

    m_strResizeColSplitterDivTemplate =
    `<div id="\${id}_resizerId" class="${gridProps.cssGridHdrResizeColSplitter}"></div>`;

    m_strGridSplitterDiv =
     `<div id="${m_strGridSplitterId}" class="${gridProps.cssGridColResizeSplitter}" style="display:none"></div>`;

  } // end render()

  function configObject()
  {
    render();

    $(`#${m_strGridId}`).append( m_strGridSplitterDiv );

    setupHdrProps();

    setupEventHandlers();

  } // end configObject()

  /**
   * Rebulid the hear html
   */
  function handleRefresh()
  {
    m_bAllowColResize = vwGrid.getViewMgr().getProperty( "allowColResize");
    
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
      $(`#${m_strGridHdrId}_${col.id}`).append( `<span id="${m_strGridHdrId}_${col.id}_value">${col.value}</span>`)
    }

    if ( col.sortType )
    {
      setupSortableColumn( col );
    }

    if ( m_bAllowColResize && !col.noResize )
    {
      installColResizeSplitter(`${m_strGridHdrId}_${col.id}`);
    }

  } // end setupHdrCol()


  /**
   * Handles a sortable column click
   *
   * @param strColId The id of the cher col clicked
   */
  function setupSortableColumn( col )
  {
    let strCanonicalColId = `${col.gridId}_${col.id}`;

    $(`#${strCanonicalColId}`).append( `<img id="sortImg_${strCanonicalColId}" style="display:none"/>`);

    if ( col.value )
    {
      strCanonicalColId += "_value";
      $(`#${strCanonicalColId}`).css( "cursor", m_hdrProps.sortCursor );

    }

    $(`#${strCanonicalColId}`).click( () => handleSortColClicked( col ));

  } // end setupSortableColumn()

  /**
   * Install splitter in the resizer div
   * @param htmlBorderOrColResizerEl
   */
  function installColResizeSplitter( strColId )
  {
    const strResizerColHtml = VwExString.expandMacros( m_strResizeColSplitterDivTemplate, strColId );
    $( `#${strColId}` ).append( strResizerColHtml );

    const colResizerProps = {};
    colResizerProps.metric = "px"; // Always use px for col resize and convert to user metircs on mouseup
    colResizerProps.totalWidth = gridProps.width;

    const colResizer = new VwElementResizer( `${strColId}_resizerId`, m_strGridSplitterId, strColId, colResizerProps );

    colResizer.onResizeComplete( handlesResizedComplete );
    colResizer.onResizeStart( handleResizeStart );

  } // end installColResizeSplitter()

  /*
  /**
   * Event handler on a mouse down event on the column being resized
   *
   * @param strDOMColId The id of the column being resized
   */
  function handleResizeStart( strCanonicalColId )
  {
    const offsetResizeMarker = $(`#${strCanonicalColId}_resizerId`).offset();

    $(`#${strCanonicalColId}_resizerId`).hide();
    $(`#${m_strGridSplitterId}` ).show();
    $(`#${m_strGridSplitterId}` ).height( $(`#${m_strGridId}` ).height() );
    $(`#${m_strGridSplitterId}` ).offset( offsetResizeMarker );

    // Strip off the _container from id to get the column nbr
    const strColId = strCanonicalColId.substring( strCanonicalColId.lastIndexOf( "_" ) + 1);

    const hdrCol = getHdrColFromId( strColId );

    m_colResized = hdrCol;
    m_nOrigSizeInPx = $(`#${strCanonicalColId}`).width();

  } // end handleResizeStart()


  /**
   * Final resize event handler a mouse up event
   *
   * @param strDOMColId The id the column to resize
   * @param nWidthInPixels The width in raw numeric units
   * @param strWidthUnits The new column width in the units specified by the properties. will be px, em or %
   */
  function handlesResizedComplete( strDOMColId, nWidthInPixels, strWidthUnits )
  {
    $(`#${strDOMColId}_resizerId`).show();
    $(`#${m_strGridSplitterId}` ).hide();

    // apply resize to the col just resized

    let strWidth = `${nWidthInPixels}px` ;

    /*
    if ( m_colResized.width.endsWith( "%" ) )
    {
      strWidth = VwMetrics.pixelsToPct( m_strGridId,  nWidthInPixels );
    }
    else
    if ( m_colResized.width.endsWith( "em" ) )
    {
      let strEmRem;
      if ( m_colResized.width.endsWith( "rem" ) )
      {
        strEmRem = "rem";
      }
      else
      {
        strEmRem = "em";
      }
      strWidth = VwMetrics.pixelsToEms( m_strGridId,  nWidthInPixels, strEmRem );
    }

    */

    $(`#${strDOMColId}`).css( "width", strWidth);
    $(`#${strDOMColId}`).css( "min-width",  strWidth );

    //todo setTotalColumnsWidth();

    resizeRowCol( m_colResized.id, nWidthInPixels );

    vwGrid.resize();

  } // end handlesResizedComplete()

  /**
   * Update the new width of the data container
   */
  function setTotalColumnsWidth()
  {
    let nTotColWidth = 0;

    for ( const hdrCol of hdrProps.gridCols.col )
    {
      const nWidth = $(`#${m_strGridHdrId}_${hdrCol.id}`).width();

      nTotColWidth += nWidth;
    }

    $(`#${m_strGridId}_gridBody`).css( "width", `${nTotColWidth}px` );
    $(`#${m_strGridId}_gridBody`).css( "min-width", `${nTotColWidth}px` );

  } //end setTotalColumnsWidth()

  /**
   * Loops through all rows in the grid resizing the column specified by strDOMColId
   *
   * @param strColResizedId  The id the column to resize
   * @param nColResizedWidth The width in raw numeric units
   */
  function resizeRowCol( strColResizedId, nColResizedWidth )
  {
    const rowColView = vwGrid.getViewMgr();

    const aAllRows = vwGrid.getDataModel().getDataSet();

    for ( const row of aAllRows )
    {
      setColSize( rowColView, row, strColResizedId, nColResizedWidth );
    }

  } // end resizeRowCol()

  /**
   * Sets the column size in the specific row
   *
   * @param rowColView  The VwRowColViewMgr Instance
   * @param row The row data containing the columnto update the new size
   * @param strColToResizeId The column id to be rersized
   *
   * @param nWidth
   */
  function setColSize( rowColView, row, strColToResizeId, nWidth  )
  {
    let strRowColId = rowColView.getColContainerId( row, strColToResizeId );

    let strWidth = `${nWidth}px`;   // the default

    /*
    const colHdr = getHdrColFromId( strColToResizeId );

    if ( colHdr.width.endsWith( "%" ) || colHdr.width.endsWith( "m" ) )
    {
      if ( colHdr.width.endsWith( "%" ) )
      {
        strWidth = VwMetrics.pixelsToPct( m_strGridId, nWidth );
      }
      else
      {
        let strEnRem;
        if ( colHdr.width.endsWith( "rem" ) )
        {
          strEnRem = "rem";
        }
        else
        {
          strEnRem = "em";

        }

        strWidth = VwMetrics.pixelsToEms( strRowColId, nWidth, strEnRem );

      }
    }
    colHdr.width = strWidth;
    
     */

    $( `#${strRowColId}` ).css( "width", strWidth );
    $( `#${strRowColId}` ).css( "min-width", strWidth );

  } // end setColSize()


  /**
   * Gets the hdr col object from its col id
   *
   * @param strColId The ColId
   * @return {*}
   */
  function getHdrColFromId( strColId )
  {
    const aHdrCols = self.getHdrCols();
    for ( const hdrCol of aHdrCols )
    {
      if ( hdrCol.id == strColId )
      {
        return hdrCol;
      }
    }

  } // end getHdrColFromId()


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
