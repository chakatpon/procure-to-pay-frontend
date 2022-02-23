/* eslint-disable no-undef */
require("dotenv").config();
const express = require("express");
var _ = require('lodash');
const bodyParser = require("body-parser");
const axios = require('axios');
const dev = process.env.NODE_ENV !== "production";
const app_port = process.env.PORT || process.env.APP_PORT || 3000;
const next = require("next");
const app = next({dev});
const handle = app.getRequestHandler();
const {parse} = require("url");
var multer = require("multer");
var upload = multer({dest: "uploads/"});
app.prepare().then(() => {
  const server = express();
  server.use(bodyParser.urlencoded({extended: true}));
  server.use(bodyParser.json());
  server.get("*", (req, res) => {
    return handle(req, res);
  });
  server.post("*", upload.none(), (req, res) => {
    return app.render(req, res, req.path, req.body);
  });



  server.listen(app_port, (err) => {
    if (err) throw err;
    console.log("Server ready on http://localhost:" + app_port);
  });
});
