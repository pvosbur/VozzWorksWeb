/*
 * Created by User: petervosburgh
 * Date: 9/9/24
 * Time: 4:12 PM
 * 
 */
function VwMouseClickMgr( strClickLaunchId, clickHandlerData, fnSigleClickHandler, fnDblClickHandler)
{
  let m_nClickCount;
  let m_bSingleClick

  this.handleClick = handleClick
  this.isSingleClick = () => m_bSingleClick;

  configObject();

  function configObject()
  {
    $(`#${strClickLaunchId}`).click( handleClick);

  } // end configObject()

  /**
   * Click handler
   */
  function handleClick()
  {
    if ( !m_nClickCount )
    {
      m_nClickCount = 0;
    }

    ++m_nClickCount;;

    if ( m_nClickCount == 1 )
    {
      detectClickCount();
    }
  } // end handleClick()


  /**
   * Detect click count with in a 250 miilisec time
   */
  function detectClickCount()
  {
    let initTime;

    requestAnimationFrame( animate );

    /**
     * animation frame handler
     * @param timestamp
     */
    function animate( timestamp )
    {
      if ( !initTime )
      {
        initTime = timestamp;
      }

      if ( (performance.now() - initTime) > 250 )
      {
        m_bSingleClick = m_nClickCount == 1;
        m_nClickCount = null;

        if ( m_bSingleClick )
        {
          if ( fnSigleClickHandler )
          {
            fnSigleClickHandler( strClickLaunchId, clickHandlerData );
          }
        }
        else
        {
          if ( fnDblClickHandler )
          {
            fnDblClickHandler( strClickLaunchId, clickHandlerData );

          }
        }

        return;
      } // end if

      requestAnimationFrame( animate );

    } // end animate()

  } // end detectClickCount()

} // end VwMouseClickMgr()

export default VwMouseClickMgr;
