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

VwCssImport( "/vozzworks/ui/VwProgressBar/style");

/**
 * jQuery invoker
 */
$.fn.vwProgressBar = function( nWidth, nHeight, objProperties )
{
  "use strict";

  return new VwProgressBar( this[0].id, nWidth, nHeight, objProperties );

};

/**
 * Progress bar
 *
 * @param strParentDivId  Parent id where progress bar's html will be placed
 * @param nWidth width of prgress bar
 * @param nHeight height of progress bar
 * @param objProps optional properties:
 *        cssProgress class for the progress bar
 *        cssText override class for
 * @constructor
 */
function VwProgressBar( strParentDivId, objProps, fnReady )
{
  "use strict";

  let self = this;
  
  let m_nPctComplete;
  
  let m_objProps;

  let m_strParentDivId = strParentDivId;

  let m_nWidth;
  let m_nHeight;

  const m_strProgId = m_strParentDivId + "_progBar";

  const m_strIdPctComplete = m_strProgId + "_pct_complete";

  this.pctComplete = pctComplete;
  this.getPctComplete = getPctComplete;
  this.statusText = setStatusText;

  configProps( objProps );

  setupProgressBar();


  /**
   * Install progress bar html
   */
  function setupProgressBar()
  {

    if ( m_objProps.width )
    {
      m_nWidth = m_objProps.width;
    }
    else
    {
      m_nWidth = $("#" + m_strParentDivId ).width();

    }

    if ( m_objProps.height )
    {
      m_nHeight = m_objProps.height;
    }
    else
    {
      m_nHeight = $("#" + m_strParentDivId ).height();

    }

    let progBarSpanEle = $("<div>").attr( "id", m_strProgId);
    let progBarDivEle = $("<span>").attr( "id", m_strIdPctComplete );

    $( "#" + strParentDivId ).append( progBarSpanEle );
    $( "#" + strParentDivId ).append( progBarDivEle );

    $("#" + m_strParentDivId ).addClass( m_objProps.cssProgressCasing );
    $("#" + m_strProgId ).addClass( m_objProps.cssProgressBar );
    $("#" + m_strIdPctComplete ).addClass( m_objProps.cssProgressBarText );

    if ( m_objProps.width )
    {
      $( "#" + m_strParentDivId ).css( "width", m_nWidth );
    }

    if ( m_objProps.height )
    {
      $( "#" + m_strParentDivId ).css( "height", m_nHeight );
    }

    $( "#" + m_strParentDivId ).css( "position", "relative" );

    m_nWidth = $( "#" + m_strParentDivId ).width();
    m_nHeight = $( "#" + m_strParentDivId ).height();

    pctComplete( 0 );

    if ( fnReady )
    {
      fnReady( self );

    }


  }

  /**
   * Updates the progress bar
   * @param nPctComplete
   */
  function pctComplete( nPctComplete )
  {
    m_nPctComplete = nPctComplete;
    
    let nFillSize = m_nWidth * (nPctComplete / 100 );
    $( "#" +  m_strProgId ).css( "width", nFillSize );

    let strPctComplete = nPctComplete.toString();

    let nPos = strPctComplete.indexOf( "." );

    if ( nPos < 0 )
    {
      nPos = strPctComplete.length;
    }

    if ( m_objProps.showPctCompleteText )
    {
      $( "#" + m_strIdPctComplete ).text( strPctComplete.substring(0, nPos ) + "%" );
    }

  }

  /**
   * Returns the current pct complete
   * @returns {*}
   */
  function getPctComplete()
  {
    return m_nPctComplete;
  }
  
  /**
   * Sets the static text in the prgress bar
   * @param strText
   */
  function setStatusText( strText )
  {
    $( "#" + m_strIdPctComplete ).text( strText );

  }

  /**
   * Congigire the default properties
   * @param objProps
   */
  function configProps( objProps )
  {
    m_objProps = {};

    m_objProps.cssProgressCasing = "VwProgressCasing";
    m_objProps.cssProgressBar = "VwProgressBar";
    m_objProps.cssProgressBarText = "VwProgressBarText";
    m_objProps.showPctCompleteText = true;

    if ( objProps )
    {
      $.extend( m_objProps, objProps );

    }

  }
} // end {}

export default VwProgressBar;