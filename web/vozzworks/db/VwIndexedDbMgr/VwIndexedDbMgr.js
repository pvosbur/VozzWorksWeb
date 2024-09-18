/*
 ============================================================================================


                                       Copyright(c) 2020

                                        V o z z W a r e

                                 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   5/15/20

 Time Generated:   8:06 AM

 ============================================================================================
 */

import VwHashMap from "../../util/VwHashMap/VwHashMap.js";

/**
 * This object manages all accces to the browsers IndexedDb. It supports all the CRUD operations that indexedDb supports.
 *
 * @param strDbName The name of the database to /open/create
 * @param nVersion  The database version number
 * @param avwObjectStores an array of VwDbObjectStore Objects
 *
 * @constructor
 */
function VwIndexedDbMgr( strDbName, nVersion, avwObjectStores )
{
  let m_db;

  const m_mapStores = new VwHashMap();

  this.open = open;

  /**
   * Open/Creates names database
   * @returns {Promise<unknown>}
   */
  function open()
  {
    return new Promise( (success, fail ) =>
    {
      const dbRequest = self.indexedDB.open( strDbName, nVersion );

      dbRequest.onsuccess = ( e =>
      {
        m_db = e.target.result;

        setupExistingStores();

        success();

      });

      dbRequest.onupgradeneeded = ( e =>
      {
        m_db = e.target.result;

        const transaction = e.target.transaction;

        let store;
        // Create keystore object for all stores in the array

        for ( const dbObjectStore of avwObjectStores )
        {
          const strStoreName = dbObjectStore.getName();

          if ( !m_db.objectStoreNames.contains( strStoreName ) )
          {
            store = m_db.createObjectStore( strStoreName, dbObjectStore.getPath() );

            const aIndexes = dbObjectStore.getIndexes();

            if ( aIndexes )
            {
              for ( const vwIndex of aIndexes )
              {
                store.createIndex( vwIndex.getName(), vwIndex.getIndexIdPropName(), vwIndex.getConstraint() );

              }
            }

          }
          else
          {
            store = transaction.objectStore( strStoreName );
          }

          dbObjectStore.setDb( m_db );
          dbObjectStore.setStore( store );
          dbObjectStore.setTransaction( transaction );

          m_mapStores.put( strStoreName, dbObjectStore );

        }

        success();

      });

    });

  } // end open()


  function setupExistingStores()
  {
    for ( const dbObjectStore of avwObjectStores )
    {
      const strStoreName = dbObjectStore.getName();

      const transaction = m_db.transaction( strStoreName, "readwrite");

      const store = transaction.objectStore( strStoreName );

      dbObjectStore.setDb( m_db );

      dbObjectStore.setTransaction( transaction );
      dbObjectStore.setStore( store );

      m_mapStores.put( strStoreName, dbObjectStore );

    }
  
  }

 } // end VwIndexedDbMgr{}

export {VwIndexedDbMgr};

function VwDbObjectStoreIndex( strIndexName, strIndexIdPropName, indexConstraint )
{
  this.getName = () => strIndexName;
  this.getIndexIdPropName = () => strIndexIdPropName;
  this.getConstraint = () => indexConstraint;

} // end VwDbObjectStoreIndex{}

export {VwDbObjectStoreIndex};

