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
 *  ============================================================================================
 * /
 */

/**
 * THis class converts a element tag into an input tag when either the edit method is called or
 * <br/>the user clicks the element tag twice. The user properties object (optional) adds additional functionality
 * <br/>described below. The tab identified bu the strSpan id MUST BE a element tag.
 *
 * @param strElementId The id of the element tag this class will edit
 * @param objProps (optional values are:
 *
 * fnDataChange:function(strNewVal, fnComplete ) (optional fnComplete) A callback function this will be invoked when the edit mode is complete.
 * <br/>The callback paramater is the updated value in the element tag.
 * data:object (optional) A data object that will be updated when the user hits the enter key or focus is lost on the input control
 * dataIdProp:string (optional) This identifies the property on the data object that will be updated when the edit is finished.
 * <br/>If omitted the id of the property is assumed to be the id of the element tag
 * cssInput:string(optional) The name of a class that will be applied on the input control when in edit mode,
 * cssSelected:String(optional) The name of the css class that will be applied to the element tag when the user clicks on it
 * <br/>otherwise the font and color characteristics of the element tag will be applied to the input control
 * disableEditOnClick:boolean (optional) if true, only calling the edit method will put the element in edit mode, otherwise
 * clicking the mouse twice - the default, will put the element tag in edit mode.
 *
 * @constructor
 */
