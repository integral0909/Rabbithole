// exports.getResoponseResult = getResoponseResult;
exports.getResoponseResult = getResoponseResult;

function getResoponseResult(data , success, error) {

    var result = {};

    result["data"] = data;
    result["success"] = success;
    result["error"] = error;

    return result; 
}

exports.customizedUserInfo = customizedUserInfo;

function customizedUserInfo(doc) {
    var result  = {
        _id: doc._id.toString(),
        type: doc.type,
        email: doc.common_profile.email,
        gender: doc.common_profile.gender,
        firstName: doc.common_profile.firstName,
        lastName: doc.common_profile.lastName,
        location: doc.common_profile.location,
        facebookId: doc.o_auth.facebook.id,
        avatar:doc.common_profile.avatar
    };

    return result;
}