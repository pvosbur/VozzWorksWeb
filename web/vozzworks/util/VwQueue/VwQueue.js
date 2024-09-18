/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2020 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 * ============================================================================================
 *
 */

/**
 * Implementation for a standard queue
 *
 * @constructor
 */
function VwQueue()
{
  let m_aQueueEntries = [];

  this.clear = clear;
  this.add = add;
  this.remove = remove;
  this.removeEntry = removeEntry;

  this.size = size;
  this.peek = peek;
  this.getAll = getAll;
  this.indexOf = indexOf;
  this.hasEntry = hasEntry;
  this.findByPropName = findByPropName;

  /**
   * Clears the queue of all entries
   */
  function clear()
  {
    m_aQueueEntries = [];

  }

  /**
   * Returns all queue data objects
   */
  function getAll()
  {
    return m_aQueueEntries;
  }


  /**
   * Adss an entry to the queue
   * @param object
   */
  function add( object )
  {
    m_aQueueEntries.push( object );
  }


  /**
   * Removes the entry at the head of the queue
   *
   * @param objTotRemove if specified removes the specific object from the queue
   * @returns The object that is being removed
   */
  function remove( objToRemove )
  {
    if ( m_aQueueEntries.length == 0 )
    {
      return null;
    }

    let nRemoveNdx = 0;

    // if specific object to remove, then find its index in the queue and remove that else remove from the top entery
    if ( objToRemove )
    {
      nRemoveNdx = indexOf( objToRemove );

      if ( nRemoveNdx < 0  )
      {
        return null;
      }

    }

    const obj = m_aQueueEntries[ nRemoveNdx ];

    m_aQueueEntries.splice( nRemoveNdx, 1 );


    return obj;

  }

  /**
   * Removes the entry at the tail of the queue
   *
   * @retrun the object that ws removed or null if the queue is empty
   */
  function removeTail()
  {
    if ( m_aQueueEntries.length == 0 )
    {
      return null;
    }

    return  m_aQueueEntries.pop();

  }

  /**
   * Removes the queue entry at the specified index
   * @param ndx The index of the queue entry to remove
   */
  function removeEntry( ndx )
  {
    m_aQueueEntries.splice( ndx, 1 );

  }


  /**
   * Return the number of entries in the queue
   * @returns {Number}
   */
  function size()
  {
    return m_aQueueEntries.length;

  }

  /**
   * Returns the next object that would be removed from the queue -- Does not remove
   * @returns {*}
   */
  function peek()
  {
    if ( m_aQueueEntries.length == 0 )
    {
      return null;
    }

    return m_aQueueEntries[ 0 ];

  }

  /**
   * Return true if the objToFind is in the queue
   *
   * @param objToFind The queue object to find
   * @returns {boolean}
   */
  function hasEntry(  strId, _strIdProp  )
  {
    return indexOf( strId, _strIdProp ) >= 0;
  }


  /**
   * Finds the index of the object in the queue
   *
    * @param objToFind
   * @returns {*} the index if found, -1 otherwise
   */
  function indexOf( strId, _strIdProp  )
  {
    let strIdProp;

    if ( !_strIdProp )
    {
      strIdProp = "id";
    }
    else
    {
      strIdProp = _strIdProp;
    }

    for ( let x = 0, nLen = m_aQueueEntries.length; x < nLen; x++ )
    {
      if ( m_aQueueEntries[ x ][strIdProp] == strId )
      {
        return x;
      }
    }

    return -1;

  } // end indexOf

  function findByPropName( strPropName, strPropValue )
  {
    for ( let x = 0, nLen = m_aQueueEntries.length; x < nLen; x++ )
    {
      if ( m_aQueueEntries[ x ][strPropName] == strPropValue )
      {
        return m_aQueueEntries[ x ];
      }
    }

    return null;

  }

} // end VwQueue()

export default VwQueue;