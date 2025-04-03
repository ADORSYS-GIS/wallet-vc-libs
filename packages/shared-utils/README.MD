# Shared Utils

A utility library providing common functionality for working with DIDs (Decentralized Identifiers) and DIDComm messaging across the wallet-vc-libs ecosystem.

## Keywords

```
did, didcomm, decentralized-identity, verifiable-credentials, peer-did, did-resolution,
identity-management, cryptography, public-key, jwk, base58, messaging, utilities,
typescript, wallet, vc, verifiable-credentials-wallet
```

## Features

| **Category**   | **Description**                                                                  | **Status**     |
| -------------- | -------------------------------------------------------------------------------- | -------------- |
| DID Resolution | Provides a stable DID resolver implementation for peer DIDs                      | ✅ Implemented |
| DIDComm Utils  | Helper functions for working with DIDComm messaging endpoints and key conversion | ✅ Implemented |
| General Utils  | Common utility functions for array normalization and other operations            | ✅ Implemented |

## Installation

```bash
npm install @adorsys-gis/shared-utils
```

## Usage

### DID Resolution

The package provides a `StableDIDResolver` for resolving peer DIDs:

```ts
import {
  StableDIDResolver,
  PeerDIDResolverProfile,
} from '@adorsys-gis/shared-utils';

const resolver = new StableDIDResolver();
const didDocument = await resolver.resolve('did:peer:2...');
```

### DIDComm Utilities

Helper functions for working with DIDComm messaging:

```ts
import {
  isDIDCommMessagingServiceEndpoint,
  jwkToPublicKeyBase58,
} from '@adorsys-gis/shared-utils';

// Check if an endpoint is a valid DIDComm messaging service
const isValid = isDIDCommMessagingServiceEndpoint(endpoint);

// Convert JWK to base58 public key
const publicKey = jwkToPublicKeyBase58(jwk);
```

### General Utilities

Common utility functions:

```ts
import { normalizeToArray } from '@adorsys-gis/shared-utils';

// Normalize input to array
const array = normalizeToArray(input); // Returns [input] if input is not an array
```

## Constants

The package exports commonly used constants:

```ts
import { DIDCOMM_MESSAGING_SERVICE_TYPE } from '@adorsys-gis/shared-utils';
```

## Testing

The library includes comprehensive tests for all its functionality, ensuring reliability and correctness of the utilities provided.

## Integration

This package is designed to work seamlessly with other packages in the wallet-vc-libs ecosystem, particularly:

- message-exchange
- message-service
- multiple-did-identities

## Contributing

When contributing to this package, ensure that:

1. All new utilities are properly typed
2. Unit tests are provided for new functionality
3. Documentation is updated to reflect any changes
4. Changes maintain backward compatibility where possible
