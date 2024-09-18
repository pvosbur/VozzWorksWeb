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

import VwDataModel  from "/vozzworks/ui/VwDataModel/VwDataModel.js";
import VwMenuGroup  from "/vozzworks/ui/VwMenu/VwMenuGroup.js";
import VwHashMap    from "/vozzworks/util/VwHashMap/VwHashMap.js";
import VwExString from "/vozzworks/util/VwExString/VwExString.js";

/**
 * This Class is the data model for the VwMenu class
 *
 * @param modelProps The model props for defining access to the the user data object representing the menu
 * @constructor
 */
function VwMenuDataModel( strMenuParentId, modelProps )
{
  const self = this;
  const m_mapMenuItems = new VwHashMap();
  const m_mapMenuGroups = new VwHashMap();
  const m_mapMenuItemsByHotKey = new VwHashMap();
  const m_bIsPopupMenu = strMenuParentId == null || (modelProps &&modelProps.isPopupMenu);
  const m_strDefaultId = VwExString.genUUID() + "_default";

  let   m_modelProps;

  this.isPopup = () => m_bIsPopupMenu;
  this.addMenuGroup = addMenuGroup;
  this.addSubMenuGroup = addSubMenuGroup;
  this.addMenuItem = addMenuItem;
  this.removeMenuItem = removeMenuItem;
  this.updateMenuItem = updateMenuItem;
  this.hasMenuItem = ( strMenuId ) => m_mapMenuItems.containsKey( strMenuId );
  this.getMenuItem = ( strMenuId ) => m_mapMenuItems.get( strMenuId );
  this.getGroup = ( strGroupId ) => m_mapMenuGroups.get( strGroupId );
  this.getMenuItemForHotKey = ( strHotKey ) => m_mapMenuItemsByHotKey.get( strHotKey );
  this.getDefaultId = () => m_strDefaultId;
  this.getModelProps = () => m_modelProps;

  configObject();

  function configObject()
  {
    if ( !modelProps )
    {
      m_modelProps = { "fnIdProp":"getId"};
    }
    else
    {
      m_modelProps = modelProps;
      m_modelProps.fnIdProp = "getId";

    }
    
    VwDataModel.call( self, m_modelProps );

    // Create the top level default menu group


    const defaultVwMenuGroup = new VwMenuGroup( strMenuParentId, m_strDefaultId  );

    m_mapMenuGroups.put( m_strDefaultId, defaultVwMenuGroup );

    self.add( defaultVwMenuGroup );

  } // end configObject


  /**
   * Adds a menu group to the model
   *
   * @param strMenuIdGroupParent The menu item id that is the groups parent
   * @param strGroupId The id of the group
   */
  function addMenuGroup(strGroupId )
  {

    if ( m_mapMenuGroups.containsKey( strGroupId ))
    {
      throw "Menu Group Id: " + strGroupId + " already exists, cannot add";
    }

    const vwMenuGroup = new VwMenuGroup( strMenuParentId, strGroupId );

    m_mapMenuGroups.put( strGroupId, vwMenuGroup );

    self.add( vwMenuGroup );

  } // end addMenuGroup()

  function addSubMenuGroup( strMenuIdGroupParent, strGroupId )
  {

    if ( m_mapMenuGroups.containsKey( strGroupId ))
    {
      throw "Menu Group Id: " + strGroupId + " already exists, cannot add";
    }

    const vwMenuItemGroupParent = m_mapMenuItems.get( strMenuIdGroupParent );

    if ( !vwMenuItemGroupParent )
    {
       throw "Parent Menu Id: " + strMenuIdGroupParent + " does not exist, cannot add group id: " + strGroupId;

    }

    const vwMenuGroup = new VwMenuGroup( strMenuIdGroupParent, strGroupId );

    vwMenuItemGroupParent.setSubMenu( vwMenuGroup );

    m_mapMenuGroups.put( strGroupId, vwMenuGroup );

    self.add( vwMenuGroup );

  } // end addMenuGroup()


  /**
   * Adds a menu item to the specified group
   *
   * @param strMenuGroupId The group id the memu item is being added to. If null the group id uses the default group which is the group defined to the top level menu
   *
   * @param menuItem The user data menu item to add
   */
  function addMenuItem( strMenuGroupId, menuItem )
  {

    if ( !strMenuGroupId)
    {
      strMenuGroupId = m_strDefaultId;
    }
    const vwMenuGroup = m_mapMenuGroups.get( strMenuGroupId );

    if ( !vwMenuGroup )
    {
      throw "Group Id: " + strMenuGroupId + ", does not exist. Cannot Add Menu Item ";

    }

    const strMenuItemId = menuItem.getId();

    if ( m_mapMenuItems.containsKey( strMenuItemId  ) )
    {
      throw "Menu Id: " + strMenuItemId  + " already exists, cannot Add";
    }

    m_mapMenuItems.put( strMenuItemId , menuItem );

    if ( menuItem.getHotKey() )
    {
      m_mapMenuItemsByHotKey.put( menuItem.getHotKey(), menuItem );
    }

    vwMenuGroup.addMenuItem( menuItem );

    self.update( vwMenuGroup );
    
  } // end addMenuItem()


  /**
   * Updates the menu item
   *
   * @param strGroupId The group id the menu item is in may be null for the deafult main menu group
   * @param strMenuId The id of the menu item to upadte
   */
  function updateMenuItem( strGroupId, strMenuItemId )
  {

    if ( !strGroupId )
    {
      strGroupId = m_strDefaultId;
    }

    const vwMenuGroup = m_mapMenuGroups.get( strGroupId );

    if ( !vwMenuGroup )
    {
      throw "Group Id: " + strGroupId + ", does not exist. Cannot Add Menu Item ";

    }

    const menuItem = m_mapMenuItems.get( strMenuItemId );

    if ( !menuItem )
    {
      throw "Menu Id: " + strMenuItemId + " does not exist, cannot update";

    }

    vwMenuGroup.updateMenuItem( menuItem );

    self.update( vwMenuGroup );

  } // end updateMenuItem()


  /**
   * Removes the menu item
   *
   * @param strGroupId The group id the menu item is in. May be null for the default group
   * @param strMenuId The menu id to remove
   */
  function removeMenuItem( strGroupId, strMenuId )
  {

    const vwMenuGroup = m_mapMenuGroups.get( strGroupId );

    if ( !vwMenuGroup )
    {
      throw "Group Id: " + strGroupId + " does not exists. Cannot remove menu item: " + strMenuId;
    }

    const vwMenuItem = m_mapMenuItems.get( strMenuId );

    if ( !vwMenuItem )
    {
      throw "Menu Id: " + strMenuId + " does not exists. Cannot remove";

    }

    m_mapMenuItems.remove( strMenuId );
    vwMenuGroup.removeMenuItem( strMenuId );

    self.update( vwMenuGroup );

  } // end removeMenuItem(()

  /**
   * Replace an existing menu item at the same spot in the menu group with the new one
   * 
   * @param strOrigMenuItemId
   * @param strGroupId
   * @param vwNewMenuItem
   */
  function replaceMenuItem( strOrigMenuItemId, strGroupId, vwNewMenuItem )
  {
    const vwMenuGroup = m_mapMenuGroups.get( strGroupId );

    if ( !vwMenuGroup )
    {
      throw "Group Id: " + strGroupId + " does not exists. Cannot remove menu item: " + trOrigMenuItemId;
    }

    vwMenuGroup.replaceMenuItem( strOrigMenuItemId, vwNewMenuItem );

    m_mapMenuItems.remove( strOrigMenuItemId );
    m_mapMenuItems.put( vwNewMenuItem.getId(), vwNewMenuItem );

    self.update( vwMenuGroup );

  } // end replaceMenuItem()

} // end VwMenuDataModel{}

VwMenuDataModel.prototype = new VwDataModel();  // Super class

export default VwMenuDataModel;