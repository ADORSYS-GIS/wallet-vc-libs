import { PeerDIDResolver } from 'did-resolver-lib';
import type { DIDDoc } from 'didcomm';
/**
 * Key ID profiles for did:peer resolution.
 *
 * The did:peer specification rules that key IDs must be relative, assigned
 * in ascending numerical order as per the template "#key-{}". However, this
 * creates issues as cross-did keys become difficult to manage.
 *
 * Vendors disobey the rule with different absolute formats that we consider
 * for establishing operability.
 */
export declare enum PeerDIDResolverProfile {
    Default = 0,
    RootsID = 1
}
/**
 * This {@link DIDResolver} implementation ensures that returned
 * DID documents are opting for widely compatible format variants.
 */
export declare class StableDIDResolver extends PeerDIDResolver {
    private readonly peerDidResolverProfile;
    /**
     * @param peerDidResolverProfile - a key ID profile to apply for did:peer resolution
     */
    constructor(peerDidResolverProfile?: PeerDIDResolverProfile);
    /**
     * Returns current key ID profile to apply for did:peer resolution
     */
    getPeerDidResolverProfile(): PeerDIDResolverProfile;
    /**
     * Instantiates a mediator with the key ID profile matching a party.
     */
    enforceProfileForParty(did: string): Promise<StableDIDResolver>;
    /**
     * Resolves a DID document by the given DID.
     */
    resolve(did: string): Promise<DIDDoc | null>;
    /**
     * Reformats services, opting for structure variants compatible
     * with the didcomm library.
     */
    private normalizeServices;
    /**
     * Conforms key IDs to the format defined by the enabled profile.
     */
    private conformKeyIdFormatToProfile;
    /**
     * Preconfigure mappings of matching DID documents to preset profiles.
     * DID documents are matched based on an exposed service endpoint URI
     * that includes the key in the map.
     */
    private readonly peerDidDocPresetProfiles;
    /**
     * Resolves PeerDIDResolverProfile matching DID document from preset mappings.
     */
    private resolvePeerDIDResolverProfile;
}
