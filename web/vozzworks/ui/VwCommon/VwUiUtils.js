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

VwCssImport( "/vozzworks/ui/VwCommon/style");

function VwUiUtils()
{
  let  m_strElementToTest;
  let  m_fnOutsideClickCallback;

  this.vwTextFilter = () => vwTextFilter;
  this.installOutsieClickDetector = installOutsideClickDector;
  this.removeOutsideClickDetector = () => window.removeEventListener( "mousedown", handleMouseDown );


  /**
   * Installs the outside click detector event handler
   * @param strElementTpTest The element to test
   * @param fnCallback The callback if click was outside the element to test
   */
  function installOutsideClickDector( strElementTpTest, fnCallback )
  {
    m_fnOutsideClickCallback = fnCallback;
    m_strElementToTest = strElementTpTest;
    window.addEventListener( "mousedown", handleMouseDown, fnCallback );

  } // end installOutsideClickDector

  /**
   * Mouse down handle to detrmin if click event was outsie the element to test
   * @param event
   * @return {boolean}
   */
  function handleMouseDown( event )
  {
    const parentEle = $( `#${m_strElementToTest}`)[0];

    if ( !parentEle )
    {
      return;
    }

    if ( !parentEle.contains( event.target ) )
    {

      m_fnOutsideClickCallback( event.target );

      window.removeEventListener( "mousedown", handleMouseDown );

      return false;
    }
  } // end handleMouseDown

} // end VwUiUtils{}


/**
 * A generic textbox filter implementation. This object monitors the input of the text input controls
 * and returns a filtered array set from the master list of matches against a string list for an array of object properties
 *
 * @param aMasterList The master array of objects to filter
 * @param astrPropNamesToMatch a property or an array of properties on the objects contained in the master
 * list to filter values on. If the master list is an array of strings, then this parameter should be null
 * @param fnResultCallback The call back funtion that will return a array subset or null if the textbox is back to its default
 * state. A zero length array indicates no matches found.
 * @param strTextInputId The id of the text input control to monitor
 * @param strPlaceHolderText The default placeholder text or null if none applys
 *
 * @constructor
 */
const vwTextFilter = ( aMasterList, astrPropNamesToMatch, fnResultCallback, strTextInputId, strPlaceHolderText ) =>
{

  var m_aMasterList = aMasterList;
  var m_astrPropNamesToMatch = astrPropNamesToMatch;
  var m_fnResultCallback = fnResultCallback;
  var m_strTextInputId = strTextInputId;
  var m_strPlaceHolderText = strPlaceHolderText;
  var m_strNoSelectionMsg = null;

  if ( !m_strPlaceHolderText )
  {
    m_strPlaceHolderText = "";
  }


  $( "#" + m_strTextInputId ).keyup( function ( event )
                                     {
                                       if ( m_strPlaceHolderText == $( "#" + m_strTextInputId ).val() )
                                       {
                                         m_fnResultCallback( m_aMasterList );
                                         return;
                                       }

                                       doFilter( event );

                                     } );


  /**
   * filter the master list of objects/strings
   * @param event
   */
  function doFilter( event )
  {

    var strInputText = $( "#" + m_strTextInputId ).val().toLowerCase();
    if ( strInputText == "" )
    {
      return (m_aMasterList);
    }


    var aFilteredSet = new Array();

    for ( var x = 0; x < m_aMasterList.length; x++ )
    {
      var objInMaster = m_aMasterList[x];

      // If no object property names are specified, content of master list is assumed to be strings
      if ( m_astrPropNamesToMatch == null )
      {
        if ( objInMaster.toLowerCase().indexOf( strInputText ) >= 0 )
        {
          aFilteredSet.push( objInMaster );
        }

      }
      else
      {
        if ( Array.isArray( astrPropNamesToMatch ) )
        {
          for ( var y = 0; y < astrPropNamesToMatch.length; y++ )
          {
            var strPropVal = objInMaster[astrPropNamesToMatch[y]];

            if ( !strPropVal )
            {
              continue;
            }

            if ( strPropVal.toLowerCase().indexOf( strInputText ) >= 0 )
            {
              aFilteredSet.push( objInMaster );
              break;

            }
          } // end for ( y... )
        } // end if
        else
        {
          if ( !objInMaster[astrPropNamesToMatch] )
          {
            continue;
          }


          if ( objInMaster[astrPropNamesToMatch].toLowerCase().indexOf( strInputText ) >= 0 )
          {
            aFilteredSet.push( objInMaster );
          }

        } // end else

      } // end else

    } // end for ( x..

    m_fnResultCallback( aFilteredSet );


  } // end doFilter()

} // VwTextFilter{}


