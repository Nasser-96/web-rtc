import useNewSocket from "@/socket/new-socket";
import { FormEvent, useEffect, useRef, useState } from "react";
import useWindowIsLoaded from "@/hooks/useIsWindowLoaded";
import useUserStore from "@/stores/user-store";
import { OfferType } from "@/types&enums/types";

export default function Call() {
  const { socket } = useNewSocket();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { isWindow } = useWindowIsLoaded();
  const { userData } = useUserStore();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [didIOffer, setDidIOffer] = useState<boolean>(false);
  const [offersList, setOffersList] = useState<OfferType[]>([]);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
  const peerConfig = {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
      },
    ],
  };

  const call = async () => {
    if (isWindow) {
      try {
        const UserMedia: MediaStream = await fetchUserMedia();
        const connection: RTCPeerConnection = await createPeerConnection(
          UserMedia,
          true
        );
        const offer = await connection.createOffer();
        console.log(offer);
        connection.setLocalDescription(offer);
        setDidIOffer(true);
        socket?.emit("newOffer", offer);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const createPeerConnection = async (
    newStream: MediaStream,
    didIOfferFun?: boolean,
    offerObj?: OfferType
  ): Promise<RTCPeerConnection> => {
    return new Promise(async (resolve, reject) => {
      const newPeer = new RTCPeerConnection(peerConfig);
      const theRemoteStream = new MediaStream();
      setRemoteStream(theRemoteStream);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = theRemoteStream;
      }
      newStream.getTracks().forEach((track) => {
        newPeer.addTrack(track, newStream);
      });
      setPeerConnection(newPeer);
      console.log("didIOffer", didIOfferFun);

      newPeer.addEventListener("iceconnectionstatechange", (event) => {
        console.log(event);
      });

      newPeer.addEventListener("icecandidate", (e) => {
        console.log("____Ice candidate found____");
        console.log(e);
        console.log(userData.username);
        if (e.candidate) {
          socket?.emit("sendIceCandidateToSignalingServer", {
            iceCandidate: e.candidate,
            iceUserName: userData.username,
            didIOffer: didIOfferFun,
          });
        }
      });

      newPeer.addEventListener("track", (event) => {
        console.log("Got the track from other peer");
        console.log(event);
        event.streams[0].getTracks().forEach((track) => {
          theRemoteStream.addTrack(track);
          console.log("FINALLLY");
        });
      });
      if (offerObj) {
        await newPeer.setRemoteDescription(offerObj.offer);
      }
      resolve(newPeer);
    });
  };

  const answerOffer = async (offer: OfferType) => {
    try {
      const UserMedia: MediaStream = await fetchUserMedia();
      const answerPeerConnection = await createPeerConnection(
        UserMedia,
        false,
        offer
      );
      const answer = await answerPeerConnection.createAnswer();
      // add the answer to the offer so the server knows which offer this is related to
      offer.answer = answer;
      await answerPeerConnection.setLocalDescription(answer);
      console.log(answer);
      const offerIceCandidates: RTCIceCandidate[] = await socket?.emitWithAck(
        "newAnswer",
        offer
      );
      offerIceCandidates.forEach((candidate) => {
        answerPeerConnection.addIceCandidate(candidate);
        console.log("=======Added Ice Candidate=======");
      });
      console.log(offerIceCandidates);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserMedia = async (): Promise<MediaStream> => {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setLocalStream(stream);
        }
        resolve(stream);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  const createOfferEls = (offer: OfferType[]) => {
    setOffersList(offer);
  };

  const addAnswer = async (offer: OfferType) => {
    if (peerConnection) {
      await peerConnection?.setRemoteDescription(offer.answer);
      console.log(peerConnection.signalingState);
    }
  };
  const addNewIceCandidate = (iceCandidate: RTCIceCandidate) => {
    peerConnection?.addIceCandidate(iceCandidate);
    console.log("=======Added Ice Candidate=======");
  };

  useEffect(() => {
    socket?.off("availableOffers");
    socket?.off("newOfferAwaiting");
    socket?.off("answerResponse");
    socket?.off("receivedIceCandidateFromServer");

    socket?.on("test", (data) => {
      console.log(data);
    });
    socket?.on("availableOffers", (offer: OfferType[]) => {
      createOfferEls(offer);
    });
    socket?.on("newOfferAwaiting", (offer: OfferType[]) => {
      createOfferEls(offer);
    });
    socket?.on("answerResponse", (offer: OfferType) => {
      addAnswer(offer);
    });
    socket?.on(
      "receivedIceCandidateFromServer",
      (iceCandidate: RTCIceCandidate) => {
        addNewIceCandidate(iceCandidate);
      }
    );
    return () => {
      socket?.off("newOfferAwaiting", (offer: OfferType[]) => {
        createOfferEls(offer);
      });
      socket?.off("availableOffers", (offer: OfferType[]) => {
        createOfferEls(offer);
      });
      socket?.off("answerResponse", (offer: OfferType) => {
        addAnswer(offer);
      });
      socket?.off(
        "receivedIceCandidateFromServer",
        (iceCandidate: RTCIceCandidate) => {
          addNewIceCandidate(iceCandidate);
        }
      );
    };
  }, [socket, peerConnection]);

  return (
    <div className="flex items-center justify-center">
      <div className="container">
        {isWindow && (
          <p className="text-white my-5 text-2xl">
            User name: {userData.username}
          </p>
        )}
        <div className="lg:flex gap-2">
          <button
            onClick={call}
            className="border rounded-xl py-2 px-10 text-white bg-blue-800 mt-3"
          >
            Call
          </button>
          <button className="border rounded-xl p-2 py-2 px-10 text-white mt-3">
            Hangup
          </button>
          {offersList?.map((offer, index) => {
            return (
              <button
                key={`offer-list-buttons-${index}`}
                className="border rounded-xl p-2 py-2 px-10 bg-green-900 text-white mt-3"
                onClick={() => answerOffer(offer)}
              >
                Answer {offer.offererUserName}
              </button>
            );
          })}
        </div>
        <div className="lg:flex-row flex flex-col gap-2 justify-center mt-2">
          <video
            className="w-full bg-slate-800 rounded-md"
            autoPlay
            playsInline
            ref={localVideoRef}
            muted
          />
          <video
            className="w-full bg-slate-800 rounded-md"
            autoPlay
            playsInline
            ref={remoteVideoRef}
          />
        </div>
      </div>
    </div>
  );
}
