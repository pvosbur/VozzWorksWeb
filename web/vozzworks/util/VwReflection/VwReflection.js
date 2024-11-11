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

import VwStringTokenParser from "/vozzworks/util/VwStringTokenParser/VwStringTokenParser.js";

/**
 * Class that holds constructor info about an object
 *
 * @param fnConstructor The function constructor
 * @constructor
 */
export function VwConstructor( vwClass,fnConstructor )
{
  this.getParamCount = getParamCount;
  this.getParamNames = getParamNames;
  this.getName = getName;
  
  this.newInstance = newInstance;
  this.thisInstance = thisInstance;

  /**
   * Creats a new instance of the class
   *
   * @param aParams Constructor params - May be null
   * @returns {{}}
   */
  async function newInstance( aParams )
  {
    // Create constructor instance
    const fnThis = Object.create( fnConstructor.prototype );

    await fnConstructor.apply( fnThis, aParams );

    vwClass.doPropertyInstanceFixups( fnThis );

    return fnThis;
  }

  /**
   * Constructs object using instance specified
   *
   * @param thisObject The instance to call
   * @param aParams Constructor params - May be null
   * @returns {{}}
   */
  function thisInstance( thisObject, aParams )
  {

    fnConstructor.apply( thisObject, aParams );
    return thisObject;
  }

  /**
   * Returns the class name
   * @returns {*}
   */
  function getName()
  {
    return fnConstructor.name;
    
  }

  /**
   * Returns the number of parameters the class constructor takes
   * @returns {*}
   */
  function getParamCount()
  {
    return fnConstructor.length;
  }


  /**
   * Returns the parameter names
   * @returns {Array}
   */
  function getParamNames()
  {
    if ( fnConstructor.length == 0 )
    {
      return null;

    }

    let str = fnConstructor.toString();

    // Remove comments of the form /* ... */
    // Removing comments of the form //
    // Remove body of the function { ... }
    // removing '=>' if func is arrow function
    str = str.replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/(.)*/g, '')
            .replace(/{[\s\S]*}/, '')
            .replace(/=>/g, '')
            .trim();

    let nStartParen = str.indexOf("(");
    const nEndParen = str.indexOf(")");
    if (nStartParen < 0 )
    {
      throw `${fnConstructor.name} invalid, missing open "("`;
    }

    if (nEndParen < 0 )
    {
      throw `${fnConstructor.name} invalid, missing closing ")"`;
    }

    const strParamNames = str.substring( ++nStartParen, nEndParen ).trim();

    const astrParamNames = strParamNames.split( ",");

    return astrParamNames;


  }
  
}  // end VwConstructor{}

/**
 * This class holds information about a method
 * 
 * @param strName  The name of the method
 * @param astrParameters
 *
 * @constructor
 */
export function VwMethod( strMethodName, astrParameters )
{
  const self = this;

  // Make sure VwMethod was created internally
  if ( self instanceof Window )
  {
    throw "Illegal VwMethod invocation";
  }

  if ( !self.name || self.name != strMethodName )
  {
    throw "Illegal VwMethod invocation";

  }

  this.invoke = invoke;
  
  this.getParamCount = getParamCount;
  this.getParamNames = getParamNames;
  this.getName = () => strMethodName;
  
  /**
   * Returns the number of parameters the clss constructor takes
   * @returns {*}
   */
  function getParamCount()
  {
    if ( astrParameters )
    {
      return astrParameters.length;
    }
    
    return 0;
    
  } // end getParamCount()

  /**
   * Returns the parameter names
   * @returns {Array}
   */
  function getParamNames()
  {
    return astrParameters;
    
  } // end getParamNames()

  /**
   * Invokes the methos
   *
   * @param objInstance Object instance method belongs to
   * @param aobjParams An array of method parameters - May be null
   */
  function invoke( objInstance, aobjParams )
  {
    const fnMethod = objInstance[ strMethodName ];

    // Sanity check
    if ( !fnMethod )
    {
      throw "No public method exists for the object instance provided";
    }
    
    return fnMethod.apply( objInstance, aobjParams );

  } // end invoke()
  
} //end VwMethod{}


