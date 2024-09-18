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

import VwHashMap from "../../util/VwHashMap/VwHashMap.js";
import VwExString from "../../util/VwExString/VwExString.js";
import VwUiUtils from "../VwCommon/VwUiUtils.js";
import VwPasswordMgr from "/vozzworks/ui/VwPasswordMgr/VwPasswordMgr.js";
import {vwError} from "/vozzworks/ui/VwPopupMsgBox/VwPopupMsgBox.js";

VwCssImport( "/vozzworks/ui/VwFormMgr/style");


/**
 * Constructor for the field dictionary
 *
 * @param strFieldName   The high level field name this control represents (usually the prompt name to the left i.e. First Name:)
 * <br>NOTE If the fieldName starts with the i18n_ character, then the field name represents a property key in a resource bundle. An Instance of
 * <br>The VwPropertyMgr must be passed when instantiated the VwFormMgr.
 * @param fIsRequired      if true, the field is required
 * @param strFieldType The type of input control, the following values are supported:
 *                        <br> 't' -- text input field
 *                        <br> 'n' -- numeric input field                        <br> 'p' -- password field
 *                        <br> 'c' -- a check box field
 *                        <br> 's' -- a selection control
 *                        <br> 'r:<field name>' -- a re-enter field where the field name following the colan is the Not this is a case insensitive compare
 *                        <br> 'ri:<field name>' -- a re-enter field where the field name following the colan is the Not this is a case sensitive compare
 *                        <br>     dependent field name on the form (i.e. 'r:reg_password' The 'reg_password' is the form field that the re-enter field must match
 *                        <br>  'cust' for a custom control
 * @param strREGX The edit mask applied to the field for validating and formatting
 * @param vwCustomControl The custom control instance which must define isSelectedItem and getSelectedItem
 *
 * @throws error exception if the first three arguments are not passed, or the boolean fields fIsRequired
 */
