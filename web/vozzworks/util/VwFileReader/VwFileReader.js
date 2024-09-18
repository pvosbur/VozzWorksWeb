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
 * The reader class is all static functions
 * @constructor
 */
function VwFileReader()
{
}

/**
 * Reads the file as a text string
 *
 * @param file The file object to read
 *
 * @param fnResult The results is a string containg the file text
 */
VwFileReader.readTextFile = async function( file )
{
  return new Promise( readTextFilePromise );

  function readTextFilePromise( success, fail )
  {
    const reader = new FileReader();

    reader.onload = function ( theFile ) {

      success( theFile.target.result );

    };

    reader.readAsText(file);

  } // end readTextFilePromise(

}; // end readTextFile()

/**
 * Reads the file as a data url
 *
 * @param file  The file object to read
 * @param fnResult  A data url
 */
VwFileReader.readAsDataUrl = function( file )
{
  return new Promise( readAsDataUrlPromise );

  function readAsDataUrlPromise( success, fail )
  {
    const reader = new FileReader();
    try
    {
      reader.onload = function ( theFile )
      {
        success( theFile.target.result );
      };

      reader.readAsDataURL( file );

    }
    catch ( Err )
    {
      return null;
    }

  } // end readAsDataUrl()

}; // end readAsDataUrl()


/**
 * Reads the file as an ArrayBuffer
 *
 * @param file file The file object to read
 * @param fnResult the data as an ArrayBuffer
 */
VwFileReader.readAsArrayBuffer = function( file )
{
  return new Promise( readAsArrayBufferPromise );

  function readAsArrayBufferPromise( success, fail )
  {
    const reader = new FileReader();

    reader.onload = function ( theFile )
    {

      success( theFile.target.result );

    };

    reader.readAsArrayBuffer( file );

  } // end readAsArrayBufferPromise()

}; // end readAsArrayBuffer()

export default VwFileReader;


