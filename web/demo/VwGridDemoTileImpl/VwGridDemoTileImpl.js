/*
 * Created by User: petervosburgh
 * Date: 8/1/24
 * Time: 2:23 PM
 * 
 */

import VwDate     from "../../vozzworks/util/VwDate/VwDate.js";
import VwExString from "../../vozzworks/util/VwExString/VwExString.js";
import VwCheckBox from "../../vozzworks/ui/VwCheckBox/VwCheckBox.js";

VwCssImport( "/demo/VwGridDemoTileImpl/style");

function VwGridDemoTileImpl( strParentId, strTileId, vwGrid, dataItem, tileProps )
{
  let m_strTileHtml;

  configObject();

  /**
   * Constructor Impl
   */
  function configObject()
  {
     render();

     if ( tileProps.prepend )
     {
       $(`#${strParentId}` ).prepend( m_strTileHtml );
     }
     else
     {
       $( `#${strParentId}` ).append( m_strTileHtml );
     }

     setupCheckBox();

     checkSelectedState( dataItem.id, dataItem.isSelected );
  } // end configObject()

  /**
   * Render htmlcontent
   */
  function render()
  {
    m_strTileHtml =
     `<div id="${strTileId}" class="VwDemoTile">
        <div id="hdr_${strTileId}" class="VwDemoTileHdr">
          <span>${dataItem.title}</span>
        </div>
        <div class="VwDemoTileBody">
          <div class="VwDemoTileBodyItem">
            <span>Upload Date:</span>
            <span>${VwDate.format(dataItem.uploadDate, "MMM dd hh:mm aa")}</span>
          </div>
          <div class="VwDemoTileBodyItem">
            <span>Size:</span>
            <span>${formatSize(dataItem.size)}</span>
          </div>
          <div class="VwDemoTileBodyItem">
            <div id="chkBox_${strTileId}" class="CheckBox"></div>
          </div>
        </div>
      </div>`;

  } // end render()

  function formatSize( nSize )
  {
    if ( nSize == 0 )
    {
      return "--";
    }

    return VwExString.formatSize( nSize );

  } // end formatSize()

  /**
   * Setup the isSelected check box
   */
  function setupCheckBox()
  {
    const isSelectedCheckBox = new VwCheckBox( `chkBox_${strTileId}`, dataItem.isSelected, tileProps, dataItem );
    isSelectedCheckBox.onSelectionChange( (bSelected ) => handleOnCheckBoxChange( dataItem.id, bSelected ) );

  } // end setupCheckBox()

  function handleOnCheckBoxChange( strCheckId, bSelected )
  {
     checkSelectedState( strCheckId, bSelected );
  }

  function checkSelectedState( strCheckId, bSelected )
  {
    if ( bSelected )
    {
      $(`#hdr_${strTileId}` ).addClass( "Red" );
    }
    else
    {
      $(`#hdr_${strTileId}` ).removeClass( "Red" );
    }

  }
} // end VwGridDemoTileImpl{}

export default VwGridDemoTileImpl;
