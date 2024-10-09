/**
 * Represents the status of a service operation.
 */
export enum ServiceResponseStatus {
  Success = 'success',
  Error = 'error',
}

/**
 * Interface representing the response from a service operation.
 *
 * @template T - The type of the payload returned in the response.
 *
 * @property {ServiceResponseStatus} status - The status of the operation (success or error).
 * @property {T} payload - The data returned from the operation, which can be of any type.
 */
export interface ServiceResponse<T = unknown> {
  status: ServiceResponseStatus;
  payload: T;
}
