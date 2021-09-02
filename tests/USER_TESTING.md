# Vircadia Web SDK User Testing

An application developed using the Vircadia Web SDK should be able to satisfy a variety of user aims.
The test case scenarios in this document include specific tests that aren't necessarily covered by automated unit or
integration testing.

## General Testing

## Specific Tests

### WebRTC Connections

- Interface connection to a domain should automatically be re-established to the domain server and all assignment clients after
a network interruption (e.g., the user turning their WiFi router off and back on again.
This covers re-establishing the WebSocket signaling channel, the WebRTC data channels to the domain server and assignment clients,
and the Vircadia protocol being used to reconnect to the domain.
- Check browser log for JavaScript errors and server log files for unexpected errors during network interruptions.



## Test using the example Web app.
- Anonymously connect to and disconnect from a domain that allows anonymous connections. Domain server states should transition:
    "DISCONNECTED", "CONNECTING", "CONNECTED", "DISCONNECTED".
    Assignment client states should transition from "UNAVALABLE", "DISCONNECTED" (very briefly), "CONNECTED", "UNAVAILABLE".
- Try connecting anonymously to a domain that doesn't allow anonymous connections.
  - Domain server should go "CONNECTING" then end up at "REFUSED". 
  - Should see a warning message logged in the browser console, "The domain-server denied a connection request."
  - Should be able to disconnect, then try connecting again, which should end up in "REFUSED" state again.
  - While in "REFUSED" state, if the domain settings are changed to allow anonymous connection, you should automatically
    transition to "CONNECTED".
- Try connecting to a domain that requires login. You should end up at "REFUSED".
- Try connecting to an invalid URL. You should end up at "ERROR". __Has this been implemented?__
- While connected to a domain server, restart the domain server. You should be automatically reconnected with domain server and
  assignment client functionality automatically resuming. __Not yet implemented.__
- While connected to a domain server, restart one of the assignment clients being used. You should be automatically reconnected
  to that assignment client with its functionality automatically resuming. __Not yet implemented.__
