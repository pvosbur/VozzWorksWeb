/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   8/14/20

 Time Generated:   10:59 AM

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
import VwHashMap from "../VwHashMap/VwHashMap.js";

/**
 * High level wrapper for the VwPreferences object.
 *
 * @param vwPreferences The loaded preference object or null.Use fromJSON to initialize from a serialized VwPreferences JSON string
 * @constructor
 */
function VwPreferencesMgr( vwPreferences )
{

  let m_prefs = vwPreferences;

  const m_mapPrefGroups = new VwHashMap();

  const m_mapPrefsByGroup = new VwHashMap();

  buildMaps();


  /**
   * Gets a preference value by the group and preference keys
   *
   * @param strGroupName The group name the preference is in
   * @param strPrefName The name of the preference
   * @param strDefault  The default value (if specified) to return if preference does not exist
   *
   * @returns The value of the preference or null if preference doesnt exist
   */
  this.getPreference = function( strGroupName, strPrefName, strDefault )
  {
    const mapPrefsByGroup = m_mapPrefsByGroup.get( strGroupName );

    if ( mapPrefsByGroup == null )
    {
      return strDefault;
    }

    if ( !mapPrefsByGroup.containsKey( strPrefName ) )
    {
      return strDefault;

    }


    return mapPrefsByGroup.get( strPrefName );

  }


  /**
   * Sets/adds a preference. If the preference does not exist and the fAddIfNoExist is false, an exception is thrown
   *
   * @param strGroupName The name of the preference group
   * @param strPrefName  The name of the preference
   * @param strPrefValue The value of the preference
   * @param fAddIfNoExist If true (the default) then add the preference if it doesn't exist else just update its value
   */
  this.setPreference = function( strGroupName, strPrefName, strPrefValue, fAddIfNoExist )
  {

    let fAdd = true;

    if ( fAddIfNoExist )  // this is default if not defined
    {
      fAdd = fAddIfNoExist;
    }

    const vwPrefGroup = m_prefs.getGroup( strGroupName );

    if ( vwPrefGroup == null )
    {
      if ( !fAdd )
      {
        throw "Preference Group: " + strGroupName + " does not exist";
      }
      else
      {
        createNewPreference( strGroupName, strPrefName, strPrefValue );
        return;
      }

    }

    const vwPref = vwPrefGroup.getPreference( strPrefName );

    if ( vwPref == null )
    {
      if ( !fAdd )
      {
        throw "Preference Name: " + strPrefName + " does not exist";
      }
      else
      {
        createNewPreference( strGroupName, strPrefName, strPrefValue );
      }
    }
    else
    {
      vwPref.setValue( strPrefValue );
      const mapPrefValues = m_mapPrefsByGroup.get( strGroupName );

      // also put in map
      mapPrefValues.put( strPrefName, strPrefValue );

    }



  }

  /**
   * Removes a Preference group
   * @param strGroupName The preference group name to remove
   */
  this.removeGroup = function( strGroupName )
  {
    m_mapPrefGroups.remove( strGroupName );
    m_mapPrefsByGroup.remove( strGroupName );

    if ( m_prefs )
    {
      m_prefs.removeGroup( strGroupName );
    }

  }


  /**
   * Creates a new VwPreference object and puts it in the maps
   *
   * @param strGroupName The preference group name
   * @param strPrefName  The preference name
   * @param strPrefValue The preference value
   */
  function createNewPreference( strGroupName, strPrefName, strPrefValue )
  {

    let vwPrefGroup = m_mapPrefGroups.get( strGroupName );

    // see if the preference group exists and create it if it doesn't
    if ( vwPrefGroup == null  )
    {

      vwPrefGroup = new VwPreferenceGroup();
      vwPrefGroup.setName( strGroupName );

      m_prefs.addPreferenceGroup( vwPrefGroup );

      // Put new group in the maps
      m_mapPrefGroups.put( strGroupName, vwPrefGroup );

      m_mapPrefsByGroup.put( strGroupName, new VwHashMap() );
    }


    // create preference
    const vwPref = new VwPreference( strPrefName, strPrefValue );

    vwPrefGroup.addPreference( vwPref );

    // add new preference to the map
    const mapPrefsByGroup = m_mapPrefsByGroup.get( strGroupName );
    mapPrefsByGroup.put( strPrefName, strPrefValue );

  } // end createNewPreference()


  /**
   * Return the VwPreferences object graph
   * @returns {*}
   */
  this.getPreferences = function()
  {
    return m_prefs;

  }


  /**
   * Sets the top level preference graph with the VwPreferences object
   * @param vwPreferences The VwPreferences object instance
   */
  this.setPreferences = function( vwPreferences )
  {
    m_prefs = vwPreferences;

    buildMaps();

  }


  /**
   * Returns a VwPreferenceGroup object
   *
   * @param strGroupName The name of the preference group to get
   * @returns {*}
   */
  this.getGroup = function( strGroupName )
  {
    return m_mapPrefGroups.get( strGroupName );

  }


  /**
   * Serialize to JSON
   * @returns {*}
   */
  this.toJSON = function()
  {
    return m_prefs.toJSON();

  }


  /**
   * Create a new VwPreferences object from a serialized VwPreferences JSON string
   *
   * @param strPreferencesJSON  The VwPreferences object as a serialized JSON string
   * @returns {*}
   */
  this.fromJSON = function( strPreferencesJSON )
  {
    const prefs = JSON.parse(( strPreferencesJSON ));

    m_prefs = new VwPreferences( prefs );

    buildMaps();

    return m_prefs;


  }


  /**
   * Build hash maps for quick preference access
   */
  function buildMaps()
  {

    if ( !m_prefs  )
    {
      m_prefs = new VwPreferences();

      return;
    }


    const aPrefGroups = m_prefs.getPreferenceGroups();

    if ( !aPrefGroups )
    {
      return;
    }

    for ( let x = 0; x < aPrefGroups.length; x++ )
    {

      const prefGroup = aPrefGroups[ x ];
      const strGroupName = aPrefGroups[ x ].getName();

      m_mapPrefGroups.put( strGroupName, prefGroup );

      const aPrefs = prefGroup.getPreferences();

      if ( !aPrefs  )
      {
        continue;
      }


      const mapPrefValuesByName = new VwHashMap();

      for ( let y = 0; y < aPrefs.length; y++ )
      {
        const pref = aPrefs[ y ];

        if (!pref )
        {
          continue;
        }

        mapPrefValuesByName.put( pref.getName(), pref.getValue() );
      }


      m_mapPrefsByGroup.put( strGroupName, mapPrefValuesByName );

    } // end buildMaps()

  }


} // end VwPreferencesMgr{}


