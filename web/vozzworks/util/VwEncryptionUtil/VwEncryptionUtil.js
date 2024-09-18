/*
 * Created by User: petervosburgh
 * Date: 5/10/24
 * Time: 7:54 AM
 * 
 */

import VwFileReader from "/vozzworks/util/VwFileReader/VwFileReader.js";

function VwEncryptionUtil()
{

  let m_aes256Key;
  let m_aes256Iv;

  this.aes256EncryptString = handleEncryptAes256String;
  this.aes256EncryptFile = handleEncryptAes256File;
  this.getAes256Keys = handleGetAes256Keys;
  this.aes256DecryptString = handleAes256DecryptString;
  this.aes256DecryptBlob = handleAes256DecryptBlob;


  /**
   * Encrypt a string using AES256
   *
   * @param strStrinToEncrypt The String to encrypt
   * @return a bse64 encoded encrypted string
   */
  async function handleEncryptAes256String( strStrinToEncrypt )
  {
    const keySpec = getAesKeySpec();

    m_aes256Key = await crypto.subtle.generateKey( keySpec, true, ["encrypt", "decrypt"]  );
    m_aes256Iv = window.crypto.getRandomValues(new Uint8Array(16));

    const encoder = new TextEncoder();
    const aEncoded = encoder.encode( strStrinToEncrypt );

    const encrypted = await crypto.subtle.encrypt( {name:"AES-CBC", iv:m_aes256Iv}, m_aes256Key, aEncoded );

    const array = new Uint8Array( encrypted );

    return base64js.fromByteArray( array )

  } // end handleEncryptAes256String()

  /**
   * Encryptes a File object with AES 256
   *
   * @param fileToEncrypt The file to encrypt
   * @return {Promise<*>}
   */
  async function handleEncryptAes256File( fileToEncrypt, bBase64Result )
  {
    const keySpec = getAesKeySpec();

    m_aes256Key = await crypto.subtle.generateKey( keySpec, true, ["encrypt", "decrypt"]  );
    m_aes256Iv = window.crypto.getRandomValues(new Uint8Array(16));

    const fileArrayBuff = await VwFileReader.readAsArrayBuffer( fileToEncrypt );

    const encrypted = await crypto.subtle.encrypt( {name:"AES-CBC", iv:m_aes256Iv}, m_aes256Key, fileArrayBuff );

    if (bBase64Result )
    {
      const array = new Uint8Array( encrypted );
      return base64js.fromByteArray( array )
    }

    return encrypted;

  } // end handleEncryptAes256String()

  /**
   * Decrypt aes-256 message as a string
   * @param strEncryptedB64 The Base64 encoded encrypted string
   * @param strKeyB64 the key Base64 encoded
   * @param strIvB64  the initialzation vector Base64 encoded
   * @return {Promise<ArrayBuffer>}
   */
  async function handleAes256DecryptString( strEncryptedB64, strKeyB64, strIvB64 )
  {
    const abEncrypted =  base64js.toByteArray( strEncryptedB64 );
    const abKey = base64js.toByteArray( strKeyB64 );
    const abIv = base64js.toByteArray( strIvB64 );

    const key = await crypto.subtle.importKey("raw", abKey, "AES-CBC", true, ["decrypt"]);
    const decrypted = await window.crypto.subtle.decrypt( {name:"AES-CBC", iv:abIv}, key, abEncrypted );

    const decoder = new TextDecoder();

    return decoder.decode( decrypted );

  } // end handleAes256Decrypt()

  /**
   * Decryptes an ArrayBuffer/Blob
   * @param blob the array buffer or blob to decrypt
   * @param strKeyB64 The crypto array key  base64 encoded
   * @param strIvB64 The iv array Bse64 encoded
   * @return {Promise<ArrayBuffer>}
   */
  async function handleAes256DecryptBlob( blob, strKeyB64, strIvB64 )
  {
    const abKey = base64js.toByteArray( strKeyB64 );
    const abIv = base64js.toByteArray( strIvB64 );

    const key = await crypto.subtle.importKey("raw", abKey, "AES-CBC", true, ["decrypt"]);
    return await window.crypto.subtle.decrypt( {name:"AES-CBC", iv:abIv}, key, blob );

  } // end handleAes256Decrypt()

  /**
   * Returns and object withthe AES 256 Key that was created for the previous encryption call and
   * <br/>The initialzation vector (iv) in the form {key:base64Key, iv:bas64Iv}
   *
   * @return {Promise<{iv: *, key: *}>}
   */
  async function handleGetAes256Keys()
  {
    if ( !m_aes256Key)
    {
      throw "No keys available. You must first execute on the the encryption methods."
    }

    // export the key and Baase64 encode it
    const exported = await crypto.subtle.exportKey("raw", m_aes256Key);
    const exportedKeyBuffer = new Uint8Array(exported);

    const strExportedKeyB64 = base64js.fromByteArray(exportedKeyBuffer);

    // Base64 encode the iv buffer
    const strIvB64 = base64js.fromByteArray( m_aes256Iv );

    return {key:strExportedKeyB64, iv:strIvB64};

  } // end handleGetAes256Keys()

  /**
   * returns an AES key spec for AES 256
   * @return {{}}
   */
  function getAesKeySpec()
  {
    const keySpec = {};
    keySpec.name = "AES-CBC";
    keySpec.length = 256;
    return keySpec
  } // end getAesKeySpec()


} // end VwEncryptionUtil()


export default VwEncryptionUtil;

