/*
 *
 * ============================================================================================
 *
 *                                     V o z z W o r k s
 *
 *                                     Copyright(c) 2014 By
 *
 *                                      Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 *  ============================================================================================
 */

import VwHashMap              from "/vozzworks/util/VwHashMap/VwHashMap.js";
import VwExString             from "/vozzworks/util/VwExString/VwExString.js";
import VwObjectScroller       from "/vozzworks/ui/VwObjectScroller/VwObjectScroller.js";
import VwGridDefaultDataModel from "/vozzworks/ui/VwGrid/VwGridDataModel.js";
import VwGrid                 from "/vozzworks/ui/VwGrid/VwGrid.js";
import VwTime                 from "/vozzworks/ui/VwTime/VwTime.js";
import VwUiExitMgr            from "/vozzworks/ui/VwCommon/VwUiExitMgr.js";

VwCssImport( "/vozzworks/ui/VwCalendars/style");



/**
 * The superclass object for different flavors of calendars
 *
 * @param     strId The id of the html element where the calendar html will be generated
 * @param     calProps Optional calendar configuration properties. Allowed values are:
 *            cssCalendarGrid - String, Optional. CSS class name to style the calendar days grid. Default name is "VwCalendarGrid".
 *            cssCalendarRow - String, Optional. CSS class name to style the calendar days grid row. Default name is "VwCalendarRow".
 *            cssCalendar - String, Optional. CSS class name to style the calendar container. Default name is "VwTinyCalendar".
 *            cssDayTile - String, Optional. CSS class name to style all calendar day tiles. Default name is "VwTinyCalDayTile".
 *            cssCalHeader - String, Optional. CSS class name to style the calendar days grid header. Default name is "VwTinyCalHeader".
 *            cssCalScroller - String, Optional. CSS class name to style the calendar month scroller container. Default name is "VwCalendarMonthScroller".
 *
 *            gridTileTemplate - String, Optional. String HTML template for the day tiles. Default HTML value is "<div id='${dayNbr}' class='" + calProps.cssDayTile + "'><span>${dayNbr}</span></div>".
 *
 *            monthsOfYear - String. Required if resourceMgr parameter is null. The text format to use on the calendar header. String options are:
 *            "abbrev": will use the English values: "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec".
 *            "abbrevMonthYear": will use the English values: "Jan ${YEAR}", "Feb ${YEAR}", "Mar ${YEAR}", "Apr ${YEAR}", "May ${YEAR}", "Jun ${YEAR}", "Jul ${YEAR}", "Aug ${YEAR}", "Sep ${YEAR}", "Oct ${YEAR}", "Nov ${YEAR}", "Dec ${YEAR}".
 *            "fullMonth": will use the English values: "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
 *            "fullMonthYear": will use the English values: "January ${YEAR}", "February ${YEAR}", "March ${YEAR}", "April ${YEAR}", "May ${YEAR}", "June ${YEAR}", "July ${YEAR}", "August ${YEAR}", "September ${YEAR}", "October ${YEAR}", "November ${YEAR}", "December ${YEAR}".
 *
 *            daysOfWeek - String. Required if resourceMgr parameter is null. The text format to use on the calendar week header. String options are:
 *            "initials": will use the English values: "S", "M", "T", "W", "T", "F", "S"];
 *            "abbrev": will use the English values: "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
 *            "full": will use the English values: "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
 *
 *            resourceMgrPrefix - String, Optional. If a language property manager is specified, an optional prefix is allowed. Default prefix is "i18n_"; Use empty string "" value to disable default prefix.
 *
 * @param     dtInitial Optional date to initialize the calendar. If omitted, current date is used
 * @param     resourceMgr Optional. Translation manager handler.
 * @constructor
 */