/**
 * Clears all selected text ranges
 * @constructor
 */
VwUiUtils.vwClearTextSelection = () =>
{
  const sel = window.getSelection ? window.getSelection() : document.selection;
  if ( sel )
  {
    if ( sel.removeAllRanges )
    {
      sel.removeAllRanges();
    }
    else
    {
      if ( sel.empty )
      {
        sel.empty();
      }
    }
  }

} // end VwClearTextSelection{}


/**
 * Dump an objects properties and values to a string
 *
 * @param objectToDump
 * @returns {string}
 * @constructor
 */
VwUiUtils.vwDumpObjectProperties = ( objectToDump ) =>
{

  let strProps = "";

  for ( const strPropName in objectToDump )
  {
    strProps += strPropName + ": " + objectToDump[strPropName] + "\n";
  }

  return strProps;

}

/**
 * Strip off css units and return value as a Number
 * @param strCssSize The css size string
 * @returns {number}
 * @constructor
 */
VwUiUtils.vwCss2Nbr = ( strCssSize ) =>
{
  if ( !strCssSize )
  {
    return 0;
  }

  return Number( strCssSize.substring( 0, strCssSize.indexOf( "px" ) ) );

}




/**
 * Determins if an html element has an event handler
 *
 * @param strElementId  The id the element
 * @param strEventName  The name of the event
 * @returns {boolean}
 */
VwUiUtils.hasEventHandler = ( strElementId, strEventName ) =>
{

  const objEvent = $._data( $( "#" + strElementId ).get( 0 ), "events" );

  if ( !objEvent )
  {
    return false;
  }


  if ( objEvent[strEventName] )
  {
    return true;
  }

  return false;
}


/**
 * Scale the image once its been loaded
 * @param evt
 */
VwUiUtils.vwScaledImgLoader = ( evt ) =>
{

  const img = evt.currentTarget;

  // what's the size of this image and it's parent
  const h = $( img ).height();

  const tw = $( img ).parent().width();
  const th = $( img ).parent().height();

  // compute the new size and offsets
  const result = VwScaleImage( w, h, tw, th, true );

  // adjust the image coordinates and size
  img.width = result.width;
  img.height = result.height;

  $( img ).css( "left", result.targetleft );
  $( img ).css( "top", result.targettop );
}


/**
 * Scales an image to a target width and height
 * @param nSrcWidth     The original image width
 * @param nSrcHeight    The original image height
 * @param nTargetWidth  The target (scaled) width
 * @param nTargetHeight The target (scaled) height
 * @param fLetterBox    if true image retains is aspect ration with in the target box, else the image is scaled to
 *                      the exact tarhet width and height
 * @returns {{width: number, height: number, fScaleToTargetWidth: boolean}}
 */
