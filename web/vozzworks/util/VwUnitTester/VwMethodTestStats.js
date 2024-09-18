
/*
 * Created by User: petervosburgh
 * Date: 4/27/22
 * Time: 10:57 AM
 * 
 */
function VwMethodTestStats( strHarnessName, strMethodName, strPassOrFail, nExecutionTime, strFailReason, strPassOrFailClass )
{
  const m_strPassOrFail = strPassOrFail;
  const m_nExecutionTime = nExecutionTime;
  const m_strFailReason = strFailReason;
  const m_strMethodName = strMethodName;
  const m_strHarnessName = strHarnessName;
  const m_strPassOrFailClass = strPassOrFailClass;

  this.harnessName = m_strHarnessName
  this.methodName = m_strMethodName;
  this.passOrFail = m_strPassOrFail;
  this.executionTime = m_nExecutionTime;
  this.failReason = m_strFailReason;
  this.passOrFailClass = m_strPassOrFailClass;

} // end VwMethodTestStats{}

export default VwMethodTestStats;