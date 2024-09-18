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
 *
 */

import VwExString from "/vozzworks/util/VwExString/VwExString.js";

VwCssImport( "/vozzworks/ui/VwButton/style");

/**
 * This class creates and manages a button that can be a push or toggle style. The button can be enabled/disabled.
 * Disabled buttons have a grey filter applied to give visual aid to its disabled state.
 *
 * @param strParentId The parent id where the button will be installed
 * @param btnDescriptor A descriptor object that defines the attributes of the button. It has the following properties:
 *                      id: a unique id for this button - (required if idProp is not defined)
 *                      idProp: The name of a property on the descriptor that represents a unique id required if id prop is not defined
 *                      img: the url to the buttons img (optional)
 *                      text: the buttons text. If the text starts with a '#' symbol then its a property key in a resource bundle
 *                      and the resourceMgr property must contain a reference to a VwResourceMgr instance
 *                      template: an html template that will be installed at the strParentId element and will resolve its values from properties on this
 *                      descriptor. the img and text properties are ignored it this is set
 * @param btnProps
 * @constructor
 */
function VwButton( strParentId, btnDescriptor, btnProps )
{

  if ( arguments.length == 0 )
  {
    return; // sub class prototype call
  }
  
  const self = this;
  const m_strParentId = strParentId;

  let m_bEnabled = true;
  let m_btnProps;
  let m_fnClickHandler;
  let m_strBtnId;
  let m_strCanonicalId;
  let m_buttonEle;
  let m_buttonTextEle;
  let m_buttonImgEle;
  let m_buttonGroup;
  let m_strClickBusyMsg;
  let m_nClickBusyTime;
  let m_fnClickBusyComplete;
  let m_strDisabledImage;
  let m_strDisabledCss;
  let m_strActiveImage;
  let m_strInActiveImage;
  let m_strActiveCss;
  let m_strToggleImgUrl;

  // Public methods
  this.addTextClass = addTextClass;
  this.addButtonClass = addButtonClass;
  this.addImgClass = addImgClass;
  this.setButtonGroup = (buttonGroup ) => m_buttonGroup = buttonGroup;

  /**
   * @Deprecated  us onClick instead
   * @type {click}
   */
  this.click = (fnClickHandler) => m_fnClickHandler = fnClickHandler;
  this.onClick = (fnClickHandler) => m_fnClickHandler = fnClickHandler;
  this.clickBusyMsg = clickBusyMsg;
  this.disable = disableButton;
  this.enable = enableButton;
  this.enableHandleEnterKey = enableHandleEnterKey;
  this.getId = getId;
  this.getCanonicalId = () => m_strCanonicalId;
  this.getParentId = getParentId;
  this.getDataObject = getButtonObject;
  this.invokeClick = () => $(`#${m_strCanonicalId}`).click();
  this.hide = hideButton;
  this.isEnabled = isEnabled;
  this.setEnabled = setEnabled;
  this.isToggle = () => btnDescriptor.isToggle;
  this.setIsToggleBtn = () => btnDescriptor.isToggle = true;
  this.isRadio = () => btnDescriptor.isRadio;
  this.setIsRadioBtn = () => btnDescriptor.isRadio = true;
  this.setToolTp = ( strToolTip )=> $(m_buttonEle).attr( "tooltip", strToolTip );
  this.isActive = isActive;
  this.isSelected = isActive;
  this.hasClass = hasClass;
  this.removeTextClass = removeTextClass;
  this.removeButtonClass = removeButtonClass;
  this.removeImgClass = removeImgClass;
  this.removeHandleEnterKey = removeHandleEnterKeyEvent;
  this.setDisabledImage = setDisabledImage;
  this.setDisabledCss = setDisabledCss;
  this.setActiveImage = setActiveImage;
  this.setInActiveImage = setInActiveImage;
  this.setActiveCss = setActiveCss;
  this.setInactiveState = setButtonInactive;
  this.setActiveState = setButtonActive;
  this.setToggleImg = (strToggleImgUrl )=> m_strToggleImgUrl = strToggleImgUrl;
  this.setFocus = setFocus;
  this.show = showButton;
  this.toggle = toggle;
  this.updateHoverText = updateHoverText;
  this.updateImg = updateImg;
  this.updateText = updateText;
  this.getDescriptor = () => btnDescriptor;
  this.setDescriptor = ( descriptor ) =>  btnDescriptor = descriptor;

  configObject();

  /**
   * Constructor impl
   */
  function configObject()
  {
    configButtonProps();

    m_strBtnId = getButtonId();

    m_strCanonicalId = `${strParentId}_${m_strBtnId}`;

    if ( $(`#${m_strCanonicalId}`)[0] != null )
    {
      throw `Button id: ${m_strCanonicalId} already exists`;
    }

    buildButton();

  } // end configObject()


  function getButtonObject()
  {
    return btnDescriptor;

  }

  function getId()
  {
    return m_strBtnId;

  }

  function getParentId()
  {
    return strParentId;
  }


  function addTextClass( strClassName )
  {
    m_buttonTextEle.addClass( strClassName );

  }

  function removeTextClass( strClassName )
  {
    m_buttonTextEle.removeClass( strClassName );

  }

  function addButtonClass( strClassName )
  {
    m_buttonEle.addClass( strClassName );

  }

  function removeButtonClass( strClassName )
  {
    m_buttonEle.removeClass( strClassName );

  }

  function addImgClass( strClassName )
  {
    m_buttonImgEle.addClass( strClassName );

  }

  function removeImgClass( strClassName )
  {
    m_buttonImgEle.removeClass( strClassName );

  }

  function setDisabledImage( strDisabledImage )
  {
    m_strDisabledImage = strDisabledImage;
  }

  function setDisabledCss( strDisabledCss )
  {
    m_strDisabledCss = strDisabledCss;
  }

  function setActiveImage( strActiveImage )
  {
    m_strActiveImage = strActiveImage;

  }

  function setInActiveImage( strActiveImage )
  {
    m_strInActiveImage = strActiveImage;

  }

  function setActiveCss( strActiveCss )
  {
    m_strActiveCss = strActiveCss;
  }

  function setFocus()
  {
    $( `#${m_strBtnId}` ).focus();
    setButtonActive();

  }

  /**
   * Builds a text button
   */
  function buildButton()
  {
    if ( btnDescriptor.template )
    {
      const strResolvedTemplate = VwExString.expandMacros( btnDescriptor.template, btnDescriptor );

      $(`#${strParentId}`).append( strResolvedTemplate );

      m_buttonEle = $(`#${m_strBtnId}`);

      if ( m_btnProps.imgIdPrefix )
      {
        m_buttonImgEle = $(`#${m_btnProps.imgIdPrefix}${m_strBtnId}`);
      }

      setupActions();
      return;
    }


    switch ( m_btnProps.type )
    {

      case "button":

        m_buttonEle = $( "<button>" ).attr( "id", m_strCanonicalId ).attr( "type", m_btnProps.type ).addClass( m_btnProps.cssButton ).addClass( btnDescriptor.cssButton );
        break;

      case "submit":

        m_buttonEle = $( "<input>" ).attr( "id", m_strCanonicalId ).attr( "type", m_btnProps.type ).addClass( m_btnProps.cssButton ).addClass( btnDescriptor.cssButton );
        break;

      default:

        if ( btnDescriptor.noTab )
        {
          m_buttonEle = $( "<div>" ).attr( "id", m_strCanonicalId ).addClass( m_btnProps.cssButton ).addClass( btnDescriptor.cssButton );
        }
        else
        {
          m_buttonEle = $( "<div>" ).attr( "id", m_strCanonicalId ).attr( "tabindex", "0" ).addClass( m_btnProps.cssButton ).addClass( btnDescriptor.cssButton );
        }

        break;

    }

    if ( btnDescriptor.html )   // custom html
    {
      m_buttonEle.append( btnDescriptor.html );
    }

    if ( btnDescriptor.text )
    {
      let strText = btnDescriptor.text;
      // check for i18n look up which allows for i18n_ or # prefixes
      if ( strText.indexOf( "i18n" ) >= 0 || strText.startsWith( "#") )
      {
        if ( !m_btnProps.resourceMgr )
        {
          throw "i18n prefix was specified but the resourceMgr property on the button properties was not.";
        }

        if ( strText.indexOf( "i18n" ) >= 0 )
        {
          strText = m_btnProps.resourceMgr.getString( strText.substring( "i18n_".length ) );
        }
        else
        {
          strText = m_btnProps.resourceMgr.getString( strText.substring( 1 ) );
        }
      }

      m_buttonTextEle = $( "<span>" ).text( strText ).addClass( m_btnProps.cssButtonText ).addClass( btnDescriptor.cssButtonText );
    }

    if ( btnDescriptor.hoverText )
    {
      let strText = btnDescriptor.hoverText;
      if ( strText.indexOf( "i18n" ) >= 0 )
      {
        if ( !m_btnProps.resourceMgr )
        {
          throw "i18n prefix was specified but the resourceMgr property on the button properties was not.";
        }

        strText = m_btnProps.resourceMgr.getString( strText.substring( "i18n_".length ) );
      }

    }

    if ( btnDescriptor.img )
    {
      let strImgSrc;
      //this property can also be an array of 2 which the 2cd img will be applied on a hover and a selection
      if ( Array.isArray( btnDescriptor.img) )
      {
        strImgSrc = btnDescriptor.img[ 0 ];
        if ( btnDescriptor.img.length == 3 )
        {
          m_strDisabledImage = btnDescriptor.img[ 2 ] ;
        }

      }
      else
      {
        strImgSrc =  btnDescriptor.img;
      }

      m_buttonImgEle = $( "<img>" ).attr( "id", `img_${m_strCanonicalId}` ).attr( "src", strImgSrc ).addClass( m_btnProps.cssButtonImg );

    }

    if ( m_buttonTextEle && m_buttonImgEle )
    {
      doButtonTextPlacement();
    }
    else
    {
      if ( m_buttonTextEle )
      {
        m_buttonEle.append( m_buttonTextEle );
      }
      else
      {
        if ( m_buttonImgEle )
        {
          m_buttonEle.append( m_buttonImgEle )
        }
      }

    } // end else

    $( `#${m_strParentId}` ).append( m_buttonEle );

    // add tootip or title if specified
    if ( btnDescriptor.tooltip )
    {
      $(m_buttonEle).attr( "tooltip", btnDescriptor.tooltip );
    }
    else
    if ( btnDescriptor.title )
    {
      $(m_buttonEle).attr( "title", btnDescriptor.title );

    }

    setupActions();

    if ( btnDescriptor.disabled )
    {
      disableButton();

    }
  }

  /**
   * Configures the button text/img placement
   */
  function doButtonTextPlacement()
  {
    switch ( m_btnProps.textPlacement )
    {
      case "r":

        m_buttonEle.append( m_buttonImgEle).append( m_buttonTextEle );
        break;

      case "l":

        m_buttonEle.append( m_buttonTextEle ).append( m_buttonImgEle);
        break;

      default:

        m_buttonEle.append( m_buttonImgEle).append( m_buttonTextEle );
        break;

    } // end switch()

  } // end doButtonTextPlacement()

  /**
   * Returns button id based on descriptor properties defined
   * @return {*}
   */
  function getButtonId()
  {
    if ( m_btnProps.idProp )
    {
      return btnDescriptor[m_btnProps.idProp];
    }
    else
    {
      return btnDescriptor.id;
    }
  }

  /**
   * Setup action handlers
   */
  function setupActions()
  {

    $( m_buttonEle ).unbind().hover( hoverIn, hoverOut );

    if ( btnDescriptor.clickOnParent )
    {
      $(`${strParentId}`).unbind().click( handleButtonClicked );
    }

    $( m_buttonEle ).click( handleButtonClicked );

    if ( m_btnProps.defaultEnterKey )
    {
      // Install global keypress event to trap the enter key for default button support
      enableHandleEnterKey();
    }

  } // end setupActions()

  /**
   * Handle hover in
   */
  function hoverIn()
  {
    // dont change hover state if a cssSelected is on or btn is disabled
    if ( !m_bEnabled || (m_btnProps.cssSelected && $(m_buttonImgEle).hasClass( m_btnProps.cssSelected ) ))
    {
      return;
    }

    if ( m_bEnabled && m_btnProps.cssHoverTextColor )
    {
      $( m_buttonTextEle ).css( "color", m_btnProps.cssHoverTextColor );
    }


    if ( m_buttonImgEle &&  Array.isArray( btnDescriptor.img ) )
    {
      $( m_buttonImgEle ).attr( "src", btnDescriptor.img[ 1 ] )
    }

  } // end hoverIn()

  /**
   * Handle hover out
   */
  function hoverOut()
  {
    if ( !m_bEnabled )
    {
      return;
    }

    if (  self.isSelected() )
    {
      if ( btnDescriptor.isToggle || btnDescriptor.isRadio )
      {
        return;
      }
    }

    if ( m_bEnabled && m_btnProps.cssHoverTextColor )
    {
      $( m_buttonTextEle ).css( "color", "" );
    }

    if ( m_buttonImgEle && Array.isArray( btnDescriptor.img ) )
    {
      $( m_buttonImgEle ).attr( "src", btnDescriptor.img[ 0 ] )
    }

  } // end hoverOut()

  /**
   * Handle enter key press event
   * @param event
   */
  function handleEnterKey( event )
  {
    if ( event.keyCode == 13 )
    {
      handleButtonClicked( event );
    }
  }


  /**
   * Removes the ENTER key press event
   */
  function removeHandleEnterKeyEvent()
  {
    document.removeEventListener( "keydown", handleEnterKey, true );
  }


  /**
   * Enables the ENTER key press event
   */
  function enableHandleEnterKey()
  {
    document.addEventListener( "keydown", handleEnterKey, true );
  }

  /**
   * Handles the button click event and forwards to callback if button is enabled
   * @param event
   * @returns {boolean}
   */
  function handleButtonClicked( event )
  {
    event.stopPropagation();
    // Only call click handler if button is in enabled state
    if ( ! m_bEnabled )
    {
      return;
    }

    if ( m_btnProps.toolTipMgr && m_btnProps.hideTipsOnClick )
    {
      m_btnProps.toolTipMgr.hide();
    }

    if ( m_btnProps.ignoreActiveState  && $( m_buttonEle ).hasClass( "VwActiveButton" ) )
    {
      return;
    }

    if ( btnDescriptor.isToggle)
    {
      if ( self.isActive() )
      {
        setButtonInactive();
      }
      else
      {
        setButtonActive();
      }
    }
    else
    if ( btnDescriptor.isRadio )
    {
      if ( m_buttonGroup )
      {
        // clear current active btn
        m_buttonGroup.clearActiveBtn();
      }

      setButtonActive();

    }

    if ( m_strClickBusyMsg )
    {
      installClickBusyMsg();
    }

    if ( m_fnClickHandler )
    {
      m_fnClickHandler( self );
    }


    if ( !m_btnProps.propagateButtonClick )
    {
      return false;
    }

  } // end handleButtonClicked()


  /**
   * Puts the button in its active state
   */
  function setButtonActive()
  {
    if ( m_strActiveCss )
    {
      m_buttonEle.removeClass( m_btnProps.cssButton );
      m_buttonEle.addClass( m_strActiveCss );
    }

    if (btnDescriptor.imgActive )
    {
      $( m_buttonImgEle ).attr( "src", btnDescriptor.imgActive );
    }
    else
    if ( Array.isArray( btnDescriptor.img ) )
    {
      $( m_buttonImgEle ).attr( "src", btnDescriptor.img[ 1 ] )
    }

    m_buttonEle.addClass( "VwActiveButton" );

    if ( btnDescriptor.isToggle || btnDescriptor.isRadio )
    {
      $(m_buttonEle).addClass( m_btnProps.cssSelected );
    }

  } // end setButtonActive()

  /**
   * Puts the button in its inactive state
   */
  function setButtonInactive()
  {
    if ( !m_bEnabled )
    {
      return;
    }

    if ( m_strActiveCss )
    {
      m_buttonEle.removeClass( m_strActiveCss );
      m_buttonEle.addClass( m_btnProps.cssButton );
    }

    if ( btnDescriptor.imgInactive )
    {
      $( m_buttonImgEle ).attr( "src", btnDescriptor.imgInactive )
    }
    else
    if ( Array.isArray( btnDescriptor.img ) )
    {
      $( m_buttonImgEle ).attr( "src", btnDescriptor.img[ 0 ] )
    }

    m_buttonEle.removeClass( "VwActiveButton" );
    if ( btnDescriptor.isToggle || btnDescriptor.isRadio )
    {
      $(m_buttonEle).removeClass( m_btnProps.cssSelected );
    }

  } // end setButtonInactive()


  /**
   * Returns true if the button is  active, false otherwise
   * @returns {*|boolean}
   */
  function isActive()
  {
    return m_buttonEle.hasClass( "VwActiveButton" );
  }


  /**
   * Caliing this method will change the button text to the strMsg parameter for time in seconds specified
   *
   * @param strMsg The busy message to display, may be an i18n property key if a VwPropertyMgr is set
   * @param nShowTimeInSecs The time in seconds to display the message
   * @param fnComplete Callback when busy msg time ends
   */
  function clickBusyMsg( strMsg, nShowTimeInSecs, fnComplete )
  {
    m_strClickBusyMsg = strMsg;
    m_nClickBusyTime = nShowTimeInSecs * 1000; // convert to millisecs
    m_fnClickBusyComplete = fnComplete;

    if ( VwExString.startsWith( strMsg, "i18n" ) )
    {
      if ( !m_btnProps.resourceMgr )
      {
        throw "i18n prefix was specified but the resourceMgr property on the button properties was not.";
      }

      m_strClickBusyMsg = m_btnProps.resourceMgr.getString( strMsg.substring( "i18n_".length ) );

    }
  }

  function installClickBusyMsg()
  {
    var strCurText = m_buttonTextEle.text();

    m_buttonTextEle.text( m_strClickBusyMsg );

    setTimeout( function ()
                {
                  m_buttonTextEle.text( strCurText );

                  if ( m_fnClickBusyComplete )
                  {
                    m_fnClickBusyComplete();

                  }
                }, m_nClickBusyTime );
  }

  /**
   * Updates the buttons image
   * @param imgUrl
   */
  function updateImg( imgUrl )
  {
    if ( !m_buttonImgEle )
    {
      throw "Attempting to update an image url on a non image defined button, id: " + btnDescriptor.id;
    }

    m_buttonImgEle.attr( "src", imgUrl );

  }

  /**
   * Updates the buttons image
   * @param strBtnText
   */
  function updateText( strBtnText )
  {
    if ( !m_buttonTextEle )
    {
      throw "Attempting to update text on a non text defined button, id: " + btnDescriptor.id;
    }

    m_buttonTextEle.text( strBtnText );

  }

  /**
   * Updates the buttons image
   * @param strBtnText
   */
  function updateHoverText( strBtnText )
  {
    m_buttonEle.attr( "title", strBtnText );
  }

  /**
   * Handles hiding a button
   */
  function hideButton()
  {
    $( m_buttonEle ).hide();
  }

  /**
   * Handles showing a button
   * @param strDisplayValue   Optional. The show display value
   */
  function showButton()
  {
    $( m_buttonEle ).css( "display", "flex" );
  }

  /**
   * Enable a button
   */
  function enableButton()
  {
    m_bEnabled = true;

    if ( m_buttonImgEle )
    {
      $( m_buttonImgEle ).css( "cursor", "pointer" );

      if ( m_strDisabledImage )
      {
        if ( Array.isArray( btnDescriptor.img ))
        {
          $( m_buttonImgEle ).attr( "src", btnDescriptor.img[1] );
        }
        else
        {
          $( m_buttonImgEle ).attr( "src", btnDescriptor.img );
        }
      }
      else
      {
        m_buttonImgEle.removeClass( m_btnProps.cssDisabled );
      }
    }

    if ( m_buttonTextEle )
    {
      m_buttonTextEle.removeClass( m_btnProps.cssDisabled );
    }

    if ( m_strDisabledCss )
    {
      m_buttonEle.removeClass( m_strDisabledCss );
      m_buttonEle.addClass( m_btnProps.cssButton );

    }

    setupActions();

  }  // end enable()


  /**
   * Disable a button
   */
  function disableButton()
  {
    m_bEnabled = false;

    if ( m_buttonTextEle )
    {
      m_buttonTextEle.addClass( m_btnProps.cssDisabled );

    }

    if ( m_buttonImgEle )
    {
      $(m_buttonImgEle).css("cursor", "not-allowed" );

      if ( m_strDisabledImage )
      {
        $( m_buttonImgEle ).attr( "src", m_strDisabledImage );
      }
      else
      {
        m_buttonImgEle.addClass( m_btnProps.cssDisabled );
      }
    }

    if ( m_strDisabledCss )
    {
      m_buttonEle.removeClass( m_btnProps.cssButton );
      m_buttonEle.addClass( m_strDisabledCss );

    }

    setupActions();

  }  // end disable()

  /**
   * Toggles the image source if the button's img property is an array.
   */
  function toggle()
  {
    let strBtnImgSrc = $(m_buttonImgEle).attr( "src");

    if (!Array.isArray( btnDescriptor.img ) )
    {
      return; // Do nothing as only one img srource was defined
    }

    // Array is only expected to be an array of 2
    if ( strBtnImgSrc == btnDescriptor.img[ 0 ] )
    {
      strBtnImgSrc = btnDescriptor.img[ 1 ]
    }
    else
    {
      strBtnImgSrc = btnDescriptor.img[ 0 ]

    }

    // Update the button's img source
    $(m_buttonImgEle).attr( "src", strBtnImgSrc );
  }



  /**
   * Returns the enabled/disabled state
   * @returns {boolean}
   */
  function isEnabled()
  {
    return m_bEnabled;
  }

  /**
   * Enable/disable button
   *
   * @param fEnabled true to enable, false to disable
   */
  function setEnabled( fEnabled )
  {
    if ( fEnabled )
    {
      enableButton();
    }
    else
    {
      disableButton();
    }
  } // end setEnabled()


  /**
   * Returns true if the button element has the class identified by strClassName
   *
   * @param strClassName The CSS class name to test for
   * @returns {*|boolean}
   */
  function hasClass( strClassName )
  {
    return m_buttonEle.hasClass( strClassName );
  }

  /**
   * Create standard button props
   */
  function configButtonProps()
  {

    m_btnProps = {};
    m_btnProps.disabledTextColor = "#999999";
    m_btnProps.disabledCursor = "not-allowed";
    m_btnProps.cssButton = "VwButton";
    m_btnProps.cssButtonText = "VwButtonText";
    m_btnProps.cssButtonImg = "VwButtonImg";
    m_btnProps.cssDisabled = "VwGreyScaleImg";
    m_btnProps.cssSelected = "";

    m_btnProps.textPlacement = "r";

    $.extend( m_btnProps, btnProps );

  }
} // end VwButton{}

export default VwButton;