VwUiUtils.vwScaleImage = ( nSrcWidth, nSrcHeight, nTargetWidth, nTargetHeight, fLetterBox ) =>
{

  const result = {width: 0, height: 0, fScaleToTargetWidth: true};

  if ( (nSrcWidth <= 0) || (nSrcHeight <= 0) || (nTargetWidth <= 0) || (nTargetHeight <= 0) )
  {
    return result;
  }

  try
  {

    if ( nSrcWidth <= nTargetWidth && nSrcHeight < nTargetHeight )
    {
      result.width = nSrcWidth;
      result.height = nSrcHeight;
      return result;

    }

    // scale to the target width
    const scaleX1 = nTargetWidth;
    const scaleY1 = (nSrcHeight * nTargetWidth) / nSrcWidth;

    // scale to the target height
    const scaleX2 = (nSrcWidth * nTargetHeight) / nSrcHeight;
    const scaleY2 = nTargetHeight;

    // now figure out which one we should use
    let   fScaleOnWidth = (scaleX2 > nTargetWidth);
    if ( fScaleOnWidth )
    {
      fScaleOnWidth = fLetterBox;
    }
    else
    {
      fScaleOnWidth = !fLetterBox;
    }

    if ( fScaleOnWidth )
    {
      result.width = Math.floor( scaleX1 );
      result.height = Math.floor( scaleY1 );
      result.fScaleToTargetWidth = true;
    }
    else
    {
      result.width = Math.floor( scaleX2 );
      result.height = Math.floor( scaleY2 );
      result.fScaleToTargetWidth = false;
    }

  }
  finally
  {
    result.targetleft = Math.floor( (nTargetWidth - result.width) / 2 );
    result.targettop = Math.floor( (nTargetHeight - result.height) / 2 );

  }


  return result;
}

/**
 * Creates a image base64 data URI from an html img elemenr
 *
 * @param imgElm The image element
 * @returns {*|string}
 * @constructor
 */
VwUiUtils.vwImgToDataURI = ( imgElm ) =>
{
  const canvasElm = document.createElement( "canvas" );
  const canvasCtx = canvasElm.getContext( "2d");

  canvasElm.width = imgElm.width;
  canvasElm.height = imgElm.height;

  canvasCtx.drawImage( imgElm, 0, 0, imgElm.width, imgElm.height );
  return canvasElm.toDataURL();

}

/**
 * Clears all selected html elements
 */
VwUiUtils.clearTextSelections = () =>
{
  const sel = window.getSelection ? window.getSelection() : document.selection;
  if ( sel )
  {
    if ( sel.removeAllRanges )
    {
      sel.removeAllRanges();
    }
    else
    {
      if ( sel.empty )
      {
        sel.empty();
      }
    }

  }

} // end clearTextSelection()


/**
 * Translate all html tags with an id that starts with the id prefix i18n_
 *
 * @param resourceMgr A VwPropertyMgr instance
 * @param strPrefix The name of the id prefix that indentifies i18n properties to be translated
 */
