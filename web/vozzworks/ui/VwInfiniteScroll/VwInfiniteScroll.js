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

/**
 * This object installs an infinate scroll handler where your callback will load blocks of data until its finished.
 * The more element call back handler must return the actual number of elements loaded
 *
 * @param strElementToScrollId This is the id of the data container
 * @param nItemHeight This is ithe height of the child data container element. It may be null and will be computed when this plug is attached after the initial
 * block of elements have been loaded
 * @param fnMoreElementCB The more elements claaback handler. MUST return the actual number of elements loaded
 *
 * @constructor
 */
function VwInfiniteScroll( strElementToScrollId, scrollBar, nItemHeight, fnMoreElementCB )
{
  const self = this;

  let m_nElementToScrollHeight = $("#" + strElementToScrollId ).height();
  let m_nScrollContainerHeight = $("#" + strElementToScrollId ).parent().height();
  let m_nPrevScrollHeight;
  let m_nItemHeight = nItemHeight;

  let m_nItemsInView;

  // Public Methods

  this.onScroll = onScroll;

  setup();


  /**
   * Setup scroll metrics
   */
  function setup()
  {

    if ( !m_nItemHeight )
    {
      const childElements = $( "#" + strElementToScrollId ).children();

      for ( let x = 0; x < childElements.length; x++ )
      {
        const strClass = $(childElements[x] ).attr( "class");

        if ( strClass && (strClass.indexOf( "VwVertScroll") >= 0  || strClass.indexOf( "VwHorzScroll") >+ 0 ) )
        {
          continue;
        }
        else
        {
          m_nItemHeight = $( childElements[ x ] ).height()
          break;
        }

      } // end for()

      if ( !m_nItemHeight )
      {
        throw "No Item height was specified and the scroll container did not ha any items in it to get its height from";
      }
    }

    m_nItemsInView = m_nScrollContainerHeight / m_nItemHeight;

    scrollBar.addScrollListener( self );

  }

  function onScroll( nThumbPos )
  {
    const nTrigger = Math.round(nThumbPos + (Math.round( m_nItemsInView * m_nItemHeight )) );

    if ( nTrigger >= m_nElementToScrollHeight && nTrigger != m_nPrevScrollHeight )
    {
      m_nPrevScrollHeight = m_nElementToScrollHeight ;

      //console.log( "Infinate Scroll Trigger Hit: " + m_nElementToScrollHeight );
      doCallbackTrigger();
    }

  } // end


  /**
   * Scroll callback trigger ( when the bottom page of items to scroll are in view)
   */
  function doCallbackTrigger()
  {
    //console.log( "Fetching Queued data block, Nbr Elements: " + m_nNbrElementsToScroll );

    fnMoreElementCB( function( nElementsFetched )
                    {
                      m_nElementToScrollHeight = $("#" + strElementToScrollId ).height();

                      //console.log( "Return from QUEUED fetch with: " + nElementsFetched + "elements, Total: " +  m_nNbrElementsToScroll );

                    });

  }



} // end VwInfinateScroll{}


// JQuery Installer
$.fn.VwInfiniteScroll = function( scrollBar, nItemHeight, fnMoreElementCB )
{
 return new VwInfiniteScroll( this[0].id, scrollBar, nItemHeight, fnMoreElementCB );

}

export default VwInfiniteScroll;

