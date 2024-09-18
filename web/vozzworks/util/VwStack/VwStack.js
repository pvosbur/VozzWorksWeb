
/*
 *
 * ============================================================================================
 *
 *                                       V o z z w o r k s
 *
 *                                     Copyright(c) 2020 By
 *
 *                                       Vozzware LLC
 *
 *                             A L L   R I G H T S   R E S E R V E D
 *
 * ============================================================================================
 *
 */

/**
 * Standard stack object
 * @constructor
 */
function VwStack()
{
  let m_aStackEntries = [];

  this.push = ( entry ) => m_aStackEntries.unshift( entry );
  this.pop = pop;
  this.peek = peek;
  this.size = () => m_aStackEntries.length;
  this.clear = () => m_aStackEntries = [];;
  this.exists = exists;
  this.getEntries = () => m_aStackEntries;


  /**
   * Returns the object at top of stack and removes it from the stack
   * @returns {*}
   */
  function pop()
  {
    if ( m_aStackEntries.length == 0 )
    {
      return null;
    }

    const objData = m_aStackEntries[ 0 ];

    m_aStackEntries.splice( 0, 1 );

    return objData;

  } // end pop()

  /**
   * Returns the object at top of stack without removing it or null if stack is empty
   * @returns {*}
   */
  function peek()
  {
    if ( m_aStackEntries.length == 0 )
    {
      return null;
    }

    return m_aStackEntries[ 0 ];

  } // end peek()

  /**
   * test for the existence of an instance in the stack
   *
   * @param objToTest The object to test
   * @returns {boolean}
   */
  function exists( objToTest )
  {
    for ( const objInStack of m_aStackEntries )
    {
      if ( Object.is( objInStack, objToTest ) )
      {
        return true;
      }
    }
  } // end exists()

} // end VwStack{}

export default VwStack;