export function VwFieldDictionary( strFieldName, strFieldType, fIsRequired, strREGX, vwCustomControl, strErrorMsg )
{
  const self = this;

  let   m_strREGX = strREGX;
  let   m_customControl = vwCustomControl;
  let   m_fIgnoreCase = false;
  let   m_strFieldName = strFieldName;
  let   m_fIsRequired = fIsRequired;
  let   m_strFieldType = strFieldType;
  let   m_strMustEqFieldName;
  let   m_strErrorMsg = strErrorMsg;

  if ( arguments.length < 3 )
  {
    throw "The VwFieldDictionary constructor requires the first three arguments fieldName, required, and field edit mask to be passed";
  }

  if ( typeof strFieldType == "undefined" )
  {
    throw "The field type must be specified";

  }

  if ( typeof fIsRequired != "boolean" )
  {
    throw "The isRequired argument must be  boolean";
  }

  // Public methods

  this.isNumeric = () => strFieldType == "n";


  /**
   * Getter/Setter for fields name
   * @param strFieldName
   * @returns {*}
   */
  this.fieldName = function ( strFieldName )
  {
    if ( strFieldName )
    {
      m_strFieldName = strFieldName;
    }
    else
    {
      return m_strFieldName;
    }
  }


  /**
   * Getter/Setter for field type
   * @param strFieldType
   * @returns {*}
   */
  this.fieldType = function ( strFieldType )
  {
    if ( strFieldType )
    {
      m_strFieldType = strFieldType;
    }
    else
    {
      return m_strFieldType;
    }
  }


  /**
   * Getter/Setter for required
   * @param fIsRequired
   * @returns {*}
   */
  this.isRequired = function ( fIsRequired )
  {
    if ( fIsRequired )
    {
      m_fIsRequired = fIsRequired;
    }
    else
    {
      return m_fIsRequired;
    }
  }


  /**
   * Getter/Setter for regx validation
   * @param strREGX
   * @returns {*}
   */
  this.regX = function ( strREGX )
  {
    if ( strREGX )
    {
      m_strREGX = strREGX;
    }
    else
    {
      return m_strREGX;
    }
  }

  this.isCustomControl = isCustomControl;

  /**
   * Getter/Setter for VwControl instance
   * @param custControl
   * @returns {*}
   */
  this.customControl = function ( custControl )
  {
    if ( custControl )
    {
      m_customControl = custControl;

    }
    else
    {
      return m_customControl;
    }
  }

  /**
   * Getter/Setter for error msg
   * @param strErrorMsg
   * @returns {*}
   */
  this.errorMsg = function ( strErrorMsg )
  {
    if ( strErrorMsg )
    {
      m_strErrorMsg = strErrorMsg;
    }
    else
    {
      return m_strErrorMsg;
    }
  }


  /**
   * Getter/Setter for format mask
   * @param strFormatMask
   * @returns {*}
   */
  this.formatMask = function ( strFormatMask )
  {
    if ( strFormatMask )
    {
      m_strErrorMsg = strErrorMsg;
    }
    else
    {
      return m_strErrorMsg;
    }
  }


  /**
   * Getter/Setter for the mustEqualFieldName
   * @param strMustEqualFieldName
   * @returns {*}
   */
  this.mustEqFieldName = function ( strMustEqualFieldName )
  {
    if ( strMustEqualFieldName )
    {
      m_strMustEqFieldName = strMustEqualFieldName;
    }
    else
    {
      return m_strMustEqFieldName;

    }
  }


  this.isCustomControl = isCustomControl;
  
  if ( isCustomControl() && arguments.length != 5 )
  {
    throw "The object instance for control type: " + strFieldType + " must be specified";
  }


  if ( m_strFieldType.charAt( 0 ) == 'r' || VwExString.startsWith( m_strFieldType, "ri" ) )
  {
    if ( m_strFieldType.length < 3 )
    {
      throw "Invalid format for the re-enter field type,  must be r:<field name>";
    }


    if ( VwExString.startsWith( m_strFieldType, "ri" ) )
    {
      m_strMustEqFieldName = m_strFieldType.substring( 3 );
      m_fIgnoreCase = true;

    }
    else
    {
      m_strMustEqFieldName = m_strFieldType.substring( 2 );
    }

    m_strFieldType = 'r';

  }


  this.isReEnter = function ()
  {
    return m_strMustEqFieldName != null;
  };

  this.isPassword = function ()
  {
    return m_strFieldType == "p";
  };


  /**
   * Validate the field
   * @return null if the validate passed else return an error message
   */
  this.validate = function ( resourceMgr, formProps )
  {
    const strFieldId = `#${this.id}`;

    let strType;
    let bMatchErr;

    $( strFieldId ).css( "background-color", this.bgColor );

    const htmlElement = $( strFieldId )[0];

    if ( !htmlElement && !isCustomControl() )
    {
      throw `htmlElement id:${strFieldId} was specified in the dictionary for form id: ${this.vwFormMgr.formId} but was not found on the form.`;
    }

    let strVal = $( strFieldId ).val();


    if ( VwExString.contains( strVal, "<script" ) )
    {

      if ( resourceMgr )
      {
        return resourceMgr.getString( "noScript" )
      }
      else
      {
        return "<script tags are not allowed in input fields";
      }
    }

    if ( !isCustomControl() )
    {
      strType = htmlElement.type;
    }

    if ( this.isRequired() )
    {
      if ( isCustomControl() )
      {

        const strErrMsg = validateCustomControl( resourceMgr );

        if ( strErrMsg != null )
        {
          return strErrMsg;

        }

        return null;

      }

      switch ( strType )
      {
        case "radio":
        case "checkbox":

          if ( !$( strFieldId ).prop( "checked" ) )
          {

            if ( resourceMgr == null )
            {
              return this.fieldName() + " must be checked";

            }
            else
            {
              return resourceMgr.xlateString( this.fieldName() + " @checkedField" );
            }

          }

          break;

        case "select-one":

          if ( $( strFieldId + " option:selected" ).prop( "index" ) == 0 )
          {
            if ( resourceMgr == null )
            {
              return this.fieldName() + " Requires a selection";

            }
            else
            {
              return resourceMgr.xlateString( "@mustSelect @category" );
            }

          }

        case "password":

          if ( this.isReEnter() ) // dont validate rernter passwords
          {
            return validateReEnterField.call( this, strVal, resourceMgr );

          }

          if ( formProps.customValidateMgr && formProps.customValidateMgr.checkPassword )
          {
            const nErrorCount =  formProps.customValidateMgr.checkPassword();
            if ( nErrorCount > 0 )
            {
              return "Password validation criteria failed!"
            }
          }
          else
          {
            if ( this.isRequired() && strVal.length == 0 )
            {
              if ( resourceMgr == null )
              {
                return this.fieldName() + " is a required field";

              }
              else
              {
                return resourceMgr.xlateString( this.fieldName() + " @requiredField" );
              }

            }
          }

          break;

        default:

          if ( strVal.length > 0 )
          {
            strVal = VwExString.stripWhiteSpace( strVal );
            if ( strVal.length == 0 )
            {
              if ( resourceMgr == null )
              {
                return this.fieldName() + "is a required field and cannot contain all spaces";

              }
              else
              {
                return resourceMgr.xlateString( this.fieldName() + " @noSpaces" );
              }

            }
          }

          if ( strVal == "" )
          {

            if ( resourceMgr == null )
            {
              return this.fieldName() + " is a required field";

            }
            else
            {
              return resourceMgr.xlateString( this.fieldName() + " @requiredField" );
            }

          }

          if ( self.isNumeric() && isNaN( strVal ))
          {
            return `${this.fieldName()} must be numeric`;

          }
          // See if we have a regx test
          if ( m_strREGX )
          {

            if ( !m_strREGX.test( strVal ) )
            {
              if ( !m_strErrorMsg )
              {
                return "REGX Failed, Please define an error msg";

              }

              return m_strErrorMsg;
            }
          }

      } // end switch


    } // end if
    else
    {
      // Field not required but has regx defined
      if ( m_strREGX )
      {
        // Only validate if field has data
        if ( !strVal || strVal.length == 0 )
        {
          return;

        }

        switch ( strType )
        {
          case "radio":
          case "checkbox":
          case "select-one":

            return null; // Ignore these

          default:

            if ( self.isNumeric() && isNaN( strVal ))
            {
              return `${this.fieldName()} must be numeric`;

            }

            if ( !m_strREGX.test( strVal ) )
            {
              if ( !m_strErrorMsg )
              {
                return "REGX Failed, Please define an error msg";

              }

              return m_strErrorMsg;
            }

        } // end switch()

      } // end if

    } // end else


    return null;  // All edits passed

  } // end validate()

  function validateReEnterField( strVal, resourceMgr )
  {
    if ( !m_strMustEqFieldName )
    {
      vwError( `Compare field id: ${m_strMustEqFieldName} is not defined on this form` );
      return null;
    }

    // Get the value for the compare field

    const strCompareVal = $( `#${this.mustEqFieldName()}` ).val();


    const objCompare = this.vwFormMgr.getDictionaryItem( this.mustEqFieldName() );

    let bMatchErr = false;

    if ( m_fIgnoreCase )
    {
      if ( strVal.toLowerCase() != strCompareVal.toLowerCase() )
      {
        bMatchErr = true;
      }

    }
    else
    {
      if ( strVal != strCompareVal )
      {
        bMatchErr = true;
      }
    }

    if ( bMatchErr )
    {
      if ( m_strErrorMsg )     // User defined error msg
      {
        return m_strErrorMsg;
      }

      if ( resourceMgr == null )
      {
        return this.fieldName() + " does not match " + objCompare.fieldName();

      }
      else
      {
        return resourceMgr.xlateString( this.fieldName() + " @noMatch " + objCompare.fieldName() );
      }

    }

    return null;

  } // end validateReEnterField()


  /**
   * Validate a VwControl
   * @param resourceMgr
   * @returns {*}
   */
  function validateCustomControl( resourceMgr )
  {

    if ( !m_customControl.isSelectedItem() )
    {

      if ( m_strErrorMsg )  // User defined error message
      {
        return m_strErrorMsg;


      }

      if ( resourceMgr == null )
      {
        return m_strFieldName + " requires a selection";

      }
      else
      {
        return resourceMgr.xlateString( m_strFieldName + " @requiredField" );
      }

    }

    return null; // No Error

  } // end validateCustomControl()


  /**
   * Checks to see if field type is a Vozzware control
   *
   *
   * @returns {Boolean}
   */
  function isCustomControl()
  {
    return m_strFieldType == "cust";
  }

} // end VwFieldDictionary

