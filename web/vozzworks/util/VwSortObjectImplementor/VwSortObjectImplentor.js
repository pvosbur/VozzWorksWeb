/*
 * Created by User: petervosburgh
 * Date: 7/3/22
 * Time: 12:55 PM
 * 
 */

import VwDate from "../VwDate/VwDate.js";
import VwUtils from "../VwUtils/VwUtils.js";

/**
 * This class is used as an argument to Array.sort. Pass the sort method
 *
 * @param strPropName The name of the property in the object to be sorted
 * @param strDataType The datatype being sorted. "s" = case-sensitive string, "i" = case in-sensitive string,  "n" = integer number, "f" =floating point number, "d" = date
 * @param bDescending if true, sort is descenfing else its ascending
 *
 * @constructor
 */
function VwSortObjectImplementor( strPropName, strDataType, bDescending )
{
  this.sort = sort;


  /**
   * The sort implementor cunction
   *
   * @param a data element one
   * @param b data element two
   *
   * @return {number}
   */
  function sort( a, b )
  {
    let aData = VwUtils.getObjProperty( a, strPropName );
    let bData = VwUtils.getObjProperty( b, strPropName );

    if ( strDataType == "i"  )
    {
      if ( aData )
      {
        aData = aData.toLowerCase();

      }

      if ( bData )
      {
        bData = bData.toLowerCase();

      }

    }

    // Check to see if we are dealing with undefined fields
    if ( !aData || !bData )
    {

      if ( !aData && !bData )
      {
        return 0; // Both fields are undefined so they are equal
      }

      if ( !bDescending )  // ascending sort
      {
        if ( !aData )
        {
          return -1;
        }
        else
        {
          return 1;
        }
      }
      else
      {
        if ( !aData )
        {
          return 1;
        }
        else
        {
          return -1;
        }

      } // end else

    } // end if

    switch ( strDataType )
    {
      case "s":  //String
      case "i":

        return doStringCompare( aData, bData, bDescending );

      case "n": // Number

        return doNumberCompare( aData, bData, bDescending );

      case "f": // Float

        return doFloatCompare( aData, bData, bDescending );


      case "d": // Date

        return doDateCompare( aData, bData, bDescending );

    } // end switch

  } // end sort()

  /**
   * Does a string compare
   *
   * @param aData
   * @param bData
   * @param bDescending
   * @return {number}
   */
  function doStringCompare( aData, bData, bDescending )
  {

    if ( !bDescending )  // ascending sort
    {
      if ( aData > bData )
      {
        return 1;
      }
      else
      {
        if ( aData < bData )
        {
          return -1;
        }
        else
        {
          return 0;
        }
      }

    }
    else
    {
      // Descending sort
      if ( aData < bData )
      {
        return 1;
      }
      else
      {
        if ( aData > bData )
        {
          return -1;
        }
        else
        {
          return 0;
        }
      }

    } // end else

  } // end doStringCompare(


  /**
   * Does an integer number compare
   *
   * @param aData
   * @param bData
   * @param bDescending
   * @return {number}
   */
  function doNumberCompare( aData, bData, bDescending )
  {
    if ( bDescending )  // descending sort
    {
       return parseInt( bData ) - parseInt( aData );
    }
    else
    {
      return parseInt( aData ) - parseInt( bData );
    }

  } // end doNumberCompare()


  /**
   * Do a floating point compare
   * @param aData
   * @param bData
   * @param bDescending
   * @return {number}
   */
  function doFloatCompare( aData, bData, bDescending )
  {
    if ( bDescending )  // descending sort
    {
      return parseFloat( bData ) - parseFloat( aData );

    }
    else
    {
      return parseFloat( aData ) - parseFloat( bData );
    }

  } // end doFloatCompare()


  /**
   * Do a date compare
   *
   * @param aData
   * @param bData
   * @return {number}
   */
  function doDateCompare( aData, bData, bDescending )
  {
    if ( bDescending )
    {
      return VwDate.compare( bData, aData);
    }
    else
    {
      return VwDate.compare( aData, bData );
    }

  } // end doDateCompare()

} // end VwSortObjectImplementor({}

export default VwSortObjectImplementor;
