/// <reference types="node" />
import { Buffer } from 'buffer';
import { IServerNetworkAdapter, User, InstanceNetwork, Context } from 'nengi';
declare class uWebSocketsInstanceAdapter implements IServerNetworkAdapter {
    network: InstanceNetwork;
    context: Context;
    constructor(network: InstanceNetwork, config: any);
    listen(port: number, ready: () => void): void;
    disconnect(user: User, reason: any): void;
    send(user: User, buffer: Buffer): void;
}
export { uWebSocketsInstanceAdapter };
