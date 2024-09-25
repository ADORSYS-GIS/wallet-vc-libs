# EventBus Library

This library implements an EventBus for managing event-driven systems. It is built using eventemitter3, allowing subscribers to listen for and emit events with both synchronous and asynchronous handling. Additionally, the library includes deep-cloning capabilities for transferred objects.

## Features

Event-driven system: Subscribe to and emit custom events.
Asynchronous event handling: Supports async operations and provides robust event lifecycle management.
Deep cloning: Ensures that emitted data structures are deeply cloned, preventing mutations in subscribers.
