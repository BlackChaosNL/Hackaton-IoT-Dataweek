// Require dependancies
const express = require("express"),
  bp = require("body-parser"),
  cors = require("cors"),
  fs = require("fs"),
  path = require('path'),
  serveStatic = require("serve-static"),
  mongoose = require("mongoose"),
  data = require("./models/data"),
  dotenv = require('dotenv').config({
    path: path.resolve(process.cwd() + "/src/environment", '.env')
  }),
  to = require("./lib/ttn_observables"),
  app = express();

const port = process.env.PORT || 3000,
  client = process.env.ttnclient || null,
  password = process.env.ttnkey || null,
  url = process.env.database || null,
  controllerDirectory = "./controllers/";

// Connect to database to enable
mongoose.connect(url, {
  useNewUrlParser: true
});

// Accept JSON and disable urlencoding.
app.use(bp.json());
app.use(bp.urlencoded({
  extended: false
}));

// Enable Cross Origin Requests and set to allow from outside of the local domain.
app.use(cors());
app.options("*", cors());

// Load controllers from ./controllers and make them active routes.
fs.readdirSync(path.join(__dirname, "./controllers")).forEach(file => {
  app.use("/" + file.split(".")[0],
    require(controllerDirectory + file.split(".")[0]));
});

// Serve ReDoc as single page application, employer didn't need more.
app.get("/", express.static(path.join(__dirname, 'static')));
app.use(serveStatic('public/html', {
  'index': ['default.html', 'default.htm']
}))

// If page cannot be found, throw a 404.
app.use((req, res, next) => {
  res.status(404).json({
    ok: false,
    message: "The endpoint you requested was not found"
  });
  next();
});

// Start the default
to.startOne(client, password);
// Start the user configured TTN observables
to.startAll();

app.listen(port, () => console.log("Starting the API on port " + port));
module.exports = app;