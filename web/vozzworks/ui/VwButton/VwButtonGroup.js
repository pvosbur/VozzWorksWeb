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
import VwButton from "./VwButton.js";
import VwButtonDivider from "./VwButtonDivider.js";

/**
 *
 * @param strParentId
 * @param aButtonsDescriptors
 * @param btnGroupProps
 * @param btnProps
 * @constructor
 */
function VwButtonGroup( strParentId, aButtonsDescriptors, btnGroupProps, btnProps )
{
  if ( arguments.length == 0 )
  {
    return; // Prototype ca;;
  }

  const self = this;
  const m_mapButtonClickHandlers = new VwHashMap();

  let m_btnGroupProps;
  let m_strParentId = strParentId;
  let m_aButtons = [];
  let m_fnClickHandler;
  let m_btnActive;

  /**
   * @deprecated
   * @type {handleOnClick}
   */
  this.click = handleOnClick;
  this.onClick = handleOnClick;
  this.clearActiveBtn = clearActiveBtn;
  this.enableAll = enableAll;
  this.isEnabled = isEnabled;
  this.enable = enableButton;
  this.disable = disableButton;
  this.hide = hideButton;
  this.show = showButton;
  this.getButton = getButton;
  this.add = buildButton;
  this.addCustom = addCustom;
  this.getWidth = getWidth;
  this.getHeight = getHeight;
  this.getParentId = getParentId;
  this.resetButtons = resetButtons;
  this.setActiveButton = (btnActive) => m_btnActive = btnActive ;

  configObject();

  /**
   * Setup button handler
   */
  function configObject()
  {
    configButtonProps();

    if ( aButtonsDescriptors )
    {
      buildButtons();
    }

  }

  /**
   * Loop through all buttons and build each
   */
  function buildButtons()
  {

    $( `#${m_strParentId}` ).addClass( m_btnGroupProps.cssButtonContainer );

    for ( let btnDescriptor of aButtonsDescriptors )
    {
      buildButton( btnDescriptor );

    }

    if ( m_btnGroupProps.collapseBorders )
    {
      $( `#${m_strParentId}` ).css( "justify-content", "center" );
      collapseBorders();
    }

  } // end buildButtons()


  /**
   * Builds a VWButton from a btnDescriptor
   *
   * @param btnDescriptor The button property descriptor object which may be a string (just a buttin name), a VwButton instance, or a property object describing a button
   */
  function buildButton( btnDescriptor )
  {
    let fHide = false;
    let vwButton;

    if ( typeof btnDescriptor == "string" )
    {
      let strBtnId = btnDescriptor;

      if ( strBtnId == "VwDivider" )
      {
        doButtonDivider( btnDescriptor );
        return;
      }


      // see if the initial state is to hide the button
      const nPos = strBtnId.indexOf( ":hide" );

      if ( nPos > 0 )
      {
        fHide = true;
        strBtnId = strBtnId.substring( 0, nPos );
      }

      btnDescriptor = {};

      let strBtnText;
      let strId;

      let aIdPieces;
      if ( strBtnId.startsWith( "i18n_"))
      {
        aIdPieces = strBtnId.split( "i18n_");
      }
      else
      if ( strBtnId.startsWith( "#"))
      {
        aIdPieces = strBtnId.split( "#");
      }

      if ( aIdPieces )
      {
        if ( aIdPieces > 2 ) // assume a double '#' so no i18n
        {
          strId = strBtnId;
          strBtnText = strBtnId; // text and id are the same
        }
        else
        {
          strId = aIdPieces[1]
          strBtnText = strBtnId; // this is an i18n property lookup
        }
      }
      else
      {
        strId = strBtnId;
        strBtnText = strId; // text and id are the same
      }

      btnDescriptor.id = strId;
      btnDescriptor.text = strBtnText;

    } // end if

    if ( btnDescriptor.clickHandler )
    {
      m_mapButtonClickHandlers.put( btnDescriptor.id, btnDescriptor.clickHandler );
    }

    const buttonProps = $.extend( {}, btnProps );

    // Enable ENTER key handler for this button instance
    if ( m_btnGroupProps.defaultEnterKey && btnDescriptor.id == m_btnGroupProps.defaultEnterKey )
    {
      buttonProps.defaultEnterKey = true;
    }


    // button group can take a button descriptor or a VwButton instance
    if ( btnDescriptor instanceof VwButton )
    {
      vwButton = btnDescriptor;
    }
    else
    if ( btnDescriptor instanceof VwButtonDivider )
    {
      doButtonDivider( btnDescriptor );
    }
    else
    {
      vwButton = new VwButton( m_strParentId, btnDescriptor, buttonProps );
    }

    // if not a divider add to the button array
    if ( vwButton instanceof VwButton )
    {
      if ( m_btnGroupProps.manageToggleStates )
      {
        vwButton.onClick( handleBtnClick );  // go to our internal handleOnClick handler first
      }
      else
      if ( m_fnClickHandler )
      {
        vwButton.onClick( m_fnClickHandler );
      }

      m_aButtons.push( vwButton );

      if ( fHide )
      {
        vwButton.hide();
      }

      vwButton.setButtonGroup( self );
      return vwButton;

    }

  } // end buildButton()

  /**
   * Adds a custom button to the button group
   *
   * @param customRenderer The object rendering/managing the custom button. The renderer must implment
   * the following methods:
   *   getHtml() returns the html used to render the button
   *   handleOnClick() handles handleOnClick events
   *   setActiveState() Show button in an inactive state
   *   setActiveState show button in a active state
   *
   *
   */
  function addCustom( customRenderer )
  {
    m_aButtons.push( customRenderer );

    const strCustomHtml = customRenderer.render();

    $(`#${m_strParentId}`).append( strCustomHtml );

    if ( customRenderer.contentApplied )
    {
      customRenderer.contentApplied();
    }

    if ( m_btnGroupProps.manageToggleStates )
    {
      customRenderer.click( handleBtnClick );
    }
  }

  /**
   * Returns the width of this button group
   * @returns {*|jQuery}
   */
  function getWidth()
  {
    return $(`#${strParentId}` ).width();
  }

  /**
   * Returns the height of this button group
   * @returns {*|jQuery}
   */
  function getHeight()
  {
    return $(`#${strParentId}` ).height();
  }


  function getParentId()
  {
    return strParentId;
  }


  /**
   * This is the internal handleOnClick handler that manages button states active/inactive before passing
   * on the handleOnClick event to the handlet registered
   *
   * @param btnClicked The button that was clicked
   */
  function handleBtnClick( btnClicked )
  {

    if ( m_btnActive && ( m_btnActive.getId() != btnClicked.getId() ) )
    {
      if ( m_btnActive.isToggle() )
      {
        m_btnActive.setInactiveState();
        if ( m_fnClickHandler )
        {
          m_fnClickHandler.call( self, m_btnActive );
        }
      }
    }

    if ( m_fnClickHandler )
    {
      m_btnActive = btnClicked;
      m_fnClickHandler.call( self, btnClicked );
    }
    else
    if ( m_mapButtonClickHandlers.containsKey( btnClicked.getId() ) )
    {
      const clickHandler = m_mapButtonClickHandlers.get( btnClicked.getId() );
      clickHandler.call( btnClicked, btnClicked );
    }

  } // end handleBtnClick()


  /**
   * Finds the active button in this group may be null
   * @return {*|null}
   */
  function getActiveButton()
  {

  } // end getActiveButton()

  /**
   * clears the current active radio btn
   * @return {*}
   */
  function clearActiveBtn()
  {
    for ( const vwBtn of m_aButtons )
    {
      if ( vwBtn.isActive() )
      {
        vwBtn.setInactiveState()
      }

    }

  } // end clearActiveBtn()


  /**
   * Adds a button bar divider divider
   * @param button
   */
  function doButtonDivider( button )
  {
    const divDividerEle = $("<div>").addClass( button.css );

    $(`#${m_strParentId}`).append( divDividerEle );
  }


  /**
   * Handles collapsing button borders by adding a border-left to all buttons except first on left
   * Checks hidden buttons as well
   */
  function collapseBorders()
  {
    // Get outer border style
    var outerBorder = $( `#${m_aButtons[0].getId()}` ).css( "border" );

    // First clear any previous collapsed stying
    clearCollapsedBorders();

    for ( var x = 0, nLen = m_aButtons.length; x < nLen; x++ )
    {

      var strBtnId = "#" + m_aButtons[x].getId();

      if ( $( strBtnId ).css( "display" ) == "none" )
      {
        // Ignore and continue forEach iteration
        continue;
      }
      else
      {

        $( strBtnId ).css( "border-left", outerBorder );
        return;
      }

    }  // end for()

  } // end collapseBorders()

  /**
   * Handles clearing any previous collapse border styles
   */
  function clearCollapsedBorders()
  {

    m_aButtons.forEach( function ( button )
                        {

                          var strBtnId = "#" + button.getId();

                          $( strBtnId ).css( "border-left", "none" );

                        } );

  }

  /**
   * Handles hiding a button
   * @param strBtnId
   */
  function hideButton( strBtnId )
  {

    let vwButton = findButton( strBtnId );

    if (vwButton)
    {
      vwButton.hide( strBtnId );
    }


    if ( m_btnGroupProps.collapseBorders )
    {
      collapseBorders();
    }

  }

  /**
   * Handles showing a button
   * @param strBtnId          The button ID to hide
   * @param strDisplayValue   Optional. The show display value
   */
  function showButton( strBtnId, strDisplayValue )
  {

    let vwButton = findButton( strBtnId );

    if ( strDisplayValue && vwButton)
    {
      vwButton.show( strDisplayValue );
    }
    else if (vwButton)
    {
      vwButton.show( "table-cell" );
    }

    if ( m_btnGroupProps.collapseBorders )
    {
      collapseBorders();
    }

  }


  function getButton( strId )
  {
    return findButton( strId );

  }

  /**
   * Returns a VwButton instance by ID
   *
   * @param strBtnId
   * @returns {*}
   */
  function findButton( strBtnId )
  {

    for ( const button of m_aButtons )
    {
      if ( button.getId() == strBtnId )
      {
        return button;
      }
    }

  }

  /**
   * Enables/disables all button in this button group
   *
   * @param bEnable true to enable -- false to disable
   */
  function enableAll( bEnable )
  {
    for ( const buttonInGroup of m_aButtons )
    {
      const strBtnId = buttonInGroup.getId();
      
      if ( bEnable )
      {
        buttonInGroup.enable();
      }
      else
      {
        buttonInGroup.disable();
      }
    }
  } // end enableAll()


  /**
   * Enable a button
   */
  function enableButton( strBtnId )
  {

    const button = findButton( strBtnId );

    button.enable( strBtnId );

  }  // end enable()

  /**
   * reset all buttons in this group to in-active state
   */
  function resetButtons()
  {
    for ( const buttonInGroup of m_aButtons )
    {
      buttonInGroup.setInactiveState();
    }

  } // end resetButtons()


  /**
   * Disable a button
   */
  function disableButton( strBtnId )
  {
    const button = findButton( strBtnId );

    button.disable( strBtnId );

  }  // end disable()


  /**
   * Returns the enabled/disabled state
   * @returns {boolean}
   */
  function isEnabled( strBtnId )
  {

    var vwButton = findButton( strBtnId );

    return vwButton.isEnabled( strBtnId );

  }  // end isEnabled()

  /**
   * Sets the handleOnClick callback handler
   * @param fnClickHandler
   */
  function handleOnClick( fnClickHandler )
  {
    m_fnClickHandler = fnClickHandler;
  }  // end handleOnClick()

  /**
   * Create standard button props
   */
  function configButtonProps()
  {

    m_btnGroupProps = {};
    m_btnGroupProps.id = "vwButtonBar";
    m_btnGroupProps.cssButtons = "VwButtons";
    m_btnGroupProps.cssButtonContainer = "VwButtonGroup";
    m_btnGroupProps.collapseBorders = false;
    m_btnGroupProps.manageToggleStates = true;
    m_btnGroupProps.marginBottom = "2rem";

    $.extend( m_btnGroupProps, btnGroupProps );

  }

} // end VwButtonGroup{}

export default VwButtonGroup;

