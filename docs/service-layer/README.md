This document outlines the communication between the frontend and the service layer. The frontend calls methods inside the service layer and the service layer replies using events.

# Index

- [Service layer overview](#Service-Layer-Overview)
- [Event code examples](#Event-Code-examples)
- [Alice registers with mediator](#Alice-registers-with-mediator)
- [Bob adds contact](#Bob-adds-contact)
- [Bob sends a message routed via mediator](#Bob-sends-a-message-routed-via-mediator)
- [Alice checks status requests](#Alice-checks-messages)
- [Other event channels](#Other-events)

# Service layer overview

The service layer aims to organize the services. A service in this context would be the resolution of a credential offer, a request for a credential issuance or an event to interact with the wallet such as the deletion of a credential.

![Event Architecture](./event-architecture.png 'Event architecture')

Benefits of this architecture:

- **Improved security by decoupling components.** The frontend lacks access to business logic, enforcing strict separation for improved security.

- **Flexibility.** We could integrate different frontends into the engine, allowing for a versatile and adaptable architecture that can accommodate various user interfaces or requirements.

- **Performance and scalability.** Asynchronicity is at the core of all communication, which means the system can handle requests without waiting for responses. This approach improves the overall performance and scalability of the system.

# Event code examples

On the service layer side, there is an instantiation of event methods here:

- [OID4VCIService.ts](https://github.com/adorsys/eudiw-app/blob/86ef72c949f0a7d00011349051fdb8d58d3f22e8/libs/oid4vc/src/lib/OID4VCIService.ts#L24)

- [OID4VCService.ts](https://github.com/adorsys/eudiw-app/blob/86ef72c949f0a7d00011349051fdb8d58d3f22e8/libs/oid4vc/src/lib/OID4VCService.ts#L10)

- [OID4VPService.ts](https://github.com/adorsys/eudiw-app/blob/86ef72c949f0a7d00011349051fdb8d58d3f22e8/libs/oid4vc/src/lib/OID4VPService.ts#L14)

On the front end layer, an example interacting with the method: OID4VCIService.retrieveCredentialHeaders() can be found here:

- [Credentials.tsx](https://github.com/adorsys/eudiw-app/blob/86ef72c949f0a7d00011349051fdb8d58d3f22e8/apps/wallet-react/src/pages/credentials/Credentials.tsx#L29)

# Alice registers with mediator

This flow currently starts with the scan of a QR code and it is composed of one call:

The backend will be in charge of the calls to the mediator and will only notify the frontend once the mediation coordination has been successful or it has failed.

## ProcessMediatorOOB

The frontend will send the credential offer string resulting from the QR code scan. The service layer will reply with an acknoledgment or an error.

### Example input:

```javascript

  ProcessMediatorOOB("https://mediator.rootsid.cloud?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiNDM3MmIxODctMDk5Zi00MjYxLWFlZTctZjQwZWM5ZTg3Zjg3IiwiZnJvbSI6ImRpZDpwZWVyOjIuRXo2TFNtczU1NVloRnRobjFXVjhjaURCcFptODZoSzl0cDgzV29qSlVteFBHazFoWi5WejZNa21kQmpNeUI0VFM1VWJiUXc1NHN6bTh5dk1NZjFmdEdWMnNRVllBeGFlV2hFLlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCIsImJvZHkiOnsiZ29hbF9jb2RlIjoicmVxdWVzdC1tZWRpYXRlIiwiZ29hbCI6IlJlcXVlc3RNZWRpYXRlIiwibGFiZWwiOiJNZWRpYXRvciIsImFjY2VwdCI6WyJkaWRjb21tL3YyIl19fQ")

```

### Example response:

```json
{
  "status": "false",
  "message": "Error, format not valid"
}
```

```json
{
  "status": "true",
  "message": "Success"
}
```

### Event channel name:

```bash
ProcessMediatorOOB
```

## Bob adds contact

The frontend will send the did:peer from a QR code scan or a string. The service layer will reply with an acknoledgment or an error.

### Example input:

```javascript
StoreContact("did:peer:2.Ez6LSiopL5aJjRbTu8ZB8uinhodhP7GiSix9DFG5rr2Xp93mg.Vz6MkrnJCtTmSuhoVXUSS8CxZkesWuwHaeHbyp7NT3Z3c9ZoA")

```

### Example response:

```json
{
  "status": "false",
  "message": "Error, format not valid"
}
```

```json
{
  "status": "true",
  "message": "Success"
}
```

### Event channel name:

```bash
StoreContact
```

## Bob sends a message routed via mediator

The frontend will send the did:peer and the content from the message. The service layer will reply with an acknoledgment or an error.

### Example input:

```javascript
RouteForwardMessages(peer_did, message);
// example:
RouteForwardMessages("did:peer:2.Ez6LSiopL5aJjRbTu8ZB8uinhodhP7GiSix9DFG5rr2Xp93mg.Vz6MkrnJCtTmSuhoVXUSS8CxZkesWuwHaeHbyp7NT3Z3c9ZoA", "Hey bob, hope you are doing fine. I miss you.");
```

### Example response:

```json
{
  "status": "false",
  "message": "Error, {}"
}
```

```json
{
  "status": "true",
  "message": "Success"
}
```

### Event channel name:

```bash
RouteForwardMessages
```

## Alice checks status requests

The frontend will check for new messages. Following an email like architecture, the call will be triggered by the FE and not by an independent job on the BE. Reasons:

User-Driven Polling: In an email-like architecture, checking for new messages is often based on the user's activity—such as opening the chat app or manually refreshing. It’s efficient to trigger the status-request call only when the client is actively requesting it, rather than having a backend job that checks continuously for every user.

Reduced Server Load: If a backend job is set up to check for new messages frequently, it could increase server load. Frontend-triggered requests help limit the number of status checks to just what’s necessary.

Real-Time Experience: If you want to add real-time message notifications, a combination of frontend-triggered status-request checks and possibly WebSocket-based updates would allow for a more dynamic experience.

### Example input:

```json
void
```

This method receives no input.

### Example response:

```json
{
  "status": "false",
  "message": "Error, {}"
}
```

```json
{
  "status": "true",
  "message": "Success"
}
```

### Event channel name:

```bash
ReceiveMessages
```

# Other events

There are also other events happening inside the app, like the retrieval of already existing messages, deletion of them, etc...

A complete description of these calls can be found [here.](./other-events.md)
