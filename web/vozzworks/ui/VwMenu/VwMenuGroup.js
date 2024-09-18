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
 * This class defines a menu group which has a list of VwMenuItems and puts a bottom broder after the last menu item iin the group
 *
 * @param sstrParentId The parent id or null if top level
 *
 * @param strGroupId  The menu group id
 * @constructor
 */
function VwMenuGroup( strParentId, strGroupId )
{
  const m_aMenuItems = [];

  let   m_bDisabled;

  this.getParentId = () => strParentId;
  this.getId = () => strGroupId;

  this.enable = enableGroup;
  this.isDisabled = () => m_bDisabled;

  this.addMenuItem = addMenuItem;
  this.getMenuItems = () => m_aMenuItems;
  this.removeMenuItem = removeMenuItem;
  this.replaceMenuItem = replaceMenuItem;
  this.getMenuItem = getMenuItem;
  this.updateMenuItem = updateMenuItem;

  this.render = render;

  /**
   * Adds a new VwMenuItem to this menu group
   *
   * @param vwMenuItem The menuitem to add
   */
  function addMenuItem( vwMenuItem )
  {
    const strMenuId =  vwMenuItem.getId();

    const nMenuItemNdx = findMenuItemIndex( strMenuId );

    if ( nMenuItemNdx >= 0 )
    {
      throw `Menu Item: ${strMenuId} already exists in Group: $strGroupId}, Cannot Add`;
    }

    m_aMenuItems.push( vwMenuItem );

  }

  /**
   * Updates the menu item array with new menuitem spec
   * @param vwMenuItem
   */
  function updateMenuItem( vwMenuItem )
  {
    const strMenuItemId = vwMenuItem.getId();

    const nMenuItemNdx = findMenuItemIndex( strMenuItemId );

    if ( nMenuItemNdx < 0  )
    {
      throw `Menu Item: ${strMenuItemId} does not exist in Group: $strGroupId}, Cannot Update`;
    }

    m_aMenuItems[ nMenuItemNdx ] = vwMenuItem;

  } // end updateMenuItem()


  /**
   * Gets the menuitem by its menu id
   * @param strMenuItemId
   * @returns {*}
   */
  function getMenuItem( strMenuItemId )
  {
    const nMenuItemNdx = findMenuItemIndex( strMenuItemId );

    if ( nMenuItemNdx < 0 )
    {
      throw `Menu Item: ${strMenuItemId} does not exists in Group: ${strGroupId}`;
    }

    return m_aMenuItems[ nMenuItemNdx];

  } // end getMenuItem()


  /**
   * Removes the menu item from the group
   * @param strMenuId
   */
  function removeMenuItem(  strMenuId )
  {
    const nMenuItemNdx = findMenuItemIndex( strMenuId );

    if ( nMenuItemNdx < 0 )
    {
      throw `Menu Item: ${strMenuId} does not exists in Group: ${strGroupId} cannot remove`;
    }

    m_aMenuItems.splice( nMenuItemNdx, 1 );

    return;

  } // end removeMenuItem()


  /**
   * Replaces an existing menu item with the new one
   *
   * @param strOrigMenuItemId The original menu item id to replace
   * @param newVwMenuItem The menuitem to replace it with
   */
  function replaceMenuItem( strOrigMenuItemId, newVwMenuItem )
  {
    const nMenuItemNdx = findMenuItemIndex( strOrigMenuItemId );

    if ( nMenuItemNdx < 0 )
    {
      throw `Menu Item: ${strOrigMenuItemId} does not exists in Group: ${strGroupId} , cannot replace`;
    }

    m_aMenuItems[ nMenuItemNdx ] = newVwMenuItem;

  } // end replaceMenuItem()


  /**
   * Enables/disables all menu items in this group
   *
   * @param bEnable true to enable, false to disable
   */
  function enableGroup( bEnable )
  {
    for ( const menuItem of m_aMenuItems )
    {
      menuItem.enable( bEnable );
    }

  } // end enableGroup()

  
/**
 * Finds the index in the array of the menu item
 *
 * @param strMenuId The menu id tp look for
 * @returns {number}
 */
  function findMenuItemIndex( strMenuId )
  {
    let nMenuNdx = -1;
    for ( const vwMenuItem of m_aMenuItems )
    {
      ++nMenuNdx;
      if ( vwMenuItem.getId() == strMenuId )
      {
        return nMenuNdx;
      }
    }

    return -1; // not found

  } // end fineMenuItemIndex()


  /**
   * Renders the content as html
   */
  function render( menuProps )
  {
    const strHtml =
            `<div class="${menuProps.cssMenuGroup}" id="${strGroupId}">
             </div>`

    return strHtml       ;
  }
} // end VwMenuGroup{}

export default VwMenuGroup;