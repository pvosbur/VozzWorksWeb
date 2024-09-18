/*
 ============================================================================================


 Copyright(c) 2017 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           Alejandro Scotti

 Date Generated:   6/2/17

 Time Generated:   3:32 PM

 ============================================================================================
 */

import VwComboBox from "/vozzworks/ui/VwComboBox/VwComboBox.js";
import VwDataModel from "/vozzworks/ui/VwDataModel/VwDataModel.js";

VwCssImport( "/vozzworks/ui/VwTime/style");

function VwTime( strParentId, dtInitial, timeProps )
{

  const m_resourceMgr = getResouceMgr();
  const props = configProps();

  let   m_dtInitial = dtInitial;
  let   m_strTimeHtml;
  let   m_cboTimeFormat;

  // Public methods
  this.getTime = getTime;

  // Configure properties first
  configProps();

  configObject();

  /**
   * Setup the vw time
   */
  function configObject()
  {
    render();

    setupTimeFormatComboBox();

    setupTimeInputs();

    setupActions();

  } // end configObject()

  /**
   * Install the DOM element
   */
  function render()
  {
    m_strTimeHtml =
     `<div class="VwTimeContainer">
        <input id="vwTimeHours" type="text" class="VwTimeInput" maxlength="2" placeholder="Hr"/>
        <span class="VwTimeDivider">:</span>
        <input id="vwTimeMin" type="text" class="VwTimeInput" maxlength="2" placeholder="Mn"/>
        <div id="vwTimeAmPmCombo"></div>
      </div>`

    $(`#${strParentId}`).html( m_strTimeHtml);

  } // end render()

  /**
   * Get the hours/min form initial time
   */
  function setupTimeInputs()
  {
    let nHours = m_dtInitial.getHours();

    if ( nHours > 12 )
    {
      m_cboTimeFormat.setSelectedIndex( 1 );
    }
    else
    {
      m_cboTimeFormat.setSelectedIndex( 0 );
    }

    if ( props.timeFormat == "12" && nHours > 12 )
    {
      nHours -= 12;
    }

    let   strHours = formatTimeInput( nHours );
    let   strMin = formatTimeInput( m_dtInitial.getMinutes(), true );

    $("#vwTimeHours").val( strHours );
    $("#vwTimeMin").val( strMin );

  } // end setupTimeInputs()


  /**
   * Format hours/min input. adds leading spaces if number < 10
   * @param nInput
   */
  function formatTimeInput( nInput, bIsMinites )
  {
    let strTimeValue;

    if ( nInput < 10 )
    {
      if ( bIsMinites )
      {
        strTimeValue = "0" + nInput
      }
      else
      {
        strTimeValue = "  " + nInput;
      }
    }
    else
    {
      strTimeValue = "" + nInput;
    }

    return strTimeValue;

  } // end formatTimeInput()


  /**
   * Setup the Am/Pm time format combo box
   */
  function setupTimeFormatComboBox()
  {
    const comboProps = {};
    m_cboTimeFormat = new VwComboBox( "vwTimeAmPmCombo", new VwDataModel( null, ["am", "pm"], comboProps ))

  } // end setupTimeFormatComboBox()


  /**
   * Setup event handlers
   */
  function setupActions()
  {
    $("#vwTimeHours").focus();

    $("#vwTimeHours").keypress( handleTimeInputKey );
    $("#vwTimeMin").keypress( handleTimeInputKey );

  } // end setupActions()


  function handleTimeInputKey( ke )
  {
    if (isNaN( ke.key ) )
    {
       ke.preventDefault();
    }


  }

  /**
   * Return the selected time and period
   * @returns {{}}
   */
  function getTime()
  {

    let nSelectedHour = parseInt( $("#vwTimeHours").val() );

    const strAmPm = m_cboTimeFormat.getSelectedItem() ;

    // If we're using 12-hour time format, we need additional formatting and conversions
    if ( props.timeFormat == "12"  && strAmPm == "pm" && ( nSelectedHour != 12 ) )
    {
      nSelectedHour = nSelectedHour + 12;
    }

    const objTime = {};
    objTime.hour = nSelectedHour;
    objTime.minutes = parseInt( $("#vwTimeMin").val() );
    objTime.period = strAmPm;

    return objTime

  } // end getTime()


  /**
   * Config properties
   */
  function configProps()
  {
    const props = {};

    props.cssContainer = "VwTimeContainer";
    props.cssTime = "VwTimeTime";
    props.cssTimeHour = "VwTimeHour";
    props.cssTimeMinutes = "VwTimeMinutes";
    props.cssTimeColon = "VwTimeColon";
    props.cssPeriod = "VwTimePeriod";
    props.cssPeriodBox = "VwTimePeriodBox";

    props.timeFormat = "12";

    $.extend( props, timeProps);

    return props;

   } // end configProps()

} // end VwTime{}

export default VwTime;


