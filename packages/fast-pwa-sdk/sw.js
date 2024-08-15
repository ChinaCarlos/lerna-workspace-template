(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) : factory();
})(function () {
    'use strict';

    var __async = (__this, __arguments, generator) => {
        return new Promise((resolve, reject) => {
            var fulfilled = value => {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            };
            var rejected = value => {
                try {
                    step(generator.throw(value));
                } catch (e) {
                    reject(e);
                }
            };
            var step = x => (x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected));
            step((generator = generator.apply(__this, __arguments)).next());
        });
    };
    self.addEventListener('fetch', function (event) {
        if (event.request.method !== 'GET') return;
        if (!/\.(js|jpeg|webp|png|css)$/.test(event.request.url)) return;
        event.respondWith(
            (function () {
                return __async(this, null, function* () {
                    try {
                        const cache = yield caches.open('dynamic-v1');
                        const cachedResponse = yield cache.match(event.request);
                        if (cachedResponse) {
                            event.waitUntil(cache.add(event.request));
                            return cachedResponse;
                        }
                        return fetch(event.request);
                    } catch (error) {
                        return fetch(event.request);
                    }
                });
            })()
        );
    });
    self.addEventListener('install', function () {
        console.log('install');
    });
    self.addEventListener('activate', function () {
        console.log('activated');
    });
});
