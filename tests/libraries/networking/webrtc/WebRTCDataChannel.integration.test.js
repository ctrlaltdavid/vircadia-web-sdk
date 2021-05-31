//
//  WebRTCDataChannel.integration.test.js
//
//  Created by David Rowe on 21 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals jest */

import WebRTCDataChannel from "../../../../src/libraries/networking/webrtc/WebRTCDataChannel.js";
import WebRTCSignalingChannel from "../../../../src/libraries/networking/webrtc/WebRTCSignalingChannel.js";
import NodeType from "../../../../src/libraries/networking/NodeType.js";

import "wrtc";  // WebRTC Node.js package.

describe("WebRTCDataChannel - integration tests", () => {

    //  Test environment expected: Domain server running on localhost that allows anonymous logins.

    const LOCALHOST_WEBSOCKET = "ws://127.0.0.1:40102";
    const INVALID_WEBSOCKET = "ws://0.0.0.0:0";

    // Add WebRTC to Node.js environment.
    global.RTCPeerConnection = require("wrtc").RTCPeerConnection;

    // Set up Node.js StringDecoder.
    const { StringDecoder } = require("string_decoder");

    // Suppress console.error messages from being displayed.
    const error = jest.spyOn(console, "error").mockImplementation(() => { });  // eslint-disable-line no-empty-function

    /* eslint-disable no-magic-numbers */

    // Increase the Jest timeout from the default 5s.
    jest.setTimeout(10000);


    // Collect test data for subsequent tests.
    let initialChannelReadyState = null;
    let openChannelReadyState = null;
    let closingChannelReadyState = null;
    let closedChannelReadyState = null;
    let openNodeType = null;

    test("Can echo test message off domain server", (done) => {
        expect.assertions(2);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel.onopen = function () {
            let webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);

            // Collect extra test data.
            initialChannelReadyState = webrtcDataChannel.readyState;

            webrtcDataChannel.onopen = function () {

                // Collect extra test data.
                openChannelReadyState = webrtcDataChannel.readyState;
                openNodeType = webrtcDataChannel.nodeType;

                const echoMessage = "echo:Hello";
                const sent = webrtcDataChannel.send(echoMessage);
                expect(sent).toBe(true);
            };
            webrtcDataChannel.onmessage = function (data) {
                expect(new StringDecoder("utf8").write(new Uint8Array(data))).toBe("echo:Hello");
                webrtcDataChannel.close();

                // Collect extra test data.
                closingChannelReadyState = webrtcDataChannel.readyState;
            };
            webrtcDataChannel.onclose = function () {

                // Collect extra test data.
                closedChannelReadyState = webrtcDataChannel.readyState;

                webrtcDataChannel = null;
                webrtcSignalingChannel.close();
                webrtcSignalingChannel = null;
                done();
            };
        };
    });

    test("Data channel ready states reflect connection status", () => {
        expect.assertions(4);
        expect(initialChannelReadyState).toBe(WebRTCDataChannel.CONNECTING);
        expect(openChannelReadyState).toBe(WebRTCDataChannel.OPEN);
        expect(closingChannelReadyState).toBe(WebRTCDataChannel.CLOSING);
        expect(closedChannelReadyState).toBe(WebRTCDataChannel.CLOSED);
    });

    test("Data channel reports correct node type", () => {
        expect(openNodeType).toBe(NodeType.DomainServer);
    });

    test("Open with invalid address fails with an error", (done) => {
        expect.assertions(1);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(INVALID_WEBSOCKET);
        webrtcSignalingChannel.onerror = function () {
            let webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            webrtcDataChannel.onerror = function () {
                expect(webrtcDataChannel.readyState).toBe(WebRTCDataChannel.CLOSED);
                webrtcDataChannel = null;
                webrtcSignalingChannel = null;
                done();
            };
        };
    });

    test("Closing signaling channel while connecting data channel fails with an error", (done) => {
        expect.assertions(1);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel.onopen = function () {
            let webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            webrtcDataChannel.onerror = function () {
                expect(webrtcDataChannel.readyState).toBe(WebRTCDataChannel.CLOSED);
                webrtcDataChannel = null;
                webrtcSignalingChannel = null;
                done();
            };
            webrtcSignalingChannel.close();
        };
    });

    test("Sending when closed fails with an error", (done) => {
        expect.assertions(2);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel.onopen = function () {
            let webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            webrtcDataChannel.onopen = function () {
                webrtcDataChannel.close();
            };
            webrtcDataChannel.onclose = function () {
                expect(webrtcDataChannel.readyState).toBe(WebRTCDataChannel.CLOSED);
                const sent = webrtcDataChannel.send();
                expect(sent).toBe(false);
            };
            webrtcDataChannel.onerror = function () {
                webrtcDataChannel = null;
                webrtcSignalingChannel.close();
                webrtcSignalingChannel = null;
                done();
            };
        };
    });

    test("Data channels are kept separate", (done) => {
        expect.assertions(4);
        let webrtcSignalingChannel1 = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        let webrtcSignalingChannel2 = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        let webrtcDataChannel1 = null;
        let webrtcDataChannel2 = null;
        let repliesReceived = 0;
        webrtcSignalingChannel1.onopen = function () {
            webrtcSignalingChannel1.send({ to: NodeType.DomainServer, hello: "Channel 1..." });
            webrtcDataChannel1 = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel1);
            webrtcSignalingChannel1.send({ to: NodeType.DomainServer, hello: "... Channel 1" });
            webrtcDataChannel1.onopen = function () {
                const sent = webrtcDataChannel1.send("echo:Hello");
                expect(sent).toBe(true);
            };
            webrtcDataChannel1.onmessage = function (data) {
                expect(new StringDecoder("utf8").write(new Uint8Array(data))).toBe("echo:Hello");
                repliesReceived += 1;
                if (repliesReceived === 2) {
                    webrtcDataChannel1.close();
                    webrtcDataChannel2.close();
                }
            };
            webrtcDataChannel1.onclose = function () {
                webrtcDataChannel1 = null;
                webrtcSignalingChannel1.close();
                webrtcSignalingChannel1 = null;
            };
        };
        webrtcSignalingChannel2.onopen = function () {
            webrtcSignalingChannel2.send({ to: NodeType.DomainServer, hello: "Channel 2..." });
            webrtcDataChannel2 = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel2);
            webrtcSignalingChannel2.send({ to: NodeType.DomainServer, hello: "... Channel 2" });
            webrtcDataChannel2.onopen = function () {
                const sent = webrtcDataChannel2.send("echo:Goodbye");
                expect(sent).toBe(true);
            };
            webrtcDataChannel2.onmessage = function (data) {
                expect(new StringDecoder("utf8").write(new Uint8Array(data))).toBe("echo:Goodbye");
                repliesReceived += 1;
                if (repliesReceived === 2) {
                    webrtcDataChannel1.close();
                    webrtcDataChannel2.close();
                }
            };
            webrtcDataChannel2.onclose = function () {
                webrtcDataChannel2 = null;
                webrtcSignalingChannel2.close();
                webrtcSignalingChannel2 = null;
                done();
            };
        };
    });


    // WEBRTC TODO: "Can echo test message off messages mixer"

    // WEBRTC TODO: Add messages mixer to node types test.

    error.mockReset();
});
