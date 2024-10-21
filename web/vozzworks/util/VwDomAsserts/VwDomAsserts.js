/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2022 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 * ============================================================================================
 *
 */
import VwHashMap from "/vozzworks/util/VwHashMap/VwHashMap.js";
import VwAssert from "/vozzworks/util/VwAsserts/VwAsserts.js";

/**
 * Assert library for DOM element ntesting
 *
 * @constructor
 */
function VwDomAssert()
{
  const m_mapCssColorConversions = new VwHashMap();

  m_mapCssColorConversions.put( "#ffff00", "yellow");
  m_mapCssColorConversions.put( "#008000", "green");
  m_mapCssColorConversions.put( "#008000", "black");
  m_mapCssColorConversions.put( "#ffffff", "white");
  m_mapCssColorConversions.put( "#00ffff", "aqua");
  m_mapCssColorConversions.put( "#f5f5dc", "beige");
  m_mapCssColorConversions.put( "#0080ff", "blue");
  m_mapCssColorConversions.put( "#a52a3a", "brown");
  m_mapCssColorConversions.put( "#5c9ec8", "cr8");
  m_mapCssColorConversions.put( "#00ffff", "cyan");
  m_mapCssColorConversions.put( "#00008b", "darkBlue");
  m_mapCssColorConversions.put( "#a9a9a9", "darkGrey");
  m_mapCssColorConversions.put( "#006400", "darkGreen");
  m_mapCssColorConversions.put( "#8b008b", "darkMagenta");
  m_mapCssColorConversions.put( "#ffbc00", "darkOrange");
  m_mapCssColorConversions.put( "#808080", "grey");
  m_mapCssColorConversions.put( "#d3d3d3", "lightGrey");
  m_mapCssColorConversions.put( "#90ee90", "lightGreen");
  m_mapCssColorConversions.put( "#ffa500", "orange");
  m_mapCssColorConversions.put( "#ffc0cb", "pink");
  m_mapCssColorConversions.put( "#800080", "purple");
  m_mapCssColorConversions.put( "#ff0000", "red");
  m_mapCssColorConversions.put( "#c0c0c0", "silver");
  m_mapCssColorConversions.put( "#ffd700", "gold");
  m_mapCssColorConversions.put( "#fffff0", "ivory");
  m_mapCssColorConversions.put( "#800000", "maroon");
  m_mapCssColorConversions.put( "#ee82ee", "violet");
  m_mapCssColorConversions.put( "#f5f5f5", "whiteSmoke");

  window["_vwMapColorConversions"] = m_mapCssColorConversions;

}

VwDomAssert(); // Load the map

VwDomAssertions.getColor = ( strKey ) => window["_vwMapColorConversions"].get( strKey );


/**
 * Performs a DOM element equal test
 *
 * @param strDomEleId  The dom element id to test
 * @param strExpectedElementVal  The expected value of the element
 * @param strFailMsg Failure text that is thrown in the exception if the test fails
 */
VwDomAssertions.equals = ( strDomEleId, strExpectedElementVal, strFailMsg ) =>
{
  const strElementVal = $(`#${strDomEleId}`).text();

  if ( !(strElementVal == strElementVal ))
  {
    VwAssertions.processErrorStack( `Assert Failure equals ${strFailMsg} '${strElementVal}''` );
  }

} // end VwDomAssertions.equals()

/**
 * Asserts that the element id exists in the DOM
 * @param strDomEleId The DOM element id
 * @param strFailMsg Fail text on exception
 */
VwDomAssertions.existsById = ( strDomEleId, strFailMsg ) =>
{
  const strElement = $(`#${strDomEleId}`)[0];

  if ( !(strElement ) )
  {
    VwAssertions.processErrorStack(  `Assert Failure existsById: ${strFailMsg}` );
  }

} // end VwDomAssertions.existsById()

/**
 * Asserts that the element with the strDomEleClassName exists
 *
 * @param strDomEleClassName The name of the element class
 * @param strFailMsg Fail text msg on exception
 */
VwDomAssertions.existsByClass = ( strDomEleClassName, strFailMsg ) =>
{
  const strElement = $(`.${strDomEleClassName}`)[0];

  if ( !(strElement ) )
  {
    VwAssertions.processErrorStack( `Assert Failure existsByClass: ${strFailMsg}` );
  }

} // end VwDomAssertions.existsByClass()


/**
 * This assert will wait up to the nMaxWaitTime ( specified in miilisecs ) for an element to be loaded in the dom via
 * <br/>some action. This is useful for stituations where a buuton vlick will invoke a process that changes the and a new dom entry
 * <br/>is created for the new view.
 *
 * @param strDomEleId The dom element id to wait for its existence
 * @param nMaxWaitTime The max wait time in millisecs. If the element is not loaded within this time an exception is the thrown with thbe fail msg
 * @param strFailMsg The message that appears on the exception
 *
 * @return {Promise<unknown>}
 */
