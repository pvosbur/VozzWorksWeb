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

import VwHashMap from "../../util/VwHashMap/VwHashMap.js";

function VwBreadCrumbMgrModel( vwBreadCrumbUI, strCrumbIdProp )
{
  const m_aBreadCrumbs = [];
  const m_mapCrumbsById = new VwHashMap();
  const m_aBreadCrumbAddedListeners = [];
  const m_aBreadCrumbRemovedListeners = [];

  this.addCrumb = addCrumb;
  this.removeCrumb = removeCrumb;
  this.removeFollowing = removeFollowing;
  this.getCrumb = getCrumb;
  this.getCrumbByIndex = getCrumbByIndex;
  this.getCrumbPath = () => [...m_aBreadCrumbs];
  this.size = size;
  this.getLastCrumb = getLastCrumb;
  this.onCrumbAdded = ( listener ) => m_aBreadCrumbAddedListeners.push( listener );
  this.onCrumbRemoved = ( listener ) => m_aBreadCrumbRemovedListeners.push( listener );


  /**
   * Retrieve a bread crumb object by its link id
   *
   * @param strCrumbId the id of the crumb to get
   */
  function getCrumb( strCrumbId )
  {
    return m_mapCrumbsById.get( strCrumbId );

  } // end getCrumb(

  /**
   * Retirns the crumb by its index
   *
   * @param ndx the index of the crumb to get
   * @return {*}
   */
  function getCrumbByIndex( ndx )
  {
    return m_aBreadCrumbs[ ndx ];
  } // end getCrumbByIndex()


  /**
   * Retruns the nbr of bread crumbs
   * @returns {*}
   */
  function size()
  {
    return m_aBreadCrumbs.length;

  } // end size()

  /**
   * Adds a bread crumb object
   *
   * @param strCrumbId The id of the crumb (used for retrievals)
   * @param crumb The object representing the crumb
   */
  function addCrumb( crumb )
  {
    const strCrumbId = crumb[ strCrumbIdProp ];

    m_aBreadCrumbs.push( crumb );

    m_mapCrumbsById.put( strCrumbId, crumb );

    fireCrumbListeners( strCrumbId, crumb, m_aBreadCrumbAddedListeners );

  } // end addCrumb()

  /**
   * Removes a bread crumb
   * @param strCrumbId  The bread crumb id to remove
   */
  function removeCrumb( strCrumbId, ndx )
  {
    m_aBreadCrumbs.splice( ndx, 1 );

    const crumbRemoved = m_mapCrumbsById.remove( strCrumbId );

    fireCrumbListeners( strCrumbId, crumbRemoved, m_aBreadCrumbRemovedListeners, ndx );

  } // end removeCrumb()

  /**
    * Removes all bread crumbs following the strAfterCrumbId
    * @param strAfterCrumbId  The bread crumb id to remove
    */
   function removeFollowing( strAfterCrumbId )
   {
     // start from the end and work backwards till we hit the strAfterId
     for ( let ndx = m_aBreadCrumbs.length -1 ; ndx >+ 0; ndx --)
     {
       const crumb = m_aBreadCrumbs[ ndx ];

       const strCrumbId = crumb[strCrumbIdProp];

       if ( strCrumbId == strAfterCrumbId )
       {
         return;

       }

       removeCrumb( strCrumbId, ndx );
      }
   } // end removeFollowing()


  /**
   * Fire any registered crumb added/removed listeners
   *
   * @param strCrumbId Thje crumbId addded or removed
   * @param aCrumbListeners
   */
  function fireCrumbListeners( strCrumbId,  crumb, aCrumbListeners, ndx )
  {
    for ( const crumbListener of aCrumbListeners )
    {
      crumbListener( strCrumbId, crumb, ndx );
    }
  } // end fireCrumbListeners()

  /**
   * Finds the array index that a crumb is in
   * @param strCrumbId The id of the crumb array index to find
   * @returns {number}
   */
   function findCrumbIndexById( strCrumbId )
   {
     for ( var x = 0, nLen = m_aBreadCrumbs.length; x < nLen; x++ )
     {
       if ( m_aBreadCrumbs[ x ][strCrumbIdProp] == strCrumbId )
       {
         return x;
       }
     }
   } // end findCrumbIndexById()

  /**
   * Returns the crumb on the end of the crumb chain
   */
  function getLastCrumb()
  {
    const ndx = m_aBreadCrumbs.length - 1;

    if ( ndx < 0 )
    {
      return null;
    }
    else
    {
      return m_aBreadCrumbs[ ndx ];
    }

  } // end getLastCrumb()

} // end  VwBreadCrumbMgrModel{}

export default VwBreadCrumbMgrModel;