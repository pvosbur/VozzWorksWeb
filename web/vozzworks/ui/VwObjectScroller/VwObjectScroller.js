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
 * ============================================================================================
 *
 */

import VwButton from "/vozzworks/ui/VwButton/VwButton.js";

VwCssImport( "/vozzworks/ui/VwObjectScroller/style");

/**
 * Class that creates a text scroller widget. It consists of left and right arrows with content in the middle
 *
 * @param strParentId The id of the parent html element where the scroller html will be generated
 * @param scrollerProps optional configuration properties. Allowed values are:
 *        <br>cssArrowImg:String - Optional - - Css for the left and right scroll image default:"VwScrollerArrowImg";
 *        <br>cssTextContent:String - Optional - Css for the Text content. Default:"VwScrollerContent";
 *        <br>wrapAround:String -  Optional - true to  allow wrap around, false to stop. If false, the outOfRange Handler if defined will be invoked
 *        <br>urlLeftArrowImg:String - Optional - Url to the left arrow image. Default:"vozzworks/ui/images/vw_black_arrow_left.png";
 *        <br>urlRightArrowImg:String - Optional - Url to the right arrow image. Default: "vozzworks/ui/images/vw_black_arrow_right.png";
 *        <br>dataIdProp:String - Optional - the name of the property in the object that will be used to display the content if the object is not a string type.
 *        <br>textWidth:String -  Optional A valid css metric ie.e px, em, pt  %  for thr with of the text to be display, default will find the widest data element + a 5px margin
 *
 * @param aObjectsToScroll Required- The array of objects to scroll.
 * @constructor
 */