VwUiUtils.doI18n = ( resourceMgr, strPrefix ) =>
{

  let m_strPrefix = null;

  if ( !strPrefix )
  {
    m_strPrefix = "i18n_";
  }
  else
  {
    m_strPrefix = strPrefix;
  }


  // ** Get all the html elements that contain the form id
  let strSelector = "*[id^='" + m_strPrefix + "']";

  let htmlElements = $( strSelector );

  if ( htmlElements.length > 0 )
  {
    for ( let x = 0; x < htmlElements.length; x++ )
    {
      const ctl = htmlElements[x];

      const strPropName = ctl.id.substring( "i18n_".length );

      const strPropVal = resourceMgr.getString( strPropName );

      $( htmlElements[x] ).html( strPropVal );

    } // end for()
  } // end if

  // Now see if there are any html elments with a class that starts with i18n

  strSelector = "[class^='" + m_strPrefix + "']";
  htmlElements = $( strSelector );

  htmlElements = $( strSelector );

  if ( htmlElements.length > 0 )
  {
    for ( let x = 0; x < htmlElements.length; x++ )
    {

      const ctl = htmlElements[x];

      const strPropName = findPropInClassString( ctl.className );

      const strPropVal = resourceMgr.getString( strPropName );

      $( htmlElements[x] ).html( strPropVal );

    } // end for()
  } // end if

  if ( strPrefix = "i18n_" )
  {
    strSelector = "[class*=i18n_]";
    htmlElements = $( strSelector );

    htmlElements = $( strSelector );

    if ( htmlElements.length > 0 )
    {
      for ( let x = 0; x < htmlElements.length; x++ )
      {

        const ctl = htmlElements[x];

        const strPropName = findPropInClassString( ctl.className );

        const strPropVal = resourceMgr.getString( strPropName );

        $( htmlElements[x] ).html( strPropVal );

      } // end for()
    } // end if

  }
  // Now see if there are any controls with attribute values that starts with the prefix

  strSelector = "[value^='" + m_strPrefix + "']";
  htmlElements = $( strSelector );
  updateAttr( htmlElements, "value" );

  // Controls with title attributes
  strSelector = "[title^='" + m_strPrefix + "']";
  htmlElements = $( strSelector );
  updateAttr( htmlElements, "title" );

  // Controls with placeholder attributes

  strSelector = "[placeholder^='" + m_strPrefix + "']";
  htmlElements = $( strSelector );

  updateAttr( htmlElements, "placeholder" );

  if ( getToolTipMgr )
  {
    getToolTipMgr().load();
  }

  /**
   * This will find the class if multiple class names were specified in the class attribute
   *
   * @param strClassString A string consisting of one or more class name
   * @returns {string|*|*|string}  The part of the class name that represents an i18n property name
   */
  function findPropInClassString( strClassString )
  {
    const astrClassNmes = strClassString.split( " " );

    for ( let x = 0, nlen = astrClassNmes.length; x < nlen; x++ )
    {
      if ( astrClassNmes[x].startsWith(  m_strPrefix ) )
      {
        return astrClassNmes[x].substring( m_strPrefix.length );
      }
    }
  }


  /**
   * Update the attribute if any elements exist
   *
   * @param aHtmlElements The array of elemts found that start with i18n prefix
   * @param strAttr The attribute name to update
   */
  function updateAttr( aHtmlElements, strAttr )
  {
    if ( htmlElements.length > 0 )
    {
      for ( let x = 0; x < htmlElements.length; x++ )
      {

        const ctl = htmlElements[x];

        const strPropName = ctl.getAttribute( strAttr ).substring( "i18n_".length );

        const strPropVal = resourceMgr.getString( strPropName );

        $( ctl ).attr( strAttr, strPropVal );

      } // end for()

    } // end if


  } // end pdateAttr()

}  // end doI18n{}

/**
 * Converts metric units in string form i.e. 10px to a number
 *
 * @param strPxUnits The units in string form
 * @returns {number}
 */
VwUiUtils.convertStringPxToNumber = ( strPxUnits ) =>
{
  if ( !strPxUnits )
  {
    return 0;

  }

  const nPos = strPxUnits.indexOf( "px");

  return Number( strPxUnits.substring( 0, nPos ) );


} // end convertStringPxToNumber{}

/**
 * Gets the size of 1em based on the current font size in the element
 *
 * @param strElementToTest The id the the html element to test
 */
VwUiUtils.getEmSize = ( strElementToTest ) =>
{
  const metricEl = $( "<div id='metric' style='width:1em;display:none'>" );

  if ( !strElementToTest )
  {
    $( "body" ).append( metricEl );
  }
  else
  {
    $( "#" + strElementToTest ).append( metricEl );
  }

  const nEmSize = $( "#metric" ).width();

  $( "#metric" ).remove();

  return nEmSize;


}


/**
 * Searches the stylesheets associated with a rule name
 *
 * @param strRuleName The name of the cssRule to search for
 * @param nRuleType One of the CSSRule type constants
 */
VwUiUtils.getCssRule = ( strRuleName, nRuleType ) =>
{

  let rule;

  const ss = document.styleSheets;

  for ( let i = 0; i < ss.length; ++i )
  {

    // loop through all the rules!

    if ( !ss[i].cssRules )
    {
      continue;
    }

    for ( var x = 0; x < ss[i].cssRules.length; ++x )
    {

      rule = ss[i].cssRules[x];

      if ( rule.name == strRuleName && rule.type == nRuleType )
      {

        return rule;

      }

    }

  }

} // end getCssRule{}


/**
 * Search for the styleSheet associated with a styleSheet name
 *
 * @param strStylesheetName The name of the stylesheet to search for
 */
