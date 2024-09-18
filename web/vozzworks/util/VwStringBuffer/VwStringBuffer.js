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

/**
 * This class mimics the Java StringBuffer
 *
 * @param strInitial The initial string (may be null)
 * @constructor
 */
function VwStringBuffer( strInitial )
{

  const self = this;

  let   m_aSbEntries = [];

  // PUBLICS

  this.append = append;

  this.clear = () => m_aSbEntries = [];

  this.toString = toString;

  this.length = length;

  this.capacity = capacity;

  this.charAt = charAt;

  this.deleteRange = deleteRange;

  this.deleteCharAt = deleteCharAt;

  this.indexOf = indexOf;

  this.insert = insert;

  this.setLength = setLength;

  this.setCharAt = setCharAt;

  this.substring = substring;

  this.reverse = reverse;

  this.trimToSize = trimToSize;

  constructor();

  /**
   * Ececutes constructor code
   */
  function constructor()
  {
    if ( strInitial )
    {
      m_aSbEntries.push( strInitial );

    }
  }

  /**
   * Appends a data value to the VwStringBuffer
   * @param val may be another VwStringBuffer, Array for and string, number or boolean value
   *
   * @returns {VwStringBuffer}
   */
  function append( val )
  {

    if ( val instanceof VwStringBuffer )
    {
      m_aSbEntries.push( val.toString() );
    }
    else
    if ( Array.isArray( val ) )
    {
      m_aSbEntries = m_aSbEntries.concat( val );
    }
    else
    {
      m_aSbEntries.push( val );
    }


    return self;
  }


  /**
   * Returns the VwStringBuffer contents as a string
   */
  function toString()
  {

    var strSbContents = "";

    for ( var x = 0, nLen = m_aSbEntries.length; x < nLen; x++ )
    {
      strSbContents += m_aSbEntries[ x ];
    }

    return strSbContents;
  }


  /**
   * Returns the lenget (character count)
   *
   * @returns {Number}
   */
  function length()
  {
    return m_aSbEntries.length;
  }


  /**
   * Return the current capacity
   * @returns {Number}
   */
  function capacity()
  {
    return m_aSbEntries.length;
  }

  /**
   * Return the charcter at the specified index
   *
   * @param ndx
   * @returns {*}
   */
  function charAt( ndx )
  {
    return m_aSbEntries[ ndx].toString();
  }


  /**
   * Deletes a range of characters starting at nStart
   *
   * @param nStart The starting index of the string buffer to begin the delete
   * @param nEnd The ending index of the string buffer to begin the delete (exclusive)
   *
   * @returns {VwStringBuffer}
   */
  function deleteRange( nStart, nEnd )
  {
    if ( nStart < 0 )
    {
      throw "Inavlid start range " + nStart + " must be >= 0";

    }

    if ( nStart >= m_aSbEntries.length )
    {
      throw "Inavalid start range " + nStart + " cannot exceed current size of VwStringBuffer,  "+ m_aSbEntries.length;

    }

    if ( nStart >= nEnd )
    {
      throw "Invalid start range " + nStart + " cannot be >= to the end range " + nEnd;

    }


    if ( nEnd < 1 )
    {
      throw "Inavlid end range " + nEnd + " must be >= 1";

    }

    if ( nEnd >= m_aSbEntries.length )
    {
      throw "Inavalid end range " + nEnd + " cannot exceed current size of VwStringBuffer,  "+ m_aSbEntries.length;

    }

    if ( nEnd <= nStart )
    {
      throw "Invalid end range " + nEnd + " cannot be <= to the start range " + nStart;

    }


    m_aSbEntries.splice( nStart, nEnd - nStart );

    return self;


  }


  /**
   * Deletes the character in the VwStringBuufer at the idex specified
   *
   * @param ndx  The index in the VwStringBuffer to delete
   *
   * @returns {VwStringBuffer}
   */
  function deleteCharAt( ndx )
  {

    if ( ndx < 0 )
    {
      throw "Invalid index " + ndx + " must be >= 0";

    }

    if ( ndx >= m_aSbEntries.length )
    {
       throw "Invalid index " + ndx + " must be < VwStringBuffer length " + m_aSbEntries.length;

    }

    m_aSbEntries.splice( ndx, 1 );


    return self;
  }


  /**
   * Returns the index of the first occurrence of the substring strSubString
   *
   * @param strSubString The substring within the string buffer
   *
   * @param nStart If specified, the serach will start at this index
   * @returns {*|Number|number}
   */
  function indexOf( strSubString, nStart )
  {

    if ( !nStart )
    {
      return toString().indexOf( strSubString );
    }

    return toString().indexOf( strSubString, nStart );


  }

  /**
   * Inserts the specified value into the VwStringBuffer
   *
   * @param nStart The starting index of the string buffer to insert to
   * @param nVal The value to insert
   * @returns {VwStringBuffer}
   */
  function insert( nStart, nVal )
  {

    var strToInsert;

    if ( nStart < 0 )
    {
      throw "Invalid insert start index, " + nStart + " must be >= 0";

    }

    if ( nStart >= m_aSbEntries.length )
    {
       throw "Invalid insert start index, " + nStart + " must be < VwStringBuffer length " + m_aSbEntries.length;

    }

    if ( val instanceof VwStringBuffer )
    {
      strToInsert = val.toString();
    }
    else
    if ( Array.isArray( val ) )
    {
      strToInsert = arrayToString( nVal );
    }
    else
    {
      strToInsert = nVal;

    }

    m_aSbEntries.splice( nStart, 0, strToInsert );


    return self;

  }

  /**
   * Sets the new length of the VwStrngBuffe
   * @param nLen
   */
  function setLength( nLen )
  {

    m_aSbEntries.length = nLen;

  }


  function setCharAt( ndx, str )
  {

    if ( ndx < 0 )
    {
      throw "Invalid start index, " + ndx + " must be >= 0";

    }

    if ( ndx >= m_aSbEntries.length )
    {
       throw "Invalid start index, " + nStart + " must be < VwStringBuffer length " + m_aSbEntries.length;

    }

    m_aSbEntries[ ndx ] = str;


  }


  /**
   * returns a string substring in the VWstringBuffer specified by the start and end indexs
   * @param nStart The starting index (inclusive)
   * @param nEnd The ending index (exclusive)
   * @returns {*|string}
   */
  function substring( nStart, nEnd )
  {
    if ( nStart < 0 )
    {
      throw "Inavlid start range " + nStart + " must be >= 0";

    }

    if ( nStart >= m_aSbEntries.length )
    {
      throw "Inavalid start range " + nStart + " cannot exceed current size of VwStringBuffer,  "+ m_aSbEntries.length;

    }

    if ( nStart >= nEnd )
    {
      throw "Invalid start range " + nStart + " cannot be >= to the end range " + nEnd;

    }


    if ( nEnd < 1 )
    {
      throw "Inavlid end range " + nEnd + " must be >= 1";

    }


    if ( nEnd <= nStart )
    {
      throw "Invalid end range " + nEnd + " cannot be <= to the start range " + nStart;

    }

    return toString().substring( nStart, nEnd );


  }

  /**
   * Reverses the character sequence in the VwStringBuffer
   *
   * @returns {VwStringBuffer}
   */
  function reverse()
  {
    m_aSbEntries.reverse();

    return self;

  }


  /**
   * Attempts to reduce the size of the storge by finding the index of the first non null entry in the VwStringBuffer sequence
   */
  function trimToSize()
  {
    for ( var x = m_aSbEntries.length -1; x >= 0; x-- )
    {
      if ( m_aSbEntries[ x ] )
      {
        break;
      }
    }

    m_aSbEntries.length = x + 1;

  }
} // end VwStringBuffer{}

export default VwStringBuffer;