VwDomAssertions.waitForElement = async ( strDomEleId, nMaxWaitTime, strFailMsg ) =>
{

  const nStartTime = Date.now();

  return new Promise( (success, fail ) =>
  {
    const strElement = $( `#${strDomEleId}` )[0];

    if ( strElement )
    {
      success( true );
      return;
    }

    setTimeout( timeoutHandler, 50 );

    function timeoutHandler()
    {
      const strElement = $( `#${strDomEleId}` )[0];

      if ( strElement )
      {
        success( true );
        return;
      }

      if ( (Date.now() - nStartTime) >= nMaxWaitTime )
      {
        fail( VwAssertions.processErrorStack( `Assert Failure waitForElement: ${strFailMsg}` ) ) // This will throw an exception
      }

      setTimeout( timeoutHandler, 50 );

    } // end timeoutHandler

  }); // end promise

} // end VwDomAssertions.waitForElement()


/**
 * Asserts that the dom element is empty (no child elements )
 *
 * @param strDomEleId The dom element id to test
 * @param strFailMsg
 */
VwDomAssertions.isEmpty = ( strDomEleId, strFailMsg ) =>
{
  const strElement = $(`#${strDomEleId}`)[0];

  if ( !(strElement ) )
  {
    VwAssertions.processErrorStack(  `Assert Failure isEmpty, element is null: ${strFailMsg}` );
  }

  if ( $(`#${strDomEleId}`).length > 0 )
  {
    VwAssertions.processErrorStack(  `Assert Failure isEmpty: ${strFailMsg}` );

  }

} // end VwDomAssertions.isEmpty()

/**
 * Performs a not null or zero length string test
 *
 * @param strDomEleId The dom element id to test
 * @param strFailMsg The fail text thron in the exception
 */
VwDomAssertions.isNotNull = ( strDomEleId, strFailMsg ) =>
{
  const strElementVal = $(`#${strDomEleId}`).text();

  if ( !strElementVal)
  {
    VwAssertions.processErrorStack(  `Assert Failure isNotNull: ${strFailMsg}` );
  }

} // end VwDomAssertions.isNotNull()

/**
 * Performs a null or zero length string test
 *
 * @param strDomEleId The dom element id to test
 * @param strFailMsg The fail text thron in the exception
 */
VwDomAssertions.isNull = ( strDomEleId, strFailMsg ) =>
{
  const strElementVal = $(`#${strDomEleId}`).text();

  if ( strElementVal)
  {
    VwAssertions.processErrorStack(  `Assert Failure isNull: ${strFailMsg}` );
  }

} // end VwDomAssertions.isNull()

/**
 * Performs a DOM css test on an element
 *
 * @param strDomElelId  The dom element id to test
 * @param strCssProperty The css property to test
 * @param strCssExpectedVal The expected property value
 * @param strFailMsg Failure text that is thrown in the exception if the test fails
 */
VwDomAssertions.cssEquals = ( strDomElelId, strCssProperty, strCssExpectedVal, strFailMsg ) =>
{
  let strCssVal = $(`#${strDomElelId}`).css( strCssProperty);

  if ( strCssVal.startsWith( "rgb"))
  {
    strCssVal = rgb2HexColor( strCssVal );

  }

  if ( strCssExpectedVal.charAt(0) != "#") // THis is a css color value
  {
    strCssVal = VwDomAssertions.getColor( strCssVal );
  }

  if ( !(strCssVal == strCssExpectedVal) )
  {
    VwAssertions.processErrorStack( `Assert Failure cssEquals: ${strFailMsg} '${strCssVal}'` );
  }

  /**
   * Function to convert an rgb string in the form rdb(255, 0, 255 ) to its corresponding hex number equiv<br/>
   * This example would return #ff00ff
   *
   * @param strRgb  The rgb form of a color
   * @return {string} The hex form of the color which starts with a # sign
   */
  function rgb2HexColor( strRgb )
  {
    // Strip off the rgb() leaving just the numbers
    let strRgbNbrs = strRgb.substring( strRgb.indexOf( "(") + 1);
    strRgbNbrs = strRgbNbrs.substring( 0, strRgbNbrs.indexOf( ")") );

    // Get the array of numbers from the stripped rgb()
    const astrNbrs = strRgbNbrs.split( ",");

    return "#" + numberToHex(astrNbrs[0]) + numberToHex(astrNbrs[1]) + numberToHex(astrNbrs[2]);

    function numberToHex(c)
    {
      const strHex = Number(c).toString(16);
      return strHex.length == 1 ? "0" + strHex : strHex;

    } // end numberToHex()

  } // end rgb2HexColor()

} // end VwDomAssertions.assertCssEquals )


export default VwDomAssert;



