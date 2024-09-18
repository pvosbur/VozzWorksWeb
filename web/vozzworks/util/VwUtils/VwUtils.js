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

import VwHashMap from "/vozzworks/util/VwHashMap/VwHashMap.js";

function VwUtils()
{

  this.newArrayIterator = (aArrayToIterate ) =>
  {
    return new VwArrayIterator(aArrayToIterate );
  }

  /**
   * This class provides an array iterator
   *
   * @param aArrayToIterate The array to iterate
   * @constructor
   */
  function VwArrayIterator( aArrayToIterate )
  {

    let m_nCurNdx = 0;

    const m_aArrayToIterate = aArrayToIterate;

    // PUBLICS

    this.next = next;
    this.hasNext = hasNext;
    this.rewind = rewind;


    // PRIVATE Methods

    /**
     * Puts the iterator to start of array
     * @returns {number}
     */
    function rewind()
    {
      return m_nCurNdx = 0;
    }


    /**
     * Returns true if there are more items to iterate
     *
     * @returns {boolean}
     */
    function hasNext()
    {
      return m_nCurNdx < m_aArrayToIterate.length;
    }

    /**
     * Returns the next element in the array or null if the index is at the end
     * @returns {*}
     */
    function next()
    {
      if ( m_nCurNdx >= m_aArrayToIterate.length )
      {
        return null;

      }

      return m_aArrayToIterate[ m_nCurNdx++ ];

    }
  }

}

/**
 * Iterates through an array objects and waits for the fnNext callback to be invoked before getting the next element.
 * This is usefull if objects being iterated on use async calls to operate on data.
 * The iteration handler function takes the form function( index, object, fnNext ). The fnNext Must be called in order
 * to get the next element.
 *
 * @param aObjsToIterate The array ofobjects to iterate over
 * @param fnIterateHandler The function callback iterate handler
 */
VwUtils.forEach = ( aObjsToIterate, fnIterateHandler, fnComplete ) =>
{
  let ndx = 0;

  iterateNext( ndx );

  function iterateNext( ndx )
  {
    if ( ndx >= aObjsToIterate.length )
    {
      if ( fnComplete )
      {
        fnComplete();
      }

      return;
    }

    fnIterateHandler( ndx, aObjsToIterate[ ndx ], () =>
    {
      iterateNext( ++ndx );
    });

  }
}


/*
Object.prototype.equals = function( obj2 )
{
  return VwObjectCompare( this, obj2 );
}
*/
VwUtils.b64Encode = ( objToEncode ) =>
{
  const strJSON = JSON.stringify( objToEncode );

  const strB64Encoded = "VwB64:" + $.base64Encode( strJSON );

  return strB64Encoded;

}


VwUtils.b64Decode = ( strB4Encoded ) =>
{

  if ( !VwExString.startsWith( strB4Encoded, "VwB64:"))
  {
    throw "Invalid Encoded format. does not contain prefix VwB64:";
  }

  // Strip off prefix

  const strB64Decoded = $.base64Decode( strB4Encoded.substring( "VwB64:".length ) );

  return JSON.parse( strB64Decoded );

}

/**
 * This method walks the object graph to return the property
 * @param object The base parent object in the graph
 *
 * @param strPropertyPath The property path (dot notated) i.e. myMeta.title This assumes myMeta is an object inside object
 * and has a property title.
 *
 * @returns The property value or null if the property or the property's parent object is null
 */
