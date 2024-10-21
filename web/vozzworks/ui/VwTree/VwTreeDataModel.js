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
 * ============================================================================================
 *
 */

import VwDataModel  from "/vozzworks/ui/VwDataModel/VwDataModel.js";
import VwExString   from "/vozzworks/util/VwExString/VwExString.js";
import VwTreeNode   from "/vozzworks/ui/VwTree/VwTreeNode.js";
import VwHashMap    from "/vozzworks/util/VwHashMap/VwHashMap.js";
import VwXmlProcessor from "../../util/VwXmlProcessor/VwXmlProcessor.js";

function VwTreeDataModel( strInstallId, nodeDataRoot, modelProps, rootNodeProps )
{

  const self = this;
  const EXACT = 1;
  const STARTS_WITH = 2;
  const ENDS_WITH = 3;

  const m_mapNodes = new VwHashMap();
  const m_mapCanonicalIdsByNodeId = new VwHashMap();
  const m_mapSelectedNodes = new VwHashMap();

  let   m_tnRoot;

  this.getNodeIdProp = getNodeIdProp;
  this.getNodeValueProp = getNodeValueProp;
  this.setRoot = ( tnRoot ) => m_tnRoot = tnRoot;
  this.getRoot = () => m_tnRoot;
  this.addNode = addNode;
  this.getNode = getNode;
  this.getCanonicalId = ( strNodeId ) => m_mapCanonicalIdsByNodeId.get( strNodeId );
  this.getNodeById = getNodeByCanonicalId;
  this.getNodeByValue = getNodeByValue;
  this.removeNode = removeNode;
  this.updateNode = updateNode;
  this.toObjectGraph = toObjectGraph;
  this.addSelectedNode = (tnNodeSelected) => m_mapSelectedNodes.put( tnNodeSelected.getId(), tnNodeSelected );
  this.removeSelectedNode = (tnNodeSelected) => m_mapSelectedNodes.remove( tnNodeSelected.getId() );
  this.clearSelectedNodes = clearSelectedNodes;
  this.hasSelectedNodes = () => m_mapSelectedNodes.length > 0;

  // canonIdProp is required by the super class
  modelProps.fnIdProp = "getId";

  VwDataModel.call( self, modelProps );

  setup();

  function setup()
  {
    if ( nodeDataRoot )
    {
      m_tnRoot = addNode( null, nodeDataRoot, false, rootNodeProps );
    }
  } // end setup()


  /**
   * Adds tree node
   *
   *
   * @param strParentPath The xpath style parent path to the node being added
   * @param nodeData The object representing the node
   * @param nodeProps override properties for this node
   * @returns {VwTreeNode}
   */
  function addNode( strParentPath, nodeData, bIsLeafNode, nodeProps )
  {
    const strNodeId = nodeData[ modelProps.idProp ];

    let strParentCanonicalId;
    if ( strParentPath )
    {
      const strParentIdPath = VwExString.replaceAll( strParentPath, "/", "_" );

      strParentCanonicalId = strInstallId + "_" + strParentIdPath;

      // Make sure parent exists on the dom

      const parentEle = $( "[id^=" + strParentCanonicalId + "]" )[0];

      if ( !parentEle )
      {
        throw "Parent Path: " + strParentPath + " does not exist, Cannot Add NodeId: " + strNodeId;
      }

    }
    else
    {
      strParentCanonicalId = strInstallId;
    }

    const strNodeCanonicalId = strParentCanonicalId + "_" + strNodeId;

    if ( m_mapNodes.containsKey( strNodeCanonicalId ) )
     {
       throw "Duplicate Key -- Node Id: " + strNodeId + " Already Exists";
     }

    const tnNodeParent = m_mapNodes.get( strParentCanonicalId );

    const tnNode = new VwTreeNode( self, tnNodeParent, strNodeCanonicalId, nodeData, bIsLeafNode, nodeProps );

    m_mapNodes.put( strNodeCanonicalId, tnNode );
    m_mapCanonicalIdsByNodeId.put( strNodeId, strNodeCanonicalId );

    if ( tnNodeParent )  // this is the root node if parent is null
    {
      tnNodeParent.addChild( tnNode );
    }

    self.add( tnNode );

    return tnNode;
    
  }

  /**
   * Updates a nodes data/or properties
   * @param strNodePath
   * @param nodeData
   * @param nodeProps
   */
  function updateNode( strNodePath, nodeData, nodeProps )
  {
    const strCanonicalId = strInstallId + "_" + VwExString.replaceAll( strNodePath, "/", "_" );
    const tnNodeUpdate = m_mapNodes.get( strCanonicalId );

    if ( !tnNodeUpdate )
    {
      throw "Node Id: " + strNodePath + " Does Not Exist";
    }

    if ( nodeData )
    {
      tnNodeUpdate.setData( nodeData );
    }

    if ( nodeProps )
    {
      tnNodeUpdate.setProps( nodeProps );
    }

    self.update( tnNodeUpdate );

  } // end updateNode()


  /**
   * Removes the node at the specified path
   *
   * @param strNodePath the node path or a unique node id to remove
   */
  function removeNode( strNodePath )
  {
    const strNodeCanonicalPath = VwExString.replaceAll( strNodePath, "/", "_" );

    const strCanonicalId = strInstallId + "_" + strNodeCanonicalPath;

    const tnRemoveNode = m_mapNodes.remove( strCanonicalId );

    const tnRenoveNodeParent = tnRemoveNode.getParent();

    if ( tnRenoveNodeParent )
    {
      tnRenoveNodeParent.removeChild( tnRemoveNode );
    }

    self.remove( tnRemoveNode );

  }


  /**
   * Returns the treenode at the path
   *
   * @param strNodePath  The XPath node path to the node
   * @returns {*}
   */
  function getNode( strNodePath )
  {
    let strCanonicalId;
    if ( !strNodePath.startsWith( strInstallId ) )
    {
      strCanonicalId = strInstallId + "_" + VwExString.replaceAll( strNodePath, "/", "_");
    }
    else
    {
      strCanonicalId = VwExString.replaceAll( strNodePath, "/", "_");
    }

    return m_mapNodes.get( strCanonicalId );
  }

  function getNodeByCanonicalId( strCanonicalId )
  {
    return m_mapNodes.get( strCanonicalId );

  }

  /**
   * Trys to find a tree node match strSearch value. If the search value starts with a '*', the search test does an endsWith,
   * else if the search value ends with an '*" the then search test is a startsWith
   * else the search test is an exact match
   *
   * @param strSearchValue
   * @returns {*}
   */
  function getNodeByValue( strSearchValue )
  {
    let tnFound;
    const matchSet = getMatchType( strSearchValue )

    searchTree( m_tnRoot );

    return tnFound;

    function searchTree( tnNode )
    {
      const strNodeValue =  tnNode.getValue();

      if ( matchValue( matchSet.type, matchSet.searchValue, strNodeValue ) )
      {
        tnFound = tnNode
        return;

      }

      if ( tnFound )
      {
        return;

      }
      const nodeChildren = tnNode.getChildren();

      for ( const tnNodeChild of nodeChildren )
      {
        if ( tnFound )
        {
          break;
        }

        searchTree( tnNodeChild );

      } // end for()
    } // end searchTree()

  } // end getNodeByValue()

  /**
   * Gets the match type based on the presence of am '*' char in the search value
   * @param strSearchValue The serach Value
   * @returns {string[]}
   */
  function getMatchType( strSearchValue )
  {
    let nMatchType;

    if ( strSearchValue.startsWith( "*" ) )
    {
      nMatchType = ENDS_WITH;
      strSearchValue = strSearchValue.substring( 1 ); /// remove *
    }
    else
    if ( strSearchValue.endsWith( "*" ) )
    {
      nMatchType = STARTS_WITH;
      strSearchValue = strSearchValue.substring( 0, strSearchValue.length - 1 );
    }
    else
    {
      nMatchType = EXACT;

    }

    return {"type": nMatchType, "searchValue":strSearchValue };

  } // end getMatchType()


  /**
   * Math value test
   *
   * @param strSearchValue The search value
   * @param strNodeValue   The node's value
   * @returns {Boolean|boolean|*|boolean}
   */
  function matchValue( nMatchType, strSearchValue, strNodeValue )
  {

    switch ( nMatchType )
    {
      case STARTS_WITH:

        return strNodeValue.startsWith( strSearchValue );

      case ENDS_WITH:

        return strNodeValue.endsWith( strSearchValue );

      default:

        return strNodeValue == strSearchValue;

    } // end switch()

  } // end matchValue()

  function clearSelectedNodes()
  {
     for ( const selectedNode of m_mapSelectedNodes.values() )
     {
       selectedNode.setSelected( false );
     }

     m_mapSelectedNodes.clear();

  } // end clearSelectedNodes()


  /**
   * Returns the node id property that identifies a unique tree node
   * @returns {string}
   */
  function getNodeIdProp()
  {
    if ( !modelProps )
    {
      return "id";  // the default
    }

    return modelProps.idProp;

  }

  function getNodeValueProp()
  {
    if ( !modelProps )
    {
      return "value";  // the default
    }

    return modelProps.valueProp;

  }


  /**
   *  Builds an object graph hierarchy from the tree structure
   *
   */
  function toObjectGraph( style, bConvertToNativeType )
  {
    if ( !style )
    {
      style = VwXmlProcessor.ATTR_NORMAL_FORM;
    }

    const objRoot = {};
    objRoot.tagName = m_tnRoot.getName();

    buildObject( objRoot, m_tnRoot );

    function buildObject( objNode, tnNode )
    {
      if ( tnNode.getValue()  )
      {
        objNode[ tnNode.getName() ] = tnNode.getValue();
      }

      if ( tnNode.getData()  )
      {
        objNode[ tnNode.getName() ] = tnNode.getData();
      }
      else
      if ( tnNode.getAttributes() )
      {
        const aAttributes = tnNode.getAttributes();

        for ( const vwAttribute of aAttributes )
        {
          let strAttrVal = vwAttribute.getValue();

          if ( bConvertToNativeType )
          {
            strAttrVal = convertToType( strAttrVal );
          }
          objNode[ vwAttribute.getName() ] = strAttrVal;
        }
      }

      const aChildren = tnNode.getChildren();

      if ( aChildren.length > 0  )
      {
        if ( style == VwXmlProcessor.ATTR_NORMAL_FORM )
        {
          doAttrNormalForm( buildObject, objNode, aChildren );
        } // end if
        else
        {
          doEleNormalForm( buildObject, objNode, aChildren );
        }
      }

      return objNode;

    } // end buildObject()

    return objRoot;

  } // end buildObject()

  /**
   * Convert prop values defined in xml (which are all strings to natic data types
   *
   * @param propVal The xml property val
   * @return {number|*|boolean}
   */
  function convertToType( propVal )
  {
    switch( propVal )
    {
      case "true":

        return true;
        break;

      case "false":

        return false;
        break;

      default:

        if ( isNaN( propVal ))
        {
          return propVal; // This is a string, return it as is
        }

        return Number( propVal ); // return as a number

    } // end switch()

  } // end convertToType()

  /**
   * Organizes object in attribut normal for where each child is a new object
   * @param objNode
   * @param aChildren
   */
  function doAttrNormalForm( fnBuildObject, objNode, aChildren )
  {
    const bIsChildArray = areChildrenSameType( aChildren );
    let strChildName;
    if ( bIsChildArray )
    {
      strChildName = aChildren[0].getName();
      objNode[strChildName] = [];
    }

    for ( const tnNodeChild of aChildren )
    {
      strChildName = tnNodeChild.getName();
      const child = {};

      if ( bIsChildArray )
      {
        objNode[strChildName].push( child );
        fnBuildObject( child, tnNodeChild );
      }
      else
      {
        objNode[strChildName] = child;
        fnBuildObject( child, tnNodeChild );
      }

    } // end for()

  } // end doAttrNormalForm()

  function doEleNormalForm( fnBuildObject, objNode, aChildren )
  {
    const bIsChildArray = areChildrenSameType( aChildren );
    let strChildName;
    if ( bIsChildArray )
    {
      strChildName = aChildren[0].getName();
      objNode[strChildName] = [];
    }

    for ( const tnNodeChild of aChildren )
    {
      const strChildName = tnNodeChild.getName();

      if ( !tnNodeChild.hasChildren() )
      {
        objNode[strChildName] = tnNodeChild.getValue();
      }
      else
      {
        const child = {};
        if ( bIsChildArray )
        {
          objNode[strChildName].push( child );
          fnBuildObject( child, tnNodeChild );
        }
        else
        {
          fnBuildObject( child, tnNodeChild );
        }

      } // end else
    }

  } // end doEleNormalForm()

  /**
   * Determins if the children are an array of the same element or are different elements
   * @param atnNodeChildren
   * @return {boolean}
   */
  function areChildrenSameType( atnNodeChildren )
  {
    if ( atnNodeChildren.length == 1 )
    {
      return false;
    }

    let strNodeName = atnNodeChildren[0].getName() ;;

    for ( let x = 1; x < atnNodeChildren.length; x++ )
    {
      if ( atnNodeChildren[ x ].getName() != strNodeName )
      {
        return false;
      }
    }

    return true;

  } // end areChildrenSameType()

} // end VwTreeDataModel{}

VwTreeDataModel.prototype = new VwDataModel();

export default VwTreeDataModel;



