/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2022 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 * ============================================================================================
 *
 */

import {VwClass, VwProperty, VwMethod} from "/vozzworks/util/VwReflection/VwReflection.js";
import VwAssert from "/vozzworks/util/VwAsserts/VwAsserts.js";
import VwMethodTestStats from "/vozzworks/util/VwUnitTester/VwMethodTestStats.js";
import VwExString from "/vozzworks/util/VwExString/VwExString.js";
import VwDate from "/vozzworks/util/VwDate/VwDate.js";
import VwUnitTesterUtils from "/vozzworks/util/VwUnitTesterUtils/VwUnitTesterUtils.js";

/**
 * This is the Unit driver class that will run the tests and produce a report
 * @param strNameOrPathToTestHarness will be path to the javascript test harness if the object is is a module, else it will be the name of<br/>
 *  a test harness constructor function if it is a non module. This class works similar as the Java JUnit, where a test object is created<br/>
 *  with the methods to run. Methods to be executed must all start with the prefix of test I.E. testAddress, testDateHandling, etc ...
 *
 * @constructor
 */
function VwUnitTester( strUnitTestProps, strSuiteProps )
{

  const dtSuiteRundate = new VwDate();
  const m_strSuiteRunDate = dtSuiteRundate.format( "EEE MMM dd yyyy HH:mm:ss")

  let   m_aHarnessStats;
  let   m_aTestedMethodStats;

  let m_utils;
  let m_astrSuitesToProcess;
  let m_bUnitTestFailed = false;

  let m_strSuiteFileNameRunDate = VwExString.replaceAll( m_strSuiteRunDate, " ", "_" );
  m_strSuiteFileNameRunDate = VwExString.replaceAll( m_strSuiteFileNameRunDate, ":", "_" );

  let m_bNodeServerAlive = false;
  let m_nTotSuiteRunTime = 0;
  let m_aTestsToRun;
  let m_strTestSuiteName;


  this.startTests = startTests;

  // Start the process
  async function startTests()
  {
    $("body").append( "<h1>Suite Stats</h1>" );


    m_utils = await new VwUnitTesterUtils( strUnitTestProps, strSuiteProps );
    // First amke sure nodeJs server is running

    const bContinue = await pingNodeJs();

    if ( !bContinue )
    {
      return;
    }

    m_astrSuitesToProcess = await m_utils.getSuitesToProcess();

    for ( const strSuiteToProcess of m_astrSuitesToProcess )
    {

      $("body").append( `<h3>Starting suite ${strSuiteToProcess}</h3>` );
      m_bUnitTestFailed = false;

      m_aTestedMethodStats = [];
      m_aHarnessStats = [];

      // Remove the .properties from the suite name
      m_strTestSuiteName = strSuiteToProcess.substring( 0, strSuiteToProcess.indexOf( "."));
      
      const suiteResourceMgr = await m_utils.getResourceMgrForSuite( strSuiteToProcess);

      if ( !checkSuiteProperties( suiteResourceMgr ) )
      {
        return;
      }


      for ( const strUnitTestPath of m_aTestsToRun )
      {
        await loadTestHarness( strUnitTestPath ).then( runTests );
      }

      renderTestSuiteReport();

      if ( m_bUnitTestFailed )
      {
        $("body").append( `<span class="Failed">Suite Failed</span>`)
        sendUnitErrorEmailToHarnessOwner( suiteResourceMgr )
      }
      else
      {
        $("body").append( `<span class="Passed">Suite Passed</span>`)

      }
    }

    return m_bUnitTestFailed;


  } // end startTests

  /**
   * Make sure all required properties are defined in the suite
   * @param resourceMgr The resource mgr for property values
   * @return {boolean}
   */
  function checkSuiteProperties( resourceMgr )
  {

    const strAuthor = resourceMgr.getString( "author", null );
    const strEmail = resourceMgr.getString( "email", null );
    const strTestsToRun = resourceMgr.getString( "unitTests", null);

    if ( !strAuthor )
    {
      alert( `'author' property is required in the ${m_strTestSuiteName}.properties file. Please fix and re-run` );
      return false;
    }

    if ( !strEmail )
    {
      alert( `'email' property is required in the ${m_strTestSuiteName}.properties file. Please fix and re-run` );
      return false;

    }

    if ( !strTestsToRun )
    {
      alert( `'strTestsToRun' property is required in the ${m_strTestSuiteName}.properties file. Please fix and re-run` );
      return false;

    }

    m_aTestsToRun = strTestsToRun.split( ",");

    return true;

  } // end


  /**
   * Loads the testHarness class.
   * @return {Promise<void>}
   */
  async function loadTestHarness( strNameOrPathToTestHarness )
  {
    let harnessClass;

    return new Promise( async (success, fail ) =>
    {
      try
      {
        if ( strNameOrPathToTestHarness.endsWith( ".js" ) ) // this is a module to test
        {
          harnessClass = await VwClass.forModule( strNameOrPathToTestHarness );

        }
        else
        {
           harnessClass = await VwClass.forName( strNameOrPathToTestHarness );

        }

        VwAssertions.isNotNull( harnessClass, `Expected to get a VwClassObject for the test harness ${strNameOrPathToTestHarness} but got null` )

        const harnessSpec = {};
        harnessSpec.harnessClass = harnessClass;
        harnessSpec.strNameOrPathToTestHarness = strNameOrPathToTestHarness;

        success( harnessSpec );
      }
      catch( err )
      {
        console.error( err.toString() )
        fail( err );
      }

    }) // end Promise;


  } // end loadTestHarness()

  /**
   * Load and run the public methods that begin with test to test
   *
   * @param fnHarnessClass
   */
  async function runTests( harnessSpec )
  {
    let nNbrMethodsRun = 0;
    let nFailedTests = 0;
    let nPassedTests = 0;
    let nTotalRunTime = 0;

    const aMethodsToTest =  harnessSpec.harnessClass.getPublicMethods();

    const aFilteredMethods = aMethodsToTest.filter( vwMethod => vwMethod.getName().startsWith( "test"))

    VwAssertions.isNotNull( aFilteredMethods, `Expected an array of public methods to test that start with 'test for ${harnessSpec.strNameOrPathToTestHarness} but got none  `)

    const harnessImpl = harnessSpec.harnessClass.getConstructor().newInstance( [m_utils] );

    for ( const vwMethodToTest of aFilteredMethods )
    {
      let strFailReason;
      let bPassed = true;
      let nStartTime;
      let nEndTime;
      let strErrorStackTrace;

      ++nNbrMethodsRun;

      try
      {
        nStartTime = Date.now()
        await vwMethodToTest.invoke( harnessImpl, null );


        ++nPassedTests;
      }
      catch( err )
      {
        strFailReason = err.toString();
        console.error( strFailReason );
        bPassed = false;
        ++nFailedTests;
        m_bUnitTestFailed = true;
      }

      nEndTime = Date.now();

      const nTestMethodRunTime = nEndTime - nStartTime;
      nTotalRunTime += nTestMethodRunTime;

      let strPassOrFailClass;
      let strPassOrFail;

      if ( bPassed )
      {
        strPassOrFailClass = "VwPassedTest";
        strPassOrFail = "Passed"
      }
      else
      {
        strPassOrFailClass = "VwFailedTest";
        strPassOrFail = "Failed"

      }

      const vwMethodStats = new VwMethodTestStats( harnessSpec.strNameOrPathToTestHarness, vwMethodToTest.getName(), strPassOrFail, nTestMethodRunTime, strFailReason, strPassOrFailClass );

      m_aTestedMethodStats.push( vwMethodStats );

    } // end for

    m_nTotSuiteRunTime = nTotalRunTime;

    const statsObj = {};
    statsObj.harnessName = harnessSpec.strNameOrPathToTestHarness;
    statsObj.passOrFail = nFailedTests > 0 ? "Failed" : "Passed";

    if ( statsObj.passOrFail == "Passed" )
    {
      statsObj.passOrFailClass = "VwPassedTest";
    }
    else
    {
      statsObj.passOrFailClass = "VwFailedTest";

    }
    
    statsObj.nbrTestsRun = nNbrMethodsRun;
    statsObj.nbrPassedTests = nPassedTests;
    statsObj.nbrFailedTests = nFailedTests;
    statsObj.totalRunTime = nTotalRunTime;
    statsObj.testedMethodStats = m_aTestedMethodStats;

    const runDate = new VwDate();

    statsObj.runDate = runDate.format( "EEE MMM dd yyyy HH:mm:ss")

    let strReportFileNameDate = runDate.format( "MM dd yy HH mm ss" );

    strReportFileNameDate = VwExString.replaceAll( strReportFileNameDate, " ", "_");
    strReportFileNameDate = VwExString.replaceAll( strReportFileNameDate, ":", "_");

    statsObj.reportFileNameDate = strReportFileNameDate;

    m_aHarnessStats.push( statsObj );
    
    renderHarnessReport( statsObj, harnessSpec.strNameOrPathToTestHarness);

   } // end runTests()

  /**
   * Renders the html results of the test run
   */
  function renderHarnessReport( statsObj, strNameOrPathToTestHarness )
  {

    const strHtmlDecl = `<!DOCTYPE html>
                         <html lang="en">`;

    let strRenderedHtml = VwExString.expandMacros( getHarnessHtmlBody(), statsObj );

    // Add in the individual test method stats

    const strMethodRunStatHtml = getHarnessMethodRunStatHtml();

    for ( const methodStat of statsObj.testedMethodStats )
    {
      const strRenderedMethodStats = VwExString.expandMacros( strMethodRunStatHtml, methodStat, "" );
      strRenderedHtml += strRenderedMethodStats;
    }

    // add in closing div
    strRenderedHtml += "\n</div>\n</body>";

    // Assemble the complete html doc
    const strHtmlToSave = strHtmlDecl + getHarnessHtmlHead() + strRenderedHtml;

    sendToNodeJs( strHtmlToSave, strNameOrPathToTestHarness, statsObj.reportFileNameDate, true );

  } // end renderHarnessReport


  /**
   * Renders the html results of the entire test test
   */
  function renderTestSuiteReport()
  {
    const objSuiteStats = buildTestSuiteStats();

    const strHtmlDecl = `<!DOCTYPE html>
                         <html lang="en">`;

    const strBodyHtml = getTestSuiteBodyHtml() ;

    let strRenderedHtml = VwExString.expandMacros( strBodyHtml, objSuiteStats );

    // Add in the individual test method stats

    const strTestSuiteStatHtml = getTestSuiteStatsHtml();


    for ( const harnessStat of m_aHarnessStats )
    {
      const strRenderedMethodStats = VwExString.expandMacros( strTestSuiteStatHtml, harnessStat );
      strRenderedHtml += strRenderedMethodStats;
    }

    // add in closing div
    strRenderedHtml += "\n    </div>\n  </body>\n</html>";

 
    // Assemble the complete html doc
    const strHtmlToSave = strHtmlDecl + getTestSuiteHeadHtml() + strRenderedHtml;
    sendToNodeJs( strHtmlToSave, null, m_strSuiteFileNameRunDate, false );

  } // end renderHarnessReport

  /**
   * Build a testSuiter object stats fromm the testharnesses run
   */
  function buildTestSuiteStats()
  {
    const objSuiteStats = {};

    objSuiteStats.suiteName = m_strTestSuiteName;
    objSuiteStats.runDate = m_strSuiteRunDate;
    objSuiteStats.nbrTestHarnessesRun = m_aHarnessStats.length;

    const objPassFailCounts = getHarnessPassFail();
    objSuiteStats.nbrPassedTestHarnesses = objPassFailCounts.nbrPassedTests;

    objSuiteStats.nbrFailedTestHarnesses = objPassFailCounts.nbrFailedTests;
    objSuiteStats.totalRunTime = m_nTotSuiteRunTime;

    return objSuiteStats;

  } // end  buildTestSuiteStats()

  /**
   * Returns an object with the nbr of passed test harness and nbr of failed btest harness
   *
   * @return {number}
   */
  function getHarnessPassFail()
  {
    let nPassCount = 0;
    let nFailCount = 0;

    for ( const harnessStats of m_aHarnessStats )
    {
      if ( harnessStats.nbrFailedTests > 0 )
      {
        ++nFailCount
      }
      else
      if ( harnessStats.nbrPassedTests > 0 )
      {
        ++nPassCount
      }

     } // end for()

    const objPassFailCounts = {};

    objPassFailCounts.nbrFailedTests = nFailCount;
    objPassFailCounts.nbrPassedTests = nPassCount;

    return objPassFailCounts;
  }

  /**
   * Sends  error report to author of the failed vw unit test
   */
  function sendUnitErrorEmailToHarnessOwner( suiteResourceMgr )
  {
    const aFailedHarnessMethods = getFailedHarnessMethods();

    let strBaseEmailHtml = getEmailBody();

    strBaseEmailHtml = strBaseEmailHtml.replace( "${author}", suiteResourceMgr.getString( "author" ));
    strBaseEmailHtml = strBaseEmailHtml.replace( "${runDate}", m_strSuiteRunDate);
    strBaseEmailHtml = strBaseEmailHtml.replace( "${testSuiteName}", m_strTestSuiteName);

    let strFailedMethod = `<span class="HarnessReport">HarnessName:</span><span>\${harnessName}</span>
                           <span class="HarnessReport">Fail Reason:</span><span>\${failReason}</span><br/><br/>`

    for ( const methodStats of aFailedHarnessMethods )
    {
      strFailedMethod = strFailedMethod.replace( "${harnessName}", methodStats.harnessName );
      strFailedMethod = strFailedMethod.replace( "${failReason}", methodStats.failReason );

      strBaseEmailHtml += strFailedMethod;
    }

    strBaseEmailHtml += "</body></html>";

    const emailSpec = {};

    emailSpec.subject = "Vw Unit Error Report"
    emailSpec.from = suiteResourceMgr.getString( "fromAddress");
    emailSpec.to = suiteResourceMgr.getString( "email");
    emailSpec.body = strBaseEmailHtml;

    m_utils.postData( null, JSON.stringify( emailSpec), "email" )

  }

  /**
   * Gets an array of failed method stat objects
   * @return {*[]}
   */
  function getFailedHarnessMethods()
  {
    const aFailedHarnessMethods = [];

    for ( const harnessStat of m_aTestedMethodStats )
    {
      if ( harnessStat.passOrFail != "Passed")
      {
        aFailedHarnessMethods.push( harnessStat );
      }
    }

    return aFailedHarnessMethods;

  } // end getFailedHarnessMethods()

  /**
   * Return the email  error report html body
   */
  function getEmailBody()
  {
    let strHtmlMail =
    `<!DOCTYPE html>
      <html lang="en">
      <head>
        <style>
          #mainEmail
          {
            width:100%;
          }
          
          h2
          {
            background:#5c9ec9;
          }

          h3
          {
            margin-bottom:.5em;
          }
          
          .HarnessReport
          {
            font-weight:bold;
            margin-right:.5em;
            margin-left:.5em;
          
          }      
        </style>
        <meta charset="UTF-8">
      </head>
      <body>
        <div id="mainEmail">
          <h2>Cr8Content Failed Unit Report </h2> 
          <span id="slutation">\${author},</span><br/>
          <div>
            <br/><span>Test Suite \${testSuiteName} failed on \${runDate}.
            <span>Your immediate attention is needed as this is holding up the build process.<br/>
            <span>Please contact the build manager when the issue(s) are rsolved.</span><br/>
            <span>Listed below are the test harnesess methods that failed:</span><br/>
        <div id="harnessList">
        <h3>Failed Harness/Methods List</h3>`

    return strHtmlMail;
    
  } // end getEmailBody()

  
  /**
   * Returns the harness method run stats html
   * @return {string}
   */
  function getHarnessMethodRunStatHtml()
  {
    const strMethodRunStat =
        `<div class="VwMethodStats">
           <span>Method Name:&nbsp;\${methodName}</span>
           <span class="\${passOrFailClass}">Status:&nbsp;\${passOrFail}&nbsp;\${failReason}</span>
           <span>Execution Time:&nbsp;\${executionTime}</span>
           <div class="VwDashedLineDivider"></div>
         </div>`

    return strMethodRunStat;

  } // end getHarnessMethodRunStatHtml()


  /**
   * Returns the  html <head> element tag
   * @return {string}
   */
  function getHarnessHtmlHead()
  {
    const strHtmlHead =
            `<head>
      <meta charset="UTF-8">
      <style>
        #vwTesterParent
        {
          width:60em;
          height:40em;
          border:1px solid black;
          background:whitesmoke;
          display:flex;
          flex-direction:column;
          margin-left:auto;
          margin-right:auto;
        }
    
        #vwTitleContainer
        {
          width:100%;
          height:2em;
          font-size:140%;
          font-weight:bold;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#5c9ec8;
        }
    
        #vwRunStatsContainer
        {
          display:flex;
          justify-content:center;
    
        }
    
        #vwTestHarnessName
        {
          margin-top:1em;
          margin-left:1em;
    
          font-weight:bold;
          font-size:130%;
        }
        
        #vwRunStats
        {
          margin-top:1em;
          font-size:110%;
          font-weight:bold;
          display:flex;
          flex-direction:column;
        }
    
        .VwLineItem
        {
          margin:.2em;
        }
    
        .VwFailedTest
        {
          color:red;
        }
        .VwPassedTest
        {
          color:green;
        }
    
        .VwDivider
        {
          width:100%;
          height:2px;
          background:black;
          margin-top:.5em;
          margin-bottom:.5em;
        }
    
        .VwStatsByMethod
        {
          margin-top:.1em;
          font-weight:bold;
          font-size:120%;
          text-align:center;
        }
    
        .VwMethodStats
        {
          width:100%;
          margin-left:1em;
          margin-top:2px;
          display:flex;
          flex-direction:column;
    
    
        }
    
        .VwDashedLineDivider
        {
          height:2px;
          margin-top:.4em;
          width:98%;
          overflow: hidden;
          border-bottom:1px dashed; 
        }
    
      </style>
      <title>VwUnitTester</title>
    </head>`;

    return strHtmlHead;

  } // returns the html head element for the harness report


  /**
   * Returns the harness reports html body
   * @return {string}
   */
  function getHarnessHtmlBody()
  {
    const strHtmlBody = `
    <body>
      <div id="vwTesterParent">
        <div id="vwTitleContainer">
          <span>Vw Unit Test Report</span>
        </div>
        <div id="vwTestHarnessName" class="VwLineItem">
          <span>Test Harness Class:</span>
          <span id="testClassname">&nbsp;\${harnessName}</span>
          <br/>
        </div>
      
        <div id="vwRunStatsContainer">
          <div id="vwRunStats">
           <div class="VwLineItem">
              <span>Run Date:</span>
              <span>\${runDate}</span>
              <br/>
            </div>
            <div class="VwLineItem">
              <span>Nbr of tests run:</span>
              <span>\${nbrTestsRun}</span>
            </div>
            <div class="VwLineItem VwPassedTest">
              <span>Nbr of passed tests:</span>
              <span>\${nbrPassedTests}</span>
            </div>
            <div class="VwLineItem VwFailedTest">
              <span >Nbr of failed tests:</span>
              <span>\${nbrFailedTests}</span>
            </div>
            <div class="VwLineItem">
              <span>Total run time of all tests:</span>
              <span>\${totalRunTime}</span>
            </div>
          </div>
        </div>
      <div class="VwDivider"></div>
      <span class="VwStatsByMethod">Stats by Method</span>
      <div class="VwDivider"></div>`

    return strHtmlBody;

  } // end getHarnessHtmlBody()


  /**
   * Returns the harness method run stats html
   * @return {string}
   */
  function getTestSuiteStatsHtml()
  {
    const strTesstSuiteStat =
        `<div></div>
         <div class="VwHarnessStats">
         <span>Harness Name:&nbsp;\${harnessName}</span>
         <span class="\${passOrFailClass}">Status:&nbsp;\${passOrFail}</span>
         <span class="VwPassedTest">Nbr Methods Passed: &nbsp;\${nbrPassedTests}</span>
         <span class="VwFailedTest">Nbr Methods Failed: &nbsp;\${nbrFailedTests}</span>
         <span>Execution Time:&nbsp;\${totalRunTime}</span>
         <div class="VwDashedLineDivider"></div>
       </div>`

    return strTesstSuiteStat;

  } // end getTestSuiteStatsHtml()

  /**
   * Returns the html head element for the test suite report
   * @return {string}
   */
  function getTestSuiteHeadHtml()
  {
    const strHtmlHead =
      `<head>
        <meta charset="UTF-8">
        <style>
          #vwTesterParent
          {
            width:60em;
            height:40em;
            border:1px solid black;
            background:whitesmoke;
            display:flex;
            flex-direction:column;
            align-items:center;
            margin-left:auto;
            margin-right:auto;
          }
          
          #vwTitleContainer
          {
            width:100%;
            height:2em;
            font-size:140%;
            font-weight:bold;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#5c9ec8;
          }
          
           #vwRunStats
          {
            margin-top:1em;
            font-size:110%;
            font-weight:bold;
            display:flex;
            flex-direction:column;
          
          }
          
          .VwLineItem
          {
            margin:.2em;
          }
          
          .VwFailedTest
          {
            color:red;
          }
          .VwPassedTest
          {
            color:green;
          }
          
          .VwStatsByTest
          {
            font-size:115%;
            font-weight:bold;
            margin-top:.5em;
            margin-botom:.5em;
          }
          
          .VwDivider
          {
            width:100%;
            height:2px;
            background:black;
            margin-top:.4em;
            margin-bottom:.4em;
          }
          
          #vwStatsByHarness
          {
            margin-top:.4em;
            font-weight:bold;
            font-size:120%;
          }
          
          .VwHarnessStats
          {
            width:100%;
            margin-left:2em;
            margin-top:2px;
            display:flex;
            flex-direction:column;
            
          }
          
          .VwDashedLineDivider
          {
            height:2px;
            margin-top:.4em;
            width:98%;
            overflow: hidden;
            border-bottom:1px dashed; 
          }
        </style>
        <title>VwUnitTester</title>
    </head>`;

    return strHtmlHead;

  }

  /**
   * return the html body element for the test suite report
   */
  function getTestSuiteBodyHtml()
  {
     const strHtmlBody =
      `<div id="vwTesterParent">
        <div id="vwTitleContainer">
          <span>Vw Unit Test Report for Suite:</span>
          <span>&nbsp;\${suiteName}</span>
        </div>
      
        <div id="vwRunStats">
            <div class="VwLineItem">
            <span>Run Date::</span>
            <span>\${runDate}</span>
              <br/>
          </div>
          <div class="VwLineItem">
            <span>Nbr of test harnesses run:</span>
            <span>\${nbrTestHarnessesRun}</span>
          </div>
          <div class="VwLineItem VwPassedTest">
            <span>Nbr of test harnesses passed:</span>
            <span>\${nbrPassedTestHarnesses}</span>
          </div>
          <div class="VwLineItem VwFailedTest">
            <span >Nbr of test harnesses failed:</span>
            <span>\${nbrFailedTestHarnesses}</span>
          </div>
          <div class="VwLineItem">
            <span>Total run time of all tests:</span>
            <span>\${totalRunTime}</span>
          </div>
        </div>
        <span class="VwStatsByTest">Stats By Test Harness</span>
        <div class="VwDivider"></div>`

    return strHtmlBody;

  } // end getTestSuiteBodyHtml()


  /**
   * Sends the report html to node js to be saved to the VwUnit report folder in the root of the cr8content.com project
   *
   * @param strHtmlToSave The html to save
   */
  async function sendToNodeJs( strHtmlToSave, strNameOrPathToTestHarness, strReportFileNameDate, bUnitReport )
  {
    
    let strFileFolder = "/vwUnitReports";
    let strReportName;

    if ( bUnitReport )
    {
      // Here we keep the path of the VwUnit test harness
      strFileFolder +=
            strNameOrPathToTestHarness.substring( 0, strNameOrPathToTestHarness.lastIndexOf( "/" ) );
      strReportName = strNameOrPathToTestHarness.substring( strNameOrPathToTestHarness.lastIndexOf( "/") + 1 );
      strReportName = strReportName.substring( 0, strReportName.indexOf( ".") ) + "_" + strReportFileNameDate + ".html";

    }
    else
    {
      strFileFolder += "/suiteReports/" + m_strTestSuiteName ;

      // strip off the path to the suite name
      strReportName = m_strTestSuiteName.substring( m_strTestSuiteName.lastIndexOf( "/") +  1 ) + "_"  + m_strSuiteFileNameRunDate + ".html";

    }


    const objToPost = {};
    objToPost.fileFolder = strFileFolder;
    objToPost.fileName = strReportName;
    objToPost.content = strHtmlToSave;

    const objHeaders = { "Accept":"application/json,text/plain", "Content-Type":"application/json"};
    const objContent = JSON.stringify( objToPost );

    const strResp = await m_utils.postData( objHeaders, objContent, "saveFile")
            .catch( err =>
                    {
                      alert( "Error saving report ");
                    });


  } // end sendToNodeJs()


  async function pingNodeJs()
  {
    const resp = await m_utils.postData( null, null, "ping")
            .catch( err =>
                    {
                      return "nfg";
                    });

    if ( resp ==  "ok")  // server is alive
    {
      m_bNodeServerAlive = true;
      return true;
    }
    else
    {
      const strAlertMsg = "NodeJS server has not been Started. It is required to run the unit tests. Please start the node js server and retry";
      alert( strAlertMsg );
      return false
    }

  } // end pingNodeJs()

 } // end VwUnitTester{}

export default VwUnitTester