/*
 * Created by User: petervosburgh
 * Date: 10/11/24
 * Time: 9:00 AM
 * 
 */
function VwMetrics()
{

} // end VwMetrics()

/**
 * Converts pixels to ems or rems depending on the strEmuitl
 *
 * @param strParent The parent element with the current font size to measure.May be null if unit is rems
 * @param nPixels   The nbr of pixels to convert to em/rem units
 * @param strEmUnit must be one of "rem" or "em"
 *
 * @return a string the number of em/rem i.e "10rem"
 */
VwMetrics.pixelsToEms = function( strParent, nPixels, strEmUnit)
{
  let strUnit;

  if ( !strEmUnit )
  {
    strUnit = "rem";
  }
  else
  {
    strUnit = strEmUnit;
  }

  const strRuler = `<div id="vwRuler" width="1${strUnit} style="display:none">&nbsp</div>`;

  $("#vwRuler").remove();

  if ( strEmUnit == "rem" )
  {
    $("body").append(strRuler);
  }
  else
  {
    $(`#${strParent}`).append(strRuler);
  }
  // get size in pixels for 1em inn the parents font size

  const n1EmInPx = $("#vwRuler").width();

  $("#vwRuler").remove();

  return `${(nPixels / n1EmInPx)}${strEmUnit}`;

} // end pixelsToEms


/**
 * Convert number of pixels to a pct of the total width of the parent
 *
 * @param strElementId The id of the element the pct is computed from. Computed from the element's width.
 * @param nPixels   The pixel number to convert to the pct of the total width of the element id
 */
VwMetrics.pixelsToPct = function( strElementId, nPixels)
{
  const nTotalWidth = $(`#${strElementId}`).width();

  return `${(nPixels / nTotalWidth) * 100}%`;

} // end VwMetrics.pixelsToPct()

export default VwMetrics;
