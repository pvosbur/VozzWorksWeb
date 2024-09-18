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
 *  ============================================================================================
 * /
 */

import VwHashMap from "/vozzworks/util/VwHashMap/VwHashMap.js";

/**
 * This class manages the html5 drag abd drop api
 *
 * @param dndProps the properties
 * @constructor
 */
function VwDragNDropMgr( dndProps )
{
  const m_mapDropZoneItemIds = new VwHashMap();
  const m_mapDragableItemIds = new VwHashMap();

  let   m_elementDragged;
  let   m_bNoDrop = false;
  let   m_strElementId;

  this.addDropZoneId = handleAddDropZoneId;
  this.removeDropZoneId = handleRemoveDropZoneId;
  this.addDragableItemId = handleAddDragableItemId;
  this.removeItem = removeEventListeners;
  this.installDragDrop = installDragDrop;
  this.disable = handleDisable;
  this.enable = handleEnable;
  this.close = handleDisable;
  this.updateProps = (dndPropsToUpdate) => $.extend(dndProps, dndPropsToUpdate );

  function handleEnable()
  {
    installDragDrop(m_strElementId);
  }

  /**
   * Reoves all drag n drop event listeners
   */
  function handleDisable()
  {
    for ( const strItemId of m_mapDragableItemIds )
    {
      removeEventListeners( strItemId );
    }

    for ( const strItemId of m_mapDropZoneItemIds )
    {
      removeEventListeners( strItemId );
    }

  } // end handleDisable()


  /**
   * Removes event listeners for the item id
   * @param strItemId
   */
  function removeEventListeners( strItemId )
  {
    const itemEle = $(`#${strItemId}`)[0];

    itemEle.removeEventListener( "drop", handleDropEvent );
    itemEle.removeEventListener( "dragstart", handleDragStart );
    itemEle.removeEventListener( "dragover",handleItemDragOverEvent);
    itemEle.removeEventListener( "dragenter",handleItemDragEnter);
    itemEle.removeEventListener( "dragleave",handleItemDragLeave);
    itemEle.removeEventListener( "dragend",handleItemDragEnd);

  } // end removeEventListeners(

  /**
   * Adds an dom id of an allowable drop zone
   *
   * @param strDropZoneId The id of the allowable drop zone
   */
  function handleAddDropZoneId( strDropZoneId )
  {
    if ( m_mapDropZoneItemIds.containsKey( strDropZoneId))
    {
      return;
    }

    m_mapDropZoneItemIds.put( strDropZoneId, null );

    const itemDropEle = $(`#${strDropZoneId}`)[0];

    itemDropEle.addEventListener( "drop", handleDropEvent, false );

    itemDropEle.addEventListener( "dragover", handleItemDragOverEvent, false );
    itemDropEle.addEventListener( "dragenter", handleItemDragEnter, false );
    itemDropEle.addEventListener( "dragleave", handleItemDragLeave, false );
    itemDropEle.addEventListener( "dragend", handleItemDragEnd, false );

  } // end handleAddDropZoneId()

  function handleRemoveDropZoneId( strDropZoneId )
  {
    m_mapDropZoneItemIds.remove( strDropZoneId );
    removeEventListeners( strDropZoneId );

  } // end handleAddDropZoneId()

  /**
   * Adds a draggable item id
   *
   * @param strDragableItemId the id of the dragable item
   */
  function handleAddDragableItemId( strDragableItemId )
  {
    m_mapDragableItemIds.put( strDragableItemId, null );

    const itemEle = $(`#${strDragableItemId}`)[0];

    $(itemEle).attr( "draggable", "true" );

    itemEle.addEventListener( "dragstart", handleDragStart, false );
    itemEle.addEventListener( "dragover", handleItemDragOverEvent, false );
    itemEle.addEventListener( "dragenter", handleItemDragEnter, false );
    itemEle.addEventListener( "dragleave", handleItemDragLeave, false );
    itemEle.addEventListener( "dragend", handleItemDragEnd, false );

  } // end addDragableItemId()

  /**
   * Instals the drag and drop for the ids specified
   *
   * @param strDragableItemId If set, the id of a dragable item
   * @param strDropZoneItemId if set id of a drop zone
   */
  function installDragDrop( strDragableItemId, strDropZoneItemId )
  {
    if ( strDragableItemId )
    {
      handleAddDragableItemId( strDragableItemId );
    }

    if ( strDropZoneItemId )
    {
      handleAddDropZoneId( strDropZoneItemId );
    }

  } // end installDragDrop()


  /**
   * Dragstart callback
   * @param ev
   */
  async function handleDragStart( ev )
  {
    const strDragEleId = ev.currentTarget.id;

    ev.target.origId = strDragEleId;

    let objToDrag;

    let strSerialized;

    if ( objToDrag )
    {
      strSerialized = JSON.stringify( objToDrag );
    }
    else
    {
      strSerialized = strDragEleId;
    }

    m_elementDragged = $( `#${strDragEleId}`  )[0];

    ev.dataTransfer.setData( dndProps.dataTransferType, strSerialized );

    ev.dataTransfer.effectAllowed = dndProps.dragType;
    ev.dataTransfer.dropEffect = dndProps.dragType;


    if ( dndProps.onDragStart )
    {
      await dndProps.onDragStart( ev, strDragEleId );
    }

    if ( dndProps.imgUrlOnDrag )
    {
      const img = new Image();
      img.src = dndProps.imgUrlOnDrag;
      ev.dataTransfer.setDragImage(img, 10, 10);

    }
  } // end handleDragStart()


  /**
   * item drag over event.. Determins if item is a valid drop zone
   * @param ev
   * @returns {boolean}
   */
  function handleItemDragOverEvent( ev )
  {
    m_bNoDrop = !m_mapDropZoneItemIds.containsKey( ev.currentTarget.id );

    if ( m_bNoDrop )
    {
      return;
    }

    if ( dndProps.isValidDropZone &&  !dndProps.isValidDropZone( ev.currentTarget.id ))
    {
      m_bNoDrop = true;
      return;
    }

    m_bNoDrop = false;

    if ( dndProps.cssItemDragEnter )
    {
      $(`#${ev.currentTarget.id}` ).addClass( dndProps.cssItemDragEnter );
    }

    ev.dataTransfer.effectAllowed = dndProps.dragType;
    ev.dataTransfer.dropEffect = dndProps.dragType;

    ev.preventDefault();

    if ( dndProps.onDragOver )
    {
      dndProps.onDragOver( ev.currentTarget.id );
    }

    return false;

  } // end handleItemDragOverEvent()


  /**
   *
   * @param ev
   * @returns {boolean}
   */
  function handleItemDragEnter( ev )
  {
    // don't show enter feedback when over self

    if ( dndProps.isValidDropZone &&  !dndProps.isValidDropZone( ev.currentTarget.id ))
    {
      m_bNoDrop = true;
      return;
    }

    if ( dndProps.cssItemDragEnter  )
    {
      $(`#${ev.currentTarget.id}` ).addClass( dndProps.cssItemDragEnter );
    }

    ev.dataTransfer.effectAllowed = dndProps.dragType;
    ev.dataTransfer.dropEffect = dndProps.dragType;

    if ( dndProps.onDragEnter )
    {
      dndProps.onDragEnter( ev.currentTarget.id );
    }

    return false;

  } // end handleItemDragEnter()


  /**
   * Drag leave handler. Does css fixups
   * @param ev
   * @return {boolean}
   */
  function handleItemDragLeave( ev )
  {
    this.style.opacity = "";

    if ( dndProps.cssItemDragEnter  )
    {
      $(`#${ev.currentTarget.id}` ).removeClass( dndProps.cssItemDragEnter );
    }

    if ( dndProps.onDragLeave )
    {
      dndProps.onDragLeave( ev.currentTarget.id );
    }

    return false;

  } // end handleItemDragLeave()

  /**
   * Drop event handler
   * @param ev
   */
  function handleDropEvent( ev )
  {
    ev.preventDefault();
    ev.stopImmediatePropagation();

    this.style.opacity = "";

    if ( dndProps.cssContainerDragEnter )
    {
      $( `.${dndProps.cssContainerDragEnter}` ).removeClass( dndProps.cssContainerDragEnter );

    }

    if ( dndProps.cssItemDragEnter )
    {
      $( `.${dndProps.cssItemDragEnter}` ).removeClass( dndProps.cssItemDragEnter );
    }

    if ( m_bNoDrop )
    {
      return;
    }

    let dropData;

    const strTransferType = findDataTransferType( ev.dataTransfer.types );

    switch ( strTransferType )
    {
      case "Files":

           dropData = ev.dataTransfer.files;

           break;

      case dndProps.dataTransferType:

           dropData = ev.dataTransfer.getData( dndProps.dataTransferType );

           // see if this is JSON, will throw exception if the data is just a string id
           try
           {
            dropData = JSON.parse( dropData );
           }
           catch ( err )
           {

           }

           break;


      default:

        dropData = ev.dataTransfer.getData( dndProps.dataTransferType );

        break;


    }  // end switch


    if ( dndProps.onDragDrop )
    {
      dndProps.onDragDrop( ev.currentTarget.id, dropData );

    }

  } // end handleDropEvent()


  /**
   * Drag end handler. does css fix ups
   * @param ev
   * @return {boolean}
   */
  function handleItemDragEnd( ev )
  {

    if ( dndProps.cssContainerDragEnter )
    {
      $(`#${ev.currentTarget.id}` ).removeClass( dndProps.cssContainerDragEnter );
    }

    if ( dndProps.onDragEnd )
    {
      dndProps.onDragEnd();

    }

    return false;

  } // end handleItemDragEnd()

  /**
   * Finds the specific transfer type  from a drop event
   * @param astrTransferTypes
   * @returns {*}
   */
  function findDataTransferType( astrTransferTypes )
  {
    for ( const strTransferType of  astrTransferTypes )
    {
      if ( strTransferType == dndProps.dataTransferType )
      {
        return strTransferType;
      }
    }

    return null;

  } // end findDataTransferType()


} // end VwDragNDropMgr{}

export default VwDragNDropMgr;