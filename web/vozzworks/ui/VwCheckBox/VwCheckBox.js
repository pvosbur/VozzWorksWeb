/*
 *
 * ============================================================================================
 *
 *                                     V o z z W o r k s JS
 *
 *                                     Copyright(c) 2014 By
 *
 *                                      Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 *  ============================================================================================
 * /
 */

import VwExString from "../../util/VwExString/VwExString.js";

VwCssImport( "/vozzworks/ui/VwCheckBox/style");

/**
 *
 * @param strParentId The html element id where the check box is created
 * @param fChecked The initial check state of the checkbox. If omitted initial state is false (un checked)
 * @param objCheckBoxProps The check box properties. The following are supported:
 * @Param objCheckBoxOwner The data object owning the checkbox. i.e. this object will be updated on its checked state property
 *
 * <br>cssCheckBox: The css class to use for the checkbox, if omitted the VwCheckBox is used
 * <br>checkImgUrl: The url to the image displayed in the checked state. If omitted, the "/images/icons/x_mark_black.png" is applied
 * <br>cssCheckBoxImg: the class to use for the check image. If omitted, the VwCheckBoxImg class is used
 * <br>label: The text label to be used with the check box. If the label is clicked on, it toggles the checkbox state
 * <br>placement: The label placement position to the check box. "r" label to the right, "l" label to the left. Default is "r"
 * <br>cssLabel: The css class to use for the label. If omitted, no class wil be used
 * <br>resourceMgr: an Instance of the VwProperty mgr for localization. Labels that start with "i18n_" are assumed to be property keys
 * <br>checkboxClick: Callback handler whenever a checkbox is clicked.
 * @constructor
 */
