const express = require('express');
const router = express.Router();
const request = require('request');
const cheerio = require('cheerio');
const marked = require('marked');
const _ = require('lodash');

let teleCache = {
  title: 'Example Teleprompter',
  markdown:
    'Enter in a **Dropbox Paper** URL to see this in action!\n\nThe text will show up here. You can move the highlighted text using arrow keys.',
};

router.use((req, res, next) => {
  req.multi = process.env.MULTI === 'true';

  if (req.db) {
    req.tele = req.db.collection('tele');
  } else {
    if (req.multi) {
      console.log("You need a DB for multi mode!");
      process.exit(1);
    }
  }

  next();
});

router.post('/setup', (req, res, next) => {
  if (!req.body.email) return res.send('/');
  if (!req.body.email.match(/@/)) return res.send('/');

  res.cookie('email', req.body.email, { maxAge: 900000, httpOnly: true });
  res.redirect('/');
});

router.use((req, res, next) => {
  if (!req.multi) {
    res.clearCookie('email');
  }

  if (req.multi && !req.cookies.email) {
    return res.render('setup');
  }

  if (req.cookies.email === 'single') {
    res.clearCookie('email');
    return res.redirect('/');
  }

  res.locals.multi = req.multi;
  res.locals.email = req.cookies.email || 'single';

  next();
});

router.get('/logout', (req, res, next) => {
  res.clearCookie('email');
  return res.redirect('/');
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
  if (!tele.markdown) tele.markdown = '';
  tele.markdown = tele.markdown.replace(
    /\[([-_\w]*):([-_\w]*)\]/g,
    '<span class="command">$1:$2</span>',
  );
  return tele;
}

router.get('/', (req, res, next) => {
  if (req.db) {
    req.tele
      .find({
        email: req.multi ? req.cookies.email : 'single',
      })
      .sort({ created: -1 })
      .limit(1)
      .toArray((err, prompts) => {
        const tele = convert(prompts[0] || teleCache);
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
    return res.send('You need a valid Dropbox Paper URL!');
  }

  loadFile(paper, function (html) {
    const $ = cheerio.load(html);

    /*
    var TurndownService = require('turndown');

    var turndownService = new TurndownService();
    var all = turndownService.turndown($('.ace-editor').html());
    */
    var json = JSON.parse($('#client-vars-json-tag').html());
    var pad = _.find(Object.keys(json.initialDataStoreState.data), i =>
      i.match(/pad/),
    );

    var all =
      json.initialDataStoreState.data[pad].collab_client_vars.collabBaseState
        .zatext.text['0'];

    all = all.replace(/[\n\r]+/g, '\n');
    all = all.replace(/\n\*+/g, '\n# ');
    all = all.trim().split(/\n/);

    var title = clean(all.shift().trim());
    var markdown = clean(all.join('\n\n'));

    if (!title || !markdown) return res.send('oh no, an error!');

    const tele = {
      created: new Date(),
      url: req.body.url,
      title,
      markdown,
      email: req.multi ? req.cookies.email : 'single',
    };

    if (req.db) {
      req.tele.insert(tele);
    } else {
      teleCache = tele;
    }

    req.app.io.to(req.multi ? req.cookies.email : 'single').emit('restart', {});

    res.redirect('/');
  });
});

module.exports = router;
