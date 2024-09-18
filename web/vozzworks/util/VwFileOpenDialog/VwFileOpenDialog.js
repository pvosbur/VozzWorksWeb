/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   6/30/18

 Time Generated:   8:21 AM

 ============================================================================================
 */

function VwFileOpenDialog()
{
}

/**
 * Displays the file selection dialog
 * @param fMultiple true if multiple files are allowed
 * @param fnResult A file or a list of file objects
 */
VwFileOpenDialog.showOpenFileDialog = function showFileOpenDialog( fMultiple, strFilter,  fnResult )
{

  var strFileInput = "<input id='vwFileInput' type='file' style='display:none'" ;

  if ( fMultiple )
  {
    strFileInput += " multiple";

  }


  if ( strFilter )
  {
    strFileInput += " accept='" + strFilter + "'"
  }

  strFileInput += ">";

  var strInput = $("#vwFileInput")[0];

  if ( strInput)
  {
    $("#vwFileInput" ).remove();

  }

  $("body" ).append( strFileInput );

  $("#vwFileInput" ).off( "change", handleFilesSelected );

  $("#vwFileInput" ).on( "change", handleFilesSelected );

  $('input[type="file"]').click();

  function handleFilesSelected( event )
  {
    $("#vwFileInput" ).off( "change", handleFilesSelected );

    if ( fMultiple )
    {
      fnResult( event.currentTarget.files )

    }
    else
    {
      fnResult( event.currentTarget.files[0] );
    }

  }

};  // end showOpenFileDialog{}


/**
 * Gets a single file from the file open dialog
 * @param strFilter
 * @param fnResult
 */
VwFileOpenDialog.getFile = function( strFilter, fnResult )
{
  VwFileOpenDialog.showOpenFileDialog( false, strFilter, (result ) =>
  {
     fnResult( result );

  });

}; // end  VwFileOpenDialog.render()

/**
 * Gets a multiple file from the file open dialog
 * @param strFilter
 * @param fnResult
 */
VwFileOpenDialog.getFiles = function( strFilter, fnResult )
{
  VwFileOpenDialog.showOpenFileDialog( true, strFilter, (result ) =>
  {
     fnResult( result );

  });

}; // end VwFileOpenDialog.getFiles()

export default VwFileOpenDialog;