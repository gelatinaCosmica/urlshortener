require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
})

let Url = mongoose.model('Url', urlSchema)


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

let responseObject = {}

app.post('/api/shorturl', (req, res) => {
  let inputUrl = req.body.url

  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)

  if (!inputUrl.match(urlRegex)) {
    response.json({ error: 'Invalid URL' })
    return
  }

  responseObject['original_url'] = inputUrl

  let inputShort = 1

  Url.findOne({})
    .sort({ short: 'desc' })
    .exec((error, result) => {
      if (!error && result != undefined) {
        inputShort = result.short_url + 1
      }
      if (!error) {
        Url.findOneAndUpdate(
          { original_url: inputUrl },
          { original_url: inputUrl, short_url: inputShort },
          { new: true, upsert: true },
          (error, savedUrl) => {
            if (!error) {
              responseObject['short_url'] = savedUrl.short_url
              res.json(responseObject)
            }
          }
        )
      }
    })
})

app.get('/api/shorturl/:input', (req, res) => {
  let input = req.params.input

  Url.findOne({ short_url: input }, (error, result) => {
    if (!error && result != undefined) {
      res.redirect(result.original_url)
    } else {
      res.json('URL not Found')
    }
  })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
