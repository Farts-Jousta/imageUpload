const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config()

const app = new express();
const PORT = 5700

// we say that we're using in memory storage for multer
const storage = multer.memoryStorage()

// we say that these are the fields we're getting from our form
const fields = [
  {name: 'name'},
  {name: 'image'}
]

// we create our middleware mutler function and store it in a variable we can pass to the endpoint
const upload = multer({ storage: storage }).fields(fields);

// we need cors for the different ports
app.use(cors())

// add s3 credentials using .env
let s3credentials = new AWS.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY
});

// our endpoints, eventually split into routes
app.post('/upload', upload, (req, res) => {
    const { name } = req.body
    const { image } = req.files
    const uniqueValue = 'harrisonmalone'
    const name = Buffer.from(`${uniqueValue}${image[0].originalname}`).toString('base64')
    let fileParams = {
      Bucket: process.env.BUCKET,
      Body: image[0].buffer,
      Key: name,
      ACL: 'public-read',
      ContentType: image[0].mimetype
    }
    s3credentials.upload(fileParams, (err, data) => {
      if (err) {
        res.send('you got an error')
      } else {
        console.log(data.Location)
        res.send('all good')
      }
    })
  })
  


app.listen(PORT, () => console.log(`PORT ${PORT} is live!`))
