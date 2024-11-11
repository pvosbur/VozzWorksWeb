/*
 * Created by User: petervosburgh
 * Date: 11/8/24
 * Time: 7:28 AM
 * 
 */

function VwRefelectionTest( strName )
{
  const m_strName = strName;

  let m_strFirstName;
  let m_strLastName;
  let m_nAge;
  let m_dtBirthday;

  this.setFirstName = ( strFirstName ) => m_strFirstName = strFirstName;
  this.getFirstName = () => m_strFirstName;
  this.setLastName = ( strLastName ) => m_strLastName = strLastName;
  this.getLastName = () => m_strLastName = strLastName;
  this.setAge = ( nAge ) => m_nAge = nAge;
  this.getAge = () => m_nAge;
  this.setBirthday = ( dtBirthDate ) => m_dtBirthday = dtBirthDate;
  this.getBirthday = () => m_dtBirthday;

  this.sayHello = () => console.log( `Hello ${m_strFirstName} ${m_strLastName}` );

}

export default VwRefelectionTest;

