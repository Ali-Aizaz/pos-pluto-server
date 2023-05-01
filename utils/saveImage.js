const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const saveImage = (image, folder, oldImageUrl) => {
  const directory = path.join(__dirname, '..', `static/${folder}/`);
  const imageTypeRegularExpression = /\/(.*?)$/;

  const seed = crypto.randomBytes(20);
  const uniqueSHA1String = crypto.createHash('sha1').update(seed).digest('hex');

  const imageBuffer = decodeBase64Image(image);
  const imageTypeDetected = imageBuffer.type?.match(imageTypeRegularExpression);
  let filename = uniqueSHA1String + '.';
  if (imageTypeDetected !== undefined)
    filename = filename + imageTypeDetected[1];

  fs.mkdirSync(directory, { recursive: true });
  if (imageBuffer.data !== undefined)
    fs.writeFileSync(directory + filename, imageBuffer.data);

  const imagePath =
    process.env.SERVER_ROOT_URI + `/static/${folder}/` + filename;

  if (oldImageUrl) {
    try {
      const oldImage = oldImageUrl.split('/').at(-1);
      console.log(oldImage);
      fs.unlinkSync(directory + oldImage);
    } catch {}
  }

  return imagePath;
};

const decodeBase64Image = (dataString) => {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const response = {};
  if (matches?.length !== 3) {
    return new Error('Invalid input string');
  }
  response.type = matches[1];
  response.data = new Buffer.from(matches[2], 'base64');
  return response;
};

exports.saveImage = saveImage;
