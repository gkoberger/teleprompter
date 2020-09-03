const express = require('express');
const router = express.Router();
const request = require('request');
const cheerio = require('cheerio');
const marked = require('marked');

router.use((req, res, next) => {
  req.tele = req.db.collection('tele');
  next();
});

function loadFile(file, cb) {
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
    .toArray((err, prompts) => {
      const tele = prompts[0];
      res.render('index', { title: tele.title, tele, marked });
    });
});

router.post('/', (req, res, next) => {
  const paper = req.body.url;
  loadFile(paper, function (html) {
    const $ = cheerio.load(html);

    var TurndownService = require('turndown');

    var turndownService = new TurndownService();
    var all = turndownService.turndown($('.ace-editor').html());
    all = all.split(/[\n\r]/);
    var title = clean(all.shift().trim());
    var markdown = clean(all.join('\n'));

    if (!title || !markdown) return res.send('oh no, an error!');

    req.tele.insert({
      created: new Date(),
      url: req.body.url,
      title,
      markdown,
    });
    res.redirect('/');
  });
});

module.exports = router;
