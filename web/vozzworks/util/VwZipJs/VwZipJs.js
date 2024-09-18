/*
 * Created by User: petervosburgh
 * Date: 4/20/23
 * Time: 4:27 PM
 * 
 */
function VwZipJs()
{
  this.getEntriesFromFile = getEntriesFromFile;
  this.getEntriesFromUrl = getEntriesFromUrl;
  this.downLoadEntry = downloadEntry;


  async function getEntriesFromFile( fileZip, options )
  {
   return await (new zip.ZipReader( new zip.BlobReader( fileZip ) )).getEntries( options );

  } // end getEntriesFromFile()

  async function getEntriesFromUrl( strUrl )
  {

  } // end getEntriesFromFile()

  async function downloadEntry( entry )
  {

  } // end getEntriesFromFile()

} // end VwZipJs{}

export default VwZipJs;
