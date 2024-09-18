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

import VwTreeNode from "/vozzworks/ui/VwTree/VwTreeNode.js";
import VwHashMap  from "/vozzworks/util/VwHashMap/VwHashMap.js";
import {VwClass}  from   "/vozzworks/util/VwReflection/VwReflection.js";
import VwScrollBar from "/vozzworks/ui/VwScrollBar/VwScrollBar.js";

VwCssImport( "/vozzworks/ui/VwTree/style");

function VwTree( strParentId, vwTreeDataModel, treeProps )
{
  if ( arguments.length == 0 )
  {
    return;
  }

  const self = this;
  const m_mapEventListeners = new VwHashMap();

  let  m_tnRoot;
  let  m_nIndentationPerLevel = 0;
  let  m_vertScrollBar;
  let  m_nClickCount = 0;
  let  m_timeoutId;
  let  m_tnNodeSelected;
  
  this.addEventListener = addEventListener;
  this.openFolder = openFolder;
  this.closeFolder = closeFolder;
  this.resize = () =>
  {
    m_vertScrollBar.resize();
  }

  setup();

  /**
   * Init and configObject tree
   */
  function setup()
  {
    vwTreeDataModel.registerEventListener( self, handleTreeDataEvent );

    m_tnRoot = vwTreeDataModel.getRoot();

    if ( m_tnRoot )
    {
      buildNode( m_tnRoot );
    }

    m_vertScrollBar = new VwScrollBar( strParentId, {orientation:"vert"});

  } // end configObject()

  /**
   * Datamodel change event listener
   *
   * @param strEventType The eventtype
   * @param tnNode The tree node affected
   */
  function handleTreeDataEvent( strEventType, tnNode )
  {
    switch( strEventType )
    {
      case "add":

        buildNode( tnNode );
        break;

      case "del":

        removeNode( tnNode );
        break;

      case "update":

        updateNode( tnNode );
        break;

      case "clear":

        $("#" + strParentId ).empty();
        break;

    } // end switch()
    
  } // end handleTreeDataEvent()

  /**
   * Adss the event listener
   *
   * @param eventType The event type constant
   * @param eventHandler The handler
   */
  function addEventListener( eventType, eventHandler )
  {
    switch( eventType )
    {
      case VwTree.FOLDER_OPEN:
      case VwTree.FOLDER_CLOSE:
      case VwTree.ITEM_CLICKED:

        installEventListener( eventType, eventHandler );
        break;

      default:

        throw `Event Type: ${eventType} not supported`;

    }
  } // end addEventListener()

  /**
   * Install the event handler
   *
   * @param eventType
   * @param eventHandler
   */
  function installEventListener( eventType, eventHandler )
  {
    let aHandersByType = m_mapEventListeners.get( eventType );

    if ( !aHandersByType )
    {
      aHandersByType = [];
      m_mapEventListeners.put( eventType, aHandersByType );

    }

    aHandersByType.push( eventHandler );

  } // end installEventListener()


  /**
   * Builds a VwTreeNode from the users node data object and inserts it into the tree
   * @param tnNode
   */
  function buildNode( tnNode )
  {
    const nIndentationAmt = getIndentationAmt( tnNode );

    const tnNodeParent = tnNode.getParent();
    let   strNodeParentId;
    let   nodeIndentMargin;

    if ( tnNodeParent == null )
    {
      nodeIndentMargin = "0px";
    }
    else
    {
      strNodeParentId = tnNodeParent.getId();
    }

    let treeNodeProps;

    const nodeProps = tnNode.getNodeProps();
    if ( nodeProps )
    {
      treeNodeProps = configProps( nodeProps );

    }
    else
    {
      treeNodeProps = configProps( treeProps );
    }
    
    const strTreeNodeHtml = tnNode.render( nIndentationAmt, treeNodeProps );

    if ( tnNode == m_tnRoot )
    {
      $( `#${strParentId}` ).append( strTreeNodeHtml );

      $( strTreeNodeHtml ).show();

      const strRootId = m_tnRoot.getId();

      const nInitalOffsetLeft = $(`#${strRootId}` ).offset().left
      m_nIndentationPerLevel = $(`#folder_${strRootId}` ).offset().left - nInitalOffsetLeft;
    }
    else
    {
      $(`#children_${strNodeParentId}` ).append( strTreeNodeHtml );
    }

    setupNodeActions( tnNode, treeNodeProps );

    if ( treeProps && treeProps.fnPostAddNode )
    {
      treeProps.fnPostAddNode( tnNode );

    }

  } // end buildNode()

  /**
   * Setup the node actions
   *
   * @param strNodeId The canonical node id
   * @param treeNodeProps
   */
  function setupNodeActions( tnNode, treeNodeProps )
  {
    const strNodeId = tnNode.getId() ;

    $( `#${strNodeId}` ).dblclick( handleNodeClicked );

    if ( tnNode.isLeafNode() || treeNodeProps.allowFolderSelections )
    {
      $( `#${strNodeId}` ).click( (event ) => handleNodeSelected( event, treeNodeProps ));
    }
    
    $( `#expander_${strNodeId}` ).click( handleNodeClicked );

    if ( treeNodeProps.contextMenuHandler )
    {
      installContextMenuHandler( treeNodeProps.contextMenuHandler, strNodeId );
    }

    $( `#${strNodeId}` ).hover( () =>  // hover in
                                 {
                                   $( `#${strNodeId}` ).addClass( treeNodeProps.cssHoverItem );
                                 }, () => // hover out
                                 {
                                   $( `#${strNodeId}` ).removeClass( treeNodeProps.cssHoverItem )
                                 });

  } // end setupNodeActions()


  /**
   * Instalss a contentMenu handler for right clicks on tree nodes
   *
   * @param strContextMenuHandler The module js file or function name (if non module)
   *
   * @param strNodeId The cananical node id the context will be triggered on
   * @returns {Promise<void>}
   */
  async function installContextMenuHandler( strContextMenuHandler, strNodeId )
  {
    let classMenuHandler;

    if ( strContextMenuHandler.endsWith( ".js" ) )
    {
      classMenuHandler = await VwClass.forModule( strContextMenuHandler );

    }
    else
    {
      classMenuHandler =  VwClass.forName( strContextMenuHandler );

    }

    const constructor = classMenuHandler.getConstructor();

    const handleInstance = constructor.newInstance();

    const method = classMenuHandler.getPublicMethod( "showContextMenu")

    $(`#${strNodeId}` )[0].addEventListener( "contextmenu", ( e ) =>
    {
      e.preventDefault();
      method.invoke( handleInstance, [e] );
    });

  }

  /**
   * Removes the node from the tree
   *
   * @param tnNode The VwTreeNode instance to remove
   */
  function removeNode( tnNode )
  {
    const strCanonicalId = tnNode.getId();
    $(`#${strCanonicalId}`).remove();

  }


  function updateNode( tnNode )
  {
    const strCanonicalId = tnNode.getId();
    const strParentId = $(`#${strCanonicalId}` ).parent().attr( "id");

    $(`#${strCanonicalId}` ).remove();

    const nodeProps = getNodeProps( tnNode );

    const nIndentationAmt = getIndentationAmt( tnNode );

    const strNodeHtml =  tnNode.render( nIndentationAmt, nodeProps, true );

    $( strNodeHtml ).prependTo( `#${strParentId}` );

    setupNodeActions( tnNode, nodeProps );
    

  } // end updateNide()

  /**
   * gets the indentaion amt for the new node pased on its parentage from the root
   * @param tnNode The node to inspect
   *
   * @returns {number}
   */
  function getIndentationAmt( tnNode )
  {
    let nIndentationLevel = 0;

    let tnNodeParent = tnNode.getParent() ;

    while( tnNodeParent )
    {
      ++nIndentationLevel;
      tnNodeParent = tnNodeParent.getParent();
    }

    return (nIndentationLevel * m_nIndentationPerLevel) + "px";

  } // end getIndentationAmt()


  /**
   * Node open/close handler
   * @param event
   * @returns {boolean}
   */
  function handleNodeClicked( event )
  {
    event.stopPropagation();

    let strNodeId = event.currentTarget.id;

    if ( strNodeId.startsWith( "expander"))
    {
      let nPos = strNodeId.indexOf( "_" );

      if ( nPos )
      {
        strNodeId = strNodeId.substring( ++nPos );
      }
    }

    const nodeClicked = vwTreeDataModel.getNode( strNodeId );
    const nodeProps = getNodeProps( nodeClicked );

     if ( $(`#expander_${strNodeId}` ).hasClass( "VwArrowRight") )
    {
      openNodeFolder( nodeClicked, nodeProps );
    }
    else
    {
      closeNodeFolder( nodeClicked, nodeProps );
    }

    return false;

  } // end handleNodeClicked()

  /**
   * Returns the node properties which will be eiter override props for a node or the treeProps specified for the tree
   *
   * @param thNode The tree node to get the properties for
   * @returns {*}
   */
  function getNodeProps( tnNode )
  {
    let nodeTreeProps = tnNode.getNodeProps();

    if ( !nodeTreeProps )
    {
      nodeTreeProps = treeProps
    }

    return configProps( nodeTreeProps );

  } // end  getNodeProps( thNode )

  function openFolder( strId )
  {
    const tnNodeFolder = vwTreeDataModel.getNode( strId );

    if ( !tnNodeFolder )
    {
      throw `Cannot openFolder: Folder id => ${strId} does not exist`;
    }

    const nodeProps = getNodeProps( tnNodeFolder );

    openNodeFolder( tnNodeFolder, nodeProps );

    let parentNode = tnNodeFolder.getParent();

    // Now we also have to open up the parents as well
    while( parentNode )
    {
      treeProps = getNodeProps( tnNodeFolder );
      openNodeFolder( parentNode, treeProps );

      parentNode = parentNode.getParent();
    } // end while()

  } // end openFolder()


  function closeFolder( strId )
  {
    const tnNodeFolder = treeDataModel.getId( strId );

    if ( !tnNodeFolder )
    {
      throw `Cannot closeFolder: Folder id => ${strId} does not exist`;
    }

    const nodeProps = getNodeProps( tnNodeFolder );

    closeNodeFolder( tnNodeFolder, nodeProps );


  } // end closeFolder()


  /**
   * Opens the folder by the specified node id
   *
   * @param strNodeId The id of the folder to open
   */
  function openNodeFolder( tnNodeClicked, treeNodeProps )
  {
    const strNodeId = tnNodeClicked.getId();

    if ( m_mapEventListeners.containsKey( VwTree.FOLDER_OPEN ) )
    {
      fireEvent( VwTree.FOLDER_OPEN, tnNodeClicked.getData() );
    }

    $(`#expander_${strNodeId}` ).removeClass( "VwArrowRight" );
    $(`#expander_${strNodeId}` ).addClass( "VwArrowDown" );
    $(`#expander_${strNodeId}` ).attr( "src", treeNodeProps.folderOpenImg );
    $(`#children_${strNodeId}` ).show();

    m_vertScrollBar.resize();

  } // end openNodeFolder()


  /**
   * Close the folder by the specified node id
   *
   * @param strNodeId The id of the folder to
   */
  function closeNodeFolder( tnNodeClicked, treeNodeProps  )
  {
    const strNodeId = tnNodeClicked.getId();

    if ( m_mapEventListeners.containsKey( VwTree.FOLDER_CLOSE ) )
    {
      fireEvent( VwTree.FOLDER_CLOSE, tnNodeClicked .getData() );
    }

    $(`#expander_${strNodeId}` ).removeClass( "VwArrowDown" );
    $(`#expander_${strNodeId}` ).addClass( "VwArrowRight" );

    $(`#expander_${strNodeId}` ).attr( "src", treeNodeProps.folderCloseImg );

    $(`#children_${strNodeId}` ).hide();

    m_vertScrollBar.resize();

  } // end closeNodeFolder()


  /**
   * Node was selected
   * @param event
   */
  function handleNodeSelected( event, treeNodeProps  )
  {

    if ( !m_mapEventListeners.containsKey( VwTree.ITEM_CLICKED) )
    {
      return;
    }

    event.stopPropagation();

    let strNodeId = event.currentTarget.id;

    const nodeClicked = vwTreeDataModel.getNode( strNodeId );

    if ( treeNodeProps.toggleSelection )
    {
      nodeClicked.setSelected( !nodeClicked.isSelected() );
    }
    else
    {
      nodeClicked.setSelected( true );
    }

    // If not mult selection unselected the previously selected node
    if ( !treeProps.allowMultSelections && nodeClicked.isSelected() )
    {
      if ( m_tnNodeSelected && m_tnNodeSelected.getId() != nodeClicked.getId() )
      {
        m_tnNodeSelected.setSelected( false );
      }

      m_tnNodeSelected = nodeClicked;
    }

    // the following logic dtermins if this was a single or double click. we only want a single click
    ++m_nClickCount;

    m_timeoutId = setTimeout( () =>
    {

      if ( m_nClickCount > 1 )  // THis was really a double click -- don't process
      {
        m_nClickCount = 0;
        clearTimeout( m_timeoutId);
        return;
      }

      m_nClickCount = 0;
      clearTimeout( m_timeoutId);

      m_timeoutId = null;

      fireEvent(VwTree.ITEM_CLICKED, nodeClicked );
      
    }, 175 );

  } // end handleNodeSelected()

  /**
   * Fires event to all regeistered listeners
   *
   * @param eventType The event type to fire
   */
  function fireEvent( eventType, nodeData )
  {
    const aEventHandlers = m_mapEventListeners.get( eventType );

    for ( const eventHandler of aEventHandlers )
    {
      eventHandler.call( self, eventType, nodeData );
    }

  } // end fireEvent()


  /**
   * Config the tree properties
   * @returns {{}}
   */
  function configProps( props )
  {
    const _props = {};

    _props.folderOpenImg = "/vozzworks/ui/VwTree/images/vw_black_arrow_down.png";
    _props.folderCloseImg = "/vozzworks/ui/VwTree/images/vw_black_arrow_right.png";
    _props.folderImg = "/vozzworks/ui/VwTree/images/vw_folder_blue.png";
    _props.cssTreeNode = "VwTreeNode";
    _props.cssTreeLeafNode = "VwTreeLeafNode";
    _props.cssNodeExpanderImg = "VwExpanderImg";
    _props.cssNodeFolderImg= "VwFolderImg";
    _props.cssNodeValue = "VwFolderText";
    _props.cssNodeChildren = "VwTreeChildren";
    _props.cssHoverItem = "VwHoverItem";
    _props.cssSelectedItem = "VwSelectedItem";

    $.extend( _props, props );

    return _props;
    
  } // end configProps()

} // end VwTree{}

VwTree.FOLDER_OPEN = "vwFolderOpen";
VwTree.FOLDER_CLOSE = "vwFolderClosed";
VwTree.ITEM_CLICKED = "vwItemClicked";

export default VwTree;