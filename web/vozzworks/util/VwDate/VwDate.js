/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2022 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 * ============================================================================================
 *
 */

import VwStringBuffer from "/vozzworks/util/VwStringBuffer/VwStringBuffer.js";
import VwStringTokenParser from "/vozzworks/util/VwStringTokenParser/VwStringTokenParser.js";

/**
 * This class encompasses the javascript Date class and provides full data formatting using the standard formats<br/>
 * as provided in the Java SimpleDateFormat class. Additional convenience methods are provided for date comparisons and date arithmatic.
 *
 * The date constructor can take a date string initializer, a Javascript Date or another VwDate object
 *
 * @param dateInitializer May be null or must be one of a javascript Date or VwDate instance or a valid string date initializer
 * @constructor
 */
function VwDate( dateInitializer )
{
  const self = this;
  const MILLISECS_IN_DAY = 1000 * 60 * 60 * 24;
  const MILLISECS_IN_HOUR = 1000 * 60 * 60;
  const MILLISECS_IN_MIN = 1000 * 60;
  const MILLISECS_IN_SECOND = 1000;

  let m_date;

  // Make sure the date initializer is valid and produces a valie date
  if ( dateInitializer )
  {
    if ( dateInitializer instanceof Date || dateInitializer instanceof VwDate )
    {
       if ( dateInitializer instanceof VwDate )
       {
         m_date = dateInitializer.toDate();
       }
       else
       {
         m_date = dateInitializer ;
       }

       if ( !VwDate.isValidDate( m_date ) )
       {
         throw `The date ${dateInitializer} is not a valid date`;
       }

    }
    else
    if ( typeof dateInitializer == "string" || typeof dateInitializer == "number")
    {
      m_date = new Date( dateInitializer )

      if ( !VwDate.isValidDate( m_date ) )
      {
        throw `The date string dateInitializer '${dateInitializer}' did not produce a valid date`;
      }
     }
    else
    {
      throw "Invalid dateInitializer, must be an instance of javascript Date, VwDate or a valid date initializer string";
    }
  }
  else
  {
    m_date = new Date();
  }

  /**
   * Returns true if date is valid, false otherwise
   * @returns {boolean}
   */
  this.isValid = () => VwDate.isValidDate( m_date );


  /**
   * Returns the native instance date
   */
  this.toDate = () => m_date;
  this.toBlogDate = toBlogDate;
  this.getMonth = () => m_date.getMonth() + 1;
  this.getDay = () => m_date.getDate();
  this.getYear = () => m_date.getFullYear();
  this.getHours = () => m_date.getHours();
  this.getMinutes = () => m_date.getMinutes();
  this.getSeconds = () => m_date.getSeconds();
  this.setHours = ( nHours) => m_date.setHours( nHours);
  this.setMinutes = ( nMinutes) => m_date.setMinutes(nMinutes);
  this.setSeconds = (nSecs) => m_date.setSeconds( nSecs);
  this.getMilliseconds = () => m_date.getMilliseconds();
  this.setMilliseconds = ( nMiiliSecs) => m_date.setMilliseconds( nMiiliSecs);

  /**
   * Adds the nbr of years specified to the date
   * @param nYearsToAdd The nbr of years to add
   * @return {number}
   */
  this.addYears = (nYearsToAdd ) => m_date.setTime( m_date.getTime() + (MILLISECS_IN_DAY * 365 * nYearsToAdd ));

  /**
   * Adds the number of days to the current date instance
   *
   * @param nDaysToAdd The nbr of days to add
   * @returns {number}
   */
  this.addDays = (nDaysToAdd ) => m_date.setTime( m_date.getTime() + (MILLISECS_IN_DAY * nDaysToAdd ));

  /**
   * gets the difference in dates fromm the instance date to the date passed
   * @param date
   * @return {number}
   */
  this.getDaysDiff = (date ) => (m_date.getTime() - date.getTime() ) / MILLISECS_IN_DAY;

  /**
   * Subtracts the nbr of years from the specified date
   * @param nYearsToAdd The nbr of years to add
   * @return {number}
   */
  this.subtractYears = (nYearsToSubtract ) => m_date.setTime( m_date.getTime() - (MILLISECS_IN_DAY * 365 * nYearsToSubtract ));

  /**
   * Substracts the number of dayas from the current date instance
   *
   * @param nDaysToSubtract The nbr of days to subtract
   * @returns {number}
   */
  this.subtractDays = (nDaysToSubtract ) => m_date.setTime( m_date.getTime() - (MILLISECS_IN_DAY * nDaysToSubtract ));

  /**
   * Adds the number of hours to the current date instance
   * @param nHoursToAdd The nbr of hours to add
   * @returns {number}
   */
  this.addHours = (nHoursToAdd ) => m_date.setTime( m_date.getTime() + (MILLISECS_IN_HOUR* nHoursToAdd ));

  /**
   * Substracts the number of hours from the current date instance
   *
   * @param nHoursToSubtract the nbr of hours to subtract
   * @returns {number}
   */
  this.subtractHours = (nHoursToSubtract ) => m_date.setTime( m_date.getTime() - (MILLISECS_IN_HOUR * nHoursToSubtract ));

  /**
   * Adds the number of minutes to the current date instance
   *
   * @param nMinToAdd The nbr of minutes to add
   * @returns {number}
   */
  this.addMinutes = (nMinToAdd ) => m_date.setTime( m_date.getTime() + (MILLISECS_IN_MIN * nMinToAdd ));

  /**
   * Substracts the number of minutes from the current date instance
   *
   * @param nMinToSubtract The nbr of minutes to subtract
   * @returns {number}
   */
  this.subtractMinutes = (nMinToSubtract ) => m_date.setTime( m_date.getTime() - (MILLISECS_IN_MIN * nMinToSubtract ));

  /**
   * Adds the number of secondses to the current date instance
   *
   * @param nSecsToAdd The nbr of seconds to add
   * @returns {number}
   */
  this.addSeconds = (nSecsToAdd ) => m_date.setTime( m_date.getTime() + (MILLISECS_IN_SECOND * nSecsToAdd ));

  /**
   * Substracts the number of seconds from the current date instance
   *
   * @param nSecsToSubtract The nbr of seconds to subtract
   * @returns {number}
   */
  this.subtractSeconds = (nSecsToSubtract ) => m_date.setTime( m_date.getTime() - (MILLISECS_IN_SECOND * nSecsToSubtract ));

  /**
   * Returns the time in milliseconds since Jan 1, 1970 UTC time
   * @returns {*}
   */
  this.getTime = () => m_date.getTime();

  /**
   * Formats the date according to the date format string. The legal format characters use the Java SimpleDateFormat specifiers
   *
   * @param strDateFormat The date/time format string to use
   */
  this.format = ( strFormat ) => VwDate.format( m_date, strFormat );

  /**
   * Compares This date instance with another date object of type VwDate or javascript Date
   *
   * @type {(function(*, *): number)|*}
   * @return 0 id dates are equal, -1 if this date < dateToCompare, 1 if this date > dateToCompare
   */
  this.compare = ( dateToCompare ) => VwDate.compare( m_date, dateToCompare );

  /**
   * Returns true if this date equals the dateToCompare
   *
   * @param dateToCompare The date object to compare or a valid date represented by a sting
   *
   * @return {boolean} true if this date equals the dateToCompare
   */
  this.isEqualTo = testEquals;

  /**
   * Test if this date instance is less than the dateToCompare
   *
   * @param dateToCompare The date to compare this date or a valid date represented by a sting
   * @return {boolean} true if this date is < than the dateToCompare
   */
  this.isLessThan = testLessThan;

  /**
   * Test if this date instance is greater than the dateToCompare
   *
   * @param dateToCompare The date to compare this date or a valid date represented by a sting
   * @return {boolean} true if this date is > than the dateToCompare
   */
  this.isGreaterThan = testGreaterThan;

  /**
   * Formats date to blog date format.<br/>
   * if the date is todays date "Today" is returned<br/>
   * if the date was the day vefor "Yesterday" is returned</br>
   * if the date year is the current year, The month day is returned
   * else the month day year is returned
   */
  function toBlogDate( vwResourceMgr )
  {
     const today = new VwDate( Date.now() );
     const yesterDay = new VwDate();
     yesterDay.subtractDays( 1 );

     const strBlogDate = self.format( "MM/dd/yy");

     const nYear = today.getYear();
     const nBlogDateYear = self.getYear();

     if ( self.isEqualTo( today, true ) )
     {
       if ( vwResourceMgr )
       {
         return vwResourceMgr.getString( "today");
       }
       else
       {
         return "Today";
       }
     }
     else
     if ( self.isEqualTo( yesterDay, true ) )
     {
       if ( vwResourceMgr )
       {
         return vwResourceMgr.getString( "yesterday");
       }
       else
       {
         return "Yesterday";
       }
     }
     else
     if ( nYear == nBlogDateYear )
     {
       return self.format(  "MM/yy");
     }
     else
     {
       return self.format(  "MM/dd/yy");

     }

  } // end toBlogDate()


  /**
   * Test this date and the dateTotTest
   *
   * @param dateToTest A string date or a valid instance of a javascript Date or a VwDate
   * @return {boolean} true if the dates are equal, false otherwise
   * @exception if the dateToTest arg is invalid
   */
  function testEquals( dateToTest, bIgnoreTime )
  {
    let compareDate = validateDateToTest(dateToTest);

    return VwDate.compare( m_date, compareDate, bIgnoreTime ) == 0;

  }


  /**
   * Test this date and the dateTotTest
   *
   * @param dateToTest A string date or a valid instance of a javascript Date or a VwDate
   * @return {boolean} true if this date is < than the dateToTest
   * @exception if the dateToTest arg is invalid  */
  function testLessThan( dateToTest )
  {
    let compareDate = validateDateToTest(dateToTest);

    return VwDate.compare( m_date, compareDate ) < 0;
  }


  /**
   * Test this date and the dateTotTest
   *
   * @param dateToTest A string date or a valid instance of a javascript Date or a VwDate
   * @return {boolean} true if this date is > than the dateToTest
   * @exception if the dateToTest arg is invalid
   */
  function testGreaterThan( dateToTest )
  {
    let compareDate = validateDateToTest(dateToTest);

    return VwDate.compare( m_date, compareDate ) > 0;
  }

  /**
   * Test the dateTotest which can be a valid string date or an instance of VwDate or javascript Date
   *
   * @param dateToTest The string date or date instance
   * @return {Date} returns a date instance if valid else throws an exception
   */
  function validateDateToTest( dateToTest )
  {
    let date;

    if ( typeof dateToTest == "string" )
    {
      date = new Date( dateToTest );
      if ( !VwDate.isValidDate( date ) )
      {
        throw `Date string '${dateToTest}' did not produce a valid date` ;
      }

    }
    else
    {
      date = dateToTest;
      if ( !VwDate.isValidDate( date ) )
      {
        throw `The date object '${dateToTest}' is not a valid date` ;
      }

    }

    return date;

  } // end validateDateToTest()

} // end VwDate{}

