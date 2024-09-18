/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2017 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 *  ============================================================================================
 *
 */
/**
 * This class moves an object within in its container and provides position furening the move
 *
 * @param strObjectToMoveId The id of the object to be moved
 * @constructor
 */
function VwMouseObjectMover( strObjectToMoveId )
{

  let m_offsetObject;
  let m_nStartXPos;
  let m_nStartYPos;
  let m_nObjectToMoveWidth;
  let m_nObjectToMoveHeight;
  let m_nContainerWidth;
  let m_nContainerHeight;
  let m_fnOnMouseMove;
  let m_fnOnMouseUp;

  this.onMouseMove = ( fnOnMouseMove ) => m_fnOnMouseMove = fnOnMouseMove;
  this.onMouseUp = ( fnOnMouseUp ) => m_fnOnMouseUp = fnOnMouseUp;

  configObject();

  /**
   * Setup the object
   */
  function configObject()
  {
    m_nObjectToMoveWidth = $(`#${strObjectToMoveId}` ).width();
    m_nObjectToMoveHeight = $(`#${strObjectToMoveId}` ).height();

    m_nContainerWidth = $(`#${strObjectToMoveId}` ).width();
    m_nContainerHeight = $(`#${strObjectToMoveId}` ).height();

    setupActions();

  } // end configObject()

  /**
   * Install mouse down axtion handler
   */
  function setupActions()
  {
    $(`#${strObjectToMoveId}`)[0].addEventListener( "mousedown", handleObjectToMoveMouseDown );

  } // end setupActions()


  /**
   * Mouse down event for the object to move
   * @param event
   */
  function handleObjectToMoveMouseDown( event )
  {
    m_nStartXPos = getXPos( event );
    m_nStartYPos = getYPos( event );

    $( window ).unbind( "mouseup", handleObjectToMoveMouseUp ).bind( "mouseup", handleObjectToMoveMouseUp ).bind( "mousemove", handleObjectToMoveMouseMove );

  } // end handleObjectToMoveMouseDown()


  /**
   * MouseMove handler
   * @param event
   */
  function handleObjectToMoveMouseMove( event )
  {
    event.stopImmediatePropagation();

    const nXPos = getXPos( event );
    const nYPos = getYPos( event );

    const nXIncrement = nXPos - m_nStartXPos;
    const nYIncrement = nYPos - m_nStartYPos;


    $(`#${strObjectToMoveId}` ).css( "left", nXIncrement );
    $(`#${strObjectToMoveId}` ).css( "top", nYIncrement );

    if ( m_fnOnMouseMove )
    {
      m_fnOnMouseMove( $(`#${strObjectToMoveId}` ).css( "left"), $(`#${strObjectToMoveId}` ).css( "top"));
    }

  } // end handleObjectToMoveMouseMove()

  /**
   * Mouseup handler
   * @param event
   */
  function handleObjectToMoveMouseUp( event )
  {
    event.stopImmediatePropagation();
    
    $( window ).unbind( "mouseup", handleObjectToMoveMouseUp ).unbind( "mousemove", handleObjectToMoveMouseMove );

    if ( m_fnOnMouseUp )
    {
      m_fnOnMouseUp( $(`#${strObjectToMoveId}` ).css( "left"), $(`#${strObjectToMoveId}` ).css( "top") );
    }

  } // end handleObjectToMoveMouseUp()


  /**
   * Gets the mouse Y pos offset within the slider container
   * @param event
   * @returns {number}
   */
  function getYPos( event )
  {
    if ( !m_offsetObject )
    {
      m_offsetObject = $(`#${strObjectToMoveId}` ).offset();
    }

    return event.clientY - m_offsetObject.top;

  } // end getYPos()

  /**
   * Gets the mouse X pos offset within the slider container
   * @param event
   * @returns {number}
   */
  function getXPos( event )
  {
    if ( !m_offsetObject )
    {
      m_offsetObject = $(`#${strObjectToMoveId}` ).offset();
    }

    return event.clientX - m_offsetObject.left;

  } // end getXPos()

} // end VwMouseObjectMover{}

export default VwMouseObjectMover;