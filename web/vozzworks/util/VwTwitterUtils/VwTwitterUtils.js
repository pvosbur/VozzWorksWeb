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
 * Twitter rest api
 * @param twitterAppProperties These are the app properties required to make OAuth rest api calls values are
 *        appConsumerKey:String:required
 *        appConsumerKeySecret:String:required
 *        appAccessToken:String:required
 *        appAccessTokenSecret:String:required
 *        serverUrl
 * @constructor
 */
function VwTwitterUtils( twitterAppProperties, vwAjaxMgr )
{
  var m_twitterAppProperties = twitterAppProperties;

  var m_vwAjaxMgr = vwAjaxMgr;

  this.getTweets = getTweets;

  if ( !VwExString.endsWith( m_twitterAppProperties.serverUrl, "/" ) )
  {
    m_twitterAppProperties.serverUrl += "/";
  }

  /**
   *
   * @param strTwitterId
   * @param nCount
   * @param fnResult
   * @param fnError
   */
  function getTweets( strTwitterId, nCount, fnResult, fnError )
  {
    var strNounce = "VwApiTwitterUtils" + new Date().getTime();

    var strRESTUrl = "https://api.twitter.com/1.1/statuses/user_timeline.json";
    var strOauth = makeOAUTH( "get", strRESTUrl, m_twitterAppProperties.appConsumerKey, m_twitterAppProperties.appConsumerKeySecret, m_twitterAppProperties.appAccessToken,
                              m_twitterAppProperties.appAccessTokenSecret, strNounce, ["count=" + nCount], strTwitterId );

    var strServerUrl = m_twitterAppProperties.serverUrl;


    strServerUrl += "getTweets?count=" + nCount + "&tid=" + strTwitterId;
    m_vwAjaxMgr.post( strServerUrl, strOauth, fnResult, fnError );

  }


  /**
   *
   * @param strMethod The rest methos GET or POST
   * @param strTwitterRestUrl  The twitter REST URL
   * @param strOAuthConsumenKey The APPs Consumer key
   * @param strOAuthConsumerSecret The Twitter APP's consumer key secret
   * @param strAccessToken The Twitter APP's access token
   * @param strAccessTokenSecret The Twitter APP's access token secret
   * @param strNounce
   * @returns {string}
   */
  function makeOAUTH( strMethod, strTwitterRestUrl, strOAuthConsumenKey, strOAuthConsumerSecret, strAccessToken, strAccessTokenSecret, strNounce, astrParams, strScreenName  )
  {
    var timestamp = new Date();
    var strTimeStamp = timestamp.getTime().toString().substring( 0, 10 );


    var strOAuthSig = strMethod.toUpperCase() + "&" + encodeURIComponent( strTwitterRestUrl );

    for ( var x = 0, nLen = astrParams.length; x < nLen; x++ )
    {
      strOAuthSig += "&" + encodeURIComponent( astrParams[ x ] );
    }

    strOAuthSig += "%26" + encodeURIComponent( "oauth_consumer_key=" ) + encodeURIComponent( strOAuthConsumenKey ) +
                   "%26" + encodeURIComponent( "oauth_nonce=" ) + encodeURIComponent( strNounce ) + "%26" +  encodeURIComponent( "oauth_signature_method=HMAC-SHA1" ) +
                   "%26" + encodeURIComponent( "oauth_timestamp=") +  strTimeStamp + "%26" + encodeURIComponent( "oauth_token=" ) + encodeURIComponent( strAccessToken ) +
                   "%26" + encodeURIComponent( "oauth_version=1.0" ) + "%26" + encodeURIComponent( "screen_name=" + strScreenName);


    var strSecret = encodeURIComponent( strOAuthConsumerSecret ) + "&" + encodeURIComponent( strAccessTokenSecret );

    var shaObj = new jsSHA( strOAuthSig, "TEXT");
    var hmac = shaObj.getHMAC(strSecret, "TEXT", "SHA-1", "B64");


    var strAuthHeader = 'OAuth oauth_consumer_key="' + strOAuthConsumenKey + '", oauth_nonce="' + strNounce + '", oauth_signature="' + encodeURIComponent( hmac ) +
                        '", oauth_signature_method="HMAC-SHA1", oauth_timestamp="' + strTimeStamp + '", oauth_token="' + strAccessToken + '", oauth_version="1.0"';

    return strAuthHeader;

  }

}

