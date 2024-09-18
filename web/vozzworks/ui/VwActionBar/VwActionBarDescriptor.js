/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   8/21/20

 Time Generated:   8:23 AM

 ============================================================================================
 */

import {VwClass} from "/vozzworks/util/VwReflection/VwReflection.js";
import VwPromiseMgr from "/vozzworks/util/VwPromiseMgr/VwPromiseMgr.js";


/**
 * Class to define an item in the action bar
 * @param vwActionBarBar
 * @param objProperties values are:
 *    id: String,Required - The id of the action item
 *    text:String,Optional (if no img is used)- The action bar item text
 *    textO:String,Optional Orientation of text to icon - values are "top or "bot" default is "top"
 *    img: String,Optional (if no text is used) - The source of the icon image
 *    cssItem:String,Optional specifies a class that's applied to the parent action item
 *    css:Img:String Optional specifies a class applied to the image
 *    cssHoverImg:String Optional specifies a class applied when an image is hovered
 *
 *    clickHandlerClass:String, Optional - Specifies a top level function name of the object instance to be created when the action item is clicked
 *    fnActionBarHandlerParams: Array, Optional - if defined, the properties to be passed to the handler constructor
 *    widgetHandlerClass:String, Optional - Specifies a top level function name of a widget that will put custom content on the action bar.<br/>
 *    The widget handler must define a constructor that takes 3 parameters: 1. a string that is the parent element of the widgets ui content, <br/>
 *    2. the instance of the VwActionBar the widget belongs to and 3 the VwActionBarDescriptor that represents the widget definition.<br/>
 *    The widget should also define a public method setSelected( fSelected) if it cares when the content is clicked on and it<br/>
 *    should define a public method hover( fIn ) it it cares about hover events.
 * @constructor
 */
