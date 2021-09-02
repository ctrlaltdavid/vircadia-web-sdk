# Networking Library

The networking library provides the means to connect to and communicate with a domain's domain server and assignment clients
using the same protocol as the native C++ client. The primary differences between this Web SDK and the native client are:
- The Web SDK code is client-only whereas the C++ library is used in both the Interface client and the domain server and assignment clients.
- The Web SDK communicates using WebRTC whereas the native client uses UDP.

## Key Classes

### Domain Server

```
// Handles the metaverse address being visited and navigating to domains.
AddressManager
```
```
// All the nodes (domain server and assignment clients) that the client is connected to.
// This includes their presence and communications with them via the Vircadia protocol.
// $$$$$$$: Does this really including the domain server?
NodeList : LimitedNodeList

    // Handles the connection to and interaction with the domain server.
    DomainHandler _domainHandler;

    // Collection of assignment clients that the client is connected to.
    // Note: Does not include the domain server.
    map<UUID, Node*> _nodeHash;

    // Dispatches packets received to registered listeners to handle.
    PacketReceiver _packetReceiver;

    // One-to-many socket connecting the client to the domain server and assignment clients.
    Socket _nodeSocket;

        // Details of all connections to Interface.
        // $$$$$$$: Just nodes or also the domain server?
        map<HifiSockAddr, Connection*> _connectionsHash;

        // One-to-many WebRTC socket.
        // Provides a QUdpSocket-style interface for using a WebRTC data channel.
        // Note: C++ uses a NetworkSocket here that multiplexes UDP and WebRTC sockets.
        WebRTCSocket _webrtcSocket;

            // The WebRTC signaling channel communicating with the domain server, used to set up individual WebRTC
            // data channels for the domain server and each assignment client.
            WebRTCSignalingChannel _webrtcSignalingChannel;

            // Individual data channels for the domain server and each assignment client.
            // The ID is the WebRTC data channel ID assigned by #######: locally assigned?
            // Note: C++ uses a WebRTCDataChannels object here.
            // #######: Should JavaScript also implement a WebRTCDataChannels object, e.g., to make the code closer?
            Map<id, WebRTCDataChannel> _webrtcDataChannels;

                // One-to-one WebRTC data channel.
                // Uses the domain server's signaling server to set up WebRTC connections with user Interfaces.
                WebRTCDataChannel;

```

### Assignment Clients

The same general structure as the Domain Server, except without the `WebRTCSignalingServer`.



## Key Operations

### Domain server connection

```
// Set the location.
DomainServer.connect(location);
    AddressManager.handleLookupString(location);
        AddressManager.handlerUrl(sanitizedAddress);
            AddressManager._domainUrl = url;
            AddressManager._possibleDomainChangeRequired.emit(this._domainUrl, Uuid.NULL);
                DomainHandler.setURLAndID(url, id);
                    DomainHandler._domainURL = url;
```
```
// Request and maintain connection the domain server.
DomainServer.connect(location);
    // Every second...
    NodeList.sendDomainServerCheckIn();

        // If the domain server socket isn't connected...
        Socket.connectToHost(domainURL, NodeType.DomainServer);
            NodeList._domainHandler.setPort(dataChannelID);

        // $$$$$$$: Add ...
        // NodeList.sendDomainServerCheckIn() code draft to implement...
        // Need to review/revise w.r.t. connecting assignment clients before implement for DS and ACs.
        // Connect the WebRTC socket to the domain server if not already connected.
        const domainServerSocketState = this._nodeSocket.state(NodeType.DomainServer);
        if (domainServerSocketState !== Socket.ConnectedState) {
            if (domainServerSocketState === Socket.UnconnectedState) {
                console.log("[Networking] Opening WebRTC socket. Will not send domain server check-in.");
                console.log("[Networking] WebRTC socket state:", Socket.socketStateToString(domainServerSocketState));
                this._nodeSocket.connectToHost(domainURL, NodeType.DomainServer, (dataChannelID) => {
                    this._domainHandler.setPort(dataChannelID);
                });
            }
            return;
        }

        // $$$$$$$: Delete ...
        // If no signaling channel...
        NodeList._nodeSocket.openWebRTCSignalingChannel(domainURL);
        // If no data channel...
        NodeList._nodeSocket.openWebRTCDataChannel(NodeType.DomainServer, dataChannelID);
            NodeList._domainHandler.setPort(dataChannelID);

        // If the domain server socket is connected...
        domainPacketType = isDomainConnected
            ? PacketType.DomainListRequest
            : PacketType.DomainConnectRequest;
        domainSockAddr = this._domainHandler.getSockAddr();
        NodeList.sendPacket(packet, domainSockAddr);
```
```
// Handle DomainList packet received in response to DomainConnectRequest and DomainListRequest packets.
NodeList._packetReceiver.registerListener(PacketType.DomainList, NodeList.processDomainList);
NodeList.processDomainList(message);
    NodeList._domainHandler.setIsConnected(true);
```
```
// Disconnect. $$$$$: From the domain server and assignment clients?
DomainServer.disconnect();
    DomainHandler.disconnect();
        sendDisconnectPacket();
        setIsConnected(false);
            emit disconnectedFromDomain();
                NodeList.reset("Reset from Domain Handler", true);
                    NodeList.reset();
                        LimitedNodeList.reset(reason);
                            Socket.clearConnections();
                                WebRTCSocket.abort();
```

