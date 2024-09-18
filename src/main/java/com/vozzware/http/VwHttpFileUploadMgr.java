package com.vozzware.http;

import com.vozzware.util.VwFileUtil;
 import com.vozzware.util.VwLogger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;



/*
============================================================================================

    Source File Name: 

    Author:           petervosburgh
    
    Date Generated:   4/15/16

    Time Generated:   5:45 AM

============================================================================================
*/

/**
 * This class manages a http file upload where the client breaks up a file into multiple chunks and sends
 * <br/>each chunk in a different http request. Each chunk is written with .part[nCunkNbr] file extenseion.
 * This class works in conjunction with the VwFileUploadMgr in the vozzworks/util/js/vw_file_upload_mgr.js folder.
 * If other client managers are used the following paramters must be specified in the url
 * cn = the chunck number being sent
 * tchunks = total number of chunks to expect
 * fname = the name file the file being sent
 *
 *
 */
public class VwHttpFileUploadMgr
{
  private static Map<String,VwHttpFileUploadMgr> s_mapFileUploadMgrs = Collections.synchronizedMap( new HashMap<String, VwHttpFileUploadMgr>(  ));

  private String m_strId;

  private File m_fileDestination;
  private File m_fileDesPath;
  private VwLogger m_logger;

  private boolean  m_fAborted = false;

  private boolean  m_fSentCompleteStatus = false;

  private VwFileUploadStatus m_uploadStatus;

  private int m_nTotalChunks = 0;

  private String m_strDestinationFolder;
  private String m_strFileName;

  private List<Future<Integer>> m_listResults = new ArrayList<>(  );

  private Map<Integer,VwHttpChunkDesc> m_mapFileChunks = Collections.synchronizedMap( new HashMap<Integer, VwHttpChunkDesc>(  ) );

  private static Object s_objSemi = new Object();

  class VwHttpChunkDesc
  {

    InputStream m_ins;
    File m_fileChunk;
    long m_lCunkLen;
    boolean m_fAbortStream = false;
    boolean m_fAborted = false;

    VwHttpChunkDesc( InputStream ins, long lChunkLen )
    {
      m_ins = ins;
      m_lCunkLen = lChunkLen;
    }

  }
  /**
   * Constructor
   *
   * @param strId an indentifier to associate with the file upload process
   * @param fileDestination The destination file on completion of all the file parts
   * @param uploadStatus Upload status object
   * @param logger A VwLogger instance if logging is desired
   */
  public VwHttpFileUploadMgr( HttpServletRequest request, String strId, File fileDestination, VwLogger logger, VwFileUploadStatus uploadStatus  )  throws Exception
  {
    m_strId = strId;

    System.out.printf( "in constructor" );
    m_fileDestination = fileDestination;

    m_uploadStatus = uploadStatus;

    m_logger = logger;

    m_nTotalChunks = Integer.valueOf( request.getParameter( "vwtchunks" ) );

    String strDestinationFolder = fileDestination.getAbsolutePath();

    int nPos = strDestinationFolder.lastIndexOf( '/' );

    m_strFileName = strDestinationFolder.substring( ++nPos );
    m_strDestinationFolder = strDestinationFolder.substring( 0, nPos );
    m_fileDesPath = new File( m_strDestinationFolder );

    if ( m_logger != null &&  m_logger.isDebugEnabled() )
    {
      m_logger.debug(  getClass(), "Got new Upload request for file: " + m_strFileName + ", Total Chunks expected: " + m_nTotalChunks );
    }

    m_fAborted = false;

    File fileDestinationFolder = new File( m_strDestinationFolder );

    if ( !fileDestinationFolder.exists() )
    {
      fileDestinationFolder.mkdirs();
    }

    s_mapFileUploadMgrs.put( strId, this );

    return;
  }

  /**
   * Returns the VwHttpFileUploadMgr instance for the strId or null if instance does not exist
   *
   * @param strId The id supplied in the constructor
   * @return
   */
  public static VwHttpFileUploadMgr getUploadManagerForId( String strId )
  {
    return s_mapFileUploadMgrs.get( strId );

  }


