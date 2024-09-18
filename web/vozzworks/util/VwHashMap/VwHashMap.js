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
 * Implements a java style HashMap
 *
 * @constructor
 */
function VwHashMap()
{

  let m_objMap = {};

  /**
   * Clears the map object
   */
  this.clear = function()
  {
    m_objMap = {};

  };

  /**
   * Put an object into the hashmap
   *
   * @param strMapKey The map key
   *
   * @param objMapEntry The map object
   */
  this.put = function ( strMapKey, objMapEntry )
  {

    m_objMap[ strMapKey] = objMapEntry;

  }; // end put()


  /**
   * Gets an entry from the map
   */
  this.get = function( strMapKey )
  {
    return m_objMap[ strMapKey ];
  };


  /**
   * Returns true if key is on the HashMap, false otherwise
   */
  this.containsKey = function( strKey )
  {
    return m_objMap.hasOwnProperty( strKey );
  };


  /**
   * Gets an array of map keys
   */
  this.keys = function()
  {

    const astrKeys = [];

    for ( const strKey in m_objMap )
    {
      astrKeys.push( strKey );
    }


    return astrKeys;

  }; // end keys()


  /**
   * Gets an array of map values
   */
  this.values = function()
  {

    const astrValues = [];

    for ( const strKey in m_objMap )
    {
      astrValues.push( m_objMap[ strKey ] );
    }

    return astrValues;

  }; // end values()

  /**
   * Removes the hash map entry
   *
   * @param strKey  The key of the object to be removed
   */
  this.remove = function( strKey )
  {
    const mapEntry = m_objMap[ strKey ];
    delete m_objMap[ strKey ];

    return mapEntry;

  };


  /**
   * Returns the nbr of elements in the map
   * @returns {number}
   */
  this.size = function()
  {
    let nNbrKeys = 0;
    for ( const strKey in m_objMap )
    {
      ++nNbrKeys;
    }

    return nNbrKeys;

  };

} // end VwHashMap{}

export default VwHashMap;
