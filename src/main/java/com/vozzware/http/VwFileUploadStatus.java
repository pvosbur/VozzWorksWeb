package com.vozzware.http;

import java.io.File;

/*
============================================================================================

    Source File Name: 

    Author:           petervosburgh
    
    Date Generated:   4/15/16

    Time Generated:   6:26 AM

============================================================================================
*/
public interface VwFileUploadStatus
{

  String complete( String strId, File fileUploaded );
  void aborted( String strId, File fileUploaded );
  void error( String strId, File fileUploaded, String strError );
}
