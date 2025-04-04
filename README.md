# wallet-vc-libs

A comprehensive TypeScript library ecosystem for building Verifiable Credentials (VC) wallets and DIDComm-based applications.

## Overview

wallet-vc-libs is a modular collection of TypeScript packages that provide the building blocks for creating secure, decentralized identity applications. The ecosystem is designed around the principles of DIDComm messaging, Verifiable Credentials, and decentralized identity management.

## Packages

| Package                                                                  | Description                                         | Status |
| ------------------------------------------------------------------------ | --------------------------------------------------- | ------ |
| [@adorsys-gis/shared-utils](packages/shared-utils)                       | Common utilities for DID and DIDComm operations     | ✅     |
| [@adorsys-gis/message-exchange](packages/message-exchange)               | DIDComm message routing and exchange implementation | ✅     |
| [@adorsys-gis/message-service](packages/message-service)                 | Message management and event-driven communication   | ✅     |
| [@adorsys-gis/multiple-did-identities](packages/multiple-did-identities) | Multi-DID identity management and operations        | ✅     |
| [@adorsys-gis/contact-exchange](packages/contact-exchange)               | Contact information exchange protocols              | ✅     |
| [@adorsys-gis/contact-service](packages/contact-service)                 | Contact management and operations                   | ✅     |
| [@adorsys-gis/didcomm](packages/didcomm)                                 | Core DIDComm protocol implementation                | ✅     |
| [@adorsys-gis/event-bus](packages/event-bus)                             | Event-driven communication bus                      | ✅     |
| [@adorsys-gis/storage](packages/storage)                                 | Secure storage solutions                            | ✅     |
| [@adorsys-gis/status-service](packages/status-service)                   | Service status management                           | ✅     |
| [@adorsys-gis/cloning-decorator](packages/cloning-decorator)             | Object cloning utilities                            | ✅     |
| [@adorsys-gis/usePWA](packages/usePWA)                                   | Progressive Web App utilities                       | ✅     |
| [@adorsys-gis/qr-scanner](packages/qr-scanner)                           | QR code scanning capabilities                       | ✅     |
| [@adorsys-gis/message-pickup](packages/message-pickup)                   | DIDComm message pickup protocol                     | ✅     |

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm
- TypeScript

### Installation

You can install individual packages as needed:

```bash
npm install @adorsys-gis/shared-utils
npm install @adorsys-gis/message-exchange
# ... etc
```

Or install all packages:

```bash
npm install @adorsys-gis/shared-utils @adorsys-gis/message-exchange @adorsys-gis/message-service # ... etc
```

## Architecture

The wallet-vc-libs ecosystem is built with a modular architecture:

- **Core Layer**: DIDComm, event-bus, and storage packages
- **Identity Layer**: multiple-did-identities and shared-utils
- **Communication Layer**: message-exchange, message-service, and message-pickup
- **Contact Layer**: contact-exchange and contact-service
- **Utility Layer**: cloning-decorator, usePWA, and qr-scanner

## Features

- **Decentralized Identity**: Support for multiple DID methods and identity management
- **Secure Messaging**: DIDComm v2.0 compliant messaging
- **Verifiable Credentials**: Tools for VC issuance, presentation, and verification
- **Contact Management**: Secure contact exchange and management
- **Event-Driven Architecture**: Built on a robust event bus system
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Modular Design**: Use only the packages you need

## Development

### Building

```bash
# Build all packages
npm run build

# Build specific package
cd packages/<package-name>
npm run build
```

### Testing

```bash
# Test all packages
npm run test

# Test specific package
cd packages/<package-name>
npm run test
```

## Support

For support, please open an issue in the repository or contact the maintainers.

## Acknowledgments

- DIDComm v2.0 Specification
- W3C Verifiable Credentials
- DIF (Decentralized Identity Foundation)
