/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   2019-08-22

 Time Generated:   08:03

 ============================================================================================
 */
import VwDialogBox from "/vozzworks/ui/VwDialogBox/VwDialogBox.js";
import VwExString from "/vozzworks/util/VwExString/VwExString.js";
import VwPromiseMgr from "/vozzworks/util/VwPromiseMgr/VwPromiseMgr.js";

function VwDialogMgr( strId, contentHandler, props )
{
  if ( arguments.length == 0 )
  {
    return;  // Prootoyp inheritance call
  }

  const self = this;

  let m_dialogBox;
  let m_defaultPosition;
  let m_promiseMgr;

  this.setDefaultPosition = setDefaultPosition;
  this.getDefaultPosition = getDefaultPosition;


  /**
  * Setup and install modeless floatable dialog
  */
  async function configObject()
  {

    checkContentHandlerImplRequirements();

    const strHtml = contentHandler.render();

    const dialogProps = {};
    dialogProps.title = contentHandler.getTitle();
    dialogProps.dragElementId = strId;
    dialogProps.closeCallback = handleDialogClose;

    $.extend( dialogProps, props );

    if ( props && props.customHdrHtml )
    {
      dialogProps.customHdrHtml = VwExString.expandMacros( props.customHdrHtml, dialogProps );

    }

    if ( contentHandler.resizable )
    {
      dialogProps.resizable = contentHandler.resizable();
    }

    m_dialogBox = await VwDialogBox.call( self, strHtml, dialogProps );
    contentHandler.contentApplied( self );

    if ( contentHandler.getInitialPosCoords )
    {
      m_defaultPosition = contentHandler.getInitialPosCoords();

    }

    m_promiseMgr.success( self );

  } // end configObject()


  function setDefaultPosition( x, y )
  {
    m_defaultPosition = {};
    m_defaultPosition.x = x;
    m_defaultPosition.y = y;

    self.move( x, y );

  }

  function getDefaultPosition()
  {
    return m_defaultPosition;
  }


  /**
   * Calls contentHandlers' close method if defined
   */
  function handleDialogClose()
  {

    if ( contentHandler.close )
    {
      contentHandler.close( true );
    }

  } // end handleDialogClose()



  /**
   * Check to make sure contentHandler instance implements the following properties
   */
  function checkContentHandlerImplRequirements()
  {
    if ( !contentHandler.getTitle )
    {
       throw "Content Handler must implement the getTitle() property";
    }

    if ( !contentHandler.render )
    {
       throw "Content Handler must implement the render() property";
    }

    if ( !contentHandler.contentApplied )
    {
       throw "Content Handler must implement the contentAppiled() method";
    }
  }

  return new Promise( (success, fail ) =>
                      {
                        m_promiseMgr = new VwPromiseMgr( success, fail, configObject );

                      }); // end Promise()

} // end class VwDialogMgr{}

VwDialogBox.prototype = new VwDialogMgr();

export default VwDialogMgr;

