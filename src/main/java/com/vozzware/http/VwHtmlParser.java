package com.vozzware.http;

import com.vozzware.util.VwExString;
import com.vozzware.util.VwInputSource;
import com.vozzware.util.VwTextParser;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author P. VosBurgh
 *
 * This is an HTML navigation class that assists in navigating to requested tags 
 * and returning the data content within the requested tag tag (Data that is in between markup elements).
 */
public class VwHtmlParser
{
  private int     m_nCursor;        // Holds thr current position within the document

  private int     m_nTagStartPos;   // Starting position of the current tag
  private int     m_nTagEndPos;     // End position of the current tag

  private String  m_strContent;     // The html document
  
  private String  m_strEOFTag;      // Tag defined by client that represents the eof tag
  
  private String  m_strCurrentTag;  // Current tag (if any ) being looked at

  private String  m_strRowDelim = "<tr";
  private String  m_strColDelim = "<td";

  private String  m_strRowDelimEnd = "</tr>";
  private String  m_strColDelimEnd = "</td>";

  private boolean m_fRemoveInternalMarkup = true;  // be default remove any markup that was contained in the data
  private boolean m_fExpandCharEntities = true;
  private boolean m_fTrimTagData = true;
  private boolean m_fRemoveCRLF = true;

  private String  m_strNewLineLower = "<br>";
  private String  m_strNewLineUpper = "<BR>";

  private static List<String> s_listEmpty = new ArrayList<String>( );

  // INNER class for storing xpath state data on multi[le tag searches
  class XPathState
  {
    int m_nPathCursor;
    String[] m_astrPaths;

    XPathState( String strPath )
    {
      m_astrPaths = strPath.split( "/" );
      m_nPathCursor = 0;
    }

    boolean isTagMatch( String strTag )
    {
      if( strTag.startsWith( m_astrPaths[ m_nPathCursor ] ) )
      {
        ++m_nPathCursor;
        return true;
      }

      return false;

    }

    public void reset()
    { m_nPathCursor = 0; }

    public boolean isEndPath()
    {
      return m_nPathCursor == m_astrPaths.length;
    }
  }


  /**
   * Constructor
   * 
   * @param strContent The html document
   */
  public VwHtmlParser( String strContent )
  { m_strContent = strContent; }
  

  /**
   * Sets the tag that marks the EOF
   * 
   * @param strEOFTag The tag that represents the EOF tag
   */
  public void setEOFTag( String strEOFTag )
  { m_strEOFTag = strEOFTag; }


  /**
   * Sets row and column delimiters
   * @param strRowDelim
   * @param strColDelim
   */
  public void setDelimiters( String strRowDelim, String strColDelim )
  {

    if ( strRowDelim.charAt( 0 ) != '<')
      m_strRowDelim = "<" + strRowDelim;
    else
      m_strRowDelim = strRowDelim;

    m_strRowDelimEnd = "</" + m_strRowDelim.substring( 1 );

    if ( !m_strRowDelimEnd.endsWith( ">" ))
      m_strRowDelimEnd += ">";

    if ( strColDelim.charAt( 0 ) != '<')
      m_strColDelim = "<" + strColDelim;
    else
      m_strColDelim = strColDelim;

    m_strColDelimEnd = "</" + m_strColDelim.substring( 1 );

    if ( !m_strColDelimEnd.endsWith( ">" ))
      m_strColDelimEnd += ">";



  }


  public void setNewLine( String strNewLine )
  {
    m_strNewLineLower = strNewLine.toLowerCase();
    m_strNewLineUpper = strNewLine.toUpperCase();

  }

  public boolean isfRemoveCRLF()
  {
    return m_fRemoveCRLF;
  }

  public void setRemoveCRLF( boolean fRemoveCRLF )
  {
    m_fRemoveCRLF = fRemoveCRLF;
  }

  public boolean isfTrimTagData()
  {
    return m_fTrimTagData;
  }

  public void setTrimTagData( boolean fTrimTagData )
  {
    m_fTrimTagData = fTrimTagData;
  }

  public boolean isfExpandCharEntities()
  {
    return m_fExpandCharEntities;
  }

  public void setExpandCharEntities( boolean fExpandCharEntities )
  {
    m_fExpandCharEntities = fExpandCharEntities;
  }

  public boolean isfRemoveInternalMarkup()
  {
    return m_fRemoveInternalMarkup;
  }