function VwEditableElement( strElementId, objProps )
{

  const m_strElementId = strElementId;
  let m_props;
  let m_fEditMode = false;
  let m_fInputMode = false;
  let m_strOriginalSpanText;

  // Public Methods
  this.edit = edit;
  this.endEdit = doInput2Element;
  this.reset = reset;
  this.focus = focus;

  this.isEditMode = isEditMode;
  this.updateData = updateData;

  // Private Methods
  configProps( objProps );

  setupEditableElement();

  /**
   * element edit setup - verify element tag
   */
  function setupEditableElement()
  {

    // Add a tabindex if one isn't defined so we can get loss of focus event
    var strTabIndex = $( "#" + m_strElementId ).attr( "tabindex" );

    if ( !strTabIndex )
    {
      $( "#" + m_strElementId ).attr( "tabindex", "0" );
    }

    // load element tag value from data object if specified
    if ( m_props.data )
    {
      let strDataId;

      if ( m_props.dataId )
      {
        strDataId = m_props.dataId;
      }

      if ( strDataId )
      {
        $( "#" + m_strElementId ).html( m_props.data[strDataId] );
      }
      else
      {
        $( "#" + m_strElementId ).html( m_props.data );
      }
    }

    setupActions();

  }

  /**
   * Click handler on element tag
   */
  function setupActions()
  {
    if ( m_props.disableEditOnClick )
    {
      return;
    }

    $( "#" + m_strElementId ).click( handleElementClick );
  }


  /**
   * Puts the focus on the input control if we're in edit mode
   */
  function focus()
  {
    if ( m_fEditMode )
    {
      $( "#vwinp_" + m_strElementId ).focus();
    }
  }

  /**
   * Forces edit on element tag
   */
  function edit()
  {
    // Make sure we're not already in edit mode
    if ( m_fEditMode )
    {
      return;
    }

    if ( m_fInputMode )
    {
      return;
    }

    doElement2Input();
  }

  /**
   * Returns true if object is in edit mode, false otherwise
   * @returns {boolean}
   */
  function isEditMode()
  {
    return m_fEditMode;
  }


  function reset()
  {
    if ( m_fEditMode )
    {
      $( "#vwinp_" + m_strElementId ).val( m_strOriginalSpanText );

    }
  }

  /**
   * Updates user data object
   * @param objData
   */
  function updateData( objData )
  {
    m_props.data = objData;
  }

  /**
   * Handles the element click count to determine when edit mode is activated
   */
  function handleElementClick()
  {

    if ( !m_fEditMode )
    {
      m_fEditMode = true;

      // First click just highlights the element text
      $( "#" + m_strElementId ).addClass( m_props.cssSelected ).blur( function ()
                                                                      {
                                                                        $( "#" + m_strElementId ).removeClass( m_props.cssSelected );
                                                                        m_fEditMode = false;
                                                                      } );


      return;
    }

    if ( !m_fInputMode )
    {
      doElement2Input();
    }
  }

  /**
   * If callback function defined, get confirmation else accept the changes
   */
  function confirmEdit()
  {

    var strInputText = $( "#vwinp_" + m_strElementId ).val();

    var fDataChanged = (strInputText != m_strOriginalSpanText);

    // Call edit change callback if specified
    if ( m_props.fnDataChange && fDataChanged )
    {

      m_props.fnDataChange( m_strElementId, strInputText, function ( fAccept )
      {
        if ( !fAccept )
        {
          return;
        }

        doInput2Element( strInputText );
      } );

    }
    else
    {
      doInput2Element( strInputText );

    }

    m_fEditMode = m_fInputMode = false;

    if ( m_props.fnEditMode )
    {
      m_props.fnEditMode( m_fEditMode );
    }
  }

  /**
   * Convert element to input or textarea element
   */
  function doElement2Input()
  {

    m_fInputMode = true;

    if ( m_props.fnEditMode )
    {
      m_props.fnEditMode( m_fEditMode );
    }

    // Save the text and the attributes before removing
    m_strOriginalSpanText = $( "#" + m_strElementId ).text();

    // Add input control inside element tag
    var strInputId = "vwinp_" + m_strElementId;

    var inputEl;

    switch ( m_props.type )
    {
      case "input":

        inputEl = $( "<input>" ).attr( {
                                         "id"  : strInputId,
                                         "type": "text"
                                       } ).val( m_strOriginalSpanText ).addClass( m_props.cssInput );
        break;

      case "textarea":

        inputEl = $( "<textarea>" ).attr( {"id": strInputId} ).val( m_strOriginalSpanText ).addClass( m_props.cssInput );
        break;

    }

    $( "#" + m_strElementId ).html( inputEl );

    $( "#vwinp_" + m_strElementId ).select().focus();

    if ( !m_props.disableEditOnClick )
    {
      $( "#vwinp_" + m_strElementId ).blur( confirmEdit );
    }

    // We look for enter key to apply data changes and convert back to element tag

    $( "#vwinp_" + m_strElementId ).keyup( ( key ) =>
                                           {
                                             // Enter Key
                                             if ( key.keyCode == 13 )
                                             {
                                               confirmEdit();
                                             }
                                             else
                                             {
                                               if ( key.keyCode == 27 ) // Escape key
                                               {
                                                 doInput2Element( m_strOriginalSpanText, true );
                                               }
                                             }

                                           } );


  }


  /**
   * Converts input back to element tag with the updated text
   * @param strInputText  if specified, user hit escape key the original element text will be restored.
   * @param fEscapeKeyHit
   */
  function doInput2Element( strInputText, fEscapeKeyHit )
  {

    m_fEditMode = m_fInputMode = false;

    if ( m_props.fnEditMode )
    {
      m_props.fnEditMode( m_fEditMode );
    }

    // Add updated element text
    $( "#" + m_strElementId ).empty().text( strInputText ).removeClass( m_props.cssSelected );

    // User hit escape so don't update
    if ( fEscapeKeyHit )
    {
      return;

    }

    // Update user object if specified
    updateDataObject( strInputText );

  }


  /**
   * Updates data object with new value
   * @param strVal
   */
  function updateDataObject( strVal )
  {
    if ( m_props.data )
    {
      var strDataId = m_strElementId;

      if ( m_props.dataIdProp )
      {
        strDataId = m_props.dataIdProp;
      }

      m_props.data[strDataId] = strVal;
    }

  }

  /**
   * Create the default properties and apply user settings
   * @param objUserProps Additional user properties
   */
  function configProps( objUserProps )
  {

    m_props = {};
    m_props.type = "input";
    m_props.cssInput = "VwInputCntrl";
    m_props.cssSelected = "VwElementSelected";

    $.extend( m_props, objUserProps );
  }

} // end VwEditableElement{}

$.fn.VwEditableElement = function ( objSpanProps )
{
  return new VwEditableElement( this[0].id, objSpanProps );
};

export default VwEditableElement;