/**
 * Class to hold a property description
 * 
 * @param strName The property name
 * @param objInstance the object instance this pro[perty is for
 * @constructor
 */
export function VwProperty( strName )
{
  let m_objInstance;

  this.setInstance = ( objInstance ) => m_objInstance = objInstance;

  this.getName = getName;
  this.getValue = getValue;
  this.setValue = setValue;

  /**
   * Returns the name of the property
   * @returns {*}
   */
  function getName()
  {
    return strName;
  }

  /**
   * Returns the property value
   * @returns {*}
   */
  function getValue()
  {
    if ( !m_objInstance )
    {
      throw `Cannot get property value without an object instance for property '${strName}`

    }

    return m_objInstance[ strName ];
  } // end getValue()


  /**
   * Sets the property value
   * @param objValue
   */
  function setValue( objValue )
  {
    if ( !m_objInstance )
    {
      throw `Cannot set property value without an object instance for property '${strName}`

    }

    m_objInstance[ strName ] = objValue;

  } // end setValue()

} // end VwProperty{}

/**
 * The Top level Class (which in javascript is really the top level function)
 *
 * @param fnClass The function constructor
 * @constructor
 */
export function VwClass( fnClass )
{
  const self = this;
  const m_aPublicMethods = [];
  const m_aProperties = [];

  this.getConstructor = getConstructor;
  this.getPublicMethods = () => m_aPublicMethods;
  this.getPublicMethod = getPublicMethod;
  this.getProperties = () => m_aProperties;
  this.getProperty = getProperty;

  this.doPropertyInstanceFixups = doPropertyInstanceFixups;

  parseClass();

  // Create a VwConstructor
  function getConstructor()
  {
    return new VwConstructor( self, fnClass );
  }

  function doPropertyInstanceFixups( objInstance )
  {
    if ( m_aProperties.length == 0 )
    {
      return;
    }

    for ( const vwProperty of m_aProperties )
    {
      vwProperty.setInstance( objInstance );
    }
  }

  /**
   * Get a property by its name if it exists
   *
   * @param strPropName The name of the property to retrieve
   */
  function getProperty( strPropName )
  {

    for ( const vwProperty of m_aProperties )
    {
      if ( vwProperty.getName() == strPropName )
      {
        return vwProperty;
      }
    }

    // not found

    return null;

  } // end getProperty()


  /**
   * Gets a method by its name
   *
   * @param strSearchMethodName The name of the method to get
   * @returns A VwMethod instance
   */
  function getPublicMethod( strSearchMethodName )
  {
    for ( const vwMethod of  m_aPublicMethods )
    {
      if ( vwMethod.getName() == strSearchMethodName)
      {
        return vwMethod;
      }
    }

    throw "No method name: " + strSearchMethodName + "exists for class " + fnClass.name;

   } // end getPublicMethod

  /**
   * Parse the class used in forMName or forModule
   */
  function parseClass()
   {
     const strClassToParse = fnClass.toString();

     const tokenParser = new VwStringTokenParser( strClassToParse, " (=\n;");

     tokenParser.setCursorPos( strClassToParse.indexOf( "{") + 1 ); // start parsing past open
     tokenParser.setReturnDelim( true )
     let token = tokenParser.getNextToken();

     while(  token )
     {
       if ( token.val.trim().startsWith( "this.") )
       {

         const nextToken = advancePastDelimiters( " =")

         if ( nextToken.val == "(" ) // This
         {
           const nCursor = tokenParser.getCursorPos();
           const nEndLinePos = strClassToParse.indexOf( "\n", nCursor );
           const strRestOfLine = strClassToParse.substring( nCursor, nEndLinePos);

           if ( strRestOfLine.indexOf( "=>") > 0  ) // this is an arrow function
           {
             m_aPublicMethods.push( createMethod( trimAnsRemoveThisDot( token.val ) )  );
           }
           else
           {
             // assume its a value expression which makes it a property
             m_aProperties.push( createProperty( trimAnsRemoveThisDot( token.val ) ) );

           }

           tokenParser.setCursorPos( nEndLinePos + 1 );

         }
         else
         if ( ";\n".indexOf(nextToken.val ) >= 0 || nextToken.val.charAt( 0 ) == '"' )// This is a string or an unitialized property
         {
           m_aProperties.push( createProperty( trimAnsRemoveThisDot( token.val ) ));
         }
         else
         if ( isNaN( nextToken.val ) )  // this would be a function reference
         {
           if ( nextToken.val == "true" || nextToken.val == "false" ) // is a a boolean property
           {
             m_aProperties.push( createProperty( trimAnsRemoveThisDot( token.val ) ) );
           }
           else
           {
             m_aPublicMethods.push( createMethod( trimAnsRemoveThisDot( token.val ) )  ); // is is a method alias
           }

         } // end if
         else
         {
           // this is a property nbr assignment
           m_aProperties.push( createProperty( trimAnsRemoveThisDot( token.val ) ));

         }

       } // end if

       token = token = tokenParser.getNextToken();
     }

     function advancePastDelimiters( strDelims )
     {
       while( true )
       {
         const token = tokenParser.getNextToken();

         if ( !token )
         {
           return null;

         }

         if ( token.type == VwStringTokenParser.DELIM && strDelims.indexOf( token.val ) >= 0 )
         {
           continue;
         }

         return token;
       }

     }

     /**
      * Trims and removes the "this." prefix to the name
      * @param strName
      * @return {*|string|string}
      */
     function trimAnsRemoveThisDot( strName )
     {
       strName = strName.trim();

       return strName.substring( strName.indexOf( "." ) + 1 );

     }

     /**
      * Creates a VwMethod instance with ant defined params
      * @param strMethodName
      * @return {{}}
      */
     function createMethod( strMethodName )
     {
       let nCursor = tokenParser.getCursorPos(); // Put back the "(" char

       let nParamEndPos = strClassToParse.indexOf( ")", nCursor );

       const strMethodParamsDecl = strClassToParse.substring( nCursor, nParamEndPos );

       const astrMethodParams = VwClass.getParamNames( strMethodParamsDecl );

       const thisMethod = {};
       thisMethod.name = strMethodName;

       VwMethod.call( thisMethod, thisMethod.name, astrMethodParams )
       
       return thisMethod;

     } // end createMethod()

     /**
      * Creates a property object for this property definition
      * @param strPropertyName The name of the property
      *
      * @return {VwProperty}
      */
     function createProperty( strPropertyName )
     {
       return new VwProperty( strPropertyName );

     } // end createProperty()


   } // end parseClass()

} // end class


// Static Methods

/**
 * Creats a VwClassInstance holing the functions constructor
 * @param strClassName
 * @returns {VwClass}
 */
VwClass.forName = function( strClassName )
{
  return new VwClass( window[ strClassName ] );
};

VwClass.forModule = async ( strModulePath, strModuleName ) =>
{
  const obj = await import( strModulePath);

  let  moduleFn;
  if ( strModuleName )
  {
    moduleFn = obj[ strModuleName];
  }
  else
  if (obj.default )
  {
    moduleFn = obj.default;
  }
  else
  {
    moduleFn = obj;
  }

  return new VwClass( moduleFn );

} // end VwClass.forModule()


/**
 * Returns the parameter names for a function object
 * @param fn The functions object 
 * @returns {Array} of parameters names
 */
VwClass.getParamNames = function( strParams )
{

  if ( !strParams )
  {
    return null;

  }

  const aParamNames = strParams.split( "," );

  for ( let x = 0, nLen = aParamNames.length; x < nLen; x++ )
  {
    aParamNames[ x ] = aParamNames[ x ].trim();
  }

  return aParamNames;

};