  public void setRemoveInternalMarkup( boolean fRemoveInternalMarkup )
  {
    m_fRemoveInternalMarkup = fRemoveInternalMarkup;
  }


  /**
   * Restore defualt settings for parser which are
   * row delimiter tag <tr
   * col delimiter tag <td
   *
   * remove internal markup for tag data : true
   * expand character entities: true
   * trim whitespace: true
   * remove CRLF: true
   */
  public void restoreDefaults()
  {

    m_strRowDelim = "<tr";
    m_strColDelim = "<td";
    m_strRowDelimEnd = "</tr>";
    m_strColDelimEnd = "</td>";

    m_fRemoveInternalMarkup = true;  // be default remove any markup that was contained in the data
    m_fExpandCharEntities = true;
    m_fTrimTagData = true;
    m_fRemoveCRLF = true;
  }


  /**
   * Gets the current cursor position in the html document
   * @return
   */
  public int getCursor()
  { return m_nCursor; }
  
  /**
   * Sets the cursor position to the new current position in the document 
   * @param nCursor The cursor position in the document
   */
  public void setCursor( int nCursor )
  { m_nCursor = nCursor; }


  /**
   * Gets the starting position in the document of the current tag
   * @return
   */
  public int getTagStartPos()
  { return m_nTagStartPos; }


  /**
   * Gets the end position in the document of the current tag
   *
   * @return
   */
  public int getTagEndPos()
  { return m_nTagEndPos; }


  /**
   * Returns the current tag. This is determined from a prior call to goToTag or getNextTag
   * @return The current tag the parser is at
   */
  public String getCurrentTag()
  { return m_strCurrentTag; }
  
  /**
   * Positions the cursor from the start of the document to the start of the requested token.
   * 
   * @param strToken The token within the document to search for
   * 
   * @return The starting position of the token within the document or -1 if the token
   * cannot be found
   */
  public int locate( String strToken )
  {
    m_nCursor = m_strContent.indexOf( strToken );
    return m_nCursor;
    
  } // end locate()
  
  
  
  /**
   * Positions the cursor from the current cursor position of the document to the start of the requested token.
   * 
   * @param strToken The token within the document to search for
   * 
   * @return The starting position of the token within the document or -1 if the token
   * cannot be found
   */
  public int locateNext( String strToken )
  {
    if ( m_nCursor < 0 )
      return m_nCursor;
    
    m_nCursor = m_strContent.indexOf( strToken, ++m_nCursor );
    return m_nCursor;
    
  } // end locateNext()
  
  


  /**
   * Go to the next tag that is in the array of tag choices and match agains attributes in a found tag if map was specified
   * @param astrSearchTags The array of tag choices
   * @param mapSearchAttrsByTag The map of attributes that must be contained inn the tag to satisfy the search - may be null
   * @param fMatchAll if true all attribytes in the mapSearchAttrsByTag must be matched else any one can match
   * @return
   */
  public int goToTag( String[] astrSearchTags, Map<String,Map<String,String>> mapSearchAttrsByTag, boolean fMatchAll )
  {
    while( true )
    {
      int nPos = goToTag( astrSearchTags );

      if ( nPos < 0 )
        return nPos;    // Tag or tag path not found

      String strTag = m_strCurrentTag;

      if ( m_strEOFTag != null && strTag.equals( m_strEOFTag ) )
        return -100;

       if ( mapSearchAttrsByTag == null )                        // No search attributes specified so we're done
          return m_nTagStartPos;

       if ( processSearchAttributes( strTag, mapSearchAttrsByTag, fMatchAll ) )
          return m_nTagStartPos;
    }


  } // end  goToTag()


