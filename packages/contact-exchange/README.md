# Contact Exchange Library

This library was generated with [Nx](https://nx.dev).

# Building the Library

- Before builld, please move to the root directory of the library folder, that is **contact-exchange** and installl dependencies with :

```bash
npm i
``

## Building

Run `npm run build ` to build the library.

## Running unit tests

Run `nx run test ` to execute the unit tests via [Jest](https://jestjs.io).

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

```
