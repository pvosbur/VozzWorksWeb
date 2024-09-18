
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
 * ============================================================================================
 *
 */

VwCssImport( "/vozzworks/ui/VwRadioButton/style");

/**
 *
 * @param strParentId The id of the button parent This is always the id the radio button group this button is in
 * @param objData The object that represents the button
 * @param btnProps values are
 *        idProp:Optional:String The property on the objData object that represents the id of the button. If omitted a property named id is assumed
 *        style:String:Optional defines a radio style "radio" or "toggle" the default is radio
 *        label:String:Optional The radio's label text
 *        labelPlacement:Optional Defines label placement to radio btn. Must be one of (b)fore or (a)fter. The default is 'a' after the radio btn
 *        img:String:Optional an img src url
 *        cssToggleBtnSelected:String:Optional css class for a toggle style button that is selected. The defaulr is VwToggleBtnSelected
 *        cssToggleBtn:String:Optional css class for a toggle style button that is not selected. The default is VwToggleBtn
 *        cssRadioBtnOuter:String:Optional css for the out circleof an unselected radio button. The default is VwRadioOuter
 *        cssRadioBtnInner:String:Optional css class for a radio circle div inner. The default is VwRadioInner
 *        cssLabelText:String:Optional css class for button text - The default is VwLabelText
 *
 * @constructor
 */
function VwRadioButton( strParentId, objData, btnProps )
{
  if ( arguments.length == 0 )
  {
    return; // sub class prototype call
  }

  const m_radioGroupEle = $(`#${strParentId}`);
  const m_aClickCallbackHandlers = [];
  const m_btnProps = configProps();
  

  let m_strBtnId;
  let m_strBtnLabel;
  let m_fEnabled = true;
  let m_fSelected = false;
 
  this.click = ( fnCallbackHandler ) =>     m_aClickCallbackHandlers.push( fnCallbackHandler );

  this.removeClickHandler = removeClickHandler;
  this.getId = getId;
  this.enable = handleEnable;
  this.isEnabled = handleIsEnabled;
  this.isSelected = isSelected;
  this.setSelected = setSelected;
  this.getData = getData;

  setupButton();

  /**
   * Setup button handler
   */
  function setupButton()
  {

    if ( objData.hasOwnProperty( m_btnProps.idProp ) )
    {
      m_strBtnId = objData[ m_btnProps.idProp ];
    }
    else
    if ( objData.id )
    {
      m_strBtnId = objData.id;
    }
    else
    {
      m_strBtnId = objData.toString();
    }

    if ( $(`#${m_strBtnId}`)[0] != null )
    {
      throw `Button Id: ${m_strBtnId} already exists`
    }

    if ( typeof objData == "string" )
    {
      m_strBtnLabel = objData.toString();
    }
    else
    if ( m_btnProps.displayProp )
    {
      if ( objData[m_btnProps.displayProp] )
      {
        m_strBtnLabel = objData[m_btnProps.displayProp];
      }
    }

    createRadioButton();

    $(`#${m_strBtnId}` ).addClass( btnProps.cssButton );

    $(`#${m_strBtnId}` ).click( function( event )
                          {
                            if ( !m_fEnabled )
                            {
                              return;
                            }

                            if( m_btnProps.style == "radio" && m_fSelected )
                            {
                              return;
                            }

                            m_fSelected = !m_fSelected;

                            setSelected( m_fSelected );

                          });

  }

  /**
   * Creates the radio button html for a standard style radio btn look
   */
  function createRadioButton()
  {
    const radioContainerEle = $(`<div id="${m_strBtnId}">` );

    if ( ! m_btnProps.cssRadioBtnContainer )
    {
      m_btnProps.cssRadioBtnContainer = "VwRadioContainer";
    }

    radioContainerEle.addClass( m_btnProps.cssRadioBtnContainer );

    const radioElem = $( `<div id="radioOuter_${m_strBtnId}">`).addClass( m_btnProps.cssRadioBtnOuter );
    const radioInnerEle = $( `<div id="radioInner_${m_strBtnId}">`).addClass( m_btnProps.cssRadioBtnInner );

    radioElem.append( radioInnerEle );

    let radioTextEle;
    
    if ( m_strBtnLabel )
    {
      radioTextEle = $( `<span id="label_${m_strBtnId}">` ).html( m_strBtnLabel ).addClass( m_btnProps.cssLabel );
     }

    if ( m_btnProps.labelPlacement == "a")
    {
      radioContainerEle.append( radioElem );
      radioContainerEle.append( radioTextEle );

    }
    else
    {
      radioContainerEle.append( radioTextEle );
      radioContainerEle.append( radioElem );
    }
    
    m_radioGroupEle.append( radioContainerEle );

  } // end createRadioButton()

  /**
   * gets the button data associated with the button
   * @returns {*}
   */
  function getData()
  {
    return objData;

  } // end getData()

  /**
   * Turns on/off the inner radio circle
   */
  function handleRadioSelChange()
  {
    if ( m_fSelected )
    {
      $(`#radioInner_${m_strBtnId}`).show();
    }
    else
    {
      $(`#radioInner_${m_strBtnId}` ).hide();

    }

  } // end handleRadioSelChange()


  /**
   * Returns this buttons id
   *
   * @returns {*}
   */
  function getId()
  {
    return m_strBtnId;

  } // end getId()

  /**
   * Returns the selected state of the button
   * @returns {boolean}
   */
  function isSelected()
  {
    return m_fSelected;

  } // end isSelected()

  /**
   * Sets the selected/unselected state of the button.
   * The css selected/unselected state will be managed
   *
   * @param fSelected true if selected, false otherwise
   */
  function setSelected( fSelected, fIgnoreClickCallback )
  {
    m_fSelected = fSelected;

    handleRadioSelChange();

    if ( fIgnoreClickCallback )
    {
      return;

    }

    m_aClickCallbackHandlers.forEach( function( fnClickCallback )
                                    {
                                      fnClickCallback( objData );

                                    });

  } // end setSelected()


  /**
   * Removes a click callback handler
   * @param fnCallbackHandler
   */
  function removeClickHandler( fnCallbackHandler )
  {
    for ( let  x = 0, nLen = m_aClickCallbackHandlers.length; x < nLen; x++ )
    {
      if ( m_aClickCallbackHandlers[ x ] == fnCallbackHandler )
      {
        m_aClickCallbackHandlers.splice( x, 1 );
        return;
      }
    }

  } // end removeClickHandler()


  /**
   * Sets the enabled/disabled state
   * @param fEnable
   */
  function handleEnable( fEnable )
  {
    m_fEnabled = fEnable;

    if ( !m_fEnabled )
    {
      $( `#${m_strBtnId}` ).css( "cursor", m_btnProps.disabledCursor );
      if ( m_btnProps.cssDisabled )
      {
        $( `#${m_strBtnId}` ).addClass( m_btnProps.cssDisabled );
      }
    }
    else
    {
      $( `#${m_strBtnId}` ).css( "cursor", "pointer" );
      if ( m_btnProps.cssDisabled )
      {
        $( `#${m_strBtnId}` ).removeClass( m_btnProps.cssDisabled );
      }

    }

  }

  /**
   * Returns the enabled/disabled state
   * @returns {boolean}
   */
  function handleIsEnabled()
  {
    return m_fEnabled;

  }
  
  function configProps()
  {
    const _props = {};
    
    _props.labelPlacement = "a";
    
    $.extend( _props, btnProps );

    return _props;
    
  } // end configProps()
} // end VwRadioButton{}

export default VwRadioButton;