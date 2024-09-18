/*
 * Created by User: petervosburgh
 * Date: 6/18/24
 * Time: 9:15 AM
 * 
 */

/**
 * This class implements an XPath processor.
 *
 * @param data The data param can operate on two structures - an object graph returned by the VwXmlParser instance or a VwTreeModel
 * @constructor
 */
function VwXPath( data )
{
  this.evaluate = handleEvaluate;

  function handleEvaluate( strPath )
  {
    if ( strPath.startsWith( "//"))
    {
      return getResult( strPath, data );
    }

    const astrPathPieces = strPath.split( "/");

    let result = data;

    if ( Array.isArray( result ))
    {
      return doArrayResult( result, astrPathPieces );
    }
    else
    {

      for ( const strPathPiece of astrPathPieces )
      {
        if ( !strPathPiece )
        {
          continue;
        }

        if ( !result )
        {
          return null;  // path not found
        }

        if ( Array.isArray( result ))
        {
          return doArrayResult( result, strPathPiece );
        }

        result = getResult( strPathPiece, result );
      }

    } // end else()

    return result;

  } // end handleEvaluate()

  /**
   * Returns a result array
   * @param aChildren
   * @param astrPathPieces
   * @return {*[]}
   */
  function doArrayResult( aChildren, strPathPiece )
  {
    const aResult = [];
    for( const ele of aChildren )
    {
      const result = getResult( strPathPiece, ele );
      aResult.push( result );
    }

    return aResult;

  } // end doArrayResult()

  /**
   * Return the result
   * @param strPath
   * @param pathData
   */
  function getResult( strPath, pathData )
  {
    let bFindAnyware = false;

    if ( strPath.startsWith( "//") )
    {
      bFindAnyware = true;
      // strip off any index specifier
      let nPos =  strPath.indexOf( "[");
      if ( nPos < 0 )
      {
        nPos = strPath.length;
      }

      pathData = findObject( strPath.substring( 2, nPos ), pathData );

      strPath = strPath.substring( 2 ); // string off the "//" prefix

      if ( !pathData )
      {
        return null;
      }
    } // end if

    if ( !bFindAnyware && (strPath.startsWith( "/") || strPath == pathData["tagName"] ) )
    {
      return pathData;
    }

    const nIndexPos = strPath.indexOf( "[");

    if ( nIndexPos > 0 )
    {
      const strPathIndex = strPath.substring( nIndexPos );
      strPath = strPath.substring( 0, nIndexPos );

      let aChildren;

      if ( Array.isArray( pathData ))
      {
        aChildren = pathData;
      }
      else
      {
        aChildren = pathData[strPath];
      }

      const ndx = getIndex( strPathIndex );

      if ( typeof ndx == "undefined" )
      {
        return null;
      }

      if ( ndx >= aChildren.length )
      {
        return null; // index out of bounds
      }

      return aChildren[ ndx ];
    }

    if ( bFindAnyware )
    {
      return pathData;
    }

    return pathData[strPath];

  } // end getResult()


  function findObject( strName, path )
  {
    if ( path.tagName && path.tagName == strName )
    {
      return path;
    }

    for( const strPropInPath in path )
    {
      if ( strPropInPath == strName )
      {
        return path[strPropInPath];
      }

      const propVal = path[strPropInPath];

      if ( Array.isArray( propVal ))
      {
        const aChildren = propVal;

        for ( const val of aChildren )
        {
          const result = findObject( strName, val );
          if ( result )
          {
            return result;
          }
        }

        continue;
      }
      else
      if( typeof  propVal == "object" )
      {
        const result =  findObject( strName, propVal );

        if ( result )
        {
          return result;
        }
      }
    }
  } // end findObject()


  /**
   * Gets the index number specified in the [] string
   * @param strPathIndex
   * @return {number|null}
   */
  function getIndex( strPathIndex )
  {
    const nPos = strPathIndex.indexOf( "]");
    if ( nPos < 0 )
    {
      return null; // invalid syntax
    }

    const strIndex = strPathIndex.substring( 1, nPos );

    if ( isNaN( strIndex ))
    {
      return null; // not a valid number
    }

    const ndx = Number( strIndex ) - 1;

    return ndx;

  } // end getIndex()
} // end VwXPath{}

export default VwXPath;
