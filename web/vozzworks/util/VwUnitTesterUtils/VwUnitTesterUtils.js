/*
 * Created by User: petervosburgh
 * Date: 5/6/22
 * Time: 8:00 AM
 * 
 */


import VwHashMap from "/vozzworks/util/VwHashMap/VwHashMap.js";
import VwPromiseMgr from "/vozzworks/util/VwPromiseMgr/VwPromiseMgr.js";
import VwResourceMgr from "/vozzworks/util/VwResourceMgr/VwResourceMgr.js";
import VwExString from "/vozzworks/util/VwExString/VwExString.js";

/**
 * Utils class to aid vwUnitTester
 *
 * @param strUnitTestProps Path to the VwUnitTestProperties
 * @param strSuitesToRun pathe to the suite(s) to process
 *
 * @return {Promise<unknown>}  Promise returned this is an await required constructor
 * @constructor
 */
function VwUnitTesterUtils( strUnitTestProps, strSuitesToRun)
{
  const self = this;

  const m_vwResourceMgr = new VwResourceMgr();

  let m_strNodeServerUrl;
  let m_promissMgr;

  this.getSuitesToProcess = getSuitesToProcess;
  this.getResourceMgrForSuite = getResourceMgrForSuite;
  this.postData = postData;
  this.getFileList = getFileList;
  this.getFile = getFile;
  this.invokeClickEvent = invokeClickEvent;
  this.setFieldVal = setFieldVal;
  this.getFieldVal = getFieldVal;
  this.getProperties = getProperties;
  this.getFormData = getFormData;
  this.fillFormFields = fillFormFields;

  /**
   * Object config called by promiss mgr
   * @return {Promise<void>}
   */
  async function configObject()
  {
    // load vw unit properties

    await m_vwResourceMgr.loadBundle( strUnitTestProps, true );

    m_strNodeServerUrl = m_vwResourceMgr.getString( "nodeJsServerUrl", null );

    if ( !m_strNodeServerUrl )
    {
      const errMsg = "Missing property key: 'nodeJsServerUrl' in  web/test/vwUnitTest.properties";

      alert( errMsg );
      throw errMsg;

    }

    m_promissMgr.success( self );
  }

  /**
   * Return an array of suites to run
   *
   * @return {Promise<*[]|*>}
   */
  async function getSuitesToProcess()
  {
    if (  strSuitesToRun.endsWith( "*") )
    {
      return getSuiteNamesToRun();
    }
    else
    {
      return [strSuitesToRun];      // This will be a single suite name
    }
  } // end getSuitesToProcess()

  /**
   * THis calls node node to a list of suite property named in the suite directory to run
   * @return {Promise<void>}
   */
  async function getSuiteNamesToRun()
  {
    // Remove the '* from the suite path

    const strSuiteBasePath = strSuitesToRun.substring( 0, strSuitesToRun.length - 1 );

    let strSuitesJSON = await getFileList( strSuiteBasePath + ".properties");

    const astrSuites = JSON.parse( strSuitesJSON );

    for( let x = 0; x < astrSuites.length; x++ )
    {
      let strSuitePath = astrSuites[ x ];
      astrSuites[ x ] = strSuitePath.substring( strSuitePath.indexOf( "/") + 1 );
      
    }
    return astrSuites;

  } // end getSuiteNamesToRun()


  /**
   * Loads the repousrce prop[erty bundle for the request suite props
   * @param suitPropsPath
   * @return {Promise<VwResourceMgr>}
   */
  async function getResourceMgrForSuite( suitPropsPath )
  {
    const suitResourceMgr = new VwResourceMgr();

    await suitResourceMgr.loadBundle( suitPropsPath, true );

    return suitResourceMgr;

  }
  /**
   * Post data to node JS
   * @param objHeaders Headers object
   * @param objContent The content data to post
   * @param strService The node service to execute
   * @return {Promise<void>}
   */
   async function postData( objHeaders, objContent, strService )
   {
     if ( !objHeaders )
     {
       objHeaders = {};

     }

     if ( !objContent )
     {
       objContent = ";"
     }

     const strUrl = `${m_strNodeServerUrl}/service/${strService}`;

     return await fetch( strUrl,
                  {
                    method:"POST",
                    headers: objHeaders,
                    body: objContent
                  })
             .then( processResponseHeaders )
             .then( resp =>
                    {
                      console.log( resp );
                      return resp;
                    })
             .catch( error =>
                     {
                       console.error( error )
                       throw error;
                     });

   } // end postData()

  async function getFileList( strBaseFIlePath )
  {

    const strUrl = `${m_strNodeServerUrl}/service/listFiles/${strBaseFIlePath}`;

    return await fetch( strUrl,
                        {
                          method:"GET"
                          //headers: objHeaders,
                        })
            .then( processResponseHeaders )
            .then( resp =>
                   {
                     return resp;
                   })
            .catch( error =>
                    {
                      console.error( error )
                      throw error;
                    });

  } // end postData()


  /**
   * Gets data from nodejs
   *
   * @param objHeaders Optional header object
   * @param strService The node service to execute
   * @return {Promise<void>}
   */
  async function getFile( objHeaders, strPathToFile )
  {

    return await this.getData( objHeaders, strPathToFile )

  } // end getFileList()


  function processResponseHeaders( response )
  {
    switch ( response.status )
    {
      case 200:

        return response.text();

      case 404:

        throw ` -- File Not Found: ${strPathToFile}`;

      default:

        throw `-- --Error get file File ${strPathToFile}, ${response.status}`;

    } // end switch()

  }


  /**
   * Invokes a click event on the specified dom action element
   * 
   * @param strActionId
   */
  function invokeClickEvent( strActionId )
  {
    $(`#${strActionId}`).click();

  }

  /**
   * Fills a dom element with data
   *
   * @param strDomEleId The dom element id to file
   * @param strDataToFill The data to put in the field
   */
  function setFieldVal( strDomEleId, strDataToFill )
  {
    $(`#${strDomEleId}`).val( strDataToFill );
  }

  /**
   * Gets a dom element value
   *
   * @param strDomEleId The dom element id to the the value
   */
  function getFieldVal( strDomEleId )
  {
    $(`#${strDomEleId}`).val();
  }

  /**
   * Fills the form elements from the data string which is a comma separated list if elementId:elememtValue emtries
   * @param strFormData
   */
  function fillFormFields( strFormData )
  {
    const astrFormEntries = strFormData.split( ",");

    for ( const strElementEntry of astrFormEntries )
    {
      const astrIdVal = strElementEntry.split(":");

      if ( astrIdVal.length != 2 )
      {
        throw "Invalid form field data entry. Must be in format id:idval";
      }

      // Put the data in the dom element
      $(`#${astrIdVal[0]}`).val( astrIdVal[ 1 ]);

    } // end for()

  } // end fillFormFields()


  /**
   * Gets the properties as a base 64 string and returns a property object
   * @param strEleId
   * @return {any}
   */
  function getProperties( strEleId )
  {
    // First get test suite properties
    let strMapPropsB64  = $(`#${strEleId}`).val();

    let strMapPropsJson = $.base64Decode( strMapPropsB64 );

    return JSON.parse( strMapPropsJson );

  }


  /**
   * Calls node js to get the request form data file
   *
   * @param strPathToFile The path to the file to read
   *
   * @return {Promise<VwHashMap>}
   */
  async function getFormData( strPathToFile )
  {
    const mapFormData = new VwHashMap();

    const strFormDataFile = await getFile( null, strPathToFile );

    const asteLines = strFormDataFile.split( "\n");

    for ( const strLineInFile of asteLines )
    {
      if ( strLineInFile.length == 0 || strLineInFile.startsWith( "#") || strLineInFile.startsWith( " ") ) // this is a comment line
      {
        continue;
      }

      const astrLinePieces = strLineInFile.split( "=");

      mapFormData.put( astrLinePieces[0], astrLinePieces[1]);

    } // end for()

    return mapFormData;

  }

  /**
   * THis is an await constructor
   */
  return new Promise( (success, fail ) =>
  {
    m_promissMgr = new VwPromiseMgr( success, fail, configObject );

  });

} // end VwUnitTesterUtils{}



export default VwUnitTesterUtils;
