
    function getRequest( /*A string representing the url to call */ strUrl, strDomReplaceId  )
	  {
      strDomId = strDomReplaceId;

      if ( window.XMLHttpRequest )
        req = new XMLHttpRequest();
      else
      if ( window.activeXObject )
         req = new ActiveXObject( "Microsoft.XMLHTTP" );

      req.open( "GET", strUrl, true );
      req.onreadystatechange = processXMLResponse;
      req.send( null );
			    
	  }

    function postForm( form, strUrl, strDomReplaceId  )
    {
      strDomId = strDomReplaceId;

      if ( window.XMLHttpRequest )
        req = new XMLHttpRequest();
      else
      if ( window.activeXObject )
        req = new ActiveXObject( "Microsoft.XMLHTTP" );

      var elements = form.elements;

      var params = "";
			   
      for ( x = 0; x < elements.length; x++ )
      {
        if ( x > 0 )
        params +="&";

        params += elements[ x ].name + "=" + elements[ x ].value;

      }
					  
      //Send the proper header information along with the request
      req.open( "POST", strUrl, true );

      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      req.setRequestHeader("Content-length", params.length);
      req.setRequestHeader("Connection", "close");
      req.onreadystatechange = processXMLResponse;
      req.send( params );
			    
 	 };
			
	 function processXMLResponse()
	 {
	   if ( req.readyState == 4 )
	   {
			    
	     if ( req.status == 200 )
       {
		     var htmlContent = req.responseText;
		     var element = document.getElementById( strDomId );
		     while( element.hasChildNodes() )
		       element.removeChild( element.firstChild );

		     document.getElementById( strDomId ).innerHTML +=  htmlContent;
		   }
     }
	 }
			
	 // define the ajax object
	 function ajax()
	 {
	   this.getRequest = getRequest;
	   this.postForm = postForm;
	 }
	
	 // Create the vwajax object  instance
	 var vwajax = new ajax();
	    