function VwObjectScroller( strParentId, scrollerProps, aObjectsToScroll )
{
  const m_scrollerProps = configProps();
  const m_afnContentEventHandlers = [];
  const ID_BASE = strParentId + "_";
  const ID_CONTAINER = ID_BASE + "scrollContainer";
  const ID_CONTENT = ID_BASE + "content";
  const ID_SCROLL_LEFT = ID_BASE + "leftArrow";
  const ID_SCROLL_RIGHT = ID_BASE + "rightArrow";

  let   m_btnLeftArrow;
  let   m_btnRightArrow;
  let m_nContentNdx = 0;
  let m_fnOutOfRangeEventHandler;
  let m_fnAboutToDisplayEventHandler;

  // Public methods;
  this.setDataIndex = setDataIndex;
  this.getSelectedIndex = getSelectedIndex;
  this.getSelectedObject = getSelectedObject;
  this.addAboutToDisplayEvent = addAboutToDisplayEvent;
  this.addContentChangeEvent = addContentChangeEvent;
  this.outOfRangeEvent = outOfRangeEvent;

  configObject();
  showContent();


  /**
   * Constructor impl
   */
  function configObject()
  {
    const strScrollerHtml =
          `<div id="${ID_CONTAINER}" class="${m_scrollerProps.cssScrollerContainer}">
             <div id="${ID_SCROLL_LEFT}" class=""></div>
             <div id="${ID_CONTENT}" class="${m_scrollerProps.cssTextContent}"></div>
             <div id="${ID_SCROLL_RIGHT}"></div>
           </div>`;

    $( `#${strParentId}` ).append( strScrollerHtml  );

    setupScrollerArrowBtns();

  } // end configObject()


  /**
   * Sets the current data index to display
   * @param ndx The index of the data arror to display
   */
  function setDataIndex( ndx )
  {
    m_nContentNdx = ndx;
    showContent();

    fireEventHandlers();

  } // end setDataIndex()


  /**
   * Config jquery arrow click actions
   */
  function setupScrollerArrowBtns()
  {
    const btnProps = {};
    btnProps.toolTipMgr = m_scrollerProps.toolTipMgr;

    btnProps.hideTipsOnClick = true;
    btnProps.cssButtonImg = m_scrollerProps.cssButtonImg;

    let btn = {};
    btn.id = ID_SCROLL_LEFT;
    btn.img = m_scrollerProps.urlLeftArrowImg;
    btn.tooltip = m_scrollerProps.leftArrowTooltip;

    m_btnLeftArrow = new VwButton( ID_SCROLL_LEFT, btn, btnProps  );

    m_btnLeftArrow.onClick( () => scrollContent( -1 ));

    btn = {};
    btn.id = ID_SCROLL_RIGHT;
    btn.img = m_scrollerProps.urlRightArrowImg;
    btn.tooltip = m_scrollerProps.rightArrowTooltip;

    m_btnRightArrow = new VwButton( ID_SCROLL_RIGHT, btn, btnProps  );

    m_btnRightArrow.onClick( () => scrollContent( 1 ));

   } // end setupScrollerArrowBtns()


  /**
   * Scroll the text content
   * @param nDir The direction indicator 1 = next value, -1 = previous value
   */
  function scrollContent( nDir )
  {
    m_nContentNdx += nDir;

    if ( m_nContentNdx == aObjectsToScroll.length )
    {
      if ( m_scrollerProps.wrapAround )
      {
        m_nContentNdx = 0;
      }
      else
      {
        if ( m_fnOutOfRangeEventHandler )
        {
          m_nContentNdx = m_fnOutOfRangeEventHandler( m_nContentNdx );
        }
        else
        {
          --m_nContentNdx; // set back to end of array
        }
      }
    }
    else
    {
      if ( m_nContentNdx < 0 )
      {
        if ( m_scrollerProps.wrapAround )
        {
          m_nContentNdx = aObjectsToScroll.length - 1; // set index to end
        }
        else
        {
          if ( m_fnOutOfRangeEventHandler )
          {
            m_nContentNdx = m_fnOutOfRangeEventHandler( m_nContentNdx );
          }
          else
          {
            m_nContentNdx = 0; // set back to beginning of array
          }
        }

      }
    } // end if

    showContent();

    fireEventHandlers();

  } // end scrollContent()


  /**
   * Shows the content and the index location
   *
   */
  function showContent()
  {
    if ( m_fnAboutToDisplayEventHandler )
    {
      m_fnAboutToDisplayEventHandler( m_nContentNdx );

    }

    let objTextToShow = aObjectsToScroll[m_nContentNdx];

    // See if this is not a plain string object
    if ( m_scrollerProps.idDisplay )
    {
      objTextToShow = objTextToShow[m_scrollerProps.idDisplay];

    }

    $( `#${ID_CONTENT}` ).html( objTextToShow );

  } // end showContent()

  /**
   * Call any defined event handlers
   */
  function fireEventHandlers()
  {
    for ( const afnContentEventHandler of  m_afnContentEventHandlers )
    {
      afnContentEventHandler( m_nContentNdx );
    }

  } // end fireEventHandlers()

  /**
   * Return the selected index
   * @returns {number}
   */
  function getSelectedIndex()
  {
    return m_nContentNdx;

  } // end getSelectedIndex()

  /**
   * Return the selected object
   * @returns {*}
   */
  function getSelectedObject()
  {
    return aObjectsToScroll[m_nContentNdx];

  } // end getSelectedObject()

  /**
   * Calls event handler before its about to display it to allow for dynamic content changes
   *
   * @param fnAboutToDisplayEventHandler
   */
  function addAboutToDisplayEvent( fnAboutToDisplayEventHandler )
  {
    m_fnAboutToDisplayEventHandler = fnAboutToDisplayEventHandler;

  } // end addAboutToDisplayEvent()


  /**
   * Calls handler when the left or right scroll array is clicked and passes the index of the current display object
   * @param fnContentEventHandler
   */
  function addContentChangeEvent( fnContentEventHandler )
  {
    m_afnContentEventHandlers.push( fnContentEventHandler );

  } // end addContentChangeEvent()

  /**
   * Invokes the call back handler when the sxcroll index goes out of range. the wrapAround property is set to false when
   * this event handler is defined
   * @param fnOutOfRangeEventHandler
   */
  function outOfRangeEvent( fnOutOfRangeEventHandler )
  {
    m_fnOutOfRangeEventHandler = fnOutOfRangeEventHandler;
    m_scrollerProps.wrapAround = false;

  } // end outOfRangeEvent()

  /**
   * Config text scr5oller props
   */
  function configProps()
  {
    const props = {};

    props.cssButtonImg = "VwScrollerArrowImg";
    props.cssTextContent = "VwScrollerContent";
    props.cssScrollerContainer = "VwScrollerContainer";
    props.wrapAround = true;
    props.urlLeftArrowImg = "/vozzworks/ui/images/vw_black_arrow_left.png";
    props.urlRightArrowImg = "/vozzworks/ui/images/vw_black_arrow_right.png";

    $.extend( props, scrollerProps );

    return props;

  } // end configProps()

} // end VwObjectScroller {}

export default VwObjectScroller;