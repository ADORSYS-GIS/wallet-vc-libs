# contact-exchange

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build contact-exchange` to build the library.

## Running unit tests

Run `nx test contact-exchange` to execute the unit tests via [Jest](https://jestjs.io).

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
          |  Contact Storage  |
          +---------------+
                  |
                  |  (Accessible by all identities)
                  |
                  v
          +---------------+
          |  Identities    |
          +---------------+
          |       |
                  |  DIDComm Messaging
                  |
                  v
            +---------------+
              Wallet          |
            +---------------+


```
