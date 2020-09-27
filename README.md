This will let you turn any Dropbox Paper doc into a teleprompter. You can control it from a computer, and view it on an iPad.

If you see this and want to use it, create an Issue and I can fix the code up a bit so anyone can use it :)

# Trying it out

If you don't want to install it locally, you can play with it at https://tele.gkoberger.com

(It asks for an email, but that's only so there's a unique connection and there's no overlap! Any random string, as long as it's the same across all devices, will do.)

# Installing locally

```
$ git clone git@github.com:gkoberger/teleprompter.git
$ cd teleprompter
$ npm install
$ npm start
```

# Use a Database

Right now, it saves the Paper doc in memory. If you want this to work across app restarts, you'll need an `.env` file that contains the following Mongo connection details:

```
DB_USER=...
DB_PASS=...
DB_URL=...
```

# Multi-user

By default, this works for one person at a time. If you want it to be multi-user (useful for if you're letting lots of people use this, like the demo version), add this to your `.env` file:

```
MULTI=true
```

(To use the MULTI version, you need to connect to a database)

# Connect third party apps

  1. Run [this code snippet](https://github.com/gkoberger/teleprompter/tree/master/connection_demo) (Node) locally on your computer, with the config filled in.
  2. Put `[command:value]` into your Paper docs. Using the code, you'll get `{ command: '', value: ''}` when it's hit.

Let me know if this doesn't make sense :)