  /**
   * Marks the uploadn as complete.
   *
   * @param strUploadId The upload id created at start of upload time by user
   */
  public static void uploadComplete( String strUploadId )
  {
    s_mapFileUploadMgrs.remove( strUploadId );

  }
  /**
   * Adds a HTTP stream that represents a file chunk
   *
   * @param req  The servlet request object
   * @param resp the servlet response object
   *
   * @throws Exception
   */
  public String addChunk( HttpServletRequest req, HttpServletResponse resp, Map<String,String> mapParams  )  throws Exception
  {

    if ( m_fAborted )
    {
       return "VwAborted";

    }

    String strAbort = req.getParameter( "vwAbort" );

    if ( strAbort != null )
    {

      doFileAbort();

      return "VwAborted";

    }

    long lChunkLen = 0;
    int nChunkNbr = 0;
    InputStream ins = null;

    String strChunkLength = req.getParameter( "vwclen" );

    lChunkLen = Long.valueOf( strChunkLength );

    String strChunkNbr = null;

    if ( mapParams != null )
    {
      strChunkNbr = mapParams.get( "vwcn" );
    }
    else
    {
      strChunkNbr = req.getParameter( "vwcn" );

    }

    if ( m_logger != null &&  m_logger.isDebugEnabled() && m_logger.getDebugVerboseLevel() >= 3)
    {
      m_logger.debug(  getClass(),  "IN AddChunk For Chunk NBR: " + strChunkNbr );
    }

    nChunkNbr = Integer.parseInt( strChunkNbr );

    VwHttpChunkDesc cDesc = new VwHttpChunkDesc( null, lChunkLen );
    m_mapFileChunks.put( nChunkNbr, cDesc );

    ins = req.getInputStream();

    if ( m_logger != null && m_logger.isDebugEnabled() && m_logger.getDebugVerboseLevel() >= 3 )
    {
      m_logger.debug( getClass(), "Writing Chunk Nbr: " + nChunkNbr + " length: " + lChunkLen );
    }

    if ( !writeFileChunk( ins, nChunkNbr, lChunkLen ) )
    {
      if ( m_fAborted )
      {
        return "VwAborted";

      }

      if ( m_logger != null )
      {
        m_logger.error( getClass(), "Chunk Write Failure for id: " + m_strId + " chunk nbr: " + nChunkNbr + " Rewturning VwRetry, for file: " + m_fileDestination.getName(), null  );
      }

      return "VwRetry:" + nChunkNbr;
    }

    ins.close();
    
    if ( m_logger != null &&  m_logger.isDebugEnabled() &&  m_logger.getDebugVerboseLevel() >= 3)
    {
      m_logger.debug( getClass(), "COMPLETED WRITING CHUNK NBR: " + nChunkNbr );
    }

    // Wait for the the file chunks to be written

    if ( areAllChunksComplete() )
    {
      if ( m_fSentCompleteStatus )
      {
        return "VwAllChunksComplete";
      }

      if ( m_fAborted )
      {
        return "VwAborted";
      }
      
      m_fSentCompleteStatus = true;
      // All Chunks are now complete

      synchronized ( s_objSemi )
      {

        List<File> listFilestoConcat = new ArrayList<>();

        // Get file parts in right order to concat
        for ( int x = 1; x <= m_nTotalChunks; x++ )
        {
          VwHttpChunkDesc cdes = m_mapFileChunks.get( x );
          listFilestoConcat.add( cdes.m_fileChunk );
        }

        VwFileUtil.concat( m_fileDestination, listFilestoConcat, true );

        String strCompleteStatus = m_uploadStatus.complete( m_strId, m_fileDestination );

        if ( strCompleteStatus != null )
        {
          return strCompleteStatus;

        }

      }
      return "VwComplete";
    }
    else
    {
      if ( m_logger != null &&  m_logger.isDebugEnabled() &&  m_logger.getDebugVerboseLevel() >= 3)
      {
        m_logger.debug( getClass(), "RETURNING VwOk For Chunk Nbr: " + nChunkNbr );
      }

      return "VwOk:" + nChunkNbr;
    }

  }

