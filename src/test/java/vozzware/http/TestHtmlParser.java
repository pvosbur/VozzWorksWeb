package test.vozzware.http;

import com.vozzware.http.VwHtmlParser;
import com.vozzware.util.VwFileUtil;
import com.vozzware.util.VwResourceStoreFactory;
import org.junit.Assert;
import org.junit.Test;

import java.net.URL;
import java.util.Map;

public class TestHtmlParser
{

  @Test
  public void testGetInputTagData() throws Exception
  {
    URL urlHtmlDoc = VwResourceStoreFactory.getInstance().getStore().getDocument( "testHtml.html" );

    Assert.assertNotNull( "expected to find testHtml.html in /resourse/docs folder but got null", urlHtmlDoc );

    String strContent = VwFileUtil.readFile( urlHtmlDoc );

    Assert.assertNotNull( "Expected contents of testHtml.html file to be not null", strContent );

    VwHtmlParser htmlParser = new VwHtmlParser( strContent );


    // First search is for hidden input tags only
    Map<String, String>mapInputTags = htmlParser.getInputTagData( true );

    Assert.assertTrue( "Expected 12 <input type='hidden' tags but got " + mapInputTags.size(), mapInputTags.size() == 12 );

    // Now search fro all tags

    htmlParser.setCursor( 0 );
    mapInputTags = htmlParser.getInputTagData( false );
    Assert.assertTrue( "Expected 17 <input tags but got " + mapInputTags.size(), mapInputTags.size() == 17 );

    htmlParser.setCursor( 0 );

    String strInputValue = htmlParser.getTagAttrValue( "input", "name", "ICSID" );
    Assert.assertNotNull( "Expected a value for the input tag ICSID but got null", strInputValue );

    return;

  }

}
