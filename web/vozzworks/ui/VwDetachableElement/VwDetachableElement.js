/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2012 By
 *
 *                                        Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 *  ============================================================================================
 */

VwCssImport( "/vozzworks/ui/VwDetachableElement/style");

function VwDetachableElement( strElementToDetachId, objProps )
{

  const m_strDetachImgId = strElementToDetachId + "_img" ;
  const m_strMenuDropdownId = strElementToDetachId + "_menuDropDown";

  let   m_objDetachableProps;
  let   m_imgMenuSelectorEle;
  let   m_gearDropDownList;
  let   m_tearOffDialog;


  configObject();

  async function configObject()
  {
    configProps();

    completeConfig();
  }


  async function completeConfig()
  {
    if ( m_objDetachableProps.useIconMenuSelector )
    {
      m_imgMenuSelectorEle = $("<img>").attr( "id", m_strDetachImgId ).attr( "src", m_objDetachableProps.imgMenuSelector ).addClass( m_objDetachableProps.cssMenuSelector );
      $( "#" + m_objDetachableProps.iconParentId ).append( m_imgMenuSelectorEle );
      $( "#" + m_objDetachableProps.iconParentId ).append( $("<div>").attr( "id", m_strMenuDropdownId ).addClass( m_objDetachableProps.cssMenuDropdown ) );

      setupDetachMenu();
      await setupTearOffDialogBox();
    }

    setupActions();
  }

  function setupDetachMenu()
  {
    const aItems = [];
    const objDocked = {};
    objDocked.id = "d";

    if ( m_objDetachableProps.resourceMgr )
    {
      objDocked.val = m_objDetachableProps.resourceMgr.getString( "dockedMode" );
    }
    else
    {
      objDocked.val = "Docked Mode";
    }

    aItems.push( objDocked );

    const objFloat = {};
    objFloat.id = "f";

    if ( m_objDetachableProps.resourceMgr )
    {
      objFloat.val = m_objDetachableProps.resourceMgr.getString( "floatMode" );
    }
    else
    {
      objFloat.val = "Floating Mode";
    }

    aItems.push( objFloat );

    m_gearDropDownList = new VwListBox( m_strMenuDropdownId, aItems, {checkSelectedItem:true, idDisplayProp:"val",disableScrollbars:true});
    m_gearDropDownList.setSelectedItem( objDocked );
    m_gearDropDownList.hide();

    m_gearDropDownList.click( function( objSelected )
                            {

                              if ( objSelected.id == "d")
                              {
                                m_tearOffDialog.dock();
                                $(m_imgMenuSelectorEle).click( function()
                                                  {
                                                    m_gearDropDownList.show();

                                                  });

                                m_gearDropDownList.refresh();


                              }
                              else
                              {
                                m_tearOffDialog.undock();

                              }

                              m_gearDropDownList.hide();

                            });

 
  }

  /**
   * create the detach modeless dialog box
   */
  async function setupTearOffDialogBox()
  {
    const dialogProps = {};

    dialogProps.tearOff = true;
    dialogProps.dragElementId = m_objDetachableProps.iconParentId;
    dialogProps.fnUnDocked = m_objDetachableProps.fnUnDocked;
    dialogProps.fnDocked = m_objDetachableProps.fnDocked;
    dialogProps.cssPopup = m_objDetachableProps.cssPopup;
    dialogProps.tearOffPlaceholderEle = m_objDetachableProps.tearOffPlaceholderEle;

    m_tearOffDialog = await new VwDialogBox( strElementToDetachId, dialogProps );

  }


  /**
   * Install click handler
   */
  function setupActions()
  {
    if ( m_imgMenuSelectorEle )
    {
      $( m_imgMenuSelectorEle ).click( handleDetachMenuSelectorClicked )

      $("body")[0].addEventListener( "click", handleOutsideClickHandler );

    }

  }

  /**
   * Outside detach menu click handler to hide menu if clicked outside of dropdown
   */
  function handleOutsideClickHandler()
  {
    const  strTarget = event.target.id;

    if( strTarget == m_strDetachImgId )
    {
      return;
    }

    m_gearDropDownList.hide();
    

  }

  /**
   * Shows the dropdown detauch menu when icon is clicked
   */
  function handleDetachMenuSelectorClicked()
  {
    m_gearDropDownList.show();
  }
  /**
   * Config default props
   */
  function configProps()
  {
    m_objDetachableProps = {};
    m_objDetachableProps.imgMenuSelector = "vozzworks/ui/images/vw_gear_black.png";
    m_objDetachableProps.cssMenuSelector = "VwDetachableMenuSelector";
    m_objDetachableProps.cssMenuDropdown = "VwDockModeDropdown";
    m_objDetachableProps.useIconMenuSelector = true;
    m_objDetachableProps.cssPopup = "VwTearOff";

    $.extend( m_objDetachableProps, objProps );

  }
} // end VwDetachableElement{}

export default VwDetachableElement;

