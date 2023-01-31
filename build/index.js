"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uWebSocketsInstanceAdapter = void 0;
const uWebSockets_js_1 = require("uWebSockets.js");
const buffer_1 = require("buffer");
const nengi_1 = require("nengi");
const nengi_buffers_1 = require("nengi-buffers");
class uWebSocketsInstanceAdapter {
    constructor(network, config) {
        this.network = network;
        this.context = this.network.instance.context;
    }
    // consider a promise?
    listen(port, ready) {
        (0, uWebSockets_js_1.App)({}).ws('/*', {
            //idleTimeout: 30,
            //maxBackpressure: 1024,
            //maxPayloadLength: 512,
            open: (ws) => __awaiter(this, void 0, void 0, function* () {
                const user = new nengi_1.User(ws);
                ws.user = user;
                user.remoteAddress = buffer_1.Buffer.from(ws.getRemoteAddressAsText()).toString('utf8');
                this.network.onOpen(user);
            }),
            message: (ws, message, isBinary) => __awaiter(this, void 0, void 0, function* () {
                const user = ws.user;
                if (isBinary) {
                    const binaryReader = new nengi_buffers_1.BufferReader(buffer_1.Buffer.from(message), 0);
                    this.network.onMessage(user, binaryReader, nengi_buffers_1.BufferWriter);
                }
            }),
            drain: (ws) => {
                console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
            },
            close: (ws, code, message) => {
                console.log('WebSocket closed', code, message);
                this.network.onClose(ws.user);
            }
        }).listen(port, (listenSocket) => {
            if (listenSocket) {
                ready();
            }
        });
    }
    disconnect(user, reason) {
        user.socket.end(1000, JSON.stringify(reason));
    }
    send(user, buffer) {
        user.socket.send(buffer, true);
    }
}
exports.uWebSocketsInstanceAdapter = uWebSocketsInstanceAdapter;
