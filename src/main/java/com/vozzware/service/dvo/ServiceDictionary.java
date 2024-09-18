/*
============================================================================================

                       V o z z W o r k s   C o d e   G e n e r a t o r                      

                               2009 by V o z z W a r e   L L C                              

    Source File Name: ServiceDictionary.java

    Author:           

    Date Generated:   07-23-2011

    Time Generated:   12:19:24

============================================================================================
*/

package com.vozzware.service.dvo;

import java.io.Serializable;
import java.lang.Cloneable;
import com.vozzware.db.VwDVOBase;
import java.util.List;
import java.lang.reflect.Method;
import java.util.Iterator;
import com.vozzware.util.VwBeanUtils;


public class ServiceDictionary extends VwDVOBase implements Serializable, Cloneable
{

  private List<ServiceDef>       m_listServiceDef;               

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
   * Sets the ServiceDef property
   */
  public void setServiceDef( List<ServiceDef> listServiceDef )
  { 
    
    testDirty( "ServiceDef", listServiceDef );
    m_listServiceDef = listServiceDef;
  }

  /**
   * Gets ServiceDef property
   * 
   * @return  The ServiceDef property
   */
  public List<ServiceDef> getServiceDef()
  { return m_listServiceDef; }

  /**
   * Clones this object
   *
   */
  public Object clone()
  {
    ServiceDictionary classClone = new ServiceDictionary();
    

    if ( m_listServiceDef  != null )
      classClone.m_listServiceDef = (List<ServiceDef>)cloneList( m_listServiceDef );

    return classClone;
  }



  /**
   *Clones a list and all its elements
   *
   * @param list The list to clone
   *
   * @return The cloned List object
   *
   */
  private List cloneList( List list )
  {

    try
    {
      List listClone = (List)list.getClass().newInstance();

      for ( Object objListContent : list )
      {
        if ( objListContent instanceof Cloneable )
        {
          Method mthdClone = objListContent.getClass().getMethod( "clone", (Class[])null );
          Object objClone = mthdClone.invoke( objListContent, (Object[])null );
          listClone.add( objClone );
        } // end if
      } // end for()

      return listClone;
    }
    catch( Exception ex )
    {
      throw new RuntimeException( ex.toString() );
    }
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

    ServiceDictionary objToTest = (ServiceDictionary)objTest;

    if ( ! doListElementTest( m_listServiceDef, objToTest.m_listServiceDef ) )
      return false;

    return true;
  }



  /**
   * Do equals test on each object in the list
   *
   * @param list1 the base list
   * @param list2 the list to compare to the base list
   *
   * @return true if the lists are equal, false otherwise
   *
   */
  private boolean doListElementTest( List list1, List list2 )
  {

    if ( list1 != null )
    {
      if ( list2 == null )
        return false;
      else
      {
        if ( list1.size() != list2.size() )
          return false;   // sizes are different, not equal

        Iterator iObj2 = list2.iterator();

        for ( Object obj1 : list1 )
        {
          Object obj2 = iObj2.next();
          if ( !obj1.equals( obj2 ) )
            return false;

        } // end for

        return true;      // all elements are equal
      } // end else

    } // end if

    if ( list2 == null )
      return true;      // both lists are null so therefore the are equal

    return false;

  } // end doListElementTest()

} // *** End of class ServiceDictionary{}

// *** End Of ServiceDictionary.java