  /**
   * Attempts to navigate to the html tag requested starting from the current cursor position in the document
   *
   * @param astrSearchTags The tag to navigate to
   *
   * @return -100 if the EOF tag was encountered, -1 if the tag could not be found or the position\
   * in the document where the start of the found tag is
   */
  public int goToTag( String[] astrSearchTags )
  {

    // CREATE XPathState objects for each tag in the search array
    XPathState[] axpStates = new XPathState[ astrSearchTags.length ];

    for ( int x = 0; x < astrSearchTags.length; x++ )
    {
      axpStates[ x ] = new XPathState( astrSearchTags[ x ]);
    }

    String strTag = getNextTag();

    if ( strTag == null )
      return -1;

    strTag = strTag.toLowerCase();


    while( strTag != null )
    {
      strTag = strTag.toLowerCase();
      if ( m_strEOFTag != null && strTag.equals( m_strEOFTag ) )
        return -1;

      for ( int x = 0; x < axpStates.length; x ++ )
      {
        if ( axpStates[ x ].isTagMatch( strTag ) )
        {
          if ( axpStates[ x ].isEndPath() )
            return m_nTagStartPos;   // We have matched the path

        }
        else
        if ( axpStates[ x ].m_nPathCursor > 0 )
        {
          axpStates[ x ].reset();   // We only could find a partial hit on the tag path, so reset path back to start and keep searching
        }

      }

      strTag = getNextTag();

    }

    return -1;    // Not found

  } // end  goToTag()

  /**
   * Attempts to navigate to the html tag requested starting from the current cursor position in the document
   *
   * @param strSearchTag The tag to navigate to
   *
   * @return -100 if the EOF tag was encountered, -1 if the tag could not be found or the position\
   * in the document where the start of the found tag is
   */
  public int goToTag( String strSearchTag )
  {
    String strTag = getNextTag();

    if ( strTag == null )
      return -1;

    strSearchTag = strSearchTag.toLowerCase();

    int nPathPos = 0;

    // See if this is a tag xpath type request
    String[]astrTagPaths = strSearchTag.split( "/" );

    while( strTag != null )
    {
      strTag = strTag.toLowerCase();
      if ( m_strEOFTag != null && strTag.equals( m_strEOFTag ) )

        return -100;

      if ( strTag.startsWith( astrTagPaths[ nPathPos] ) )
      {
        ++nPathPos;
        if ( nPathPos == astrTagPaths.length )
          return m_nTagStartPos;   // We have matched the path

      }
      else
      if ( nPathPos > 0 )
      {
        nPathPos = 0;   // We only could find a partial hit on the tag path, so reset path back to start and keep searching
      }

      strTag = getNextTag();
      if ( strTag == null )
        return -1;
    }

    return -1;    // Not found

  } // end  goToTag()


  /**
   * Attempts to navigate to the html tag requested starting from the current cursor position in the document and
   * <br>matching the tag attribute values specified in the map
   *
   * @param strSearchTag The tag to navigate to
   * @param mapSearchAttrs A map containing the tag attribute and values to much.
   * @param fMatchAll if true, all attributes in the map must be matched else any attriute can be matched
   *
   * @return The position of the matched tag or -1 if the tag could not be found
   */
  public int goToTag( String strSearchTag, Map<String,String>mapSearchAttrs, boolean fMatchAll )
  {

    while( true )
    {
      int nPos = goToTag( strSearchTag  );
      if ( nPos < 0 )
        return -1;

      try
      {

        if ( testSearchAttributes( mapSearchAttrs, fMatchAll ))
          return nPos;

      }
      catch( Exception ex )
      {
        return -1;

      }

    }

  }

  private boolean testSearchAttributes( Map<String,String>mapSearchAttrs, boolean fMatchAll )
  {
    // ok we found the tag but didn't need to match anything, return pos of tag
    if ( mapSearchAttrs == null || mapSearchAttrs.size() == 0  )
      return true;

    // Found a tag but it didnt contain any attributes so keep searching
    Map<String,String> mapTagAttrs = getTagAttributesAtCurPos( null );

    if ( mapTagAttrs == null || mapTagAttrs.size() == 0  )
      return false;


    return isMatchedAttributes( mapTagAttrs, mapSearchAttrs, fMatchAll );

  }

  /**
   * Process the search attributes map to determine if this tag qualifies to be processed
   * @param strTag  The tag containing the attributes
   * @param mapSearchAttrsByTag  The attribute map by tag
   * @param fMatchAll if true all attributes in rhe map must be matched
   * @return true if the attributes matches thoswe found in the tag, false otherwise
   * @throws Exception
   */
  private boolean processSearchAttributes( String strTag, Map<String,Map<String,String>> mapSearchAttrsByTag, boolean fMatchAll  )
  {

    // We want to comapre the piece of the tag that ends at the first space or the '>' character
    int ndx = strTag.indexOf( ' ' );
    if ( ndx > 0 )
      strTag = strTag.substring( 0, ndx  );
    else
    {
      ndx = strTag.indexOf('>' );
      if ( ndx > 0 )
        strTag = strTag.substring( 0, ndx  );

    }
    // Get the search attribute map fro the tag found
    Map<String,String>mapSearchAttrs = mapSearchAttrsByTag.get( strTag );

    // Found one of the tags we want and no additional attributes are need so we're all done
    if ( mapSearchAttrs == null ||mapSearchAttrs.size() == 0 )
       return true;

    Map<String,String> mapTagAttrs = getTagAttributesAtCurPos( null );

    if ( mapTagAttrs == null || mapTagAttrs.size() == 0  )
      return false;

    return isMatchedAttributes( mapTagAttrs,mapSearchAttrs, fMatchAll );
  }


