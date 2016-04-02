'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const path = require('path');

function Service() {}

Service.prototype.start = function (options, routes, next) {
  options = options || {};
  if (!options.name || typeof options.name !== 'string')
    return next(new Error('Name missing'));
  this._name = options.name;
  this._port = parseInt(options.port) || 3000;
  this._host = options.host || 'localhost';
  this._routes = routes || [];
  this._rootPath = options.rootPath || path.resolve('./../../../');
  this._initialized = true;
  return this.web(next);
};

Service.prototype.web = function (next) {
  server.connection({ port: this._port });
  server.start(err => {
    if (err) return next(err);
    return this.routes(next);
  });
};

Service.prototype.routes = function (next) {
  const resolve = hpath => path.resolve(this._rootPath, hpath);
  const routes = this._routes.map(route => { return {
    method: route.method,
    path: route.path,
    handler: require(resolve(route.handlerPath))
  }});
  routes.forEach(route => server.route(route));
  return next();
};

module.exports = new Service();
