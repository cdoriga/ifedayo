// Service worker: guarda as páginas para abrir sem internet e serve o áudio baixado.
var V = "ife-shell-f7ee5b26a0", MEDIA = "ife-media-b53d46e031", SHELL = ["./", "index.html", "en.html", "it.html", "pt.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "img/fotos/st-arcos-1.webp", "img/fotos/st-arcos-2.webp", "img/fotos/st-arcos-3.webp", "img/fotos/st-azenhas-1.webp", "img/fotos/st-azenhas-2.webp", "img/fotos/st-azenhas-3.webp", "img/fotos/st-galo-1.webp", "img/fotos/st-galo-2.webp", "img/fotos/st-galo-3.webp", "img/fotos/st-lisboa-1.webp", "img/fotos/st-lisboa-2.webp", "img/fotos/st-lisboa-3.webp", "img/fotos/st-mouros-1.webp", "img/fotos/st-mouros-2.webp", "img/fotos/st-mouros-3.webp", "img/fotos/st-nazare-1.webp", "img/fotos/st-nazare-2.webp", "img/fotos/st-nazare-3.webp", "img/fotos/st-obidos-1.webp", "img/fotos/st-obidos-2.webp", "img/fotos/st-obidos-3.webp", "img/fotos/st-pena-1.webp", "img/fotos/st-pena-2.webp", "img/fotos/st-pena-3.webp", "img/fotos/st-regaleira-1.webp", "img/fotos/st-regaleira-2.webp", "img/fotos/st-regaleira-3.webp", "img/fotos/st-roca-1.webp", "img/fotos/st-roca-2.webp", "img/fotos/st-roca-3.webp", "img/ifedayo-corpo.webp", "img/ifedayo-palco.webp", "img/ifedayo-princesa.webp", "img/ifedayo-rosto.webp", "img/ifedayo-sereia.webp", "img/ifedayo-tambor.webp", "img/ifedayo-teclado.webp"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return (k.indexOf("ife-shell-") === 0 && k !== V) || (k.indexOf("ife-media") === 0 && k !== MEDIA); }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
function ranged(req, res) {
  var range = req.headers.get("range"); if (!range || !res || res.status !== 200) return res;
  return res.arrayBuffer().then(function (buf) {
    var m = /bytes=(\d*)-(\d*)/.exec(range), size = buf.byteLength, a = m && m[1] ? +m[1] : 0, b = m && m[2] ? +m[2] : size - 1;
    if (a >= size) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + size } });
    b = Math.min(b, size - 1);
    return new Response(buf.slice(a, b + 1), { status: 206, headers: { "Content-Type": res.headers.get("Content-Type") || "audio/mpeg", "Content-Range": "bytes " + a + "-" + b + "/" + size, "Content-Length": String(b - a + 1), "Accept-Ranges": "bytes" } });
  });
}
self.addEventListener("fetch", function (e) {
  var req = e.request; if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin === location.origin) {
    var key = url.pathname.replace(/^.*\/ifedayo\//, "").replace(/^\//, "") || "./";
    if (req.mode === "navigate" || /\.html$/.test(url.pathname)) {
      e.respondWith(fetch(req).then(function (r) { var cp = r.clone(); caches.open(V).then(function (c) { c.put(req, cp); }); return r; })
        .catch(function () { return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match("index.html"); }); }));
      return;
    }
    e.respondWith(caches.match(req.url, { ignoreSearch: true }).then(function (hit) {
      if (hit) return ranged(req, hit);
      return fetch(req).then(function (r) {
        if (r.ok && r.status === 200 && /\/audio\//.test(url.pathname)) { var cp = r.clone(); caches.open(MEDIA).then(function (c) { c.put(req.url, cp); }); }
        return r;
      });
    }));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open("ife-fonts").then(function (c) { return c.match(req).then(function (hit) {
      var net = fetch(req).then(function (r) { c.put(req, r.clone()); return r; }).catch(function () { return hit; });
      return hit || net; }); }));
  }
});