  /**
   * test to see if attributes in the current tag match the ones to the search map
   * @param mapTagAttrs Map of attributes in the current tag
   * @param mapSearchAttrs Map of attribtes to test
   * @param fMatchAll if true all attributes in the search map must exist in the current tag attributes
   * @return
   */
  private boolean isMatchedAttributes( Map<String,String>mapTagAttrs, Map<String,String>mapSearchAttrs, boolean fMatchAll )
  {

    int nMatchCount = 0;

    for ( String strSearchKey : mapSearchAttrs.keySet() )
    {
      String strAttrValue  = mapTagAttrs.get( strSearchKey );

      if ( strAttrValue == null )
      {
        if ( fMatchAll )
          break;

        continue;
      }

      strAttrValue = strAttrValue.toLowerCase();

      String strSearchValue = mapSearchAttrs.get( strSearchKey ) ;

      if ( strSearchValue == null )
        continue;

      strSearchValue = strSearchValue.toLowerCase();

      boolean fMatched = false;

      if ( strSearchValue.endsWith( "*" ))  // wildcard search
      {
        strSearchValue = strSearchValue.substring( 0, strSearchValue.length() - 1 );
        if ( !strAttrValue.startsWith( strSearchValue ))
        {
          if ( fMatchAll )
            break;              // values dont match and match all was requested

        }
        else
          fMatched = true;
      }
      else
      if ( !strSearchValue.equalsIgnoreCase( strAttrValue ))
      {
        if ( fMatchAll )
          break;              // values dont match and match all was requested

      }
      else
        fMatched = true;

      if ( fMatched )
      {
        // ok found match
        if ( !fMatchAll )
          return true;
        else
          ++nMatchCount;
      }
    }  // end for

    if ( nMatchCount > 0 && nMatchCount == mapSearchAttrs.size() )
      return true;

    return false;

  }


  /**
   * Find the position of the requested tag inn the html page from the specified start position
   * @param strTag    The tag to search for
   * @param nStartPos The starting position on the html page to start from
   * @return
   */
  public int findTagPos( String strTag, int nStartPos )
  {

    strTag = strTag.toLowerCase();
    while( true )
    {
      String strNextTag = getNextTag();
      if ( strNextTag == null )
        return -1;

      if ( strNextTag.toLowerCase().startsWith( strTag ))
        return m_nTagStartPos;
    }


    /*
    StringBuffer sb = new StringBuffer( "<" );

    int nPos = m_strContent.indexOf( '<', nStartPos );

    if ( nPos < 0 )
      return -1;

    while( ++nPos < m_strContent.length() )
    {

      for ( int x = 1; x < strTag.length(); x++ )
      {
        char ch = Character.toLowerCase( m_strContent.charAt( nPos ) );

        if ( ch == strTag.charAt( x ))
        {
          ++nPos;
          sb.append( ch );
        }
        else
          break;  // no match, goto next '<'

      }

      if ( sb.length() != strTag.length() )
      {
        nPos = m_strContent.indexOf( '<', ++nPos );

        // Reached end of document -- get out
        if ( nPos < 0 )
          return -1;

        sb.setLength( 0 );
        sb.append( '<' );
        continue;

      }

      String strCurTag = sb.toString();
      if ( strCurTag.equalsIgnoreCase( strTag ))
        return nPos - strTag.length();



    }


    return -1;    // EOF and no match found
    */

  }
  /**
   * Locate the string starting from the position specified
   * @param nPos The starting offset in the html document to start the search from
   * @param strSearchString The string to search for
   * @return
   */
  public int locate(final int nPos,final String strSearchString )
  {
	  return m_strContent.indexOf( strSearchString, nPos);
  } // locate()
 