/**
 * Formats the date using the format string with values specified by the Java SimpleDateFormat objects. Refer to that for the reference
 * @param date
 * @param strFormat
 * @return {string}
 */
VwDate.format = (date, strFormat ) =>
{

  const strFormatDelimiters = "-/:., ";

  const tokenParser = new VwStringTokenParser( strFormat, strFormatDelimiters );
  tokenParser.setReturnDelim( true );

  const sbFormatedDate = new VwStringBuffer();

  while( true )
  {
    const token = tokenParser.getNextToken();
    if ( token == null )
    {
      break; // EOS -- End of string
    }

    if ( token.type == VwStringTokenParser.DELIM )
    {
      sbFormatedDate.append( token.val );
      continue;
    }

    switch( token.val )
    {
      /* Day of month */
      case "d":
      case "dd":

        let strDay = date.getDate().toString();
        if ( strDay.length < 2 && token.val == "dd")
        {
          strDay = "0" + strDay ;
        }

        sbFormatedDate.append( strDay );
        break;

      /* Month */
      case "M":
      case "MM":
      case "MMM":
      case "MMMM":

        let strMonth = formatMonth( date.getMonth(), token.val )
        sbFormatedDate.append( strMonth );

        break;

      /* Year */
      case "y":
      case "yy":
      case "yyyy":

        let strYear = date.getFullYear().toString();

        if ( token.val.length < 3 )
        {
          strYear = strYear.substring( 2 );
        }

        sbFormatedDate.append( strYear );
        break;

      /*  Day of  Week */
      case "EEE":
      case "EEEE":

        let strWeekDay;

        let nDay = date.getDay();

        if ( token.val.length > 3 )
        {
          strWeekDay = VwDate.WEEK_DAYS[ nDay ].long;
        }
        else
        {
          strWeekDay = VwDate.WEEK_DAYS[ nDay ].short;

        }

        sbFormatedDate.append( strWeekDay );

        break;

      /* Hour 24 format*/
      case "H":
      case "HH":

        let strHours = date.getHours().toString();

        if ( strHours.length < 2 && token.val == "HH")
        {
          strHours = "0" + strHours;
        }

        sbFormatedDate.append( strHours);
        break;

      /* hour 12 hour format */
      case "h":
      case "hh":

        let nHours = date.getHours().toString();

        if ( nHours > 12 )
        {
          nHours -= 12;

        }
        let strAmPmHours = String( nHours );

        if ( strAmPmHours.length < 2 && token.val == "hh")
        {
          strAmPmHours = "0" + strAmPmHours;
        }

        sbFormatedDate.append( strAmPmHours);
        break;

      /* Minutes */
      case "m":
      case "mm":

        let nMin = date.getMinutes().toString();

        let strMin = String( nMin );

        if ( strMin.length < 2 && token.val == "mm")
        {
          strMin = "0" + strMin;
        }

        sbFormatedDate.append( strMin);
        break;

       /* Seconds */
      case "s":
      case "ss":

        let nSecs = date.getSeconds().toString();

        let strSec = String( nSecs );

        if ( strSec.length < 2 && token.val == "ss")
        {
          strSec = "0" + strSec;
        }

        sbFormatedDate.append( strSec);
        break;

      /* Am Pm lower case of a, upper case for A */
      case "a":
      case "aa":
      case "A":
      case "AA":

        const  nAmPmHours = date.getHours()

        const bIsLowerCase = token.val.startsWith( "a");
        const nFormatLen = token.val.length;

        if ( nAmPmHours < 12 )
        {
          let strAm = "AM".substring( 0, nFormatLen ); // will either AM or A depending on lenght of formatter

          if ( bIsLowerCase )
          {
            strAm = strAm.toLowerCase();
          }

          sbFormatedDate.append( strAm);

        }
        else
        {
          let strPm = "PM".substring( 0, nFormatLen ); // will either PM or P depending on lenght of formatter

          if ( bIsLowerCase )
          {
            strPm = strPm.toLowerCase();
          }

          sbFormatedDate.append( strPm );

        }

        break;

      /* Millisecs */
      case "SSS":

        let strMillisecs = date.getMilliseconds().toString();

        sbFormatedDate.append( strMillisecs );

        break;

    } // end switch()

  } // end while

  return sbFormatedDate.toString();

  /**
   * Format the different month types
   * @param nMonthNbr
   * @param strFormat
   * @returns {*}
   */
  function formatMonth( nMonthNbr, strFormat )
  {
    let strMonth;

    switch( strFormat )
    {
      case "M":
      case "MM":

        ++nMonthNbr;
        if ( nMonthNbr  < 10 && strFormat == "MM")
        {
          strMonth = "0" + nMonthNbr;
        }
        else
        {
          strMonth = String( nMonthNbr );
        }

        break;

      case "MMM":

        strMonth = VwDate.MONTHS[ nMonthNbr ].short;
        break;

      case "MMMM":

        strMonth = VwDate.MONTHS[ nMonthNbr ].long;
        break;

    }

    return strMonth;

  }

} // end format()

