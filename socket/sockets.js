var express  = require('express');
var users = require('./users')();
import mongoose from 'mongoose';
const sockets = {};


var initialize = function(app, server, io) {

    console.log("Socket io part");
    var debug_mode = true;
    //Array of users to be online
    io.on('connection', function (socket) {
        
        console.log(socket.id + " has connected => ");       
        /**
         * Once the user logged in, then this socket will be emitted from the client
         */


    });
};


module.exports.initialize = initialize;

