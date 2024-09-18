/*
 * Created by User: petervosburgh
 * Date: 8/7/24
 * Time: 10:12 AM
 * 
 */

import VwHashMap from "../VwHashMap/VwHashMap.js";

function VwFilterMgr( aDataSet )
{
  const m_mapFilterProps = new VwHashMap();

  /**
   * Adds a filter definition
   *
   * @param strFilterName The name of the filter to add
   * @param filterProps The properties for this filter
   */
  this.addFilter = ( strFilterName, filterProps ) => m_mapFilterProps.put( strFilterName, filterProps );

  /**
   * Applys the filter to the data set
   * @type {function(*, *): *}
   */
  this.applyFilter = handleApplyFilter;


  /**
   * The name of a previously added filter to apply to the data set
   *
   * @param strFilterNameToApply
   */
  function handleApplyFilter( aDataSetToFilter, strFilterNameToApply, valueToMatch )
  {
    const filterProps = m_mapFilterProps.get( strFilterNameToApply );

    if ( !filterProps )
    {
      throw `applyFilter name ${strFilterNameToApply} was not added using the addFilter method`;
    }

    const aFilteredDataSet = aDataSetToFilter.filter( (dataItem ) => handleDoFilter( dataItem, filterProps, valueToMatch ) );

    return aFilteredDataSet;

  } // end handleApplyFilter()


  /**
   * Handles filter test for the data item
   *
   * @param dataItem The data item to test
   * @param filterProps The properties defined for this filter
   * @param valueToMatch The value to apply the test to
   * @return {number|*|boolean}
   */
  function handleDoFilter( dataItem, filterProps, valueToMatch )
  {
    if ( filterProps.callback )
    {
      return filterProps.callback( dataItem, filterProps, valueToMatch );
    }

    for ( const strDataIdProp of filterProps.dataIds )
    {
      let dataVal = dataItem[ strDataIdProp ];

      if ( !filterProps.caseSensitive )
      {
        dataVal = dataVal.toLowerCase();
      }

      switch (filterProps.matchType )
      {
        case "startsWith":

          if ( !filterProps.caseSensitive )
          {
            return dataVal.startsWith( valueToMatch.toLowerCase() );
          }
          else
          {
            return dataVal.startsWith( valueToMatch );
          }

        case "endsWith":

          if ( !filterProps.caseSensitive )
          {
            return dataVal.endsWith( valueToMatch.toLowerCase() );
          }
          else
          {
            return dataVal.endsWith( valueToMatch );
          }

        case "contains":

          if ( !filterProps.caseSensitive )
          {
            return dataVal.indexOf( valueToMatch.toLowerCase() )>= 0;
          }
          else
          {
            return dataVal.indexOf( valueToMatch ) >= 0;
          }

        case "eq":

          if ( !filterProps.caseSensitive )
          {
            return dataVal == valueToMatch.toLowerCase();
          }
          else
          {
            return dataVal == valueToMatch;
          }

        default:

          if ( !filterProps.caseSensitive )
          {
            return dataVal.indexOf( valueToMatch.toLowerCase() ) >= 0;
          }
          else
          {
            return dataVal.indexOf( valueToMatch ) >= 0;
          }


      } // end switch()

    } // end for

  } // end handleDoFilter()

} // end VwFilterMgr{}

export default VwFilterMgr;
