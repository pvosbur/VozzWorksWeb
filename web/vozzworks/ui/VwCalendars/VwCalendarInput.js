/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   8/18/20

 Time Generated:   10:13 AM

 ============================================================================================
 */

import {VwTinyCalendar} from "./VwCalendar.js";

/**
 * Creates a form text input control with an image that pops up using the VwTinyCalendar object and fills
 * <br>the input field with the selected date
 * @param strParentId The id of the element where the input field will be created
 * @param objProps The properties object. Values are:
 *        cssInput - Optional - The css used to style the input control
 *        cssImg - Optional - The css used to style the calender image
 *        dateFormat - Optional the date format string to format selected date in the input control. Default"mm/dd/yyyy" See date.formatter.js for other formats.
 * @constructor
 */
function VwCalendarInput( strParentId, strInputId, objProps )
{
  const m_objProps = {};
  let   m_tinyCalendar;

  configProps( objProps );

  setupCalendarInput();

  /**
   * Setup the calendar input
   */
  function setupCalendarInput()
  {

    // Setup input and img component
    const strHtml = "<input type='text' id='" + strInputId + "'/ ><img id='img_" + strInputId + "' src='" +
            m_objProps.calImgUrl + "'/>";

    // Install Components
    $( "#" + strParentId ).html( strHtml );

    $( "#" + strInputId ).addClass( m_objProps.cssInput );

    $( "#img_" + strInputId ).addClass( m_objProps.cssImg );

    setupActions();

  } // end setupCalendarInput()

  /**
   * Setup actions
   */
  function setupActions()
  {

    $( "#img_" + strInputId ).click( handleOpenCalendar );

  } // end setupActions

  /**
   * Handle open the calendar
   */
  function handleOpenCalendar( event )
  {
    event.preventDefault();
    event.stopImmediatePropagation();

    const objProps =
          {
            isPopup   : true,
            idPosRight: "img_" + strInputId
          };

    m_tinyCalendar = new VwTinyCalendar( "VwPopupCal", objProps );

    m_tinyCalendar.dateSelectedEvent( function ( dateSelected )
                                      {
                                        $( "#" + strInputId ).val( dateSelected.format( m_objProps.dateFormat ) );
                                      } );

  }

  /**
   * Configure the calendar properties
   * @param objProps The user's properties - may be null
   */
  function configProps( objProps )
  {
    m_objProps.dateFormat = "MM/dd/yyyy";

    if ( objProps )
    {
      $.extend( m_objProps, objProps );

    }
  }


} // end VwCalendarInput{}

export default VwCalendarInput;