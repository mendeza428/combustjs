var db = require('../db');
var r = require('rethinkdb');
var emitToParent = require('../utils/emitToParent');
var config = require('../config');
var parseToRows = require('../utils/parseToRows.js');
var _ = require('underscore');

exports.setup = function(socket, io) {
  /**
  *@apiGroup delete
  *@apiName delete
  *@api {socket} Deletes a javascript object at the specified url
  *@api {socket} Emits back a [url]-deleteSuccess signal on success
  *@api {socket} Emits value signal to all parents AND the specified url
  *
  *@apiParam {Object} deleteSuccess An object that contains path, _id, and data as properties
  *@apiParam {String} deleteSuccess._id A string that specifies the key of the javascript object
  *
  */
  socket.on('delete', function(deleteRequest) {
    console.log('AT THE TOP OF DELETE.JS',  deleteRequest);
    var urlArray,
        _idFind,
        parentString,
        rootString,
        deleteObject;

    if (deleteRequest.path === '/') {
      rootString = null;
      _idFind = "/";
    } else { 
      urlArray = deleteRequest.path.split('/');
      urlArray = urlArray.slice(1, urlArray.length - 1);
      parent_id = urlArray[urlArray.length - 2] || '/';
      parent_path = urlArray[urlArray.length - 3] || '/';
    }
    var deleteObject = urlArray[urlArray.length - 1];
      console.log('parent_id IS:', parent_id);
      console.log('OBJECT TO BE DELETEED, ', deleteObject);
      console.log('PARENT ROOT IS ', parent_path);

    // check to see if the deleteObject is a static property on parent level

    var parentId;
    db.connect(function(conn) {
      if (parent_path === '/') {
        r.db(config.dbName).table(config.tableName).filter({path: '/', _id: parent_id}).run(conn, function(err, results) {
          if (err) throw err;
          results.toArray(function(err, array) {
            if (err) throw err;
            var results = array[0];
            if (deleteObject in results) {
              r.db(config.dbName).table(config.tableName).replace(r.row.without(deleteObject)).run(conn, function(err, results) {
                if (err) throw err;
                r.db(config.dbName).table(config.tableName).get(parentId).run(conn, function(err, results) {
                  if (err) throw err;
                });
              });
            }
          })
        });
      } else if (parent_id === '/') {
          r.db(config.dbName).table(config.tableName).filter({path: '/', _id: parent_id}).run(conn, function(err, results) {
          if (err) throw err;
          results.toArray(function(err, array) {
            if (err) throw err;
            var results = array[0];
            if (deleteObject in results) {
              r.db(config.dbName).table(config.tableName).replace(r.row.without(deleteObject)).run(conn, function(err, results) {
                if (err) throw err;
                r.db(config.dbName).table(config.tableName).get(parentId).run(conn, function(err, results) {
                  if (err) throw err;
                });
              });
            }
          })
        });
      } else {
        r.db(config.dbName).table(config.tableName).filter({path: '/'+ parent_path +'/', _id: parent_id}).run(conn, function(err, results) {
          if (err) throw err;
          results.toArray(function(err, array) {
            if (err) throw err;
            var results = array[0];
            if (deleteObject in results) {
              r.db(config.dbName).table(config.tableName).replace(r.row.without(deleteObject)).run(conn, function(err, results) {
                if (err) throw err;
                r.db(config.dbName).table(config.tableName).get(parentId).run(conn, function(err, results) {
                  if (err) throw err;
                  console.log("new value: ", results);
                })
              })
            }
          });
        })
      }
    }
  })
    // db.connect(function(conn) {
    //   r.db(config.dbName).table(config.tableName).filter({}).run(conn, function(err, results){
    //     if (err) throw err;
    //     console.log('results for id query search are !!@@@', results);
    //       socket.emit(deleteRequest.path + '-deleteSuccess', 'Data was successfully deleted!');
    //       //
    //   });
    // });
};