module.exports = function(router) {
    var userCtrl = require('./controller');

    router.post('/user/signup', userCtrl.userSignup);
    router.post('/user/login', userCtrl.userLogin);
    router.post('/user/forgot-password', userCtrl.sendForgotMail);
 
    return router
}