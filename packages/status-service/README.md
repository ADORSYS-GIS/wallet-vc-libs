# Status Service Library

The **Status Service Library** provides a standardized way to handle and represent the outcomes of service operations in TypeScript applications. It defines a clear structure for responses, allowing developers to manage success and error scenarios efficiently.

## Features

- **Enum for Status Representation**: The library includes an `enum`, `ServiceResponseStatus`, which delineates two possible states of a service operation: `Success` and `Error`. This helps maintain clarity when checking the results of operations.

- **Generic Response Interface**: The `ServiceResponse` interface allows for a flexible response structure, accommodating various payload types. This interface includes:
  - `status`: Indicates whether the operation was successful or encountered an error.
  - `payload`: Contains the data returned from the operation, which can be of any specified type.

## Usage

The library is designed to be easy to integrate into your existing TypeScript projects. By leveraging the `ServiceResponse` interface, you can consistently handle responses across different service calls, making your codebase more maintainable and understandable.

## Example

```typescript
import { ServiceResponse, ServiceResponseStatus } from 'status-service';

// Example of a successful service response
const successResponse: ServiceResponse<string> = {
  status: ServiceResponseStatus.Success,
  payload: 'Operation completed successfully.',
};

// Example of an error service response
const errorResponse: ServiceResponse<null> = {
  status: ServiceResponseStatus.Error,
  payload: null,
};
```
