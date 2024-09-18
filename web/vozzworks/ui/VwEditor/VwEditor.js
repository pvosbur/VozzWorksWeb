/*
 * Created by User: petervosburgh
 * Date: 9/21/23
 * Time: 1:47 PM
 * 
 */

import VwExString from "/vozzworks/util/VwExString/VwExString.js";

VwCssImport( "/vozzworks/ui/VwEditor/style" );

/**
 * This class implements a text editor. It can as a single line for input controls or a full multi line for document/message processing
 *
 * @param strParentId The parent element id where the editor will be placeed
 * @param props The configuration properties as follows:
 *
 *   style: the editor style one of "singleLine" or "multiLine; The default is multiLine
 *   cssCursorColor: a css cursor color class if other than black is wanted
 *   lineWrap: true or false. only applys' if the maxChars property is set
 *   maxChars:The maximum characters allowed if singleLine style or the max chars allowed for a line in a multiLine style editor
 *   placeHolder:The place holder text. Only applys for singleLine editor style
 *   cssPlaceHolder:css class name to be applied to the place holder ;
 *   newLineMetaKey:if the enter key requires a modifier key. Must be one of "shift", "control", "alt" or "meta
 *   quitOnEnterKey: if true the editor does not process the stand alone enter key and isuse the onEnterKey event callback if defined
 *
 * @constructor
 */
