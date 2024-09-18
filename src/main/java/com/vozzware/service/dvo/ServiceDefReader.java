/*
============================================================================================

                       V o z z W o r k s   C o d e   G e n e r a t o r                      

                               2009 by V o z z W a r e   L L C                              

    Source File Name: ServiceDefReader.java

    Author:           

    Date Generated:   07-23-2011

    Time Generated:   12:19:24

============================================================================================
*/

package com.vozzware.service.dvo;

import java.net.URL;
import org.xml.sax.InputSource;
import com.vozzware.util.VwResourceStoreFactory;
import com.vozzware.xml.VwXmlToBean;
import javax.xml.schema.util.XmlDeSerializer;


public class ServiceDefReader
{


  /**
   * Reader
   */
  public static ServiceDef read( URL urlDoc ) throws Exception
  {
    URL urlClassgenSchema = VwResourceStoreFactory.getInstance().getStore().getDocument( "ServiceSpec.xsd" );
     
    VwXmlToBean xtb = new VwXmlToBean();
    xtb.setFeature( XmlDeSerializer.ATTRIBUTE_MODEL, true  );
    
    return (ServiceDef)xtb.deSerialize( new InputSource( urlDoc.openStream() ), ServiceDef.class, urlClassgenSchema  );
  } // End of read()


} // *** End of class ServiceDefReader{}

// *** End Of ServiceDefReader.java