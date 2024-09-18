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
 *  ============================================================================================
 * /
 */

import VwBreadCrumbMgrModel from "./VwBreadCrumbMgrModel.js";

VwCssImport( "/vozzworks/ui/VwBreadCrumbMgr/style");

function VwBreadCrumbMgr( strParent, breadCrumbProps  )
{
  const self = this;
  const VW_BREADCRUMB_CONTAINER_ID = strParent + "_vwBreadCrumbContainer";

  let m_breadCrumbProps;
  let m_breadCrumbModel;
  let m_htmlBreadCrumbHtml;
  let m_fnOnCrumbClicked;

  this.getBreadCrumbModel = () => m_breadCrumbModel;
  this.onCrumbClicked = ( fnOnCrumbClicked ) => m_fnOnCrumbClicked = fnOnCrumbClicked ;
  this.getCrumbIdProp = () => m_breadCrumbProps.strLinkIdProp;

  configObject();

  /**
   * Constructor impl
   */
  function configObject()
  {
    congfigDefaultProps();
    render();

    m_breadCrumbModel = new VwBreadCrumbMgrModel( self, m_breadCrumbProps.strLinkIdProp );

    m_breadCrumbModel.onCrumbAdded( handleOnCrumbAdded );
    m_breadCrumbModel.onCrumbRemoved( handleOnCrumbRemoved );

    $(`#${strParent}`).empty();
    $(`#${strParent}`).append( m_htmlBreadCrumbHtml );

    // add in the base crumb
    if ( m_breadCrumbProps.baseCrumb )
    {
      const baseCrumb = {};
      baseCrumb[m_breadCrumbProps.strLinkIdProp] = "base";
      baseCrumb[m_breadCrumbProps.strLinkNameProp] = m_breadCrumbProps.baseCrumb;
      m_breadCrumbModel.addCrumb( baseCrumb );
    }


  }


  /**
   * Render breadcrumb html
   */
  function render()
  {
    m_htmlBreadCrumbHtml = `<div id="${VW_BREADCRUMB_CONTAINER_ID}" class="${m_breadCrumbProps.cssBreadCrumbContainer}"></div>`;

  } // end render()

  /**
   * Actions fro bread crumb mgr
   */
  function setupActions( strCrumbId )
  {
    $( `#${strParent}_${strCrumbId}` ).unbind().click( handleBreadCrumbEntryClicked );
  }


  /**
   * Crumb click handler
   *
   * @param event
   */
  function handleBreadCrumbEntryClicked( event )
  {
    let strCrumbId = event.currentTarget.id;

    // Remove Parent Wrapper
    strCrumbId = strCrumbId.substring( strCrumbId.lastIndexOf( "_") + 1  );

    const crumb = m_breadCrumbModel.getCrumb( strCrumbId );

    if ( m_fnOnCrumbClicked )
    {
      m_fnOnCrumbClicked( crumb );
    }

    return;
  }

  /**
   * Adds a bread crumb entry
   *
   * @param strCrumbId The crumb id which is also the link
   */
  function handleOnCrumbAdded( strCrumbId, crumb )
  {
    let strCrmbIdCanonical = strCrumbId;
    const htmlBreadCrumbEntry = `<div id="${strParent}_${strCrumbId}" class="${m_breadCrumbProps.cssBreadCrumbEntry}">
                                   <span>${crumb[ m_breadCrumbProps.strLinkNameProp ]}</span>
                                   <img src="/${m_breadCrumbProps.strBreadCrumbArrowSrc}" style="display:none"/>
                                 </div>`


    $(`#${VW_BREADCRUMB_CONTAINER_ID}`).append( htmlBreadCrumbEntry );

    if ( m_breadCrumbModel.size() > 1 )
    {
      const prevCrumb = m_breadCrumbModel.getCrumbByIndex( m_breadCrumbModel.size() - 2);

      strCrmbIdCanonical = `${strParent}_${prevCrumb[ m_breadCrumbProps.strLinkIdProp ]}`;

      $( `#${strCrmbIdCanonical} > img`).show();
    }

    setupActions( strCrumbId );

  }

  /**
   * Crumb remove call back
   * @param strCrumbId
   */
  function handleOnCrumbRemoved( strCrumbId, crumb, ndxRemoved )
  {
    const strCrumbEntryId = strParent + "_" + strCrumbId;

    $(`#${strCrumbEntryId}` ).remove();

    const prevCrumb = m_breadCrumbModel.getCrumbByIndex( ndxRemoved - 1);

    const strCrumbIdCanonical = `${strParent}_${prevCrumb[ m_breadCrumbProps.strLinkIdProp ]}`;

    $( `#${strCrumbIdCanonical} > img`).hide();

  } // end handleOnCrumbRemoved()


  /**
   * Configure the default properties
   */
  function congfigDefaultProps()
  {
    m_breadCrumbProps = {};
    m_breadCrumbProps.cssBreadCrumbContainer = "VwBreadCrumbContainer";
    m_breadCrumbProps.cssBreadCrumbEntry = "VwBreadCrumbEntry";
    m_breadCrumbProps.strBreadCrumbArrowSrc = "vozzworks/ui/images/vw_arrow_angle_right_black.png";
    m_breadCrumbProps.strLinkNameProp = "linkName";
    m_breadCrumbProps.strLinkIdProp = "id";

    $.extend( m_breadCrumbProps, breadCrumbProps );

  }
} // end VwBreadCrumbMgr{}

export default VwBreadCrumbMgr;