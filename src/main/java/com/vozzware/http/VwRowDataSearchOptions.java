package com.vozzware.http;

import java.util.HashMap;
import java.util.Map;

public class VwRowDataSearchOptions
{
  private String    m_strRowEndTag;
  private String[]  m_astrColDelims;
  private Map<String,Map<String,String>> m_mapAttrSearchOptions = new HashMap<String, Map<String, String>>(  );
  private boolean   m_fMatchAll;

  public VwRowDataSearchOptions( String strRowEndTag, String[] astrColDelims,
                                 Map<String,Map<String,String>> mapAttrSearchOptions, boolean fMatchAll ) throws Exception
  {
    if ( strRowEndTag == null )
      throw new Exception( "row end tag cannot be null" );

    m_strRowEndTag = strRowEndTag;

    if ( astrColDelims == null )
      throw new Exception( "col delim array cannot be null" );

    m_astrColDelims = astrColDelims;

    m_mapAttrSearchOptions = mapAttrSearchOptions;

    m_fMatchAll = fMatchAll;

  }

  public String getRowEndTag()
  {
    return m_strRowEndTag;
  }

  public void setRowEndTag( String strRowEndTag )
  {
    m_strRowEndTag = strRowEndTag;
  }

  public String[] getColDelims()
  {
    return m_astrColDelims;
  }

  public void setColDelims( String[] astrColDelims )
  {
    m_astrColDelims = astrColDelims;
  }

  public Map<String,Map<String,String>> getAttrSearchOptions()
  {
    return m_mapAttrSearchOptions;
  }

  public void setAttrSearchOptions( Map<String,Map<String,String>>mapAttrSearchOptions )
  {
    m_mapAttrSearchOptions = mapAttrSearchOptions;
  }

  public boolean isMatchAll()
  {
    return m_fMatchAll;
  }

  public void setMatchAll( boolean fMatchAll )
  {
    m_fMatchAll = fMatchAll;
  }
}