### Assignment client connections

```
// Connect to an assignment clients.
NodeList.processDomainList(message);
    LimitedNodeList.addNewNode();
        LimiteNodeList.addOrUpdateNode();
            emit nodeAdded();
                Application.nodeAdded();
                NodeList.openWebRTCConnection();
                    Socket.openSocket();
                        NodeList.activateSocketFromNodeCommunication();
                            NetworkPeer.activatePublicSocket() | NetworkPeer.activateLocalSocket();
                                NetworkPeer.setActiveSocket();
                                    emit socketActivated();
                                        emit nodeActivated();
                                            ...
                ...
            emit nodeActivated();  // If already connected.
                ...
```
Various actions are taken by different parts of the SDK upon `Application.nodeAdded()` and `Application.nodeActivated()`
to set up assignment client handling code, etc.

```
// Maintaining connection to assignment clients:
TBD ... no actions in particular? Or are pings done which in effect does this?
```

```
// Disconnect
LimitedNodeList::addOrUpdateNode();
    removeOldNode();
        LimitedNodeList.handleNodeKill();
            ...

LimitedNodeList::reset();
    LimitedNodeList.eraseAllNodes();
        LimitedNodeList.handleNodeKill();
            ...

NodeList::processDomainServerRemovedNode();
    LimitedNodeList.killNodeWithUUID();
        LimitedNodeList.handleNodeKill();
            emit nodeKilled(node);
                DomainServer.nodeKilled();  // Application::nodeKilled();
                ... Assignment client actions.
            Socket.cleanupConnection(*activeSocket);


LimitedNodeList.removeSilentNodes();  <<< Not implemented yet.
    LimitedNodeList.handleNodeKill();
        ...

LimitedNodeList::processKillNode();  <<< Not used in C++?! May have been old DomainServer code.
    LimitedNodeList.killNodeWithUUID();
        LimitedNodeList.handleNodeKill();
            ...
```


### Differences between the client and server WebRTC code

The server's WebRTC socket connects one node (domain server or an assignment client) to many user clients.
It listens for connections initiated by the user clients.
The "bind()" methods are used to set up the socket for listening. (I.e., "connectToHost()" methods are not used.)

A user client's WebRTC socket connects the client to many network nodes, i.e., the domain server and the assignment clients.
It initiated these connections.
The "connectToHost()" methods are used to initiate connections. (I.e., "bind()" methods are not used.)

**TBD:** public and local sockets of  assignment clients.


### On the Domain Server

When a new user client connects to the domain server, the domain server tells the assignment clients bout the new user (DomainServerAddedNode packet). The new user's public and local SockAddr values are included in this packet, along with whether the socket type is UDP or WebRTC.
The socket type and SockAddr values are needed in order for the assignment client to be able to match up an incoming WebRTC connection. (The assignment client WebRTC connection happens after the DomainServerAddedNode packet is received by the assignment clients.)
In fact, the domain server and each assignment client need to use the same WebRTC socket number in order to match specific users.

>>> The public and local SockAddr IP address values should be the WebSocket address as seen by the domain server.
>>> The WebRTC data channel ID shoudl be that created by the domain server.
>>> The WebRTC data channel ID should be added to the signaling packet sent by the domain server to the assignment client, so that it can be used by the assignment client when creating the WebRTC data channel.