/**
 * The Top level parent f the preferences object graph
 *
 * @param objPreferences a VwPreferences object / may be null for a new preferences graph
 * @constructor
 */
function VwPreferences( objPreferences )
{

  const m_aPrefGroups = [];

  if ( objPreferences )
  {
    buildPrefGroups( objPreferences );

  }

  /**
   * Build the preference groups array
   *
   * @param objPreferences The VwPreferences object
   */
  function buildPrefGroups( objPreferences )
  {

    for ( let  x = 0; x < objPreferences.preferenceGroup.length; x++ )
    {
      const prefGroup = objPreferences.preferenceGroup[ x ];

      m_aPrefGroups.push( new VwPreferenceGroup( prefGroup ) );
     }

  }


  /**
   * Gets the array of preference groups
    */
  this.getPreferenceGroups = () =>
  {
    return m_aPrefGroups;

  }


  /**
   * Adds a VwPreferenceGroup object
   * @param vwPrefGroup
   */
  this.addPreferenceGroup = ( vwPrefGroup ) =>
  {
    m_aPrefGroups.push( vwPrefGroup );
  }


  /**
   * Gets the VwPreference group by the group name or null if id doesn't exist
   *
   * @param strGroupName The preference group name
   * @returns {*}
   */
  this.getGroup = ( strGroupName ) =>
  {
    for ( let x = 0; x < m_aPrefGroups.length; x++ )
    {
      const vwPrefGroup = m_aPrefGroups[ x ];

      if ( vwPrefGroup.getName() == strGroupName )
      {
        return vwPrefGroup;
      }
    }

    return null;

  }

  this.removeGroup = ( strGroupName ) =>
  {
    for ( let x = 0; x < m_aPrefGroups.length; x++ )
    {
      const vwPrefGroup = m_aPrefGroups[ x ];

      if ( vwPrefGroup.getName() == strGroupName )
      {
        m_aPrefGroups.slice( x, 1 );

      }
    }

  }


  /**
   * Serialize to JSON string
   *
   * @returns {string}
   */
  this.toJSON = () =>
  {
    let strPrefGroups = '{"preferenceGroup":[';

    for ( let x = 0; x < m_aPrefGroups.length; x++ )
    {
      if ( x > 0 )
      {
        strPrefGroups += ",";
      }

      strPrefGroups += m_aPrefGroups[ x ].toJSON();
    }

    strPrefGroups += "]}";

    return strPrefGroups;
  }


  /**
   * Create a new VwPreferences object from a serialized VwPreferences JSON string
   *
   * @param strJSON  The VwPreferences object as a serialized JSON string
   * @returns {*}
   */
  this.fromJSON = ( strJSON ) =>
  {
    const objPreferences = eval( "(" + strJSON + ")" );

    buildPrefGroups( objPreferences );

  }

} // end VwPreferences {}


