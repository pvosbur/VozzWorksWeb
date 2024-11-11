/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2022 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 * ============================================================================================
 *
 */
function VwAssert()
{

}

/**
 * Asserts objToTest is not null
 *
 * @param objToTest The object to test
 * @param strFailMsg  throws exception if objToTest is null with the strFailMsg as the Exception reason
 */
VwAssert.isNotNull = ( objToTest, strFailMsg ) =>
{
  if ( !objToTest )
  {
    VwAssert.processErrorStack( `Assert Failure isNotNull: ${strFailMsg}` );
  }
} // end VwAssert.isNotNull()


/**
 * Asserts objToTest is null
 *
 * @param objToTest The object to test
 * @param strFailMsg  throws exception if objToTest is not null with the strFailMsg as the Exception reason
 */
VwAssert.isNull = ( objToTest, strFailMsg ) =>
{
  if ( !objToTest )
  {
    VwAssert.processErrorStack(`Assert Failure isNull: ${strFailMsg}` );
  }

} // end VwAssert.isNull()

/**
 * Asserts the boolean expression ffrom some compare is true
 * @param bTest The resulting boolean from some compare
 *
 * @param strFailMsg Throws an exception if the btest is false with the strFailMsg as the Exception reason
 */
VwAssert.isTrue = ( bTest, strFailMsg ) =>
{
  if (! bTest )
  {
    VwAssert.processErrorStack( `Assert Failure isTrue: ${strFailMsg}` );

  }

} // end VwAssert.isTrue()


/**
 * THis creates a statckn trace so we can show the developer the harmess class, method name and line nbr of the assert that failed
 * @param strErrMsg
 */
VwAssert.processErrorStack = ( strErrMsg ) =>
{

  const errStack = new Error( strErrMsg ).stack;

  const aStackLevels =  errStack.split( " at ");

  const strErrStackTrace =  strErrMsg + " at " + aStackLevels[ 3 ];

  throw strErrStackTrace.trim();

}

export default VwAssert;



