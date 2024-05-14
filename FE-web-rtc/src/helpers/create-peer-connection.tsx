import peerConfiguration from "./stun-servers";

const createPeerConnection = async () => {
  return await new Promise<{
    peerConnection: RTCPeerConnection;
    remoteStream: MediaStream;
  }>(async (resolve, reject) => {
    const peerConnection = await new RTCPeerConnection(peerConfiguration);
    const remoteStream = new MediaStream();

    peerConnection.addEventListener("signalingstatechange", (e) => {
      console.log("Signaling State Change");
      console.log(e);
    });
    peerConnection.addEventListener("icecandidate", (e) => {
      console.log("Found ice candidate");
      if (e.candidate) {
      }
    });
    resolve({ peerConnection: peerConnection, remoteStream: remoteStream });
  });
};

export default createPeerConnection;