function VwDbObjectStore( strStoreName, keyStorePath, aKeyStoreIndex )
{
  let m_store;
  let m_transaction;
  let m_db;

  this.setDb = (db ) => m_db = db;
  this.getDb = () => m_db;

  this.getName = () => strStoreName;

  this.getPath = () => keyStorePath;

  this.setStore = ( store ) => m_store = store;
  this.getStore = () => m_store;

  this.setTransaction = ( transaction ) => m_transaction = transaction;

  this.getIndexes = () => aKeyStoreIndex;

  this.add = add;
  this.addAll = addAll;
  this.put = put;
  this.get = get;
  this.getAll = getAll;
  this.clear = clear;
  this.delete = deleteKey;
  this.deleteAll = deleteAll;
  this.hasKey = hasKey;
  this.count = count;

  /**
   * Gets a new transaction object for a get/write operation
   */
  function updateTransaction()
  {
    try
    {
      m_transaction = m_db.transaction( strStoreName, "readwrite" );
      m_store = m_transaction.objectStore( strStoreName );
    }
    catch( ex )
    {
      ; // version change, ignore error
    }

  }

  /**
   * Delete the record identified by its key
   * @param key
   * @returns {Promise<unknown>}
   */
  function deleteKey( key  )
  {
    updateTransaction();

    return new Promise( (success, fail ) =>
                        {

                          const dbOpReq = m_store.delete( key  );

                          dbOpReq.onsuccess = ( e =>
                          {
                            success( key );
                          });

                          dbOpReq.onerror = ( e =>
                          {
                            const strErrMsg = e.target.error.message + "=>" + m_store.keyPath + " :" + objToAdd[m_store.name ];

                            fail( strErrMsg );

                          });

                        });

  } //end deleteKey()

  function deleteAll( key, strIndexName )
  {
    updateTransaction();

    return new Promise( async (success, fail ) =>
                        {
                          if ( key )
                          {
                            doCursor();
                          }
                          else
                          {
                            doAll();
                          }

                          function doAll()
                          {
                            const dbRequest = m_store.getAll( key );

                            dbRequest.onsuccess = (event =>
                            {
                              success( event.target.result )
                            });

                            dbRequest.onerror = (event => fail( event.target.error ));
                          }

                          function doCursor()
                          {
                            const keyRng = IDBKeyRange.only(key );
                            const keyIndex =  m_store.index( strIndexName );

                            const cursorRequest = keyIndex.openCursor( keyRng );

                            let nRecDeleteCount = 0;

                            cursorRequest.onsuccess = ( e =>
                            {
                              const cursor = e.target.result;

                              if ( cursor )
                              {
                                ++nRecDeleteCount;
                                cursor.delete();
                                cursor.continue();
                              }
                              else
                              {
                                success( nRecDeleteCount );
                              }
                            });

                            cursorRequest.onerror = (e ) =>
                            {
                              fail( e.target.result );
                            }
                          }
                        });
  }

  /**
   * Puts ine (updates/or adds if key of object does not exists not exist)
   *
   * @param objToPut The object to update or add
   * @returns {Promise<unknown>}
   */
  function put( objToPut  )
  {
    updateTransaction();

    return new Promise( (success, fail ) =>
                        {
                          const dbOpReq = m_store.put( objToPut  );

                          dbOpReq.onsuccess = ( e =>
                          {
                            success( objToPut );
                          });

                          dbOpReq.onerror = ( e =>
                          {
                            const strErrMsg = e.target.error.message + "=>" + m_store.keyPath + " :" + objToAdd[m_store.name ];

                            fail( strErrMsg );

                          });

                        });


  }
  /**
   * Adds an object to the store speciified in the constructor
   *
   * @param objToAdd The object to add
   */
  function add( objToAdd, bIgnoreUpdateTransaction )
  {
    if ( !bIgnoreUpdateTransaction )
    {
      updateTransaction();
    }

    return new Promise( (success, fail ) =>
                        {
                          const dbOpReq = m_store.add( objToAdd  );

                          dbOpReq.onsuccess = ( e =>
                          {
                            success( objToAdd );
                          });

                          dbOpReq.onerror = ( e =>
                          {
                            const strErrMsg = e.target.error.message + "=>" + m_store.keyPath + " :" + objToAdd[m_store.name ];

                            fail( strErrMsg );

                          });

                        }); //end Promise()


  }

  /**
   * Adds an array of records to the current store
   *
   * @param aRecsToAdd
   * @returns {Promise<unknown>}
   */
  function addAll( aRecsToAdd )
  {
    updateTransaction();

    return new Promise( (success, fail ) =>
                        {
                          VwUtils.forEach( aRecsToAdd, ( ndx, recToAdd, fnNext ) =>
                          {
                            add( recToAdd, true ).then( (e) => fnNext() );

                          }, () =>
                          {
                            success();
                          });

                         });



  }

  /**
   * Gets a single record from the current store by its key
   * @param key The key of the record to get defined in the VwDbObjectStore.keyPath
   * @returns {Promise<unknown>}
   */
  function get( key )
  {
    updateTransaction();
    return new Promise( (success, fail ) =>
                        {
                          const dbRequest = m_store.get( key );

                          dbRequest.onsuccess = (event => success( event.target.result ) );

                          dbRequest.onerror = ( event => fail( event.target.error ));
                          
                        });
  }

  /**
   * Gets all records from the store or just those that match the key if specified
   *
   * @param key Key used to filter records retrunedn. if null, all records from the store are retrieved
   * @returns {Promise<unknown>}
   */
  function getAll( key, strIndexName, vwFilter )
  {
    updateTransaction();
    
    return new Promise( (success, fail ) =>
                        {
                          if ( key || vwFilter )
                          {
                            doCursor();
                          }
                          else
                          {
                            doAll();
                          }

                          function doAll()
                          {
                            const dbRequest = m_store.getAll( key );

                            dbRequest.onsuccess = (event =>
                            {
                              success( event.target.result )
                            });

                            dbRequest.onerror = (event => fail( event.target.error ));
                          }

                          function doCursor()
                          {
                            const keyRng = IDBKeyRange.only(key );
                            const keyIndex =  m_store.index( strIndexName );

                            const cursorRequest = keyIndex.openCursor( keyRng );

                            const aValues = [];

                            cursorRequest.onsuccess = ( e =>
                            {
                              const cursor = e.target.result;

                              if ( cursor )
                              {
                                const val = cursor.value;

                                if ( vwFilter )
                                {
                                  if ( vwFilter.match( val ) )
                                  {
                                    aValues.push( val );
                                  }
                                }
                                else
                                {
                                  aValues.push( val );

                                }
                                cursor.continue();
                              }
                              else
                              {
                                success( aValues );
                              }
                            });
                          }
                        });
  } // end getAll()



  function hasKey( key )
  {
    updateTransaction();
    
    return new Promise( (success, fail ) =>
                        {
                          const dbRequest = m_store.getKey( key );

                          dbRequest.onsuccess = ( event ) =>
                          {
                            success( event.target.result != null );

                          }

                          dbRequest.onerror = ( event => fail( event.target.error ));

                        });
  } // end hasKey()


  /**
   * Deletes all records from the current store
   * @returns {Promise<void>}
   */
  async function clear()
  {
    await m_store.clear();

  }

  /**
   * Counts the records in the store
   * @returns {Promise<unknown>}
   */
  async function count()
  {
    return await new Promise( (success, fail ) =>
    {
      const dbRequest = m_store.count();

      dbRequest.onsuccess = ( event ) =>
      {
        success( event.target.result );
        
      }
    });

  } // end count()
 
} // end VwDbObjectStore{}

export {VwDbObjectStore};


/**
 * Filter records returned based on values set in the filer object. The property names in the filter must match the property  names in the record
 * @param filter The filter object with proprty names and values to match on. every property specified in the filetr must match the values in the recored retrieved
 *
 * @constructor
 */
function VwDbFilter( filter )
{
  this.match = match;

  function match( recToMatch )
  {
    for ( const prop in filter )
    {
      const propFilterVal = filter[prop ];
      const recVal = recToMatch[ prop ];

      return propFilterVal === recVal;

    }
  }
}

export {VwDbFilter};




