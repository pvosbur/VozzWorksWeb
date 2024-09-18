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


/**
 * This class defines a menu item entry in a menu group
 *
 * @param strId The menu item id
 * @param strMenuText The menu item text
 * @param strIconUrl The icon url if specified. May be an Array of two which will hover and use the 2xd in the array on hover
 * @param strHotKey The keyboard hot key  shortcust
 * @constructor
 */
function VwMenuItem( strId, strMenuText, strIconUrl, strHotKey, bIsDisabled  )
{
  const self = this;

  let m_strIconDisplay = "none";
  let m_strHotKeyDisplay = "none";
  let m_bDisabled = bIsDisabled;
  let m_subMenuItem;
  let m_strParentId;
  let m_menuProps;

  this.configMenu = configMenu;
  this.getId = () => strId;
  this.getText = () => strMenuText;
  this.getIconUrl = () => strIconUrl;
  this.getHotKey = () => strHotKey;
  this.setParentId = ( strParentId ) => m_strParentId = strParentId;
  this.getParentId = () => m_strParentId;
  this.enable = enable;
  this.isDisabled = () => m_bDisabled;
  this.hide = () => $(`#${strId}`).hide();
  this.show = () => $(`#${strId}`).show();

  this.render = render;
  this.setSubMenu = ( subMenuItem) => m_subMenuItem = subMenuItem;
  this.getSubMenu = () => m_subMenuItem;

  this.updateMenuItemSpec = updateMenuItemSpec;


  /**
   * Renders the content as html
   * @returns {string}
   */
  function render( menuProps )
  {

    m_menuProps = menuProps;

    if ( m_menuProps.menuitemTemplate )
    {

    }
    let strHtml =
            `<div id="${strId}" class="${menuProps.cssMenuItem}">
               <img id="icon_${strId}" class="${menuProps.cssMenuIcon}" style="display:${m_strIconDisplay}" }"/>
               <span id="text_${strId}" class="${menuProps.cssMenuText}">${strMenuText}</span>
               <img id="submenuArrow_${strId}" class="${menuProps.cssSubMenuArrowIcon}" src="${menuProps.subMenuArrowImgUrl}" style="display:none"/>
               <span id="hotKey_${strId}" class="${menuProps.cssMenuItemHotKey}" style="display:${m_strHotKeyDisplay}">${strHotKey}</span>`;

    if ( m_subMenuItem )
    {
      strHtml += `<div id="subMenu_${strId}" class="${m_menuProps.cssMenuGroup} VwSubMenu"></div>`;

    }

    strHtml += `</div>`;

    return strHtml;

  } // end render()

  configObject();

  /**
   * Sets up inital meny
   */
  function configObject()
  {
    if ( strIconUrl )
    {
      m_strIconDisplay = "inline";
    }

    if ( strHotKey )
    {
      m_strHotKeyDisplay = "inline";
    }
    if ( bIsDisabled )
    {
      m_bDisabled = true;
    }
  }

  /**
   * Setus menu item as it is now in the DOM
   * @param fnClickHandker
   */
  function configMenu( vwMenu, strMenuContainerId, bBuildSubGroups, fnClickHandker )
  {
    let strImgSrcUrl;

    if ( Array.isArray( strIconUrl ) )
    {
      strImgSrcUrl = strIconUrl[ 0 ];
    }
    else
    {
      strImgSrcUrl = strIconUrl;

    }

    $(`#${strId}`).hover( handleMenuItemHoverIn, handleMenuItemHoverOut );

    $(`#icon_${strId}`).attr( "src", strImgSrcUrl );

    if ( m_subMenuItem )
    {
      setSubMenuPosition( strMenuContainerId );

      if ( bBuildSubGroups )
      {
        vwMenu.buildMenuGroup( m_subMenuItem, true );
      }

      $(`#${strId}` ).hover( handleSubMenuItemHoverIn, () => $( `#subMenu_${strId}`).hide() );

    }
    else
    {
      // Only install click events on no submenu menu items
      $(`#${strId}` ).click( () =>
                             {
                               if ( m_bDisabled )
                               {
                                 return;
                               }

                               fnClickHandker( self );

                             });

    }

    if ( m_bDisabled )
    {
      enable( false );
    }

  } // end configMenu()

  function handleMenuItemHoverIn()
  {
    if ( m_bDisabled )
    {
      return;
    }

    if ( Array.isArray( strIconUrl ) )
    {
      $(`#icon_${strId}`).attr( "src", strIconUrl[ 1 ] );
    }

    if ( m_menuProps.cssHoverText )
    {
      $(`#text_${strId}`).addClass( m_menuProps.cssHoverText );

    }
  }

  function handleMenuItemHoverOut()
  {
    if ( m_bDisabled )
    {
      return;
    }

    if ( Array.isArray( strIconUrl ) )
    {
      $(`#icon_${strId}`).attr( "src", strIconUrl[ 0 ] );
    }

    if ( m_menuProps.cssHoverText )
    {
      $(`#text_${strId}`).removeClass( m_menuProps.cssHoverText );

    }

  }


  /**
   * Enables/disables a menu item
   *
   * @param bEnable true to enable, false to disable
   */
  function enable( bEnable )
  {

    if ( m_bDisabled )
    {
      $(`#${strId}`).addClass( m_menuProps.cssMenuDisabled );
      $(`#icon_${strId}`).addClass( m_menuProps.cssDisabledImg );
    }
    else
    {
      $(`#${strId}`).removeClass( m_menuProps.cssMenuDisabled );
      $(`#icon_${strId}`).removeClass( m_menuProps.cssDisabledImg );

    }

    m_bDisabled = !bEnable;

  } // end enable()

  /**
   * Updates the current menuItemSpec with new data
   * @param menuItemSpec
   */
  function updateMenuItemSpec( menuItemSpec )
  {
    configObject();

  }


  /**
   * MenuItem hover in
   *
   * @param event The event ofr the hover
   */
  function handleSubMenuItemHoverIn( event )
  {
    const strId = event.currentTarget.id;

    const vwMenuItemHovered = vwMenuDataModel.getMenuItem( strId );

    if ( vwMenuItemHovered.isDisabled() )
    {
      return;
    }

    $(`#subMenu_${strId}` ).show();

  } // end handleMenuItemHoverIn)



  /**
   * Updates the menu item parent
   *
   * @param vwMenuGroup The menu group of menu items
   */
  function updateMenuItemParent( vwMenuGroup )
  {
    const aMenuItems = vwMenuGroup.getMenuItems();

    for ( const vwMenuItem of aMenuItems )
    {
      vwMenuItem.setParentId( vwMenuGroup.getId() );
    }
  }


  /**
   * Computes the x,y location of where the submenu will display
   *
   * @param vwMenuItemParent The parent menu item
   * @param subMenu Either a VwMenuGroup or a VwMenuItem object
   */
  function setSubMenuPosition( strMenuContainerId )
  {
    const offsetMenuParent = $("#" + strId ).offset();

    const containerOffset = $("#" + strMenuContainerId).offset();

    offsetMenuParent.top = 0;

    offsetMenuParent.left += $("#" + strId ).width() - containerOffset.left - 4;

    $(`#subMenu_${strId}` ).offset( offsetMenuParent );

    m_subMenuItem.setParentId( `subMenu_${strId}` );

    $(`#submenuArrow_${strId}`).show();

  } // end setSubMenuPosition()


} // end VwMenuItem{}

export default VwMenuItem;