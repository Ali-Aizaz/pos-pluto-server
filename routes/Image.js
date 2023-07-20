const { S3 } = require('aws-sdk');

const { protect } = require('../middleware/Protect');

const router = require('express').Router();

router.get('/image/:image', protect, async (req, res) => {
  const s3 = new S3({
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });

  const imagePath = s3.getSignedUrl('getObject', {
    Bucket: 'pluto-uploads',
    Key: req.params.image,
  });

  return res.json(imagePath);
});

module.exports = router;
