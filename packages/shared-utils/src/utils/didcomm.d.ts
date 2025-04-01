import type { JWKKeys as JWK } from '@adorsys-gis/multiple-did-identities';
import type { DIDCommMessagingService } from 'didcomm';
/**
 * Type guard for {@link DIDCommMessagingService}
 */
export declare function isDIDCommMessagingServiceEndpoint(arg: unknown): arg is DIDCommMessagingService;
/**
 * Computes the Base58 representation of a public JWK.
 */
export declare function jwkToPublicKeyBase58(jwk: JWK): string;
