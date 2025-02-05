# Message Exchange

A library for implementing services to support message exchange between DIDComm agents.

## Features

| **Protocol** | **Description** | **Status** |
|--------------|-----------------|------------|
| [DIDComm Message Routing](https://identity.foundation/didcomm-messaging/spec/#routing-protocol-20) | Send a message to a DIDComm agent via their mediators. | ✅ Implemented |
| [Message Pickup](https://didcomm.org/messagepickup/3.0) | Pick up messages from mediators. | 🚧 Not yet implemented |

## Installation

```bash
npm install @adorsys-gis/message-exchange
```

## Usage

### Prerequisites

Before using the library, you'll need a DID address for the sending party. This can be created using the `DIDIdentityService` from the peer library `@adorsys-gis/multiple-did-identities`. Here's an example of generating a DID using that library:

```ts
export const generateIdentity = async (secretPinNumber: number) => {
  const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
  
  didIdentityService.createDidIdentity(
    DIDMethodName.Peer,
    secretPinNumber,
    PeerGenerationMethod.Method2,
  );

  const data = (await createEvent) as ServiceResponse<{ did: string }>;
  return data.payload.did;
};
```

Once you have the `senderDid`, you can send messages using the `MessageExchangeService`.

### Using the `MessageExchangeService`

The `MessageExchangeService` is designed to work seamlessly with an event bus architecture. Here's how to send a message from a sender to a recipient:

```ts
import { MessageExchangeService } from '@adorsys-gis/message-exchange';
import { MessageExchangeEvent } from '@adorsys-gis/message-exchange';

const messageExchangeService = new MessageExchangeService(eventBus, secretPinNumber);

// Listen on the MessageExchangeEvent.RouteForwardMessages event

messageExchangeService.routeForwardMessage(message, recipientDid, senderDid);

// Wait for an acknowledgement on MessageExchangeEvent.RouteForwardMessages
```

### Using the `MessageRouter` Interface

If your application does not use an event bus, you can interact directly with the `MessageRouter` interface:

```ts
import { MessageRouter } from '@adorsys-gis/message-exchange';

const messageRouter = new MessageRouter(
  didRepository,
  messageRepository,
  secretPinNumber,
);

const sentMessage = await messageRouter.routeForwardMessage(
  message,
  recipientDid,
  senderDid,
);
```

### Additional Help

For more examples and detailed scenarios, consider referring to the test cases in the project.
