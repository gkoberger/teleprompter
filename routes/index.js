const express = require('express');
const router = express.Router();
const request = require('request');
const cheerio = require('cheerio');
const marked = require('marked');

router.use((req, res, next) => {
  req.tele = req.db.collection('tele');
  next();
});

/* GET home page. */
/*
router.get('/', (req, res, next) => {
  req.tele.find({}).toArray(function (err, results) {
    res.render('index', { title: 'Home' });
  });
});
*/

var DEBUG = true;
function loadFile(file, cb) {
  if (DEBUG) {
    var fs = require('fs');
    var contents = fs.readFileSync('./html').toString();
    cb(contents);
    return;
  }

  request.get(file, function(err, data) {
    cb(data.body);
  })
}

function clean(text) {
  text = text.replace(/\u200B/g, ''); // zero space width character
  return text;
}

router.get('/', (req, res, next) => {
  req.tele
    .find({})
    .sort({ created: -1 })
    .limit(1)
    .toArray((err, latest) => {
      const paper = latest[0].url;
      loadFile(paper, function (html) {
        const $ = cheerio.load(html);

        var TurndownService = require('turndown');

        var turndownService = new TurndownService();
        var all = turndownService.turndown($('.ace-editor').html());
        all = all.split(/[\n\r]/);
        var title = clean(all.shift().trim());
        var markdown = clean(all.join('\n'));

        res.render('index', { title: 'Home', title, markdown, marked, paper });
      });
    });
});

router.post('/', (req, res, next) => {
  req.tele.insert({
    created: new Date(),
    url: req.body.url,
  });
  res.redirect('/');
});

module.exports = router;
