var io = require('socket.io-client');
var should = require('should');
var r = require('rethinkdb');
var db = require('../../server/lib/db');
var Combust = require('../Combust');
var config = require('./configTest.js');

var utils = config.utils;
var serverAddress = config.serverAddress;

var socket;
var authRef;
describe('set()', function() {
  before(function(done) {
    config.resetDb(function() {
      config.combustToken(function(authenticatedCombust) {
        authRef = authenticatedCombust;
        socket = authRef.socket;
        done();
      })
    })
  });

  after(function(done) {
    config.resetDb(function() {
      socket.disconnect();
      done();
    })
  });

  it('should set an object into database at the current path', function(done) {
    authRef.child('test').set(utils.testObj, function() {
      done();
    });
  });
});