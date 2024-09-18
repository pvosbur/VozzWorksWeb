/*
 * Created by User: petervosburgh
 * Date: 6/13/24
 * Time: 9:59 AM
 * 
 */
/**
 * This bse64 helper uses the base64js library for implementation
 * @constructor
 */
function VwBase64()
{

} // end VwBase64()

/**
 * Encodes a string or a byte array to a base64 string
 *
 * @param data The data to encode. It must by a string aor a byte array
 * @return {*} The base 64 encoded strong
 */
VwBase64.encode = (data) =>
{
  if ( typeof data == "string" )
  {
    const te = new TextEncoder();
    const abString = te.encode( data );

    return base64js.fromByteArray( abString );
  }

  if (Array.isArray( data ))
  {
    return base64js.fromByteArray( data );
  }

  throw "toBase64 requires a byte array or a string";

} // end VwBase64.toBase64()

/**
 * Decodes a base64 string to a byte array or a string
 *
 * @param strB64 The base64 string to decode
 * @param bReturAsString if true, return the result as a string, else return the result as an array
 * @return {*|string}
 */
VwBase64.decode = (strB64, bReturAsString ) =>
{
  const abResult = base64js.toByteArray( strB64 );

  if ( bReturAsString )
  {
    const td = new TextDecoder();
    return td.decode( abResult );

  }

  return abResult;

} // end VwBase64.fromBase64()

export default VwBase64;

