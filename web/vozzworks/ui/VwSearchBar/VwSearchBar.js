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

import VwButton from "../VwButton/VwButton.js";

VwCssImport( "/vozzworks/ui/VwSearchBar/style");

/**
 * SearchBar object
 * @param strParent The parent id wher the searchbar will be places
 * @param m_filterImplementor a filter implementor. it must support the applyTextFilter method
 * @param searchProps
 *
 * cssSearchBar: String.        Css class for the parent DIV. Default is "VwSearchBar".
 * cssSearchText: String.       Css class for the search input field. Default is "VwSearchBarText".
 * cssSearchXImg: String.       Css class for the X clear image element. Default is "VwSearchBarImg".
 * idSearchXImg: String.        Css class for the parent DIV. Default is "VwSearchBarImgDiv".
 * srcSearchXImg: String.       Path to the clear input field image button. Default is "vozzworks/ui/images/vw_x_delete_close.png".
 * autoHideClear: Boolean.      Optional. If true, the clear X button will auto hide if the search field is empty
 * vwresourceMgr: Object.           The text translation property manager.
 * searchTextCleared: Function. Callback function when the clear input field button is invoked.
 */

function VwSearchBar( strParent, filterImplementor, searchProps )
{

  if ( arguments.length == 0 )
  {
    return;  // Prototype constructor
  }

  const self = this;
  const SEARCH_ID_BASE = `${strParent}_`;

  let m_filterImplementor = filterImplementor;
  let m_clearBtn;
  let m_searchProps;
  let m_fnOnSearchTextCleared;
  let m_fnOnSearchEnterKey;
  let m_fnOnSearchTextChange;

  // PUBLIC Methods
  this.clear = clearInputField;
  this.setFilterImplementor = ( filterImplementor ) => m_filterImplementor = filterImplementor;
  this.getSearchText = getSearchText;
  this.showClearIcon = showClearIcon;
  this.setFocus = () => $( `#${SEARCH_ID_BASE}searchText` ).focus();
  this.onSearchTextCleared = ( fnOnSearchTextCleared ) => m_fnOnSearchTextCleared = fnOnSearchTextCleared;
  this.onSearchEnterKey = ( nOnSearchEnterKey ) => m_fnOnSearchEnterKey = nOnSearchEnterKey;
  this.onSearchTextChange = ( fnOnSearchTextChange ) => m_fnOnSearchTextChange = fnOnSearchTextChange;

  configSearchProps();
  configObject();

  /**
   * Get search bar html and configObject search bar actions
   */
  function configObject()
  {
    searchProps.searchImpl = self;
    setupSearchBarHtml();
    setupActions();
    installPlaceHolder();
  }

  /**
   * Build the search bar HTML and install in parent
   */
  function setupSearchBarHtml()
  {
    const strSearchBarHtml =
      `<div id="${SEARCH_ID_BASE}searchBarContainer" class="${m_searchProps.cssSearchBar}">
         <input id="${SEARCH_ID_BASE}searchText" type="text" class="${m_searchProps.cssSearchText}"/>
         <div id="${SEARCH_ID_BASE}clearBtn"></div>`;

    // First clear any previously installed search instance
    // Install completed search bar HTML
    $( `#${strParent}` ).empty().append( strSearchBarHtml );

    const clearBtnDescriptor = {};
    clearBtnDescriptor.id="clearText";
    clearBtnDescriptor.img = m_searchProps.srcSearchXImg;
    m_clearBtn = new VwButton(`${SEARCH_ID_BASE}clearBtn`, clearBtnDescriptor, {"cssButtonImg":m_searchProps.cssSearchXImg});

    if ( m_searchProps.autoHideClear )
    {
      $( `#${SEARCH_ID_BASE}clearText` ).hide();
    }

  }

  /**
   * Setup search bar actions
   */
  function setupActions()
  {
    $( `#${SEARCH_ID_BASE}searchText` ).keyup( handleInputDataChange ).focus();
    m_clearBtn.onClick( handleClearTextEvent );

  } // end setupActions()

  /**
   * Shows/hides the clear (X) icons
   * @param bShow
   */
  function showClearIcon( bShow )
  {
    if ( bShow )
    {
      $( `#${SEARCH_ID_BASE}clearText` ).show()     ;
    }
    else
    {
      $( `#${SEARCH_ID_BASE}clearText` ).hide()     ;
    }
  } // end showClearIcon()


  /**
   * Handler for the clear text event
   */
  function handleClearTextEvent()
  {
    clearInputField();

    updateAutoHideClearXStatus();

    $( `#${SEARCH_ID_BASE}searchText` ).focus();

    // Invoke search cleared callback if specified
    if ( m_fnOnSearchTextCleared )
    {
      m_fnOnSearchTextCleared();
    }

  } // end handleClearTextEvent()

  /**
   * Handle callback events
   *
   * @param event The keyboard event
   */
  function handleInputDataChange( event )
  {
    const strSearchText = $( `#${SEARCH_ID_BASE}searchText` ).val();

    const keyCode = (event.keyCode ? event.keyCode : event.which);
    if ( keyCode < 32 )
    {
      if ( keyCode == '13' )
      {
        if ( m_fnOnSearchEnterKey )
        {
          m_fnOnSearchEnterKey( strSearchText );
          return;
        }
      }
    }

    if ( m_fnOnSearchTextChange )
    {
      m_fnOnSearchTextChange( strSearchText );
    }

    m_filterImplementor.applyTextFilter( strSearchText );

    updateAutoHideClearXStatus();
    
  } // end handleInputDataChange()

  /**
   * Update the UI to hide or show the X clear button
   */
  function updateAutoHideClearXStatus()
  {
    // Show or hide clear button if required
    if ( m_searchProps.autoHideClear )
    {
      if ( $( `#${SEARCH_ID_BASE}searchText` ).val().length > 0 )
      {
        $( `#${SEARCH_ID_BASE}clearText`).show();
      }
      else
      {
        $( `#${SEARCH_ID_BASE}clearText` ).hide();
      }
    }
  } // end updateAutoHideClearXStatus()

  /**
   * Setup placeHolder on input field if specified
   */
  function installPlaceHolder()
  {
    if ( !m_searchProps.placeHolder )
    {
      return;
    }

    // Test to see if we;re using i18n property key
    if ( m_searchProps.vwResourceMgr )
    {
      let strI18nPrefix = "i18n_";

      if ( m_searchProps.i18nPrefix )
      {
        strI18nPrefix = m_searchProps.i18nPrefix;
      }

      // Strip off 118n prefix for property key
      const strPropKey = m_searchProps.placeHolder.substring( strI18nPrefix.length );

      const strPlaceHolder = m_searchProps.vwResourceMgr.getString( strPropKey );

      // add placeholder to the input field

      $( `#${SEARCH_ID_BASE}searchText` ).attr( "placeholder", strPlaceHolder );

    }
    else
    {
      // No Property Mgr, just configObject with text specified
      $( `#${SEARCH_ID_BASE}searchText` ).attr( "placeholder", m_searchProps.placeHolder );
    }
  } // end installPlaceHolder()


  /**
   * Clear the input field
   */
  function clearInputField()
  {
    $( `#${SEARCH_ID_BASE}searchText` ).val( "" );
    m_filterImplementor.applyTextFilter( "" );

  } // end clearInputField()

  /**
   * Gets the text currently in the search input field
   * @returns {*|jQuery}
   */
  function getSearchText()
  {
    return $( `#${SEARCH_ID_BASE}searchText` ).val();
  }

  /**
   * Config default properties
   */
  function configSearchProps()
  {
    m_searchProps = {};
    m_searchProps.cssSearchBar = "VwSearchBar";
    m_searchProps.cssSearchText = "VwSearchBarText";
    m_searchProps.cssSearchXImg = "VwSearchBarImg";
    m_searchProps.srcSearchXImg = "/vozzworks/ui/images/vw_x_delete_close.png";

    $.extend( m_searchProps, searchProps );

  } // end configSearchProps()

} // end  VwSearchBar{}

export default VwSearchBar;