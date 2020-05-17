const fetch = require('node-fetch');
const request = require('request');
const config = require('./config');
const fs = require('fs');
const Twit = require('twit');

let jsondata;
const T = new Twit(config.keys);

function giphy() {
  fetch(`http://api.giphy.com/v1/gifs/random?&api_key=${config.api}`)
    .then(function(u) {
      return u.json();
    }).then(
      function(json) {
        jsondata = json;
        download(jsondata.data.image_original_url, 'random.gif')
      }
    )
}

function download(url, filename) {
  request.head(url, downloading);

  function downloading(err, res, body) {
    request(url).pipe(fs.createWriteStream(filename)).on('close', finished);
  }

  function finished() {
    const b64content = fs.readFileSync('random.gif', {
      encoding: 'base64'
    });
    T.post('media/upload', {
      media_data: b64content
    }, uploaded);
  }
}

function uploaded(err, data, response) {
  const mediaIdStr = data.media_id_string;
  const params = {
    status: jsondata.data.title,
    media_ids: [mediaIdStr]
  }
  T.post('statuses/update', params, tweeted);
};

function tweeted(err, data, response) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Success: ${data.text}`);
  }
};

giphy();
