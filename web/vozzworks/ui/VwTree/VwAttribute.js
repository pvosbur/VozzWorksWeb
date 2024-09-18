/**
 ============================================================================================


 Copyright(c) 2014 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           petervosburgh

 Date Generated:   7/20/20

 Time Generated:   9:25 AM

 ============================================================================================
 */


/**
 * VwAttribute
 * @param strName The attribute name
 * @param strValue The attribute value
 * @constructor
 */
function VwAttribute( strName, strValue )
{

  this.getName = () => strName;
  this.getValue = () => strValue;

} // end VwAttribute{}

export default VwAttribute;
