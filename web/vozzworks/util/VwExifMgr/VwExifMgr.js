/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   3/22/18

 Time Generated:   6:03 AM

 ============================================================================================
 */

import VwHashMap from "/vozzworks/util/VwHashMap/VwHashMap.js";

/**
 * This class uses the javascript utility exif-js found on GitHub  https://github.com/exif-js/exif-js
 * This object builds a map of exif files found in jpeg and tiff images and the tags can be retrieved using
 * the tag names as specified in  JEITA CP-3451 specifiecation
 *
 * @param file The file object to be inspected -- Must be a jpeg or tiff file
 * @constructor
 */
function VwExifMgr( file, fnComplete )
{

  const m_mapExifTags = new VwHashMap();
  this.isValid = isValid;

  this.getTag = getTag;

  this.tags = tags;

  processFile( file );

  /**
   * returns true if the file contained exif data
   * @returns {boolean}
   */
  function isValid()
  {
    return m_mapExifTags.size() > 0;

  }

  /**
   * Gets the value of an exif tag
   *
   * @param strExifTagName The name of the exif tag to retrieve
   * @returns {*}
   */
  function getTag( strExifTagName )
  {
    return m_mapExifTags.get( strExifTagName );
  }


  function tags()
  {
    return m_mapExifTags.keys();

  }
  /**
   * Process the jpeg/tiff file and if valid put the exif tags in a map
   * @param file
   */
  function processFile( file )
  {
    if ( file && file.name )
    {
      EXIF.getData( file, function ()
      {
        var exifData = EXIF.pretty( this );

        if ( exifData )
        {

          const aExifData = exifData.split( "\r\n" );
          for ( let strExifTag of aExifData )
          {
            if ( !strExifTag )
            {
              continue;
            }

            let nPos = strExifTag.indexOf( ":");

            m_mapExifTags.put( strExifTag.substring( 0, nPos ).trim(), strExifTag.substring( ++nPos ).trim() );
          }

        }

        fnComplete();

      });

    }
    else
    {
      fnComplete();

    }

  }

} // end  VwExifMgr{}

export default VwExifMgr;