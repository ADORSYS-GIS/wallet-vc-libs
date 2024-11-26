# Index

- [Retrieve Messages](#Retrieve-Messages)
- [Delete Messages](#Delete-Messages)
- [Retrieve DID](#Retrieve-DID)
- [Delete Contact](#Delete-Contact)
- [Register Contact](#Register-Contact)

# Retrieve New Messages

The retrieval of messages has the following calls:

1) Initial Sync (or Cache Miss Detection and Full Sync)
2) Periodic Retrieve (Incremental Sync)
3) User Scrolls Up - Polling (On-Demand Fetching for Older Messages)

Description.- Messages on the frontend will have a pile structure based on dates. Meaning, the frontend will keep the latest messages and will drop older ones. Call number 1 will populate this pile. This call will be called when the app is initialized or if errors are detected. Imagine this pile populates the messages view of a messaging app.

Call number 2 will bring new messages to the previously mentioned pile. 

Call number 3 will bring a paginated set of messages for older conversations. The user will select a specific conversation and this call will be triggered to request older messages. 

This approach aims to reduce the calls load yet providing a consistent and lightway approach to handle messages communication between the FE and BE. 

## Initial Sync (or Cache Miss Detection and Full Sync)

### Example input:

```javascript
RetrieveMessagesInitial();
```

### Example response:

```json
{
  "status": "success",
  "payload": [
    {
      "did": "did:peer(..)",
      "contact": "Alice",
      "message": {"Hey Peter, bring bread."},
      "id": 3
    },
    {
      "did": "did:peer(..)",
      "contact": "Bob",
      "message": {"Hey Bob, bring butter."},
      "id": 2
    },
    {
      "did": "did:peer(..)",
      "contact": "Hugo",
      "message": {"Hey Jan, bring Salt."},
      "id": 1
    }
  ]
}
```

### Event channel name:
```bash
RetrieveMessagesInitial
```

## Periodic Retrieve (Incremental Sync)

This event will retrieve new messages that recently came from the  mediator.

### Example input:

```javascript
RetrieveMessagesPeriodic(since=2024-11-25T12:00:00Z);
```

### Example response:

```json
{
  "status": "success",
  "payload": [
    {
      "did": "did:peer(..)",
      "contact": "Alice",
      "message": {"Hey Peter, bring bread."},
      "id": 3
    },
    {
      "did": "did:peer(..)",
      "contact": "Bob",
      "message": {"Hey Bob, bring butter."},
      "id": 2
    },
    {
      "did": "did:peer(..)",
      "contact": "Hugo",
      "message": {"Hey Jan, bring Salt."},
      "id": 1
    }
  ]
}
```

### Event channel name:
```bash
RetrieveMessagesPeriodic
```

## User Scrolls Up - Polling (On-Demand Fetching for Older Messages)

This event will retrieve old messages under user demand.

### Example input:

```javascript
RetrieveMessagesPaginated(did, date, pollSize);
```

### Example response:

```json
{
  "status": "success",
  "payload": [
    {
      "did": "did:peer(..)",
      "contact": "Alice",
      "message": {"Hey Peter, bring bread."},
      "id": 3
    },
    {
      "did": "did:peer(..)",
      "contact": "Bob",
      "message": {"Hey Bob, bring butter."},
      "id": 2
    },
    {
      "did": "did:peer(..)",
      "contact": "Hugo",
      "message": {"Hey Jan, bring Salt."},
      "id": 1
    }
  ]
}
```

### Event channel name:
```bash
RetrieveMessagesPaginated
```

# Delete Messages

This event will delete specific messages.

## Example input:

```javascript
DeleteMessages(did, id);
DeleteMessages('did:peer', 3);
```

## Example input:

```javascript
DeleteMessages(messageId);
DeleteMessages(3);
```

## Example response:

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

## Event channel name:

```bash
DeleteMessages
```

# Retrieve DIDWithMediator

This event will retrieve the DID where the mediator will receive messages for the user.

## Example input:

```javascript
RetrieveDIDWithMediator();
```

## Example response:

```json
{
  "did_for_mediation": "did:peer:2.Ez6LSiopL5aJjRbTu8ZB8uinhodhP7GiSix9DFG5rr2Xp93mg.Vz6MkrnJCtTmSuhoVXUSS8CxZkesWuwHaeHbyp7NT3Z3c9ZoA",
  "status": "true",
  "message": "Success"
}
```

```json
{
  "status": "false",
  "message": "error"
}
```

## Event channel name:

```bash
RetrieveDIDWithMediator
```

# Delete Contact

This event will delete a registered contact.

## Example input:

```javascript
DeleteContact(
  'did:peer:2.Ez6LSiopL5aJjRbTu8ZB8uinhodhP7GiSix9DFG5rr2Xp93mg.Vz6MkrnJCtTmSuhoVXUSS8CxZkesWuwHaeHbyp7NT3Z3c9ZoA',
);
```

## Example response:

```json
{
  "status": "true",
  "message": "Success"
}
```

```json
{
  "status": "false",
  "message": "error"
}
```

## Event channel name:

```bash
DeleteContact
```

# Register contact

This event will add a new contact.

## Example input:

```javascript
AddContact(
  'did:peer:2.Ez6LSiopL5aJjRbTu8ZB8uinhodhP7GiSix9DFG5rr2Xp93mg.Vz6MkrnJCtTmSuhoVXUSS8CxZkesWuwHaeHbyp7NT3Z3c9ZoA',
);
```

## Example response:

```json
{
  "status": "true",
  "message": "Success"
}
```

```json
{
  "status": "false",
  "message": "error"
}
```

## Event channel name:

```bash
AddContact
```
