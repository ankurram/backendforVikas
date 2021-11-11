'use strict';
var jwt = require('jsonwebtoken'),
    constant = require('../constant/constant'),
    mongoose = require('mongoose'),
    Admin = require('../../api/modules/admin/models/admin_model'),
    User = require('../../api/modules/user/models/user_model'),
    query = require('../commanService/common_query');
    // UrlPermission = mongoose.model('assignPermissions'),
    // Token = mongoose.model('token'),
    // Role = mongoose.model('role');



exports.ensureAuthorized =   async (req, res, next) => {
    
    var unauthorizedJson = { code: 401, 'message': 'Unauthorized', data: {} };
    var token = req.headers["authorization"] || req.query["api_key"];
    var forbidden = { code: 403, message: ' trying to access something you dont have the permission to' }
     
        if (req.headers.authorization) {
            if (typeof token !== 'undefined') {
                var splitToken = token.split(' ');
                try {
                    token = splitToken[1];
                    var decoded = jwt.verify(token, constant.cryptoConfig.secret);
                   
                    if (splitToken[0] == 'admin_bearer') {

                        var adminToeknResult = decoded;
                        
                        let condition = { _id:mongoose.Types.ObjectId(adminToeknResult.user_id)} 
                         let user = await query.findoneData(Admin, condition);
                            if (user.data == null) {    
                                res.json(unauthorizedJson);
                            } else {
                                
                                req.user = user.data;
                                req.token = token
                                next();
                            }
                    } else if (splitToken[0] == 'Bearer') {
                        var tokenResult = decoded;
                                User.findOne({ _id: mongoose.Types.ObjectId(tokenResult.user_id), isDeleted: false })
                                    .lean().exec(function (err, user) {
                                        if (err || !user) {
                                            res.json(unauthorizedJson);
                                        } else {       
                                                    req.user = user;
                                                    next();
                                                } 
                                    });
                    } else {

                        res.json(unauthorizedJson);
                    }
                } catch (err) {

                    res.json(unauthorizedJson);
                }
            } else {

                res.json(unauthorizedJson);
            }
        } else {
            
            // res.json(forbidden)
            next();
        }
    
}