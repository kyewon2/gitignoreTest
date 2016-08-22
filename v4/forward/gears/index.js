var url = require('url');
var http = require('http');
var context = require('./context.js')

var get_method = require('./httpresponse_get.js')
var post_method = require('./httpresponse_post.js')

// Compare between 'express module' and 'createServer'
var response;
var api_resource = 'localhost';
var port = 1338;
http.createServer( function(req, res) {

  response = res;

  if ( req.method == 'GET' ) {

    // case : GET method
    // to get query parameters
    var queries = url.parse(req.url, true).query;
    console.log('QueryParams is ', queries);
    // pass function queries
    get_method.handler(queries, context);

  } else if ( req.method == 'POST' ) {

    // case : POST method
    // to get body message
    var bodyMessage = '';
    req.on('data', function(data) {
      bodyMessage += data;
    });
    req.on('end', function() {
      // All body message is integrated
      // Computing will be start.
      get_method.handler(bodyMessage, context);
    });
  }

}).listen(port,api_resource);

context.succeed = function (result) {
      console.log('context.succeed()');
      response.writeHead(200);
      response.end( JSON.stringify(result) );
};

context.fail = function (result) {
      console.log('context.fail()', result);
      makeResponse( result, 400);
};

context.done = function (result) {
      console.log('context.done()', result);
      makeResponse( result, 200);
};

function makeResponse( result, res_code ) {
  var obj = JSON.parse(result);
  if( typeof obj.status !== 'undefined' ) {
    // This case got a result of success but there is a message to share some information
    var code = obj.status;
    console.log( 'Response code is ', code);

    response.writeHead(code, {
      'Content-Type' : 'Application/Json'
    });
  } else {
    response.writeHead(200);
  }
  response.end( result );
};
