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

import VwTreeDataModel  from "../../ui/VwTree/VwTreeDataModel.js";
import VwTreeNode       from "../../ui/VwTree/VwTreeNode.js";
import VwStack          from "../VwStack/VwStack.js";
import VwXmlTokenParser from "./VwXmlTokenParser.js";

/**
 * Class to parse xml onto a VwTreeModel or an Obkect Graph
 *
 * @param strDocument A Strung contatining the XML docuemnt to parse
 * @constructor
 */
function VwXmlProcessor( strDocument, parserProps  )
{
  const m_treeModel = new VwTreeDataModel( null, null, {idProp:"id"}, null );
  const m_ParentNodeStack = new VwStack();
  const m_parserProps = configProps();

  let   m_tnRoot;
  let   m_tnParent;
  let   m_tnNode;

  this.dumpTreeToConsole = handleDumpTreeToConsole;
  this.getTreeModel = () => m_treeModel;
  this.toObjectGraph = (style) => m_treeModel.toObjectGraph( style );

  processDocument();

  function processDocument()
  {
    const xmlTokenParser = new VwXmlTokenParser( strDocument, parserProps );

    xmlTokenParser.onTagOpen( handleTagOpen );
    xmlTokenParser.onTagClose( handleTagClose );
    xmlTokenParser.onTagData( handleTagData );

    xmlTokenParser.parseDoc();
  } // end parseDocument()

  /**
   * Creates a new tag node the tree
   */
  function handleTagOpen( strTagName, aTagAttributes )
  {
    m_tnNode = new VwTreeNode( m_treeModel, m_tnParent );
    m_ParentNodeStack.push( m_tnNode );

    if ( !m_tnRoot )
    {
      m_tnRoot = m_tnNode;
      m_tnParent = m_tnRoot;
      m_treeModel.setRoot( m_tnRoot );
    }
    else
    {
      // Add the current node as a child to its parent
      m_tnParent.addChild( m_tnNode );

      m_tnParent = m_tnNode;
    }

    m_tnNode.setName( strTagName );

    if ( aTagAttributes )
    {
      m_tnNode.setAttributes( aTagAttributes );
    }

  } // end handleNewTagNode()

  function handleTagClose( strTagName )
  {
    const tnNode = m_ParentNodeStack.pop( m_tnNode );
    m_tnParent = tnNode.getParent();

  } // end handleTagClose()

  /**
   *
   * @param strTagName
   * @param strTagData
   */
  function handleTagData( strTagName, strTagData )
  {
    m_tnNode.setValue( strTagData );

  } // end handleTagCData()


  /**
   * Dupds the xml document to the console
   */
  function handleDumpTreeToConsole()
  {
    let nIndentLevel = 0;

    let tnNode = m_treeModel.getRoot();

    dumpChildren( tnNode, 0 );

    function dumpChildren( tnNode, nIndentLevel )
    {
      makeXml( tnNode, nIndentLevel );

      const aTnChildren = tnNode.getChildren();

      if ( !aTnChildren || aTnChildren.length == 0 )
      {
        return;
      }

      ++nIndentLevel;

      for ( const tnNodeChild of aTnChildren )
      {
        dumpChildren( tnNodeChild, nIndentLevel );
      }

      makeCloseTag( tnNode, --nIndentLevel );

    } // end dumpChildren()
    
  } // end handleDumpTreeToConsole()

  function makeXml( tnNode, nIndentLevel )
  {
    let strXml = makeIndentSpace( nIndentLevel );

    const strNodeName = tnNode.getName();

    strXml += "<" + strNodeName;

    const astrNodeAttributes = tnNode.getAttributes();

    if ( astrNodeAttributes )
    {
      for ( const vwAttribute of astrNodeAttributes )
      {
        strXml += " ";
        strXml += `${vwAttribute.getName()}="${vwAttribute.getValue()}"`;
      }
    }

    strXml += ">";

    const strNodeValue = tnNode.getValue();

    if ( strNodeValue )
    {
      strXml += strNodeValue;
    }

    // Add close tag if node has no children
    if ( tnNode.getChildren().length == 0  )
    {
      if ( !strXml.trim().endsWith( "/>") )
      {
        strXml += "</" + strNodeName + ">";
      }
    }

    console.log( strXml );

  } // end makeXml()


  /**
   * Makes an XML close tg=ag
   * @param tnNode
   * @param nIndentLevel
   */
  function makeCloseTag( tnNode, nIndentLevel )
  {
    let strXml = makeIndentSpace( nIndentLevel );
    const strNodeName = tnNode.getName();

    strXml += "</" + strNodeName + ">";

    console.log( strXml );

  } //makeCloseTag()

  /**
   * Make a string of spaces based on the nIndentLevel
   * @param nIndentLevel
   * @return {string}
   */
  function makeIndentSpace( nIndentLevel )
  {
    let strSpaces = "";

    const nNbrSpaces = nIndentLevel * 2;

    for ( let x = 0; x < nNbrSpaces; x++ )
    {
      strSpaces += " ";
    }

    return strSpaces;

  } // end makeIndentSpace()


  /**
   * Config default [properties
   * @return {{}}
   */
  function configProps()
  {
    const _parserProps = {};
    _parserProps.preserveValueQuotes = false;

    $.extend( _parserProps, parserProps );

    return _parserProps;

  } // end configProps()

} // end VwXmlProcessor{}

VwXmlProcessor.ATTR_NORMAL_FORM = "attrNormalForm";
VwXmlProcessor.ELEMENT_NORMAL_FORM = "eleNormalForm";

export default VwXmlProcessor;
