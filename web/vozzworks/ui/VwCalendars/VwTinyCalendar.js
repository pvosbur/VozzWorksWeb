/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   8/18/20

 Time Generated:   10:12 AM

 ============================================================================================
 */

import VwCalendar from "./VwCalendar.js";

/**
 * Defines a tiny calendar typically used when form input fields take a date and a tiny calendar is used as a popup for
 * date entry
 *
 * See top of JavaScript file for complete Java Doc info
 */
export function VwTinyCalendar( strId, objProps, dtInitial, resourceMgr )
{
  if ( arguments.length == 0 )
  {
    return;
  }

  const m_objProps = {};

  configProps( objProps );

  VwCalendar.call( this, strId, m_objProps, dtInitial, resourceMgr );

  /**
   * Configure the calendar properties
   * @param objProps The user's properties - may be null
   */
  function configProps( objProps )
  {

    m_objProps.cssCalendarGrid = "VwCalendarGrid";
    m_objProps.cssCalendarRow = "VwCalendarRow";
    m_objProps.cssCalendar = "VwTinyCalendar";
    m_objProps.cssDayTile = "VwTinyCalDayTile";
    m_objProps.cssCalHeader = "VwTinyCalHeader";
    m_objProps.cssCalScroller = "VwCalendarMonthScroller";
    m_objProps.cssCalendarFooter = "VwCalendarFooter";
    m_objProps.cssCalendarFooterTime = "VwCalendarFooterTime";

    m_objProps.enableTime = false;
    m_objProps.daysOfWeek = "initials";
    m_objProps.monthsOfYear = "fullMonthYear";
    m_objProps.resourceMgrPrefix = "i18n_";
    m_objProps.gridTileTemplate = "<div id='${dayNbrId}' class='" + m_objProps.cssDayTile + "'><span>${dayNbr}</span></div>";

    if ( objProps )
    {
      $.extend( m_objProps, objProps );
    }
  }

}

VwTinyCalendar.prototype = new VwCalendar();

export default VwTinyCalendar;