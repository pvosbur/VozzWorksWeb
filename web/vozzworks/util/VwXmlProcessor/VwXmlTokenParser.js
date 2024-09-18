/*
 * Created by User: petervosburgh
 * Date: 6/14/24
 * Time: 6:54 AM
 * 
 */
import VwAttribute    from "../../ui/VwTree/VwAttribute.js";
import VwExString     from "../VwExString/VwExString.js";

function VwXmlTokenParser( strXmlDocument)
{

  let m_fnOnTagOpen;
  let m_fnOnTagClose;
  let m_fnOnTagData;
  let m_fnOnComment;
  let m_nCursor = -1;

  this.onTagOpen = (fnOnTagOpen) => m_fnOnTagOpen = fnOnTagOpen;
  this.onTagClose = (fnOnTagClose) => m_fnOnTagClose = fnOnTagClose;
  this.onTagData = (fnOnTagData) => m_fnOnTagData = fnOnTagData;
  this.onComment = (fnOnComment) => m_fnOnComment = fnOnComment;
  this.parseDoc = parseDocument;


  /**
   * Parses the XML Document and calls the callbacks on element types
   */
  function parseDocument()
  {
    while( true )
    {
     if ( ++m_nCursor == strXmlDocument.length )
     {
       break;
     }

     switch( strXmlDocument.charAt( m_nCursor ) )
     {
       case "<":

         if ( isComment() )
         {
           continue;
         }

         if ( peekNextChar() == "/" )
         {
           handleCloseTag();
           break;
         }

         handleOpenTag();
         break;

     } // end switch()


    } // end while()

    return;
  } // end parseDocument()

  /**
   * Process all characters up to the ">" end tag
   */
  function handleOpenTag()
  {
    let strTagName = "";
    let bSelfClosing = false;
    let aTagAttributes = [];

    while ( true )
    {
      if ( ++m_nCursor == strXmlDocument.length )
      {
        throw `Unexpected EOF processing and XML Open tag: ${strTagName}`;
      }

      const strChar = strXmlDocument.charAt( m_nCursor );

      if ( VwExString.isWhiteSpace( strChar ) )
      {
        bSelfClosing = processAttributes( strTagName, aTagAttributes );
        break;
      }

      if ( strChar == ">")
      {
        break;
      }

      if ( strChar == "/")
      {
        if ( peekNextChar() == ">" )
        {
          bSelfClosing = true;
          break;
        }
      }

      // thses characters make up the tag name

      strTagName += strChar;
    }

    if ( m_fnOnTagOpen )
    {
      if ( aTagAttributes.length == 0 )
      {
        aTagAttributes = null ;
      }

      m_fnOnTagOpen( strTagName, aTagAttributes );

      if ( bSelfClosing )
      {
        m_fnOnTagClose( strTagName );
      }

      eatWhiteSpace( strTagName );

      const strNextChar = strXmlDocument.charAt( m_nCursor );

      if ( strNextChar != "<")
      {
        processTagData( strTagName );
      }
      else
      {
        m_nCursor -= 1; // put cursor back by 1 is its incremented in top loop
      }
    }
  } // end handleOpenTag()


  /**
   * Processes the tag value. The data between the > and </ tag element
   * @param strTagName
   */
  function processTagData( strTagName )
  {
    let strTagData = "";

    while( true )
    {
      if ( m_nCursor == strXmlDocument.length )
      {
        throw `Unexpected EOF processing and XML Open tag: ${strTagName}`;
      }

      const strChar = strXmlDocument.charAt( m_nCursor );

      if ( strChar == "<")
      {
        --m_nCursor;
        break;
      }

      ++m_nCursor;
      strTagData += strChar;

    } // end while()

    if ( m_fnOnTagData )
    {
      m_fnOnTagData( strTagName, xlateEscapeSequences( strTagData ) );
    }
    
  } // end processTagData()


  /**
   * Process the close tag characters
   */
  function handleCloseTag()
  {
    ++m_nCursor; // bump past the "/" close tag

    let strTagName = "";

    while ( true )
    {
      if ( ++m_nCursor == strXmlDocument.length )
      {
        throw `Unexpected EOF processing and XML Close tag: ${strTagName}`;
      }

      const strChar = strXmlDocument.charAt( m_nCursor );

      if ( strChar == ">" )
      {
        break;
      }

      strTagName += strChar;

    } // end while()

    if ( m_fnOnTagClose )
    {
      m_fnOnTagClose( strTagName );
    }

  } // end handleCloseTag()


  /**
   * Process attribuites until the ">" char encountered
   */
  function processAttributes( strTagName, aTagAttributes )
  {
    let strNameValPair = "";
    let bSelfClosingTag = false  ;
    let nQuoteCount = 0;

    eatWhiteSpace( strTagName );

    while( true )
    {
      const strChar = strXmlDocument.charAt( m_nCursor );
      if ( (VwExString.isWhiteSpace( strChar ) || strChar == "/") && (nQuoteCount == 0 || nQuoteCount > 1 ) )
      {
        const vwAttribute = configAttribute( strNameValPair );
        aTagAttributes.push( vwAttribute );
        eatWhiteSpace();
        strNameValPair = "";
        nQuoteCount = 0;
        bSelfClosingTag = strChar == "/" || strXmlDocument.charAt( m_nCursor ) == "/";
        if (bSelfClosingTag )
        {
          ++m_nCursor;
          break;
        }
      }
      else
      if ( strChar == ">")
      {
        const vwAttribute = configAttribute( strNameValPair );
        aTagAttributes.push( vwAttribute );
        break;
      }
      else
      {
        if ( strChar == "\"")
        {
          ++nQuoteCount;
        }
        strNameValPair += strChar;
        ++m_nCursor;
      }

    } // end while()

    return bSelfClosingTag;

  } // end processAttributes()

  /**
   * Configures an VwXmlAttribute from a name=value string
   * @param strNameValuePair
   * @return {*}
   */
  function configAttribute( strNameValuePair )
  {
    const astrNamVal = strNameValuePair.split( "=");

    if ( astrNamVal.length != 2 )
    {
      throw "Invalid XML attribute name value pair, missing = sign";
    }

    astrNamVal[1] = xlateEscapeSequences( VwExString.strip( astrNamVal[1], "\"" ) );

    return new VwAttribute( astrNamVal[ 0 ], astrNamVal[ 1 ] )

  } // end configAttribute()


  /**
   * Check to see if the current "<" is the start of a cpmment and if so, mpve the cursor to the end of the comment
   */
  function isComment()
  {
    if ( !(peekNextChar() == "!" ))
    {
      return false;
    }

    if ( (m_nCursor + 3 >= strXmlDocument.length ))
    {
      return false;
    }

    const strCommentSequence=  strXmlDocument.substring( m_nCursor, m_nCursor + 4 );

    if ( !strCommentSequence == "<!--")
    {
      return false;
    }

    let nEndCommentPos = strXmlDocument.indexOf( "-->", m_nCursor + 4 );

    if ( nEndCommentPos < 0 )
    {
      throw `I(nvalid comment, expecting --> end comment sequence for comment starting at position ${m_nCursor}, but found none`;
    }

    // bump end comment pos past past the "-->"

    nEndCommentPos += 3;

    if ( m_fnOnComment )
    {
      m_fnOnComment( strXmlDocument.substring( m_nCursor, nEndCommentPos ) );
    }

    // bump cursor past end comment

    m_nCursor = nEndCommentPos;

    return true;
     
  } // end isComment()


  /**
   * Translate any escape seqences to just the escape character
   */
  function xlateEscapeSequences( strValue )
  {
    let nPos = strValue.indexOf( "&");
    if ( nPos < 0 )
    {
      return strValue;  // no escapes found, return original value
    }

    let nStartPos = nPos;

    while( nStartPos > 0 )
    {
      let nEndEscPos = -1;
      for ( let x = nPos + 1; x < strValue.length; x++ )
      {
        if ( strValue.charAt( x ) == ";" )
        {
          nEndEscPos = ++x;
          break;
        }
      }

      if ( nEndEscPos < 0 )
      {
        throw `Invalid XML escape character sequence found, must end with ";" character`;
      }

      const strEscSeq = strValue.substring( nStartPos, nEndEscPos );

      const strEscChar = xlateEscapeSeq( strEscSeq );

      strValue = strValue.replace( strEscSeq, strEscChar );

      nStartPos = strValue.indexOf( "&", ++nStartPos );
    }

    return strValue;

  } // end xlateEscapeSequences()

  /**
   * Translate escape sequence to the actual character
   *
   * @param strEscSeq
   * @return {string}
   */
  function xlateEscapeSeq( strEscSeq )
  {
    let strEscChar;

    switch( strEscSeq )
    {
      case "&amp;":

        strEscChar = "&";
        break;

      case "&lt;":

        strEscChar = "<";
        break;

      case "&gt;":

        strEscChar = ">";
        break;

      case "&quot;":

        strEscChar = "\"";
        break;

      case "&apos;":

        strEscChar = "'";
        break;

    } // end switch()

    return strEscChar;

  } // end xlateEscapeSeq()


  /**
   * Eat all whitespaced characters
   * @param strTagName
   */
  function eatWhiteSpace( strTagName )
  {
    while( true )
    {
      if ( ++m_nCursor == strXmlDocument.length )
      {
        throw `Unexpected EOF processing Attributes for tag: ${strTagName}`;
      }

      if ( !VwExString.isWhiteSpace( strXmlDocument.charAt( m_nCursor)))
      {
        break;
      }
    } // end while()
  } // end eatWhiteSpace()


  /**
   * Returns next char without changing the cursor
   * @return {*|string}
   */
  function peekNextChar()
  {
    if ( (m_nCursor + 1) == strXmlDocument.length )
    {
      throw "Unexpected EOF processing and XML Open tag";
    }

    return strXmlDocument.charAt( (m_nCursor + 1) );

  } // end peekNextChar()

} // end VwXmlTokenParser{}

export default VwXmlTokenParser;