function VwActionBarDescriptor( vwActionBarBar, objProperties )
{
  const self = this;

  let  m_actionBar;

  let  m_handleInstance;
  let  m_constructor;
  let  m_promiseMgr ;

  this.invoke = createActionBarHandler;
  this.close = close;
  this.clearInstance = clearInstance;
  this.toggleOpenClose = toggleOpenClose;

  async function configObject()
  {
    if ( objProperties.launchOnInit )
    {
      await createActionBarHandler();
    }

    m_promiseMgr.success( self );
  }

  /**
   * Invokes the action associated with the action bar item
   */
  async function createActionBarHandler()
  {
    if ( m_handleInstance && objProperties.persistInstance )
    {
      if ( m_handleInstance.displayNav )
      {
        m_handleInstance.displayNav();
      }

      return;
    }

    if ( !objProperties.clickHandlerClass && !objProperties.clickHandlerModule && !objProperties.launchOnInit )
    {
      return;

    }

    let actionClass  ;

    if (  objProperties.clickHandlerModule )
    {
      actionClass = await VwClass.forModule( objProperties.clickHandlerModule );

    }
    else
    {
      actionClass = VwClass.forName( objProperties.clickHandlerClass );
    }

    m_constructor = actionClass.getConstructor();

    m_handleInstance = m_constructor.newInstance( objProperties.aConstructorParams );

  }

  /**
   * Close current open handler if active
   */
  function close()
  {
    if (objProperties.toggleOpenClose && m_handleInstance && m_handleInstance.close )
    {
      m_handleInstance.close();
      vwActionBarBar.deSelectCurrentSelection();

      if ( !objProperties.persistInstance )
      {
        m_handleInstance = null;
      }
    }

  }

  /**
   * Clears/sets the current handler instance to null
   */
  function clearInstance()
  {
    m_handleInstance = null;

  }

  /**
   * Returns the state of the toggleOpenClose property
   * @returns {*|boolean}
   */
  function toggleOpenClose()
  {
    return objProperties.toggleOpenClose;

  }
  // Defines the getter and setter properties

  Object.defineProperty( this, "actionBar", {
    set: function ( actionBar )
    {
      m_actionBar = actionBar;
    },
    get: function ()
    {
      return m_actionBar;
    }
  } );


  Object.defineProperty( this, "handlerInstance", {
    set: function ( handlerInstance )
    {
      m_handleInstance = handlerInstance;
    },
    get: function ()
    {
      return m_handleInstance;
    }
  } );

  Object.defineProperty( this, "id", {
    set: function ( strId )
    {
      objProperties.id = strId;
    },
    get: function ()
    {
      return objProperties.id;
    }
  } );

  Object.defineProperty( this, "showOnInit", {
    set: function ( fShow )
    {
      objProperties.showOnInit = fShow;
    },
    get: function ()
    {
      return objProperties.showOnInit;
    }
  } );

  Object.defineProperty( this, "visibility", {
    set: function ( strState)
    {
      objProperties.visibility = strState;
    },
    get: function ()
    {
      return objProperties.visibility;
    }
  } );

  Object.defineProperty( this, "text", {
    set: function ( strText )
    {
      objProperties.text = strText;
    },
    get: function ()
    {
      return objProperties.text;
    }
  } );

  Object.defineProperty( this, "htmlTemplate", {
    set: function ( strHtmlTemplate )
    {
      objProperties.htmlTemplate = strHtmlTemplate;
    },
    get: function ()
    {
      return objProperties.htmlTemplate;
    }
  } );

  Object.defineProperty( this, "fnRenderer", {
    set: function ( fnRenderer )
    {
      objProperties.fnRenderer = fnRenderer;
    },
    get: function ()
    {
      return objProperties.fnRenderer;
    }
  } );

  Object.defineProperty( this, "tooltip", {
    set: function ( strToolTip )
    {
      objProperties.tooltip = strToolTip;
    },
    get: function ()
    {
      return objProperties.tooltip;
    }
  } );

  Object.defineProperty( this, "cssText", {
    set: function ( strCssText )
    {
      objProperties.cssText = strCssText;
    },
    get: function ()
    {
      return objProperties.cssText;
    }
  } );

  Object.defineProperty( this, "textO", {
    set: function ( strTextorientation )
    {
      objProperties.textO = strTextorientation;
    },
    get: function ()
    {
      return objProperties.textO;
    }
  } );

  Object.defineProperty( this, "imgTitle", {
    set: function ( strImgTitle )
    {
      objProperties.imgTitle = strImgTitle;
    },
    get: function ()
    {
      return objProperties.imgTitle;
    }
  } );


  Object.defineProperty( this, "img", {
    set: function ( strImg )
    {
      objProperties.img = strImg;
    },
    get: function ()
    {
      return objProperties.img;
    }
  } );

  Object.defineProperty( this, "css", {
     set: function ( strCss )
     {
       objProperties.css = strCss;
     },
     get: function ()
     {
       return objProperties.css;
     }
   } );

  Object.defineProperty( this, "cssItem",
                         {
                           set: function ( strCssItem )
                           {
                             objProperties.cssItem = strCssItem;
                           },
                           get: function ()
                           {
                             return objProperties.cssItem;
                           }
                         } );

  Object.defineProperty( this, "cssImg",
                         {
                           set: function ( strCssImg )
                           {
                             objProperties.cssImg = strCssImg;
                           },
                           get: function ()
                           {
                             return objProperties.cssImg;
                           }
                         } );

  Object.defineProperty( this, "idImg", {
    set: function ( strIdImg )
    {
      objProperties.idImg = strIdImg;
    },
    get: function ()
    {
      return objProperties.idImg;
    }
  } );

  Object.defineProperty( this, "cssHoverImg", {
    set: function ( strCssHoverImg )
    {
      objProperties.cssHoverImg = strCssHoverImg;
    },
    get: function ()
    {
      return objProperties.cssHoverImg;
    }
  } );

  Object.defineProperty( this, "cssHover", {
    set: function ( strCssHoverImg )
    {
      objProperties.cssHover = strCssHoverImg;
    },
    get: function ()
    {
      return objProperties.cssHover;
    }
  } );

  Object.defineProperty( this, "hoverImg", {
    set: function ( strHoverImg )
    {
      objProperties.hoverImg = strHoverImg;
    },
    get: function ()
    {
      return objProperties.hoverImg;
    }
  } );

  Object.defineProperty( this, "hoverImgTitle", {
    set: function ( strHoverImgTitle )
    {
      objProperties.hoverImgTitle = strHoverImgTitle;
    },
    get: function ()
    {
      return objProperties.hoverImgTitle;
    }
  } );

  Object.defineProperty( this, "divider", {
    set: function ( fHasDivider )
    {
      objProperties.divider = fHasDivider;
    },
    get: function ()
    {
      return objProperties.divider;
    }
  } );


  Object.defineProperty( this, "cssDivider", {
    set: function ( strCssDivider )
    {
      objProperties.cssDivider = strCssDivider;
    },
    get: function ()
    {
      return objProperties.cssDivider;
    }
  } );

  Object.defineProperty( this, "cssSelected", {
    set: function ( strCssSelected )
    {
      objProperties.cssSelected = strCssSelected;
    },
    get: function ()
    {
      return objProperties.cssSelected;
    }
  } );

  Object.defineProperty( this, "clickHandlerClass", {
    set: function ( strClickHandlerClass )
    {
      objProperties.clickHandlerClass = strClickHandlerClass;
    },
    get: function ()
    {
      return objProperties.clickHandlerClass;
    }
  } );

  Object.defineProperty( this, "clickHandlerModule", {
    set: function ( strClickHandlerModule )
    {
      objProperties.clickHandlerModule = strClickHandlerModule;
    },
    get: function ()
    {
      return objProperties.clickHandlerModule;
    }
  } );

  Object.defineProperty( this, "widgetHandlerClass", {
    set: function ( strWidgetHandlerClass )
    {
      objProperties.widgetHandlerClass = strWidgetHandlerClass;
    },
    get: function ()
    {
      return objProperties.widgetHandlerClass;
    }
  } );

  Object.defineProperty( this, "widgetHandlerModule", {
    set: function ( strWidgetHandlerClass )
    {
      objProperties.widgetHandlerModule = strWidgetHandlerModule;
    },
    get: function ()
    {
      return objProperties.widgetHandlerModule;
    }
  } );

  Object.defineProperty( this, "actionClass", {
    set: function ( actionClass )
    {
      objProperties.actionClass = actionClass;
    },
    get: function ()
    {
      return objProperties.actionClass;
    }
  } );

  Object.defineProperty( this, "clickHandler", {
    set: function ( fnClickHandler )
    {
      objProperties.fnClickHandler = fnClickHandler;
    },
    get: function ()
    {
      return objProperties.clickHandler;
    }
  } );

  Object.defineProperty( this, "persistInstance", {
    set: function ( fPersistInstance )
    {
      objProperties.persistInstance = fPersistInstance;
    },
    get: function ()
    {
      return objProperties.persistInstance;
    }
  } );


  return new Promise( (success, fail ) =>
  {
    m_promiseMgr = new VwPromiseMgr( success, fail, configObject );

  });


} // end VwActionBarDescriptor{}

export default VwActionBarDescriptor;