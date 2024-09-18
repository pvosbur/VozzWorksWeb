/*
============================================================================================

                       V o z z W o r k s   C o d e   G e n e r a t o r                      

                               2009 by V o z z W a r e   L L C                              

    Source File Name: ServiceDef.java

    Author:           

    Date Generated:   07-23-2011

    Time Generated:   12:19:24

============================================================================================
*/

package com.vozzware.service.dvo;

import java.io.Serializable;
import java.lang.Cloneable;
import com.vozzware.db.VwDVOBase;
import com.vozzware.util.VwBeanUtils;


public class ServiceDef extends VwDVOBase implements Serializable, Cloneable
{

  private String                 m_strName;                      
  private String                 m_strServiceClass;              
  private String                 m_strParamClass;                
  private String                 m_strMethod;                    
  private String                 m_strExecType;                  

  /**
   * Renders bean instance property values to a String
   * 
   * @return  A String containing the bean property values
   */
  public String toString()
  {
    return VwBeanUtils.dumpBeanValues( this );
  } // End of toString()



  // *** The following members set or get data from the class members *** 

  /**
   * Sets the name property
   */
  public void setName( String strName )
  { 
    
    testDirty( "name", strName );
    m_strName = strName;
  }

  /**
   * Gets name property
   * 
   * @return  The name property
   */
  public String getName()
  { return m_strName; }

  /**
   * Sets the serviceClass property
   */
  public void setServiceClass( String strServiceClass )
  { 
    
    testDirty( "serviceClass", strServiceClass );
    m_strServiceClass = strServiceClass;
  }

  /**
   * Gets serviceClass property
   * 
   * @return  The serviceClass property
   */
  public String getServiceClass()
  { return m_strServiceClass; }

  /**
   * Sets the paramClass property
   */
  public void setParamClass( String strParamClass )
  { 
    
    testDirty( "paramClass", strParamClass );
    m_strParamClass = strParamClass;
  }

  /**
   * Gets paramClass property
   * 
   * @return  The paramClass property
   */
  public String getParamClass()
  { return m_strParamClass; }

  /**
   * Sets the method property
   */
  public void setMethod( String strMethod )
  { 
    
    testDirty( "method", strMethod );
    m_strMethod = strMethod;
  }

  /**
   * Gets method property
   * 
   * @return  The method property
   */
  public String getMethod()
  { return m_strMethod; }

  /**
   * Sets the execType property
   */
  public void setExecType( String strExecType )
  { 
    
    testDirty( "execType", strExecType );
    m_strExecType = strExecType;
  }

  /**
   * Gets execType property
   * 
   * @return  The execType property
   */
  public String getExecType()
  { return m_strExecType; }

  /**
   * Clones this object
   *
   */
  public Object clone()
  {
    ServiceDef classClone = new ServiceDef();
    
    classClone.m_strName = m_strName;
    classClone.m_strServiceClass = m_strServiceClass;
    classClone.m_strParamClass = m_strParamClass;
    classClone.m_strMethod = m_strMethod;
    classClone.m_strExecType = m_strExecType;

    return classClone;
  }



  /**
   * Performs deep equal test on this object
   *
   * @param objTest The object to compare this object to
   *
   * @return if the two objects are equal, false otherwise
   *
   */
  public boolean equals( Object objTest )
  {

    if ( objTest == null )
      return false;

    if ( this.getClass() != objTest.getClass() )
      return false;

    ServiceDef objToTest = (ServiceDef)objTest;

    if ( ! doObjectEqualsTest( m_strName, objToTest.m_strName ) )
      return false; 

    if ( ! doObjectEqualsTest( m_strServiceClass, objToTest.m_strServiceClass ) )
      return false; 

    if ( ! doObjectEqualsTest( m_strParamClass, objToTest.m_strParamClass ) )
      return false; 

    if ( ! doObjectEqualsTest( m_strMethod, objToTest.m_strMethod ) )
      return false; 

    if ( ! doObjectEqualsTest( m_strExecType, objToTest.m_strExecType ) )
      return false; 

    return true;
  }



  /**
   * Perform an equals test on an Object
   *
   * @param obj1 first object
   * @param obj2 second object
   *
   * @return true if objects are equal, false otherwise
   *
   */
  private boolean doObjectEqualsTest( Object obj1, Object obj2 )
  {
    if ( obj1 != null )
    {
      if ( obj2 == null )
        return false;
      return obj1.equals( obj2 );
    }
    else
    if ( obj2 != null )
      return false;

    return true;

  }
} // *** End of class ServiceDef{}

// *** End Of ServiceDef.java