(function () {

    ////////////////////////////////////////////////////////////////////////////////

    var child_process;

    child_process = require('child_process');

    ////////////////////////////////////////////////////////////////////////////////

    exports.init = function (manager) {
        if (!manager.hasDomain('lesslint'))
            manager.registerDomain('lesslint', {
                major: 1,
                minor: 0
            });

        manager.registerCommand('lesslint', 'commander', commander, true);
    };

    ////////////////////////////////////////////////////////////////////////////////

    function commander(exec, cb) {
        child_process.exec(exec, function (err, stdout, stderr) {
            cb(null, stderr + stdout);
        });
    }

    ////////////////////////////////////////////////////////////////////////////////

}());
