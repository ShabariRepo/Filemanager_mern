'use strict';

var mysql = require('mysql');

// remote mysql db connection area
var connection = mysql.createConnection({
    host: 'http://10.228.19.14',
    user: 'mysqladmin',
    password: 'cladmin',
    database: 'wagtail'
});

connection.connect(function(err) {
    if(err) throw err;
});

module.exports = connection;