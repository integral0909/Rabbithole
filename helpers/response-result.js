// exports.getResoponseResult = getResoponseResult;
exports.getResoponseResult = getResoponseResult;

function getResoponseResult(data , success, error) {

    var result = {};

    result["data"] = data;
    result["success"] = success;
    result["error"] = error;

    return result; 
}