// REGX Constants

VwFieldDictionary.RXEMAIL = /^[A-z0-9._%+-]+@[A-z0-9.-]+\.[A-z]{2,4}$/;
VwFieldDictionary.RXUSERID = /^[a-zA-Z0-9]{6,20}$/;
VwFieldDictionary.RXMARKETUSERID = /^[a-zA-Z0-9]{4,20}$/;
VwFieldDictionary.RXNAME = /^[a-zA-Z]+$/;

// ONE UPPER -- ONE SPECIAL CHARACTER -- ONE LOWER -- ONE NUMBER -- LENGTH > 7
VwFieldDictionary.RXPASSWORD = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$@$#!%*?&])[0-9a-zA-Z!@#$%.*-_+=?]{8,}$/;
VwFieldDictionary.RXPHONE = /^(\+(([0-9]){1,2})[-.])?((((([0-9]){2,3})[-.]){1,2}([0-9]{4,10}))|([0-9]{10}))$/;
VwFieldDictionary.RX2DIGIT_NUMBER = /^\d{2}$/;
VwFieldDictionary.RX2FACODE = /^\d{6}$/;
VwFieldDictionary.RX2DIGIT_MONTH = /^1[0-2]$|^0[1-9]$/;
VwFieldDictionary.RXCID = /^\d{3,4}$/;
VwFieldDictionary.RXCREDITCARD = /(5[1-5]\d{14})|(4\d{12}(\d{3})?)|(3[47]\d{13})|(6011\d{12})|((30[0-5]|36\d|38\d)\d{11})/;
VwFieldDictionary.RXLETTERS = /^[a-zA-Z\s]+$/;
VwFieldDictionary.RXLETTERSNUMBERS = /^[a-zA-Z0-9\s]+$/;
VwFieldDictionary.RXNUMBERS = /^[0-9\s]+$/;
VwFieldDictionary.RXNUMBER_1_TO_100 = /^[1-9][0-9]?$|^100$/;
VwFieldDictionary.RXNUMBER_1_TO_10000 = /^[1-9][0-9]?$|^10000$/;
VwFieldDictionary.RXNUMBERSDECIMAL = /^-*[0-9,\.]+$/;
VwFieldDictionary.RXFILENAME = /^[a-zA-Z0-9_ .@()-]+\.[^.]+$/;

/**
 * Constructor for the VwFormMgr Object
 *
 * @param formProps Optional User form properties. The following properties are recognized:
 *   errorHandling:String,Optional a value of "single" displays a single field in error and validation stops when the first error is encountered
 *   <br/>A value of "all" displays all validations with each field in error outlined in red. Mousing over an error field will display a tooltip
 *   <br/>underneath the field with the error description text. The default is "all"
 *   fieldWrapperPrefix:String,Optional if the input field is wrapped in a parent div, then id id for that div should be the value of
 *   <br/>this prefix + the id of the input field. I.e. wrapper_firstName would be the id if this property wast set to "wrapper_"
 *   <br/>and the input field id was firstName
 *   cssTooltip:String,Optional The name of the css class to override default styling of the tool tip
 *   cssErrorField:String,Optional Name of Class override for the field with error. Default is VwErrorField
 *   cssErrorInfo:String,Optional Name of Class override for the error info display box. The default VwErrorInfoBox
 *   defaultButtonId:String,Optional The button id on the form that is the default action when the enter key is pressed
 *   passwordValidateMgr:Class,Optional This is the manager to handle password and field validation, If not specified the VwPasswordMgr is used
 *
 * @param vwresourceMgr Optional The VwPropertyMgr instance (only needed if doing i18n) The VwPropertyMgr contains the loaded resource bundle
 * @constructor
 */
