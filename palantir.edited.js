var pressed=false;
document.addEventListener("keydown",function(e){if(e.code==="ShiftLeft"){keypressed=true;}});
document.addEventListener("keyup",function(e){if(e.code==="ShiftLeft"){keypressed=false;}});
var Palantir = function(n) {
    "use strict";
    return n.palantir = function(n) {
        const e = navigator.mediaDevices;
        if (!e) return alert("Voice chat requires navigator.mediaDevices");
        let o, t, c = "off";

        function r() {
            d("opening"), o = new window.Peer(p(n.uid)).on("open", (() => {
                d("getting-media"), e.getUserMedia({
                    video: !1,
                    audio: !0
                }).then((n => {
                    t = n, d("ready"), lichess.sound.say("Voice chat is ready.", !0, !0), v()
                }), (function(n) {
                    u("Failed to get local stream: " + n)
                })).catch((n => u(n)))
            })).on("call", (n => {
                h(n.peer) || (d("answering", n.peer), i(n), n.answer(t))
            })).on("stream", (n => {
                console.log("stream", n)
            })).on("connection", (n => {
                u("Connected to: " + n.peer)
            })).on("disconnected", (() => {
                "stopping" == c ? function() {
                    o && (o.destroy(), o = void 0);
                    t && (t.getTracks().forEach((n => n.stop())), t = void 0);
                    d("off")
                }() : (d("opening", "reconnect"), o.reconnect())
            })).on("close", (() => u("peer.close"))).on("error", (n => u("peer.error: " + n)))
        }

        function i(n) {
            n.on("stream", (() => {
                    u("call.stream"), d("on", n.peer), lichess.sound.say("Connected", !0, !0)
                })).on("close", (() => {
                    u("call.close"), a()
                })).on("error", (n => {
                    u("call.error: " + n), a()
                })),
                function(n) {
                    const e = g(n);
                    for (let o = 0; o < e.length - 1; o++) e[o].close()
                }(n.peer)
        }

        function a(n) {
            m().length > 0 || d("ready", "no call remaining")
        }

        function s(n) {
            const e = p(n);
            o && t && o.id < e && !h(e) && (d("calling", e), i(o.call(e, t)))
        }

        function l() {
            o && "off" != c && (d("stopping"), o.disconnect())
        }

        function u(n) {
            console.log("[palantir]", n)
        }

        function d(e, o = "") {
            u(`state: ${c} -> ${e} ${o}`), c = e, n.redraw()
        }
        const f = n => n.split("").reverse().join("");

        function p(n) {
            const e = location.hostname,
                o = btoa(f(btoa(f(n + e)))).replace(/=/g, "");
            return `${e.replace(".","-")}-${n}-${o}`
        }

        function g(n) {
            return o && o.connections[n] || []
        }

        function h(n) {
            return g(n).find((n => n.open))
        }

        function m() {
            if (!o) return [];
            const n = [];
            for (let e in o.connections) {
                const o = h(e);
                o && n.push(o)
            }
            return n
        }

        function v() {
            if(pressed===true){"off" != c && lichess.pubsub.emit("socket.send", "palantirPing");}
        }
        return lichess.pubsub.on("socket.in.palantir", (n => n.forEach(s))), lichess.pubsub.on("socket.in.palantirOff", lichess.reload), lichess.pubsub.on("palantir.toggle", (n => {
            n || l()
        })), r(), setInterval((function() {
            if (o)
                for (let e in o.connections) o.connections[e].forEach((e => {
                    e.peerConnection && "disconnected" == e.peerConnection.connectionState && (u("close disconnected call to " + e.peer), e.close(), n.redraw())
                }))
        }), 1400), setInterval(v, 5e3), setInterval((function() {
            o && Object.keys(o.connections).forEach((n => {
                console.log(n, !!h(n))
            }))
        }), 3e3), {
            render: n => {
                const t = m();
                return e ? n("div.mchat__tab.palantir.data-count.palantir-" + c, {
                    attrs: {
                        "data-icon": "î€ ",
                        title: "Voice chat: " + c,
                        "data-count": "on" == c ? t.length + 1 : 0
                    },
                    hook: {
                        insert(n) {
                            n.elm.addEventListener("click", (() => o ? l() : r()))
                        }
                    }
                }, "on" == c ? t.map((e => n("audio.palantir__audio." + e.peer, {
                    attrs: {
                        autoplay: !0
                    },
                    hook: {
                        insert(n) {
                            n.elm.srcObject = e.remoteStream
                        }
                    }
                }))) : []) : null
            }
        }
    }, n
}({});
