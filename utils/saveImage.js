const crypto = require('crypto');
const { bucket } = require('./storage');

const decodeBase64Image = (dataString) => {
  const matches = dataString.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

  const response = {};
  if (matches?.length !== 3) {
    return new Error('Invalid input string');
  }
  // eslint-disable-next-line prefer-destructuring
  response.type = matches[1];
  // eslint-disable-next-line new-cap
  response.data = new Buffer.from(matches[2], 'base64');
  return response;
};

const saveImage = async (image, folder, oldImageUrl) => {
  const imageTypeRegularExpression = /\/(.*?)$/;

  const seed = crypto.randomBytes(20);
  const uniqueSHA1String = crypto.createHash('sha1').update(seed).digest('hex');

  const imageBuffer = decodeBase64Image(image);
  const imageTypeDetected = imageBuffer.type?.match(imageTypeRegularExpression);
  let filename = `${uniqueSHA1String}.`;
  if (imageTypeDetected !== undefined) filename += imageTypeDetected[1];

  let options = {
    destination: `${folder}/${filename}`,
    metadata: {
      contentType: imageBuffer.type,
    },
  };

  if (imageBuffer.data === undefined) return null;

  let [file] = await bucket().upload(imageBuffer.data, options);

  console.log(file, imageBuffer);

  const imagePath = await file.getSignedUrl({
    action: 'read',
    expires: '03-17-2025',
  });

  if (oldImageUrl) {
    try {
      const oldImage = oldImageUrl.split('/').at(-1);
      console.log(oldImage);
      await bucket().file(`${folder}/${oldImage}`).delete();
    } catch (e) {
      console.log(e);
    }
  }

  return imagePath;
};

exports.saveImage = saveImage;