export function VwFormMgr( formProps, vwresourceMgr )
{
  const self = this;
  const m_mapFieldDictionary = new VwHashMap();
  const m_aDictionaryItems = [];
  const m_formProps = {};
  const m_mapFieldErrors = new VwHashMap();

  let   m_strPasswordCtl = null;
  let   m_fNeedMetricCalc = true;
  let   m_strDefaultBtnId = null;
  let   m_resourceMgr = null;
  let   m_strFieldInErrorId;

  // HTML id/class names and jQuery selectors
  const m_strInputFocusError = "VwInputFocusError";
  const m_strErrorArrowClass = "VwErrorArrow";
  const m_strErrorInfoSpanDivId = "vwErrorInfoBox";
  const m_strErrorDivId = "vwFormError";

  let   m_strErrorInfoClass = "VwErrorInfoBox";

  if ( vwresourceMgr )
  {
    m_resourceMgr = vwresourceMgr;
  }

  let   m_objFormData = null;

  // Config properties must run first
  configProperties( formProps );

  // Public methods
  this.loadForm = loadForm;
  this.unloadForm = unLoadForm;
  this.addToDictionary = addToDictionary;
  this.removeFromDictionary = removeFromDictionary;
  this.getProperty = getProperty;
  this.setFormObject = setFormObject;
  this.setFieldInError = setFieldInError;
  this.clearFieldInError = clearFieldInError;
  this.close = closeForm;
  this.clear = clear;
  this.isFieldError = (strFieldId ) => m_mapFieldErrors.containsKey( strFieldId );

  this.getDictionaryItem = function ( strId )
  {
    return m_mapFieldDictionary.get( strId );
  };

  configObject();

  /**
   * Create the field error html popup
   */
  function configObject()
  {

    setupActions();

    if ( m_formProps.errorInfoCss )
    {
      m_strErrorInfoClass = formProps.errorInfoCss;
    }
    else
    {
      $( "." + m_strErrorArrowClass ).addClass( m_formProps.cssErrorArrowColor );
    }

    if ( m_formProps.initialFocusFieldId )
    {
      $(`#${m_formProps.initialFocusFieldId}`).focus();
    }

    if ( !$( `#${m_strErrorDivId}` ).length )
    {
      const errorDivEl = $( "<div>" ).attr( "id", m_strErrorDivId ).addClass( m_strErrorInfoClass ).css( "display", "none" );
      errorDivEl.append( $( "<span>" ).addClass( m_strErrorArrowClass ).html( "&#x25c0;" ) );
      errorDivEl.append( $( "<span>" ).attr( "id", m_strErrorInfoSpanDivId ) );

      $( "body" ).append( errorDivEl );
    }

    if ( !$( `#vwFormToolTip` ).length )
    {
      const strErrorToolTip = $( "<div id='vwFormToolTip'>" ).addClass( m_formProps.cssErrorToolTip ).css( "display", "none" );

      $( "body" ).append( strErrorToolTip );
    }

    // handle i18n replacement if bundle name and folder was specified
    if ( m_resourceMgr != null )
    {
      VwUiUtils.doI18n( m_resourceMgr );
    }

  }


  /**
   * Handle window resize readjust error message popup
   */
  function handleAdjustErrMsg()
  {
    if ( !m_strFieldInErrorId )
    {
      return; // nothing to do
    }

    const strFieldId = "#" + m_strFieldInErrorId;

    const nWidth = $( strFieldId ).outerWidth();
    const objOffset = $( strFieldId ).offset();

    const xPos = nWidth + objOffset.left;

    const yPos = objOffset.top;

    $( "#" + m_strErrorDivId ).css( {"left": xPos, "top": yPos + 7} ).show();
  }


  /**
   * Add a form dictionary element to the dictionary
   *
   * @param strFormCtrlId       The id of the form element
   * @param dictionaryItem      The dictionary item to add
   * @param strFormErrorCtrlId  The id element where to add the error highlighting
   */
  function addToDictionary( strFormCtrlId, dictionaryItem, strFormErrorCtrlId )
  {
    m_aDictionaryItems.push( strFormCtrlId );
    m_mapFieldDictionary.put(strFormCtrlId, dictionaryItem );

    dictionaryItem.vwFormMgr = this;
    dictionaryItem.bgColor = $( "#" + strFormCtrlId ).css( "background-color" );
    dictionaryItem.color = $( "#" + strFormCtrlId ).css( "color" );
    dictionaryItem.id = strFormCtrlId;
    dictionaryItem.errorId = strFormErrorCtrlId;

    if ( dictionaryItem.isPassword() )
    {
      setupPasswordEventHandlers( strFormCtrlId );
    }
    else
    {
      setupFieldEventHandlers( dictionaryItem, strFormCtrlId );
    }

  }

  /**
   * Remove a form element from the dictionary
   *
   * @param strFormCtrlId The id of the form element
   */
  function removeFromDictionary( strFormCtrlId )
  {

    for ( let x = 0, nLen = m_aDictionaryItems.length; x < nLen; x++ )
    {

      if ( m_aDictionaryItems[x] == strFormCtrlId )
      {
        m_aDictionaryItems.splice( x, 1 );

        m_mapFieldDictionary.remove( strFormCtrlId );

        return;
      }

    }

    removeFieldEventHandlers( strFormCtrlId );

  }


  /**
   * Load the form from the data object
   *
   * @param objFormData The object containing the form field data
   */
  function loadForm( objFormData )
  {
    m_objFormData = objFormData;

    for ( let x = 0, nLen = m_aDictionaryItems.length; x < nLen; x ++ )
    {
      const dictionaryItem = m_mapFieldDictionary.get( m_aDictionaryItems[x] );

      setFormField( dictionaryItem, objFormData );
    }

    //*** handle i18n replacement if bundle name and folder was specified
    if ( m_resourceMgr != null )
    {
      VwUiUtils.doI18n( m_resourceMgr );

    }

  }

  /**
   * Sets the object to be used for the form
   * @param objFormData
   */
  function setFormObject( objFormData )
  {
    m_objFormData = objFormData;

  }


  /**
   * Sets the named field inn error. The error box is displayed next to the field
   * @param strFieldId The id of the field in error
   * @param strErrorText The error text or a resource bundle key (if the first character is an '@' character)
   */
  function setFieldInError( strFieldId, strErrorText )
  {
    let strErrorMsg = null;

    if ( VwExString.startsWith( strErrorText, "i18n_" ) )
    {
      strErrorMsg = getProperty( strErrorText.substring( 5 ) );
    }
    else
    {
      strErrorMsg = strErrorText;
    }

    const dictionaryItem = findDictionaryItem( strFieldId );

    if ( !dictionaryItem )
    {
      vwError( "No dictionary Id:" + strFieldId + " was defined for this form" );
    }

    showError( dictionaryItem, strErrorMsg );
  }


  /**
   * Look up dictionary item by its id
   *
   * @param strFieldId The field id
   * @returns {*}
   */
  function findDictionaryItem( strFieldId )
  {

    for ( let x = 0, nLen = m_aDictionaryItems.length; x < nLen; x++ )
    {
      const strDictItemId = m_aDictionaryItems[x];

      if ( strDictItemId == strFieldId )
      {
        return m_mapFieldDictionary.get( strDictItemId );
      }
    }

    return null;

  }


  /**
   * Reset fields error back to original colors
   * @param strFieldId
   */
  function clearFieldInError( dictionaryItem )
  {
    let strFieldId;

    if ( dictionaryItem.errorId  )
    {
      strFieldId = dictionaryItem.errorId;
    }
    else
    {
      strFieldId = dictionaryItem.id ;
    }

    resetForm();

    if ( dictionaryItem.fnErrorHandler )
    {
      m_mapFieldErrors.remove( strFieldId );
      dictionaryItem.fnErrorHandler( strFieldId, "", true );

      return;
    }

    if ( m_formProps.errorHandling == "all" )
    {
      m_mapFieldErrors.remove( strFieldId );
      if ( m_formProps.fieldWrapperPrefix )
      {
        strFieldId = m_formProps.fieldWrapperPrefix + strFieldId;
      }

      $( `#${strFieldId}` ).removeClass( `${m_formProps.cssErrorOutlineField}  ${m_formProps.cssInputError}`);
      $( `.${m_formProps.cssErrorToolTip}` ).hide();

    }
    else
    {
      $( `#${strFieldId}` ).removeClass( `${m_strInputFocusError} ${formProps.cssErrorField}  ${m_formProps.cssInputError}` )
    }

    m_strFieldInErrorId = null;

  }


  /**
   * Release form resize and keydown events
   */
  function closeForm()
  {

    $( window ).off( "resize",  handleAdjustErrMsg );
    $( document ).off( "keydown", handleKeyDown );

  } // end close()

  /**
   * Resets for state
   */
  function resetForm()
  {
    if ( m_formProps.customValidateMgr && m_formProps.customValidateMgr.close )
    {
      m_formProps.customValidateMgr.close();
    }

    $( `#${m_strErrorDivId}` ).hide();

  } // end resetForm()

  /**
   * Unloads the form and returns a JSON object with values from the controls
   *
   * @param fValidate if true, apply validation rules to form fields, return null if validate fails
   * @param fReturnAsString if true (the default )return form object as a string else return as an object
   */
  function unLoadForm( fValidate, fReturnAsString )
  {
    let  fStringify = true;

    if ( typeof fReturnAsString != "undefined" && fReturnAsString == false )
    {
      fStringify = false;
    }


    if ( fValidate )
    {
      if ( !validateFields( m_formProps ) )
      {
        return null;
      }
    }

    let objFormData = m_objFormData;

    if ( !objFormData )
    {
      objFormData = {};
    }


    let  strVal = "";

    for ( let x = 0, nLen = m_aDictionaryItems.length; x < nLen; x++ )
    {

      const strItemId = m_aDictionaryItems[x];

      const dictionaryItem = m_mapFieldDictionary.get( strItemId );

      const strControlId = "#" + dictionaryItem.id;

      let strPropName = null;

      const ctl = $( strControlId )[0];

      if ( dictionaryItem.isCustomControl() )
      {
        strVal = dictionaryItem.customControl().getSelectedId();
        const objToSet = getObjectFromDataPath( ctl, objFormData );
        objToSet[dictionaryItem.id] = strVal;
        continue;
      }
      else
      {

        if ( !ctl.type )  // not input data, so skip
        {
          continue;
        }

        strVal = $( "#" + ctl.id ).val();
        strPropName = stripPrefix( ctl.id );
      }

      if ( ctl && ctl.type )
      {
        switch ( ctl.type )
        {

          case "radio":
          case "checkbox":

            const fChecked = $( "#" + ctl.id ).prop( "checked" );
            if ( fChecked )
            {
              strVal = 'true';
            }
            else
            {
              strVal = 'false';
            }

            break;

          case "select-one":

            if ( $( "#" + ctl.id + " option:selected" ).prop( "index" ) == 0 )
            {
              strVal = null;
            }

            break;

        } // end switch()

      }

      const objToSet = getObjectFromDataPath( ctl, objFormData );
      objToSet[strPropName] = strVal;

    } // end for()


    if ( fStringify )
    {
      return JSON.stringify( objFormData );
    }

    return objFormData;


  }


  /**
   * Escape any single or double quote characters so not to corrupt JSON terminating quote characters
   * @param strData
   * @return {*}
   */
  function doEscapeCheck( strData )
  {
    let strDataToTest = strData;

    if ( strDataToTest.indexOf( "\"" ) >= 0 )
    {
      strDataToTest = VwExString.replaceAll( strDataToTest, "\"", "\\\"" );
    }

    return strDataToTest;

  }

  /**
   * Clears all fields in the form leaving them to their placholder values or blank if no place holders were defined
   * @returns {boolean}
   */
  function clear()
  {
    resetForm();

    m_mapFieldErrors.clear();

    if ( m_aDictionaryItems.length == 0 )
    {
      return true;
      // No dictionary -- all done
    }

    for ( let x = 0, nLen = m_aDictionaryItems.length; x < nLen; x++ )
    {

      const strItemId = m_aDictionaryItems[x];

      const dictionaryItem = m_mapFieldDictionary.get( strItemId );

      if ( dictionaryItem.isCustomControl() )
      {
        dictionaryItem.customControl().clear();

      }
      else
      {
        resetForm();;
        setFormField( dictionaryItem, null );

      }

    } // end for()


  } // end clear()


  /**
   * Setup all event handler actions
   */
  function setupActions()
  {
    $( window ).on( "resize", handleAdjustErrMsg );

    // Install global keypress event to trap the enter key for default button support
    $( document ).on( "keydown", handleKeyDown );
  }

  /**
   * Handles key down event
   * @param event
   * @returns {boolean}
   */
  function handleKeyDown( event )
  {
    event = event || window.event;

    if ( event.keyCode == 13 && m_strDefaultBtnId )
    {
      $( `#${m_strDefaultBtnId}` ).click();
      return false;
    }

    // clear error field if field was marked in error
    if ( m_strFieldInErrorId && m_strFieldInErrorId == event.target.id )
    {
      clearFieldInError( m_mapFieldDictionary.get( m_strFieldInErrorId ) );
    }

    return true;

  } // end handleKeyDown()


  /**
   * If there is a dictionary, do field validations
   * @return {*}
   */
  function validateFields( formProps )
  {
    resetForm();

    m_mapFieldErrors.clear();

    let  strErrorId;

    let  fAllFieldsValid = true;

    if ( m_aDictionaryItems.length == 0 )
    {
      return true;
      // No dictionary -- all done
    }

    for ( let x = 0, nDictLen = m_aDictionaryItems.length; x < nDictLen; x++ )
    {
      const dictionaryItem = m_mapFieldDictionary.get( m_aDictionaryItems[x] );

      const strErrMsg = dictionaryItem.validate( m_resourceMgr, formProps );

      if ( strErrMsg == null )    // Passed validate
      {
        clearFieldInError( dictionaryItem );
        continue;
      }

      if ( m_formProps.errorHandling == "single" )
      {
        showError( dictionaryItem, strErrMsg );
        return false;
      }

      strErrorId = dictionaryItem.id;

      if ( dictionaryItem.errorId )
      {
        strErrorId = dictionaryItem.errorId;
      }

      if ( m_formProps.fieldWrapperPrefix )
      {
        $( `#${m_formProps.fieldWrapperPrefix}${strErrorId}` ).addClass( m_formProps.cssErrorOutlineField );
      }
      else
      if ( dictionaryItem.fnErrorHandler)
      {
        dictionaryItem.fnErrorHandler( strErrorId, strErrMsg );
      }
      else
      {
        $( `#${strErrorId}` ).addClass( m_formProps.cssErrorOutlineField );
      }

      m_mapFieldErrors.put( strErrorId, strErrMsg );

      fAllFieldsValid = false;

    } // end for()

    if ( !fAllFieldsValid )
    {
      $( "." + m_formProps.cssErrorOutlineField ).hover( handleErrorHoverIn, handleErrorHoverOut );
    }

    return fAllFieldsValid;

  } // end validateFields()

  /**
   * display the error div
   * @param event
   */
  function handleErrorHoverIn( event )
  {
    let strId;

    if ( m_formProps.fieldWrapperPrefix )
    {
      strId = event.currentTarget.id.substring( m_formProps.fieldWrapperPrefix.length );
    }
    else
    {
      strId = event.currentTarget.id;

    }

    const strErrorText = m_mapFieldErrors.get( strId );

    if ( !strErrorText )
    {
      return;
    }

    $( "." + m_formProps.cssErrorToolTip ).text( strErrorText );

    const nWidth = $( "." + m_formProps.cssErrorToolTip ).width();

    $( "." + m_formProps.cssErrorToolTip ).show();

    const fieldErrorPos = $( "#" + event.currentTarget.id ).offset();

    const nFieldErrorWidth = $( "#" + event.currentTarget.id ).width();

    const nFieldErrorHeight = $( "#" + event.currentTarget.id ).height() + 10;

    const nLeft = fieldErrorPos.left + ( nFieldErrorWidth / 2 - nWidth / 2);
    const nTop = fieldErrorPos.top + nFieldErrorHeight;

    $( "." + m_formProps.cssErrorToolTip ).offset( {top: nTop, left: nLeft} );

  }

  /**
   * Hide the rror div
   */
  function handleErrorHoverOut( event )
  {
    $( "." + m_formProps.cssErrorToolTip ).hide();


  }

  /**
   * Display the side field error popup
   *
   * @param dictionaryItem The VwDictionary Item of the field in error
   * @param strMsg The message to display
   */
  function showError( dictionaryItem, strMsg )
  {
    const strFieldId = "#" + dictionaryItem.id;

    m_strFieldInErrorId = dictionaryItem.id;

    const nWidth = $( strFieldId ).outerWidth();
    const objOffset = $( strFieldId ).offset();

    $( strFieldId ).addClass( m_strInputFocusError ).addClass( formProps.cssErrorField ).focus();

    if ( strFieldId.substring( 1 ) == m_strPasswordCtl )
    {
      return;
    }


    $( `#${m_strErrorInfoSpanDivId}` ).html( strMsg );

    const xPos = nWidth + objOffset.left;

    const yPos = objOffset.top;

    $( `#${m_strErrorDivId}` ).css( {"left": xPos, "top": yPos} ).show();
  }


  /**
   * Get a property from a resource bundle
   * @param strPropName
   * @param mapReplaceValues an object with name value keys to replace and ${} places holders
   * @return {*}
   */
  function getProperty( strPropName, mapReplaceValues )
  {
    return m_resourceMgr.getString( strPropName, mapReplaceValues );
  }


  /**
   * Set each control in the form from property values in the JSON object
   *
   * @param dictionaryItem The dictionary item for the form input field
   * @param formData The object with the form field properties
   */
  function setFormField( dictionaryItem, formData )
  {

    const domElement = $( "#" + dictionaryItem.id )[0];

    if ( !domElement )
    {
      return;

    }

    const strPropName = dictionaryItem.id;

    // see if we have an object graph
    formData = getObjectFromDataPath( domElement, formData );

    if ( dictionaryItem.isCustomControl() )
    {
      if ( !formData || !formData[dictionaryItem.id] )
      {
        dictionaryItem.customControl().clear();
      }
      else
      {
        const custControl = dictionaryItem.customControl();

        if ( custControl.setSelectedItemById )
        {
          custControl.setSelectedItemById( formData[dictionaryItem.id] );
        }
        else
        if ( custControl.setSelectedItemByValue )
        {
          custControl.setSelectedItemByValue( formData[dictionaryItem.id], true );
        }
        else
        {
          throw `Custom control: ${custControl.constructor.name} must define either a setSelectedItemById or setSelectedItemByValue to be used in the VwFormMgr`
        }
      }

    }
    else
    {
      const strNodeName = domElement.nodeName.toLocaleLowerCase();

      if ( strNodeName == "span" || strNodeName == "div" || strNodeName.charAt( 0 ) == "h" ) // read only field
      {
        if ( !formData )
        {
          $( `#${domElement.id}`).html( "" );

        }
        else
        {
          $( `#${domElement.id}`).html( formData[strPropName] );
        }

      }
      else
      {
        if ( domElement.type == "text" || domElement.type == "password" || domElement.type == "textarea" || domElement.type == "select-one" || domElement.type == "select" )
        {
          if ( !formData )
          {
            $( `#${domElement.id}` ).val( "" );

          }
          else
          {
            $( `#${domElement.id}` ).val( formData[strPropName] );
          }
        }
        else
        {
          if ( domElement.type == "select-multiple" )
          {
            if ( !formData )
            {
              doClearMultiple( domElement.id )
            }
            else
            {
              doSelectMultiple( domElement.id, formData[strPropName] );
            }
          }
          else
          {
            if ( domElement.type == "checkbox" || domElement.type == "radio" )
            {
              let fChecked = false;
              if ( !formData )
              {
                fChecked = false;

              }
              else
              {
                if ( formData[strPropName] == true )
                {
                  fChecked = true;
                }
              }

              $( `#${domElement.id}` ).attr( "checked", fChecked );

            }
          }
        }
      }

    }  // end else

  } // end setFormField()


  /**
   * Get the nested object in the graph if a data-path attribute was specified
   * @param domElement The dom control element
   * @param objBase The base object
   * @returns {*}
   */
  function getObjectFromDataPath( domElement, objBase )
  {
    if ( !domElement )
    {
      return objBase;

    }

    let strDataPath = domElement.attributes["data-path"];

    if ( !strDataPath ) // No data-path, just return the base object
    {
      return objBase;
    }

    strDataPath = strDataPath.value;

    const aPaths = strDataPath.split( "." );

    let   objNested = objBase;

    for ( let x = 0; x < aPaths.length; x++ )
    {
      const objTemp = objNested[aPaths[x]];

      // Create the nested object instance if it doesn't exist
      if ( !objTemp )
      {
        objNested[aPaths[x]] = {};
      }
      else
      {
        objNested = objTemp;
      }

    }

    return objNested;

  }

  /**
   * Select all items in the comma separated data list
   *
   * @param strId   The id of the select control
   * @param strData The data set array to check against
   */
  function doSelectMultiple( strId, strData )
  {

    const astrItems = strData.split( "," );

    if ( astrItems.length == 0 )
    {
      return;
    }           // Sanity check

    $( "#" + strId + " option" ).each( function ()
                                       {
                                         const $this = $( this );
                                         $this.attr( "selected", false );  // Clear any previous selection

                                         checkSetOptionAttr( $this, astrItems )
                                       } );

  } // end setFormField()

  function doClearMultiple( strId )
  {


    $( "#" + strId + " option" ).each( function ()
                                       {
                                         const $this = $( this );
                                         $this.attr( "selected", false );  // Clear any previous selection
                                       } );

  } // end setFormField()

  /**
   * Check the options value attribute with the data array and turn on the selected attribute if there is a match
   *
   * @param htmlOption The html option tag
   * @param astrData The data set array to check against
   */
  function checkSetOptionAttr( htmlOption, astrData )
  {
    for ( let x = 0; x < astrData.length; x++ )
    {
      if ( htmlOption.val() == astrData[x] )
      {
        htmlOption.attr( "selected", true );
        return;
      }
    }

  }

  /**
   * Strips the control id prefix off which is everything up to the last '_' character
   * @param strCtlId  The control id
   * @return a string containing the stripped of prefix or the original string if no '_' char found
   */
  function stripPrefix( strCtlId )
  {
    let  nPos = strCtlId.lastIndexOf( "_" );
    if ( nPos < 0 )
    {
      return strCtlId;
    }

    return strCtlId.substring( ++nPos );


  }

  /**
   * Setup the password field event handlers
   *
   * @param strFormCtrlId the id of the password field
   */
  function setupPasswordEventHandlers( strFormCtrlId )
  {

    if ( !m_formProps.customValidateMgr )
    {
      return;
    }

    m_strPasswordCtl = strFormCtrlId;

    $( "#" + strFormCtrlId ).keyup( function ()
                                    {
                                      if ( m_formProps.customValidateMgr &&  m_formProps.customValidateMgr.checkPassword )
                                      {
                                        m_formProps.customValidateMgr.checkPassword();
                                      }
                                    } ).focus( function ()
                                               {
                                                 $( `#${m_strErrorDivId}` ).hide();

                                                 if ( m_formProps.customValidateMgr && m_formProps.customValidateMgr.onFocus)
                                                 {
                                                   m_formProps.customValidateMgr.onFocus( m_strPasswordCtl );
                                                 }
                                               } )
            .blur( function ()
                   {

                     if ( m_formProps.customValidateMgr && m_formProps.customValidateMgr.onBlur )
                     {
                       m_formProps.customValidateMgr.onBlur( strFormCtrlId );
                     }

                   } );
  }


  function setupFieldEventHandlers( dictionaryItem, strFormCtrlId )
  {
    const strCtrlType = $( "#" + strFormCtrlId ).attr( "type" );

    switch ( strCtrlType )
    {

      case "text":
      case "password":

        $( `#${strFormCtrlId}` ).keypress( ( event ) =>
                                           {

                                             clearFieldInError( dictionaryItem );

                                             return checkEnteredChar( strFormCtrlId, event );

                                           });

        $( `#${strFormCtrlId}` ).focus( () =>
        {

          if ( self.isFieldError( strFormCtrlId ))
          {
            clearFieldInError( dictionaryItem );

            if ( m_formProps.customValidateMgr && m_formProps.customValidateMgr.onFocus )
            {
              m_formProps.customValidateMgr.onFocus( strFormCtrlId )
            }
          }

        });

        break;

      case "cust":

        dictionaryItem.customControl().onSelectionChange( function ()
                                                        {
                                                          clearFieldInError( dictionaryItem );

                                                        } );

        break;
    }

  }

  /**
   * Removes any event handler associated with a dictionary item
   * @param strFormCtrlId
   */
  function removeFieldEventHandlers( strFormCtrlId )
  {

    $( "#" + strFormCtrlId ).unbind();

  }

  /**
   * Check key pressed with the edit mask (if defined )
   *
   * @param ctrl  The text control causing the keypress event
   * @param event  The keypress event
   * @return {Boolean}  true to accept the key or false to reject it
   */
  function checkEnteredChar( strFieldId, event )
  {

    const objDictionaryItem = m_mapFieldDictionary.get( strFieldId );

    if ( objDictionaryItem.formatMask() == null )
    {
      return true;
    }

    return true;
  }


  /**
   * Config user properties (if specified) and configObject the defaults
   * @param objProperties
   */
  function configProperties( objProperties )
  {
    m_formProps.cssErrorField = "VwErrorField";
    m_formProps.cssErrorArrowColor = "VwErrorArrowColor";
    m_formProps.errorHandling = "all";
    m_formProps.cssErrorOutlineField = "VwErrorOutlineField";
    m_formProps.cssErrorToolTip = "VwTooltipTop";

    $.extend( m_formProps, objProperties );

    if ( m_formProps.defaultButtonId )
    {
      m_strDefaultBtnId = m_formProps.defaultButtonId.trim();
    }
  }

} // end function VwFormMgr()




