'use strict';
console.log('Loading function');

var AWS = require("aws-sdk");
AWS.config.update({
    //region: "ap-northeast-1",
    //endpoint: "https://dynamodb.ap-northeast-1.amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient({region:'ap-northeast-1'});

var response = {
    status: 400,
    errors: "",
};


var UsersTable = 'Users';

exports.handler = (event, context) => {

    console.log("Received event " + JSON.stringify(event, null, 2));
    // ID 유무 확인
    if (typeof event.id == 'undefined') {
        response.status = 400;
        response.errors = 'You should pass your ID';
        console.log('Response : ', JSON.stringify(response));
        return context.fail(JSON.stringify(response));
    }

    var params = {
        TableName: UsersTable,
        Key: {
            "id": event.id
        }
    };


    console.log('Ready to try doc..');
    docClient.get(params, function(err, data) {
        if (err) {
            var curDate = new Date();
            console.log("DynamoDB error : ", JSON.stringify(err));
            response.status = 400;
            response.errors = err.code;
            console.log('Response : ', JSON.stringify(response));
            return context.fail(JSON.stringify(response));
        } else {

            var curDate = new Date();
            if (typeof data.Item == 'undefined') {
                response.status = 477;
                response.errors = 'Not found User';
                console.log("Not found user1 : ", event.id);
                return context.fail(JSON.stringify(response));
            } else {

                if (typeof data.Item.id !== 'undefined' && data.Item.id) {
                    // 패키지 전체 목록
                    var packages = data.Item.packages;
                    console.log("Packages ", packages);
                    var out = packages.length;
                    var count = 0;
                    var result = [];
                    var check = false;
                    // var check = true;
                    packages.forEach(function(pkgName) {

                        if (pkgName.indexOf('net.bluehack.bluelens.bokdroid') > -1) {
                            check = true;
                        }
                        // 개별 앱 검색
                        var params_package = {
                            TableName: "Apps",
                            Key: {
                                "pkg": pkgName
                            }
                        };
                        docClient.get(params_package, function(err2, data2) {
                            if (err2) {
                                console.log("DynamoDB Error : ", JSON.stringify(err2));
                                response.errors = err2.code;
                                console.log('Response : ', JSON.stringify(response));
                                return context.fail(JSON.stringify(response));
                            } else {
                                result.push(data2.Item);
                                // console.log("found Apps", result);
                                count++;
                                if (count >= out) { // escape when count and out are equal
                                    console.log('Done! ', count);
                                    if (check) {
                                        return context.succeed(result);
                                    } else {
                                        console.log("User information should be updated");
                                        response.status = 477;
                                        response.errors = "Update user information";
                                        return context.fail(JSON.stringify(response));
                                    }
                                }
                            } // end of else
                        }); // end of get
                    }); // end packages.forEach

                } else { // end of if
                    // not found
                    response.status = 477;
                    response.errors = 'Not found User';
                    console.log("Not found user2 : ", event.id);
                    return context.fail(JSON.stringify(response));
                }
            }
        } // end of else
    });
};
