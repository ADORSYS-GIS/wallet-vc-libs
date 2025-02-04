### Error Handling and Logging Guidelines

## Overview

This document provides guidelines for handling and logging errors in our codebase. We use a centralized approach to ensure consistency and maintainability.
We have two approaches to logging and handling errors in our codebase

### Approach One

## Directory Structure

All error handling and logging logic is centralized in the `errors-logs` directory within the `src/lib` folder.
This is just an example. You can decide where or ehich folder to centralize your logging and error logic.

```bash
src
├── lib
│   └── errors-logs
│       ├── logger.ts
│       ├── CustomServiceError.ts
│       ├── ServiceA.errors.ts
│       ├── ServiceB.errors.ts
│       └── ServiceC.errors.ts
```

## Logger Implementation

The logger.ts file contains the logError function, which logs error details to the console.

```ts
// logger.ts
export interface LogErrorDetails {
  name: string;
  message: string;
  stack?: string;
  context?: string;
}

export function logError(error: Error, context: string): void {
  const errorDetails: LogErrorDetails = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
  };

  // Log to the console
  console.error(`[Error] ${context}:`, errorDetails);
}
```

## Custom Error Classes

We define custom error classes to handle specific error types. For example, CustomServiceError

```ts
// CustomServiceError.ts
export class CustomServiceError extends Error {
  public constructor(message: string) {
    super(`CustomServiceError: ${message}`);
    this.name = 'CustomServiceError';
  }
}
```

## Error Enumerations

We use enums to define error messages for different services. For example:

```ts
// ServiceA.errors.ts
export enum ServiceAError {
  Generic = 'Generic error in Service A',
  MissingParameter = 'Missing required parameter',
  InvalidFormat = 'Invalid format',
}
```

**Usage in Services**
Here are examples of how to use the centralized logging and error handling logic in service files.

ServiceA.ts

```ts
import { logError } from '../lib/errors-logs/logger';
import { CustomServiceError } from '../lib/errors-logs/CustomServiceError';
import { ServiceAError } from '../lib/errors-logs/ServiceA.errors';

export function serviceAFunction(param: string): void {
  try {
    if (!param) {
      throw new CustomServiceError(ServiceAError.MissingParameter);
    }

    // Service logic here
  } catch (error) {
    if (error instanceof CustomServiceError) {
      logError(error, 'Service A');
    } else {
      logError(new Error('Unknown error'), 'Service A');
    }
  }
}
```

ServiceB.ts

```ts
import { logError } from '../lib/errors-logs/logger';
import { CustomServiceError } from '../lib/errors-logs/CustomServiceError';
import { ServiceBError } from '../lib/errors-logs/ServiceB.errors';

export function serviceBFunction(data: any): void {
  try {
    if (typeof data !== 'object') {
      throw new CustomServiceError(ServiceBError.InvalidFormat);
    }

    // Service logic here
  } catch (error) {
    if (error instanceof CustomServiceError) {
      logError(error, 'Service B');
    } else {
      logError(new Error('Unknown error'), 'Service B');
    }
  }
}
```

ServiceC.ts

```ts
import { logError } from '../lib/errors-logs/logger';
import { CustomServiceError } from '../lib/errors-logs/CustomServiceError';
import { ServiceCError } from '../lib/errors-logs/ServiceC.errors';

export function serviceCFunction(input: string): void {
  try {
    if (!input) {
      throw new CustomServiceError(ServiceCError.MissingInput);
    }

    // Service logic here
  } catch (error) {
    if (error instanceof CustomServiceError) {
      logError(error, 'Service C');
    } else {
      logError(new Error('Unknown error'), 'Service C');
    }
  }
}
```

## Best Practices

1. **Consistent Logging**: Always use the logError function to log errors.
2. **Custom Errors**: Define and use custom error classes for specific error types.
3. **Error Enumerations**: Use enums to define error messages for different services or components
4. **Centralized Directory**: Keep all error handling and logging logic in the errors-logs directory.

