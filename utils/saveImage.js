const crypto = require('crypto');
const AWS = require('aws-sdk');

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

const saveImage = async (image, oldImageUrl) => {
  const folder = 'pluto-uploads';

  const s3 = new AWS.S3({
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });

  const imageTypeRegularExpression = /\/(.*?)$/;

  const seed = crypto.randomBytes(20);
  const uniqueSHA1String = crypto.createHash('sha1').update(seed).digest('hex');

  const imageBuffer = decodeBase64Image(image);
  const imageTypeDetected = imageBuffer.type?.match(imageTypeRegularExpression);
  let filename = `${uniqueSHA1String}.`;
  if (imageTypeDetected !== undefined) filename += imageTypeDetected[1];

  let options = {
    Bucket: folder,
    Key: filename,
    Body: imageBuffer.data,
    ContentType: imageBuffer.type,
  };

  if (imageBuffer.data === undefined) return null;

  await s3.upload(options).promise();

  const imagePath = await s3.getSignedUrlPromise('getObject', {
    Bucket: folder,
    Key: filename,
  });

  if (oldImageUrl) {
    try {
      const oldImageKey = oldImageUrl.split('/').pop().split('?')[0];
      await s3.deleteObject({
        Bucket: folder,
        Key: oldImageKey,
      });
    } catch (e) {
      console.log(e);
    }
  }

  return imagePath;
};

exports.saveImage = saveImage;
