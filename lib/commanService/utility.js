const { v4: uuidv4 } = require('uuid');
var utility = {};


utility.uuid = {
    v1: function () {
        return uuidv4();  //.v1()
    }
}


module.exports = utility;