VwTwitterUtils.installTweetBtn = function( strId, tweetProps, fnTweetComplete )
{

  $("#" + strId ).addClass("twitter-share-button" );

  if ( tweetProps.cssTwitterBtn )
  {
    $("#" + strId ).addClass( tweetProps.cssTwitterBtn );

  }


  if ( tweetProps.tweetText )
  {
    $("#" + strId ).attr( "data-text", tweetProps.tweetText );

  }

  if ( tweetProps.tweetLink )
  {
    $("#" + strId ).attr( "data-url", tweetProps.tweetLink );

  }

  if ( tweetProps.tweetVia )
  {
     $("#" + strId ).attr( "data-via", tweetProps.tweetVia );

  }


  if ( tweetProps.btnSize )
  {
     $("#" + strId ).attr( "data-size", tweetProps.btnSize );

  }
  else
  {
    $("#" + strId ).attr( "data-size", "medium" );

  }


  if ( tweetProps.count )
  {
    $("#" + strId ).attr( "data-count", tweetProps.count );
  }
  else
  {
    $("#" + strId ).attr( "data-count", "none" );

  }

  if ( tweetProps.hashTags )
  {
    $("#" + strId ).attr( "hashtags", tweetProps.hashTags );
  }

  if ( fnTweetComplete )
  {
    VwTwitterUtils.bindTweetEvent( fnTweetComplete )
  }
  else
  {
    VwTwitterUtils.loadTwitter();
  }

  VwTwitterUtils.waitForTweetBtn( strId );


};


VwTwitterUtils.bindTweetEvent = function( fnTweetComplete )
{
  if ( !window.twttr )
  {
    VwTwitterUtils.loadTwitter();

  }

  window.twttr.ready( function( twttr)
                      {
                        twttr.events.bind('tweet', fnTweetComplete);
                      });

};


/**
 * Opens a window that allows a user to post a tweet message
 * @param strTweetText
 * @param strUrl
 */
VwTwitterUtils.postTweetMsg = function( strTweetText, strUrl  )
{
  "use strict";

  var strEncodedText = encodeURIComponent( strTweetText );
  var strBaseUrl = "https://twitter.com/intent/tweet?text=" + strEncodedText;

  if ( strUrl )
  {
    strBaseUrl += "&url=" + strUrl;
  }

  var strOpts = "toolbar=no, titlebar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=600, height=400, top=200, left=600";
  window.open( strBaseUrl , "_blank", strOpts );


}


/**
 * Wait for the tweet btn to be realized as we need to change the position to absolute
 * @param fnReady
 */
VwTwitterUtils.waitForTweetBtn = function( strTweetBtnClass, fnReady )
{

    //We have to wait for tweet button to realize in order to change the position attribute
    setTimeout( function()
                {

                  var strPos = $("." + strTweetBtnClass  ).css( "position" );


                  if ( strPos && strPos == "static")
                  {
                    $("." + strTweetBtnClass  ).css( "position", "absolute" );

                    if ( fnReady )
                    {
                      fnReady();

                    }

                    return;
                  }
                  else
                  {
                    VwTwitterUtils.waitForTweetBtn( strTweetBtnClass, fnReady );
                  }
                }, 100 );


};

VwTwitterUtils.loadTwitter = function()
{

  if ( window.twttr )   // Twitter already loaded just invoked the widgets,lod to reparse any new entries
  {
    window.twttr.widgets.load();
    return;


  }

  window.twttr = (function (d, s, id)
  {
    var t, js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id))
    {
      return;
    }

    js = d.createElement(s); js.id = id;
    js.src= "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    return window.twttr || (t = { _e: [], ready: function (f) { t._e.push(f) } });
  }(document, "script", "twitter-api-share"));


};


/**
  * Installs a Twitter follow button (twitter plugin) in the div for href specified
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
VwTwitterUtils.installFollowButton = function( strId, strHref, objUserLikeProps )
 {

   var objLikeProps = {};

   objLikeProps.layout = "button";

   objLikeProps.width = "30";
   objLikeProps.showFaces = "false";
   objLikeProps.actionType = "like";

   if ( objUserLikeProps )
   {
      $.extend( objLikeProps, objUserLikeProps );
   }

   $("#" + strId ).addClass("fb-like" );

   $("#" + strId ).attr( "data-send,true");
   $("#" + strId ).attr( "data-share", "false");
   $("#" + strId ).attr( "data-width", objLikeProps.width );
   $("#" + strId ).attr( "data-layout", objLikeProps.layout );
   $("#" + strId ).attr( "data-show-faces", objLikeProps.showFaces );
   $("#" + strId ).attr( "data-action", objLikeProps.actionType );
   $("#" + strId ).attr( "data-href", strHref );

   FB.XFBML.parse();

 };
