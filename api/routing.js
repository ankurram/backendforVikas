module.exports = function(express){
    const router = express.Router()

    require('./user/routing')(router);
    require('./product/routing')(router);
    // require('./modules/admin/admin_router')(router);
    return router
}
