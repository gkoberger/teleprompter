const express = require('express');
const router = express.Router();
const request = require('request');
const cheerio = require('cheerio');
const marked = require('marked');
const _ = require('lodash');

let teleCache = {
  title: 'Example Teleprompter',
  markdown: 'Enter in a **Dropbox Paper** URL to see this in action!\n\nThe text will show up here. You can move the highlighted text using arrow keys.',
};

router.use((req, res, next) => {
  if (req.db) {
    req.tele = req.db.collection('tele');
  }
  next();
});

function loadFile(file, cb) {
  request.get(file, function (err, data) {
    cb(data.body);
  });
}

function clean(text) {
  text = text.replace(/\\/g, ''); // Rogue escape characters
  text = text.replace(/\u200B/g, ''); // zero space width character

  return text;
}

function convert(tele) {
  tele.markdown = tele.markdown.replace(/\[([-_\w]*):([-_\w]*)\]/g, '<span class="command">$1:$2</span>');
  return tele;
}

router.get('/', (req, res, next) => {
  if (req.db) {
    req.tele
      .find({})
      .sort({ created: -1 })
      .limit(1)
      .toArray((err, prompts) => {
        const tele = convert(prompts[0]);
        res.render('index', { title: tele.title, tele, marked });
      });
  } else {
    const tele = teleCache;
    res.render('index', { title: tele.title, tele, marked });
  }
});

router.post('/', (req, res, next) => {
  const paper = req.body.url;

  if (!paper.match(/paper.dropbox/)) {
    return res.send("You need a valid Dropbox Paper URL!");
  }

  loadFile(paper, function (html) {
    const $ = cheerio.load(html);

    /*
    var TurndownService = require('turndown');

    var turndownService = new TurndownService();
    var all = turndownService.turndown($('.ace-editor').html());
    */
    var json = JSON.parse($('#client-vars-json-tag').html());
    var pad = _.find(Object.keys(json.initialDataStoreState.data), (i) => i.match(/pad/));;

    var all = json.initialDataStoreState.data[pad].collab_client_vars.collabBaseState.zatext.text['0'];

    all = all.replace(/[\n\r]+/g, '\n');
    all = all.replace(/\n\*+/g, '\n# ');
    all = all.split(/\n/);

    console.log(all);

    var title = clean(all.shift().trim());
    var markdown = clean(all.join('\n\n'));

    if (!title || !markdown) return res.send('oh no, an error!');

    const tele = {
      created: new Date(),
      url: req.body.url,
      title,
      markdown,
    };

    if (req.db) {
      req.tele.insert(tele);
    } else {
      teleCache = tele;
    }

    req.app.io.emit('restart', {});

    res.redirect('/');
  });
});

module.exports = router;
