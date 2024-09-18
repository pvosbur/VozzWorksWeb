/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2022 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 * ============================================================================================
 *
 */
import VwStringBuffer from "/vozzworks/util/VwStringBuffer/VwStringBuffer.js";
import VwExString from "/vozzworks/util/VwExString/VwExString.js";

/**
 * Class to parse a string into tokens
 *
 * @param strStringToParse The string to parse
 * @param strTokenDelimiters a string of token deliniters
 * @constructor
 */
function VwStringTokenParser( strStringToParse, strTokenDelimiters )
{
  const m_sbTokenBuffer = new VwStringBuffer();
  let m_nTokenCursor = 0;
  let m_bReturnDelim = false;

  this.getNextToken = getNextToken;
  this.peekNextToken = () => getNextToken( true );
  this.setReturnDelim = ( bReturnDelim ) => m_bReturnDelim = bReturnDelim;
  this.setCursorPos = (nStartCursorPos ) => m_nTokenCursor = nStartCursorPos;
  this.getCursorPos = () => m_nTokenCursor;

  function getNextToken( bIsPeek )
  {
    const nCurTokenCursor = m_nTokenCursor;

    try
    {

      while ( m_nTokenCursor < strStringToParse.length )
      {
        const strCurChar = strStringToParse[m_nTokenCursor];
        const strNextChar = (m_nTokenCursor + 1) < strStringToParse.length?strStringToParse[m_nTokenCursor + 1] : null;

        if ( isDelim( strCurChar ) )
        {
          ++m_nTokenCursor;
          if ( m_bReturnDelim )
          {
            return {type: VwStringTokenParser.DELIM, val: strCurChar};
          }
        }
        else
          if ( strNextChar == null || isDelim( strNextChar ) )
          {
            // add current char to buff
            m_sbTokenBuffer.append( strCurChar );
            const strToken = m_sbTokenBuffer.toString();
            m_sbTokenBuffer.clear();

            ++m_nTokenCursor;

            return {type: VwStringTokenParser.TOKEN, val: strToken};
          }
          else
          {
            m_sbTokenBuffer.append( strCurChar );
            ++m_nTokenCursor;
          }

      } // end while()
    }
    finally
    {
      if ( bIsPeek )
      {
        m_nTokenCursor = nCurTokenCursor ;
      }
    }

    return null;  // EOF


  } // end getNextToken()

  /**
   * returns true if the character is inn the delimietr string
   *
   * @param strCharToTest The character to test
   * @returns {Boolean} true if in the delimiter string, false otherwise
   */
  function isDelim( strCharToTest )
  {
    return VwExString.isCharIn( strCharToTest, strTokenDelimiters );
  }

} // end VwStringTokenParser{}

VwStringTokenParser.DELIM = 1;
VwStringTokenParser.TOKEN = 2;

export default VwStringTokenParser;
