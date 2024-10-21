package vozzware.http;

import com.vozzware.http.VwHtmlParser;
import com.vozzware.util.VwFileUtil;
import com.vozzware.util.VwResourceStoreFactory;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.net.URL;
import java.util.Map;

public class TestHtmlParser
{

  @Test
  public void testGetInputTagData() throws Exception
  {
    URL urlHtmlDoc = VwResourceStoreFactory.getInstance().getStore().getDocument( "testHtml.html" );

    Assertions.assertNotNull(urlHtmlDoc, "expected to find testHtml.html in /resourse/docs folder but got null" );

    String strContent = VwFileUtil.readFile( urlHtmlDoc );

    Assertions.assertNotNull( strContent, "Expected contents of testHtml.html file to be not null"  );

    VwHtmlParser htmlParser = new VwHtmlParser( strContent );


    // First search is for hidden input tags only
    Map<String, String>mapInputTags = htmlParser.getInputTagData( true );

    Assertions.assertTrue( mapInputTags.size() == 12, "Expected 12 <input type='hidden' tags but got " + mapInputTags.size() );

    // Now search fro all tags

    htmlParser.setCursor( 0 );
    mapInputTags = htmlParser.getInputTagData( false );
    Assertions.assertTrue( mapInputTags.size() == 17, "Expected 17 <input tags but got " + mapInputTags.size() );

    htmlParser.setCursor( 0 );

    String strInputValue = htmlParser.getTagAttrValue( "input", "name", "ICSID" );
    Assertions.assertNotNull(strInputValue, "Expected a value for the input tag ICSID but got null" );

    return;

  }

}
