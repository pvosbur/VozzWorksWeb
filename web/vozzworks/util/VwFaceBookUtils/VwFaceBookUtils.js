/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2012 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 * ============================================================================================
 *
 */

/**
 * The VozzWorks Facebook API toolkit. This class wraps the basic facebook api functionality to simplify and reduce the code.
 *
 * @param strAppKey Your app key
 * @param strPermissionScopes The comma separated ;ist of facebook permissions ypu want to grant to your app. (Requires users permission )
 * @param strAccessToken
 * @param fnFBReadyCB  Ready call back when facebook initialization completes
 *
 * @constructor
 */
function VwFaceBookApiUtils( strAppKey, strPermissionScopes, strAccessToken, fnFBReadyCB )
{

  var self = this;

  var m_strAppKey = strAppKey;
  var m_objPermissionScope = {scope: strPermissionScopes};
  var m_accessToken = {};

  // PUBLIC Methods

  this.getUserCredentials = getUserCredentials;
  this.postToWallDialog = postToWallDialog;
  this.getLikeCount = getLikes;
  this.getPhotos = getPhotos;
  this.userLogin = userLogin;
  this.getFanpageCredentials = getFanPageCredentials;
  this.fanPageExists = fanPageExists;

  setupFacebook( fnFBReadyCB );


  /**
   * Initialize the api and login to facebook
   */
  function setupFacebook( fnReady )
  {
    if ( strAccessToken )
    {
      m_accessToken.access_token = strAccessToken;
    }

    VwFaceBookApiUtils.loadFaceBook( 'facebook-jssdk', m_strAppKey, function()
    {
      // Login and get user's permissions for the permissions scope specified

      if ( fnReady )
      {
        fnReady( self )
      }

    });

  }

  function userLogin( fnReady )
  {
    if ( !FB )
    {
      throw "Facebook setup loadFaceBook must first be called before logging in";
    }

    var fLoggedIn = true;
    FB.login( function ( response )
    {
      if ( !response.authResponse )
      {
       fLoggedIn = false;

      }

      if ( fnReady )
      {
        fnReady( fLoggedIn );

      }

    }, m_objPermissionScope );

  }


  /**
   * Gets the like count for a fan page
   *
   * @param strPageName The fan page name
   * @param fnFLikes success handler th result is the like count as a Number
   * @Param fnErr The callback error handler (if not specified a VwErrir box will display the error )
    */
  function getLikes( strPageName, fnLikes, fnErr )
  {
    // Get the basic user credentails
    FB.api( "/" + strPageName +"?fields=likes",  m_accessToken,  function( response )
    {

      if ( response.error )
      {
        handleFbError( response, fnErr );
        return;
      }

      fnLikes( response.likes );

    });

  }



  /**
   * Gets basic facebook user credentials id, full name, email and profile picture
   *
   * @param fnFbCred success handler
   * @Param fnErr The callback error handler (if not specified a VwErrir box will display the error )
   */
  function getUserCredentials( fnFbCred, fnErr )
  {
    "use strict";

    userLogin( function( fLoggedIn )
               {
                 if ( !fLoggedIn )
                 {
                   var err = {};
                   err.error = {};
                   err.error.message = "User Cancelled Login" ;

                   handleFbError( err, fnErr );
                   return;
                 }
                  // Get the basic user credentails
                  FB.api( "/me?fields=id,first_name,last_name,gender,email,picture", function ( response )
                  {
                    if ( response.error )
                    {
                      handleFbError( response, fnErr );
                      return;
                    }

                    fnFbCred( response );

                  });

               });

  } // end fbLogin()

  /**
   * Gets credentaoils about a fan page
   *
   * @param strFanPageName  The Fan page name
   * @param fnFbCred
   * @param fnErr
   */
  function getFanPageCredentials( strFanPageName, fnFbCred, fnErr )
  {
    "use strict";

    // Get the basic credentails
    FB.api( "/" + strFanPageName + "?fields=about,bio,genre,birthday,can_post,founded,general_info,website,username,picture,emails", function ( response )
    {
      if ( response.error )
      {
        handleFbError( response, fnErr );
        return;
      }

      fnFbCred( response );

    });


  } // end etFanPageCredentials()


  /**
   * Test to see if a fanpage exists
   * @param strFanPageName The name of the fan page to test
   * @param fnResult The callback will pass true if exists, false otherwise
   */
  function fanPageExists( strFanPageName, fnResult )
  {
    FB.api( "/" + strFanPageName + "?fields=about,bio,genre,birthday,can_post,founded,general_info,website,username,picture,emails", function ( response )
    {
      if ( response.error )
      {
        fnResult( false );
        return;
      }

      fnResult( true );

    });


  }
  /**
   * Gets photos for a fan page or the logged in facebook user "me"
   *
   * @param strFanPageName the fan page name or "me" for the logged in facebook user
   *
   * @param nMaxCount The max number of photos to retrieve
   * @param fnResult Success callback
   * @param fnError  Error callback
   */
  function getPhotos( strFanPageName, nMaxCount, fnResult, fnError )
  {
    var strGrapParams = "/" + strFanPageName + "/photos?type=uploaded";

    var aPhotos = [];

    var nPhotoCount = 0;

    if ( nMaxCount )
    {
      strGrapParams += "&limit=" + nMaxCount;
    }

    FB.api( strGrapParams, m_accessToken, function( result )
    {
      if ( result.error )
      {
        handleFbError( result, fnError );
        return;
      }

      getAllPhotos( result );


    });

    /**
     * Get all the photo entries up to nMax
     * @param photoObj

     */
    function getAllPhotos( photoOBj )
    {
      var aPhotoEntries = photoOBj.data;
      for ( var x = 0, nLen = aPhotoEntries.length; x < nLen; x++ )
      {
        ++nPhotoCount;
        if ( nMaxCount && nPhotoCount > nMaxCount )
        {
          fnResult( aPhotos );
          return;
        }

        var photoEntry = makePhotoEntry( aPhotoEntries[ x ] );
        aPhotos.push( photoEntry );
      }

      // If we get here, check to see there is a next cursor to get the next batch

      if ( photoOBj.paging && photoOBj.paging.next && typeof nMaxCount != "undefined" && nPhotoCount < nMaxCount )
      {
        FB.api( "/" + strFanPageName + "/photos?pretty=0&type=uploaded&after=" + photoOBj.paging.cursors.after, function( result )
        {
          getAllPhotos( result );
        });

      }
      else
      {
        fnResult( aPhotos );
      }
    }


    /**
     * Make a photoEntry from a raw facebook photo entry
     *
     * @param fbPhotoEntry  Face raw photo entry
     * @returns {{}}
     */
    function makePhotoEntry( fbPhotoEntry )
    {
      var photoEntry = {};
      photoEntry.createDate = fbPhotoEntry.created_time;
      photoEntry.name = fbPhotoEntry.name;
      photoEntry.id = fbPhotoEntry.id;
      photoEntry.images = fbPhotoEntry.images;
      return photoEntry;
    }

  }


  /**
   * Call error callback if specified else display VwError box
   * @param errResponse The error reponse object
   * @param fnerr The user error cdallback
   */
  function handleFbError( errResponse, fnErr )
  {
    if ( fnErr )
    {
      fnErr( errResponse.error.message );
    }
    else
    {
      vwError( errResponse.error.message );
    }


  }


  /**
   * Posts a message to the logged in users wall
   *
   * @param strSiteUrl
   * @param strCaption
   * @param strDescription
   * @param strIconUrl
   * @param fnResponse
   */
  function postToWallDialog( strSiteUrl, strCaption, strDescription, strIconUrl, fnResponse )
  {

    if ( !strSiteUrl )
    {
      throw "The first parameter - siteUrl is required for the postToWallDialoh";
    }

    var feedParams = { method:"feed", link: strSiteUrl};

    if ( strCaption )
    {
      feedParams.caption = strCaption;
    }

    if ( strDescription )
    {
      feedParams.description = strDescription;
    }

    if ( strIconUrl )
    {
      feedParams.picture = strIconUrl;
    }

    FB.ui( feedParams, function(response)
                       {
                         if ( fnResponse )
                         {
                           fnResponse( response );
                         }
                       });


  }



} // end wFaceBookApiUtils{}