function VwEditor( strParentId, props, syntaxHighLighter )
{
  const m_inputProps = {};
  const m_strContainerId = `${strParentId}_inputContainer`;
  const m_strCursorId = `${strParentId}_cursor`;
  const m_strPlaceHolderId = `${strParentId}_placeHolder`;
  const EDITOR_WIDTH = $( `#${strParentId}` ).width();
  const CURSOR_TOP = 2;

  let m_nCurCharIndex = 0;
  let m_nCurLineIndex = 0;
  let m_nLineHeight;
  let m_offsetContainer;
  let m_curSpan;
  let m_placeHolderSpan;
  let m_fnOnEnterKeyHandler;
  let m_fnOnLineCountChangeHandler;
  let m_fnContentChangedHandler;
  let m_fnOnCharEntered;

  this.onEnterKey = ( fnOnEnterKeyHandler ) => m_fnOnEnterKeyHandler = fnOnEnterKeyHandler;
  this.onLineCountChange = ( fnOnLineCountChangeHandler ) => m_fnOnLineCountChangeHandler = fnOnLineCountChangeHandler;
  this.onChange = ( fnContentChangedHandler ) => m_fnContentChangedHandler = fnContentChangedHandler;
  this.onCharEntered = ( fnOnCharEntered ) => m_fnOnCharEntered = fnOnCharEntered;
  this.insertText = ( strText, nPos, strClass ) => handleAddText( strText, nPos, strClass );
  this.appendText = ( strText, strClass ) => handleAddText( strText, null, strClass );
  this.replaceText = handleReplaceText;
  this.val = handleVal;
  this.updateProps = ( props ) => $.extend( m_inputProps, props );
  this.setFocus = handleSetFocus;
  this.clear = handleClear;

  configObject();

  /**
   * Constructor impl
   */
  function configObject()
  {
    configProps();

    render();

    m_offsetContainer = $( `#${m_strContainerId}` ).offset();

    setupActions();

    getLineHeight();

  } // end configObject()

  /**
   * Render the editors container and placeholder html
   */
  function render()
  {
    const strEditorContainerHtml =
    `<div id="${strParentId}_inputContainer" tabindex="0" class="VwInputContainer">
       <div id="${strParentId}_cursor" class="VwCursor blink ${m_inputProps.cssCursorColor}"></div>
    </div>`;

    $( `#${strParentId}` ).append( strEditorContainerHtml );

    if ( m_inputProps.placeHolder )
    {
      const strPlaceHolderHtml =
              `<div id="${m_strPlaceHolderId}" class="${m_inputProps.cssPlaceHolder}">${m_inputProps.placeHolder}</div>`;

      $( `#${m_strContainerId}` ).append( strPlaceHolderHtml );

    }

    $( `#${m_strCursorId}` ).css( "left", "0" );
    $( `#${m_strCursorId}` ).css( "top", "2px" );

  } // end render()

  /**
   * Puts a span in the buffer to get the line height based on the font size
   */
  function getLineHeight()
  {
    $( `#${m_strContainerId}` ).append( `<span id="test">W</span>` );
    m_nLineHeight = $( "#test" ).height();
    $( "#test" ).remove();

  } // end getLineHeight()

  /**
   * Sets the editor focs
   */
  async function handleSetFocus()
  {
    return new Promise( handleSetFocusPromise );

    function handleSetFocusPromise( success, fail )
    {
      setTimeout( () => {
        $( `#${m_strContainerId}` ).on( "blur", () => {
          $( `#${m_strCursorId}` ).hide();
        } );

        $( `#${m_strCursorId}` ).show();

        $( `#${m_strContainerId}` ).focus();

        success();

      }, 0 );
    }

   } //end handleSetFocus()

  /**
   * Clears the editor()
   */
  function handleClear()
  {
    m_curSpan = null;
    m_nCurCharIndex = m_nCurLineIndex = 0;

    $( `#${m_strContainerId} span` ).remove()
    $( `#${m_strCursorId}` ).css( "left", "0" );
    $( `#${m_strCursorId}` ).css( "top", "2px" );

    $( `#${m_strPlaceHolderId}` ).show();

    fireChangeHandler();

  } // end handleClear()


  /**
   * Invoked the onChange handler if defined
   */
  function fireChangeHandler()
  {
    if ( m_fnContentChangedHandler )
    {
      m_fnContentChangedHandler();
    }
  } // end fireChangeHandler()


  /**
   * Character in editor clicked, position the cursor in front the character
   * @param event
   */
  async function handleCharClicked( event )
  {
    await handleSetFocus();

    const spanClicked = $( event.target );
    const bEditor = $( event.target ).hasClass( "VwInputContainer" );

    if ( bEditor )
    {
      let x = event.pageX - m_offsetContainer.left;
      let y = event.pageY - m_offsetContainer.top;

      handleEditorClicked( x, y );
      return;
    }

    const offChar = $( event.target ).offset();

    const aEditorChars = getEditorChars();

    m_nCurCharIndex = findCursorIndex( event.target );
    m_nCurLineIndex = getCharLineNbr( aEditorChars, spanClicked );

    // insert point is character before this

    updateCurSpan();

    $( `#${m_strCursorId}` ).offset( offChar );

  } // end handleCharClicked()

  /**
   * Mouse click not on a character. Find where the end of line is to move the cursor
   *
   * @param x The x position of the mouse click
   * @param y The y position of the mouse click
   */
  function handleEditorClicked( x, y )
  {
    // get list of line break spans
    const aCharSpans = getEditorChars();

    const aLineBreaks = $( ".BR" ).toArray();

    if ( !aLineBreaks )
    {
      // nothing entered yet, position cursor at top left of input
      if ( !aCharSpans )
      {
        $( `#${m_strCursorId}` ).css( "left", "0" );
        $( `#${m_strCursorId}` ).css( "top", "2px" );

        m_curSpan = null;
        return;
      }

      // position cursor after last character
      const lastSpanChar = aCharSpans[aCharSpans.length - 1];
      const offsetLastChar = $( lastSpanChar ).offset();
      const nCharWidth = $( lastSpanChar ).width();

      offsetLastChar.left += nCharWidth;

      updateCurSpan();

      $( `#${m_strCursorId}` ).offset( offsetLastChar );

      return;

    } // end if (!aLineBreaks)

    if ( aCharSpans.length == 0 )
    {
      $( `#${m_strCursorId}` ).css( "left", "0" );
      $( `#${m_strCursorId}` ).css( "top", "2px" );

      m_curSpan = null;
      return;
    }

    for ( let x = 0; x < aLineBreaks.length; x++ )
    {
      const brSpan = $( aLineBreaks[x] );
      const brSpanHeight = $( brSpan ).height();

      const brOffset = $( brSpan ).offset();

      brOffset.top -= m_offsetContainer.top;

      if ( y >= brOffset.top && y <= brOffset.top + brSpanHeight )
      {
        brOffset.top += m_offsetContainer.top;
        $( `#${m_strCursorId}` ).offset( brOffset );

        m_nCurCharIndex = findCursorIndex( brSpan );
        m_nCurLineIndex = x;

        updateCurSpan();

        return;
      }
    } // end for()

    m_nCurLineIndex = aLineBreaks.length;

    // if we get here this was clicked on last line

    const lastCharSpan = $( aCharSpans[aCharSpans.length - 1] );
    m_nCurCharIndex = aCharSpans.length;

    const nLastCharWidth = $( lastCharSpan ).width();
    const lastCharOffset = $( lastCharSpan ).offset();
    lastCharOffset.left += nLastCharWidth;

    updateCurSpan();

    $( `#${m_strCursorId}` ).offset( lastCharOffset );
  } // end handleEditorClicked()


  /**
   * Update the curSpan which represents the new entry point
   */
  function updateCurSpan()
  {
    if ( m_nCurCharIndex > 0 )
    {
      m_curSpan = getCharAtCurIndex( m_nCurCharIndex - 1 );
    }
    else
    {
      m_curSpan = null;
    }

  } // end updateCurSpan()


  /**
   * Keyboard keystroke handler
   *
   * @param ke
   */
  function handleKeyDown( ke )
  {
    ke.stopImmediatePropagation();

    const keyCode = (ke.keyCode ? ke.keyCode : ke.which);

    if ( keyCode == 32 || (keyCode >= 48 && keyCode <= 90) || (keyCode >= 186 && keyCode <= 222) )
    {
      handleAddCharacter( ke.key );
      return;
    }

    switch ( keyCode )
    {
            // Enter Key
      case 13:

        const bHasModifierKey = hasModifierKey( ke );

        if ( bHasModifierKey && m_inputProps.newLineMetaKey )
        {
          const bProceed = processMetaKey( ke );

          if ( !bProceed )
          {
            return;
          }
        }

        if ( !bHasModifierKey ) // enter key only was pressed
        {
          if ( m_inputProps.quitOnEnterKey )
          {
            if ( m_fnOnEnterKeyHandler )
            {
              m_fnOnEnterKeyHandler();
            }

            return;
          }
        }

        handleAddLineBreak( bHasModifierKey );
        break;

            // Delete key
      case 46:

        handleDeleteChar();
        break;

            // Backspace key
      case 8:

        handleDeleteChar( true );
        break;

            // end key
      case 35:

        handleEndKey( ke.metaKey );
        break;

            // home key
      case 36:

        handleHomeKey( ke.metaKey );
        break;

            // Left arrow key
      case 37:

        handleMoveCursorLeft();
        break;

            // Right arrow key
      case 39:

        handleMoveCursorRight();
        break;

            // Up arrow key
      case 38:

        handleMoveCursorUp();
        break;

            // Down arrow key
      case 40:

        handleMoveCursorDown();
        break;

    } // end switch()

  } // end handleKeyDown( ke )

  /**
   * Determins if a modifier key is also presded with the key
   * @param ke
   * @return {boolean|*}
   */
  function hasModifierKey( ke )
  {
    return ke.shiftKey || ke.ctrlKey || ke.altKey || ke.metaKey;

  } // end hasModifierKey( ke )

  /**
   * Determins if one of the meta keys matches the new line meta key property
   * @param ke
   * @return {boolean|*}
   */
  function processMetaKey( ke )
  {
    switch ( m_inputProps.newLineMetaKey )
    {
      case "shift":

        return ke.shiftKey;

      case "control":

        return ke.ctrlKey;

      case "alt":

        return ke.altKey;

      case "meta":

        return ke.metaKey;

    } // end switch()

  } // end processMetaKey()


  /**
   * Add character just pressed to the input container
   *
   * @param charEntered
   */
  function handleAddCharacter( charEntered, strClass )
  {
    if ( m_placeHolderSpan )
    {
      $( m_placeHolderSpan ).text( charEntered );
      m_placeHolderSpan = null;
      return;
    }

    const aCharSpans = getEditorChars();

    if ( m_inputProps.placeHolder )
    {
      $( `#${m_strPlaceHolderId}` ).hide();
    }

    if ( m_inputProps.maxChars )
    {
      // get the current line length
      const nCharOnLine = getNbrCharsOnLine( m_nCurLineIndex );

      if ( m_inputProps.maxChars == nCharOnLine )
      {
        if ( m_inputProps.lineWrap )
        {
          handleLineWrap( aCharSpans, charEntered );
          return;
        }
      }
    }

    if ( m_inputProps.lineWrapOnEditorWidth )
    {
      const nLineWidthInPx = getLineLengthInPix( m_nCurLineIndex );

      if ( nLineWidthInPx >= EDITOR_WIDTH )
      {
        handleLineWrap( aCharSpans, charEntered );
        return;
      }
    }

    const strCharId = VwExString.genUUID();
    const spanChar = makeCharSpan( strCharId, charEntered, strClass );

    if ( !m_curSpan )
    {
      initCurSpan( strCharId, spanChar )
    }
    else
    {
      const val = $( m_curSpan ).text();
      $( spanChar ).insertAfter( m_curSpan );
      m_curSpan = $( `#${strCharId}` );

      m_nCurCharIndex = findCursorIndex( m_curSpan );
    }

    // advance cursor past char just entered

    const charEnteredOffset = $( m_curSpan ).offset();
    const nWidth = $( m_curSpan ).width();

    charEnteredOffset.left += nWidth + 1;
    updateCursor( charEnteredOffset );

    if ( syntaxHighLighter )
    {
      sendWordToSyntaxHighLighter( m_nCurCharIndex );
    }

    ++m_nCurCharIndex;

    if ( m_fnOnCharEntered )
    {
      m_fnOnCharEntered( charEntered );
    }

    fireChangeHandler();

  } // end handleAddCharacter()


  /**
   * Gets the current word starting at the current cursor position back to the first white space character or beginingg of document
   * and passes thos word to the syntax highlighter for processing
   *
   * @param nStartingNdx The starting cursor index to get the word from
   */
  function sendWordToSyntaxHighLighter( nStartingNdx )
  {
    const aResult = getPreviousWord( nStartingNdx );
    const nStartWordNdx = aResult[0];
    const aWordSpans = aResult[1];

    const strWord = toString( aWordSpans );

    //console.log( `Word at index: ${nStartingNdx} => ${strWord}`);
    syntaxHighLighter.testWord( strWord.trim(), aWordSpans, nStartWordNdx );

  } // end sendWordToSyntaxHighLighter()


  /**
   * Init the current (cursor) span
   *
   * @param strCharId
   * @param spanChar
   */
  function initCurSpan( strCharId, spanChar )
  {
    const aCharSpans = getEditorChars();

    if ( aCharSpans.length == 0 )
    {
      $( `#${m_strContainerId}` ).append( spanChar );
      m_curSpan = $( `#${strCharId}` );
    }
    else
    {
      const firstCharSpan = getCharAtCurIndex();
      $( spanChar ).insertBefore( firstCharSpan );
      m_curSpan = $( `#${strCharId}` );

    }

    m_nCurCharIndex = 0;

  } // end initCurSpan()

  /**
   * Updates cursor position
   *
   * @param offsetCursor the new offset of the cursor
   */
  function updateCursor( offsetCursor )
  {
    offsetCursor.top += CURSOR_TOP;

    $( `#${m_strCursorId}` ).offset( offsetCursor );

  } // end updateCursor()

  /**
   * Adds a new linr <br/> span
   */
  function handleAddLineBreak( bNeedsPlaceHolder )
  {
    const strId = VwExString.genUUID();
    const strSpanBreak = makeCharSpan( strId, "\n" );

    if ( !m_curSpan )
    {
      initCurSpan( strId, strSpanBreak );
    }

    $( strSpanBreak ).insertAfter( m_curSpan );

    const spanCharBreak = $( `#${strId}` );
    const spanBreakOffset = $( spanCharBreak ).offset();

    m_curSpan = spanCharBreak;

    spanBreakOffset.top += m_nLineHeight;
    spanBreakOffset.left = m_offsetContainer.left;
    ++m_nCurCharIndex;
    ++m_nCurLineIndex;

    $( `#${m_strCursorId}` ).offset( spanBreakOffset );

    if ( m_fnOnLineCountChangeHandler )
    {
      m_fnOnLineCountChangeHandler( m_nCurLineIndex + 1 ); // show actual line count - not zero based
    }

    if ( bNeedsPlaceHolder )
    {
      handleAddCharacter( " " );
      m_placeHolderSpan = m_curSpan;
    }

    return spanCharBreak;
  } // end handleAddLineBreak()


  /**
   *
   * @param strCharEntered
   */
  function handleLineWrap( aCharSpans, strCharEntered )
  {
    let charSpanBreak;
    let nSpaceIndex = findPreviousCharIndex( aCharSpans, " " );
    let bNeedLineChaneCallback = true;

    if ( nSpaceIndex < 0 )
    {
      handleAddLineBreak();
      bNeedLineChaneCallback = false; // call back was issued in handleAddLineBreak
      aCharSpans = getEditorChars();

    }
    else
    {
      // we replace the space character with the break char to move the trailing characters to a new line
      charSpanBreak = aCharSpans[nSpaceIndex];
      $( charSpanBreak ).html( "<br/>" );
      $( charSpanBreak ).addClass( "BR" );

      ++m_nCurLineIndex;

    }

    const strCharId = VwExString.genUUID();

    const charEnteredSpan = makeCharSpan( strCharId, strCharEntered );

    const spanLastChar = aCharSpans[aCharSpans.length - 1];

    // add the overfow character following the line break
    $( charEnteredSpan ).insertAfter( spanLastChar );

    // get new buffer from added character
    aCharSpans = getEditorChars();

    // get char just entered and move the cursor to it

    const spanCharLastEntered = $( `#${strCharId}` );
    const offsetLastEntered = $( spanCharLastEntered ).offset();
    const nWidth = $( spanCharLastEntered ).width();

    offsetLastEntered.left += nWidth + 1;

    $( `#${m_strCursorId}` ).offset( offsetLastEntered );

    m_curSpan = spanCharLastEntered;  // new entry point
    m_nCurCharIndex = findCursorIndex( spanCharLastEntered );

    if ( m_fnOnLineCountChangeHandler && bNeedLineChaneCallback )
    {
      m_fnOnLineCountChangeHandler( m_nCurLineIndex + 1 ); // show actual line count - not zero based
    }

    if ( syntaxHighLighter )
    {
      sendWordToSyntaxHighLighter( m_nCurCharIndex );
    }

  } // end handleLineWrap()


  /**
   * Walks the current character buffer backwards from the current cursor position in search of the search character
   *
   * @param aCharSpans The array of char spans in the editor
   * @param strCharToSearch the character to search
   *
   * @return The index of the character in the editor buffer or -1 if not found
   */
  function findPreviousCharIndex( aCharSpans, strCharToSearch )
  {
    if ( m_nCurCharIndex == 0 )
    {
      return -1;
    }

    let nSpanNdx = m_nCurCharIndex;

    if ( nSpanNdx == aCharSpans.length )
    {
      --nSpanNdx;
    }

    for ( ; nSpanNdx >= 0; nSpanNdx-- )
    {
      const charSpan = aCharSpans[nSpanNdx];

      const strVal = $( charSpan ).text();

      if ( VwExString.isWhiteSpace(strVal ) || strVal == strCharToSearch )
      {
        return nSpanNdx;
      }
    }

    return -1;

  } // findPreviousCharIndex()


  /**
   * Handles end key hit
   * @param meta
   */
  function handleEndKey( meta )
  {
    const aCharSpans = getEditorChars();

    if ( aCharSpans.length == 0 )
    {
      return;  // empty editor - nothing to do
    }

    // if meta char, then go to end of all input
    if ( meta )
    {
      m_nCurCharIndex = aCharSpans.length - 1;
    }
    else
    {
      // go to end of current line
      m_nCurCharIndex = getEndingLineIndex( m_nCurLineIndex );
    }

    m_curSpan = getCharAtCurIndex( m_nCurCharIndex );

    const offsetCurSpan = $( m_curSpan ).offset();
    const nWidth = $( m_curSpan ).width();

    offsetCurSpan.left += nWidth;
    $( `#${m_strCursorId}` ).offset( offsetCurSpan );

    ++m_nCurCharIndex;

  } // end handleEndKey()

  /**
   * Handles end key hit
   * @param meta
   */
  function handleHomeKey( meta )
  {
    const aCharSpans = getEditorChars();

    if ( aCharSpans.length == 0 )
    {
      return;  // empty editor - nothing to do
    }

    // if meta char, then go to end of all input
    if ( meta )
    {
      m_nCurCharIndex = 0;
      m_nCurLineIndex = 0;
    }
    else
    {
      // go to end of current line
      m_nCurCharIndex = getStartingLineIndex( m_nCurLineIndex );
    }

    if ( m_nCurCharIndex == 0 )
    {
      $( `#${m_strCursorId}` ).css( "left", "0" );
      $( `#${m_strCursorId}` ).css( "top", "2px" );

      m_curSpan = null;
      return;
    }

    const spanChar = getCharAtCurIndex( m_nCurCharIndex );

    const offsetCurSpan = $( spanChar ).offset();
    $( `#${m_strCursorId}` ).offset( offsetCurSpan );

    m_curSpan = getCharAtCurIndex( m_nCurCharIndex - 1 );

  } // end handleEndKey()

  /**
   * Delete character
   *
   * @param bIsBackspace if true this is a delete from the backspace key else its from the delete key
   */
  function handleDeleteChar( bIsBackspace )
  {
    let aCharSpans = getEditorChars();
    if ( m_nCurCharIndex < 0 )
    {
      m_nCurCharIndex = 0;
    }

    try
    {
      if ( bIsBackspace )
      {

        if ( m_nCurCharIndex == 0 )  // beginning of editor doc, nothing to do
        {
          m_curSpan = null;
          return;
        }

        m_nCurCharIndex -= 1;

      }
      else
      {
        if ( m_nCurCharIndex == aCharSpans.length && aCharSpans.length > 0 )
        {
          // todo return;
        }
      }

      let spanChar = getCharAtCurIndex();

      if ( $( spanChar ).hasClass( "BR" ) )
      {
        $( spanChar ).remove(); // remove the break char and the one before it

        --m_nCurCharIndex;

        if ( bIsBackspace )
        {
          --m_nCurLineIndex;
        }

        // line count has changedere, notify client if handler is defined
        if ( m_fnOnLineCountChangeHandler )
        {
          m_fnOnLineCountChangeHandler( getLineCount() );
        }

        spanChar = getCharAtCurIndex();
      }
      if ( !spanChar )
      {
        return;
      }

      (spanChar).remove();

      let ndxCharAt = m_nCurCharIndex;
      if ( ndxCharAt > 0 )
      {
        --ndxCharAt;
        m_curSpan = getCharAtCurIndex( ndxCharAt );
      }
      else
      {
        m_curSpan = null;
      }

      if ( bIsBackspace || isLineBreakChar( m_curSpan ) )
      {
        const spanCursor = getCharAtCurIndex( ndxCharAt );

        if ( !spanCursor )
        {
          m_nCurLineIndex = m_nCurLineIndex = 0;
          m_curSpan = null;
          return;

        }

        const nWidth = $( spanCursor ).width();
        const offsetCur = $( spanCursor ).offset();

        if ( !isLineBreakChar( m_curSpan ) )
        {
          offsetCur.left += nWidth + 1;
        }
        else
        {
          --m_nCurLineIndex;
          $( m_curSpan ).remove();
          --m_nCurCharIndex;

          // line count has changedere, notify client if handler is defined
          if ( m_fnOnLineCountChangeHandler )
          {
            m_fnOnLineCountChangeHandler( m_nCurLineIndex + 1 );
          }

          m_curSpan = getCharAtCurIndex();
        }

        $( `#${m_strCursorId}` ).offset( offsetCur );

      }
    } // end try
    finally
    {
      // we deleted a char get the updated buffer
      aCharSpans = getEditorChars();

      if ( aCharSpans.length == 0 )
      {
        if ( m_inputProps.placeHolder )
        {
          $( `#${m_strPlaceHolderId}` ).show();
        }

        $( `#${m_strCursorId}` ).css( "left", "0" );
        $( `#${m_strCursorId}` ).css( "top", "2px" );
      }
      else
      {
        if ( syntaxHighLighter )
        {
          if ( m_nCurCharIndex > 0 )
          {
            sendWordToSyntaxHighLighter( m_nCurCharIndex );
          }
          else
          {
            sendWordToSyntaxHighLighter( 0, !bIsBackspace );

          }
        }
      }

      fireChangeHandler();
    } // end finally

  } // end handleDeleteChar()

  /**
   * Moves
   * @param bMoveLeft
   */
  function handleMoveCursorLeft( bMoveLeft )
  {
    const aCharSpans = getEditorChars();

    let bNoDecrement = false;

    if ( m_nCurCharIndex == aCharSpans.length )
    {
      --m_nCurCharIndex;
      bNoDecrement = true;
    }

    if ( !bNoDecrement )
    {
      --m_nCurCharIndex;
    }

    let curSpanChar = getCharAtCurIndex();
    let val = $( curSpanChar ).text();

    // look at current character, if its a line break don't alter cursor
    if ( $( curSpanChar ).hasClass( "BR" ) )
    {
      const nBreakNdx = findCursorIndex( curSpanChar );

      //if the line break index before this character then the left array stops
      if ( nBreakNdx < m_nCurCharIndex )
      {
        ++m_nCurCharIndex; // restore index to break character
        return;
      }
    }

    // This is the beginning of the input -- reset index and return
    if ( m_nCurCharIndex <= 0 )
    {
      m_nCurCharIndex = 0;
      m_curSpan = null;

      $( `#${m_strCursorId}` ).offset( {top: "2px", left: m_offsetContainer.left} );

      return;
    }

    curSpanChar = getCharAtCurIndex();
    val = $( curSpanChar ).text();
    let nWidth = $( curSpanChar ).width();
    const offsetCurSpanChar = $( curSpanChar ).offset();
    $( `#${m_strCursorId}` ).offset( offsetCurSpanChar );

    // the previous char to this one is the new entry point
    m_curSpan = getCharAtCurIndex( m_nCurCharIndex - 1 );

  } // end handleMoveCursorLeft()


  /**
   * Moves the cursor rigth one char
   */
  function handleMoveCursorRight()
  {
    const aCharSpans = getEditorChars();

    if ( (m_nCurCharIndex) == aCharSpans.length )
    {
      m_curSpan = getCharAtCurIndex( m_nCurCharIndex - 1 );
      return;
    }

    const curSpanChar = getCharAtCurIndex();

    if ( $( curSpanChar ).hasClass( "BR" ) )
    {
      return;
    }
    const val = $( curSpanChar ).text();
    const offsetCurSpanChar = $( curSpanChar ).offset();
    const nWidth = $( curSpanChar ).width()

    m_curSpan = curSpanChar;

    offsetCurSpanChar.left += nWidth + 1;
    $( `#${m_strCursorId}` ).offset( offsetCurSpanChar );

    ++m_nCurCharIndex;

  } // end handleMoveCursorRight()

  /**
   * Moves the cursor up one line
   */
  function handleMoveCursorUp()
  {
    // get current array of characters in the input control

    if ( m_nCurLineIndex == 0 )
    {
      return;   // already at top Line
    }

    const aCharSpans = getEditorChars();

    // current array of line breaks
    const aLineBreaks = $( ".BR" ).toArray();

    if ( aCharSpans.length == 0 || aLineBreaks.length == 0 )
    {
      return;  //nothing to do
    }

    // we're past the last char in container, back up by 1
    if ( m_nCurCharIndex >= aCharSpans.length )
    {
      m_nCurCharIndex = aCharSpans.length - 1;
      ;
    }

    const nLineStartNdx = getStartingLineIndex( m_nCurLineIndex );
    const spanCurChar = getCharAtCurIndex();

    let val = $( spanCurChar ).text();

    let nCurCharNdx = findCursorIndex( spanCurChar );

    const nCharOffset = nCurCharNdx - nLineStartNdx;

    const nNextLineStartIndex = getStartingLineIndex( --m_nCurLineIndex )
    let nEndingLineNdx = getEndingLineIndex( m_nCurLineIndex ) + 1;

    // if we are at end of input, back up bt one
    if ( nEndingLineNdx == aCharSpans.length )
    {
      --nEndingLineNdx;
    }

    let nCharNdx;
    if ( nNextLineStartIndex + nCharOffset > nEndingLineNdx )
    {
      nCharNdx = nEndingLineNdx;
    }
    else
    {
      nCharNdx = nNextLineStartIndex + nCharOffset;
    }

    const nextLineSpanChar = getCharAtCurIndex( nCharNdx );
    val = $( nextLineSpanChar ).text();

    const offsetNextLineChar = $( nextLineSpanChar ).offset();

    $( `#${m_strCursorId}` ).offset( offsetNextLineChar );
    m_nCurCharIndex = findCursorIndex( nextLineSpanChar );

    m_curSpan = getCharAtCurIndex( m_nCurCharIndex - 1 );

  } // end handleMoveCursorUp()


  /**
   * Move cursor down one line
   */
  function handleMoveCursorDown()
  {
    // get current array of characters in the input control
    const aCharSpans = getEditorChars();

    // current array of line breaks
    const aLineBreaks = $( ".BR" ).toArray();

    if ( aCharSpans.length == 0 || aLineBreaks.length == 0 )
    {
      return;  //nothing to do
    }

    if ( m_nCurLineIndex == aLineBreaks.length )
    {
      return;   // already at bottom Line
    }

    const nLineStartNdx = getStartingLineIndex( m_nCurLineIndex );
    const spanCurChar = getCharAtCurIndex();

    let val = $( spanCurChar ).text();

    let nCurCharNdx = findCursorIndex( spanCurChar );

    const nCharOffset = nCurCharNdx - nLineStartNdx;

    const nNextLineStartIndex = getStartingLineIndex( ++m_nCurLineIndex )
    let nEndingLineNdx = getEndingLineIndex( m_nCurLineIndex ) + 1;

    // if we are at end of input, back up bt one
    if ( nEndingLineNdx == aCharSpans.length )
    {
      --nEndingLineNdx;
    }

    let nCharNdx;
    if ( nNextLineStartIndex + nCharOffset > nEndingLineNdx )
    {
      nCharNdx = nEndingLineNdx;
    }
    else
    {
      nCharNdx = nNextLineStartIndex + nCharOffset;
    }

    const nextLineSpanChar = getCharAtCurIndex( nCharNdx );
    val = $( nextLineSpanChar ).text();

    const offsetNextLineChar = $( nextLineSpanChar ).offset();

    $( `#${m_strCursorId}` ).offset( offsetNextLineChar );
    m_nCurCharIndex = findCursorIndex( nextLineSpanChar );

    m_curSpan = getCharAtCurIndex( m_nCurCharIndex - 1 );

  } // end handleMoveCursorDown()

  /**
   * Counts the line break chars before this charaters to determine the current line nbr
   *
   * @param aCharBuffer The current editer chara ter buffer
   * @param curSpanChar the pan char to get the line nbr for
   * @return {number}
   */
  function getCharLineNbr( aCharBuffer, curSpanChar )
  {
    const ndxChar = findCursorIndex( curSpanChar ) - 1;

    let nLineBreakCount = 0;
    for ( let x = ndxChar; x >= 0; x-- )
    {
      const spanChar = aCharBuffer[x];

      if ( $( spanChar ).hasClass( "BR" ) )
      {
        ++nLineBreakCount;
      }
    } // end for()

    return nLineBreakCount;

  } // end getCharLineNbr()

  /**
   * Get the index nbr in the breaks array
   *
   * @param strBreakId The break id to get the index for
   * @return {*}
   */
  function getBreakIndex( strBreakId )
  {
    const aLineBreaks = $( ".BR" ).toArray();

    const ndx = aLineBreaks.findIndex( ( span ) => {
      const strSpanId = $( span ).attr( "id" );

      return strSpanId == strBreakId;
    } );

    return ndx;

  } // end getBreakIndex()

  /**
   * Returns true if the span char is a line break
   *
   * @param spanChar the span char to test
   * @return {*|jQuery}
   */
  function isLineBreakChar( spanChar )
  {
    return $( spanChar ).hasClass( "BR" );

  } // end isLineBreakChar()

  /**
   * Makes a span element from the character pressed
   * @param charEntered
   */
  function makeCharSpan( strId, charEntered, strClass )
  {
    if ( charEntered == " " )
    {
      charEntered = "&nbsp;";

    }

    let strSpanHtml = `<span id="${strId}"`;

    if ( charEntered == "\n" )
    {
      charEntered = "<br/>";
      strSpanHtml += ' class="BR"';
    }
    else
    {
      if ( strClass )
      {
        strSpanHtml += ` class="${strClass}"`;
      }
    }

    strSpanHtml += `>${charEntered}</span>`;

    return strSpanHtml;

  } // end makeCharSpan()

  /**
   * Inserts text in editor or gets the current editor text
   *
   * @param strText if not null loads editor eith the text, else retrieves the current text
   */
  function handleVal( strText )
  {
    if ( strText )
    {
      loadText( strText );
    }
    else
    {
      return getText();
    }

  } // end handleVal()


  /**
   * Inserts or appends text
   *
   * @param strText The text to insert
   * @param nPos The specified position to insert the text, if null its appended
   */
  function handleAddText( strText, nPos, strClass )
  {
    const aEditorCharSpans = getEditorChars();

    if ( nPos )
    {
      // insert text at specified position
      if ( nPos > aEditorCharSpans.length )
      {
        throw `Invalid insertText at position ${nPos} because the insert position is greaterr than the length of the document`
      }

      m_nCurCharIndex = nPos;
    }
    else
    {
      m_nCurCharIndex = aEditorCharSpans.length; // append text
    }

    if ( nPos == 0 )
    {
      nPos = 1; //nPos is decremented in next statement so it will be zero
    }

    m_curSpan = $( aEditorCharSpans[nPos - 1] );

    for ( const char of strText.split( "" ) )
    {
      handleAddCharacter( char, strClass );
    }

  } // end handleAddText()


  /**
   * Replaces the orig text with the new text
   *
   * @param strOrigText The text to replace
   * @param strReplaceText The new replacement text
   * @param strClass If specified the class for each character
   */
  function handleReplaceText( strOrigText, strReplaceText, strClass )
  {
    const strContents = handleVal();

    let nPosOrigText = strContents.indexOf( strOrigText );

    if ( nPosOrigText < 0 )
    {
      return; // orig text not found
    }

    // Current cursor is now at starting at the end of text to replace
    m_nCurCharIndex = nPosOrigText + strOrigText.length - 1;

    const aEditorSpans = getEditorChars();

    m_curSpan = $( aEditorSpans[m_nCurCharIndex] );

    // remove the original text chars from the editor
    for ( let x = nPosOrigText; x < aEditorSpans.length; x++ )
    {
      handleDeleteChar();
      --m_nCurCharIndex;
    }

    const aNewText = strReplaceText.split( "" );

    // Now add in new text starting at the replce text positgion
    for ( const char of aNewText )
    {
      handleAddCharacter( char, strClass );
    }

  } // end handleReplaceText()

  /**
   * Converts a string to an array of span elements, one for each charater in the string
   * @param strText
   * @return {*[]}
   */
  function toCharSpans( strText )
  {
    const aCharSpans = [];

    for ( const char of strText.split( "" ) )
    {
      const charSpan = makeCharSpan( VwExString.genUUID(), char );
      aCharSpans.push( charSpan );
    }

    return aCharSpans;

  } // end toCharSpans()


  /**
   * Returns the array of span chars as string
   */
  function getText()
  {
    return toString( getEditorChars() );

  } // end  getText()

  /**
   * Returns a string from the array of char spans
   * @param aSpanChars
   * @return {string}
   */
  function toString( aSpanChars )
  {
    let strEditorText = "";

    for ( const charSpan of aSpanChars )
    {
      if ( $( charSpan ).hasClass( "BR" ) )
      {
        strEditorText += " ";
      }
      else
      {
        let ch = $( charSpan ).text();
        if ( ch.charCodeAt( 0 ) == 160 )
        {
          ch = " ";

        }
        strEditorText += ch;
      }
    }

    return strEditorText;

  } // end toString()


  /**
   * Loads the specified text in the editor
   * @param strText
   */
  function loadText( strText )
  {
    // empty the editor
    $( `#${m_strContainerId} span` ).remove();

    for ( let x = 0; x < strText.length; x++ )
    {
      handleAddCharacter( strText.charAt( x ) );
    }
  } // end loadText()


  /**
   * Setup action handlers
   */
  function setupActions()
  {
    $( `#${m_strContainerId}` ).click( handleCharClicked );
    $( `#${m_strContainerId}` ).keydown( handleKeyDown );

  } // end setupActions()

  /**
   * Gets span character at the current corsor or the override if specifoied
   *
   * @param ndxOverride If specified, use this index value over the internal cursor
   * @return {*|null}
   */
  function getCharAtCurIndex( ndxOverride )
  {
    const aCharSpans = getEditorChars();

    if ( ndxOverride >= 0 )
    {
      return aCharSpans[ndxOverride];
    }

    // cur index is at the end of the line
    if ( m_nCurCharIndex == aCharSpans.length )
    {
      return null;
    }

    return aCharSpans[m_nCurCharIndex];

  } // end indChar()

  /**
   * returns the starting index in the editor array of the line nbr spcified
   *
   * @param nLineNbr The line nbr to get the starting index in the editor array
   */
  function getStartingLineIndex( nLineNbr )
  {
    if ( nLineNbr == 0 )
    {
      return 0;
    }

    const aLineBreaks = $( ".BR" ).toArray();

    const spanBreak = aLineBreaks[nLineNbr - 1];

    return findCursorIndex( spanBreak ) + 1;

  } // end getBeginningLineIndex()

  /**
   * returns the starting index in the editor array of the line nbr spcified
   *
   * @param nLineNbr The line nbr to get the starting index in the editor array
   */
  function getEndingLineIndex( nLineNbr )
  {
    const aLineBreaks = $( ".BR" ).toArray();

    if ( nLineNbr == aLineBreaks.length )
    {
      const aCharSpans = getEditorChars();

      return aCharSpans.length - 1;
    }

    const spanBreak = aLineBreaks[nLineNbr];

    return findCursorIndex( spanBreak ) - 1;

  } // end getBeginningLineIndex()

  /**
   * Return the nbr of characters in the line
   *
   * @param nLineNbr The line nbr to get the nbr of chars
   * @return {number}
   */
  function getNbrCharsOnLine( nLineNbr )
  {
    const nStartNdx = getStartingLineIndex( nLineNbr );
    const nEndNdx = getEndingLineIndex( nLineNbr );

    return nEndNdx - nStartNdx + 1;

  } // end getNbrCharsOnLine()


  /**
   * Returns the length in pixels of all characters on the line
   * @param nLineNbr The line nbr to count the char length
   * @return {number}
   */
  function getLineLengthInPix( nLineNbr )
  {
    const aEditorChars = getEditorChars();

    let nLineLength = 0;

    const nStartNdx = getStartingLineIndex( nLineNbr );
    const nEndNdx = getEndingLineIndex( nLineNbr );

    for ( let x = nStartNdx; x <= nEndNdx; x++ )
    {
      const spanChar = aEditorChars[x];

      nLineLength += $( spanChar ).width();

    }

    return nLineLength;

  } // end getLineLengthInPix()


  /**
   * Finds the index of a span char by its id
   *
   * @param spanChar The span character to get the index of
   * @return {number}
   */
  function findCursorIndex( spanChar )
  {
    const strSpanId = $( spanChar ).attr( "id" );

    const aCharSpans = getEditorChars();

    const ndx = aCharSpans.findIndex( ( span ) => {
      const strId = $( span ).attr( "id" );

      return strId == strSpanId;
    } );

    return ndx;

  } // end findCursorIndex()

  /**
   * Gets all of the child span characters. Each span contains one character
   *
   * @return {*|jQuery}
   */
  function getEditorChars()
  {
    return $( `#${strParentId}_inputContainer span` ).toArray();

  } // end getEditorChars()


  /**
   * Returns the total nbr of lines in the editor
   * @return {*}
   */
  function getLineCount()
  {
    const aLineBreaks = $( ".BR" );
    return aLineBreaks.length + 1;

  } // end getLineCount()


  /**
   * Gets the word starting from the currrent cursor pos to the first white space
   * @param nCursorPos
   * @param bDeletedChar if true, char was deleted at the start of or in middle of a word
   * @return {*[]}
   */
  function getPreviousWord( nCursorPos )
  {
    const aWordSpans = [];

    const aEditorChars = getEditorChars();

    const char = $( aEditorChars[nCursorPos] ).text();

    // if we're on a whitespace char, back cursor to first non whitespace char
    if ( VwExString.isWhiteSpace( char ) )
    {
      for ( ; nCursorPos >= 0; --nCursorPos )
      {
        const char = $( aEditorChars[nCursorPos] ).text();

        if ( VwExString.isWhiteSpace( char ) )
        {
          continue;
        }

        break;
      }
    } // end if

    let nStartWordNdx = nCursorPos;
    let nEndWordNdx = nCursorPos;

    // look to right of cursor for first whitespace char
    for ( ; nEndWordNdx < aEditorChars.length; ++nEndWordNdx )
    {
      const char = $( aEditorChars[nEndWordNdx] ).text();

      if ( VwExString.isWhiteSpace( char ) )
      {
        if ( nEndWordNdx == nCursorPos )
        {
          --nEndWordNdx; // only decrement if we're starting on a whitespace char
        }

        break;
      }

    } // end for()


    // Now look to the left of cursor for first whitespace char
    for ( ; nStartWordNdx >= 0; --nStartWordNdx )
    {
      const char = $( aEditorChars[nStartWordNdx] ).text();

      if ( VwExString.isWhiteSpace( char ) )
      {
        ++nStartWordNdx;
        break;
      }

    } // end for()

    if ( nStartWordNdx < 0 )
    {
      nStartWordNdx = 0;
    }

    // save word starting index before we clobber it
    const nWordNdx = nStartWordNdx;

    for ( ; nStartWordNdx < nEndWordNdx; ++nStartWordNdx )
    {
      aWordSpans.push( aEditorChars[nStartWordNdx] );
    }

    return [nWordNdx, aWordSpans];

  } // end  getPreviousWord(


  /**
   * Setup default props
   */
  function configProps()
  {
    m_inputProps.cssPlaceHolder = "";
    m_inputProps.cssCursorColor = "VwBlack";
    $.extend( m_inputProps, props );

  } // end configProps()

} // end VwEditor()

export default VwEditor;