  /**
   * Gets data from an html option tag starting at the current row location.
   * @return a Map of name/value pairs for each entry in the option
   * @throws Exception if the current tag is not a <tr or if EOF is found prior to a closing </tr> tag
   */
  public Map<String,String>getSelectData(  String strNameId ) throws Exception
  {
    Map<String,String>mapNameValues = new HashMap<String, String>();
    
    int nPos = goToTag( "<select" );

     if ( nPos < 0 )
       throw new Exception( "Could not find the <select> tag requested" );

    while( true )
    {
      

      // Search until we find a select tag that matches the name attribute

      Map<String,String>mapTagAttrs = getTagAttributesAtCurPos( null );
      
      
      String strName = mapTagAttrs.get( "name" );
      if ( strName == null )
        continue;  // This should not happen but avoid a null pointer exception
      
      if ( strName.equalsIgnoreCase( strNameId ))
        break;

      if ( goToTag( "<select" ) < 0 )
        return null;



    } // end while()
    
    // Ok we found the start of our select tag, get all option tag values
    
    while( true )
    {
      String strTag = getNextTag();
      
      if ( strTag.equalsIgnoreCase( "</select>" ))
        break;
 
      
      if ( strTag.toLowerCase().startsWith( "<option" ) )
      {
        Map<String,String>mapTagAttrs = getTagAttributesFromData( strTag );
        String strValue = mapTagAttrs.get( "value" );
        String strDisplay = getTagData( "<" );
        
        if ( strDisplay == null )
          continue;
        
        if ( strDisplay.length() == 0 )
          continue;


        mapNameValues.put( strDisplay, strValue );

      } // end if
        
    } // end while()
     
    return mapNameValues;
    
  }


  /**
   * Gets a row of data starting from the current cursor position to the specified row end tag
   *
   * @param strRowEndTag
   * @param astrColTags
   * @return
   * @throws Exception
   */
  public List<String>getRowData(  String strRowEndTag, String[] astrColTags ) throws Exception
  { return getRowData( strRowEndTag, astrColTags, null, false ); }


  /**
   * Get Row data for the current tag, the current tag is set by a prior call to one of the gotoTag methods
   * @param mapRowDataOptions  Map of VwRowDataSearchOptions for each tag expected
   * @return
   * @throws Exception
   */
  public List<String>getRowData(  Map<String,VwRowDataSearchOptions> mapRowDataOptions  ) throws Exception
  {
    if ( m_strCurrentTag == null )
      throw new Exception( "Eother enod of document was reached or no prior call to gotoTag was made" );

    String strTag = m_strCurrentTag.toLowerCase();

    // We want to comapre the piece of the tag that ends at the first space or the '>' character
    int ndx = strTag.indexOf( ' ' );
    if ( ndx < 0 )
      ndx = strTag.length() -1;

    strTag = strTag.substring( 0, ndx  );

    VwRowDataSearchOptions searchOptions = mapRowDataOptions.get( strTag );

    if ( searchOptions == null )
     return  s_listEmpty;


    String strRowEndTag = searchOptions.getRowEndTag();

    String[] astrColDelimTags = searchOptions.getColDelims();

    Map<String,Map<String,String>>mapSearchAttrs = searchOptions.getAttrSearchOptions();
    boolean fMatchAll = searchOptions.isMatchAll();

    return getRowData( strRowEndTag, astrColDelimTags, mapSearchAttrs, fMatchAll );


  }

