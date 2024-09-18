/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   4/10/18

 Time Generated:   8:09 AM

 ============================================================================================
 */

/**
 * This class is a googlr maps address parser that allows getting an address as a full street address by lat,lng or 
 * get the address by its component using one of the address static constants 
 * @param lat The initial latitude
 * @param lng The initial longitue
 * @param fnReady Ready callback which passes a boolean flag indication the success of the lat,lng and if successful the instance og this object
 * @constructor
 */
function VwGoogleMapsParser( lat, lng, fnReady )
{
  const self = this;

  let m_SearchResult;

  this.getFullAddress = getFullAddress;
  this.getStreetNbr = getStreetNbr;
  this.getStreetName = getStreetName;
  this.getStreet = getStreetFull;
  this.getStreetFull = getStreetFull;
  this.getCity = getCity;
  this.getState = getState;
  this.getStateCode = getStateCode;
  this.getProvince = getState;
  this.getProvinceCode = getStateCode;
  this.getPostalCode = getPostalCode;
  this.getCountry = getCountry;
  this.getCountryCode = getCountryCode;
  this.getAddressComponent = getAddressComponent;

  configObject();

  /**
   * Retrieve the address array for the initial lat,lng specified in the constructor
   */
  function configObject()
  {

    const geoCoder = new google.maps.Geocoder();

    const latLng = {
      lat: lat,
      lng: lng
    };

    geoCoder.geocode( {location: latLng}, ( aResults, status ) =>
    {
      // Check status and do whatever you want with what you get back
      // in the results_array variable if it is OK.

      if ( status != "OK" )
      {
        fnReady( false, null );
        return;

      }

      m_SearchResult = aResults;

      fnReady( true, self );

    } );

  } // end configObject()

  /**
   * Gets the formatted street address for this lat,lng if one exists
   * @returns {*}
   */
  function getFullAddress()
  {
    for ( let x = 0, nLen = m_SearchResult.length; x < nLen; x++ )
    {
      const aTypes = m_SearchResult[x].types;

      for ( const strType of aTypes )
      {
        if ( strType == "street_address" )
        {
          return m_SearchResult[x].formatted_address;
        }
      }
    }

    return null; // No street address found for this lat,lng
  }

  /**
   * Returns just the street nbr of the full address
   * @returns {*}
   */
  function getStreetNbr()
  {
    return getAddressComponent( VwGoogleMapsParser.STREET_NBR );
  }

  /**
   * Returns just the street name of the full address
   * @returns {*}
   */
  function getStreetName()
  {
    return getAddressComponent( VwGoogleMapsParser.STREET_NAME );
  }

  /**
   * Returns the street number and street name
   */
  function getStreetFull()
  {
    return getAddressComponent( VwGoogleMapsParser.STREET_NBR ) + " " + getAddressComponent( VwGoogleMapsParser.STREET_NAME );

  }

  function getCity()
  {
    // Depending on the location city could be a locality or a neighborhood
    let strCity =  getAddressComponent( VwGoogleMapsParser.LOCALITY );

    if ( !strCity )
    {
      strCity = getAddressComponent( VwGoogleMapsParser.NEIGHBORHOOD );
    }

    return strCity;
  }

  function getCountry()
  {
    return getAddressComponent( VwGoogleMapsParser.COUNTRY );
  }

  function getCountryCode()
  {
    return getAddressComponent( VwGoogleMapsParser.COUNTRY, true );
  }

  function getState()
  {
    return getAddressComponent( VwGoogleMapsParser.STATE );

  }

  function getStateCode()
  {
     return getAddressComponent( VwGoogleMapsParser.STATE, true );
  }

  function getPostalCode()
  {
     return getAddressComponent( VwGoogleMapsParser.POSTAL_CODE );
  }

  /**
   * Returns  The array of address components
   * @returns {*}
   */
  function getAdddressComponents()
  {
    for ( let x = 0, nLen = m_SearchResult.length; x < nLen; x++ )
    {
      const aTypes = m_SearchResult[x].types;

      for ( const strType of aTypes )
      {
        if ( strType == "street_address" )
        {
          return m_SearchResult[x].address_components;
        }
      }
    }

    return null;

  }

  /**
   * Returns a single component of an address like a Country Name, Country Code, Postal code etc...
   *
   * @param strCompId One of the static VwGoogleMapsParser component types
   */
  function getAddressComponent( strCompId, fShortName )
  {
    const aAddressPieces = getAdddressComponents();

    if ( !aAddressPieces )
    {
      return null;
    }

    for ( let x = 0, nLen = aAddressPieces.length; x < nLen; x++ )
    {
      const aTypes = aAddressPieces[x].types;

      for ( const strType of aTypes )
      {
        if ( strType == strCompId )
        {
          if ( fShortName )
          {
            return aAddressPieces[x].short_name;
          }
          else
          {
            return aAddressPieces[x].long_name;

          }
        }
      }
    }

    return null; // no address componentfound for this lat,lng

  }

} // end VwGoogleMapsParser{}

export default VwGoogleMapsParser;

// static address component constants

VwGoogleMapsParser.STREET_ADDRESS = "street_address";
VwGoogleMapsParser.STREET_NBR = "street_number";
VwGoogleMapsParser.STREET_NAME = "route";
VwGoogleMapsParser.LOCALITY = "locality";
VwGoogleMapsParser.STATE = "administrative_area_level_1";
VwGoogleMapsParser.COUNTRY = "country";
VwGoogleMapsParser.POSTAL_CODE = "postal_code";
VwGoogleMapsParser.NEIGHBORHOOD = "neighborhood";
