const
  app = require('express')(),
  aws = require('aws-sdk'),
  dotenv = require('dotenv').load({silent: true})

  // AWS S3
  const S3_BUCKET = process.env.S3_BUCKET;
  /*
   * Respond to GET requests to /sign-s3.
   * Upon request, return JSON containing the temporarily-signed S3 request and
   * the anticipated URL of the image.
   */
  app.get('/sign-s3', function(req, res){
    console.log("sign-s3 hit");
    const s3 = new aws.S3();
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Expires: 60,
      ContentType: fileType,
      ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, function(err, data){
      if(err){
        console.log(err);
        return res.end();
      }
      const returnData = {
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
      };
      res.write(JSON.stringify(returnData));
      res.end();
    });
  });

  app.get('/test', function(req, res){
    res.json({message: 'fileUploads hit'})
  })

 module.exports = app