function VwCalendar( strId, calProps, dtInitial, resourceMgr )
{

  // If no id specified - get out probably caused by a SUB CLASS INVOCATION
  if ( arguments.length == 0  )
  {
    return;
  }

  const m_anDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const m_astrMonthsYear = new Array( 12 );
  const m_mapMonthTiles = new VwHashMap();
  const m_objProps = configProps();

  let m_dtInitial = new Date( dtInitial.getTime() );
  let m_nCurYear;
  let m_resourceMgr = resourceMgr;
  let m_monthScroller;
  let m_calendarGridDataModel;
  let m_calendarGrid;
  let m_timeWidget;
  let m_fnDataSelectionHandler;

  let ID_BASE = strId + "_";
  let ID_MONTH_SCROLLER = ID_BASE + "vwMonthScroller";
  let ID_CAL_GRID = ID_BASE + "vwCalGrid";
  let ID_CAL_GRID_HDR = ID_BASE + "tinyCalHeader";
  let ID_CAL_TIME = ID_BASE + "tinyCalTime";

  // Public Methods
  this.setDate = setDate;
  this.getDate = getDate;
  this.close = close;
  this.dateSelectedEvent = dateSelectedEvent;

  configObject();

  /**
   * Setup the calendar
   */
  function configObject()
  {

    // Make initial date today's date if not specified
    if ( !m_dtInitial )
    {
      m_dtInitial = new Date();
    }

    m_nCurYear = m_dtInitial.getFullYear();

    const monthEl = $( "<div>" ).attr( "id", ID_MONTH_SCROLLER ).addClass( m_objProps.cssCalScroller );
    const gridHdrEl = $( "<div>" ).attr( "id", ID_CAL_GRID_HDR ).addClass( m_objProps.cssCalHeader );
    const gridEl = $( "<div>" ).attr( "id", ID_CAL_GRID );

    if ( m_objProps.isPopup )
    {
      if ( !$( "#vwTinyCalPopup" )[0] )
      {
        const popupEl = $( "<div>" ).attr( "id", "vwTinyCalPopup" ).addClass( m_objProps.cssCalendar );

        $( "body" ).append( popupEl );
      }

      $( "#vwTinyCalPopup" ).append( monthEl ).append( gridHdrEl ).append( gridEl );

      installTimeElements( "#vwTinyCalPopup" );

    }
    else
    {
      $( "#" + strId ).append( monthEl ).append( gridHdrEl ).append( gridEl );

      installTimeElements( "#" + strId )
    }

    setupMonthYearHeader();

    setupMonthScroller();

    setupCalendarGrid();

    handleMonthChangeEvent( m_dtInitial.getMonth() );

    let position;

    if ( m_objProps.idPosRight )
    {
      position = $( "#" + m_objProps.idPosRight ).offset();
      position.left += $( "#" + m_objProps.idPosRight ).width() + 4;

      if ( $( "#" + m_objProps.idPosRight ).offset().left + $( "#" + m_objProps.idPosRight ).width() + $( "#vwTinyCalPopup" ).width() > $( window ).innerWidth() )
      {
        position.left = $( "#" + m_objProps.idPosRight ).offset().left - $( "#vwTinyCalPopup" ).width() - 2;

      }
    }
    else
    {
      if ( m_objProps.idPosBot )
      {
        position = $( "#" + m_objProps.idPosBot ).offset();
        position.top += $( "#" + m_objProps.idPosRight ).height() + 4;
      }
    }

    $( "#vwTinyCalPopup" ).offset( position );

    // Time widget MUST execute last after all calendar DOM elements are in place
    setupTimeWidget();

    $( "#vwTinyCalPopup" ).css( "height", "");

  } // end configObject()

  /**
   * Install the time widget DOM elements
   *
   * @param strParentId DOM element where to install the time elements
   */
  function installTimeElements( strParentId )
  {

    if ( !m_objProps.enableTime )
    {
      return;
    }

    const timeEl = $( "<div>" ).attr( "id", ID_CAL_TIME ).addClass( m_objProps.cssCalendarFooterTime );
    const timeWidgetContainerEl = $( "<div>" ).addClass( m_objProps.cssCalendarFooter ).append( timeEl );

    $( strParentId ).append( timeWidgetContainerEl );

  }

  /**
   * Setup the time widget
   */
  function setupTimeWidget()
  {
    if ( !m_objProps.enableTime )
    {
      return;
    }

    m_timeWidget = new VwTime( ID_CAL_TIME, m_dtInitial, m_objProps.timeProps );

  } // end setupTimeWidget()

  /**
   * Setup the month Scroller widget
   */
  function setupMonthScroller()
  {
    m_monthScroller = new VwObjectScroller( ID_MONTH_SCROLLER, m_objProps, m_astrMonthsYear );
    m_monthScroller.setDataIndex( m_dtInitial.getMonth() );

    m_monthScroller.addContentChangeEvent( handleMonthChangeEvent );
    m_monthScroller.outOfRangeEvent( handleYearChangeEvent );

  } // end setupMonthScroller()


  /**
   * Setup the calendar grid
   */
  function setupCalendarGrid()
  {

    setupCalHeader();

    const tinyCalGridProps = {};

    tinyCalGridProps.cssGrid = m_objProps.cssCalendarGrid;

    tinyCalGridProps.tileProps = {};
    tinyCalGridProps.tileProps.cssTileRow = m_objProps.cssCalendarRow;
    tinyCalGridProps.tileProps.maxRowTiles = 7;
    tinyCalGridProps.tileProps.tileTemplate = m_objProps.gridTileTemplate;

    m_calendarGridDataModel = new VwGridDefaultDataModel({dataIdProp:"dayNbrId"});
    m_calendarGrid = new VwGrid( ID_CAL_GRID, m_calendarGridDataModel, tinyCalGridProps );

    setupActions();

  } // end setCalendarGrid()


  /**
   * Handles the UI selection of a day and removes selected state from previous selection
   */
  function setSelectedDay( nNewDayNbr )
  {
    const strGridId = m_calendarGrid.getGridId();

    const strTileId = strGridId + "_" + nNewDayNbr;

     // First deselect previously selected day
    const nCurday = m_dtInitial.getDate();
    const strPrevId = strGridId + "_" + nCurday;

    $( "#" + strPrevId ).removeClass( "Selected" );

    // Now select the new day
    m_dtInitial.setDate( nNewDayNbr );
    $( "#" + strTileId ).addClass( "Selected" );

  }

  /**
   * Handle calendar grid date selection
   */
  function handleSaveCalendarSelection( objCalDay )
  {

    if ( objCalDay && objCalDay.dayNbr != "" )
    {
      setSelectedDay( objCalDay.dayNbr );
    }

    if ( m_objProps.enableTime )
    {
      const objSelectedTime = m_timeWidget.getTime();

      m_dtInitial.setHours( objSelectedTime.hour );
      m_dtInitial.setMinutes( objSelectedTime.minutes );

      // Just always zero out seconds and milliseconds from default new date
      m_dtInitial.setSeconds( 0 );
      m_dtInitial.setMilliseconds( 0 );
    }

    if ( m_fnDataSelectionHandler )
    {
      m_fnDataSelectionHandler( m_dtInitial );
    }

    if ( m_objProps.isPopup && !m_objProps.enableTime )
    {
      closePopup();
    }
  }


  /**
   * Setup action handlers
   */
  function setupActions()
  {
    m_calendarGrid.click( handleSaveCalendarSelection );

    // Enable outside click only when popup mode

    if ( m_objProps.isPopup )
    {
      const exitHandler = new VwUiExitMgr( "vwTinyCalPopup", ( target ) =>
      {
        closeOnOutsideClick();
        exitHandler.remove();

      });

    }
  }

  /**
   * Outside click handler
   * @param event
   */
  function closeOnOutsideClick( )
  {

    // Save the calendar selection
    handleSaveCalendarSelection();

    closePopup();

  }

  /**
   * Close calendar popup
   */
  function close()
  {

    if ( m_objProps.isPopup )
    {
      closePopup();
    }
  }

  /**
   * Close the calendar popup
   */
  function closePopup()
  {

    $( "#vwTinyCalPopup" ).remove();

    $( document ).unbind( "click", closeOnOutsideClick );

  }

  /**
   * Setup the tiny calendar header
   */
  function setupCalHeader()
  {

    let daysOfWeek = [];

    // If we have a property manager then retrieve property values
    if ( m_resourceMgr )
    {
      const aDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

      // Loop through days and get each property
      for ( let x = 0; x < 7; x++ )
      {
        daysOfWeek.push( m_resourceMgr.getString( m_objProps.resourceMgrPrefix + aDays[x] ) );
      }

    }
    else
    {

      // Determine which header text we're using
      switch ( m_objProps.daysOfWeek )
      {

        case "initials":

          daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
          break;

        case "abbrev":

          daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          break;

        case "full":

          daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          break;

      }
    }

    // Loop through days and append each span
    for ( let x = 0; x < 7; x++ )
    {
      $( "#" + ID_CAL_GRID_HDR ).append( $( "<span>" ).text( daysOfWeek[x] ) );
    }
  }


  /**
   * Handle Year change
   * @param ndx The exceeded range index from the month scroller < 0  do previous year, > array size to next year
   * @returns {*}
   */
  function handleYearChangeEvent( ndx )
  {

    if ( ndx < 0 )
    {
      --m_nCurYear;
      ndx = 11;      // reset starting index

    }
    else
    {
      ++m_nCurYear;
      ndx = 0;
    }

    m_dtInitial.setFullYear( m_nCurYear );

    setupMonthYearHeader();

    return ndx;

  }


  /**
   * Month change event handler
   *
   * @param nMonthNdx The new index in the months array
   */
  function handleMonthChangeEvent( nMonthNdx )
  {

    m_calendarGridDataModel.clear();

    m_dtInitial.setMonth( nMonthNdx );

    const nCurDay = m_dtInitial.getUTCDate();

    // Find what day of week the 1st is on
    m_dtInitial.setDate( 1 );

    const nFirstDayNbr = m_dtInitial.getDay();

    // set to current
    //m_dtInitial.setDate( nFirstDayNbr );

    for ( let x = 0; x < nFirstDayNbr; x++ )
    {
      m_calendarGridDataModel.add( {dayNbrId:x*-1, dayNbr: ""} );
    }

    m_mapMonthTiles.clear();

    for ( let x = 0; x < m_anDaysInMonth[nMonthNdx]; x++ )
    {
      const nDayNbr = x + 1;

      m_calendarGridDataModel.add( {dayNbrId:nDayNbr, dayNbr: nDayNbr} );

      if ( nDayNbr == nCurDay )
      {
        setSelectedDay( nDayNbr );
      }

    }


  }


  /**
   * Expand year macros so month array values have month year
   */
  function setupMonthYearHeader()
  {

    let  monthsOfYear = [];

    // If we have a property manager then retrieve property values
    if ( m_resourceMgr )
    {
      const aMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

      // Loop through months and get each property
      for ( let x = 0; x < 12; x++ )
      {
        monthsOfYear.push( m_resourceMgr.getString( m_objProps.resourceMgrPrefix + aMonths[x] ) );
      }

    }
    else
    {
      // Use default English
      // Determine which header text we're using
      switch ( m_objProps.monthsOfYear )
      {

        case "abbrev":

          monthsOfYear = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          break;

        case "abbrevMonthYear":

          monthsOfYear = ["Jan ${YEAR}", "Feb ${YEAR}", "Mar ${YEAR}", "Apr ${YEAR}", "May ${YEAR}", "Jun ${YEAR}", "Jul ${YEAR}", "Aug ${YEAR}", "Sep ${YEAR}", "Oct ${YEAR}", "Nov ${YEAR}", "Dec ${YEAR}"];
          break;

        case "fullMonth":

          monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          break;

        case "fullMonthYear":

          monthsOfYear = ["January ${YEAR}", "February ${YEAR}", "March ${YEAR}", "April ${YEAR}", "May ${YEAR}", "June ${YEAR}", "July ${YEAR}", "August ${YEAR}", "September ${YEAR}", "October ${YEAR}", "November ${YEAR}", "December ${YEAR}"];
          break;

      }
    }

    // Check if value specified was invalid
    if ( monthsOfYear.length == 0 )
    {
      alert( "VwTinyCalendar: the value specified for the property monthsOfYear is invalid. Please check your value." );
      return;
    }

    // Loop through list and expand macros
    for ( let x = 0; x < 12; x++ )
    {
      m_astrMonthsYear[x] = VwExString.replaceAll( monthsOfYear[x], "${YEAR}", m_nCurYear );
    }
  }

  /**
   * Gets the current date object
   * @returns {*}
   */
  function getDate()
  {
    return m_dtInitial;
  }

  /**
   * Sets the date to the date specified and fires the dateSelection handler if specified
   * @param dtDate
   */
  function setDate( dtDate )
  {

    m_dtInitial = dtDate;

    if ( m_fnDataSelectionHandler )
    {
      m_fnDataSelectionHandler( dtDate );

    }
  }

  /**
   * Configure the calendar properties
   * @param objProps The user's properties - may be null
   */
  function configProps()
  {
    const _calProps = {};
    $.extend( _calProps, calProps );

    return _calProps;

  } // end configProps()

  /**
   * Date selected event
   * @param fnDataSelectionHandler
   */
  function dateSelectedEvent( fnDataSelectionHandler )
  {
    m_fnDataSelectionHandler = fnDataSelectionHandler;

  } //end dateSelectedEvent()

} // end VwCalendar{}

export default VwCalendar;