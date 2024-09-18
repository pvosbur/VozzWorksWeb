/*
 * Created by User: petervosburgh
 * Date: 6/13/22
 * Time: 7:08 AM
 * 
 */

function VwUserMediaMgr()
{

} // VwUserMediaMgr{}

/**
 * Returns an array of MediaDeviceInfo objects
 * @return {Promise<MediaDeviceInfo[]>}
 */
VwUserMediaMgr.getAvailableDevices = async ( strType ) =>
{

  const constraints = {};

  switch( strType )
  {
    case "videoinput":

      constraints.video = true;
      break;

    case "audioinput":

      constraints.audio = true;
      break;

  }
  await navigator.mediaDevices.getUserMedia( constraints );
  
  let aMediaDevices = await navigator.mediaDevices.enumerateDevices();

  return aMediaDevices.filter( (device ) =>
                               {
                                 return device.kind == strType;
                              });

}  // end getAvailableVideoDevices


/**
 * Returns a stream for the specified device
 *
 * @param deviceToGet The MediaDeviceInfo object from a prior call to VwUserMediaMgr.getAvailableVideoDevices
 * @param bIncludeAudio if true include the default audio for this video device
 * @return {Promise<MediaStream>}
 */
VwUserMediaMgr.getVideoDeviceStream = async ( deviceToGet, bIncludeAudio ) =>
{
  const options = {video:{deviceId:{exact:deviceToGet.deviceId}}, audio:bIncludeAudio};

  return await navigator.mediaDevices.getUserMedia( options );

} // end VwUserMediaMgr.getDeviceStream()

VwUserMediaMgr.getAudioVideoDeviceStream = async ( videoDevice, audioDevice ) =>
{
  const options = {video:{deviceId:{exact:videoDevice.deviceId}}, audio:{deviceId:{exact:audioDevice.deviceId}}};

  const stream =  await navigator.mediaDevices.getUserMedia( options );;
  return stream;

} // end VwUserMediaMgr.getDeviceStream()

/**
 * Gets a stream to the specified audio device
 *
 * @param deviceToGet The MediaDeviceInfo object from a prior call to VwUserMediaMgr.getAvailableVideoDevices
 * @return {Promise<MediaStream>}
 */
VwUserMediaMgr.getAudioDeviceStream = async ( deviceToGet ) =>
{
  const options = {audio:{deviceId:{exact:deviceToGet.deviceId}}};

  return await navigator.mediaDevices.getUserMedia( options );

} // end VwUserMediaMgr.getDeviceStream()


/**
 * Returns a stream to the defualt video and or audio based on the streamConstraints object
 *
 * @param streamConstraints The stream constraints object as defined in  Mdn web docs
 * <br/>- Capabilities, constaints and settings section of the Media Stream API
 *
 * @return {Promise<MediaStream>}
 */
VwUserMediaMgr.getDefaultStreamMedia = async ( streamConstraints ) =>
{
  return await navigator.mediaDevices.getUserMedia( streamConstraints );
}

/**
 * Returns a supported constraint object with the supported properties
 * @return {Promise<MediaTrackSupportedConstraints>}
 */
VwUserMediaMgr.getSupportedConstraints = async () =>
{
  return await navigator.mediaDevices.getSupportedConstraints();
}

export default VwUserMediaMgr;