function VwCheckBox( strParentId, fChecked, objCheckBoxProps, objCheckBoxOwner )
{

  if ( arguments.length == 0 )
  {
    return;   // Subclass call
  }

  const self = this;

  let m_fChecked = fChecked;
  let m_fEnabled = true;
  let m_resourceMgr = null;
  let m_checkBoxContainerHtml;
  let m_spanEleLabelHtml;

  if ( typeof fChecked == "undefined" )
  {
    m_fChecked = false;
  }

  let m_fnOnSelectionChange;
  let m_fnClickHandler = null;
  let m_fnOrigjQueryProp = $.fn.prop;
  let m_objCheckBoxProps = null;
  let m_strCheckImgId;

  configProps( objCheckBoxProps );

  setupCheckBox();

  // Public methods
  this.onSelectionChange = ( fnOnSelectionChange ) => m_fnOnSelectionChange = fnOnSelectionChange;

  // These two are wrappers for VwForm
  this.isSelectedItem = isChecked;
  this.getSelectedValue = isChecked;
  this.getSelectedId = isChecked;
  this.getId = getId;
  this.getOwner = getOwner;
  this.toggle = toggle;
  this.isChecked = isChecked;
  this.isSelected = isChecked;
  this.setChecked = setChecked;
  this.setEnabled = setEnabled;
  this.isEnabled = isEnabled;
  this.setSelectedItemByValue = setSelectedItemByValue;
  this.clear = clear;
  this.installClickHandler = installClickHandler;

  this.onClick = (fnClickHandler) => installClickHandler( fnClickHandler );

  /**
   * This provides the same api as is for html checkbox input control
   * @param strProp
   * @param fState
   * @returns {*}
   */
  $.fn.prop = function( strProp, fState )
  {

    if ( !this[0]  ||  !(this[0].id ) )
    {
      return m_fnOrigjQueryProp.apply( this, arguments );   // Pass this on to Jquiery's orgin function

    }

    if ( (this[0].id == strParentId && strProp == "checked" ))  // Make sure this is for us as we are override jQuery's prop method
    {
      if ( arguments.length == 1 )  // one argument is a query for the checked state
      {
        return m_fChecked;
      }

      m_fChecked = fState;
      showState();

      if ( m_fnClickHandler )  // Call event handler if defined
      {
        m_fnClickHandler.call( self, m_fChecked );
      }
    }
    else
    {
      return m_fnOrigjQueryProp.apply( this, arguments );   // Pass this on to Jquery's orginal function
    }

  };


  function setupCheckBox()
  {
    m_strCheckImgId = `${strParentId}_chk`;

    const imgHtml =
     `<img id="${m_strCheckImgId}" src="${m_objCheckBoxProps.checkImgUrl}" class="${m_objCheckBoxProps.cssCheckBoxImg}"/>`;

    if ( m_objCheckBoxProps.label )
    {
      setupWithLabel( imgHtml );
    }
    else
    {
      $(`#${strParentId}` ).append( imgHtml ).addClass( `${m_objCheckBoxProps.cssCheckBox} ${m_objCheckBoxProps.cssUserCheckBox}` );
    }

    setupActions();

    showState();

  } // end setupCheckBox()

  /**
   * Install click handler
   */
  function installClickHandler( fnClickHandler )
  {
    m_fnClickHandler = fnClickHandler;
  }

  /**
   * Setup checkbox with a text label
   *
   */
  function setupWithLabel( imgHtml )
  {
    const strContainerId = `${strParentId}_box`;

    m_checkBoxContainerHtml
    `<div id="${strContainerId}" class="${m_objCheckBoxProps.cssCheckBox} ${m_objCheckBoxProps.cssUserCheckBox}"></div>`;

    $(`#${strParentId}` ).append( m_checkBoxContainerHtml );

    if ( imgHtml )
    {
      const checkBoxImgContainerHtml =
       `<div id="${strParentId}_imgContainer" class="${m_objCheckBoxProps.cssCheckBoxImgContainer}" ></div>`;

      $(`#${strContainerId}`).append( checkBoxImgContainerHtml );
      $(`#${strParentId}_imgContainer}`).append( imgHtml );

    }

    const strLabel = VwExString.getValue( m_resourceMgr, m_objCheckBoxProps.label );

    if ( m_objCheckBoxProps.labelParentId )
    {
      $( `#${m_objCheckBoxProps.labelParentId}` ).text( strLabel );
    }
    else
    {
      // Create span tag if a label was specified
      m_spanEleLabelHtml =
       `<span id="${strParentId}_txt" class="${m_objCheckBoxProps.cssLabel}"></span>`;

      $(`#${strContainerId}`).append( m_spanEleLabelHtml );
      $(`#${strParentId}_txt`).html( strLabel );

    }

  } // end setupWithLabel()


  /**
   * Setup checkbox actions
   */
  function setupActions()
  {
    if ( !m_objCheckBoxProps.label )
    {
      $( `#${strParentId}` ).click( ( event ) => handleClickEvent( event ) );
    }
    else
    {
      // click handlers need to go on span label and checkbox div

      $(`#${strParentId}_box` ).click(  event => handleClickEvent( event ) );

      if ( m_spanEleLabelHtml )
      {
        $( `#${strParentId}_txt` ).click( ( event ) => handleClickEvent( event ) );
      }

      if ( m_objCheckBoxProps.labelParentId )
      {
        $( `#${m_objCheckBoxProps.labelParentId}` ).click( ( event ) => handleClickEvent( event ) );
      }
    } // end else


  } // end setupActions()

  /**
   * Toggles the check box
   */
  function toggle()
  {
    m_fChecked = !m_fChecked;
    showState();

  } // end toggle()

  /**
   * Returns the checked state
   * @returns {*}
   */
  function isChecked()
  {
    return m_fChecked;
  }

  /**
   * Gets the id of this checkbox
   * @returns {*}
   */
  function getId()
  {
    return  strParentId;
  }


  /**
   * Gets the object owning this checkbox, may be null
   * @returns {*}
   */
  function getOwner()
  {
    return objCheckBoxOwner;
  }


  /**
   * Checks/Unchecked the checkbox and call the click event handler unless fSuppressEventHandler is true
   *
   * @param fChecked If true set checkbox state yo checked else set it to unchecked
   * @param fSuppressEventHandler if true don't call event handler
   */
  function setChecked( fChecked, fSuppressEventHandler  )
  {
      m_fChecked = !fChecked;
      handleClickEvent( null, fSuppressEventHandler );
  }

  /**
   * Compatibility mode with VwFormMgr
   * @param value
   */
  function setSelectedItemByValue( value )
  {
    setChecked( value );

  }

  /**
   * Sets enabled/disabled state of the checkbox
   *
   * @param fEnabled true to enable, false to disable
   */
  function setEnabled( fEnabled )
  {
    m_fEnabled = fEnabled;

    const strGrayScale = "VwGreyScaleImg";

    if ( m_fEnabled )
    {
      if ( m_checkBoxContainerHtml )
      {
        m_checkBoxContainerHtml.removeClass( strGrayScale );
      }
      else
      {
        $(`#${strParentId}` ).removeClass( strGrayScale );
      }

      if ( m_spanEleLabelHtml )
      {
        m_spanEleLabelHtml.removeClass( strGrayScale );
      }
    }
    else
    {
      if ( m_checkBoxContainerHtml )
      {
         m_checkBoxContainerHtml.addClass( strGrayScale );
      }
      else
      {
        $(`#${strParentId}` ).addClass( strGrayScale );
      }

      if ( m_spanEleLabelHtml )
      {
        m_spanEleLabelHtml.addClass( strGrayScale );
      }

    }

  } // end setEnabled()

  /**
   * Returns true if checkbox is enabled, false if disabled
   * @returns {boolean}
   */
  function isEnabled()
  {
    return m_fEnabled;
  }

  /**
   * unchecks the check box
   */
  function clear()
  {
    setChecked( false, false );

  }

  /**
   * Process a checkbox / label click event
   */
  function handleClickEvent( event, fSuppressEventHandler  )
  {
    if ( !m_fEnabled )
    {
      return;           // disabled just get out
    }

    if ( event )
    {
      event.stopImmediatePropagation();
      event.preventDefault();

    }

    m_fChecked = !m_fChecked;

    if ( m_objCheckBoxProps.idCheckProp && objCheckBoxOwner )
    {
      objCheckBoxOwner[ m_objCheckBoxProps.idCheckProp ] = m_fChecked;
    }

    showState();

    if ( fSuppressEventHandler )
    {
      return false;
    }

    if ( m_fnOnSelectionChange )
    {
      m_fnOnSelectionChange.call( self, m_fChecked );
    }

    return false;

  } // end handleClickEvent()

  /**
   * Show the state of the checkbox. Displays/hides check image
   */
  function showState()
  {
    const strCheckId = `#${strParentId}_chk`;

    if ( m_fChecked )
    {
      $( strCheckId ).show();

    }
    else
    {
      $( strCheckId ).hide();
    }

  }

  function configProps( objCheckBoxProps )
  {
    m_objCheckBoxProps = {};

    m_objCheckBoxProps.cssLabel= "VwCheckBoxLabel";
    m_objCheckBoxProps.checkImgUrl = "/vozzworks/ui/images/vw_x_bold_black.png";
    m_objCheckBoxProps.cssCheckBox = "VwCheckBox";
    m_objCheckBoxProps.cssCheckBoxImg = "VwCheckBoxImg";
    m_objCheckBoxProps.cssCheckBoxImgContainer = "VwCheckBoxImgContainer";

    $.extend( m_objCheckBoxProps, objCheckBoxProps );

    m_resourceMgr = m_objCheckBoxProps.resourceMgr;

  }
} // end VwCheckBox{}

$.fn.VwCheckBox = function( fState, objCheckBoxProps, objCheckBoxOwner )
{
  return new VwCheckBox( this[0].id, fState, objCheckBoxProps, objCheckBoxOwner );
};

export default VwCheckBox;
