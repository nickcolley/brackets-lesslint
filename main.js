/*global define, brackets */

/**
 * Provides lesslint results via the core linting extension point
 */
define(function (require, exports, module) {
    "use strict";

    // Load dependent modules
    var AppInit = brackets.getModule("utils/AppInit");
    var CodeInspection = brackets.getModule("language/CodeInspection");
    var ext_utils = brackets.getModule('utils/ExtensionUtils');
    var NodeConnection = brackets.getModule('utils/NodeConnection');
    var node = new NodeConnection();
    var errors = [];

    function loadErrorsFor(fullPath) {
        // Load errors for given path
        node.domains.lesslint.commander('lessc --no-color -l "' + fullPath + '"').done(function (data) {
            var match = /(.+) in (.+) on line (\d+)/.exec(data);
            console.log("Matched data : " + JSON.stringify(data) + " \n Matches:" + JSON.stringify(match));
            var type = data.indexOf('Error') > -1 ? CodeInspection.Type.ERROR : CodeInspection.Type.WARNING;
            if (data.length > 0) {
                errors = [{
                    pos: {
                        line: parseInt(match[3], 10)
                    },
                    message: match[1],
                    type: type
                }];
            } else {
                errors = [];
            }
            CodeInspection.requestRun();
        });
    }

    function init() {

        var editor = brackets.getModule('editor/EditorManager');
        $(editor).on('activeEditorChange', function (event, editor) {
            try {
                loadErrorsFor(editor.document.file.fullPath);
            } catch (err) {
                console.error(err.message, err.stack);
            }
        });

        var docuManager = brackets.getModule('document/DocumentManager');
        var loadForCurrent = function () {
            console.log("loadForCurrent", arguments);
            try {
                loadErrorsFor(docuManager.getCurrentDocument().file._path);
            } catch (err) {
                console.error(err.message, err.stack);
            }
        };

        loadForCurrent();
        $(docuManager).on('documentSaved', loadForCurrent);

        // Register for LESS files
        CodeInspection.register("less", {
            name: "LESSLint",
            scanFile: function (text, fullPath) {
                return {
                    errors: errors
                };
            }
        });
    }

    if (!node.domains.lesslint) {
        node.connect(true).done(function () {
            var path = ext_utils.getModulePath(module, 'node/commander.js');
            node.loadDomains([path], true).done(function () {
                AppInit.appReady(init);
            });
        });
    } else {
        AppInit.appReady(init);
    }
});
