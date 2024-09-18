/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   2/11/18

 Time Generated:   11:26 AM

 ============================================================================================
 */

import VwHashMap from "../../util/VwHashMap/VwHashMap.js";

VwCssImport( "/vozzworks/ui/VwSyntaxEditor/style");

function VwSyntaxDictionary()
{
  const m_mapKeyWords = new VwHashMap();

  this.addItem = addItem;

  this.getKeyWordCssClass = getKeyWordCssClass;

  /**
   * Adds a syntax keyword to the dictionary
   *
   * @param strKeyWord The key word
   * @param strCssKeyWord The css class for key wrods style attributes
   */
  function addItem( strKeyWord, strCssKeyWord )
  {
    m_mapKeyWords.put( strKeyWord, strCssKeyWord );
  }

  /**
   * Returns the css class name for the keyword if one exists else returns null
   *
   * @param strKeyWord A word to the the css class name for
   * @returns {*}
   */
  function getKeyWordCssClass( strKeyWord )
  {
    return m_mapKeyWords.get( strKeyWord );
  }

} // end VwSyntaxDictionary{}


/**
 *
 * @param strParent
 * @param vwSytaxDictionary
 * @constructor
 */
function VwSyntaxEditor( strParent, vwSytaxDictionary )
{
  const LEFT_ARROW = 37;
  const RIGHT_ARROW = 39;
  const UP_ARROW = 38;
  const DOWN_ARROW = 40;
  const HOME_KEY = 36;
  const END_KEY = 35;
  const PAGE_UP_KEY = 33;
  const PAGE_DOWN_KEY = 34;

  let m_divEditorContainer;
  let m_divCursor;
  let m_currentSpanTextEle;
  let m_nSpanSeq = 0;
  let m_nCharWidth;
  let m_nCharHeight;
  let m_nCursorTopDiff;
  let m_offsEditor;

  setup();


  function setup()
  {
    const textm =  VwExString.getTextMetrics("a", "VwMonospaceFont");

    m_nCharWidth = textm.width;
    m_nCharHeight = textm.height;

    m_divEditorContainer = $("<div>").attr( "id", strParent + "_editorContainer").attr( "tabindex", "0").attr( "style", "position:relative" ).width( $("#" + strParent).width() ).height( $("#" + strParent).height() );
    m_divEditorContainer.addClass( "VwMonospaceFont VwSyntaxEditor" );

    m_divCursor = $("<div>").attr( "id", strParent + "_cursor").addClass( "VwBlinkCursor").width( 2 ).height( 22 )[0];

    $("#" + strParent ).append( m_divEditorContainer );
    $(m_divEditorContainer ).append( m_divCursor );

    m_offsEditor = $( m_divEditorContainer ).offset();
    m_nCursorTopDiff = $(m_divCursor).height() / 2 - m_nCharHeight / 2;
    
    m_currentSpanTextEle = createSyntaxSpan();

    m_divEditorContainer.append( m_currentSpanTextEle );

    positionCurrentSpan();
    
    $( m_divEditorContainer ).keydown( handleKeyPress );
    $( m_divEditorContainer ).mousedown( handleMouseDown );

    m_divEditorContainer.focus();

  }

  /**
   * Positions the span tag verticiall centered within in the cursor
   */
  function positionCurrentSpan()
  {
    const cursorOffset = $(m_divCursor).offset();

    $(m_currentSpanTextEle).offset( {top:cursorOffset.top + m_nCursorTopDiff } );
  }


  /**
   * Keypress handler for the editor
   * @param event
   */
  function handleKeyPress( event )
  {
    if ( event.metaKey ||  (event.shiftKey && event.key == "Shift" ) )
    {
      return;
    }
    
    if ( VwExString.isWhiteSpace( event.key ) )
    {
      const strWord = getWord();
      const strWordCss = vwSytaxDictionary.getKeyWordCssClass( strWord );

      if ( strWordCss )
      {
        m_currentSpanTextEle.addClass( strWordCss );
        m_currentSpanTextEle = createSyntaxSpan();
        m_divEditorContainer.append( m_currentSpanTextEle );
        appendCharToCurrentSpan( event );
        positionCurrentSpan();
      }
      else
      {
        appendCharToCurrentSpan( event );
      }

    }
    else
    if ( event.keyCode == 13 )
    {
      m_divEditorContainer.append( "<br/>" );
      m_currentSpanTextEle = createSyntaxSpan();
      m_divEditorContainer.append( m_currentSpanTextEle );
      $( m_divCursor ).css( "left", "0px");
      $( m_divCursor ).css( "top", event.offsetY + "px");


    }
    else
    if ( isDirectionKey( event ) )
    {
      doDirectionKeyMove( event );
    }
    else
    {
      appendCharToCurrentSpan( event );
    }

  }

  function appendCharToCurrentSpan( event )
  {
    m_currentSpanTextEle.append( event.key );
    moveCursor();

  }
  function isDirectionKey( event )
  {
    switch( event.keyCode )
    {
      case LEFT_ARROW:
      case RIGHT_ARROW:
      case UP_ARROW:
      case DOWN_ARROW:
      case HOME_KEY:
      case END_KEY:
      case PAGE_UP_KEY:
      case PAGE_DOWN_KEY:

        return true;

    }

    return false;

  }

  /**
   * Moves the cursor accoring to the direction key hit
   * @param event The keyboard event
   */
  function doDirectionKeyMove( event )
  {
    switch( event.keyCode )
    {
      case LEFT_ARROW:

        moveCursor( -1 );
        break;

      case RIGHT_ARROW:

        moveCursor();
        break;

    } // end switch()

  }


  /**
   * Mousedown event position the cursor in the span segment
   * @param event
   */
  function handleMouseDown( event )
  {
    let targetId = event.target.id;
    let curTargetId = event.currentTarget.id;

    $( m_divCursor ).css( "left", event.offsetX + "px");

    const nTop = $("#"+ targetId).offset().top - ( $(m_divCursor).height() / 2 - m_nCharHeight / 2  ) ;

    $( m_divCursor ).css( "top", nTop + "px" );

    console.log( "Span Id: " + targetId + ", Cursor Pos: " + event.offsetX );
    return;
  }

  /**
   * Moves the cursor lect or right one character position
   * @param nDirection
   */
  function moveCursor( nDirection )
  {
    const offsCurPos = $(m_divCursor).offset();

    if ( nDirection < 0 )
    {
      offsCurPos.left -= m_nCharWidth;
    }
    else
    {
      offsCurPos.left += m_nCharWidth;

    }

    if ( offsCurPos.left <= m_offsEditor.left )
    {
      offsCurPos.left = m_offsEditor.left + 1;
    }

    $( m_divCursor ).offset( offsCurPos );

  }
  
  /**
   * Creates a span element to hold a syntax word piece
   *
   * @param strCssClass
   * @returns {*|jQuery}
   */
  function createSyntaxSpan( strCssClass )
  {
    return $("<span>").attr( "id", ++m_nSpanSeq ).addClass( strCssClass );
  }

  /**
   * Gets a word deliniated by the white space
   * @returns {*|string}
   */
  function getWord()
  {
    const strSpanVal = $( m_currentSpanTextEle ).text();

    const nEndPos = strSpanVal.length -1;

    let x = nEndPos;
    
    for ( ; x >= 0; x-- )
    {
      if ( VwExString.isWhiteSpace( strSpanVal.charAt( x ) ) )
      {
        break;
      }

    }

    return strSpanVal.substring( ++x, nEndPos + 1 );


  }

} // end VwSyntaxEditor{}

export default VwSyntaxEditor;
