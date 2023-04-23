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
    // TODO allow uws.js config to be passed
    constructor(network, config) {
        this.network = network;
    }
    // consider a promise?
    listen(port, ready) {
        (0, uWebSockets_js_1.App)({}).ws('/*', {
            //idleTimeout: 30,
            //maxBackpressure: 1024,
            //maxPayloadLength: 512,
            open: (ws) => __awaiter(this, void 0, void 0, function* () {
                const user = new nengi_1.User(ws, this);
                ws.getUserData().user = user;
                user.remoteAddress = buffer_1.Buffer.from(ws.getRemoteAddressAsText()).toString('utf8');
                this.network.onOpen(user);
            }),
            message: (ws, message, isBinary) => __awaiter(this, void 0, void 0, function* () {
                const user = ws.getUserData().user;
                if (isBinary) {
                    this.network.onMessage(user, buffer_1.Buffer.from(message));
                }
            }),
            drain: (ws) => {
                console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
            },
            close: (ws, code, message) => {
                this.network.onClose(ws.getUserData().user);
            }
        }).listen(port, (listenSocket) => {
            if (listenSocket) {
                ready();
            }
        });
    }
    createBuffer(lengthInBytes) {
        return buffer_1.Buffer.allocUnsafe(lengthInBytes);
    }
    createBufferWriter(lengthInBytes) {
        return new nengi_buffers_1.BufferWriter(this.createBuffer(lengthInBytes));
    }
    createBufferReader(buffer) {
        return new nengi_buffers_1.BufferReader(buffer);
    }
    disconnect(user, reason) {
        user.socket.end(1000, JSON.stringify(reason));
    }
    send(user, buffer) {
        user.socket.send(buffer, true);
    }
}
exports.uWebSocketsInstanceAdapter = uWebSocketsInstanceAdapter;
