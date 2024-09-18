/**
 * This class works in conjunction with The VwEditor to provide sytanx highlighting and keyword callbacks
 *
 * @param strSyntaxXml Optional xml documents to define the syntax highlight words
 * @constructor
 */
function VwSyntaxHighLighter( strSyntaxXml )
{
  const m_mapDefinitionByWord = new VwHashMap();

  let   m_fnHighlightCallback;

  this.addEntry = handleAddEntry;
  this.removeEntry = (strWord ) => m_mapDefinitionByWord.remove( strWord );
  this.onHighlight = (fnHighlightCallback ) => m_fnHighlightCallback = fnHighlightCallback;
  this.testWord = handleTestWord;

  /**
   * Adds a syntax highlight to the dictionary
   *
   * @param strWord The word to be highlighted
   * @param strClassList One or more css classes separated by a space
   * @param bInvokeCallback If true invokes the registered callback handler
   */
  function handleAddEntry( strWord, strClassList, bInvokeCallback )
  {
    m_mapDefinitionByWord.put( strWord, {class:strClassList,callback:bInvokeCallback});
  }

  /**
   * Test to see if word is in dictionary and if it is, applyies the highlight and callback (if defined)
   *
   * @param strWord The word to test
   * @param aCharSpans array if character span objects that define the word, and classes will be added to if its in the dictionary
   * @param nWordStartNdx the index in the editor where the word begins
   */
  function handleTestWord( strWord, aCharSpans, nWordStartNdx )
  {
    const highLightDef = m_mapDefinitionByWord.get( strWord );

    // if not in the dictionary it might contain partial markup because of a character change in word
    // we need to remove previous markup from the word
    if ( !highLightDef )
    {
      if ( $(aCharSpans[0]).hasClass( "VwHighLight"))
      {
        removeClassHighlight( aCharSpans );
      }

      return;
    }

    // if word is already hilighted, get out
    if ( $(aCharSpans[0]).hasClass( "VwHighLight") )
    {
      return;
    }

    for ( const charSpan of aCharSpans )
    {
      $(charSpan).addClass( `VwHighLight ${highLightDef.class}`  );
    }

    if ( highLightDef.callback && m_fnHighlightCallback )
    {
      m_fnHighlightCallback( strWord, nWordStartNdx);
    }

  } // end handleTestWord()

  /**
   * Removes all highlight classes from this charSpan
   *
   * @param aCharSpans The array of charSpan to remove highlight class from
   */
  function removeClassHighlight( aCharSpans )
  {
    for ( const charSpan of aCharSpans )
    {
      $( charSpan ).removeClass();
    }
  } // end removeClassHighlight()

} // end VwSyntaxHighLighter{}

export default VwSyntaxHighLighter;
