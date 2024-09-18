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
import VwHashMap from "../../util/VwHashMap/VwHashMap.js";
import VwExString from "../../util/VwExString/VwExString.js";
import VwUtils from "../../util/VwUtils/VwUtils.js";
import {VwClass} from "../../util/VwReflection/VwReflection.js";

VwCssImport( "/vozzworks/ui/VwTab/style");

/**
 * This class creates tabs within a parent block element i.e.div
 * When a tab is clicked, a callback user defined handler will be invoked to show the corresponding view
 *
 * @param strParentId The id of the block element where the tabs will be installed
 * @param aTabs Array of tab definition objects format is:
 *        tabIdProp:String:Required The unique id of the tab
 *        textProp:String:Optional The property on the object that is the text element
 *        tabHandlerIdProp:String:Optional  The name of a function that will be instantiated when the tab is selected
 *        collapsedBorders:Boolean:Optional If true, apply collapsed borders on each tab
 *
 * @param objProps Tab properties config object - property values are:
 *     disableReselect: String, optional. If true, reselecting the currently selected tab is disabled.
 *     manageTabContentId:Strung:Optional If defined the tab props content handle must define a public  getTabContentHtml method to return what displays when the tab is selected.
 *     htmlTabTemplate an html template that represents a custom tab
 *     The tab content is placed in the block html element
 *     cssTabBar:String: Css class fpr the tab bar. Default is VwTabBar
 *     cssTab:String A css class name for the tab. Default is VwTab
 *     cssTabSelected:String css class name for the selected tab. Default is VwSelected
 *     resourceMgr:VwPropertyMgr:Optional if specified, text values starting with i18n_ will be translated
 * @constructor
 */
