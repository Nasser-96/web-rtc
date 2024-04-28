import useNewSocket from "@/socket/new-socket";
import { FormEvent, useEffect, useRef, useState } from "react";
import useWindowIsLoaded from "@/hooks/useIsWindowLoaded";
import useUserStore from "@/store/user-store";
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
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setLocalStream(stream);
          const connection: RTCPeerConnection = await createPeerConnection(
            stream,
            true
          );
          const offer = await connection.createOffer();
          console.log(offer);
          connection.setLocalDescription(offer);
          setDidIOffer(true);
          socket?.emit("newOffer", offer);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const createPeerConnection = (
    newStream: MediaStream,
    didIOfferFun?: boolean
  ): Promise<RTCPeerConnection> => {
    return new Promise((resolve, reject) => {
      const newPeer = new RTCPeerConnection(peerConfig);
      newStream.getTracks().forEach((track) => {
        newPeer.addTrack(track, newStream);
      });
      setPeerConnection(newPeer);
      console.log("didIOffer", didIOfferFun);

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
      resolve(newPeer);
    });
  };

  const createOfferEls = (offer: OfferType[]) => {
    setOffersList(offer);
  };

  const answerOffer = (offer: OfferType) => {
    console.log(offer);
  };

  useEffect(() => {
    socket?.on("availableOffers", (offer: OfferType[]) => {
      createOfferEls(offer);
    });
    socket?.on("newOfferAwaiting", (offer: OfferType[]) => {
      createOfferEls(offer);
    });
    return () => {
      socket?.off("newOfferAwaiting", (offer: OfferType[]) => {
        createOfferEls(offer);
      });
      socket?.off("availableOffers", (offer: OfferType[]) => {
        createOfferEls(offer);
      });
    };
  }, [socket]);

  return (
    <div className="flex items-center justify-center">
      <div className="container">
        <div className="flex gap-2">
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
        <div className="flex gap-2 justify-center mt-2">
          <video
            className="w-full bg-slate-800 rounded-md"
            autoPlay
            playsInline
            ref={localVideoRef}
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
