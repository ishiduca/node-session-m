module.exports = function (params) {
    var path = require('path');
    var mem  = new (require(path.join( __dirname, '../../ext/node_modules/memcache')).Client)(params.port, params.host);
    var mod = require(path.join( __dirname, '../../'));
    mod.Store.use(mem);

    ['set', 'get', 'remove'].forEach(function (method) {
        mod.Store.extend(method, function () {
            var _method = (method === 'remove') ? 'delete' : method;
            this.trait[_method].apply(this.trait, arguments);
        });
    });

    mem.connect();

    mod.Session.use(new mod.Store);

    return mod.Session;
};