  /**
   * Gets a row of data starting from the current cursor position to the specified row end tag
   * The columns in the row are determined by the array of column tags
   * @param astrColTags The array of column tag choices
   * @return
   * @throws Exception
   */
  public List<String>getRowData(  String strRowEndTag, String[] astrColTags, Map<String,Map<String,String>> mapSearchAttrsByTag, boolean fMatchAll  ) throws Exception
  {
    List<String>listColumns = new ArrayList<String>();

    int nPos = strRowEndTag.indexOf( ' ' );

    if ( nPos > 0 )
      strRowEndTag = strRowEndTag.substring( 0, nPos  );
    else
    if ( strRowEndTag.indexOf( '>' ) > 0 )
      strRowEndTag = strRowEndTag.substring( 0, strRowEndTag.length() -1  );

    strRowEndTag = strRowEndTag.toLowerCase();

    String strTag = m_strCurrentTag;

    while( true )
    {

      if ( strTag == null )
        break;

      strTag = strTag.toLowerCase();

      // We want to comapre the piece of the tag that ends at the first space or the '>' character
      int ndx = strTag.indexOf( ' ' );
      if ( ndx < 0 )
        ndx = strTag.length() -1;

      strTag = strTag.substring( 0, ndx  );

      if ( strTag.equals( strRowEndTag ))
        break;

      if ( strTag.charAt(  1  ) == '/')
      {
        strTag = getNextTag();
        continue;     // this is an end tag but not the one we're looking for so get next tag
      }

      for ( int x = 0; x < astrColTags.length; x++ )
      {
        if ( strTag.equals( astrColTags[ x ].toLowerCase() ) )
        {
          if ( mapSearchAttrsByTag != null )
          {
            if ( !processSearchAttributes( strTag, mapSearchAttrsByTag, fMatchAll ) )
              continue;

          }

          String strTagData = getTagData( null );
          if ( m_fRemoveInternalMarkup )
           strTagData = removeMarkup( strTagData );

          if ( m_fExpandCharEntities )
            strTagData = VwExString.expandCharacterEntities( strTagData );

          listColumns.add( strTagData );
          break;

        }

      } // end for

      strTag = getNextTag();


    }

    return listColumns;

  }

  /**
   * Get a row of data from a table or from the default row and column tags
   * @throws Exception
   */
  public List<String>getRowData() throws Exception
  {
    List<String>listColumns = new ArrayList<String>();
    
    while( true )
    {
      String strTag = getNextTag();
      
      if ( strTag.equalsIgnoreCase( m_strRowDelimEnd ))
        break;
 
      
      if ( strTag.toLowerCase().startsWith( m_strColDelim ) )
      {
        String strTagData = getTagData( null );

        if( m_fRemoveCRLF )
        	strTagData = strTagData.replaceAll("\r\n", "");
        
        if( m_fTrimTagData )
        	strTagData = strTagData.trim();
        
        listColumns.add( strTagData );
        
      }
        
    }
     
    return listColumns;
    
  }

  /**
   * Scans the html document for &lt;input&gt; tags and builds a map of values for each named input tag
   * @param fHiddenFieldsOnly if true, only return the values for hidden fields
   * @return
   */
  public Map<String,String>getInputTagData( boolean fHiddenFieldsOnly) throws Exception
  { return getInputTagData( fHiddenFieldsOnly ); }


  /**
   * Scans the html document for &lt;input&gt; tags and builds a map of values for each named input tag
   * @param fHiddenFieldsOnly if true, only return the values for hidden fields
   * @param strTerminator end of input terminator
   * @return
   */
  public Map<String,String>getInputTagData( boolean fHiddenFieldsOnly, String strTerminator ) throws Exception
  {
    Map<String,String>mapInputTags = new HashMap<String, String>(  );;
    Map<String,String>mapArgs = new HashMap<String, String>(  );;

    boolean fMapAll = false;

    if( fHiddenFieldsOnly )
    {
      mapArgs.put( "type", "hidden");
      fMapAll = true;

    }

    while( true )
    {
      int nTagPos = goToTag( "<input", mapArgs, fMapAll );

      if ( nTagPos < 0 )
        break;

      Map<String,String> mapInput = getTagAttributesAtCurPos( strTerminator );

      // Put the input tags name and value in the return map
      mapInputTags.put( mapInput.get( "name"), mapInput.get( "value"));
    }

    return mapInputTags;

  }


  /**
   * Gets the value of a tags attribute always starting at the beginning of the document
   * @param strTagName  The name of the html tag
   * @param strTagId An attribute name contained in the tag
   * @param strTagIdValue The value of that tag
   * @return The value attribute
   * @throws Exception
   */
  public String getTagAttrValue( String strTagName, String strTagId, String strTagIdValue ) throws Exception
  { return getTagAttrValue( strTagName, strTagId, strTagIdValue, 0 ); }


  /**
   * Gets the value of a tags attribute
   * @param strTagName  The name of the html tag
   * @param strTagId An attribute name contained in the tag
   * @param strTagIdValue The value of that tag
   * @param nStartPos the starting position in the document to start search at
   * @return The value attribute
   * @throws Exception
   */
  public String getTagAttrValue( String strTagName, String strTagId, String strTagIdValue, int nStartPos ) throws Exception
  {

    m_nCursor = nStartPos;
    if ( strTagName.charAt( 0 ) != '<')
      strTagName = "<" + strTagName;

    Map<String,String>mapSeacrhValues = new HashMap<String, String>(  );;
    mapSeacrhValues.put( strTagId, strTagIdValue );

    int nPos = goToTag( strTagName, mapSeacrhValues, true );

    if ( nPos < 0 )
      return null;

    Map<String,String>mapAttrValues = getTagAttributesAtCurPos( ">" );

    return  mapAttrValues.get( "value");


  }


