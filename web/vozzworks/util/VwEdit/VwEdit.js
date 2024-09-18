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

import VwExString from "../VwExString/VwExString.js";
import VwStringBuffer from "../VwStringBuffer/VwStringBuffer.js";

/**
 * <br>This class formats and validates data.  The format is based on an edit mask that is
 * <br>specified in the constructor of the class.  The setEditMask() method may also be used
 * <br>to change the edit mask.  There are many additional properties that can be used to
 * <br>filter data, including values and ranges, minimum and maximum lengths.  This class
 * <br>also accepts an VwDataDictionary object that sets and overrides the data properties.
 * <br>
 * <br>Once an edit mask is defined, the isValid() method can be used to test any character
 * <br>for validity based upon the edit mask.  This class defines many prebuilt standard masks
 * <br>for common data types such as Dates, Social Security, Phone numbers, file names, addresses,
 * <br>etc.
 * <br>
 * <br>All edit masks are created as a var  of characters, consisting of reserved format
 * <br>characters and delimiters defined as follows:
 * <br>
 * <br>X - Alpha-numeric character a-Z digits 0-9, data is automatically converted to UPPER CASE
 * <br>x - Alpha-numeric character a-Z digits 0-9 data is automatically converted to lower case
 * <br>c - Alpha-numeric character a-Z digits 0-9, case is preserved as is
 * <br>
 * <br>A - Alpha only character a-Z data is automatically converted to UPPER CASE
 * <br>a - Alpha only character a-Z data is automatically converted to lower case
 * <br>l - Alpha only character a-Z case is preserved as is
 * <br>
 * <br>9 - digits 0 - 9, numeric masks that are not currency or mathematical values
   <br>    (e.g., Social Security and telephone numbers)
 * <br>#   digits 0 - 9, numeric masks for data used in mathematical operations
 * <br>
 * <br>'*' (asterisk) The asterisk allows any character in any case
 * <br>
 * <br>In addition to the above reserved format symbols, it may be necessary to add special
 * <br>characters like spaces and other special symbols.  This is accomplished with the \t escape
 * <br>symbols.  The following example adds the space and comma to the alpha-numeric character set
 * <br>String strNameMask = "\t ,\tc".  The escape filter must always be specified first,
 * <br>followed my the format mask.  In the example, the space and comma characters are defined in
 * <br>between the \t pairs.  The 'c' symbol is for the alphanumeric character set, which does not
 * <br>include spaces or commas.
 * <br>
 * <br>If only one format symbol is specified in the mask, the format symbol applies for the
 * <br>maximum allowed length of the data.  If more than one format symbol is repeated, the mask
 * <br>is the number of format symbols (replication length).  E.g., a format of "c" applies
 * <br>to the total length of the data, but a format of "ccccc" allows only 5 characters.
 * <br>A Social Security mask is defined as follows: "999-99-9999".  Notice that 9's, not #'s,
 * <br>are used as Social Security numbers are not numeric (used in mathematical operations).
 * <br>A salary mask is defined as follows: "###,###.##".  The "#" denotes a numeric mask, and
 * <br>has additional constraints.  The numeric masks may only have the comma delimiters, one
 * <br>decimal point, an appropriate currency symbol (like a dollar or English pound symbol),
 * <br>and a '+' a '-' or the '!'(suppress leading spaces) sign.  If the data allows negative numbers, the minus sign must be included
 * <br>at the beginning of the mask, i.e., "-###.#####".  Numeric numbers are always left justified
 * <br>based on the length of the mask.  The default fill character is a space but may be overridden by placing
 * <br>a different character as the first character in the mask. i.e."*-###,###.##" uses an asterisk to left
 * <br>fill unused digits. The '!' as the first character suppress leading spaces if the fill character is space.
 * <br>Truncation exceptions are thrown if the length of the data ,would cause high order truncation.
 * <br>
 * <br>The following symbols are reserved as format delimiters:
 * <br>@  - at sign
 * <br>.  - period
 * <br>-  - minus sign
 * <br>+  - plus sign
 * <br>!  - Exclamation or not sign
 * <br>(  - left paren
 * <br>)  - right paren
 * <br>[  - left bracket
 * <br>]  - right bracket
 *
 */
