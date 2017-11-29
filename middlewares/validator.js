module.exports = function () {    
    return {       
        onlyNotEmpty: function (req, res, next) {
            const out = {};
            _(req.body).forEach((value, key) => {
                if (!_.isEmpty(value)) {
                    out[key] = value;
                }
            });
        
            req.bodyNotEmpty = out;
            next();
        }
    };
};