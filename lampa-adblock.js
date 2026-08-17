(function () {
    'use strict';

    if (window.lampa_adblock_ready) return;
    window.lampa_adblock_ready = true;

    var blockedRequest = /\/api\/ad\/get\/(?:preroll|banner)(?:[/?#]|$)/i;

    function emptyAdResponse(options) {
        var deferred = window.$ && $.Deferred ? $.Deferred() : null;
        var request = deferred ? deferred.promise() : {
            done: function () { return request; },
            fail: function () { return request; },
            always: function () { return request; }
        };

        request.abort = function () { return request; };

        setTimeout(function () {
            var response = {ad: []};

            if (typeof options.success === 'function') {
                options.success.call(options.context || options, response, 'success', request);
            }

            if (deferred) deferred.resolve(response, 'success', request);
        }, 0);

        return request;
    }

    function blockAdRequests() {
        if (!window.$ || !$.ajax || $.ajax.__lampa_adblock) return;

        var originalAjax = $.ajax;

        function ajax(url, options) {
            var settings;

            if (typeof url === 'string') {
                settings = options || {};
                settings.url = url;
            }
            else {
                settings = url || {};
            }

            if (blockedRequest.test(String(settings.url || ''))) {
                console.log('Lampa AdBlock', 'blocked', settings.url);
                return emptyAdResponse(settings);
            }

            return originalAjax.apply(this, arguments);
        }

        ajax.__lampa_adblock = true;
        ajax.__original = originalAjax;
        $.ajax = ajax;
    }

    function removeVast(data) {
        if (!data || typeof data !== 'object') return;

        Object.keys(data).forEach(function (key) {
            if (/^vast(?:_|$)/i.test(key)) delete data[key];
        });

        if (Array.isArray(data.playlist)) {
            data.playlist.forEach(removeVast);
        }
    }

    function removeStaleScreens() {
        var selectors = ['.ad-preroll', '.ad-video-block'];

        selectors.forEach(function (selector) {
            var nodes = document.querySelectorAll(selector);

            Array.prototype.forEach.call(nodes, function (node) {
                if (node.parentNode) node.parentNode.removeChild(node);
            });
        });
    }

    blockAdRequests();

    if (window.Lampa && Lampa.Player && Lampa.Player.listener) {
        Lampa.Player.listener.follow('create', function (event) {
            removeVast(event && event.data);
        });
    }

    if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event && event.type === 'ready') blockAdRequests();
        });
    }

    removeStaleScreens();

    console.log('Lampa AdBlock', 'ready');
}());
