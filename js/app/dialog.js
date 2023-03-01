/*jslint browser: true */
/*global define */
define(['nanoModal'], function (nanoModal) {
    "use strict";
    const formatText = function formatText(text) {
        return text.replace(/\n/g, '<br>');
    };
    const element = () => document.getElementById('prompt-input');
    const blurAll = () => document.querySelectorAll(':focus').forEach(el => el.blur());

    return {
        alert: function (text, cb = () => {}) {
            const dialog = nanoModal(formatText(text), {
                overlayClose: false,
                buttons: [{
                    text: 'Ok',
                    autoRemove: true,
                    primary: true,
                    handler: function (modal) {
                        cb();
                        modal.hide();
                    }
                }]
            });

            blurAll();
            dialog.show();
        },
        prompt: function prompt(text, dflt, cb = () => {}) {
            text += '<br><input value="' + dflt + '" id="prompt-input">';
            const dialog = nanoModal(formatText(text), {
                overlayClose: false,
                buttons: [{
                    text: 'Ok',
                    autoRemove: true,
                    primary: true,
                    handler: function (modal) {
                        cb(element().value);
                        modal.hide();
                        modal.remove();
                    }
                }]
            });

            blurAll();
            dialog.show();
            element().focus();
        }
    };
});