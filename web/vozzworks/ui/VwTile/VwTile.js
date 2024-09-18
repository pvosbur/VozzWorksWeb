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
 * ============================================================================================
 *
 */

import VwUiUtils from "../VwCommon/VwUiUtils.js";
import VwExString from "../../util/VwExString/VwExString.js";

VwCssImport( "/vozzworks/ui/VwTile/style");

/**
 *
 * @param strId           Required. The element parent ID.
 * @param objTileData     Required. An object that represents the tile data.
 *
 * @constructor
 */
function VwTile( strId, objTileData, tileProps )
{
  const self = this;
  const m_afnClickHandlers = [];
  const m_afnDblClickHandlers = [];

  let   m_strId = strId;

  let m_objTileData = objTileData;

  let m_parentTileRow;

  let m_mapAdditionalTileAttrs;


  // Public Methods

  this.addAttribute = addAttribute;
  this.applyTemplate = applyTemplate;

  this.click = click;

  this.dblClick = dblClick;

  this.getData = () => objTileData;
  this.getHeight = getHeight;
  this.getId = getId;
  this.setId = ( strId ) => m_strId = strId;
  this.getWidth = getWidth;

  this.setData = setData;

  /**
   * Sets the selection state of a tile
   *
   * @param fSelected true to select, false to de-select
   * @param strCssSelected The css class that will be added/removed based on fSelected
   */
  this.setSelected = function( fSelected, strCssSelected )
  {
    if ( fSelected )
    {
      $("#" + this.getId() ).addClass( strCssSelected );

    }
    else
    {
      $("#" + this.getId() ).removeClass( strCssSelected );

    }
  };


  /**
   * Gets the canonical id of this tile which is the row id and tile id combined
   * @returns {string}
   */
  function getId()
  {
    return m_strId;
  }


  /**
   * Returns the total width of the tile include border and margins
   */
  function getWidth()
  {
    let nWidth = $( "#" + m_strId ).width();


    let strMargin = $( "#" + m_strId ).css( "margin-left" );

    if ( strMargin )
    {
      nWidth += VwUiUtils.convertStringPxToNumber( strMargin );

    }

    strMargin = $( "#" + m_strId ).css( "margin-right" );

    if ( strMargin )
    {
      nWidth += VwUiUtils.convertStringPxToNumber( strMargin );

    }

    const strBorder = $( "#" + m_strId ).css( "border-width" );

    if ( strBorder )
    {
      nWidth += VwUiUtils.convertStringPxToNumber( strBorder );

    }


    return nWidth;
  }


  /**
   * Returns the total height of the tile include border and nargins
   */
  function getHeight()
  {
    let nHeight = $( "#" + m_strId ).height();


    let strMargin = $( "#" + m_strId ).css( "margin-top" );

    if ( strMargin )
    {
      nHeight += VwUiUtils.convertStringPxToNumber( strMargin );

    }

    strMargin = $( "#" + m_strId ).css( "margin-bottom" );

    if ( strMargin )
    {
      nHeight += VwUiUtils.convertStringPxToNumber( strMargin );

    }

    const strBorder = $( "#" + m_strId ).css( "border-width" );

    if ( strBorder )
    {
      nHeight += VwUiUtils.convertStringPxToNumber( strBorder );

    }


    return nHeight;
  }


  /**
   * Add additional attribute to the tile div later when the applyTemplate method is invoked
   *
   * @param strAttr The name of the attribute
   * @param strAttrValue The value of the attribute
   */
  function addAttribute( strAttr, strAttrValue )
  {
    if ( !m_mapAdditionalTileAttrs )
    {
      m_mapAdditionalTileAttrs = new VwHashMap();
    }

    m_mapAdditionalTileAttrs.put( strAttr, strAttrValue );

  }


  /**
   * Applies the template to the object for this tile
   *
   * @param tileRow  The parent VwTileRow object - required
   * @param tileProps The tile properties object - required
   * @param strGridId The id of the invoking grid control - optional
   */
  function applyTemplate( tileRow, tileProps, strGridId, strAddType )
  {
    m_parentTileRow = tileRow;

    const strRowId = tileRow.getId();

    const strTemplate = getTileTemplate( tileProps );


    if ( !strTemplate )          // error if none defined
    {
      throw "An html template must be defined either at the VwTileRow using the tileTemplate property or on the VwTile constructor."
    }

    let strHtmlTile;

    let objHtmlTile = $( "#" + m_strId )[0];

    if ( objHtmlTile )
    {
      $( objHtmlTile ).empty();

      strHtmlTile = replaceMacros( removeParentDiv( strTemplate ), tileProps, strGridId );

      // Update the content
      $( objHtmlTile ).html( strHtmlTile );

    }
    else
    {

      strHtmlTile = replaceMacros( strTemplate, tileProps, strGridId );

      if ( strAddType == "p" )
      {
        $( "#" + strRowId ).prepend( strHtmlTile );
        objHtmlTile = ($( "#" + strRowId + " > div:first-child" ))[0];

      }
      else
      {
        $( "#" + strRowId ).append( strHtmlTile );

        // Retrieve last tile added

        objHtmlTile = ($( "#" + strRowId + " > div:last-child" ))[0];
      }

      if ( !objHtmlTile )
      {
        const kkk = 1;
      }
      $( objHtmlTile ).addClass( "VwTile" );

      objHtmlTile.id = m_strId;

      // add in any other attributes if specified

      if ( m_mapAdditionalTileAttrs )
      {
        const astrKeys = m_mapAdditionalTileAttrs.keys();

        for ( let x = 0, nLen = astrKeys.length; x < nLen; x++ )
        {
          const strAttrName = astrKeys[x];
          const strAttrVal = m_mapAdditionalTileAttrs.get( strAttrName, strAttrVal );

          $( objHtmlTile ).attr( strAttrName, strAttrVal );

        } // end for()

      } // end if


    }

    if ( tileProps.folderIdProp && objTileData[ tileProps.folderIdProp ] == tileProps.folderIdValue  )
    {
      $( "#" + m_strId ).dblclick( handleFolderClicked );
    }
    else
    {
      $( "#" + m_strId ).mousedown( handleTileClicked );
    }

    // Add hiver handler if a cssHover class was specified
    if ( tileProps.cssHover )
    {
      $( "#" + m_strId ).hover( function ()
                                {
                                  $( "#" + m_strId ).addClass( tileProps.cssHover );
                                },
                                function ()
                                {
                                  $( "#" + m_strId ).removeClass( tileProps.cssHover );

                                } );
    }


  } // end applyTemplate

  /**
   * Handle folder double click event
   * @param event
   */
  function handleFolderClicked( event )
  {
    return;

  } // end andleFolderClicked()


  /**
   * Returns the tile template to be applied to the object being added
   */
  function getTileTemplate( objTileProps )
  {
    if ( m_objTileData.htmlTemplate ) // This is a template override for this object
    {
      return m_objTileData.htmlTemplate; // assume tile row passed this to us

    }

    return objTileProps.tileTemplate; // This is the default template defined in the grid properties for all tiles

  }

  /**
   * Replace macros
   * @param strTemplate
   * @param objTileProps
   * @param strGridId
   * @returns {*}
   */
  function replaceMacros( strTemplate, objTileProps, strGridId )
  {
    let strHtmlTile;

    if ( strGridId )
    {
      strHtmlTile = VwExString.replaceAll( strTemplate, "${GRID_ID}", strGridId );
      strHtmlTile = VwExString.expandMacros( strHtmlTile, m_objTileData, objTileProps.defaultForNull );

    }
    else
    {
      strHtmlTile = VwExString.expandMacros( strTemplate, m_objTileData, objTileProps.defaultForNull );

    }

    return strHtmlTile;

  }

  /**
   * Call all event handlers on tile click
   */
  function handleTileClicked( event )
  {

    for ( let x = 0, nLen = m_afnClickHandlers.length; x < nLen; x++ )
    {
      m_afnClickHandlers[x]( event, self );

    }
  }

  /**
   * Call all event handlers on tile click
   */
  function handleTileDblClicked( event )
  {

    for ( let x = 0, nLen = m_afnDblClickHandlers.length; x < nLen; x++ )
    {
      m_afnDblClickHandlers[x]( event, self );

    }
  }


  function click( fnClickHandler )
  {
    m_afnClickHandlers.push( fnClickHandler );

    $( "#" + m_strId ).unbind().click( handleTileClicked );
  }

  function dblClick( fnClickHandler )
  {
    m_afnDblClickHandlers.push( fnClickHandler );
    $( "#" + m_strId ).unbind().dblclick( handleTileDblClicked );

  }


  /**
   * Sets/updates object representing this tile
   * @param objTileData
   */
  function setData( objTileData )
  {
    m_objTileData = objTileData;

  }

  /**
   * Removes the parent DIV element
   * @param strHtml
   * @returns {string}
   */
  function removeParentDiv( strHtml )
  {
    strHtml = strHtml.replace( /<!--(.*?)-->/gm, "" );

    const nPos = strHtml.indexOf( ">" ) + 1;
    const nEndPos = strHtml.lastIndexOf( "</div" );

    return strHtml.substring( nPos, nEndPos );

  }

} // end VwTile{}

export default VwTile;