/**
 * The Preference Grpup Object which has a name and an array VwPreference objects
 *
 * @param prefGroup The VwPreferenceGroup object
 * @constructor
 */
function VwPreferenceGroup( prefGroup )
{
  let   m_strName;
  const m_aPreferences = [];


  if ( prefGroup  )
  {
    m_strName = prefGroup.name;

    for ( let x = 0; x < prefGroup.preference.length; x++ )
    {
      const pref = prefGroup.preference[ x ];

      m_aPreferences.push( new VwPreference( pref ) )

    }

  }

  /**
   * returns the name of the preference group
   * @returns {*}
   */
  this.getName = () =>
  {
    return m_strName;
  }


  /**
   * Sets the preference group name
   * @param strName
   */
  this.setName = ( strName ) =>
  {
    m_strName = strName;

  }


  /**
   * Add a preference object
   * @param vwPreference  The VwPreference object to add
   */
  this.addPreference = ( vwPreference ) =>
  {
    m_aPreferences.push( vwPreference );
  }


  /**
   * Gets the array of preferences for ths group
   * @returns {Array}
   */
  this.getPreferences = () =>
  {
    return m_aPreferences;

  }


  /**
   * Gets the VwPreference object for the pref name or null if it doesn't exist
   *
   * @param strPrefName The Name of the preference to get
   * @param strDefault The default value to return if preference does not exist
   * @returns {*}
   */
  this.getPreference = ( strPrefName, strDefault ) =>
  {
    for ( let x = 0; x < m_aPreferences.length; x++ )
    {
      const vwPref = m_aPreferences[ x ];

      if ( vwPref.getName() == strPrefName )
      {
        return vwPref;
      }
    }

    return strDefault;

  }

  /**
   * Serialize to JSON string
   *
   * @returns {string}
   */
  this.toJSON = () =>
  {
    let strPrefs =  '{"name":"' + m_strName + '","preference":[';

    for ( let x = 0; x < m_aPreferences.length; x++ )
    {
      if ( x > 0 )
      {
        strPrefs += ",";
      }

      strPrefs += m_aPreferences[ x ].toJSON();
    }

    strPrefs += "]}";

    return strPrefs;
  }
}  // end  VwPreferenceGroup{}


/**
 * The VwPreference Object which has a name and a value
 *
 * @param objPreference The VwPreference Object
 * @constructor
 */
function VwPreference( strName, strValue )
{
  let m_strName;

  let m_strValue;

  // Poor man function overloading, I f one ar passed its a VwPreference object else its the name and value scalers
  if ( strValue )
  {
    m_strName = strName;

    m_strValue = strValue;

  }
  else
  {
    m_strName = strName.name;

    m_strValue = strName.value;

  }


  /**
   * Gets the name of the preference
   * @returns {*}
   */
  this.getName = () =>
  {
    return m_strName;
  }

  /**
   * Gets the preference value
   * @returns {*}
   */
  this.getValue = () =>
  {
    return m_strValue;
  }


  /**
   * Sets the preference value
   *
   * @param strValue The preference value to set
   */
  this.setValue = ( strValue ) =>
  {
    if ( typeof strValue == "boolean" || typeof strValue == "number" )
    {
      strValue = strValue.toString();
    }

    m_strValue = strValue;
  }


  /**
   * Serialize to JSON string
   * @returns {string}
   */
  this.toJSON = () =>
  {
    return '{"name":"' + m_strName + '","value":"' + m_strValue + '"}';
  }
} // end VwPreferencesMgr{}

export default VwPreferencesMgr;
