import type { DIDCommMessagingService } from 'didcomm';

/**
 * Type guard for {@link DIDCommMessagingService}
 */
export function isDIDCommMessagingServiceEndpoint(
  arg: unknown,
): arg is DIDCommMessagingService {
  return (
    arg != null &&
    typeof arg == 'object' &&
    'uri' in arg &&
    arg.uri !== undefined
  );
} 