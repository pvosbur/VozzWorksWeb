/**
 * This class waits for the specied miilisecs must be used with await. i.e.  await VwWait( 1000 );
 * @param nMillisecs The number of millisecs to wait
 * @return {Promise<unknown>}
 * @constructor
 */
function VwWait( nMillisecs )
{
  return new Promise( (success, fail ) =>
                      {
                        setTimeout( () =>
                                    {
                                      success();
                                    }, nMillisecs );
                      }); // end promise
}

export default VwWait;
