'use strict';

var AWS = require("aws-sdk");
var crypto = require('crypto');
var method = 'AES-256-CBC';
var docClient = new AWS.DynamoDB.DocumentClient({region:'ap-northeast-1'});

exports.handler = (event, context, callback) => {
    var targeturl = event.url;
    
    if (typeof targeturl == 'undefined' || !targeturl) {
        context.succeed( {location:  encodeURI("http://bluelens.net")});
        return;
    }
    
    var userid = event.userid;
    if (typeof userid == 'undefined' || !userid) {
        context.succeed( {location:  encodeURI(targeturl)});
        return;
    }
    
    var thirdpartyid = event.partnerid;
    if (typeof thirdpartyid == 'undefined' || !thirdpartyid) {
        context.succeed( {location:  encodeURI(targeturl)});
        return;
    }
    
    processThirdPartyJob(context, userid, thirdpartyid, targeturl);
};

var returnWithToken = function (context, userid, secrettoken, targeturl) {
    var hmac = {};
    var encrypteduserid = encryptWithTSValidation(userid, method, secrettoken, hmac);
    var encryptedparam1 = encryptWithTSValidation("hello gunman", method, secrettoken, hmac);
    var encryptedparam2 = encryptWithTSValidation("is a guy.", method, secrettoken, hmac);
    context.succeed( {location:  encodeURI(targeturl 
                            + "&v01=" 
                            + encodeURIComponent(encrypteduserid)
                            + "&v02=" 
                            + encodeURIComponent(encryptedparam1)
                            + "&v03=" 
                            + encodeURIComponent(encryptedparam2) 
                            ) });    
};


var processThirdPartyJob = function (context, userid, thirdparty_id, targeturl) {
   
    var bTableName = 'bluelens_content_partners';       
    
    var params = {
        TableName: bTableName,
        Key: {
            "thirdpartyid": thirdparty_id
        }
    };
    
    docClient.get(params, function(err, data) {
        if (err) {                        
            return context.succeed( {location:  encodeURI(targeturl)});
        }
        
        if (typeof data.Item.token !== 'undefined' && data.Item.token)
            return returnWithToken(context, userid, data.Item.token, targeturl);
            
        return context.succeed( {location:  encodeURI(targeturl)});
    });
};

// encryption functions --[
var encryptWithTSValidation = function (message, method, secret, hmac) {
    var messageTS = new Date().toISOString().substr(0,19) + message;
    return encrypt(messageTS, method, secret, hmac);
};

var encrypt = function (message, method, secret, hmac) {
    var iv = secret.substr(0,16);    //using this for testing purposes (to have the same encryption IV in PHP and Node encryptors)
    var encryptor = crypto.createCipheriv(method, secret, iv);
    var encrypted = new Buffer(iv).toString('base64') + encryptor.update(message, 'utf8', 'base64') + encryptor.final('base64');
    hmac.value = crypto.createHmac('md5', secret).update(encrypted).digest('hex');
    return encrypted;
};
// ]--