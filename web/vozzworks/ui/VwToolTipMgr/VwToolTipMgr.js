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
 *  ============================================================================================
 *
 */

import VwHashMap from "../../util/VwHashMap/VwHashMap.js";
import VwExString from "../../util/VwExString/VwExString.js";

VwCssImport( "/vozzworks/ui/VwToolTipMgr/style");

/**
 *
 * @param toolTipProps
 * @constructor
 */
function VwToolTipMgr( vwPropertyMgr, toolTipProps )
{
  const self = this;
  const m_toolTipProps = configProps();
  const GAP = 2;
  const m_mapToolTipsById = new VwHashMap();

  let   m_vwTipEle;
  let   m_vwHtmlTipEle;
  let   m_timeOutId;
  let   m_bNoShowTip;
  let   m_strTipShowingId;

  this.load = load;
  this.remove = remove;
  this.removeById = removeById;
  this.hide = hide;

  setup();

  /**
   * Setup tooltip engine and get all html elements for this page that have tooltip attributes
   */
  function setup()
  {

    // add ToolTip element to body if it doesnt exist this is a simple text only tooltip
    if ( !$("#vwToolTip")[0] )
    {
       m_vwTipEle = $( "<span>" ).attr( "id", "vwToolTip" ).attr( "style", "position:absolute;z-index:99999;display:none" ).addClass( m_toolTipProps.css );
      $( "body" ).append( m_vwTipEle );
    }

    // Create an html supplied tooltip

    if ( !$("#vwHtmlToolTip")[0] )
    {
      const strHtmlToolTip =
        `<div id="vwHtmlToolTip" class="VwHtmlToolTip" style="display:none;">
           <div id="vwHtmlToolTipTopFiller"></div>
           <div id="vwHtmlToolTipContent"></div>
         </div>`;

      $( "body" ).append( strHtmlToolTip );

      m_vwHtmlTipEle = $("#vwHtmlToolTip")[0];

    }

    load();

  } // end setup()

  /**
   * Loads all htmlElements that specify the tooltip attribute
   *
   * @param toolTipElement a single tooltip element i.e an html elment that
   */
  function load( toolTipElement )
  {
    // Get all htmlElements that have a tooltip attribute
    let aToolTipsElements;

    if ( !toolTipElement )
    {
      aToolTipsElements= $("[tooltip]");
    }
    else
    {
      aToolTipsElements = [toolTipElement];
    }

    installToolTipHandlers( aToolTipsElements );

  }

  /**
   * Removes a tooltip by an html element instance
   *
   * @param toolTipElement html element instance
   */
  function remove( toolTipElement )
  {
    const strToolTipId = $( toolTipElement ).attr( "id");

    m_mapToolTipsById.remove( strToolTipId );

    $(toolTipElement).unbind( "mouseenter mouseleave" );

    setTimeout( () =>
                {
                  m_vwTipEle.hide();
                }, 1000 );
    $(m_vwTipEle).hide();

  } // end remove()


  /**
   * Removes a tooltip by its element id
   *
   * @param strTollTipId The element id of the toooltip tpo remove
   */
  function removeById( strTollTipId )
  {
    const eleToolTip = $(`#${strTollTipId}`)[0];

    m_mapToolTipsById.remove( strTollTipId );

    $(eleToolTip).unbind( "mouseenter mouseleave" );

    $(m_vwTipEle).hide();

  }

  /**
   * Hides the tooltip sometimes on button clicks, the hover out doesnt get fired
   * @param strId
   */
  function hide()
  {
    $(m_vwTipEle).hide();

  } // end hide()


  /**
   *  Add hover logic for all found tooltip elemnts
   */
  async function installToolTipHandlers( aToolTipsElements )
  {
    for ( const toolTipEle of aToolTipsElements )
    {
      const strToolTipId = $( toolTipEle ).attr( "id");

      m_mapToolTipsById.put( strToolTipId, toolTipEle );
      let bIsHtmlTip = false;

      $( toolTipEle ).hover( ( evt ) =>  // Hover In
                             {
 
                               const posTipElement = $( evt.currentTarget ).offset();
                               const nHeight = $( evt.currentTarget ).height();
                               const nWidth = $( evt.currentTarget ).width();

                               const strToolTipSpec = $( evt.currentTarget ).attr( "tooltip" );

                               if ( ! strToolTipSpec ) // tooltip was removed
                               {
                                 return;
                               }

                               if ( !m_mapToolTipsById.containsKey( strToolTipId))
                               {
                                 return; // tooltip was removed
                               }

                               m_strTipShowingId = strToolTipId;

                               m_bNoShowTip = false;

                               m_timeOutId = setTimeout( () =>
                                           {
                                             if ( m_bNoShowTip )
                                             {
                                               return;
                                             }

                                             if ( isHtmlToolTip( strToolTipSpec ) )
                                             {
                                               bIsHtmlTip = true;
                                               processHtmlToolTip( posTipElement, nWidth, nHeight, strToolTipSpec );
                                               return;

                                             }
                                             else
                                             {
                                               $( m_vwTipEle ).text( "" );
                                               $( m_vwTipEle ).css( "display", "flex" );

                                               setTimeout( () => $( m_vwTipEle ).hide(), 2000 );
                                             }

                                             processTextToolTip( posTipElement, nWidth, nHeight, strToolTipSpec );

                                           }, 1000 );

                             }, () =>    // Hover Out
                             {
                               // Dont remove html tool tip here on hover out. The htmltoolTip hover out will do that
                               m_bNoShowTip = true;
                               m_strTipShowingId = "";
                               clearTimeout( m_timeOutId );

                               if ( bIsHtmlTip )
                               {
                                 return;
                               }

                               $( m_vwTipEle ).text( null );
                               $( m_vwTipEle ).hide();

                             });

    } // end for()

  } // end

  /**
   * return true if tooltip is defined by an html template
   * @param strToolTipSpec
   * @return {boolean}
   */
  function isHtmlToolTip( strToolTipSpec )
  {
    return strToolTipSpec.indexOf( "html!") >= 0;

  }

  /**
   * Process text only tooltip placement for the tooltip spec
   *
   * @param posTipElement The position of the element with the tooltip attribute
   * @param nWidth The width of the element with the tooltip attribute
   * @param nHeight The height of the element with the tooltip attribute
   * @param strToolTipSpec The tooltip specification, may contain attribute:value enteries separated by semicolans
   */
  function processTextToolTip( posTipElement, nWidth, nHeight, strToolTipSpec )
  {
    if ( !posTipElement )
    {
      return;
   }

    const astrSpecPieces = strToolTipSpec.split( ";");

    setToolTipClass( m_toolTipProps.css );

    if ( astrSpecPieces.length == 1 )
    {
      showTextTip( posTipElement, nWidth, nHeight, astrSpecPieces[ 0 ] );
    }
    else
    {
      processToolTipSpec( posTipElement, nWidth, nHeight, astrSpecPieces );
    }

  } // end processTextToolTip()


  /**
   * Process html tooltips
   * @param posToolTipEle
   * @param nWidth
   * @param nHeight
   * @param strToolTipSpec
   */
  function processHtmlToolTip( posToolTipEle, nWidth, nHeight, strToolTipSpec )
  {
    let strHtmlContent;
    let posToolTip;

    const astrSpecPieces = strToolTipSpec.split( ";");

    for ( const attr of astrSpecPieces )
    {
      const astrAttrPieces = attr.split( "!");

      switch( astrAttrPieces[ 0 ] )
      {
        case "pos":

          posToolTip = getDefaultToolTipPosition( posToolTipEle, nWidth, nHeight );
          break;

        case "html":

          strHtmlContent = astrAttrPieces[ 1 ];
          break;

      } // end switch()

    } // end for()

    if ( !posToolTip )
    {
      posToolTip = { top:posToolTipEle.top + nHeight + 2, left:posToolTipEle.left };
    }


    $( m_vwHtmlTipEle ).css( "top", posToolTipEle.top);
    $( m_vwHtmlTipEle ).css( "left", posToolTipEle.left);

    $(m_vwHtmlTipEle).width( nWidth );

    // Set tthe tooltip top filler to height of the launcher element
    $("#vwHtmlToolTipTopFiller").height( nHeight );
    $("#vwHtmlToolTipTopFiller").width( nWidth );

    $("#vwHtmlToolTipContent").empty();

    $("#vwHtmlToolTipContent").append( strHtmlContent );


    $( m_vwHtmlTipEle).show();

    $( m_vwHtmlTipEle ).hover( null, () =>
    {
      $("#vwHtmlToolTipContent").empty();
      $(m_vwHtmlTipEle).hide();

    });

  } // end processHtmlToolTip()


  /**
   * Process the tooltip specification
   *
   * @param posToolTipEle The position of the element with the tooltip attribute
   * @param nWidth The width of the element with the tooltip attribute
   * @param nHeight The height of the element with the tooltip attribute
   * @param astrSpecPieces Array of atttribute:value pairs
   */
  function processToolTipSpec( posToolTipEle, nWidth, nHeight, astrSpecPieces )
  {
    let strToolTipText;
    let posToolTip;

    for ( const strToolTipAttr of astrSpecPieces )
    {
      const astrAttrVal = strToolTipAttr.split( ":" );

      if ( astrAttrVal.length != 2 )
      {
        throw "Invalid Tooltip attribute:value for " + strToolTipAttr + ". Expecting for attribute:value";
      }


      switch( astrAttrVal[ 0 ] )
      {
        case "pos":

          posToolTip = setToolTipToPosition( posToolTipEle, nWidth, nHeight, astrAttrVal[ 1 ] );
          break;

        case "css":

          setToolTipClass( astrAttrVal[ 1 ] );
          break;

        case "text":

          strToolTipText = astrAttrVal[ 1 ];
          $( m_vwTipEle ).text( getTextValue( strToolTipText ) );
          break;

        default:

          throw "Invalid Tooltip attribute for " + strToolTipAttr + ". Expecting one of pos,css text";

      } // end switch

    } // end for()


    if ( !strToolTipText )
    {
      throw "No Tooltip text attribute specified for " + strToolTipAttr + ".";
    }

    if ( !posToolTip )
    {
      posToolTip = getDefaultToolTipPosition( posToolTipEle, nWidth, nHeight );
    }

    $( m_vwTipEle ).offset( posToolTip );

    $( m_vwTipEle ).text( getTextValue( strToolTipText ));


  } // end processToolTipSpec()


  /**
   * Sets the tool tip position specifed the strPos attribute value
   *
   * @param posToolTipEle The position of the element with the tooltip attribute
   * @param nWidth The width of the element with the tooltip attribute
   * @param nHeight The height of the element with the tooltip attribute
   * @param strPos The position of the tooptip values are left,right,top,bottom and center
   */
  function setToolTipToPosition( posToolTipEle, nWidth, nHeight, strPos )
  {
    let posToolTip;

    const nPaddingTop = getCssVal( "padding-top");
    const nPaddingBot = getCssVal( "padding-bottom");
    const nPaddingLeft = getCssVal( "padding-left");
    const nPaddingRight = getCssVal( "padding-right");

    const nWidthVwToolTip = $(m_vwTipEle).width() + nPaddingLeft + nPaddingRight;
    const nHeightVwToolTip = $(m_vwTipEle).height() + nPaddingTop + nPaddingBot ;

    switch( strPos )
    {
      case "left":

        return { left:posToolTipEle.left - nWidthVwToolTip - GAP, top:centerHeight(  posToolTipEle, nHeight, nHeightVwToolTip )};

      case "right":

        return { left:posToolTipEle.left + nWidth + GAP, top:centerHeight(  posToolTipEle, nHeight, nHeightVwToolTip )};

      case "top":

        return { left:centerWidth(posToolTipEle, nWidth, nWidthVwToolTip), top:posToolTipEle.top - nHeightVwToolTip - GAP};

      case "bottom":

        return { left:centerWidth(posToolTipEle, nWidth, nWidthVwToolTip), top:posToolTipEle.top + nHeight + GAP};

      case "center":

        return centerInBrowser( nWidthVwToolTip, nHeightVwToolTip  );


      default:

        throw "Invalid tool tip pos attribute: " + strPos + ". Must be one of left,rigth,top,bottom or center";

    } // end switch()


  }

  /**
   * Centers the top to the tool tip element
   * @param posToolTipEle
   * @param nHeightVwToolTip
   */
  function centerHeight( posToolTipEle, nTipHeight, nHeightVwToolTip )
  {
    let nTop = nTipHeight / 2 - nHeightVwToolTip / 2;

    nTop += posToolTipEle.top;

    return nTop;

  } // end centerHeight()

  /**
   *
   * @param posToolTipEle
   * @param nTipWidth
   * @param nWidthVwToolTip
   * @returns {number}
   */
  function centerWidth( posToolTipEle, nTipWidth, nWidthVwToolTip  )
  {
    let nLeft = nTipWidth / 2 - nWidthVwToolTip / 2;

    nLeft -= posToolTipEle.left;

    if ( nLeft < 0 )
    {
      nLeft = GAP;
    }

    return nLeft;

  } // end centerWidth()

  /**
   *
   * @param nWidthVwToolTip
   * @param nHeightVwToolTip
   */
  function centerInBrowser( nWidthVwToolTip, nHeightVwToolTip  )
  {

  } // end centerInBrowser()


  /**
   * Sets the VwToolTipMgr class to the one specified
   * @param strToolTipClassName The name of the class to be added to the VwToolTipMgr Element
   */
  function setToolTipClass( strToolTipClassName )
  {
    // Remove existing class
    $( m_vwTipEle ).attr( "class", null );
    $( m_vwTipEle ).addClass( strToolTipClassName );

  } // end setToolTipClass()


  /**
   *
   * @param posTipElement The position of the element with the tooltip attribute
   * @param nWidth The width of the element with the tooltip attribute
   * @param nHeight The height of the element with the tooltip attribute
   * @param strToolTipSpec The tooltip text
    */
  function showTextTip( posTipElement, nWidth, nHeight, strToolTipText )
  {
    const strToolTip = getTextValue( strToolTipText );

    m_vwTipEle.text( "" );

    $(m_vwTipEle).css( "left", "0px");
    m_vwTipEle.text( strToolTip ); // Set the text in vwToolTip to get the tips wodth

    const posToolTip = getDefaultToolTipPosition( posTipElement, nWidth, nHeight );

    // Position the tooltip
    $(m_vwTipEle).offset( posToolTip );

  } // end showDefaultTextTip()

  /**
   * Gets the tooltip text value. It first char is # then its a property file key
   * @param strToolTipText
   */
  function getTextValue( strToolTip )
  {
    return VwExString.getValue( vwPropertyMgr, strToolTip );
  }


  /**
   * Returns a position object where the tool tip should be placed
   *
   * @param posTipElement The position of the element with the tooltip attribute
   * @param nWidth The width of the element with the tooltip attribute
   * @param nHeight The height of the element with the tooltip attribute
    */
  function getDefaultToolTipPosition( posTipElement, nWidth, nHeight )
  {
    const nBrowserHeight = window.innerHeight;
    const nBrowserWidth =  window.innerWidth;

    const nPaddingTop = getCssVal( "padding-top") + getCssVal( "border-top");
    const nPaddingBot = getCssVal( "padding-bottom")  + getCssVal( "border-bottom");
    const nPaddingLeft = getCssVal( "padding-left")  + getCssVal( "border-left" );
    const nPaddingRight = getCssVal( "padding-right")  + getCssVal( "border-right");

    const nToolTipWidth = $(m_vwTipEle).width() + nPaddingLeft + nPaddingRight;

    let nTipElementCenter = posTipElement.left + (nWidth / 2 );
    const nToolTipCenter = nToolTipWidth / 2;
    nTipElementCenter -= nToolTipCenter;

    const nHeightVwToolTip = $(m_vwTipEle).height() + nPaddingTop + nPaddingBot ;
    const nRequiredHeight = posTipElement.top + nHeight + nHeightVwToolTip + GAP;

    // Try to place tooltip underneath the element if space allows
    if (  nRequiredHeight > nBrowserHeight )
    {
      // cant fit underneath to to place on right

      if (  nToolTipWidth + posTipElement.left < nBrowserWidth )
      {
        return {top:adjustTop(posTipElement.top, nHeightVwToolTip, nBrowserHeight), left:posTipElement.left + nWidth + GAP };
      }
      else
      {
        return {top:adjustTop(posTipElement.top, nHeightVwToolTip, nBrowserHeight), left:posTipElement.left - nToolTipWidth - GAP  };
      }
    }
    else
    {
      if ( nTipElementCenter > nBrowserWidth )
      {
        nTipElementCenter = nBrowserWidth - nToolTipWidth - GAP ;

        return {top:posTipElement.top + nHeight + GAP, left:nTipElementCenter };
      }

      return {top:posTipElement.top + nHeight + GAP, left:nTipElementCenter };

    } // end else

  } // end  getToolTipPosition()


  function adjustTop(nElementTop, nElementHeight, nBrowserHeight)
  {

    if ( nElementTop + nElementHeight > nBrowserHeight )
    {
       return nBrowserHeight - nElementHeight;
    }

    return nElementTop;
  } // end adjustTop()


  /**
   * Returns cssType attribute value as a number. l
   * @param strCssType The css type toquery i.e. pading-left, padding-right
   */
  function getCssVal( strCssType )
  {
    const strCssTypeVal = $(m_vwTipEle).css( strCssType );

    // Strip of px from return css query and convert it to a number
    return Number( strCssTypeVal.substring( 0, strCssTypeVal.indexOf( "p"))) ;
  }  // end getCssVal()


  /**
   * Setup default props
   */
  function configProps()
  {
    const tipProps = {};
    tipProps.css = "VwToolTipMgr";

    $.extend( tipProps, toolTipProps, );

    return tipProps;
  }

} // VwToolTipMgr( toolTipProps )

export default VwToolTipMgr;
