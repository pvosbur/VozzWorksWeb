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

import VwRadioButton from "/vozzworks/ui/VwRadioButton/VwRadioButton.js";

VwCssImport( "/vozzworks/ui/VwRadioButton/style");

/**
 * This manages a group of VwRadioButtons.  It maintains the active radio button in the group
 * When a button in this group ic clicked it stes the active radio button to inactive
 *
 * @param strParent:String:Optional The id if the parent element where the button group html is created or null if no html should be created
 * @param strGroupId:String:Optional A unique id that is used on a form object property to hold the value of the selected button
 * @param groupProps:Object:optional Additional properties for radio button management. Values are:
 *        vertAlign:Boolean:Optional if true radion buttons will be vertically aligned within the group. The default is horizontal
 *        <br/>The default gap is 4px
 *        defaultButtonId:String:Optional The id of the default button that will be set as selected when the button group is created or cleared by a VwForm
 *
 * @param btnProps:Object:Required Values are:
 *        idProp:String:Optional The property on the object that represents a unique id for the radio button
 *        displayProp:String:Optional The property on the object that should be used for the display text
 *        cssToggleBtnSelected:String:Optional css class for a toggle style button that is selected. The defaulr is VwToggleBtnSelected
 *        cssToggleBtn:String:Optional css class for a toggle style button that is not selected. The default is VwToggleBtn
 *        cssRadioBtnOuter:String:Optional css for the out circle of an unselected radio button. The default is VwRadioOuter
 *        cssRadioBtnInner:String:Optional css class for a radio circle div inner. The default is VwRadioInner
 *        cssBtnText:String:Optional css class for button text - The default is VwLabelText
 *
 * @constructor
 */