// STATIC Methods

/**
 * Displays The Facbook share dialog
 * @param strShareUrl
 * @param fnResponse
 */
VwFaceBookApiUtils.showShareDialog = function( strShareUrl, fnResponse )
{
  "use strict";
  
  FB.ui({
    method: 'share',
    display: 'popup',
    href:strShareUrl,
  }, fnResponse );
  
}

/**
 * Installs a like button (facebook social plugin) in the div for href specified
 *
 * @param strId The div id where like button will be placed
 * @param strHref The href to the page, post, comments etc
 * @param objUserLikeProps Pdditonal style properties (optional) values:
 *        layout:String one of "standard or  box_count or button_count or button (the default) see facebook docs fpr description
 *        actionType:String one of "like (the default) for recommend
 *        showFaces:Boolean if true, shows the faces of people who liked the page the default is false
 *        width:String the width in pixels of the plugin
 *
 */
VwFaceBookApiUtils.installLikeButton = function( strId, strHref, objUserLikeProps )
{
  VwFaceBookApiUtils.checkLoadFB( function()
  {
    var objLikeProps = {};

    objLikeProps.layout = "button";

    objLikeProps.width = "30";
    objLikeProps.showFaces = "false";
    objLikeProps.actionType = "like";

    if ( objUserLikeProps)
    {
      $.extend( objLikeProps, objUserLikeProps );
    }

    $("#" + strId ).addClass("fb-like" );

    $("#" + strId ).attr( "data-send,true");
    $("#" + strId ).attr( "data-share","false");
    $("#" + strId ).attr( "data-width",objLikeProps.width );
    $("#" + strId ).attr( "data-layout",objLikeProps.layout );
    $("#" + strId ).attr( "data-show-faces",objLikeProps.showFaces );
    $("#" + strId ).attr( "data-action", objLikeProps.actionType );
    $("#" + strId ).attr( "data-href", strHref );

    FB.XFBML.parse();


  });


};


