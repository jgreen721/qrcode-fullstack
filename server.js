const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 4455;
const { PassThrough, Duplex } = require("stream");
const fs = require("fs");

app.use(express.static("public"));

server.listen(PORT, console.log(`Listening in on port ${PORT}`));

class Throttle extends Duplex {
  constructor(delay) {
    super();
    this.delay = delay;
  }
  _read() {}

  _write(chunks, enc, callback) {
    setTimeout(callback, this.delay);
    this.push(chunks);
  }
}
let throttle;
let textThrottle;
let handleImgChunks;
let handleCharacterBits;
let fileSize;

io.on("connection", (socket) => {
  socket.on("get-data", () => {
    throttle = new Throttle(500);
    textThrottle = new Throttle(100);
    handleImgChunks = new PassThrough();
    fileSize = fs.statSync("./assets/image-qr-code.png").size;

    handleImageStream(socket, fileSize);
    let chunkTotal = 0;
    handleImgChunks.on("data", (chunks) => {
      chunkTotal += chunks.length;
      console.log(chunkTotal);
      socket.emit("img-chunks", chunks);
      if (chunkTotal == fileSize) {
        socket.emit("img-end");
      }
    });
  });
  socket.on("get-title", () => {
    handleCharacterBits = new PassThrough();

    handleDataStream(socket);
    let isValid = false;
    let isTitle = true;

    handleCharacterBits.on("data", (chunk) => {
      if (chunk == "}") {
        isValid = false;
        isTitle = false;
      }
      if (isValid) {
        let character = String(chunk);
        if (isTitle) {
          if (character != '"') {
            socket.emit("title", {
              character: String(chunk),
              animation: randomAnimation(),
            });
          }
        } else {
          if (character != '"') {
            socket.emit("blurb", {
              character: String(chunk),
              animation: randomAnimation(),
            });
          }
        }
      }
      if (chunk == ":") {
        isValid = true;
      }
    });
  });
});

let animations = ["clear-blur"];

function randomAnimation() {
  return animations[(Math.random() * animations.length) | 0];
}

function handleDataStream(socket) {
  const readStream = fs.createReadStream("./assets/data.json", {
    highWaterMark: 1,
  });

  readStream.pipe(textThrottle).pipe(handleCharacterBits);
}

function handleImageStream(socket, fileSize) {
  const imgReadStream = fs.createReadStream("./assets/image-qr-code.png", {
    highWaterMark: 500,
  });
  socket.emit("file-size", fileSize);
  imgReadStream.pipe(throttle).pipe(handleImgChunks);
}
