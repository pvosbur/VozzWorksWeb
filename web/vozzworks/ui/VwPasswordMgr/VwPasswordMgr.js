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

VwCssImport( "/vozzworks/ui/VwPasswordMgr/style");

/**
 * Constructor for the vw form manager password manager
 *
 * @param vwresourceMgr Optional The VwPropertyMgr instance (only needed if doing i18n) The VwPropertyMgr contains the loaded resource bundle
 *
 * @constructor
 */
function VwPasswordMgr( vwresourceMgr )
{

  // HTML id names and jQuery selectors
  const m_strParentDivId = "vwPswdInfo";
  const m_strLetterDivId = "letter";
  const m_strCapitalDivId = "capital";
  const m_strNumberDivId = "number";
  const m_strLengthDivId = "length";
  const m_strSpecialCharDivId = "special";
  const m_strPswdInfoHdrDivId = "vwPswdInfoHdr";

  // HTML class names and jQuery selectors
  const m_strInvalidClass = "VwInvalid";
  const m_strValidClass = "VwValid";


  // Public methods
  this.checkPassword = checkPassword;
  this.onFocus = onFocus;
  this.onBlur = onBlur;
  this.close = close;
  this.isValidPassword = isValidPassword;


  /**
   * Create the popup div blocks for field validation and password strength
   */
  function setupPasswordPopup()
  {
    const divPasswordInfo = $( "#" + m_strParentDivId );

    if ( divPasswordInfo.length > 0 )
    {
      return;
    }

    let  strPwdInfoHdr, strPwdInfoLetter, strPwdInfoCapLetter, strPwdInfoNumber, strPwdInfo8Chars, strPwdInfoSpecialChar;

    if ( vwresourceMgr )
    {
      strPwdInfoHdr = vwresourceMgr.getString( "pwdInfoHdr");
      strPwdInfoLetter = vwresourceMgr.getString( "pwdInfoLetter");
      strPwdInfoCapLetter = vwresourceMgr.getString( "pwdInfoCapLetter");
      strPwdInfoNumber = vwresourceMgr.getString( "pwdInfoNumber");
      strPwdInfo8Chars = vwresourceMgr.getString( "pwdInfo8Chars");
      strPwdInfoSpecialChar = vwresourceMgr.getString( "pwdInfoSpecialChar");
    }
    else
    {
      strPwdInfoHdr = "Password must meet the following requirements:";
      strPwdInfoLetter = "At least <strong>one lower case letter</strong>";
      strPwdInfoCapLetter = "At least <strong>one capital letter</strong>";
      strPwdInfoNumber = "At least <strong>one number</strong>";
      strPwdInfo8Chars = "Be at least <strong>8 characters</strong>";
      strPwdInfoSpecialChar = "At least <strong>1 special character</strong>";
    }

    //<!-- This div is for the password strength popup -->
    const strPasswordDiv = "<div id='" + m_strParentDivId + "'>"
    	+ "<div id='" + m_strPswdInfoHdrDivId + "'>" + strPwdInfoHdr + "</div>"
    	+ "<ul>"
    	+ "<li id='" + m_strLetterDivId + "' class='" + m_strInvalidClass + "'>" + strPwdInfoLetter + "</li>"
    	+ "<li id='" + m_strCapitalDivId + "' class='" + m_strInvalidClass + "'>" + strPwdInfoCapLetter + "</li>"
    	+ "<li id='" + m_strNumberDivId + "' class='" + m_strInvalidClass + "'>" + strPwdInfoNumber + "</li>"
      + "<li id='" + m_strLengthDivId + "' class='" + m_strInvalidClass + "'>" + strPwdInfo8Chars + "</li>"
      + "<li id='" + m_strSpecialCharDivId + "' class='" + m_strInvalidClass + "'>" + strPwdInfoSpecialChar + "</li>"
      + "</ul>"
      + "</div>";

    $( "body" ).append( strPasswordDiv );

  }

  /**
   * Check the password constraints
   * @param ctlPwd  the html password input control
   */
   function checkPassword( ctlPwd )
   {
     const strPassword = $( ctlPwd ).val();

     //validate the length
     if ( !strPassword ||  strPassword.length < 8 )
     {
     	$( "#" + m_strLengthDivId ).removeClass( m_strValidClass ).addClass( m_strInvalidClass );
     }
     else
     {
     	$( "#" + m_strLengthDivId ).removeClass( m_strInvalidClass ).addClass( m_strValidClass );
     }

     //validate letter
     if ( strPassword.match(/[a-z]/) )
     {
     	$( "#" + m_strLetterDivId ).removeClass( m_strInvalidClass ).addClass( m_strValidClass );
     }
     else
     {
     	$( "#" + m_strLetterDivId ).removeClass( m_strValidClass ).addClass( m_strInvalidClass );
     }

     //validate capital letter
     if ( strPassword.match(/[A-Z]/) )
     {
     	$( "#" + m_strCapitalDivId ).removeClass( m_strInvalidClass ).addClass( m_strValidClass );
     }
     else
     {
     	$( "#" + m_strCapitalDivId ).removeClass( m_strValidClass ).addClass( m_strInvalidClass );
     }

     //validate number
     if ( strPassword.match(/\d/) )
     {
     	$( "#" + m_strNumberDivId ).removeClass( m_strInvalidClass ).addClass( m_strValidClass );
     }
     else
     {
     	$( "#" + m_strNumberDivId ).removeClass( m_strValidClass ).addClass( m_strInvalidClass );
     }

     //validate special character
     if ( strPassword.match(/[$@$!%*?&]/) )
     {
     	$( "#" + m_strSpecialCharDivId ).removeClass( m_strInvalidClass ).addClass( m_strValidClass );
     }
     else
     {
     	$( "#" + m_strSpecialCharDivId ).removeClass( m_strValidClass ).addClass( m_strInvalidClass );
     }

   }



  /**
   * The password is valid if the list item elements in the vwPswdInfo div all have a class value of 'VwValid'
   */
   function isValidPassword()
   {
     if ( $( "#" + m_strLetterDivId ).attr( "class") != "VwValid" )
     {
       return false;
     }

     if ( $( "#" + m_strCapitalDivId ).attr( "class") != "VwValid" )
     {
       return false;
     }

     if ( $( "#" + m_strNumberDivId ).attr( "class") != "VwValid" )
     {
       return false;
     }

     if ( $( "#" + m_strLengthDivId ).attr( "class") != "VwValid" )
     {
       return false;
     }

     if ( $( "#" + m_strSpecialCharDivId ).attr( "class") != "VwValid" )
     {
       return false;
     }

     return true;

   }


  /**
   * Calculates popup metrics
   * @param strPasswordCtl: The password field ID name
   */
  function calcPasswordPopupMetrics( strPasswordCtl )
  {
     // Calculate the position of the popup
     const offset = $( strPasswordCtl ).offset();

     const nPwdFieldWidth = $( strPasswordCtl ).width();

     const nHeight = $( strPasswordCtl ).height();

     const nPwdInfoWidth = $( "#" + m_strParentDivId ).width();

     const nXOffset = nPwdFieldWidth / 2 - nPwdInfoWidth / 2;

    // Adjust the css top and left position elements
    $( "#" + m_strParentDivId ).css( { "top": offset.top  +  nHeight + 20, "left": offset.left + nXOffset });
    // the extra 20 pixels accounts for the up arrow
  }

  /**
   * On focus it shows the password instruction popup. Optional call to calculate popup metrics.
   * @param fNeedMetricCalc:  Boolean. If true it calculates the password instructions popup
   * @param strPasswordCtl:   String. Password field in the DOM
   */
  function onFocus( fNeedMetricCalc, strPasswordCtl )
  {
    // Setup needs to run first
    setupPasswordPopup();

    // check password validation every time we focus
    checkPassword( "#" + strPasswordCtl );

    if ( fNeedMetricCalc )
    {
      calcPasswordPopupMetrics( "#" + strPasswordCtl );
    }

    $( "#" + m_strParentDivId ).show();
  }

  /**
   * On blur it hides the password instructions popup
   */
  function onBlur()
  {
    $( "#" + m_strParentDivId ).hide();
  }



  /**
   * Used form/or dialog completes to hide any showing popups
   */
  function close()
  {
    onBlur();
    $( "body" ).unbind( "keypress");
  }

} // end VwPasswordMgr{}

export default VwPasswordMgr;