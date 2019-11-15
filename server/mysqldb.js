'use strict';

var mysql = require('mysql');

// remote mysql db connection area
// var connection = mysql.createConnection({
//     host: '10.228.19.14',
//     port: 3806,
//     user: 'mysqladmin',
//     password: 'cladmin',
//     database: 'wagtail'
// });

// solve the timeout issues
var connection = mysql.createPool({
    host: '10.228.19.14',
    port: 3806,
    user: 'mysqladmin',
    password: 'cladmin',
    database: 'wagtail'
});

// connection.connect(function(err) {
//     if(err) throw err;
// });

module.exports = connection;