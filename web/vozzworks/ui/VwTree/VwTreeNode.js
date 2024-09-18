/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2020 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 *  ============================================================================================
 *
 */

import VwExString from "/vozzworks/util/VwExString/VwExString.js";
import VwHashMap from "/vozzworks/util/VwHashMap/VwHashMap.js";
import VwStack from "../../util/VwStack/VwStack.js";

VwCssImport( "/vozzworks/ui/VwTree/style");

/**
 * This class represents a node in the tree. It carries references to its children and siblings
 *
 * @param treeDataModel  The VwTreeDataMode instance
 * @param tnNodeParent  The VwTreeNode parent instance
 * @param nodeData The user data assocated with the tree node.
 * @constructor
 */
function VwTreeNode( treeDataModel, tnNodeParent, strNodeId, nodeData, bIsLeafNode,  nodeProps )
{
  const self = this;
  const m_aChildren = [];
  const m_mapExtras = new VwHashMap();
  const m_mapAttributesByName = new VwHashMap();

  let   m_aAttributes;
  let   m_strNodeValue;
  let   m_strNodeName;
  let   m_strNodeType;
  let   m_bIsSelected = false;
  let   m_nodeData = nodeData;
  let   m_nodeProps = nodeProps;
  let   m_treeProps;

  this.setSelected = setSelected;
  this.isSelected = () => m_bIsSelected;
  this.isLeafNode = () => bIsLeafNode;
  this.render = render;
  this.getNodeProps = () => m_nodeProps;
  this.setNodeProps = ( updateNodeProps ) => m_nodeProps = updateNodeProps;
  this.getId = () => strNodeId;
  this.setId = ( strId ) => strNodeId = strId;
  this.setExtras = ( strKey, extraData ) => m_mapExtras.put( strKey, extraData );
  this.getExtras = ( strKey ) => m_mapExtras.get( strKey );
  this.removeExtras = ( strKey ) => m_mapExtras.remove( strKey );
  this.getName = () => m_strNodeName;
  this.setName = ( strName ) => m_strNodeName = strName;
  this.getParent = () => tnNodeParent;
  this.getData = () => nodeData;
  this.setData = setData;
  this.getValue = () => m_strNodeValue;
  this.setValue = ( strValue ) => m_strNodeValue = strValue;
  this.addAttribute = addAttribute;
  this.getAttributes = () => m_aAttributes;
  this.setAttributes = setAttributes;
  this.getAttribute = ( strAttrName ) => m_mapAttributesByName.get( strAttrName );
  this.addChild = (tnChildNode ) => m_aChildren.push( tnChildNode );
  this.removeChild = removeChild;
  this.getChildren = () => m_aChildren;
  this.hasChildren = () => m_aChildren && m_aChildren.length > 0;
  this.setNodeType = ( strNodeType ) => m_strNodeType = strNodeType;
  this.getNodeType = () => m_strNodeType;
  this.getPath = getPath;

  configObject();

  function configObject()
  {
    if ( nodeData )
    {
      m_strNodeValue = nodeData[ treeDataModel.getNodeValueProp() ];

    }

  } // end configObject()

  /**
   * Gets the html that defines the node
   *
   * @param nodeIndentMargen The indentation margin
   * @param treeProps The tree  properties
   * @param bUpdate if true, update node data
   * @returns {string}
   */
  function render( nodeIndentMargen, treeProps, bUpdate )
  {
    m_treeProps = treeProps;

    if ( bIsLeafNode )
    {
      if ( treeProps.leafTemplateHtml )
      {
        const expandObj = {...treeProps}
        expandObj.strNodeId = strNodeId;
        expandObj.strNodeValue = m_strNodeValue;
        expandObj.nodeIndentMargen = nodeIndentMargen;

        const strFolderTemplate = VwExString.expandMacros( treeProps.leafTemplateHtml, expandObj );
        return strFolderTemplate;
      }

      let strLeafNodeHtml =
              `<!-- /vozzworks/ui/VwTreeNode.js-->
               <div id="${strNodeId}" class="${treeProps.cssTreeLeafNode}" style="margin-left:${nodeIndentMargen}">`

                      if ( treeProps.leafImg )
                      {
                        strLeafNodeHtml +=
                          `<img id="leaf_${strNodeId}" class="${treeProps.cssNodeFolderImg}" src="${treeProps.leafImg}"/>`
                      }

                strLeafNodeHtml +=  `<span id="value_${strNodeId}" class="${treeProps.cssNodeValue}">${m_strNodeValue}</span>
               </div>`
      return strLeafNodeHtml;
    }

    if ( treeProps.folderTemplateHtml )
    {
      const expandObj = {...treeProps}
      expandObj.strNodeId = strNodeId;
      expandObj.strNodeValue = m_strNodeValue;
      expandObj.nodeIndentMargen = nodeIndentMargen;

      const strFolderTemplate = VwExString.expandMacros( treeProps.folderTemplateHtml, expandObj );
      return strFolderTemplate;
    }

    let strNodeHtml =
          `<!-- /vozzworks/ui/VwTreeNode.js-->
             <div id="${strNodeId}" class="${treeProps.cssTreeNode}" style="margin-left:${nodeIndentMargen}">
               <img id="expander_${strNodeId}" class="${treeProps.cssNodeExpanderImg} VwArrowRight" src="${treeProps.folderCloseImg}"/>
               <img id="folder_${strNodeId}" class="${treeProps.cssNodeFolderImg}" src="${treeProps.folderImg}"/>
               <span id="value_${strNodeId}" class="${treeProps.cssNodeValue}">${m_strNodeValue} </span>
             </div>`

            if ( !bUpdate )
            {
              strNodeHtml += `<div id="children_${strNodeId}" class="${treeProps.cssNodeChildren}" style="display:none;"></div>`
            }


    return strNodeHtml;


  } // end getHtml()

  /**
   * Sets or removes the node selected state
   *
   * @param bIsSelected true to select, false to unselect
   */
  function setSelected( bIsSelected )
  {

    m_bIsSelected = bIsSelected;

    if ( m_bIsSelected )
    {
      if ( treeDataModel.hasSelectedNodes() && ! m_treeProps.allowMultSelections )
      {
        throw `Attempt to select multiple nodes and the allowMultSelections property is not set`;
      }

      treeDataModel.addSelectedNode( self );
      $(`#value_${strNodeId}`).addClass( m_treeProps.cssSelectedItem );
    }
    else
    {
      $(`#value_${strNodeId}`).removeClass( m_treeProps.cssSelectedItem );
      treeDataModel.removeSelectedNode( self );

    }

  } // end setSelecte
 
  /**
   * Sets or updates the node data
   *
   * @param nodeData The node data to set/update
   */
  function setData( nodeData )
  {
    m_nodeData = nodeData;
    m_strNodeValue = nodeData[ treeDataModel.getNodeValueProp() ];

  } // end setData()


  /**
   * Removes a child node from the children node array
   * @param tnNodeChild
   */
  function removeChild( tnNodeChild )
  {
    for ( let x = 0; x < m_aChildren.length; x++  )
    {
      if ( m_aChildren[x].getId() == tnNodeChild.getId() )
      {
        m_aChildren.splice( x, 1 );
        return;
      }
    }
  } // end removeChild()


  /**
   * Adds an attribute to the node
   * @param vwAttribute
   */
  function addAttribute( vwAttribute )
  {
    if ( !m_aAttributes )
    {
      m_aAttributes = [];
    }

    m_aAttributes.push( vwAttribute );
    m_mapAttributesByName.put( vwAttribute.getName(), vwAttribute.getValue() );

  } // end addAttribute()


  /**
   * Sets an array of VwXmlAttributes
   * @param aAttributes
   */
  function setAttributes( aAttributes )
  {
    for ( const attribute of aAttributes )
    {
      addAttribute( attribute );
    }
  }

  /**
   * Returnrs the tree path up to the current node
   * @return {string}
   */
  function getPath()
  {
    const parentStack = new VwStack();
    let tnNode = self.getParent();

    while ( tnNode != null )
    {
      parentStack.push( tnNode );
      tnNode = tnNode.getParent()
    }

    if ( parentStack.size() == 0 )
    {
      return "";
    }

    let strPath = "";

    while ( true)
    {
      const tnNode = parentStack.pop();
      if ( !tnNode )
      {
        break;
      }

      if ( strPath )
      {
        strPath += "/";
      }

      strPath += tnNode.getName();

    } // end while()

    return strPath;
  }
} // end VwTreeNode{}

export default VwTreeNode;

