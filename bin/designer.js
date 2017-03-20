#!/usr/bin/env node

var exec = require('child_process').exec;
exec('forever start server.js');
