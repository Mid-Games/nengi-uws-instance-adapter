import { App, WebSocket } from 'uWebSockets.js'
import { Buffer } from 'buffer'
import {
    IServerNetworkAdapter,
    User,
    UserConnectionState,
    InstanceNetwork,
    Context
} from 'nengi'

import { BufferReader, BufferWriter } from 'nengi-buffers'

class uWebSocketsInstanceAdapter implements IServerNetworkAdapter {
    network: InstanceNetwork
    context: Context

    constructor(network: InstanceNetwork, config: any) {
        this.network = network
        this.context = this.network.instance.context
    }

    // consider a promise?
    listen(port: number, ready: () => void) {
        App({

        }).ws('/*', {
            //idleTimeout: 30,
            //maxBackpressure: 1024,
            //maxPayloadLength: 512,
            open: async (ws: WebSocket) => {
                const user = new User(ws)
                ws.user = user
                user.remoteAddress = Buffer.from(ws.getRemoteAddressAsText()).toString('utf8')
                this.network.onOpen(user)
            },
            message: async (ws: WebSocket, message: any, isBinary: boolean) => {
                const user = ws.user as User
                if (isBinary) {
                    const binaryReader = new BufferReader(Buffer.from(message), 0)
                    this.network.onMessage(user, binaryReader, BufferWriter)
                }
            },
            drain: (ws: WebSocket) => {
                console.log('WebSocket backpressure: ' + ws.getBufferedAmount())
            },
            close: (ws: WebSocket, code: number, message: ArrayBuffer) => {
                console.log('WebSocket closed', code, message)
                this.network.onClose(ws.user)
            }

        }).listen(port, (listenSocket: any) => {
            if (listenSocket) {
                ready()
            }
        })
    }

    disconnect(user: User, reason: any): void {
        user.socket.end(1000, JSON.stringify(reason))
    }

    send(user: User, buffer: Buffer): void {
        user.socket.send(buffer, true)
    }
}

export { uWebSocketsInstanceAdapter }