function VwEdit( strMask, vwresourceMgr )
{

  const  m_strMaskList = "XxAa9cl*";  // The format mask characters
  const  m_strDelimList= "@.+-()[]";  // The special reserved delimiters
  const m_astrPreDefNames = [ "SSN", "ZIP5", "ZIP9", "PHONENBR", "PHONEAREA",
    "PERSON_NAME_FULL", "PERSON_NAME", "ADDRESS",
    "FILENAME", "FILEPATH", "MONEY", "MONEY$",
    "MONEY$$", "MONEY_CHECK" ];

  const m_astrPreDefValues = [VwEdit.SSN, VwEdit.ZIP5, VwEdit.ZIP9, VwEdit.PHONENBR, VwEdit.PHONEAREA,
                            VwEdit.PERSON_NAME_FULL, VwEdit.PERSON_NAME, VwEdit.ADDRESS,
                            VwEdit.FILENAME, VwEdit.FILEPATH, VwEdit.MONEY, VwEdit.MONEY$,
                            VwEdit.MONEY$$, VwEdit.MONEY_CHECK ];

  let    m_strMask;                   // The edit mask used for this instance
  let    m_date = null;            // Used for date masks
      
  let    m_nMaxChars = 0;             // Max characters allowed, 0 = unlimited
  let    m_nMinChars = 0;             // Minimum characters required
  let    m_strFilter = "";            // Additional optional character filter
  let    m_strAllowableChars;         // The allowable characters according to mask
  let    m_dlmsValues = null;         // Value/ranges
  let    m_strSeparators = ",";       // Default value/range separators
  let    m_fIsDate = false;           // Returns true if mask is a date mask
  let    m_fIsNumeric = false;        // Returns true if mask is numeric
  let    m_fIsDecimal = false;        // Returns true if mask has decimals
  let    m_fRequiredEntry = false;    // If true, data length cannot be 0
  let    m_fMaskOverride = false;     // If true max overrides max input length
  let    m_fInValidation = false;
  let  m_chValueSep = ",";          // Value separator
  let   m_chRangeSep = "-";          // Range separator
  let  m_chFillCharacter = " ";     // Fill character for padding
  let  m_fCaseCompare = true;       // Used in value range tests


  m_strAllowableChars = null;  // The default setting

  // PUBLIC

  this.getPredefinedMaskNames = getPredefinedMaskNames;

  this.getPredefinedMaskValues = getPredefinedMaskValues;

  this.getPredefinedMaskValue = getPredefinedMaskValue;

  this.setEditMask = setEditMask;

  this.getEditMask = getEditMask;

  this.setDataDictionary = setDataDictionary;

  this.setMaxCharsAllowed = setMaxCharsAllowed;

  this.getMaxCharsAllowed = getMaxCharsAllowed;

  this.setRequiredEntry = setRequiredEntry;

  this.getRequiredEntry = getRequiredEntry;

  this.setMinCharsRequired = setMinCharsRequired;

  this.getMinCharsRequired = getMinCharsRequired;

  this.getAllowableCharacters = getAllowableCharacters;

  this.setValuesRanges = setValuesRanges;

  this.getValuesRanges = getValuesRanges;

  this.setValueSeparator = setValueSeparator;

  this.getValueSeparator = getValueSeparator;

  this.setRangeSeparator = setRangeSeparator;

  this.getRangeSeparator = getRangeSeparator;

  this.setCaseSensitivity = setCaseSensitivity;

  this.getCaseSensitivity = getCaseSensitivity;

  this.getFilter = getFilter;

  this.isDate = isDate;

  this.isNumeric = isNumeric;

  this.hasDecimals = hasDecimals;

  this.isValid = isValid;

  this.validate = validate;

  this.formatNumber = formatNumber;

  this.format = format;

  this.isValidNumericMask = isValidNumericMask;

  this.setFillCharacter = setFillCharacter;

  try
  {
    
    if ( strMask )
    {
      setEditMask( strMask );
    }
    else
    {
      setEditMask( "*" );

    }
    
    determineAllowableCharacters();
  }
  catch( Error  )
  { ; }


  /**
   * Returns an array of predefined edit mask names
   * @return
   */
  function getPredefinedMaskNames()
  { return m_astrPreDefNames; }
  
  /**
   * Returns an array predefined edit mask values
   * @return
   */
  function getPredefinedMaskValues()
  { return m_astrPreDefValues; }
  
  /**
   * Returns a predefined edit mask value for the index specified
   * @param ndx The predefined mask value to get
   * @return
   */
  function getPredefinedMaskValue( ndx )
  { return m_astrPreDefValues[ ndx ]; }
  
  
  /**
   * Sets the edit mask for formatting and data validation
   *
   * @param strMask - The edit mask to be set
   *
   * @exception throws VwInvalidMaskException if the mask has invalid format characters
   */
  function setEditMask( strMask ) 
  {
    // *** Treat an empty var  like an asterisk
    if ( strMask == null )
    {
      m_strMask = "*";
      return;
    }

    if ( strMask.length == 0 )
    {
      m_strMask = "*";
      return;
    }

    m_strMask = splitMask( strMask );

    let nPos = m_strMask.indexOf( '%' );
    if ( nPos >= 0 )
    {
      if ( nPos < ( strMask.length - 1 ) )
      {
        const  ch = strMask.charAt( nPos + 1 );

        if ( VwExString.isCharIn( ch, "AaBbdHImMSyY" ) )
        {
          m_fIsDate = true;
          m_strMask = strMask;
          m_date = new Date( );
          m_nMaxChars = 0;

          return;
        }

      } // end if

    } // end if ( nPos >= 0 )

    getMaxCharsAllowedFromMask();

    if ( m_strMask.indexOf( '#' ) >= 0 )
    {
      if ( !isValidNumericMask( m_strMask ) )
      {
        var str = vwresourceMgr.getString( "VVwEdit.InvalidNumericMask" );
        throw new str;
      }

    }

    determineAllowableCharacters();
  } // end setEditMask()


  /**
   * Gets the edit mask defined for this instance
   *
   * @return a var  containing the edit mask define for this instance
   */
  function getEditMask()
  { return m_strMask; }


  /**
   * Sets the data dictionary object with the data dictionary values
   *
   * @param itcDictionaryObj - The VwDataDictionary object with the data dictionary contstraints
   *
   * @exception throws Exception if the expected data dictionary keys are not present
   */
  function setDataDictionary( vwDictionaryObj )
  {
    setEditMask( itcDictionaryObj.getString( VwDataDictionary.EDIT_MASK ) );
    setValuesRanges( itcDictionaryObj.getString( VwDataDictionary.VALUES_RANGES ) );
    setMaxCharsAllowed( itcDictionaryObj.getInt( VwDataDictionary.MAX_INPUT ) );
    setMinCharsRequired( itcDictionaryObj.getInt( VwDataDictionary.MIN_INPUT ) );

    var strVal = vwDictionaryObj.getString( VwDataDictionary.VALUE_SEP );
    if ( strVal.length == 1 )
    {
      setValueSeparator( strVal.charAt( 0 ) );
    }  
    else
    {
      setValueSeparator( ',' );     // Comma is the default
    }
    
    strVal = vwDictionaryObj.getString( VwDataDictionary.RANGE_SEP );
    if ( strVal.length == 1 )
    {
      setRangeSeparator( strVal.charAt( 0 ) );
    }  
    else
    {
      setRangeSeparator( '-' );     // Hyphen is the default
    }  

    if ( itcDictionaryObj.getInt( VwDataDictionary.ENTRY_REQUIRED ) > 0 )
    {
      setRequiredEntry( true );
    }  
    else
    {
      setRequiredEntry( false );
    }  

  } // end setDataDictionary()


  /**
   * Sets the maximum number of input characters for the text field associated with the edit object
   *
   * NOTE: Upon construction, this value is 0, which permits an unlimited number of characters
   *
   * @param nMaxChars - The maximum number of characters allowed (0 = unlimited)
   */
  function setMaxCharsAllowed( nMaxChars )
  { if ( !m_fMaskOverride ) m_nMaxChars = nMaxChars; }


  /**
   * Gets the current property setting for the maximum number of input characters allowed
   *
   * @return An var  containing the maximum input characters allowed
   */
  function getMaxCharsAllowed()
  { return m_nMaxChars; }


  /**
   * Sets the required data flag (data length must be > 0)
   *
   * @param fRequired - True if data is required; False if it is not
   */
  function setRequiredEntry( fRequiredEntry )
  { m_fRequiredEntry = fRequiredEntry; }


  /**
   * Gets the required data flag property setting
   *
   * @return True if data is required; False if it is not
   */
  function getRequiredEntry()
  { return m_fRequiredEntry; }

  /**
   * Sets the minimum number of characters required for the text field associated with the edit object
   *
   * @param nMinChars - The minimum number of characters required
   */
  function setMinCharsRequired( nMinChars )
  { m_nMinChars = nMinChars; }


  /**
   * Gets the current property se3tting for the minimum number of input characters required
   *
   * @return An integer containing the minimum characters required
   */
  function getMinCharsRequired()
  { return m_nMinChars; }


  /**
   * Returns the allowable characters based upon the edit mask supplied
   *
   * @return A var  containing the allowable characters
   */
  function getAllowableCharacters()
  { return m_strAllowableChars; }


  /**
   * Sets the values and ranges allowed.  The default value separator is the comma, and
   * the default range separator is the hyphen.
   *
   * @param strValuesRanges - The values and ranges string
   *
   * @exception - throws Exception if the value range data types conflict with
   * the edit mask defined
   */
  function setValuesRanges(  strValuesRanges )
  {
    if ( m_dlmsValues == null )
    {
      m_dlmsValues = new VwDelimString( [ m_chValueSep ], strValuesRanges );
    }
    else
    {
        m_dlmsValues.setContents( strValuesRanges );
    }

    // *** Make sure value ranges data types agree with edit mask specified

    validateValuesToMask();

  } // end setValuesRanges()


  /**
   * Sets the values and ranges allowed.  The default value separator is the comma, and
   * the default range separator is the hyphen.
   *
   * @param dlmsValuesRanges - An VwDelimString with the values and ranges
   *
   * @exception throws Exception if the values or range data types conflict with
   * the edit mask defined.
   */
  function setValuesRanges( dlmsValuesRanges )
  {
    dlmsValuesRanges.setDelimList( [m_chValueSep] );

    if ( m_dlmsValues == null )
    {
      m_dlmsValues = new VwDelimString( dlmsValuesRanges );
    }
    else
    {
      m_dlmsValues = dlmsValuesRanges;
    }

    // *** Make sure value ranges data types agree with edit mask specified

    validateValuesToMask();

  } // end setValuesRanges()


  /**
   * Gets the current values and ranges of the edit object
   *
   * @return VwDelimString containing the current values/ranges (may be null)
   */
  function getValuesRanges()
  { return m_dlmsValues; }


  /**
   * Sets the character used to separate the value list
   *
   * @param ch - The value separator character
   */
  function setValueSeparator( ch )
  { m_chValueSep = ch; }


  /**
   * Returns the current value separator
   *
   * @return A var  containing the value separator
   */
  function getValueSeparator()
  { return m_chValueSep; }


  /**
   * Sets the character used to separate the range (low - high) values
   *
   * @param ch - The range separator character
   */
  function setRangeSeparator( ch )
  { m_chRangeSep = ch; }

  /**
   * Returns the current range separator
   *
   * @return A var  containing the range separator
   */
  function getRangeSeparator()
  { return m_chRangeSep; }


  /**
   * Turns On/Off the value/range case sensitivity
   *
   * @param fOn - If True, value/range tests are case sensitive; if False, case is ignored
   */
  function setCaseSensitivity( fOn )
  { m_fCaseCompare = fOn; }


  /**
   * Gets the current case sensitivity property
   *
   * @return True if value/range tests are case sensitive; False if case is ignored
   */
  function getCaseSensitivity()
  { return m_fCaseCompare; }


  /**
   * Gets additional allowable filter characters in addition to what the mask allows
   *
   * @return A var  containing the allowable characters
   */
  function getFilter()
  { return m_strFilter; }


  /**
   * Returns true if the edit mask is a date mask
   *
   * @return True if the mask is a date mask; otherwise False is returned
   */
  function isDate()
  { return m_fIsDate; }


  /**
   * Determines if the edit mask is numeric
   *
   * @return True if the mask is numeric; otherwise False is returned
   */
  function isNumeric()
  { return m_fIsNumeric; }


  /**
   * Determines if the edit mask has decimal places
   *
   * @return True if the mask has decimal places; otherwise False is returned
   */
  function hasDecimals()
  { return m_fIsDecimal; }


  /**
   * Tests to see if a character is valid according to the given edit mask or character filter
   *
   * @param ch - The character to test
   *
   * @return True if the character is valid; otherwise False is returned
   */
  function isValid( ch )
  {
    if ( m_strMask.startsWith( "*" ) )
    {
      return true;
    }

    if ( m_fIsNumeric )
    {
      var  strAllowList = "+-";

      if ( m_fIsDecimal )
      {
        strAllowList += ".";
      }

      // *** if character is not a dgit it can only be a +- or decimal point

      if ( ! Character.isDigit( ch ) )
      {

        // Make sure non dgit character is a plus, miuns or decimal point

        if ( !VwExString.isin( ch, strAllowList ) )
          return false;
      }

      // *** If we get here it's a digit or allowable character so we're ok

      return true;

    } // end if( m_IsNumeric )

    // *** Character format and date tests ***

    if ( Character.isDigit( ch ) )
    {
      if ( VwExString.findAny( m_strMask, "xXCc#9mMdyYhHsS", 0 ) >= 0 )
      {
        return true;
      }

      return false;
    }


    if ( Character.isLetter( ch ) )
    {
      if ( VwExString.findAny( m_strMask, "xXaAcC", 0 ) >= 0  )
      {
        return true;
      }

      return false;
    }

    if ( m_strMask.indexOf( ch ) >= 0 )
    {
      return true;
    }

    if ( m_strFilter.indexOf( ch ) >= 0 )
    {
      return true;

    }

    return false;             // Not legal

  } // end isValid()


  /**
   * Validates the data against all the defined constraint properties, values, and ranges
   *
   * @param strData - The data to validate
   *
   * @exception throws Exception if any of the validation constraints fail
   */
  function validate( strData )
  {
    if ( strData == null )
    {
      strData = "";

    }
    
    // *** See if data entry is mandatory

    if ( m_fRequiredEntry && strData.length == 0 )
    {
      if ( m_nMinChars > 0 ) // Format msg with the min chars need
      {
        var  strMsg = "MinCharsNotMet";
        throw strMsg;
      }
      else
      {                   // Format a generic data required message
        throw "Data Entry Required";
      }
    }

    // *** If data is entered check for minimum length

    if ( strData.length > 0 )
    {
      if ( m_nMinChars > 0 && ( strData.length < m_nMinChars ) )
      {
        var  strMsg = "MinCharsNotMet";
        throw strMsg;

      } // end if


      if ( m_nMaxChars > 0 && strData.length > m_nMaxChars )
      {
        var  strMsg = "Exceeds MaxCharsAllowed"
        throw strMsg;
      } // end if

    } // end if (strData.length > 0 )

    m_fInValidation = true;

    format( strData );

    m_fInValidation = false;

    // *** Test any values or ranges defined

    testValuesRanges( strData );

  } // end validate()


  /**
   * Formats the short value into a var  according to the edit mask
   *
   * @param sNumber - The short value to format
   *
   * @return - A var  containing the data formatted according to the edit mask
   *
   * @exception throws Exception if the input data violates the allowable characters in the
   * edit mask or filter.
   */
  function formatNumber( nNumber )
  { return format( nNumber.toString() ) }




  /**
   * Formats the var  input data according to the edit mask
   *
   * @param strData - The data to format
   *
   * @return - A var  containing the data formatted according to the edit mask
   *
   * @exception throws Exception if the input data violates the allowable characters in the
   * edit mask or filter.
   */
  function format( strData )
  {
    if ( strData == null )
    {
      throw "Null Data";
    }
    
    if ( !m_fInValidation )
    {
      validate( strData );
    }
    
    // *** if data length is 0 theres nothing more to do here

    if ( strData.length == 0 )
    {
      return strData;              // Nothing to edit
    }
    
    if ( isDate() )
    {
      m_date.setDate( strData, m_strMask );
      
      if ( !m_date.isValid() )
      {
        throw "Invalid Date";
      }
      
      return m_itcDate.format();

    } // end if ( isDate() )

    if ( m_strMask.indexOf( '#' ) >= 0 )
    {
      return doNbrFormat( strData );
    }
    
    return doCharacterFormat( strData );

  } // end format()


  /**
   * Formats an input var  with numeric data according to the edit mask.  Formatting is
   * done from right to left.
   *
   * @param strData - A var  with the numeric data to format
   *
   * @return - A var  containing the data formatted according to the edit mask
   *
   * @exception throws VwIllegalCharException, VwNumericTruncationException, or
   * VwIllegalValueException if the input data violates the allowable characters in the
   * edit mask or filter.
   */
  function doNbrFormat( strData, fStripLeading )
  {
    
    var fIsNegative = ( strData.indexOf( '-' ) >= 0 );

    strData =  VwExString.strip( strData, " $,+-" );

    var strDecimal = null;

    var fFloating$Sign = false;
    var fSuppressLeadingSpaces = false;
    
    // ***  if there is decimal data then the decimal portion is formatted left to right
    // *** zero padded

    var  nDollarPos = m_strMask.indexOf( '$' );
    
    if ( nDollarPos >= 0 )
    {
      if ( m_strMask.charAt( nDollarPos + 1 ) == '$')
      {
        fFloating$Sign = true;
      }
       
    }
    
     
    var  nMaskPos = m_strMask.indexOf( '.' );
    var  nStart = strData.indexOf( '.' );

    if ( nMaskPos >= 0 )              // We have a decimal point
    {
      ++nMaskPos;                     // Bypass decimal point

      var sb = new VwStringBuffer();

      if ( nStart < 0 )           // Mask had decimal places but actual data did not so
      {                           // append a zero for each decimal position defined in the mask
        // *** how many places were defined in the mask

        var  nNbrDecPos = m_strMask.length - nMaskPos;

        for ( var  x = 0; x < nNbrDecPos; x++ )
        {
          sb.append( '0' );  // append zeroes
        }

      } // end if

      else                      // Data had decimal positions
      {
        ++nStart;
        var  nDataLen = strData.length;
        var  nMaskLen = m_strMask.length;

        while( nMaskPos < nMaskLen )
        {
          if ( nStart < nDataLen )
          {
            if ( m_strMask.charAt( nMaskPos ) == '#' )
            {
              if ( !Character.isDigit( strData.charAt( nStart ) ) )
              {
                throw  vwresourceMgr.getString( "VVwEdit.NotDigit" );
              }
              else
              {
                sb.append( strData.charAt( nStart ) );
              }
            }
            else
            {
              if ( m_strMask.charAt( nMaskPos ) == '$' && fFloating$Sign && m_strMask.charAt( nMaskPos + 1 ) != '$' )
              {
                sb.append( m_strMask.charAt( nMaskPos ) );
              }
            }
          }
          else
          {
            if ( m_strMask.charAt( nMaskPos ) == '#' )
            {
              sb.append( '0' );
            }            // Format var  longer than data so append zeroes
            else
            {
              sb.append( m_strMask.charAt( nMaskPos ) );
            }  // Use the decimal data
          }

          ++nMaskPos;                        // Look at next characters
          ++nStart;

        } // end while

      } // end else

      strDecimal = sb.toString();

      nMaskPos = m_strMask.indexOf( '.' ) - 1;

    } // end if

    else
    {
      nMaskPos = m_strMask.length - 1;
    }   // No decimal point in mask so start at last mask character

    // *** Next move right to left to format the base number

    var  nDataPos = ( nStart < 0 )? strData.length - 1 : strData.indexOf( '.' ) - 1;

    var  nMaskLen = m_strMask.length;

    if ( m_strMask.charAt( 0 ) == m_chFillCharacter || m_strMask.charAt( 0 ) == '!')
    {
      --nMaskLen;
    }

    var sbNumber = new VwStringBuffer();

    for ( var  x = 0; x < nMaskLen; x++ )
    {
      sbNumber.append( '~' );
    }

    var  nNbrPos = sbNumber.length() - 1;

    while( nMaskPos >= 0 )
    {
      // if data is less than the mask, we are all done

      if ( nDataPos < 0 )
      {
        break;
      }

      if ( nMaskPos == 0 && m_strMask.charAt( 0 ) == m_chFillCharacter )
      {
        break;
      }

      if ( m_strMask.charAt( nMaskPos ) == '#' )
      {
        if ( isNaN( strData.charAt( nDataPos ) ) )
        {
          throw "Number to format " + strData + "contains non digit character " + strData.charAt( nDataPos );
        }
        else
        {
          sbNumber.setCharAt( nNbrPos, strData.charAt( nDataPos-- ) );
        }

      } // end if

      else   // Delimiter character
      {
        if ( m_strMask.charAt( nMaskPos ) == '$' )
        {
          if ( fFloating$Sign &&  m_strMask.charAt( nMaskPos +1 ) != '$') 
          {
            sbNumber.setCharAt( nNbrPos, m_strMask.charAt( nMaskPos ) );
          }
        }
        else
        {
          sbNumber.setCharAt( nNbrPos, m_strMask.charAt( nMaskPos ) );
        }
      }

      --nMaskPos;
      --nNbrPos;

    } // end while()

    if ( nDataPos >= 0 )
    {
      throw "SignificantTruncation";
    }

    var  fNeedPlus = false;
    var  fNeedMinus = false;

    while( nMaskPos >= 0 )
    {
      var  ch = m_strMask.charAt( nMaskPos );

      if ( nMaskPos == 0 && ch == m_chFillCharacter )
      {
        break;
      }        // All Done

      switch( ch )
      {
        case '+':

             if ( !fIsNegative )
             {
               fNeedPlus = true;
             }
             break;

        case '-':

             if ( fIsNegative )
             {
               fNeedMinus = true;
             }

             break;

        case '#':
        case ',':

             // *** Pad with fill character for unused position unless floating dollar sign is requested

             if ( !fFloating$Sign )
             {
               sbNumber.setCharAt( nNbrPos--, m_chFillCharacter );
             }
             break;

        case '$':
          
             if ( fFloating$Sign && sbNumber.charAt( nNbrPos + 1 ) == '$' )
             {
               --nNbrPos;
             }
             else
             {
               sbNumber.setCharAt( nNbrPos--, ch );
             }

             break;
               
        case '!':
          
             if ( nMaskPos > 0 )
             {
               throw  "Invalid mask, the '~' character must be the first character in the mask";
             }

             fSuppressLeadingSpaces = true;
             break;
             
        default:

             
             sbNumber.setCharAt( nNbrPos--, ch );
             break;

      } // end switch()

      --nMaskPos;

    } // end while()

    if ( fNeedPlus || fNeedMinus )
    {
      var  x;

      for ( x = 0; (sbNumber.charAt( x ) == '~' || sbNumber.charAt( x ) == ' ' || sbNumber.charAt( x ) == '$'  ); x++ );
      if ( fNeedPlus )
      {
        sbNumber.setCharAt( x - 1, '+' );
      }
      else
      {
        sbNumber.setCharAt( x - 1, '-' );
      }
    }


    if ( strDecimal != null )
    {
      sbNumber.append( '.' ).append( strDecimal );
    }

    var  strResult = VwExString.strip( sbNumber.toString(), "~" );
    
    if ( fSuppressLeadingSpaces )
    {
      strResult = strResult.trim();
    }

    return strResult;

  } // end doNbrFormat()


  /**
   * Formats an input var  with character data according to the edit mask.  Formatting is
   * done from right to left and padded with blanks.
   *
   * @param strData - A var  with the data to format
   *
   * @return - A var  containing the data formatted according to the edit mask
   *
   * @exception throws Exception if the input data violates the allowable characters in the
   * edit mask or filter.
   */
  function doCharacterFormat( strData )
  {
    var  nMaskPos = -1;
    var  nDataPos = 0;


    if ( m_strMask.length == 1 && m_strMask.charAt( 0 ) == '*' )
    {
      return strData;       // There is no format '*' allows any character and a single
                            // format charcater applies to the exact length of the input data
    }

    var sb = new VwStringBuffer();


    // *** We now have two genral format possibllites. if the format mask is only one character
    // *** we test the validity in the data only. If it is more than one character then a
    // *** combination mask and data scan is done with padding or truncation done if necessary

    if ( m_strMask.length == 1 )
    {
      var  chMask = m_strMask.charAt( 0 );

      while( nDataPos < strData.length )
      {
        sb.append( testAndXlateChar( chMask, strData.charAt( nDataPos ) ) );
        ++nDataPos;

      } // end while

    } // end if

    else
    {

      while( ( ++nMaskPos < m_strMask.length && nDataPos < strData.length ))
      {
        var  chMask = m_strMask.charAt( nMaskPos );
        var  chData = strData.charAt( nDataPos );

        if ( m_strDelimList.indexOf( chMask ) >= 0 )
        {
          if ( chMask == chData )
          {
            sb.append( chMask );
            ++nDataPos;
          }
          else
          {
            sb.append( chMask );
          }
        }
        else
        if ( m_strMaskList.indexOf( chMask ) < 0 )
        {
          sb.append( chMask );      // user defined format symbol just add it to the output
        }
        else
        {
          sb.append( testAndXlateChar( chMask, chData ) );
          ++nDataPos;
        }

      } // end while()

      if ( nMaskPos < m_strMask.length || nDataPos < strData.length )
      {
        throw vwresourceMgr.getString( "VVwEdit.DataMisMatch" );
      }

      while( nMaskPos < m_strMask.length )
      {
        sb.append( ' ' );
        ++nMaskPos;
      }

    } // end else

    return sb.toString();

  } //end doCharacterFormat()


  /**
   * Validates the given character according to the mask format character, and does a case
   * translation for the character, if necessary.
   *
   * @param chMask - The format mask character
   * @param chData - The data character to be validated and formatted
   *
   * return - The character formatted if the validation succeeds
   *
   * @exception throws VwIllegalCharException if the charater violates the edit mask specification
   */
  function testAndXlateChar( chMask, chData )
  {
    // *** If the character is in the apecial allowable filter list then it passes the test
    // *** so we just return back that same character

    if ( m_strFilter.indexOf( chData ) >= 0 )
    {
      return chData;
    }

    switch( chMask )
    {
      case '*':

           return chData;        // '*' = anything allowed

      case 'x':                  // Alpha numeric and convert to lower case

           if ( !Character.isLetterOrDigit( chData ) )
           {
             throw vwresourceMgr.getString( "VVwEdit.NotAlphaNum" );
           }

           // Convert character to lower case

           return Character.toLowerCase( chData );

      case 'X':                  // Alpha numeric and convert to UPPER case

            if ( !Character.isLetterOrDigit( chData ) )
            {
              throw vwresourceMgr.getString( "VVwEdit.NotAlphaNum" );
            }
            // Convert character to lower case

            return Character.toUpperCase( chData );

      case 'c':                  // Alpha numeric any case

           if ( !Character.isLetterOrDigit( chData ) )
           {
             throw vwresourceMgr.getString( "VVwEdit.NotAlphaNum" );
           }
           // Convert character to lower case

           return chData;

      case 'l':                  // Alpha any case

            if ( !Character.isLetter( chData ) )
            {
              throw vwresourceMgr.getString( "VVwEdit.NotAlpha" );
            }

            return chData;

       case 'a':                // Alpha only and convert to lower case

            if ( !Character.isLetter( chData ) )
            {
              throw new
                      VwIllegalCharException( vwresourceMgr.getString( "VVwEdit.NotAlpha" ) );
            }
            // Convert character to lower case

            return Character.toLowerCase( chData );

      case 'A':                // Alpha only and convert to UPPER case

           if ( !Character.isLetter( chData ) )
           {
             throw vwresourceMgr.getString( "VVwEdit.NotAlpha" );
           }

           // Convert character to lower case

           return Character.toUpperCase( chData );

      case '9':                // Digit 0 - 9 only

           if ( !Character.isDigit( chData ) )
           {
             throw vwresourceMgr.getString( "VVwEdit.NotDigit" );
           }

           return chData;

      default:

           // *** This is a delimiter character

           return chMask;

    } // end switch()

  } // end testAndXlateChar()


  /**
   * Tests the given numeric format mask for validity.  The rules are:
   *   1. It may start with a fill character a space or zero or asterisk
   *      are the allowed fill characters or the $,+,- characters
   *   I.e The following format "0###" for the number 12 produces 012 as the result
   *
   *   2. It may contain only one decimal point
   *   3. It may contain commas after the start of a # character, but no other character
   *      other than one decimal point
   *
   * @param strMask - The edit mask to test
   *
   * @return - True if the numeric edit mask is valid; otherwise False is returned
   */
  function isValidNumericMask(  strMask )
  {
    m_chFillCharacter = ' ';
    
    var  nPos = strMask.indexOf( '#' );

    var  strPrefix = "";

    if ( nPos > 0 )
    {
      strPrefix = strMask.substring( 0, nPos );
    }

    var  fGotDollar = false;
    var  fGotPlus = false;
    var  fGotMinus = false;
    var  fGotDecimal = false;
    var  fGotFillChar = false;

    for ( var  x = 0; x < strPrefix.length; x++ )
    {
      switch( strPrefix.charAt( x ) )
      {
        case '$':

          if ( fGotDollar )
          {
            if ( x > 1 )
            {
              return false;      // no more that two allowed - two $$ means floating dollar sign
            }

          }

          if ( x > 1 && !fGotFillChar )
          {
            return false;      // Dollar sign can only be the first character
          }

          fGotDollar = true;

          break;

        case '+':

              if ( fGotPlus )      // Only one allowed
              {
                return false;
              }

              fGotPlus = true;

             break;

        case '-':

             if ( fGotMinus )     // Only one allowed
             {
               return false;
             }

             fGotMinus = true;

             break;

        case ' ':
        case '0':
        case '*':

             if ( x > 0 )        // Fill character must be the first character
             {
               return false;
             }

             m_chFillCharacter = strPrefix.charAt( x );
             fGotFillChar = true;
             break;

        case '!':
        
             if ( x > 0 )
             {
               return false;
             }
             
             break;
             
        default:

             return false;        // Invalid character

      } // end swich()

    } // end for()

    // *** Prefix passed, now test rest of mask

    for ( var  x = nPos; x < strMask.length; x++ )
    {

      switch( strMask.charAt( x ) )
      {

        case '#':
             break;               // OK

        case ',':

             if ( strMask.charAt( x - 1 ) == ',' )
             {
               return false;
             }      // commas can only be three appart

             if ( ( x - 2 ) >= 0 )
             {
               if ( strMask.charAt( x - 2 ) == ',' )
               {
                 return false;
               }    // commas can only be three appart

             }
             break;

         case '.':

              if ( fGotDecimal )
              {
                return false;
              }   // Only one allowed

              fGotDecimal = true;

              break;

        default:

              return false;      // No othe characters allowed

      } //end switch()

    } // end for()

    m_fIsNumeric = true;         // This is a numeric mask

    if ( fGotDecimal )
    {
      m_fIsDecimal = true;
    }       // This mask also has decimal places

    return true;                 // Numeric edit mask is valid

  } // end isValidNumericMask()


  /**
   * Splits out the filter characters, delimited by the backslash, from the given edit mask.
   * The filter characters of the current edit object are initialized with the filter
   * characters split from the given edit mask.
   *
   * @param strMask - An edit mask which includes filter characters
   *
   * @return - A var  containing the edit mask with the filter characters removed.
   * The filter characters of the current edit object are initialized with the filter
   * characters split from the strMask parameter.
   */
  function splitMask( strMask )
  {
    var  nPosBack1 = strMask.indexOf( '\t' );
    var  nPosBack2 = 0;

    if ( nPosBack1 == 0 )
    {
      nPosBack2 = strMask.indexOf( '\t', 1 );
    }

    if ( nPosBack1 > 0 )
    {
      throw vwresourceMgr.getString( "VVwEdit.InvalidMask" );
    }

    if ( nPosBack1 == 0 && nPosBack2 < 0 )
    {
      throw vwresourceMgr.getString( "VVwEdit.InvalidMask" );
    }

    if ( nPosBack1 == 0 )
    {
      m_strFilter = strMask.substring( 1, nPosBack2 );
      strMask = strMask.substring( nPosBack2 + 1 );
    }

    return strMask;

  } // end splitMask()


  /**
   * Sets the fill character to be used on numeric masks 
   * @param chFilCharacter
   */
  function  setFillCharacter( chFilCharacter )
  { m_chFillCharacter = chFilCharacter; }
  
  
  /**
   * Determines the characters allowed by the edit mask
   */
  function determineAllowableCharacters()
  {
    // *** Determine allowable characters

    if ( m_fIsDate )
    {
      m_strAllowableChars= vwresourceMgr.getString( "VVwEdit.DateAllowed" );
      return;
    }

    // *** Numeric mask that is is for mathimatical operations

    if ( m_strMask.indexOf( '#' ) >= 0 )
    {
      m_strAllowableChars = vwresourceMgr.getString( "VVwEdit.DigitsAllowed" ) + ",+-";

      if (m_strMask.indexOf( '.' ) >= 0 )
        m_strAllowableChars += " " + vwresourceMgr.getString( "VVwEdit.And" )
                            + " " + vwresourceMgr.getString( "VVwEdit.DecimalPoint" );
      return;

    }

    // *** Numeric mask that is not used for mathimatical operations

    if (m_strMask.indexOf( '9' ) >= 0 )
    {
      m_strAllowableChars = vwresourceMgr.getString( "VVwEdit.DigitsAllowed" );

      var  strDelimSet = getDelimiterSet();
      if ( strDelimSet != null )
        m_strAllowableChars += ", " + vwresourceMgr.getString( "VVwEdit.And" )
                            +  " " + vwresourceMgr.getString( "VVwEdit.Following" ) + strDelimSet;

      if ( m_strFilter.length > 0 )
      {
        if ( strDelimSet == null )
        {

          m_strAllowableChars += ", " + vwresourceMgr.getString( "VVwEdit.And" )
                              + " " +  vwresourceMgr.getString( "VVwEdit.Following" );
        }

        m_strAllowableChars += m_strFilter;

      } // end if

      return;

    } // end if

    if ( VwExString.findAny( m_strMask, "Xxc", 0 ) >= 0 )
    {
      m_strAllowableChars = vwresourceMgr.getString( "VVwEdit.CharsAllowed" )
                          + ", " + vwresourceMgr.getString( "VVwEdit.DigitsAllowed" );
    }
    else
    if ( VwExString.findAny( m_strMask, "Aal", 0 ) >= 0 )
    {
      m_strAllowableChars= vwresourceMgr.getString( "VVwEdit.CharsAllowed" );
    }

    var  strDelimSet = getDelimiterSet();

    if ( strDelimSet != null )
      m_strAllowableChars += ", " + vwresourceMgr.getString( "VVwEdit.VVwEdit.And" )
                          + " " + vwresourceMgr.getString( "VVwEdit.Following" )
                          + strDelimSet;

    if ( m_strFilter.length > 0 )
    {

      if ( strDelimSet == null )
      {
        m_strAllowableChars += ", " + vwresourceMgr.getString( "VVwEdit.And" )
                            + " " +  vwresourceMgr.getString( "VVwEdit.Following" );
      }

      m_strAllowableChars+= m_strFilter;
    }

  } // end determineAllowableCharacters()


  /**
   * Returns the delimiter set used in the current edit mask
   *
   * @return A var  containing the delimiter set; null if no delimiters are found
   */
  function getDelimiterSet()
  {
    var  nLen = m_strMask.length;
    var  strDelim = "";

    for ( var  x = 0; x < nLen; x++ )
    {
      if ( VwExString.isin( m_strMask.charAt( x ), m_strDelimList ) )
      {
        strDelim += m_strMask.charAt( x );
      }
    }

    if ( strDelim.length > 0 )
    {
      return strDelim;
    }

    return null;           // No delimiters found

  } // end getDelimiterSet()


  /**
   * Tests the data against the current values and ranges to insure the value and range
   * constraints are met.
   *
   * @param strData - A var  with the data to test
   *
   * @exception throws VwIllegalValueException if the data violates the value or range constraints
   */
  function testValuesRanges( strData )
  {
    var  strValue;             // Single value from list in delimited string

    if ( m_dlmsValues == null )
      return;

    if ( m_dlmsValues.toString().length == 0 )
    {
      return;
    }                    // Nothing to test

    m_dlmsValues.reset();

    if ( isDate() )
    {
      var itcTestDate = new VwDate( strData, m_strMask );

      var itcDate = new VwDate();
      var itcDateLo = new VwDate();
      var itcDateHi = new VwDate();

      while( (strValue = m_dlmsValues.getNext()) != null )
      {
        // *** Test to see if this piece is a range

        var  nPos = strValue.indexOf( m_chRangeSep );

        if ( nPos > 0 )
        {
          itcDateLo.setDate( strValue.substring( 0, nPos ), m_strMask );
          itcDateHi.setDate( strValue.substring( nPos + 1 ), m_strMask );

          if ( itcTestDate.gtEq( itcDateLo ) &&  itcTestDate.ltEq( itcDateHi ) )
            return;              // A constraint is satisfied and we're all done
        }
        else
        {
          itcDate.setDate( strValue, m_strMask );
          if ( itcTestDate.equals( itcDate ) )
          {
            return;
          }              // A constraint is satisfied and we're all done
        }

      } // end while()

      // *** If we get here the data did not meet the constraints so throw the exception

      throw vwresourceMgr.getString( "VVwEdit.IllegalValue" ) + " " + m_dlmsValues.toString();

    } // end if ( isDate )

    if ( m_fIsNumeric )
    {
      var dblData = Number( VwExString.strip( strData, "$%, " ) );
      var dblVal;

      while( (strValue = m_dlmsValues.getNext()) != null )
      {
        // *** Test to see if this piece is a range

        var  nPos = strValue.indexOf( m_chRangeSep );

        if ( nPos > 0 )
        {
          // *** Extract low and hi range values

          var dblLow = Number( strValue.substring( 0, nPos ) );
          var dblHi = Number( strValue.substring( nPos + 1 ) );

          if ( dblData >= dblLow && dblData <= dblHi )
          {
            return;
          }       // A constraint is satisfied and we're all done
         }
         else
         {
           dblVal = Number( strValue );
           if ( dblData == dblVal )
           {
             return;
           }      // A constraint is satisfied and we're all done
         }

      } // end while

    } // end if VwExString.isNumeric( strData ) )
    else
    {
      // *** Non numeric data test

      while( (strValue = m_dlmsValues.getNext()) != null )
      {

        // *** Test to see if this piece is a range

        var  nPos = strValue.indexOf( m_chRangeSep );

        if ( nPos > 0 )
        {
          var  strLow = strValue.substring( 0, nPos );
          var  strHi =  strValue.substring( nPos + 1 );

          var  nLow = strData.compareTo( strLow );
          var  nHi = strData.compareTo( strHi );

          if ( nLow >= 0 && nHi <= 0 )
             return;      // A constraint is satisfied and we're all done
        }
        else
        {
          if ( m_fCaseCompare )
          {
            if ( strData.equals( strValue ) )
              return;     // A constraint is satisfied and we're all done
          }
          else
          {
            if ( strData.equalsIgnoreCase( strValue ) )
              return;     // A constraint is satisfied and we're all done
          } // end else

        } // end else

      } // end while

    } // end else

    // *** If we get here the data did not meet the constraints so throw the exception

    throw vwresourceMgr.getString( "VVwEdit.IllegalValue" ) + " " + m_dlmsValues.toString();

  } // end testValuesRanges()


  /**
   * Tests the values and ranges data types against the edit mask to insure type compatability
   *
   * @exception throws Exception if the values or range data types conflict with the edit mask
   */
  function validateValuesToMask()
  {
    var  strValue = null;

    if ( m_dlmsValues == null )
    {
      return;
    }

    while( ( strValue = m_dlmsValues.getNext() ) != null )
    {
      var  strLo = null;
      var  strHi = null;

      var  npos = strValue.indexOf( m_chRangeSep );
      if ( npos >= 0 )
      {
        strLo = strValue.substring( 0, npos );
        strHi = strValue.substring( npos + 1);

      } // end if

      if ( isDate() )
      {
        if ( strLo != null )
        {
          var dt = new VwDate( strLo, m_strMask );
          if ( !dt.isValid() )
          {
            throw vwresourceMgr.getString( "VVwEdit.InvalidValueDate" );
          }

          dt.setDate( strHi, m_strMask );
          if ( !dt.isValid() )
          {
            throw  vwresourceMgr.getString( "VVwEdit.InvalidValueDate" );
          }
        }
        else
        {
          dt = new VwDate( strValue, m_strMask );
          if ( !dt.isValid() )
          {
            throw vwresourceMgr.getString( "VVwEdit.InvalidValueDate" );
          }
        } // end else

      } // end if ( isDate )
      else
      if ( isNumeric() )
      {
        if ( strLo != null )
        {
          if ( !VwExString.isNumeric( strLo ) )
          {
            throw vwresourceMgr.getString( "VVwEdit.InvalidNumber" );
          }

          if ( !VwExString.isNumeric( strHi ) )
          {
            throw vwresourceMgr.getString( "VVwEdit.InvalidNumber" );
          }
        }
        else
        {
          if ( !VwExString.isNumeric( strValue ) )
          {
            throw vwresourceMgr.getString( "VVwEdit.InvalidNumber" );
          }
        }
     } // end if ( isNumeric() )

    } // end while()

    m_dlmsValues.reset();

  } // end validateValuesToMask()


  /**
   * Determins the maximum allowed characters based on the edit mask. This overrides
   * the setMaxCharsAllowed method if the mask does not allow unlimited characters.
   * The internal property m_nMaxCahrs is adjusted
   *
   */
  function getMaxCharsAllowedFromMask()
  {

    if ( m_strMask.indexOf( '#' ) >= 0 )
    {
      // This test is for the numeric format masks
      m_fMaskOverride = true; // Mask determins max length
      m_nMaxChars = 0;        // Override of any previous seting
      var nLen = m_strMask.length;

      for ( var x = 0; x < nLen; x++ )
      {

        switch ( m_strMask.charAt( x ) )
        {

          case '+':
          case '-':
          case '.':
          case '#':

            ++m_nMaxChars;

            break;

        } // end switch()

      } //end for()

      return;

    } //end if ( strMask.indexOf( '#' ) >= 0 )

    // *** Test here is for character based masks. If o

    if ( m_strMask.length > 1 )
    {
      m_fMaskOverride = true; // Mask determins max length

      m_nMaxChars = m_strMask.length;
    }


  } // end getMaxCharsAllowedFromMask()

} // end class VwEdit{}