By following these guidelines, we ensure that our error handling and logging are consistent, maintainable, and easy to understand for all developers.

### Approach Two

# Error Handling and Logging Guidelines for Event-Driven Architecture

## Overview

This document provides guidelines for handling and logging errors in an event-driven architecture. We use event emitters to communicate success and error messages between different parts of the application. A shared error handler is used to log errors and emit error responses consistently.

## Key Components

1. **Event Emitters**: Used to emit events for success and error messages.
2. **Event Channels**: Custom event channels to categorize and manage different types of events.
3. **Shared Error Handler**: A function that logs errors and emits error responses.

## Event Channels

We define custom event channels to categorize and manage different types of events. Each event channel has a unique string identifier.

```ts
export enum EventChannel {
  CreateItem = 'item-created',
  DeleteItem = 'item-deleted',
  GetItem = 'get-item',
  GetAllItems = 'get-all-items',
}
```

## Shared Error Handler

The shared error handler logs errors and emits error responses. This ensures consistent error handling across the application.

```ts
import { EventEmitter } from 'eventemitter3';

function sharedErrorHandler(channel: EventChannel, eventBus: EventEmitter) {
  return (error: unknown) => {
    console.error(`Error occurred in channel ${channel}:`, error);
    const response = {
      status: 'error',
      payload: error instanceof Error ? error : new Error(String(error)),
    };
    eventBus.emit(channel, response);
  };
}
```

## Service Example

Here's an example of a service that uses the event-driven approach and the shared error handler:

```ts
import { EventEmitter } from 'eventemitter3';
import { EventChannel } from './EventChannel';

class ItemService {
  private eventBus: EventEmitter;

  constructor(eventBus: EventEmitter) {
    this.eventBus = eventBus;
  }

  public async createItem(data: any): Promise<void> {
    const createItemChannel = EventChannel.CreateItem;

    try {
      // Simulate item creation logic
      const item = { id: 'item123', ...data };

      // Simulate storing the item
      // await this.itemRepository.createItem(item);

      const response = {
        status: 'success',
        payload: { item },
      };

      this.eventBus.emit(createItemChannel, response);
    } catch (error) {
      this.sharedErrorHandler(createItemChannel)(error);
    }
  }

  public async deleteItem(itemId: string): Promise<void> {
    const deleteItemChannel = EventChannel.DeleteItem;

    try {
      // Simulate item deletion logic
      // await this.itemRepository.deleteItem(itemId);

      const response = {
        status: 'success',
        payload: {
          message: `Item with ID ${itemId} was successfully deleted.`,
        },
      };

      this.eventBus.emit(deleteItemChannel, response);
    } catch (error) {
      this.sharedErrorHandler(deleteItemChannel)(error);
    }
  }

  private sharedErrorHandler(channel: EventChannel) {
    return sharedErrorHandler(channel, this.eventBus);
  }
}

// Create an instance of EventEmitter
const eventBus = new EventEmitter();

// Create an instance of ItemService
const itemService = new ItemService(eventBus);

// Example usage
itemService.createItem({ name: 'Sample Item' });
itemService.deleteItem('item123');
```

## Explanation

1. **Event Emitters**: The EventEmitter instance (eventBus) is used to emit events for success and error messages.
2. **Event Channels**: Custom event channels (EventChannel) are used to categorize and manage different types of events.
3. **Shared Error Handler**: The sharedErrorHandler function logs errors and emits error responses. It is used within the service methods to handle errors consistently.
4. **Service Methods**: The ItemService class contains methods (createItem and deleteItem) that perform operations and use the shared error handler to manage errors.

## Best Practices

1. **Consistent Error Handling**: Always use the shared error handler to log and emit error responses.
2. **Event-Driven Communication**: Use event emitters to communicate success and error messages between services and the frontend.
3. **Custom Event Channels**: Define custom event channels to categorize and manage different types of events.

By following these guidelines, we ensure that our error handling and logging are consistent, maintainable, and easy to understand for all developers.
