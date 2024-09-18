/*
 * Created by User: petervosburgh
 * Date: 5/10/22
 * Time: 7:21 AM
 * 
 */

/**
 * Encapsulates the promise sucess and fail objects then calls the
 *
 * @param success The promise success method
 * @param fail    The promise fail method
 * @param fnConfigObject The objects configObject method
 * @constructor
 */
function VwPromiseMgr( success, fail, fnConfigObject )
{
  this.success = success;
  this.fail = fail;

  if ( !fnConfigObject )
  {
    return;

  }
  setTimeout( () =>
              {
                if ( fnConfigObject )
                {
                  fnConfigObject();
                }

              }, 1)

} // end VwPromiseMgr{}

export default VwPromiseMgr;


