const fs = require("fs")
const pjson = require('./package.json');
var moment = require('moment-timezone');
const webpack = require("webpack")
const path = require('path')
const { i18n } = require('./next-i18next.config');
const internalNodeModulesRegExp = /@zeit(?!.*node_modules)/
const externalNodeModulesRegExp = /node_modules(?!\/@zeit(?!.*node_modules))/
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');
var version="0.0.0";
var buildVersion="";
version = pjson.version
buildVersion ="PROD#" + moment().tz('Asia/Bangkok').format("YY.MM.DD HH:mm");
module.exports = {
  poweredByHeader: false,
  generateEtags: false,
  throwIfNamespace: false,
  webpack5: false,
  i18n,
  webpack: (config, { dev, isServer, defaultLoaders }) => {
    config.resolve.symlinks = false
    config.externals = config.externals.map(external => {
      if (typeof external !== "function") return external
      return (ctx, req, cb) => (internalNodeModulesRegExp.test(req) ? cb() : external(ctx, req, cb))
    })
    config.module.rules.push({
      test: /\.+(js|jsx)$/,
      loader: defaultLoaders.babel,
      include: [internalNodeModulesRegExp]
    })
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.(js|ts)x?$/,
      },
      use: ['@svgr/webpack'],
    });
    config.plugins = config.plugins || []
    config.plugins = [
        ...config.plugins,
        new MomentTimezoneDataPlugin({
            matchZones: /^Asia/
        })
    ]
    return config
  },
  webpackDevMiddleware: config => {
    const ignored = [config.watchOptions.ignored[0], externalNodeModulesRegExp]
    config.watchOptions.ignored = ignored
    return config
  },
  env: {
    version: version,
    buildVersion : buildVersion,

  },

  serverRuntimeConfig: { // Will only be available on the server side
    SECRET_KEY :  process.env.SECRET_KEY ,
    APP_ENV : process.env.NODE_ENV,
    API_ENDPOINT : process.env.API_ENDPOINT,
    SOCKET_ENDPOINT :  process.env.SOCKET_ENDPOINT,
    NOTIFY_ENDPOINT : process.env.NOTIFY_ENDPOINT,
    NEXT_PUBLIC_APP_ENV : process.env.NODE_ENV,
  },
  publicRuntimeConfig: { // Will be available on both server and client
    SECRET_KEY :  process.env.SECRET_KEY ,
    APP_ENV : process.env.NODE_ENV,
    API_ENDPOINT : process.env.API_ENDPOINT,
    SOCKET_ENDPOINT :  process.env.SOCKET_ENDPOINT,
    NOTIFY_ENDPOINT: process.env.NOTIFY_ENDPOINT,
    NEXT_PUBLIC_APP_ENV : process.env.NODE_ENV,
  }

}
