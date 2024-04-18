const Jimp = require("jimp");
const fs = require("fs");

const image = new Jimp(256, 256, 0x000000ff, (err, image) => {
  if (err) throw err;

  image.write("output.png", (err) => {
    if (err) throw err;
    console.log("Image created");
  });
});

console.log(image);