  /**
   * Gets the data content at the current tag (if content exists)
   *
   * @param strTerminator The tag that marks the termination of the search
   *
   * @return the data content if found between the starting tag and the terminator tag
   * else null is returned
   */
  public String getTagData( String strTerminator  ) throws Exception
  { return  getTagData( strTerminator, null  ); }


  /**
   * Gets the data content at the current tag (if content exists)
   * 
   * @param strTerminator The tag that marks the termination of the search
   * @param fRemoveMarkup ovveride object setting
   *
   * @return the data content if found between the starting tag and the terminator tag
   * else null is returned
   */
  public String getTagData( String strTerminator, Boolean fRemoveMarkup ) throws Exception
  {
    
    if ( fRemoveMarkup == null )
      fRemoveMarkup = m_fRemoveInternalMarkup;

    if ( strTerminator == null )
    {
      if ( m_nTagEndPos < 0  )
        throw new Exception( "You must supply a terminating tag if a prior gotoTag has not been invoked.");
      
      // Make a closing tag version of the current tag we are on
      StringBuffer sb = new StringBuffer( "</" );
      for ( int x = 1; x < m_strCurrentTag.length(); x++ )
      {
        char ch = m_strCurrentTag.charAt( x );
        if ( VwExString.isWhiteSpace( ch ))
          break;
        sb.append( ch );
        
      }
      
       
      strTerminator = sb.toString().toLowerCase();
     
     }

     int nStartPos = m_nCursor;
     int nEndPos = findTagPos( strTerminator, nStartPos );

     m_nCursor = nEndPos;

     if ( nEndPos < 0 )
       return "";



    String strTagData = m_strContent.substring( nStartPos, nEndPos );

    // replace <br> with ^ char

    if ( strTagData.indexOf( m_strNewLineLower ) > 0 )
      strTagData = VwExString.replace( strTagData, m_strNewLineLower, "^" );
    else
    if ( strTagData.indexOf( m_strNewLineUpper ) > 0 )
     strTagData = VwExString.replace( strTagData, m_strNewLineUpper, "^" );


    if ( fRemoveMarkup )
      strTagData = removeMarkup( strTagData );

    if ( m_fExpandCharEntities )
      strTagData = VwExString.expandCharacterEntities( strTagData );

    if ( m_fTrimTagData )
     strTagData =  strTagData.trim();

    if ( m_fRemoveCRLF )
      strTagData = VwExString.strip( strTagData, "\r\n\t" );

    if ( strTagData.length() > 0 &&  strTagData.charAt( 0 ) == '^' )
      return strTagData.substring( 1 );

    return strTagData;
    
  }// end getData()
  
  
  /**
   * Gets all tag attributes from the start of the current tag until the terminatiog (if specified ) is encountered
   * @param strTerminator The terminating tag - if omitted the termination is done at the current tag ending
   * @return
   * @throws Exception
   */
  public Map<String,String> getTagAttributesAtCurPos( String strTerminator )
  {
    
     if ( m_nTagStartPos < 0 || m_nTagEndPos < 0 )
       return null;

     int nTagEndPos = -1;
     int nTempStartPos = m_nTagStartPos;

     if ( strTerminator == null )
       strTerminator = ">";

     nTagEndPos = m_strContent.indexOf( strTerminator, m_nTagStartPos );

     String strTag = m_strContent.substring( nTempStartPos, nTagEndPos + 1 );
    
     return getTagAttributesFromData( strTag );
     
    
  }