// *** Common edit mask constants

/**
 * Edit mask constant for the social security number
 */
VwEdit.SSN = "999-99-9999";

/**
 * Edit mask constant for a 5 digit zip code
 */
VwEdit.ZIP5 = "99999";

/**
 * Edit mask constant for a 9 digit zip code
 */
VwEdit.ZIP9 = "99999-9999";

/**
 * Edit mask constant for the phone number without area code
 */
VwEdit.PHONENBR = "999-9999";

/**
 * Edit mask constant for the phone number
 */
VwEdit.PHONEAREA = "(999) 999-9999";


/**
 * Edit mask constant for a persons complete name ( allows spaces and commas, periods and alphanumerics
 */
VwEdit.PERSON_NAME_FULL = "\t ,.\tc";

/**
 * Edit mask constant for a persons first or last name component only no spaces
 */
VwEdit.PERSON_NAME = "c";


/**
 * Edit mask constant for an address
 */
VwEdit.ADDRESS = "\t ,.&#\tc";

/**
 * Edit mask constant for a filename
 */
VwEdit.FILENAME = "\t ._\tc";


/**
 * Edit mask constant for a file path
 */
VwEdit.FILEPATH = "\t \\/.$_\tc";

/**
 * Edit mask constant for money using a fixed position dollar sign and space filled right justified fill character
 */
VwEdit.MONEY = "-###,###,###,###,###.##";

/**
 * Edit mask constant for money with added dollar sign
 */
VwEdit.MONEY$ = "$-###,###,###,###,###,###.##";

/**
 * Edit mask constant for money with using floating dollar sign
 */
VwEdit.MONEY$$ = "$$-###,###,###,###,###,###.##";

/**
 * Edit mask constant for money with a padded '*' commonly used when printing checks
 */
VwEdit.MONEY_CHECK = "*$-###,###,###,###,###,###.##";

// *** End if VVwEdit.java ***

export default VwEdit;