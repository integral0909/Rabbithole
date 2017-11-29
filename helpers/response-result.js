// exports.getResponseResult = getResponseResult;
exports.getResponseResult = getResponseResult;

function getResponseResult(data , success, error, count = 0, total = 0, page = 0, pages = 0, limit = 20 ) {

    var result = {};

    result["data"] = data;
    result["success"] = success;
    result["error"] = error;
    var hasMore = false;
    if (total > page * limit) {
        hasMore = true;
    }
    result["hasMore"] = hasMore;
    result["page"] = parseInt(page);
    result["total"] = parseInt(total);
    result["pageCount"] = parseInt(pages);

    return result; 
}

exports.customizedUserInfo = customizedUserInfo;

function customizedUserInfo(doc) {
    var result  = {
        _id: doc._id.toString(),
        isPremium: doc.isPremium,
        type: doc.type,
        username: doc.username,
        email: doc.common_profile.email,
        gender: doc.common_profile.gender,
        newUser: doc.newUser,
        isFlagged: doc.isFlagged,
        isVerified: doc.isVerified,
        firstName: doc.common_profile.firstName,
        lastName: doc.common_profile.lastName,
        location: doc.common_profile.location,
        facebookId: doc.o_auth.facebook.id,
        avatar: doc.common_profile.avatar,
        zipCode: doc.user_settings.zipCode, 
        maxDistance: doc.user_settings.maxDistance, 
        age: doc.common_profile.age,
        enabled_discovery: doc.user_settings.enabled_discovery,
        enabled_notification: doc.user_settings.enabled_notification,
        enabled_newMessages: doc.user_settings.enabled_newMessages,
        enabled_newMatches: doc.user_settings.enabled_newMatches,
        enabled_discreetNotification: doc.user_settings.enabled_discreetNotification,
        use_myLocation: doc.user_settings.use_myLocation,
        show: doc.user_settings.show,
        fbFriends: doc.fbFriends
    };

    return result;
}