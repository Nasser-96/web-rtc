import peerConfiguration from "./stun-servers";

const createPeerConnection = async (addIce: (ice: RTCIceCandidate) => void) => {
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

    peerConnection.addEventListener(
      "icecandidate",
      (e: RTCPeerConnectionIceEvent) => {
        console.log("Found ice candidate");

        if (e.candidate) {
          addIce(e.candidate);
        }
      }
    );
    peerConnection.addEventListener("track", (e: RTCTrackEvent) => {
      e.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
        console.log("Fingered Crossed.......");
      });
    });
    resolve({ peerConnection: peerConnection, remoteStream: remoteStream });
  });
};

export default createPeerConnection;