/**
 * Installs a like button (facebook social plugin) in the div for href specified
 *
 * @param strId The div id where like button will be placed
 * @param strHref The href to the page, post, comments etc
 * @param strButtonLayout (optional) "button is the default one of "box_count", "button_count", "button", "link", "icon_link", or "icon".
 * @See https://developers.facebook.com/docs/plugins/share-button facebook developer api for complete description
 *
 */
VwFaceBookApiUtils.installShareButton = function( strId, strHref, strButtonLayout )
{
  VwFaceBookApiUtils.checkLoadFB( function()
  {

    if ( !strButtonLayout )
    {
      strButtonLayout = "button";

    }


    $( "#" + strId ).addClass( "fb-share-button" );

    $( "#" + strId ).attr( "data-send,true" );
    $( "#" + strId ).attr( "data-layout", strButtonLayout );
    $( "#" + strId ).attr( "data-href", strHref );

    FB.XFBML.parse();
  });

}


/**
 * Checks to see if the facebook interface is loaded and loads it if it is not.
 */
VwFaceBookApiUtils.checkLoadFB = function( fnReady )
{

  if ( typeof FB == "undefined" )
  {
    VwFaceBookApiUtils.loadFaceBook( 'facebook-plugins', null, fnReady );

  }
  else
  {
    if ( fnReady )
    {
      fnReady();

    }
  }
}

/**
 * Installs facebook in the current page if needed
 *
 * @param id  the id of the script block
 * @param strAppKey The app key if logging in
 * @param fnReady The ready callback when initialization is complete
 */
VwFaceBookApiUtils.loadFaceBook = function( id, strAppKey, fnReady  )
{
  // These steps will force facebook to reload and initialize
  $("[id^='facebook']" ).remove();
  $("#fb-root" ).remove();
  window.FB = null;

  window.fbAsyncInit = function ()
  {
    var initObj = {};
    initObj.xfbml = true;
    initObj.version = "v2.3";

    if ( strAppKey )
    {
      initObj.appId = strAppKey;

    }

    try
    {
      FB.init( initObj );
    }
    catch( err )
    {
      alert( "Error Loading Facebook: " + err );
    }

    if ( fnReady )
    {
      fnReady();

    }
  }

  try
  {
    (function ( d, s, id )
    {
      var js, fjs = d.getElementsByTagName( s )[0];
      if ( d.getElementById( id ) )
      {
        return;
      }
      js = d.createElement( s );
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore( js, fjs );
    }( document, 'script', 'facebook-jssdk', id ));
  }
  catch( errSdk )
  {
    console.log( "Facebook SDK Load error:" + errSdk );
  }

} // end loadFaceBook


export default VwFaceBookApiUtils;