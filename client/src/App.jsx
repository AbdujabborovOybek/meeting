import "./App.css";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
const socket = io("https://abdujabborov.uz");

function App() {
  const [start, setStart] = useState(false);
  const [myvideo, setMyvideo] = useState(null);

  // handle start stream and stop stream
  const handleStream = () => {
    if (!start) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          let video = document.getElementById("video");
          video.srcObject = stream;
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      let video = document.getElementById("video");
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
    setStart(!start);
  };

  useEffect(() => {
    let video = document.getElementById("video");
    setMyvideo(video);
  }, []);

  useEffect(() => {
    if (myvideo) {
      myvideo.addEventListener("play", () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = myvideo.videoWidth;
        canvas.height = myvideo.videoHeight;
        setInterval(() => {
          context.drawImage(myvideo, 0, 0, canvas.width, canvas.height);
          let data = canvas.toDataURL("image/jpeg");
          socket.emit("camera-data", data);
        }, 100);
      });
    }
  }, [myvideo]);

  // get data from socket server and set it to state
  useEffect(() => {
    socket.on("camera-data", (data) => {
      const other_user = document.querySelector(".other_user");
      other_user.innerHTML = `<img src="${data}" alt="other user" />`;
    });
  }, []);

  return (
    <div className="App">
      <div className="my_video">
        <video
          id="video"
          width="200"
          height="200"
          autoPlay
          style={{
            backgroundColor: "black",
          }}
        ></video>
        <button onClick={handleStream}>{start ? "Stop" : "Start"}</button>
      </div>

      <div className="other_user"></div>
    </div>
  );
}

export default App;