  /**
   * Tests to see if all chunks have ben written
   * @return
   */
  private boolean areAllChunksComplete()
  {
    if ( m_logger != null &&  m_logger.isDebugEnabled() &&  m_logger.getDebugVerboseLevel() >= 3)
     {
       m_logger.debug( getClass(), "ENTERING arAllChunksComplete" );
     }

    synchronized ( s_objSemi )
    {
      if ( m_mapFileChunks.size() != m_nTotalChunks )
      {
        return false;

      }

      for ( VwHttpChunkDesc cdesc : m_mapFileChunks.values() )
      {
        if ( cdesc.m_fileChunk == null )
        {
          return false;  // Hasn't been initialized yet

        }

        if ( cdesc.m_fileChunk.exists() )
        {
          if ( cdesc.m_fileChunk.length() != cdesc.m_lCunkLen )
          {
            return false;

          }

        }
        else
        {
          return false;
        }

      } // end for

      return true;

    } // end sybchronized

  }  // end areAllChunksComplete()

  /**
   * Close streams and do abort file cleanup
   */
  private void doFileAbort()
  {

    if ( m_logger != null &&  m_logger.isDebugEnabled() )
    {
      m_logger.debug( getClass(), "Got Abort Request for id: " + m_strId + " file: " + m_fileDestination.getName() );
    }

    m_fAborted = true;

    s_mapFileUploadMgrs.remove( m_strId );

    synchronized ( s_objSemi )
    {
      try
      {
        for ( VwHttpChunkDesc cdesc : m_mapFileChunks.values() )
        {
          if ( cdesc.m_fileChunk != null && cdesc.m_fileChunk.exists() )
          {
            cdesc.m_fileChunk.delete();
          }
        }

        m_uploadStatus.aborted( m_strId, m_fileDestination );

      }
      catch ( Exception ex )
      {
        if ( m_logger != null )
        {
          m_logger.error( getClass(), "Error Closing stream ", ex );
        }
      }

    }
  }


  /**
   * Writes out a file chunk
   *
   * @param ins Servlet input stream
   *
   * @param nChunkNbr  The chunk number
   * @param lChunkLen The chunk length
   *
   * @return true if write was successfull, false otherwise
   */
  private boolean writeFileChunk( InputStream ins, int nChunkNbr, long lChunkLen )
  {
    File fileChunk = null;

    if ( m_fAborted )
    {
      return false;

    }

    try

    {
      fileChunk = new File( m_strDestinationFolder + m_strFileName + "_" + nChunkNbr + ".part"  );

      VwHttpChunkDesc cdes = m_mapFileChunks.get( nChunkNbr );
      cdes.m_fileChunk = fileChunk;

      VwFileUtil.writeFile( fileChunk, ins );

      // This can happen on an error or if user cancels the upload mid stream
      if ( fileChunk.length() != lChunkLen )
      {
        return false;
      }

    }
    catch( Exception ex )
    {
      // Ignore if this was due to cloing a stream on an abort request
      if ( m_fAborted )
      {
        return false;

      }

      if ( m_logger != null  )
      {
        m_logger.error( getClass(), "Got Exception in writing file chunk for id: " + m_strId + ", chunk  nbr: " + lChunkLen, ex );
      }

      /* First check to see if the chunk was written. On bad internet connections a client socket can get interrupted causing
         a stream exception. If the file size matches the content length, then we can ignore the exception.
      */

      if ( fileChunk.length() == lChunkLen ) // File part did get written in full so we're god
      {
        return true;
      }

      return false;  // Chunk write failed
    }

    return true;     // Cunk write successful
  }


} // end class VwHttpFileUploadMgr{}
