# Message Pickup

A library for implementing services to support the retrieval of messages from DIDComm agents via mediators.

## Features

| **Protocol**                                                    | **Description**                  | **Status**     |
| --------------------------------------------------------------- | -------------------------------- | -------------- |
| [DIDComm Message Pickup](https://didcomm.org/messagepickup/3.0) | Pick up messages from mediators. | ✅ Implemented |

## Installation

To install the library, run the following command:

```bash
npm install @adorsys-gis/message-pickup
```

## Usage

### Prerequisites

Before using the library, you'll need a DID address for the sending party. This can be created using the `DIDIdentityService` from the peer library `@adorsys-gis/multiple-did-identities`. Here's an example of generating a DID using that library:

```typescript
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

### Using the `MessagePickupService`

The `MessagePickupService` is designed to work seamlessly with an event bus architecture. Here's how to pick up messages from a mediator:

```typescript
import { MessagePickupService } from '@adorsys-gis/message-pickup';
import { MessagePickupEvent } from '@adorsys-gis/message-pickup';

const messagePickupService = new MessagePickupService(
  eventBus,
  secretPinNumber,
);

// Listen on the MessagePickupEvent.MessagePickup event
const channel = waitForEvent(MessagePickupEvent.MessagePickup);
await messagePickupService.ReceiveMessages(mediatorDid, aliceDid);

// Wait for an acknowledgement on MessagePickupEvent.MessagePickup
const eventData = await channel;
console.log('Received event data:', eventData);
```

### Using the `MessagePickup` Class Directly

If your application does not use an event bus, you can interact directly with the `MessagePickup` class:

```typescript
import { MessagePickup } from '@adorsys-gis/message-pickup';

const messagePickup = new MessagePickup(
  didRepository,
  secretPinNumber,
  messageRepository,
);
const messageCount = await messagePickup.processStatusRequest(
  mediatorDid,
  aliceDidForMediator,
);
console.log('Message count:', messageCount);
```

### Additional Help

For more examples and detailed scenarios, consider referring to the test cases in the project.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes. For contribution guidelines, please refer to the CONTRIBUTING.md file.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
