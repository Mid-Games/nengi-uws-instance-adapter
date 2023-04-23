import { App, WebSocket } from 'uWebSockets.js'
import { Buffer } from 'buffer'
import {
    IServerNetworkAdapter,
    User,
    InstanceNetwork,
} from 'nengi'

import { BufferReader, BufferWriter } from 'nengi-buffers'

type UserData = {
    user: User
}

class uWebSocketsInstanceAdapter implements IServerNetworkAdapter {
    network: InstanceNetwork

    // TODO allow uws.js config to be passed
    constructor(network: InstanceNetwork, config: any) {
        this.network = network
    }

    // consider a promise?
    listen(port: number, ready: () => void) {
        App({

        }).ws('/*', {
            //idleTimeout: 30,
            //maxBackpressure: 1024,
            //maxPayloadLength: 512,
            open: async (ws: WebSocket<UserData>) => {
                const user = new User(ws, this)
                ws.getUserData().user = user
                user.remoteAddress = Buffer.from(ws.getRemoteAddressAsText()).toString('utf8')
                this.network.onOpen(user)
            },
            message: async (ws: WebSocket<UserData>, message: any, isBinary: boolean) => {
                const user = ws.getUserData().user
                if (isBinary) {
                    this.network.onMessage(user, Buffer.from(message))
                }
            },
            drain: (ws: WebSocket<UserData>) => {
                console.log('WebSocket backpressure: ' + ws.getBufferedAmount())
            },
            close: (ws: WebSocket<UserData>, code: number, message: ArrayBuffer) => {
                this.network.onClose(ws.getUserData().user)
            }

        }).listen(port, (listenSocket: any) => {
            if (listenSocket) {
                ready()
            }
        })
    }

    createBuffer(lengthInBytes: number) {
        return Buffer.allocUnsafe(lengthInBytes)
    }

    createBufferWriter(lengthInBytes: number) {
        return new BufferWriter(this.createBuffer(lengthInBytes))
    }

    createBufferReader(buffer: Buffer) {
        return new BufferReader(buffer)
    }

    disconnect(user: User, reason: any): void {
        user.socket.end(1000, JSON.stringify(reason))
    }

    send(user: User, buffer: Buffer): void {
        user.socket.send(buffer, true)
    }
}

export { uWebSocketsInstanceAdapter }
