import { io } from "socket.io-client";
import { useRef, useEffect } from "react";
import { FiVideo, FiVideoOff } from "react-icons/fi";
import { GrUpdate } from "react-icons/gr";

import "./Meet.css";
const { RTCPeerConnection } = window;

const urls = ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"];
const configuration = { iceServers: [{ urls }], iceCandidatePoolSize: 10 };

const options = { transports: ["websocket"] };
const socket = io("wss://sandwichpark.ru/", options);

let pc;
let localStream;
let startButton;
let hangupButton;
let remoteVideo;
let localVideo;

socket.on("message", (e) => {
  if (!localStream) return;
  if (e.type === "offer") return handleOffer(e);
  if (e.type === "answer") return handleAnswer(e);
  if (e.type === "candidate") return handleCandidate(e);
  if (e.type === "ready") return makeCall();
  if (e.type === "bye") return hangup();
});

async function makeCall() {
  try {
    pc = new RTCPeerConnection(configuration);
    pc.onicecandidate = (e) => {
      const message = { type: "candidate", candidate: null };
      if (e.candidate) {
        message.candidate = e.candidate.candidate;
        message.sdpMid = e.candidate.sdpMid;
        message.sdpMLineIndex = e.candidate.sdpMLineIndex;
      }
      socket.emit("message", message);
    };

    pc.ontrack = (e) => (remoteVideo.current.srcObject = e.streams[0]);
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    const offer = await pc.createOffer();
    socket.emit("message", { type: "offer", sdp: offer.sdp });
    await pc.setLocalDescription(offer);
  } catch (e) {
    console.log(e);
  }
}

async function handleOffer(offer) {
  if (pc) return;
  try {
    pc = new RTCPeerConnection(configuration);
    pc.onicecandidate = (e) => {
      const message = { type: "candidate", candidate: null };
      if (e.candidate) {
        message.candidate = e.candidate.candidate;
        message.sdpMid = e.candidate.sdpMid;
        message.sdpMLineIndex = e.candidate.sdpMLineIndex;
      }
      socket.emit("message", message);
    };
    pc.ontrack = (e) => (remoteVideo.current.srcObject = e.streams[0]);
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    socket.emit("message", { type: "answer", sdp: answer.sdp });
    await pc.setLocalDescription(answer);
  } catch (e) {
    console.log(e);
  }
}

async function handleAnswer(answer) {
  if (!pc) return console.log("no peerconnection");
  try {
    await pc.setRemoteDescription(answer);
  } catch (e) {
    console.log(e);
  }
}

async function handleCandidate(candidate) {
  try {
    if (!pc) return console.log("no peerconnection");
    if (!candidate) await pc.addIceCandidate(null);
    if (candidate.candidate) await pc.addIceCandidate(candidate);
  } catch (e) {
    console.log(e);
  }
}

async function hangup() {
  if (pc) {
    pc.close();
    pc = null;
  }
  localStream.getTracks().forEach((track) => track.stop());
  localStream = null;
  startButton.current.disabled = false;
  hangupButton.current.disabled = true;
}

export const Meet = () => {
  startButton = useRef(null);
  hangupButton = useRef(null);
  localVideo = useRef(null);
  remoteVideo = useRef(null);
  useEffect(() => {
    hangupButton.current.disabled = true;
  }, []);

  const startB = async () => {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { echoCancellation: true },
      });
      localVideo.current.srcObject = localStream;
    } catch (err) {
      console.log(err);
    }

    startButton.current.disabled = true;
    hangupButton.current.disabled = false;
    socket.emit("message", { type: "ready" });
  };

  const hangB = async () => {
    hangup();
    socket.emit("message", { type: "bye" });
  };

  const handleUpdate = async () => {
    window.location.reload();
  };

  return (
    <>
      <main className="meet">
        <video
          ref={localVideo}
          autoPlay
          className="meet-local"
          src=""
          muted
        ></video>
        <video
          ref={remoteVideo}
          autoPlay
          className="meet-remote"
          src=""
        ></video>

        <div className="actions">
          <button
            className="btn-item btn-start"
            ref={startButton}
            onClick={startB}
          >
            <FiVideo />
          </button>
          <button
            className="btn-item btn-end"
            ref={hangupButton}
            onClick={hangB}
          >
            <FiVideoOff />
          </button>
        </div>

        <button className="btn-update" onClick={handleUpdate}>
          <GrUpdate />
        </button>
      </main>
    </>
  );
};
