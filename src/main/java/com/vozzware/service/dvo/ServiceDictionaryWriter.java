/*
============================================================================================

                       V o z z W o r k s   C o d e   G e n e r a t o r                      

                               2009 by V o z z W a r e   L L C                              

    Source File Name: ServiceDictionaryWriter.java

    Author:           

    Date Generated:   02-05-2009

    Time Generated:   13:46:45

============================================================================================
*/

package com.vozzware.service.dvo;

import java.net.URL;
import java.io.File;
import com.vozzware.util.VwResourceStoreFactory;
import com.vozzware.xml.VwBeanToXml;
import javax.xml.schema.util.XmlDeSerializer;


public class ServiceDictionaryWriter
{


  /**
   * Serializes the bean to XML in a String
   * @throws Exception if any serialization errors occur
   */
  public static String toString( ServiceDictionary objToWrite ) throws Exception
  {
    return toString( objToWrite, null );
  } // End of toString()



  /**
   * Serializes the bean to XML in a String
   * @throws Exception if any serialization errors occur
   */
  public static String toString( ServiceDictionary objToWrite, String strCommentHeader ) throws Exception
  {
    VwBeanToXml btx = config( strCommentHeader );
    return btx.serialize( null, objToWrite );
  } // End of toString()



  /**
   * Serializes the bean to XML and writes the XML to the file specified
   * @throws Exception if any file io errors occur
   */
  public static void write( ServiceDictionary objToWrite, File fileToWrite ) throws Exception
  {
    write( objToWrite, fileToWrite, null );
  } // End of write()



  /**
   * Serializes the bean to XML and writes the XML to the file specified
   * @throws Exception if any file io errors occur
   */
  public static void write( ServiceDictionary objToWrite, File fileToWrite, String strCommentHeader ) throws Exception
  {
    VwBeanToXml btx = config( strCommentHeader );
    btx.serialize( null, objToWrite, fileToWrite  );
  } // End of write()



  /**
   * Configures VwBeanToXml properties
   */
  private static VwBeanToXml config( String strCommentHeader ) throws Exception
  {
    URL urlSchemaXSD = VwResourceStoreFactory.getInstance().getStore().getDocument( "ServiceSpec.xsd" );

    VwBeanToXml btx = new VwBeanToXml( "<?xml version=\"1.0\"?>", null, true, 0 );
    
    if ( strCommentHeader != null )
       btx.setDocumentCommentHeader( strCommentHeader );
    
    btx.addSchema( urlSchemaXSD, ServiceDictionary.class.getPackage() );
     
    btx.setFeature( XmlDeSerializer.ATTRIBUTE_MODEL, true  ); 
    btx.setContentMethods( ServiceDictionary.class, "getServiceDef"  );

    return btx;
  } // End of config()


} // *** End of class ServiceDictionaryWriter{}

// *** End Of ServiceDictionaryWriter.java