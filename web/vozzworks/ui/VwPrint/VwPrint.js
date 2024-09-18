/**
 ============================================================================================


 Copyright(c) 2017 By

 A r M O r e d   I n f o   L L C.

 A L L   R I G H T S   R E S E R V E D


 Author:           alejandroscotti

 Date Generated:   12/19/17

 Time Generated:   4:56 PM

 ============================================================================================
 */


import VwPromiseMgr from "/vozzworks/util/VwPromiseMgr/VwPromiseMgr.js";

/**
 * Handles printing any element from the HTML page. This puts up the OS system mode print dialog
 *
 * @param strElementId  String, required. The parent DOM element ID for the elements to print.
 * @param strFrameTitle String, optional. The text title for the iframe element, it will show on the printed page.
 * @constructor
 */
function VwPrint( strElementId, strFrameTitle )
{
  const self = this;
  //const m_contents = $(`#${strElementId}` )[0];

  let   m_promiseMgr;

  /**
   * Install iframe and execute print dialog
   */
  async function configObject()
  {

    const iframe = document.createElement('iframe');

    // Make it hidden
    iframe.style.height = 0;
    iframe.style.visibility = 'hidden';
    iframe.style.width = 0;

    // Set the iframe's source
    iframe.setAttribute('srcdoc', `<html><title>${strFrameTitle}</title><body></body></html>`);

    document.body.appendChild(iframe);

    iframe.addEventListener('load',  () =>
    {
      // Clone the image
      //const image = document.getElementById(strElementId).cloneNode();
      const image = ($(`#${strElementId}`)[0]).cloneNode();
      image.style.maxWidth = '100%';

      // Append the image to the iframe's body
      const body = iframe.contentDocument.body;
      body.style.textAlign = 'center';
      body.appendChild(image);


      image.addEventListener('load', () =>
      {
        // Invoke the print when the image is ready
        iframe.contentWindow.print();
        $(iframe).remove();

        m_promiseMgr.success( self );

      });

    });

  }

  // this is an await constructor
  return new Promise( (success, fail ) =>
                      {
                        m_promiseMgr = new VwPromiseMgr( success, fail, configObject );
                      });

} // end VwPrint

export default VwPrint;