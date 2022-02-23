/* eslint-disable no-return-await */
const ironSession = require('next-iron-session');

const session = ironSession.ironSession({
  cookieName: 'bbl/procure-to-pay',
  password: process.env.SECRET_COOKIE_PASSWORD || '50945c81-3a54-4bc8-bad4-6752e02f0e8a',
  // if your localhost is served on http:// then disable the secure flag
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
});

const next = require('next');
const express = require('express');

/* Security Middleware - Start */
const serverCors = require('cors');
const serverXssProtection = require('x-xss-protection');
const cookieParser = require('cookie-parser');
const hsts = require('hsts');
const frameguard = require('frameguard');
const dnsPrefetchControl = require('dns-prefetch-control');
// const validateToken = require('../services/validateToken');

/* Security Middleware - End */

let mockupLogin = require('./mockup/login');

const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();
// const { parse } = require('url');
const corsOptions = {
  origin: process.env.APP_HOST,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.prepare().then(async () => {
  const server = express();

  // server.register(serverExpress);
  server.use(serverCors(corsOptions));
  server.use(serverXssProtection());
  server.use(cookieParser());
  server.use(
    hsts({
      maxAge: 15552000,
      includeSubDomains: true,
    }),
  );
  server.use(frameguard({ action: 'sameorigin' }));
  server.use(dnsPrefetchControl({ allow: false }));
  // server.use(validateToken(server,handle));
  server.use(session);
  mockupLogin(server, handle);

  server.get('*', async (req, res) => {
    await handle(req, res);
  });

  server.post('*', async (req, res) => {
    await handle(req, res);
  });



  // server.post('*', async (res,req) => {
  //   console.log("70");
  //   const parsedUrl = parse(req.url, true);
  //   const { pathname, query } = parsedUrl;
  //   if (pathname === "/login/") {
  //     app.render(req, res, '/dashboard',{ ...query, name: "test"})
  //   }
  //   console.log("69");
  //   await handle(req, res,parsedUrl);
  // });

  // const http = await createServer(async (req, res) => {
  //   // Be sure to pass `true` as the second argument to `url.parse`.
  //   // This tells it to parse the query portion of the URL.
  //   const parsedUrl = await parse(req.url, true);
  //   // const { pathname, query } = parsedUrl;

  //   await handle(req, res, parsedUrl);
  //   // if (pathname === '/a') {
  //   //   app.render(req, res, '/a', query)
  //   // } else if (pathname === '/b') {
  //   //   app.render(req, res, '/b', query)
  //   // } else {
  //   //   handle(req, res, parsedUrl)
  //   // }
  // });
  server.listen(process.env.APP_PORT, (err) => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`> Ready on ${process.env.APP_HOST}`);
  });
});
