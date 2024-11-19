# Index

- [Retrieve New Messages](#Retrieve-Messages)
- [Delete Messages](#Delete-Messages)
- [Retrieve DID](#Retrieve-DID)
- [Delete Contact](#Delete-Contact)
- [Register Contact](#Register-Contact)

# Retrieve New Messages

This event will bring new messages to the FE, which will be stored in the local storage. There will be a limit on cached messages. The limit will be per conversation. Once there are new messages that exceed the pile, we will delete old ones.

## Example logic

```javascript
if (cachedMessages.length > maxMessages) {
  const prunedMessages = cachedMessages.slice(-maxMessages);
  localStorage.setItem(key, JSON.stringify(prunedMessages));
}
```

## Example input:

```javascript
RetrieveMessages();
```

## Example response:

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

## Event channel name:

```bash
RetrieveMessages
```

# Delete Messages

This event will delete specific messages.

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