VwUiUtils.getStylesheet = ( strStylesheetName ) =>
{

  for ( let i in document.styleSheets )
  {
    if ( !document.styleSheets[i].href )
    {
      continue;
    }

    const nMySSIndex = document.styleSheets[i].href.indexOf( strStylesheetName );

    if ( document.styleSheets[i].href && nMySSIndex >= 0 )
    {
      return document.styleSheets[i];
    }
  }

} // end getStylesheet{}


/**
 * Converts a metric in px or ems to the actual number it represents
 * @param strMetric
 * @returns {number}
 */
VwUiUtils.metricsToNbr = ( strMetric ) =>
{
  let nEnd;

  if ( strMetric.endsWith( "%" ) )
  {
    nEnd = strMetric.length - 1;
  }
  else
  {
    nEnd = strMetric.length - 2;
  }

  let nNbrPortion = Number( strMetric.substring( 0, nEnd ) );
  const strMetricPortion = strMetric.substring( nEnd );

  if ( strMetricPortion == "em" )
  {
    const nEmSize = getEmSize();
    nNbrPortion *= nEmSize;
  }

  return nNbrPortion;

}

/**
 * Get user browser version. IE11, IE12 Edge or Firefox.
 */

VwUiUtils.getBrowserName = () =>
{

  const userAgent = window.navigator.userAgent;

  // Check Edge first
  if ( userAgent.indexOf( "Edge" ) >= 0 )
  {
    return "Edge";
  }

  //Opera browsers may contain the string Chrome and Safari, hence we check Opera second
  if ( userAgent.indexOf( "OPR" ) >= 0 )
  {
    return "Opera";
  }

  if ( userAgent.indexOf( "Opera" ) >= 0 )
  {
    return "Opera";
  }

  if ( userAgent.indexOf( "Trident/7.0" ) >= 0 )
  {
    return "IE11";
  }

  if ( userAgent.indexOf( "Firefox" ) >= 0 )
  {
    return "Firefox";
  }

  // Chrome userAgent includes "Safari" as well so Chrome check must come before Safari
  if ( userAgent.indexOf( "Chrome" ) >= 0 )
  {
    return "Chrome";
  }

  if ( userAgent.indexOf( "Safari" ) >= 0 )
  {
    return "Safari";
  }


}


/**
 * Get user browser version. IE11, IE12 Edge or Firefox.
 */

VwUiUtils.getBrowserVersion = () =>
{

  const userAgent = window.navigator.userAgent;

  if ( userAgent.indexOf( "Edge" ) > 0 )
  {
    return "Edge";
  }
  else
  {
    if ( userAgent.indexOf( "Trident/7.0" ) > 0 )
    {
      return "IE11";
    }
    else
    {
      if ( userAgent.indexOf( "Firefox" ) > 0 )
      {
        return "Firefox";
      }
      else
      {
        return 0;  // not IE11 or 12, Firefox
      }
    }
  }
}

VwUiUtils.getTopLevelParent = ( startElementId ) =>
{
  let elementParent = $("#" + startElementId ).parent();

  while( elementParent )
  {
    const parent =  elementParent.parent();

    if ( parent == null|| parent.length == 0 )
    {
      return elementParent;
    }

    elementParent = parent;


  }
} // end getTopLevelParent();


/**
 * Install global mouse click to close the element to tests if clicked outside of it
 */
VwUiUtils.installOutsideClickDetector = ( strElementToTest, fnCallback ) =>
{
  window.addEventListener( "mousedown", handleMoseDown );

  function handleMoseDown( event )
  {
    const parentEle = $( "#" + strElementToTest )[0];

    if ( !parentEle )
    {
      return;
    }

    /*
    if (  event.target.id != strElementToTest )
    {
      fnCallback( event.target.id );

    }
    */

    if ( !parentEle.contains( event.target ) )
    {

      fnCallback( event.target );

      window.removeEventListener( "mousedown", handleMoseDown );

      return false;
    }
  }

} // end  installOutsideClickDetector()


export default VwUiUtils;











