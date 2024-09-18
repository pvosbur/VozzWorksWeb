/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   9/1/20

 Time Generated:   11:12 AM

 ============================================================================================
 */

import VwUiUtils from "./VwUiUtils.js";

/**
 * Manages objects that allow for  multiple selected html elements (most likely div and span elements)
 * @constructor
 *
 * @param strControlId
 * @param fMultipleSel
 * @param strCssElemenHover
 * @param strCssElementSelected
 * @constructor
 */
function VwElementSelectionHandler( strControlId, fMultipleSel, strCssElemenHover, strCssElementSelected )
{
  const m_strControlId = strControlId;
  const m_strCssElemenHover = strCssElemenHover;
  const m_strCssElementSelected = strCssElementSelected;

  let   m_aSelectedElementIds = null;
  let   m_fMultipleSel = fMultipleSel;

  this.clear = clear;
  this.clearSelections = clearSelections;

  this.elementClicked = handleElementClicked;

  this.getSelectedElementId = getSelectedElementId;
  this.getSelectedElementIds = getSelectedElementIds;

  this.isSelected = isSelected;

  this.setSelectedElementId = setSelectedElementId;
  this.setSelectedElementIds = setSelectedElementIds;

  this.removeId = removeId;

  /**
   * Handler for the element click event
   * @param event The mouse click event
   */
  function handleElementClicked( event, fIgnoreSelectionColor )
  {
    var strSelRowId = event.currentTarget.id;

    $( "#" + strSelRowId ).removeClass( m_strCssElemenHover );

    if ( !event.metaKey && !event.shiftKey ) // this is a single selection - no meta or shift key
    {
      clearSelections( fIgnoreSelectionColor );

      m_aSelectedElementIds = [strSelRowId];


      if ( fIgnoreSelectionColor )
      {
        return;

      }

      $( "#" +  strSelRowId ).addClass( m_strCssElementSelected );
      return;

    }

    if ( !m_fMultipleSel )
    {
      clearSelections( fIgnoreSelectionColor );
      m_aSelectedElementIds = [strSelRowId];

      return;              // Not a multiple selection control
    }


    if ( m_aSelectedElementIds == null )
    {
      m_aSelectedElementIds = [];
    }

    if ( event.metaKey || event.shiftKey )
    {
      if ( event.shiftKey )
      {
        handleShiftKeySelection( strSelRowId )
      }
      else
      {
        handleCmdKeySelection( strSelRowId )
      }
    }

  }


  /**
   * Sets the selected elements array back to null
   */
  function clear()
  {
    m_aSelectedElementIds = null;
  }

  /**
   * Handle selection color for the row clicked holding down the cmd (meta) key
   * @param strElementId The row id that was clicked
   */
  function handleCmdKeySelection( strElementId )
  {

    // see if clicked row is already selected, and de-select it if it is

    for ( var x = 0, nLen = m_aSelectedElementIds.length; x < nLen; x++ )
    {

      if ( m_aSelectedElementIds[x] == strElementId )
      {
        // de-select row

        $( "#" + strElementId ).removeClass( m_strCssElementSelected );
        m_aSelectedElementIds.splice( x, 1 ); // remove ot from array

        if ( m_aSelectedElementIds.length == 0 )
        {
          m_aSelectedElementIds = null;

        }

        return;

      }
    } // end for()


    // Not already selected so added it

    m_aSelectedElementIds.push( strElementId );

    $( "#" + strElementId ).addClass( m_strCssElementSelected );

  }


  /**
   * Handles the row range selection when the shift key is clicked
   * @param strLastSelectedId  The id of the last element clicked with the shift key held down
   */
  function handleShiftKeySelection( strLastSelectedId )
  {
    VwUiUtils.clearTextSelections();

    if ( m_aSelectedElementIds.length == 0 )
    {
      m_aSelectedElementIds.push( strLastSelectedId );
      $( "#" + objSelection.id ).addClass( m_strCssElementSelected );

      return;


    }

    // Get the child divs from the body

    var nFirstSel = Number( extractNbrFromId( $( "#" + m_aSelectedElementIds[0] ).attr( "data-rownbr" ) ) );

    var nLastSel = Number( extractNbrFromId( $( "#" + strLastSelectedId ).attr( "data-rownbr" ) ) );
    // this completes a set

    var nInc = 1;

    if ( nFirstSel > nLastSel )
    {
      nInc = -1;
    }

    var nCount = Math.abs( nLastSel - nFirstSel ) + 1;

    var aControlChildren = $( "#" + m_strControlId ).children();


    for ( var x = 0, y = nFirstSel; x < nCount; x++ )
    {

      if ( aControlChildren[y].id == m_aSelectedElementIds[0] )
      {
        y += nInc;
        continue;
      }

      m_aSelectedElementIds.push( aControlChildren[y].id ); // This is the first in a multiple selection

      $( "#" + aControlChildren[y].id ).addClass( m_strCssElementSelected );
      y += nInc;

    }

  } // end handleShiftKeySelection()


  function extractNbrFromId( strId )
  {
    return Number( strId.substring( strId.lastIndexOf( "_" ) + 1 ) );

  }




  /**
   * Reset any selected elements to the original color
   */
  function clearSelections( fIgnoreSelctions )
  {
    VwUiUtils.clearTextSelections();

    if ( m_aSelectedElementIds == null || fIgnoreSelctions )
    {
      m_aSelectedElementIds = null;
      return;

    }

    for ( var x = 0; x < m_aSelectedElementIds.length; x++ )
    {

      var strElementId = m_aSelectedElementIds[x];
      $( "#" + strElementId ).removeClass( m_strCssElementSelected );
      $( "#" + strElementId ).removeClass( m_strCssElemenHover );

    }

    m_aSelectedElementIds = null;

  } // end


  /**
   * Makes a single element id selection
   * @param strElementId The slected element id
   */
  function setSelectedElementId( strElementId )
  {
    m_aSelectedElementIds = [strElementId];

    $( "#" + strElementId ).addClass( m_strCssElementSelected )

  } // end


  /**
   * Makes a multiple element selection
   * @param aSelectedElementIds Array of selected elements
   */
  function setSelectedElementIds( aSelectedElementIds )
  {
    m_aSelectedElementIds = aSelectedElementIds;

  }


  /**
   * Gets the first selected element
   *
   * @returns the if the first selected element or null if nothing selected
   */
  function getSelectedElementId()
  {
    if ( m_aSelectedElementIds )
    {
      return m_aSelectedElementIds[0];
    }

    return null;

  }


  /**
   * Removes an id if its in the selection list
   * @param strId
   */
  function removeId( strId )
  {
    if ( m_aSelectedElementIds )
    {

      for ( let x = 0, nLen = m_aSelectedElementIds.length; x < nLen; x++ )
      {
        if ( m_aSelectedElementIds[x] == strId )
        {
          m_aSelectedElementIds.slice( x, 1 );
        }
      }
    }
  }


  /**
   * Test to see if an element is selected
   * @param strElementId The elements id to test
   *
   * @returns {boolean} true if selected, false otherwise
   */
  function isSelected( strElementId )
  {
    if ( m_aSelectedElementIds )
    {
      for ( var x = 0, nLen = m_aSelectedElementIds.length; x < nLen; x++ )
      {
        if ( strElementId == m_aSelectedElementIds[x] )
        {
          return true;
        }
      }
    }

    return false;

  }


  /**
   * Return an array pf selected Element Ids
   * @returns An array of selected element ids or null if no selections
   */
  function getSelectedElementIds()
  {
    return m_aSelectedElementIds;
  }

} // end VwElementSelectionHandler{}

export default VwElementSelectionHandler;