function VwRadioButtonGroup( strParent, strGroupId, groupProps, btnProps )
{
  if ( arguments.length == 0 )
  {
    return;  // child class prototype call
  }

  const m_aButtons = [];
  const m_groupProps = {};
  const m_btnProps = {};

  let m_strGroupId;
  let m_strBorderColor;
  let m_activeButton;
  let m_fnClickHandler;
  let m_radioBtnGroupEle;

  // Public methods
  this.addButton = addButton;
  this.clear = clear;
  this.onClick = ( fnClickHandler ) => m_fnClickHandler = fnClickHandler;
  this.disableAll = disableAll;
  this.enableAll = enableAll;
  this.getId = () => m_strGroupId;
  this.getSelectedButton = getSelectedButton;
  this.getSelectedValue = getSelectedValue;
  this.getSelectedId = getSelectedId;
  this.isSelectedItem = isSelectedItem;

  this.list = list;

  this.removeButton = removeButton;

  this.setSelected = setSelected;
  this.setSelectedItemByValue = setSelectedItemByValue;
  this.setSelectedItemById = setSelectedItemById;
  this.onSelectionChange = this.onClick;

  // Begin configObject
  configObject();

  /**
   * Setup a group container div block to house the radio buttons
   *
   */
  function configObject()
  {

    configGroupProps();
    configBtnProps();

    m_strGroupId = strGroupId;

    if ( !strParent )
    {
      return;

    }

    const radioGroupParentElel = $( `#${strParent}` );
    radioGroupParentElel.addClass( m_groupProps.cssRadioGroup );

     // This prevents radio buttons from shifting the group div down when changing selection
    $(`#${strParent}`).css( "overflow", "hidden");

  } // end configObject()


  /**
   * Creates a VwRadioButton and adds it to this group
   * @param objData
   */
  function addButton( objData )
  {
    let vwRadioBtn;

    if ( objData instanceof VwRadioButton )
    {
      vwRadioBtn = objData;
    }
    else
    {
      vwRadioBtn = new VwRadioButton( strParent, objData, m_btnProps );
    }
    
    m_aButtons.push( vwRadioBtn );

    if ( m_groupProps.defaultButtonId && vwRadioBtn.getId() == m_groupProps.defaultButtonId )
    {
      m_activeButton = vwRadioBtn;

      setSelected( vwRadioBtn.getId() );
    }

    vwRadioBtn.click( handleRadioBtnClicked );

    return vwRadioBtn;

  } // end addButton()

  /**
   * Removes A button from the group
   * @param vwRadioBtn
   */
  function removeButton( vwRadioBtn )
  {
    if ( !vwRadioBtn instanceof VwRadioButton )
    {
      throw "Cannot remove a button that is not a VwRadioButton";

    }

    for ( var x = 0, nLen = m_aButtons.length; x < nLen; x++ )
    {
      if( m_aButtons[ x ].getId() == vwRadioBtn.getId() )
      {
        m_aButtons.splice( x, 1 );
        return;
      }
    }

  } // end removeButton()

  /**
   * Returns the selected button in the group
   * @returns {*}
   */
  function getSelectedButton()
  {
    return m_activeButton;

  } // end getSelectedButton()

  /**
   * Returns an array of buttons in the group
   * @returns {Array}
   */
  function list()
  {
    return m_aButtons;

  } // end list()



  /**
   * Unslects the active button and selectes the default button if the defualtButtonId was specified
   */
  function clear()
  {
    if ( m_activeButton )
    {
      m_activeButton.setSelected( false, true );
    }

    if ( m_groupProps.defaultButtonId )
    {
      setSelected( m_groupProps.defaultButtonId, true );
    }

  } // end clear()


  /**
   * Disables all buttons
   */
  function disableAll()
  {
    m_aButtons.forEach( (btn) =>
                        {
                          btn.enable( false );
                        });
  } // end

  function enableAll()
   {
     m_aButtons.forEach( (btn) =>
                         {
                           btn.enable( true );
                         });
   } // end disableAll()

  /**
   * Sets the button as the selected one in the group
   *
   * @param strBtnId  The id of the button to select
   */
  function setSelected( strBtnId, fIgnoreClickHandlers )
  {
    if ( m_activeButton )
    {
      m_activeButton.setSelected( false, fIgnoreClickHandlers );
    }
    
    const ndx = getRadioObjectNdxFromBtnId( strBtnId );

    if ( isNaN( ndx ) )
    {
      return;
    }

    m_aButtons[ ndx ].setSelected( true, fIgnoreClickHandlers );
    m_activeButton = m_aButtons[ ndx ];

  } // end setSelected()

  /**
   * This is a wrapper function the a VwForm custom control
   *
   * @param strId The id of the button to select
   */
  function setSelectedItemByValue( strId,fIgnoreClickHandlers )
  {
    setSelected( strId ,fIgnoreClickHandlers);

  } // end setSelectedItemByValue()

  /**
   * This is a wrapper function the a VwForm custom control
   *
   * @param strId The id of the button to select
   */
  function setSelectedItemById( strId,fIgnoreClickHandlers )
  {
    setSelected( strId ,fIgnoreClickHandlers);

  } // end setSelectedItemById()

  /**
   * Gets the selected value (the btn id) of the selected radio button in the group or null if no button is selected
   * @returns {*}
   */
  function getSelectedValue()
  {
    if ( m_activeButton )
    {
      const value = m_activeButton.getData().value ;
      return value;
    }

    return null;

  } // end getSelectedValue()

  function getSelectedId()
  {
    if ( m_activeButton )
    {
      return m_activeButton.getData().id ;
    }

    return null;

  } // end getSelectedValue()

  /**
   * Return true if there is a radio button selected in this group
   *
   * @returns {boolean}
   */
  function isSelectedItem()
  {
    return m_activeButton != null;

  } // end isSelectedItem()


  /**
   *
   * @param objBtnData
   */
  function handleRadioBtnClicked( objBtnData )
  {
    const nSelNdx = getRadioObjectNdxFromEvent( objBtnData );

    const objRadioClicked = m_aButtons[ nSelNdx ];

    if ( objRadioClicked.isSelected() )
    {
      if ( m_activeButton && m_activeButton.getId() != getIdFromBtnData( objBtnData ) )
      {
        m_activeButton.setSelected( false, true );
      }

      m_activeButton = objRadioClicked;
    }

    if ( m_fnClickHandler )
    {
      m_fnClickHandler( objBtnData);

    }

    return;

  } // end handleRadioBtnClicked()

  /**
   * Gets the button object associated with the button that was clicked on
   * @param objBtnData The buttton object data associated with the button clicked
   * @returns {*}
   */
  function getRadioObjectNdxFromEvent( objBtnData )
  {
    for ( let x = 0, nLen = m_aButtons.length; x < nLen; x++ )
    {
      if( m_aButtons[ x ].getId() == getIdFromBtnData( objBtnData ) )
      {
        return x;
      }
    }
  } // end getRadioObjectNdxFromEvent()

  /**
   * Gets the index in the button array if the button id
   *
   * @param strBtnId  The button id to search
   * @returns {number}
   */
  function getRadioObjectNdxFromBtnId( strBtnId )
   {
     for ( let x = 0, nLen = m_aButtons.length; x < nLen; x++ )
     {
       if( m_aButtons[ x ].getId() == strBtnId  )
       {
         return x;
       }
     }

   } // end getRadioObjectNdxFromBtnId()

  /**
   * gets the button id based on the property config
   *
   * @param objBtnData The buttton object data associated with the button clicked
   * @returns {*}
   */
  function getIdFromBtnData( objBtnData )
  {
    if ( m_btnProps.idProp )
    {
      return objBtnData[ m_btnProps.idProp ];
    }
    else
    if ( objBtnData.id )
    {
      return objBtnData.id
    }
    else
    {
      return objBtnData.toString();

    }

  } // end getIdFromBtnData()

  /**
   * Create default group properties
   */
  function configGroupProps()
  {
    $.extend( m_groupProps, groupProps );

  } // end configGroupProps()

  /**
   * Create the default initial button props
   */
  function configBtnProps()
  {
    m_btnProps.cssRadioBtnOuter = "VwRadioBtnOuter";
    m_btnProps.cssRadioBtnInner = "VwRadioBtnInner";
    m_btnProps.cssLabel = "VwLabel";
    m_btnProps.disabledCursor = "not-allowed";
    m_btnProps.cssDisabled = "VwGreyScaleImg";

    $.extend( m_btnProps, btnProps );
  }

} // end VwRadioButtonGroup{}

export default VwRadioButtonGroup;