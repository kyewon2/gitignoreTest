
var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient({
    region: "ap-northeast-1"
});


// AWS DynamoDB의 scan을 통해 쿼리 수행
exports.scanDynamoDB = function(params, limit, startKey, callback) {
    limit = typeof limit !== 'undefined' ? limit : null;
    startKey = typeof startKey !== 'undefined' ? startKey : null;

    if (limit != null) {
        params.Limit = limit;
    }
    if (startKey != null) {
        params.ExclusiveStartKey = startKey;
    }
    var items = [];
    var processNextBite = function(err, items, nextKey) {
        if (nextKey && nextKey != null) {
            // not read all
            params.ExclusiveStartKey = nextKey;
            getNextBite(params, items, processNextBite);
        } else {
            callback(err, items);
        }
    };
    var getNextBite = function(params, items, callback) {

        var result = docClient.scan(params, function(err, data) {
            var obj = null;
            if (err != null) {
                console.log(err); // TODO better error handling
                obj = null;
                callback(err, items, null); // 3rd : 콜백 수행 시 종료를 위함
                return;
            }

            // Data 합치기
            if (data && data.Items && data.Items.length > 0) {
                items = items.concat(data.Items);
            }

            var lastStartKey = null;
            // scan이 완료 되었는지 비교
            if (data) {
                lastStartKey = data.LastEvaluatedKey;
            }

            callback(err, items, lastStartKey);
        });
    };

    getNextBite(params, items, processNextBite);
}
