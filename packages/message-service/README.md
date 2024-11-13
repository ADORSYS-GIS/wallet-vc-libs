# MessageService Library

**MessageService** is a TypeScript-based library designed for managing message operations in a structured and event-driven way. It provides functionality to create, retrieve, and delete messages while ensuring seamless integration with data persistence and communication via events.

## Features

- **Event-Driven Architecture**: Uses an event bus to emit and listen to events for various operations, enabling responsive and decoupled components.
- **Message Management**: Supports core message operations such as creating new messages, retrieving messages by contact, and deleting individual or all messages associated with a contact.
- **Error Handling**: Includes a centralized error handling mechanism that emits standardized error responses, ensuring consistent and predictable error management across all operations.

## Event Channels

Each operation in MessageService is associated with a specific event channel:

- **CreateMessage**: Triggered when a new message is successfully created.
- **GetAllByContactId**: Triggered when retrieving messages by a contact ID.
- **DeleteMessage**: Triggered when deleting a specific message.
- **DeleteAllByContactId**: Triggered when deleting all messages for a particular contact.

These channels provide flexibility to manage and respond to specific events independently.

## Benefits

- **Consistency**: Unified response format for all events and error handling.
- **Scalability**: Event-driven approach allows for easy scaling and extension.
- **Reliability**: Error handling encapsulated in each method provides reliable communication and prevents unhandled exceptions.

## Testing

The library includes comprehensive tests for each of its operations, ensuring that both successful workflows and error cases are covered. This makes it reliable and safe to integrate into larger systems.