  /**
   * Gets all tag attributes from the start of the current tag until the terminatiog (if specified ) is encountered
   * @param strTagData The to extract attributes from. If strTagData is null then the tag is the current tag
   * @return
   * @throws Exception
   */
  public Map<String,String> getTagAttributesFromData( String strTagData )
  {

     if ( strTagData == null )
       strTagData = m_strCurrentTag;

     Map<String,String> mapAttributeData = new HashMap<String, String>();
    
     VwTextParser tp = null;

     try
     {

       tp = new VwTextParser( new VwInputSource( strTagData ), 0, 1 );
     }
     catch( Exception ex )
     {
       ex.printStackTrace();
       throw new RuntimeException( ex.toString() );
     }

     tp.setDelimiters( "<>/ " );
     tp.setIncludeQuotes( true );
     StringBuffer sbToken = new StringBuffer();
     boolean fNextTokIsAttrVal = false;
     String strAttr = null;
    
     while( true )
     {
      int nResultType = tp.getToken( sbToken );
      if ( nResultType == VwTextParser.EOF  )
        break;

      if ( nResultType == VwTextParser.DELIM  )
        continue;

      String strToken = sbToken.toString();
     
      if ( fNextTokIsAttrVal )
      {
        fNextTokIsAttrVal = false;
        String strStripChar = strToken.substring( 0, 1 );
        strToken = VwExString.strip( strToken, strStripChar );
       
        mapAttributeData.put( strAttr.toLowerCase(), strToken );
        continue;
      }
     
      int nPos =  strToken.indexOf( '=' );
      if ( nPos > 0 )
      {
        strAttr = strToken.substring( 0, nPos );
        String strValue = strToken.substring( ++nPos );

        if ( strValue.length() == 0 )
        {
          fNextTokIsAttrVal = true;
          continue;

        }

        if ( strValue.charAt( 0 ) == '\'' || strValue.charAt( 0 ) == '"' )
        {
          fNextTokIsAttrVal = true;
          continue;

        }
        else
          mapAttributeData.put( strAttr.toLowerCase(), strValue );

       
      }
     
     
     } // end while()
    
     return mapAttributeData;
    
  }

  /**
   * Navigates to the start of the next html tag found in the document (from the current cursor location)
   * 
   * @return The data of the next tag encountered 
   */
  public String getNextTag()
  {

    if ( m_nCursor < 0 )
      return null;

    m_nTagStartPos = m_strContent.indexOf( '<', m_nCursor );
    
    if ( m_nTagStartPos < 0 )
      return null;
    
    m_nTagEndPos = m_strContent.indexOf( '>', m_nTagStartPos + 1  );
    
    if ( m_nTagEndPos < 0 )
      return null;
    
    
    m_nCursor = m_nTagEndPos + 1; // update cursor to point on char past the '>' of the tag we just found
    
    m_strCurrentTag = m_strContent.substring( m_nTagStartPos, m_nCursor );
    return m_strCurrentTag;
    
    
  } // end getNextTag()


  /**
   * Remove any html markup conatained in the string
   *
   * @param strMarkup  Yhe string containing the markup to remove
   * @return
   */
  public static String removeMarkup( String strMarkup )
  {
    int nPos = strMarkup.indexOf( '<' );
    if ( nPos < 0 )
      return strMarkup;   // No markup found
    
    StringBuffer sb = new StringBuffer( strMarkup.substring( 0, nPos ));
    int nLen = strMarkup.length();
    int nMarkupLevel = 1;
    
    
    for ( int x = ++nPos; x < nLen; x++ )
    {
      char ch = strMarkup.charAt( x );
      if ( ch == '<')
        ++nMarkupLevel;
      else
      if ( ch == '>')
      {
        --nMarkupLevel;
        continue;
      }
      
      if ( nMarkupLevel == 0 ) // add to data we want when not in markup block
        sb.append( ch );
      
    } // end for()
    
    
    return sb.toString();
    
  }
  
  /**
   * Determines if there is a nested tag that exists starting with current cursor pos and terminating the the termination tag 
   * 
   * @param strTestTag The tag to test for
   * @param strTerminator The termination tag (stoops the search)
   * 
   * @return true if the test tag exists prior to the termination tag, false otherwise
   */
  public boolean containsTag( String strTestTag, String strTerminator )
  {
    int nSaveCursor = m_nCursor;
    
    try
    {
      while( true )
      {
         String strTag = getNextTag();
         if ( strTag == null )
           return false;
         
         if ( strTag.startsWith( strTerminator ))
           return false;
         
         if ( strTag.startsWith( strTestTag ))
           return true;
     
      } // end while()
    
    }
    finally
    {
      // restore cursor to origianl position
      m_nCursor = nSaveCursor;
    }
    
     
  }

  
} // end class VwHtmlParser{}

// *** End of VwHtmlParser.java 

