/*
 * Created by User: petervosburgh
 * Date: 9/9/24
 * Time: 11:03 AM
 * 
 */

let count;

test();

function test()
{
  count = 0;
  $( "#clickMe" ).click( handleClick );
}

function handleClick()
{

  if ( !count )
  {
    count = 0;
  }

  ++count;

  startAnimate();

}

 function startAnimate()
 {
   let init;

   requestAnimationFrame( animate );
  function animate( timestamp )
  {
    if ( !init )
    {
      init = timestamp;
    }

    if ( (performance.now() - init ) > 300 )
    {
      console.log( `Click Count: ${count}`);
      count = null;
      return;

    }
    requestAnimationFrame( animate );

  }
}