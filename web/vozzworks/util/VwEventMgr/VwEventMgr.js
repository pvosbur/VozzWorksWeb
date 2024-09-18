/**
 ============================================================================================


 Copyright(c) 2014 By

 V o z z w a r e

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   8/14/20

 Time Generated:   10:57 AM

 ============================================================================================
 */
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

function VwEventMgr()
{

  function VwEventEntry( strOwnerId, callback )
  {
    this.ownerId = strOwnerId;
    this.callback = callback;
  } // end VwEventEntry()


  const m_mapEvents = new Object();

  /**
   * Adds a callback to the event list
   *
   * @param strEventId The id of the event
   * @param ownerId The name of theobject that owns the event - this prevents dup events entries
   * @param callback The callback function
   */
  this.addEventListener = function( strEventId, ownerId, callback )
  {
    // if ownerId is an object i.e. like using self or this, we use its constructor name as a string
    let strOwnerId = (typeof ownerId == "object")?ownerId.constructor.name : ownerId;

    let aEventList = m_mapEvents[ strEventId ];

    if ( aEventList == null )
    {
      aEventList = new Array();
      m_mapEvents[ strEventId ] = aEventList;
      aEventList.push( new VwEventEntry( strOwnerId, callback ));

    }
    else
    {
      for ( const vwEvent of aEventList  )
      {
        if ( aEventList.ownerId == strOwnerId )
        {
          // Event already exists for this type and owner so just update the callback pointer
          vwEvent.callback = callback;
          return;
        }
      }

      // Event for this owner id does not exist so add it
      aEventList.push( new VwEventEntry( strOwnerId, callback ));

    }

  }; // end addEventListener{}


  /**
   * Removes all events for the given event id
   * @param strEventId The event id to remove all associated events
   */
  this.removeEventList = function( strEventId )
  {
    let  aEventList = m_mapEvents[ strEventId ];
    aEventList = null;
    m_mapEvents[ strEventId ] = null;

  }; // end removeEventList{}


  /**
   * Remove specified callback from the event list
   * @param strEventId The event id to remove
   * @param ownerId The ownder id to remove the eventid entry
   */
  this.removeEventListener = function( strEventId, ownerId )
  {
    // if ownerId is an object i.e. like using self or this, we use its constructor name as a string
    let strOwnerId = (typeof ownerId == "object")?ownerId.constructor.name : ownerId;

    const  aEventList = m_mapEvents[ strEventId ];

    if ( aEventList == null )
    {
      return;

    } // sanity check

    for ( let x = 0; x < aEventList.length; x++ )
    {
      if ( aEventList[ x ].ownerId == strOwnerId )
      {
        aEventList.splice( x, 1 );
        return;
      }
    }

  }; // end removeEventListener{}


  /**
   * Tests for the existence of an event listener
   *
   * @param strEvent The event id to test
   * @param ownerId The event owner
   *
   * @return {Boolean}
   */
  this.exist = function( strEvent, ownerId  )
  {
    const aEventList = m_mapEvents[ strEventId ];

    if ( aEventList == null )
    {
      return false;
    }

    // if ownerId is an object i.e. like using self or this, we use its constructor name as a string
    let strOwnerId = (typeof ownerId == "object")?ownerId.constructor.name : ownerId;

    for ( const vwEvent of aEventList )
    {
      if ( vwEvent.ownerId == strOwnerId )
      {
        return true;
      }
    }

    return false;

  }; // end exist()


  /**
   * Notify all listeners of the event
   *
   * @param strEventId The event id of the listeners
   * @param objEvent The object being passed to the registered callbacks
   * @param fnComplete An optional callback handler passed for when the evenent has completed
   */
  this.fireEvent = function( strEventId, objEvent, fnComplete )
  {
    const aEventList = m_mapEvents[ strEventId ];

    if ( aEventList == null )
    {
      return;
    }

    for ( const vwEvent of aEventList )
    {
      if ( !vwEvent.callback )
      {
        continue;
      }

      vwEvent.callback( objEvent, fnComplete );
    }

  } // end fireEvent

} // end VwEventMgr{}

export default VwEventMgr;