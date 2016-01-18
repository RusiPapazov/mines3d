/*jslint browser: true */
/*global define */
define(['nanoModal'], function (nanoModal) {
    "use strict";
    var formatText = function formatText(text) {
        return text.replace(/\n/g, '<br>');
    };
    return {
        alert: function (text, cb) {
            var dialog = nanoModal(formatText(text), {
                buttons: [{
                    text: 'Ok',
                    autoRemove: true,
                    handler: function (modal) {
                        if (typeof cb === 'function') {
                            cb();
                        }
                        modal.hide();
                    }
                }]
            });
            dialog.show();
        },
        prompt: function prompt(text, dflt, cb) {
            text += '<br><input value="' + dflt + '" id="prompt-input">';
            var dialog = nanoModal(formatText(text), {
                buttons: [{
                    text: 'Ok',
                    autoRemove: true,
                    handler: function (modal) {
                        if (typeof cb === 'function') {
                            cb();
                        }
                        modal.hide();
                    }
                }]
            });
            dialog.show();
            document.getElementById('prompt-input').focus();
        }
    };
});