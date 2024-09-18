/*
============================================================================================

                       V o z z W o r k s   C o d e   G e n e r a t o r                      

                               2009 by V o z z W a r e   L L C                              

    Source File Name: ServiceDictionaryReader.java

    Author:           

    Date Generated:   02-05-2009

    Time Generated:   13:46:45

============================================================================================
*/

package com.vozzware.service.dvo;

import java.net.URL;
import org.xml.sax.InputSource;
import com.vozzware.util.VwResourceStoreFactory;
import com.vozzware.xml.VwXmlToBean;
import javax.xml.schema.util.XmlDeSerializer;


public class ServiceDictionaryReader
{


  /**
   * Reader
   */
  public static com.vozzware.service.dvo.ServiceDictionary read( URL urlDoc ) throws Exception
  {
    URL urlClassgenSchema = VwResourceStoreFactory.getInstance().getStore().getDocument( "ServiceSpec.xsd" );
     
    VwXmlToBean xtb = new VwXmlToBean();
    xtb.setFeature( XmlDeSerializer.ATTRIBUTE_MODEL, true  );
    
    return (com.vozzware.service.dvo.ServiceDictionary)xtb.deSerialize( new InputSource( urlDoc.openStream() ), com.vozzware.service.dvo.ServiceDictionary.class, urlClassgenSchema  );
  } // End of read()


} // *** End of class ServiceDictionaryReader{}

// *** End Of ServiceDictionaryReader.java