function VwTab( strParentId, aTabs, objProps )
{
  if ( arguments.length == 0 )
  {
    return;

  }
  const self = this;

  const m_strParentId = strParentId;
  const m_aTabs = [];
  const m_aDecorations = [];

  const m_mapDisabledTags = new VwHashMap();
  const m_mapObjectsById = new VwHashMap();
  const m_mapTabHandlersById = new VwHashMap();
  const m_mapTabContentById = new VwHashMap();

  let  m_strActiveTabId;
  let  m_tabProps;
  let  m_strUnSelectedBorder ;
  let  m_nCurTabIndex = -1;

  let TAB_ID_BASE = m_strParentId + "_";

  let m_aFnClickHandlers = [];

  this.enableTab = enableTab;
  this.removeTab = removeTab;
  this.activateTab = doTabSelected;
  this.getSelectedTab = getSelectedTab;
  this.getSelectedTabId = getSelectedTabId;
  this.getTabHandler = getTabHandler;
  this.updateTabText = updateTabText;
  this.updateTabImg = updateTabImg;
  this.getTabObject = getTabObject;
  this.getActiveTabHandler = getActiveTabHandler;
  this.getTabHandlers = getTabHandlers;
  this.addTab = addTab;
  this.addDecoration = addDecoration;
  this.click = click;
  this.close = closeTabs;

  configTabProps( objProps );

  setupTabControl();

  /**
   * Setup tab control
   */
  function setupTabControl()
  {
    $( "#" + m_strParentId ).addClass( m_tabProps.cssTabBar );

    if ( aTabs )
    {
      addTabs( 0 );
    }

  }

  function addTabs( ndx )
  {

    addTab( aTabs[ ndx ], null, () =>
    {
      ++ndx;

      if ( ndx >= aTabs.length )
      {
        return;
      }

      addTabs( ndx );
      
    })
  }
  /**
   * Tab click action handler
   */
  function setupActions( strTabId )
  {
    // Clear out and previous click events
    $( "#" + strTabId ).unbind().click( handleTabClick ).keydown( handleKeyPress );

  }


  /**
   * Tab click event handler
   * @param event
   */
  function handleTabClick( event )
  {
    doTabSelected( event.currentTarget.id );
  }

  /**
   * Do tab selected calls
   *
   * @param strTabId The id of the tab selected
   */
  function doTabSelected( strTabId, bDoNotRunHandler )
  {
    // If user called this the id will not contain the internal id prefix so add it
    if ( !VwExString.startsWith( strTabId, TAB_ID_BASE ) )
    {
      strTabId = TAB_ID_BASE + strTabId;
    }

    m_nCurTabIndex = Number( $("#" + strTabId ).attr( "tabindex" ) );

    deActivateCurrentTab();
    activateTab( strTabId , bDoNotRunHandler);
    
    if (objProps.roundedCorners)
    {
      roundtabCorners();
    }

  }

  function handleKeyPress( keyEvent )
  {

    if ( keyEvent.keyCode != 9 )
    {
      return;

    }

    let nTabIndex = Number( $( this ).attr( "tabindex" ) );

    if ( ++nTabIndex >= m_aTabs.length )
    {
      nTabIndex = 0;
    }

    deActivateCurrentTab();
    activateTab( getId( m_aTabs[nTabIndex] ) );

    keyEvent.stopImmediatePropagation();

    return false;

  }


  /**
   * Install a tab click handler
   * @param fnClickHandler Callback function which passes back the tab object associated with the tab
   */
  function click( fnClickHandler )
  {
    for ( let x = 0, nLen = m_aFnClickHandlers.length; x < nLen; x++ )
    {
      if ( m_aFnClickHandlers[x] == fnClickHandler )
      {
        return; // don't add dup click handler
      }
    }

    m_aFnClickHandlers.push( fnClickHandler );

  }

  /**
   * Close all tabs
   * @param fnDone
   */
  function closeTabs( fnDone )
  {
    VwUtils.forEach( m_aTabs, closeTab, () =>
    {
      fnDone();

    });

  }

  /**
   * ForEach callback tab handler
   * @param ndx The index of the tab in the array
   * @param tab The tab object
   * @param fnNextTab The next tabcallback
   */
  function closeTab( ndx, tab, fnNextTab )
  {
    const strTabId = getId( tab );

    const fnHandler = m_mapTabHandlersById.get( strTabId );

    if ( fnHandler && fnHandler.closeTab )
    {
      fnHandler.closeTab( self, (strTabId == m_strActiveTabId), () =>
      {
       fnNextTab(); // Get next tab
      });
    }
    else
    {
      fnNextTab(); // Get next tab

    }

  }

  /**
   * Makes the tab specified by the tab id the active tab
   * @param strTabId
   */
  function activateTab( strTabId , bDoNotRunHandler)
  {


    // Check if reselecting a tab is allowed
    let fIsReselect = m_tabProps.disableReselect && m_strActiveTabId == strTabId;

    if ( fIsReselect )
    {
      return;
    }

    var objTab = m_mapObjectsById.get( strTabId );

    var selectedTabEl = $( "#" + strTabId );

    selectedTabEl.addClass( m_tabProps.cssTabSelected ).addClass( "VwSelected" ).focus();

    if ( m_tabProps.collapsedBorders )
    {
      doCollapsedBorders( objTab );
    }

    if ( m_tabProps.tabHandlerIdProp )
    {

      if ( m_tabProps.manageTabContentId )
      {
        doChangeContent( strTabId );

      }

      m_strActiveTabId = strTabId;


      return;
    }


    m_strActiveTabId = strTabId;

    if ( m_tabProps.imgUrlSelectedProp )
    {
      $( "#" + TAB_ID_BASE + "img_" + objTab[m_tabProps.tabIdProp] ).attr( "src", objTab[m_tabProps.imgUrlSelectedProp] );
    }

    if ( !bDoNotRunHandler )
    {
      for ( var x = 0, nLen = m_aFnClickHandlers.length; x < nLen; x++ )
      {
        m_aFnClickHandlers[x]( objTab );
      }


      // see if we already have a tab instance
      const fnTabHandler = m_mapTabHandlersById.get( strTabId );

      if ( fnTabHandler && fnTabHandler.activateTab )
      {
        fnTabHandler.activateTab();
      }
    }
  }

  /**
   * Set tab ui to deactivated
   */
  function deActivateCurrentTab()
  {
    if ( !m_strActiveTabId )
    {
      return;
      
    }
    const objSelectedTab = m_mapObjectsById.get( m_strActiveTabId );

    const fnTabHandler = m_mapTabHandlersById.get( m_strActiveTabId );

    $( "#" + m_strActiveTabId ).removeClass( m_tabProps.cssTabSelected ).removeClass( "VwSelected" );
    $( "#" + m_strActiveTabId ).addClass( m_tabProps.cssTab );

    // Return tab image to unselected state
    if ( m_tabProps.imgUrlSelectedProp )
    {
      $( "#" + TAB_ID_BASE + "img_" + objSelectedTab[m_tabProps.tabIdProp] ).attr( "src", objSelectedTab[m_tabProps.imgUrlProp] );
    }

    if ( fnTabHandler && fnTabHandler.deActivateTab )
    {
      fnTabHandler.deActivateTab( self, objSelectedTab );
    }

  }

  /**
   * Change the tabs html content
   * @param strTabId
   */
  function doChangeContent( strTabId )
  {
    // First hide the curren
    if ( m_strActiveTabId  )
    {
       $("#" + m_strActiveTabId + "_tabContent").hide();
    }

    // see if we already have a tab instance
    const fnTabHandler = m_mapTabHandlersById.get( strTabId );

    if ( !fnTabHandler )
    {
      throw "No Tab Handler property specifed for Tab Id: " + strTabId + " which is required when the managedTabContentId is specified";
    }

    const strActiveTabContentId = strTabId + "_tabContent";

    $("#" + strActiveTabContentId ).show();
    if ( fnTabHandler.activateTab )
    {
      fnTabHandler.activateTab( strTabId );
    }
    
  }

  /**
   * Simulate the colapsed border loook for the tabs
   * @param tabSelected
   */
  function doCollapsedBorders( tabSelected )
  {
    // remove all left borders

    let strCanonicalId = getId( tabSelected );
    $( "#" + strCanonicalId ).attr( "style", null );

    // Remove any border left or right attrs on the currently selected tab

    if ( m_strActiveTabId )
    {
      $( "#" + m_strActiveTabId ).attr( "style", null );
    }

    // If there is a tab before me then remove its right border
    if ( m_nCurTabIndex - 1 >= 0 )
    {
      strCanonicalId = getId( m_aTabs[ m_nCurTabIndex - 1 ] );
      $( "#" + strCanonicalId ).css( "border-right", "none" );

    }

    // If there is a tab after me, remove its left border
    if ( m_nCurTabIndex + 1 < m_aTabs.length )
    {
      strCanonicalId = getId( m_aTabs[ m_nCurTabIndex + 1 ] );
      $( "#" + strCanonicalId ).css( "border-left", "none" );

    }

  }


  /**
   * Adds a new tab
   *
   * @param objTab  The object representing the tabs data
   * @param nPos The tabs position zero based. if omitted the tab is appended to the end
   */
  function addTab( objTab, nPos, fnComplete )
  {
    m_aTabs.push( objTab );

    createTabHtml( objTab, m_aTabs.length - 1, nPos, () =>
    {
      setupActions( getId( objTab ) );

      if (objProps.roundedCorners)
      {
        roundtabCorners();
      }

      if ( fnComplete )
      {
        fnComplete();
      }

    });

  }

  /**
   * rounds corners of tabs
   */
  function roundtabCorners()
  {
     for (let x=0; x < m_aTabs.length; x++ )
     {
       let strCanonicalId = getId( m_aTabs[ x] );

       let strRadiusLeftSmall = ".25em 0 0 .25em";
       let strRadiusRightSmall = "0 .25em .25em 0";

       let strRadiusLeftMedium = ".5em 0 0 .5em";
       let strRadiusRightMedium = "0 .5em .5em 0";

       let strRadiusLeftLarge = ".75em 0 0 .75em";
       let strRadiusRightLarge= "0 .75em .75em 0";


       let strRadiusLeft = strRadiusLeftMedium;
       let strRadiusRight = strRadiusRightMedium;

       if (m_tabProps.cssTab.indexOf("SmallFont"))
       {
          strRadiusLeft = strRadiusLeftSmall;
          strRadiusRight = strRadiusRightSmall;
       }
       else
         if (m_tabProps.cssTab.indexOf("LargeFont"))
         {
           strRadiusLeft = strRadiusLeftLarge;
           strRadiusRight = strRadiusRightLarge;
         }


       if (x == 0)
       {
         $( "#" + strCanonicalId ).css( "border-radius",strRadiusLeft  );
       }
       else if (x == m_aTabs.length - 1)
       {
         $( "#" + strCanonicalId ).css( "border-radius", strRadiusRight );
       }
       else
       {
         $( "#" + strCanonicalId ).css( "border-radius", "none" );
       }
     }
  }

  /**
   * Adss a decoration domelement to the tab bar.
   *
   * @param domElement
   * @param nPos
   */
  function addDecoration( objDecoration, nPos )
  {
    if ( typeof nPos == "undefined" )
    {
      $( "#" + m_strParentId ).append( objDecoration.domElement );
    }
    else
    {
      doInsertAtPos( objDecoration.domElement, nPos );
    }

    m_aDecorations.push( objDecoration );
  }


  /**
   * Return the selected tab object
   *
   * @returns {number}
   */
  function getSelectedTab()
  {
    let strId = $( "#" + strParentId + " .VwSelected" ).attr( "id" );

    strId = strId.substring( strId.indexOf( "_" ) + 1 );

    return findTabObjById( strId );

  }


  function getTabHandler( strTabId )
  {
    const strCanonicalId = TAB_ID_BASE + strTabId;

    return m_mapTabHandlersById.get( strCanonicalId );

  }

  /**
   * Return the selected DOM element ID
   *
   * @returns {*|jQuery}
   */
  function getSelectedTabId()
  {
    return $( "#" + strParentId + " .VwSelected" ).attr( "id" );
  }

  /**
   * Adds a new tab from object spec
   *
   * @param objTab  Object containing the minimum required properties to paint the tab
   * @param nTabIndex The index in the tab data array
   * @param nPos The insert position of the tab. If omitted, the tab is appended
   */
  async function createTabHtml( objTab, nTabIndex, nPos, fnComplete )
  {

    var strTabId = getId( objTab );

    if ( $( "#" + strTabId )[0] )
    {
      throw "Duplicate tab id found for id: " + objTab[m_tabProps.tabIdProp];

    }

    m_mapObjectsById.put( strTabId, objTab );

    if ( m_tabProps.tabHandlerIdProp )
    {

      const fnTabHandler = await launchWidgetHandler( objTab );

      if ( m_tabProps.manageTabContentId )
      {
        const strTabContentHtml = fnTabHandler.render();
        m_mapTabContentById.put( strTabId, strTabContentHtml );

        const strActiveTabContentId = strTabId + "_tabContent";

        const divTabContentEle = $("<div>").attr( "id", strActiveTabContentId ).append( strTabContentHtml )[0];
        $( divTabContentEle).hide();

        $("#" + m_tabProps.manageTabContentId ).append( divTabContentEle );

        finishTabSetup();
        if ( fnTabHandler && fnTabHandler.contentApplied )
        {
          fnTabHandler.contentApplied();
        }
      }
      else
      {
        finishTabSetup()
      }
    }
    else
    {
      finishTabSetup();
    }

    function finishTabSetup()
    {
      if ( m_tabProps.htmlTabTemplate )
      {
        doTabTemplate( objTab, nTabIndex, nPos );
      }
      else
      {
        const tabEl = $( "<div>" ).addClass( "VwTabItem" ).addClass( m_tabProps.cssTab ).addClass( objTab[m_tabProps.tabCssProp] ).attr( {
                                                                                                                                           "id"      : strTabId,
                                                                                                                                           "tabindex": nTabIndex
                                                                                                                                         });
        if ( m_tabProps.collapsedBorders && m_mapObjectsById.size() > 1 )
        {
          $( tabEl ).css( "border-left", "none" );
        }

        if ( objTab[m_tabProps.imgUrlProp] && objTab[m_tabProps.textProp] )
        {
          doTabTextImg( tabEl, objTab, nPos );
        }
        else
        {
          if ( objTab[m_tabProps.imgUrlProp] )
          {
            doTabImg( tabEl, objTab, nPos );
          }
          else
          {
            if ( objTab[m_tabProps.textProp] )
            {
              doTabText( tabEl, objTab, nPos );
            }
            else
            {
              $( "#" + m_strParentId ).append( tabEl );
            }
          }
        }

        if ( m_tabProps.collapsedBorders && m_mapObjectsById.size() == 1 )
        {
          m_strUnSelectedBorder = $( "#" + strTabId ).css( "border-left" );
        }

      }

      if ( m_tabProps.initialId && m_tabProps.initialId == objTab[objProps.tabIdProp] )
      {
        doTabSelected( getId( objTab ));
      }

      fnComplete();

    } // end finishTabSetup()

  }


  /**
   * Crate tab content from an html template
   *
   * @param objTab object with properties resolving template placeholders
   * @param nTabIndex The index in the tab data array
   * @param nPos The insert position of the tab. If omitted, the tab is appended
   */
  function doTabTemplate( objTab, nTabIndex, nPos )
  {

    const strTabHtml = VwExString.expandMacros( m_tabProps.htmlTabTemplate, objTab );

    if ( typeof nPos != "undefined" && nPos != null )
    {
      doInsertAtPos( strTabHtml, nPos );
    }
    else
    {
      $( "#" + m_strParentId ).append( strTabHtml );

    }

    $( "#" + objTab[m_tabProps.tabIdProp] ).attr( "data-tabndx", nTabIndex );


  }

  /**
   * Put img on tab
   * @param tabEl   The Tab element
   * @param objTab  Tab Object
   * @param nPos    Insert position
   */
  function doTabImg( tabEl, objTab, nPos )
  {
    const imgEl = $( "<img>" ).attr( {"id"  : TAB_ID_BASE + "img_" + objTab[m_tabProps.tabIdProp],
                                     "src": objTab[m_tabProps.imgUrlProp]
                                   } );
    tabEl.append( imgEl );

    if ( typeof nPos == "undefined" || nPos == null )
    {
      $( "#" + m_strParentId ).append( tabEl );
    }
    else
    {
      doInsertAtPos( tabEl, nPos );
    }
  }

  /**
   * Put img and text on tab
   * @param tabEl   The Tab element
   * @param objTab  Tab Object
   * @param nPos    Insert position
   */
  function doTabTextImg( tabEl, objTab, nPos )
  {
    const imgEl = $( "<img>" ).attr( {"id"  : TAB_ID_BASE + "img_" + objTab[m_tabProps.tabIdProp],
                                     "src": objTab[m_tabProps.imgProp]
                                   } );
    const spanEl = $( "<span>" ).attr( "id", TAB_ID_BASE + "txt_" + objTab[m_tabProps.tabIdProp] ).html( getText( objTab[m_tabProps.textProp] ) );
    tabEl.append( imgEl ).append( spanEl );

    if ( typeof nPos == "undefined" || nPos == null )
    {
      $( "#" + m_strParentId ).append( tabEl );
    }
    else
    {
      doInsertAtPos( tabEl, nPos );
    }
  }

  /**
   * Create Text Tab
   * @param tabEl   The Tab element
   * @param objTab  Tab Object
   * @param nPos    Insert position
   */
  function doTabText( tabEl, objTab, nPos )
  {
    const spanEl = $( "<span>" ).attr( "id", TAB_ID_BASE + "txt_" + objTab[m_tabProps.tabIdProp] ).html( getText( objTab[m_tabProps.textProp] ) );
    tabEl.append( spanEl );

    if ( typeof nPos == "undefined" || nPos == null)
    {
      $( "#" + m_strParentId ).append( tabEl );
    }
    else
    {
      doInsertAtPos( tabEl, nPos );
    }
  }

  /**
   * Inserts a tab at the specified position
   *
   * @param tabEl The tab html to insert
   * @param nPos The zero based position to insert
   */
  function doInsertAtPos( tabEl, nPos )
  {
    if ( nPos >= m_aTabs.length )
    {
      alert( "ERROR trying to insert tab at position: " + nPos + " becuase the position exceeds the number of tabs" );
      return;
    }

    tabEl.insertBefore( $( "#" + m_strParentId ).children()[nPos] );

  }

  /**
   * Does i18n translation if specified, else just returns the text
   * @param strText
   * @returns {*}
   */
  function getText( strText )
  {
    if ( !objProps.resourceMgr )
    {
      return strText;
    }

    if ( strText.startsWith( "i18n_") || strText.startsWith( "#") )
    {
      let nOffsetPos;

      if ( strText.startsWith( "i18n_" ) )
      {
        nOffsetPos = "i18n_".length;
      }
      else
      {
        if ( strText.startsWith( "##") )
        {
          return strText.substring( 1 );
        }
        else
        {
          nOffsetPos = 1;
        }
      }

      return objProps.resourceMgr.getString( strText.substring( nOffsetPos ) );

    }
    else
    {
      return strText;
    }


  }


  /**
   * Enable/Disable a tab
   *
   * @param objTab The object representing the tab to enable/disable
   * @param fEnable True to enable, false to disable
   */
  function enableTab( objTab, fEnable )
  {
    const strId = getId( objTab );

    if ( fEnable )
    {
      m_mapDisabledTags.remove( getId( objTab ) );

      if ( m_tabProps.cssDisabled )
      {

      }
    }
    else
    {
      m_mapDisabledTags.put( objTab[m_tabProps.m_objTabProps.tabIdProp], "" );

    }

  }

  /**
   * Removes a tab
   *
   * @param objTab the object for the tab to be removed
   */
  function removeTab( objTab )
  {
    removeTabObj( getId( objTab ) );

    $( "#" + strId ).remove();

  }

  /**
   * Updates the tab's text portion
   *
   * @param strTabId The id of the tab to update
   * @param strText The updated tab text
   */
  function updateTabText( strTabId, strText )
  {
    const strCanonTabId = TAB_ID_BASE + "txt_" + strTabId;
    $( "#" + strCanonTabId ).html( strText );

  }

  /**
   * Updates the tab's img portion
   *
   * @param strTabId The id of the tab to update
   * @param strImgUrl The updated img url
   */
  function updateTabImg( strTabId, strImgUrl )
  {
    const strCanonTabId = TAB_ID_BASE + "_img_" + strTabId;
    $( "#" + strCanonTabId ).attr( "src", strImgUrl );

  }

  /**
   * Gets the data object associated with the tab
   *
   * @param strId The id of the tab t +o get
   */
  function getTabObject( strId )
  {
    const strCanonicalId = strParentId + "_" + strId;
    return m_mapObjectsById.get( strCanonicalId );
  }

  /**
   * Returns the object instance of the active tab
   * @returns {*}
   */
  function getActiveTabHandler()
  {
    return m_mapTabHandlersById.get( m_strActiveTabId );
  }

  /**
   * Gets all tab handler instances
   */
  function getTabHandlers()
  {
    return m_mapTabHandlersById.values();
  }


  /**
   * Remove the objTab form the tab object array
   * @param objTab The tab object to remove
   */
  function removeTabObj( objTab )
  {
    for ( let x = 0, nLen = m_aTabs.length; x < nLen; x++ )
    {
      if ( m_aTabs[x][m_tabProps.m_objTabProps.tabIdProp] == objTab[m_tabProps.m_objTabProps.tabIdProp] )
      {
        m_aTabs.slice( x, 1 );
        return;

      }
    }
  }

  /**
   * Finds the index in the tab array of the objTab
   *
   * @param objTab The tab object to search for
   * @returns {number}  The index of this tab in the array
   */
  function findTabObjNdx( objTab )
  {
    for ( let x = 0, nLen = m_aTabs.length; x < nLen; x++ )
    {
      if ( m_aTabs[x][m_tabProps.tabIdProp] == objTab[m_tabProps.tabIdProp] )
      {
        return x;
      }
    }

  }

  /**
   * Finds the obj in the tab array of the strId
   *
   * @param strId The tab object to search for
   * @returns {number}  The index of this tab in the array
   */
  function findTabObjById( strId )
  {
    for ( let x = 0, nLen = m_aTabs.length; x < nLen; x++ )
    {
      if ( m_aTabs[x][m_tabProps.tabIdProp] == strId )
      {
        return m_aTabs[x];
      }
    }

  }


  /**
   * Makes the full tab div id from the object id
   * @param objTab The object with the id property
   *
   * @returns {string}
   */
  function getId( objTab )
  {
    return TAB_ID_BASE + objTab[m_tabProps.tabIdProp];
  }

  /**
   * Launches tab handler class
   * @param objTabDescriptor The tab descriptor object
   */
  async function launchWidgetHandler( objTab )
  {
    const strTabId = getId( objTab );

    // see if we already have a tab instance
    let fnTabHandler = m_mapTabHandlersById.get( strTabId );

    if ( fnTabHandler && fnTabHandler.hasOwnProperty( "activateTab" ) )
    {
      return;

    }

    let tabHandlerClass;

    if ( objTab[m_tabProps.tabHandlerIdProp].endsWith( ".js") )
    {
      tabHandlerClass = await VwClass.forModule( objTab[m_tabProps.tabHandlerIdProp ] );
    }
    else
    {
      tabHandlerClass = VwClass.forName( objTab[m_tabProps.tabHandlerIdProp] );
    }

    const constructor = tabHandlerClass.getConstructor();

    fnTabHandler = constructor.newInstance( [self, objTab] );

    m_mapTabHandlersById.put( strTabId, fnTabHandler );

    return fnTabHandler;

  }

  /**
   * Config tab defaults
   * @param objProps
   */
  function configTabProps( objProps )
  {
    m_tabProps = {};

    m_tabProps.cssTabBar = "VwTabBar";
    m_tabProps.cssTab = "VwTab";
    m_tabProps.cssTabSelected = "VwSelected";

    if ( objProps )
    {
      $.extend( m_tabProps, objProps );

    }
  }

} // end VwTab

export default VwTab;