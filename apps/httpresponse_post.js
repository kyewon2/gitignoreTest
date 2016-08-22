
'use strict';
console.log('Loading function - POST');

// let doc = require('dynamodb-doc');
var AWS = require("aws-sdk");
AWS.config.update({
  region: "ap-northeast-1",
  // endpoint: "http://localhost:8000"
  endpoint: "https://dynamodb.ap-northeast-1.amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();

var response = {
        status:400,
        errors: "",
    };

exports.handler = (event, context) => {

  console.log('event : ', event );

  context.succeed('');
};