VwDate.testValidInstanceDate = ( dateToTest ) =>
{
  if ( !(dateToTest instanceof Date) && !(dateToTest instanceof VwDate) )
  {
    throw `The instance date ${dateToTest} must be a javascript date or a VwDate`;
  }

  if ( !VwDate.isValidDate( dateToTest) )
  {
    throw `The date object ${dateInitializer} is not a valid date`;

  }

}

/**
 * Compares to date objects
 * @param date1 Must be one of VwDate or javasript Date instance
 * @param date2 Must be one of VwDate or javasript Date instance
 *
 * @returns {number} returns 0 id dates are equal, -1 if date1 < date2, or 1 if date1 > date2
 *
 */
VwDate.compare = (date1, date2, bIgnoreTime ) =>
{
  if ( date1 instanceof VwDate )
  {
    date1 = date1.toDate();

  }

  if ( date2 instanceof VwDate )
  {
    date2 = date2.toDate();

  }

  if ( bIgnoreTime )
  {
    date1.setHours(0,0,0,0);
    date2.setHours( 0, 0, 0, 0 );
  }

  const nTime1 = date1.getTime();
  const nTime2 = date2.getTime();

  if ( nTime1 == nTime2 )
  {
    return 0;
  }

  if ( nTime1 < nTime2 )
  {
    return -1;
  }
  else
  {
    return 1;
  }


  function noTimeCompare()
  {
    date1.setHours( 0)
  }
} // end compare

