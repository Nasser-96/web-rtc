import useNewSocket from "@/socket/new-socket";
import { useEffect, useRef, useState } from "react";
import useWindowIsLoaded from "@/hooks/useIsWindowLoaded";
import useUserStore from "@/stores/user-store";
import {
  CreatePeerConnectionType,
  FetchUserMediaType,
  OfferTypeDemo,
} from "@/types&enums/types";
import AnswerModal from "@/components/call-demo/answer-modal";
import { CallStatusEnum } from "@/types&enums/enums";
import { getDevices } from "@/components/join-video/video-button/get-devices";
import DropDownMenu from "@/components/join-video/drop-down-menu";
import Button from "@/components/shared/button";

export default function Call() {
  const { socket } = useNewSocket("call-demo");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localShareVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const shareVideoRef = useRef<HTMLVideoElement>(null);
  const { isWindow } = useWindowIsLoaded();
  const { userData } = useUserStore();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [callUser, setCallUser] = useState<string>("");
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [offerState, setOfferState] = useState<OfferTypeDemo>();
  const [didIOffer, setDidIOffer] = useState<boolean>(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState<boolean>(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState<boolean>(false);
  const [answerConstraints, setAnswerConstraints] =
    useState<MediaStreamConstraints>({
      audio: false,
      video: false,
    });
  const [offerConstraints, setOfferConstraints] =
    useState<MediaStreamConstraints>({
      audio: false,
      video: false,
    });
  const [offersList, setOffersList] = useState<OfferTypeDemo[]>([]);
  const [offersListShare, setOffersListShare] = useState<OfferTypeDemo[]>([]);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
  const [peerConnectionShareScreen, setPeerConnectionShareScreen] =
    useState<RTCPeerConnection>();
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);
  const peerConfig: RTCConfiguration = {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
      },
    ],
  };

  const call = async (user: string, isShareScreen?: boolean) => {
    if (isWindow) {
      try {
        const mediaStream = await fetchUserMedia(false);
        const connection: RTCPeerConnection = await createPeerConnection({
          mediaStream,
          didIOfferFun: true,
        });
        const offer = await connection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await connection.setLocalDescription(offer);
        setDidIOffer(true);
        socket?.emit("newOffer", { user, offer: offer, offerConstraints });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const createPeerConnection = async ({
    mediaStream,
    didIOfferFun,
    offerObj,
    isShareScreen,
  }: CreatePeerConnectionType): Promise<RTCPeerConnection> => {
    return new Promise(async (resolve, reject) => {
      const newPeer = new RTCPeerConnection(peerConfig);
      const theRemoteStream = new MediaStream();
      setRemoteStream(theRemoteStream);

      if (isShareScreen) {
        if (shareVideoRef.current) {
          shareVideoRef.current.srcObject = theRemoteStream;
        }
      } else {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = theRemoteStream;
        }
      }
      if (isShareScreen) {
        setPeerConnectionShareScreen(newPeer);
      } else {
        setPeerConnection(newPeer);
      }

      newPeer.addEventListener("iceconnectionstatechange", () => {});

      newPeer.addEventListener("icecandidate", (e) => {
        if (e.candidate) {
          if (isShareScreen) {
            socket?.emit("sendIceCandidateToSignalingServerShareScreen", {
              iceCandidate: e.candidate,
              iceUserName: userData.username,
              didIOffer: didIOfferFun,
            });
          } else {
            socket?.emit("sendIceCandidateToSignalingServer", {
              iceCandidate: e.candidate,
              iceUserName: userData.username,
              didIOffer: didIOfferFun,
            });
          }
        }
      });

      newPeer.addEventListener("track", (event) => {
        event.streams[0].getTracks().forEach((track) => {
          theRemoteStream.addTrack(track);
        });
      });

      if (offerObj) {
        // Check if peer connection is in stable state before setting remote description
        if (newPeer.signalingState === "stable") {
          try {
            if (isShareScreen && offerObj.offerShareScreen) {
              await newPeer.setRemoteDescription(offerObj.offerShareScreen);
            } else {
              await newPeer.setRemoteDescription(offerObj.offer);
            }
          } catch (error) {
            console.error("Error setting remote description:", error);
            reject(error);
            return;
          }
        } else {
          console.warn(
            "Peer connection is not in stable state. Skipping setting remote description."
          );
        }
      }

      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          newPeer.addTrack(track, mediaStream);
        });
      }

      resolve(newPeer);
    });
  };

  const reconnectAnswerer = async (offer: OfferTypeDemo) => {
    if (offer.callStatus === CallStatusEnum.IN_CALL) {
      try {
        const stream = await fetchUserMediaWithOldData(offer);
        const answerPeerConnection = await createPeerConnection({
          mediaStream: stream,
          didIOfferFun: false,
          offerObj: offer,
        });

        const answer = await answerPeerConnection.createAnswer();
        offer.answer = answer;
        offer.answerConstraints = answerConstraints;
        await answerPeerConnection.setLocalDescription(answer);
        const offerIceCandidates: RTCIceCandidate[] = await socket?.emitWithAck(
          "newAnswer",
          offer
        );
        offerIceCandidates.forEach((candidate) => {
          answerPeerConnection.addIceCandidate(candidate);
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const fetchUserMediaWithOldData = async (
    offer: OfferTypeDemo
  ): Promise<MediaStream | undefined> => {
    return new Promise(async (resolve, reject) => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: offer.answerConstraints?.audio,
          video: offer.answerConstraints?.video,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

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

  const answerOffer = async (offer: OfferTypeDemo) => {
    try {
      let mediaStream;
      if (offer.answererUserName) {
        const oldMedia = await fetchUserMediaWithOldData(offer);
        mediaStream = oldMedia;
      } else {
        const newMedia = await fetchUserMedia(true);
        mediaStream = newMedia;
      }
      const answerPeerConnection = await createPeerConnection({
        mediaStream,
        didIOfferFun: false,
        offerObj: offer,
      });

      const answer = await answerPeerConnection.createAnswer();
      offer.answer = answer;

      if (offer.answererUserName) {
        offer.answerConstraints = offer.answerConstraints;
      } else {
        offer.answerConstraints = answerConstraints;
      }
      await answerPeerConnection.setLocalDescription(answer);
      const offerIceCandidates: RTCIceCandidate[] = await socket?.emitWithAck(
        "newAnswer",
        offer
      );
      offerIceCandidates.forEach((candidate) => {
        answerPeerConnection.addIceCandidate(candidate);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const answerOfferShareScreen = async (offer: OfferTypeDemo) => {
    try {
      let mediaStream;
      if (offer.answererUserName) {
      } else {
        if (false) {
          const newMedia = await fetchDisplayMedia(true);
          mediaStream = newMedia;
        }
      }
      if (peerConnectionShareScreen) {
        peerConnectionShareScreen.onicecandidate = null;
        peerConnectionShareScreen.ontrack = null;
        peerConnectionShareScreen.close();
        setPeerConnectionShareScreen(undefined);
      }
      const answerPeerConnection = await createPeerConnection({
        mediaStream,
        didIOfferFun: false,
        offerObj: offer,
        isShareScreen: true,
      });

      const answer = await answerPeerConnection.createAnswer();
      offer.answerShareScreen = answer;

      if (offer.answererUserName) {
        offer.answerConstraints = offer.answerConstraints;
      } else {
        offer.answerConstraints = answerConstraints;
      }
      await answerPeerConnection.setLocalDescription(answer);
      const offerIceCandidates: RTCIceCandidate[] = await socket?.emitWithAck(
        "newAnswerShareScreen",
        offer
      );

      offerIceCandidates.forEach((candidate) => {
        answerPeerConnection.addIceCandidate(candidate);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserMedia = async (
    isAnswer?: boolean
  ): Promise<MediaStream | undefined> => {
    return new Promise(async (resolve, reject) => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: isAnswer ? answerConstraints.audio : offerConstraints.audio,
          video: isAnswer ? answerConstraints.video : offerConstraints.video,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

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

  const fetchDisplayMedia = async (
    isAnswer?: boolean
  ): Promise<MediaStream | undefined> => {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        if (shareVideoRef.current) {
          shareVideoRef.current.srcObject = stream;
          setLocalStream(stream);
        }
        resolve(stream);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  const createOfferEls = async (offers: OfferTypeDemo[]) => {
    const foundAnswerer = offers.find(
      (offer) => offer.answererUserName === userData.username
    );

    if (foundAnswerer) {
      answerOffer(foundAnswerer);
    }
    setOffersList(offers);
  };

  const createOfferElsShareScreen = async (offers: OfferTypeDemo[]) => {
    const foundAnswerer = offers.find(
      (offer) => offer.answererUserName === userData.username
    );

    if (foundAnswerer) {
      answerOfferShareScreen(foundAnswerer);
    }
    setOffersListShare(offers);
    // acceptShare(offers[0]);
  };

  const addAnswer = async (offer: OfferTypeDemo) => {
    if (peerConnection && peerConnection.signalingState !== "stable") {
      await peerConnection?.setRemoteDescription(offer.answer);
    }
  };

  const addAnswerShareScreen = async (offer: OfferTypeDemo) => {
    if (
      peerConnectionShareScreen &&
      peerConnectionShareScreen.signalingState !== "stable"
    ) {
      await peerConnectionShareScreen?.setRemoteDescription(
        offer.answerShareScreen
      );
    }
  };

  const addNewIceCandidate = (iceCandidate: RTCIceCandidate) => {
    peerConnection?.addIceCandidate(iceCandidate);
  };

  const addNewIceCandidateShareScreen = (iceCandidate: RTCIceCandidate) => {
    peerConnectionShareScreen?.addIceCandidate(iceCandidate);
  };

  const openAnswerModal = (offer: OfferTypeDemo) => {
    setOfferState(offer);
    setIsAnswerModalOpen(true);
  };

  const confirmCall = () => {
    call(callUser, true);
    setIsOfferModalOpen(false);
  };

  const acceptCall = () => {
    if (offerState) {
      answerOffer(offerState);
      setIsAnswerModalOpen(false);
    }
  };

  const acceptShare = (offer: OfferTypeDemo) => {
    answerOfferShareScreen(offer);
  };

  const setTwoConstraints = (
    constraints: MediaStreamConstraints,
    type: string
  ) => {
    if (type === "offer") {
      setOfferConstraints(constraints);
    } else if (type === "answer") {
      setAnswerConstraints(constraints);
    }
  };

  const restartCall = async (
    oldOffer: OfferTypeDemo,
    answererUserName: string
  ) => {
    if (isWindow) {
      try {
        const mediaStream = await fetchUserMedia(false);

        const connection: RTCPeerConnection = await createPeerConnection({
          mediaStream,
          didIOfferFun: true,
        });
        const offer = await connection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        await connection.setLocalDescription(offer);
        setDidIOffer(true);
        socket?.emit("newOffer", {
          user: answererUserName,
          offer: offer,
          offerConstraints,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const changeVideoDevice = async (data: MediaDeviceInfo) => {
    if (peerConnection) {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: data.deviceId } },
      });
      const newVideoTrack = newStream.getVideoTracks()[0];
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          localStream.removeTrack(track);
        });
        localStream.addTrack(newVideoTrack);
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
        }
      }
    }
  };

  const shareScreen = async () => {
    setIsOfferModalOpen(false);

    if (isWindow) {
      try {
        const displayMedia = await fetchDisplayMedia(false);
        if (peerConnectionShareScreen) {
          peerConnectionShareScreen.onicecandidate = null;
          peerConnectionShareScreen.ontrack = null;
          peerConnectionShareScreen.close();
          setPeerConnectionShareScreen(undefined);
        }

        const connection: RTCPeerConnection = await createPeerConnection({
          mediaStream: displayMedia,
          didIOfferFun: true,
          isShareScreen: true,
        });
        const offer = await connection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await connection.setLocalDescription(offer);
        setDidIOffer(true);
        socket?.emit("newOfferShareScreen", {
          user: callUser,
          offer: offer,
        });
      } catch (error) {
        alert(error);
        console.log(error);
      }
    }
  };

  useEffect(() => {
    socket?.off("availableOffers");
    socket?.off("newOfferAwaiting");
    socket?.off("newOfferAwaitingShareScreen");
    socket?.off("answerResponse");
    socket?.off("answerResponseShareScreen");
    socket?.off("receivedIceCandidateFromServer");
    socket?.off("receivedIceCandidateFromServerShareScreen");
    socket?.off("connectedUsers");
    socket?.off("needToReconnect");

    socket?.on("availableOffers", async (offers: OfferTypeDemo[]) => {
      createOfferEls(offers);
    });

    socket?.on("connectedUsers", (data: string[], offers: OfferTypeDemo[]) => {
      const filterSelf = data.filter((user) => userData.username !== user);
      setConnectedUsers(filterSelf);
    });
    socket?.on("newOfferAwaiting", (offer: OfferTypeDemo[]) => {
      createOfferEls(offer);
    });
    socket?.on("newOfferAwaitingShareScreen", (offer: OfferTypeDemo[]) => {
      if (peerConnection) {
        peerConnection.onicecandidate = null;
        peerConnection.ontrack = null;
        peerConnection.close();
        setPeerConnectionShareScreen(undefined);
      }
      createOfferElsShareScreen(offer);
    });
    socket?.on("answerResponse", (offer: OfferTypeDemo) => {
      addAnswer(offer);
    });

    socket?.on("answerResponseShareScreen", (offer: OfferTypeDemo) => {
      addAnswerShareScreen(offer);
    });
    socket?.on("needToReconnect", (offer: OfferTypeDemo, username: string) => {
      peerConnection?.close();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(undefined);
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
        setRemoteStream(undefined);
      }
      if (peerConnection) {
        setPeerConnection(undefined);
      }
      restartCall(offer, username);
    });
    socket?.on(
      "receivedIceCandidateFromServer",
      (iceCandidate: RTCIceCandidate) => {
        addNewIceCandidate(iceCandidate);
      }
    );

    socket?.on(
      "receivedIceCandidateFromServerShareScreen",
      (iceCandidate: RTCIceCandidate) => {
        addNewIceCandidateShareScreen(iceCandidate);
      }
    );
    return () => {
      socket?.off("needToReconnect");
      socket?.off("newOfferAwaitingShareScreen");
      socket?.off("availableOffers");
      socket?.off("answerResponse");
      socket?.off("answerResponseShareScreen");
      socket?.off("connectedUsers");
      socket?.off("receivedIceCandidateFromServer");
      socket?.off("receivedIceCandidateFromServerShareScreen");
    };
  }, [socket, peerConnection, peerConnectionShareScreen]);

  useEffect(() => {
    const getDevicesAsync = async () => {
      const devices = await getDevices();
      setVideoDeviceList(devices.videoDevices);
    };

    getDevicesAsync();
  }, [localStream]);

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex flex-col min-h-screen h-full pt-12 justify-start min-w-36 px-2 gap-4 border-r-2">
          {connectedUsers.map((user, index) => {
            return (
              <button
                key={`connected-user-${index}`}
                onClick={() => {
                  setCallUser(user);
                  setIsOfferModalOpen(true);
                }}
                className="p-2 border rounded-xl text-white"
              >
                {user}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-center w-full">
          <div className="container">
            {isWindow && (
              <p className="text-white my-5 text-2xl">
                User name: {userData.username}
              </p>
            )}
            <div className="lg:flex gap-2">
              <button className="border rounded-xl p-2 py-2 px-10 text-white mt-3">
                Hangup
              </button>
              {offersList?.map((offer, index) => {
                return (
                  <button
                    key={`offer-list-buttons-${index}`}
                    className="border rounded-xl p-2 py-2 px-10 bg-green-900 text-white mt-3"
                    onClick={() => openAnswerModal(offer)}
                  >
                    Answer {offer.offererUserName}
                  </button>
                );
              })}

              {offersListShare?.map((offer, index) => {
                return (
                  <button
                    key={`offer-list-buttons-${index}`}
                    className="border rounded-xl p-2 py-2 px-10 bg-green-900 text-white mt-3"
                    onClick={() => acceptShare(offer)}
                  >
                    Answer Share From {offer.offererUserName}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex gap-5">
              {videoDeviceList.map((device, index) => {
                return (
                  <Button
                    onClick={() => changeVideoDevice(device)}
                    key={`video-device-${index}`}
                  >
                    {device.label}
                  </Button>
                );
              })}
            </div>
            <div className=" flex flex-col gap-2 justify-center py-10">
              <div className="flex gap-3">
                <video
                  className="bg-slate-800 rounded-md w-[50%]"
                  autoPlay
                  playsInline
                  ref={localVideoRef}
                  muted
                />
                <video
                  className="bg-slate-800 rounded-md w-[50%]"
                  autoPlay
                  playsInline
                  ref={remoteVideoRef}
                />
              </div>
              <div className="flex gap-3">
                <video
                  className="bg-slate-800 rounded-md w-full"
                  autoPlay
                  playsInline
                  ref={shareVideoRef}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {isAnswerModalOpen && (
        <AnswerModal
          constraints={answerConstraints}
          closeModal={setIsAnswerModalOpen}
          setConstraints={setTwoConstraints}
          acceptCall={acceptCall}
        />
      )}
      {isOfferModalOpen && (
        <AnswerModal
          constraints={offerConstraints}
          isOffer
          closeModal={setIsOfferModalOpen}
          setConstraints={setTwoConstraints}
          acceptCall={confirmCall}
          shareScreen={shareScreen}
        />
      )}
    </>
  );
}
