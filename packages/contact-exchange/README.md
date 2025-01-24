# Mediator Coordination Protocol Library

## Overview

- This library implements a mediator coordination protocol that facilitates the handling of out-of-band (OOB) invitations and the mediation of messages between decentralized identities (DIDs). The library provides functionalities for parsing, validating, and processing OOB invitations.

## Features

- Out-of-Band Invitation Handling: Accepts and processes OOB invitations, validating their format and structure.

- Mediator Coordination: Facilitates the mediation of messages between DIDs, including sending mediation requests and handling responses.

## Installation

- To use this library, ensure you have TypeScript and Node.js installed. You can install the library via npm:

```bash
npm i @adorsys-gis/contact-exchange
```

## Usage

1. To use the functionalities provided by the library, import the necessary modules:

```bash

import { parseOOBInvitation, processOOBInvitation, handleOOBInvitation } from '@adorsys-gis/contact-exchange';
import { Wallet } from '@adorsys-gis/contact-exchange';
```

2. You can parse an OOB invitation from a URL or a JSON string. The parseOOBInvitation function will return an OutOfBandInvitation object or null if the invitation is invalid, but before handling invitations, you need to create a wallet instance to manage contacts:

```bash
const wallet = new Wallet();

const invitationUrl = 'https://example.com?_oob=encodedInvitation';
const invitation = parseOOBInvitation(invitationUrl);

if (invitation) {
  console.log('Parsed invitation:', invitation);
} else {
  console.error('Invalid invitation format');
}
```

3. Once you have a valid invitation, you can handle it using the handleOOBInvitation function. This function will add the contact to the wallet if the invitation is valid. And also to process the invitation and create a DIDCommMessage, use the processOOBInvitation function. This function will return a DIDCommMessage object or null if the invitation is invalid.

```bash
const invitationUrl = 'https://example.com?_oob=encodedInvitation';
const invitation = parseOOBInvitation(invitationUrl);

if (invitation) {
  console.log('Parsed invitation:', invitation);
} else {
  console.error('Invalid invitation format');
}

const identity = 'did:example:123456789';
handleOOBInvitation(wallet, invitation, identity);
```

4. The library also includes a DidService class that can be used to process mediator OOB invitations and send mediation requests. You can create an instance of DidService and call the processMediatorOOB method.

```bash
import { DidService } from 'your-library-name';
import { EventEmitter } from 'eventemitter3';

const eventBus = new EventEmitter();
const didService = new DidService(eventBus, securityService);

const oobInvitation = 'your-oob-invitation-string';
didService.processMediatorOOB(oobInvitation)
  .then(response => {
    console.log('Mediation response received:', response);
  })
  .catch(error => {
    console.error('Error processing mediator OOB:', error);
  });
```

## Error Handling

The library includes error handling for various operations. If an operation fails, appropriate error messages will be logged to the console. Ensure to handle errors gracefully in your application.

## Building

Run `npm run build ` to build the library.

## Running unit tests

Run `npm run test ` to execute the unit tests via [Jest](https://jestjs.io).

## Basic overview of the library

```

          +---------------+
          |  Wallet     |
          +---------------+
                  |
                  |  DIDComm Messaging
                  |
                  v
          +---------------+
          |  Contact Storage|
          +---------------+
                  |
                  |  (Accessible by all identities)
                  |
                  v
          +---------------+
          |  Identities    |
          +---------------+
               |
                  |  DIDComm Messaging
                  |
                  v
            +---------------+
            |  Wallet        |
            +---------------+

```

## Conclusion

This library provides a robust implementation of a mediator coordination protocol, allowing for seamless handling of out-of-band invitations and mediation of messages between decentralized identities. By following the outlined usage instructions, you can easily integrate this library into your application. For further assistance, please refer to the source code or reach out to the maintainers.