VwUtils.getObjProperty = ( object, strPropertyPath ) =>
{

  const astrPropPaths = strPropertyPath.split( "." );

  if ( astrPropPaths.length == 1  )
  {
    if ( typeof object == "string" || typeof object == "number")
    {
      return object;
    }

    if ( typeof object[ strPropertyPath ] == "function" )
    {
      return object[ strPropertyPath ]();
    }

    return object[ strPropertyPath ];

  } // end if

  let objParent = object;

  // Walk the parentage to get to the property's parent in the object graph
  for ( let x = 0, nLen = astrPropPaths.length - 1; x < nLen; x++ )
  {
    if ( typeof objParent[ astrPropPaths[ x ] ] == "function" )
    {
      objParent = objParent[ astrPropPaths[ x ] ]();
    }
    else
    {
      objParent = objParent[ astrPropPaths[ x ] ];


    }

    if ( !objParent )
    {
       return null;  // Child object was not defined, so get out
    }

  }

  // The last index represents the property to get

  if ( typeof objParent[ astrPropPaths[astrPropPaths.length - 1] ] == "function" )
  {
    objParent[ astrPropPaths[astrPropPaths.length - 1] ]();
  }
  else
  {
    return objParent[ astrPropPaths[astrPropPaths.length - 1] ];
  }


} // end getObjProperty{}

/**
 * Generate a randon number between min and max
 *
 * @param nMin The min value
 * @param nMax The max value
 * @returns {*}
 */
VwUtils.getRandomInt = ( nMin,  nMax) =>
{
  return Math.floor(Math.random() * (nMax - nMin + 1)) + nMin;
}

/**
 * Perform a deep copy on an object
 *
 * @param objToClone The object to clone
 */
VwUtils.clone = ( objToClone ) =>
{
  var objCloned = {};

  for ( let strProp in objToClone )
  {
    var objPropVal = objToClone[ strProp ];

    if ( typeof objPropVal == "object" )
    {
      objCloned[ strProp ] = new Object();
      clone( objCloned[ strProp ] );
    }
    else
    {
      objCloned[ strProp ] = objPropVal;
    }
  }
}


VwUtils.vwObjectCompare = ( obj1, obj2 ) =>
{

  if ( obj1 === obj2 )
  {
    return true;
  }

  for ( let strProp in obj1 )
  {
    if ( !obj1.hasOwnProperty( strProp ) )
    {
      continue;
    }

    const propValO1 = obj1[ strProp ];
    const propValO2 = obj2[ strProp ];

    const strType1 = typeof propValO1;
    const strType2 = typeof propValO2;

    // Make sure data types are the save
    if ( strType1 != strType2 )
    {
       return false;

    }

    if ( Array.isArray( propValO1 ) )
    {
      let fArraysEqual =  VwArrayCompare(propValO1, propValO2 );

      if ( !fArraysEqual )
      {
        return false;
      }
    }
    else
    if( strType1 == "object")
    {
      const fResult = VwObjectCompare( propValO1, propValO2 );
      if ( ! fResult )
      {
        return false;
      }
    }
    else
    if ( !(propValO1 === propValO2) )
    {
      return false;
    }

  }

  return true;

}

VwUtils.vwArrayCompare = ( a1, a2 ) =>
{
  if ( a1.length != a2.length )
  {
    return false;
  }

  for ( let x = 0, nLen = a1.length; x < nLen; x++ )
  {
    const val1 = a1[ x ];
    const val2 = a2[ x ];
    
    if ( ! VwObjectCompare( val1, val2 ) )
    {
      return false;
    }

  }


  return true;

}


/**
 * Copy array to a new array instance
 * @param aSrcArray The source array
 *
 * @returns {Array}
 * @constructor
 */
VwUtils.vwArrayCopy = ( aSrcArray ) =>
{
  var aCopiedArray = [];

  for ( var x = 0, nLen = aSrcArray.length; x < nLen; x++ )
  {
    aCopiedArray.push( aSrcArray[ x ] );
  }

  return aCopiedArray;

}


VwUtils.getUrlParams = () =>
{
  const browserUrl = window.location.href;

  const nPos = browserUrl.indexOf( "?");

  if ( nPos < 0 )
  {
    return null;
  }

  const strParams = browserUrl.substring( nPos + 1 );

  const astrParams = strParams.split( "&");

  const mapParams = new VwHashMap();

  for ( let param of astrParams )
  {
    const astrNameVal = param.split( "=" )
    mapParams.put( astrNameVal[0], astrNameVal[1]);
  }

  return mapParams;

}


export default VwUtils;
