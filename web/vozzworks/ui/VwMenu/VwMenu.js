/*
 ============================================================================================


                                       Copyright(c) 2020

                                        V o z z W a r e

                                 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   5/15/20

 Time Generated:   8:06 AM

 ============================================================================================
 */

import VwMenuItem from "./VwMenuItem.js";
import VwMenuGroup from "./VwMenuGroup.js";

VwCssImport( "/vozzworks/ui/VwMenu/style");


function VwMenu( strMenuContainerId, vwMenuDataModel, menuProps )
{
  const self = this;

  const m_menuProps = configProps();
  const m_aMenuItemClickHandlees = [];

  this.onClick = ( fnClickHandler  ) => m_aMenuItemClickHandlees.push( fnClickHandler  );
  this.show = showAbsolutePosition;
  this.hide = () => $(`#${strMenuContainerId}`).hide();
  this.enableBroup = enableGroup;
  this.enableMenuItem = enableMenuItem;
  this.buildMenuGroup = buildMenuGroup;
  this.showMenuItem = showMenuItem;
  this.hideMenuItem = hideMenuItem;
  this.getMenuProps = () => menuProps;

  configObject();

  /**
   * Constructor impl
   */
  function configObject()
  {
    if ( strMenuContainerId )
    {
      $( `#${strMenuContainerId}` ).addClass( m_menuProps.cssMenu );
      $( `#${strMenuContainerId}` ).attr( "tabindex", "0" );
    }

    vwMenuDataModel.registerEventListener( self, handleMenuDataEvent );
    vwMenuDataModel.refresh();

    if ( strMenuContainerId )
    {
      $( `#${strMenuContainerId}` ).focus();
    }

    installKeyboardHandler();

  }

  /**
   * Displays the menu at absolue x,y
   *
   * @param x The absolute left pos
   * @param y The absolute y pos
   */
  function showAbsolutePosition( x, y )
  {
    $(`#${strMenuContainerId}`).show();
    $(`#${strMenuContainerId}`).css( "left", x + "px");
    $(`#${strMenuContainerId}`).css( "top", y + "px");

  } // end showAbsolutePosition()

  /**
   * Hot key keboard handler
   */
  function installKeyboardHandler()
  {
    $(document).keypress( handleKeyDown );

    if ( menuProps.hideOnEscapeKey ) // install escape key handler if this prop set
    {
      $( document ).keydown( ( ke ) => {
        if ( ke.keyCode == 27 )
        {
          self.hide();
        }
      });

    }

    /**
     * Handle the keypress down event
     * @param ke
     */
    function handleKeyDown( ke )
    {
      ke.stopPropagation();
      ke.stopImmediatePropagation();

      const key = ke.key;

      let strHotKey = "";

      if( ke.metaKey )
      {
        strHotKey += VwMenu.CMD_KEY + " ";
      }
      if ( ke.ctrlKey )
      {
        strHotKey += VwMenu.CTRL_KEY + " ";
      }

      if ( ke.altKey )
      {
        strHotKey += VwMenu.ALT_KEY + " ";
      }

      if ( ke.shiftKey )
      {
        strHotKey += VwMenu.SHIFT_KEY + " ";
      }

      strHotKey += key;

      const vwMenuItem = vwMenuDataModel.getMenuItemForHotKey( strHotKey );

      if ( vwMenuItem )
      {
        const event = {};
        event.currentTarget = {};
        event.currentTarget.id = vwMenuItem.getId()  ;

        handleMenuItemClicked( event );
        
      }
      
      return;

    } // end handleKeyDown(()

  } // end nstallKeyboardHandler()

  /**
   * Enables/Disables all menu items in a group
   *
   * @param strGroupId The group id to ebanle/disable
   * @param bEnable true to enable, false to disable
   */
  function enableGroup( strGroupId, bEnable )
  {
    if ( strGroupId == null )
    {
      strGroupId = vwMenuDataModel.getDefaultId();
    }

    const menuGroup = vwMenuDataModel.getGroup( strGroupId );

    if ( !menuGroup )
    {
      throw `enableGroup() : invalid group id:${strGroupId} does not exist`;
    }

    menuGroup.enable( bEnable );

  } // end enableGroup()

  /**
   * Enable/disable a menu item
   *
   * @param strMenuId The menu id to enable/disable
   * @param bEnable true to enable, false to disable
   */
  function enableMenuItem( strMenuId, bEnable )
  {
    const menuItem = vwMenuDataModel.getMenuItem( strMenuId );

    if ( !menuItem )
    {
      throw `enableMenuItem() : invalid menu item id:${strMenuId} does not exist`;
    }

    menuItem.enabled( bEnable );

  } // end enableMenuItem()

  /**
   * hides a menu item
   *
   * @param strMenuId The menu id to hide
   */
  function hideMenuItem( strMenuId )
  {
    const menuItem = vwMenuDataModel.getMenuItem( strMenuId );

    if ( !menuItem )
    {
      throw `hideMenuItem() : invalid menu item id:${strMenuId} does not exist`;
    }

    menuItem.hide();

  } // end enableMenuItem()

  /**
   *
   * Show a menu item
   * @param strMenuId The menu id to show
  */
  function showMenuItem( strMenuId )
  {
    const menuItem = vwMenuDataModel.getMenuItem( strMenuId );

    if ( !menuItem )
    {
      throw `showMenuItem() : invalid menu item id:${strMenuId} does not exist`;
    }

    menuItem.show();

  } // end enableMenuItem()

  /**
   * Datamodel change event listener
   *
   * @param strEventType The eventtype
   * @param tnNode The tree node affected
   */
  function handleMenuDataEvent( strEventType, vwMenuGroup )
  {
    switch( strEventType )
    {
      case "add":

        buildMenuGroup( vwMenuGroup );
        break;

      case "del":

        removeMenuObject( vwMenuGroup );
        break;

      case "update":

        updateMenuGroup( vwMenuGroup );
        break;

      case "clear":

        $("#" + strMenuContainerId ).empty();
        break;

    } // end switch()

  } // end handleTreeDataEvent()




  /**
   * Builds a menu group and its menutemd from a VwMenuGroup object
   *
   * @param vwMenuGroup The VwMenuGroup object with its menuItems
   */
  function buildMenuGroup( vwMenuGroup, bBuildSubGroups )
  {
    let strGroupParentId = vwMenuGroup.getParentId();

    if ( !strGroupParentId ) // this is a popup
    {
      if ( strMenuContainerId )
      {
        strGroupParentId = strMenuContainerId;
      }
      else
      {
        $( `#${menuProps.popupId}` ).empty();

        // see if the popup container has been istalled
        const popupEle = $( `#${menuProps.popupId}` )[0];

        if ( !popupEle )   // Install popup container
        {
          const strPopupParentHtml =
                  `<div id="${menuProps.popupId}" class="${menuProps.cssMenu}" style="display:none;position:absolute"></div>`

          $( "body" ).append( strPopupParentHtml );

        }

        strGroupParentId = strMenuContainerId = menuProps.popupId;
      } // end else

    } // end if

    const strContent = vwMenuGroup.render( m_menuProps );

    if ( strGroupParentId == null )
    {
      $( `#${strMenuContainerId}` ).html( strContent );

    }
    else
    {
      $( `#${strGroupParentId}` ).append( strContent );

    }

    const aMenuItems = vwMenuGroup.getMenuItems();

    for ( const vwMenuItem of aMenuItems )
    {
      buildMenu( vwMenuGroup, vwMenuItem, bBuildSubGroups  );
    }


  } // end buildMenuGroup()

  /**
   * Builds a menu item from a VwMenuItem object
   *
   * @param vwMenuItem a VwMenuItem object
   */
  function buildMenu( vwMenuGroup, vwMenuItem, bBuildSubGroups )
  {
    // Group id is the parent for all menu items inn the group
    const strGroupId = vwMenuGroup.getId();

    const strContent = vwMenuItem.render( m_menuProps );

    $(`#${strGroupId}` ).append( strContent );

    vwMenuItem.configMenu( self, strMenuContainerId, bBuildSubGroups, handleMenuItemClicked );

  } // end builMenuItem()



  /**
   * Handles menu item clicks
   * @param event
   */
  function handleMenuItemClicked( vwMenuItem )
  {
    if ( event.stopPropagation )
    {
      event.stopPropagation();
    }


    for ( const menuClickHandler of m_aMenuItemClickHandlees )
    {
      menuClickHandler.call( self, vwMenuItem );
    }

  } // end handleMenuItemClicked()

  /**
   * Removes the menu object which may be a VwMenuGroup or a VwMenuItem
   *
   * @param menuObject The menu object to remove
   */
  function removeMenuObject( vwMenuItem )
  {
    const strMenuId =  vwMenuItem.getId();

    $(`#${strMenuId}`).remove();

  } // end removeMenuObject()


  /**
    * Removes the menu object which may be a VwMenuGroup or a VwMenuItem
    *
    * @param menuObject The menu object to remove
    */
  function updateMenuGroup( vwMenuGroup  )
  {
    const strGroupId = vwMenuGroup.getId();
    $(`#${strGroupId}`).remove();

    buildMenuGroup( vwMenuGroup, true );

  } // end updateMenuObject()


  /**
   * Config the default properties and merge any from user
   * @returns {{}}
   */
  function configProps()
  {
    const _props = {};

    _props.cssMenu = "VwMenu";
    _props.cssMenuGroup = "VwMenuGroup";
    _props.cssMenuItem = "VwMenuItem";
    _props.cssMenuIcon = "VwMenuIcon";
    _props.cssMenuText = "VwMenuText";
    _props.cssSubMenuArrowIcon = "VwSubMenuArrow";
    _props.subMenuArrowImgUrl = "/vozzworks/ui/images/vw_black_arrow_right.png";
    _props.cssMenuItemHotKey = "VwMenuItemHotKey";
    _props.cssDisabledText = "VwGreyScaleText";
    _props.cssDisabledImg = "VwGreyScaleImg";
    _props.cssMenuDisabled = "VwMenuDisabled";

    $.extend( _props, menuProps );

    // merge the data models mode props with the menu props
    $.extend( _props, vwMenuDataModel.getModelProps() );

    return _props;

  } // end configProps()

} // end VwMenu{}

VwMenu.CMD_KEY = "&#8984;";
VwMenu.ALT_KEY = "&#9095;";
VwMenu.SHIFT_KEY ="&#8679;";
VwMenu.CTRL_KEY = "^";
VwMenu.LEFT_DEL_KEY ="&#9003;";
VwMenu.RIGHT_DEL_KEY ="&#8998;";
VwMenu.DOWN_ARROWL_KEY ="&#8681;";
VwMenu.RIGHT_ARROWL_KEY ="&#8680;";
VwMenu.ENTER_KEY ="&#9166;";

export default VwMenu;