/**
 * Test for valid date
 * @param dateToTest
 * @return {boolean}
 */
VwDate.isValidDate = (dateToTest ) =>
{
  const strDate = (dateToTest.toString());

  return !(strDate.startsWith( "Invalid") );  // string returned willn start with "Invalid" if date is bad
  
} // end VwDate.isValidDate()

VwDate.WEEK_DAYS =
  [
    { dayNbr:0, long:"Sunday", short:"Sun"},
    { dayNbr:1, long:"Monday", short:"Mon"},
    { dayNbr:2, long:"Tuesday", short:"Tue"},
    { dayNbr:3, long:"Wednesday", short:"Wed"},
    { dayNbr:4, long:"Thursday", short:"Thu"},
    { dayNbr:5, long:"Friday", short:"Fri"},
    { dayNbr:6, long:"Saturday", short:"Sat"},

  ];

VwDate.MONTHS =
  [
    { nbr:0, long:"January", short:"Jan"},
    { nbr:1, long:"February", short:"Feb"},
    { nbr:2, long:"March", short:"Mar"},
    { nbr:3, long:"April", short:"Apr"},
    { nbr:4, long:"May", short:"May"},
    { nbr:5, long:"June", short:"Jun"},
    { nbr:6, long:"July", short:"Jul"},
    { nbr:7, long:"August", short:"Aug"},
    { nbr:8, long:"September", short:"Sep"},
    { nbr:9, long:"October", short:"Oct"},
    { nbr:10, long:"November", short:"Nov"},
    { nbr:11, long:"December", short:"Dec"}

  ];

Date.prototype.format = function (mask, utc)
{
  return VwDate.format( this, mask, utc);
};


Date.prototype.compare = function (date )
{
  return VwDate.compare( this, date )
};

Date.prototype.isEqualTo = function (date )
{
  return VwDate.compare( this, date ) == 0;
};

Date.prototype.isGreaterThan = function (date )
{
  return VwDate.compare( this, date ) == 1;
};

Date.prototype.isLessThan = function (date )
{
  return VwDate.compare( this, date ) < 0;
};



export default VwDate;

