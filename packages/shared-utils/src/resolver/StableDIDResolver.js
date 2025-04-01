import { __awaiter } from "tslib";
import { PeerDIDResolver } from 'did-resolver-lib';
import { DIDCOMM_MESSAGING_SERVICE_TYPE } from '../constants';
import { isDIDCommMessagingServiceEndpoint } from '../utils/didcomm';
import { normalizeToArray } from '../utils/misc';
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
export var PeerDIDResolverProfile;
(function (PeerDIDResolverProfile) {
    // Simply prepends the did so the key ID is absolute: {did}#key-{}.
    PeerDIDResolverProfile[PeerDIDResolverProfile["Default"] = 0] = "Default";
    // Roots ID's current implementations swaps "#key-{}" for the base58
    // value of the key. Of course, the did is prepended so the key ID is
    // absolute. (Was this just an old version of the specs?)
    PeerDIDResolverProfile[PeerDIDResolverProfile["RootsID"] = 1] = "RootsID";
})(PeerDIDResolverProfile || (PeerDIDResolverProfile = {}));
/**
 * This {@link DIDResolver} implementation ensures that returned
 * DID documents are opting for widely compatible format variants.
 */
export class StableDIDResolver extends PeerDIDResolver {
    /**
     * @param peerDidResolverProfile - a key ID profile to apply for did:peer resolution
     */
    constructor(peerDidResolverProfile = PeerDIDResolverProfile.Default) {
        super();
        this.peerDidResolverProfile = peerDidResolverProfile;
        /**
         * Preconfigure mappings of matching DID documents to preset profiles.
         * DID documents are matched based on an exposed service endpoint URI
         * that includes the key in the map.
         */
        this.peerDidDocPresetProfiles = {
            rootsid: PeerDIDResolverProfile.RootsID,
        };
    }
    /**
     * Returns current key ID profile to apply for did:peer resolution
     */
    getPeerDidResolverProfile() {
        return this.peerDidResolverProfile;
    }
    /**
     * Instantiates a mediator with the key ID profile matching a party.
     */
    enforceProfileForParty(did) {
        return __awaiter(this, void 0, void 0, function* () {
            const diddoc = yield this.resolve(did);
            const profile = diddoc
                ? yield this.resolvePeerDIDResolverProfile(diddoc)
                : PeerDIDResolverProfile.Default;
            return new StableDIDResolver(profile);
        });
    }
    /**
     * Resolves a DID document by the given DID.
     */
    resolve(did) {
        const _super = Object.create(null, {
            resolve: { get: () => super.resolve }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const diddoc = yield _super.resolve.call(this, did);
            if (diddoc == null) {
                return diddoc;
            }
            // Normalize services to compatible variants
            diddoc.service = this.normalizeServices(diddoc.service);
            // Convert key IDs into the enabled profile
            yield this.conformKeyIdFormatToProfile(diddoc);
            return diddoc;
        });
    }
    /**
     * Reformats services, opting for structure variants compatible
     * with the didcomm library.
     */
    normalizeServices(services) {
        // Normalize services to the array variant
        services = normalizeToArray(services);
        // Reducing service endpoints to the single object variant.
        // If an array, service endpoints beyond the first element
        // will be dismissed
        services.forEach((service) => {
            if (Array.isArray(service.serviceEndpoint)) {
                service.serviceEndpoint = service.serviceEndpoint[0];
            }
        });
        // Normalize service endpoints of DIDCommMessaging services
        services
            .filter((service) => service.type == DIDCOMM_MESSAGING_SERVICE_TYPE)
            .forEach((service) => {
            let serviceEndpoint = service.serviceEndpoint;
            // Attempt to autocorrect malformed service endpoint
            if (!isDIDCommMessagingServiceEndpoint(serviceEndpoint)) {
                if (typeof serviceEndpoint === 'string') {
                    serviceEndpoint = { uri: serviceEndpoint };
                }
                else {
                    throw new Error('Failed to autocorrect malformed DIDCommMessaging service endpoint');
                }
            }
            // Duplicate routingKeys to routing_keys for compatibility
            const routingKeys = serviceEndpoint.routingKeys;
            if (!Array.isArray(serviceEndpoint.routing_keys)) {
                serviceEndpoint.routing_keys = normalizeToArray(routingKeys);
            }
            service.serviceEndpoint = serviceEndpoint;
        });
        return services;
    }
    /**
     * Conforms key IDs to the format defined by the enabled profile.
     */
    conformKeyIdFormatToProfile(diddoc) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!diddoc.id.startsWith('did:peer:')) {
                return;
            }
            if (this.peerDidResolverProfile == PeerDIDResolverProfile.RootsID) {
                const keyMapping = new Map();
                diddoc.verificationMethod.forEach((method) => {
                    var _a, _b;
                    const baseValue = (_a = method.publicKeyBase58) !== null && _a !== void 0 ? _a : (_b = method.publicKeyMultibase) === null || _b === void 0 ? void 0 : _b.replace(/^z/, '');
                    if (!baseValue) {
                        throw new Error(`No base value could be read for key ${method.id}`);
                    }
                    const newId = `${diddoc.id}#${baseValue}`;
                    keyMapping.set(method.id, newId);
                    method.id = newId;
                });
                diddoc.authentication = diddoc.authentication.map((key) => keyMapping.get(key));
                diddoc.keyAgreement = diddoc.keyAgreement.map((key) => keyMapping.get(key));
            }
        });
    }
    /**
     * Resolves PeerDIDResolverProfile matching DID document from preset mappings.
     */
    resolvePeerDIDResolverProfile(diddoc) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const serviceEndpointUris = diddoc.service
                .map((s) => s.serviceEndpoint)
                .filter(isDIDCommMessagingServiceEndpoint)
                .map((s) => s.uri);
            const presetKeys = Object.keys(this.peerDidDocPresetProfiles);
            const matchingPresetKey = presetKeys.find((presetKey) => serviceEndpointUris.some((uri) => uri.includes(presetKey)));
            if (!matchingPresetKey) {
                const diddocs = yield Promise.all(serviceEndpointUris
                    .filter((uri) => uri.startsWith('did:'))
                    .map((did) => this.resolve(did)));
                const profiles = yield Promise.all(diddocs
                    .filter((diddoc) => diddoc != null)
                    .map((diddoc) => this.resolvePeerDIDResolverProfile(diddoc)));
                return ((_a = profiles.find((p) => p != PeerDIDResolverProfile.Default)) !== null && _a !== void 0 ? _a : PeerDIDResolverProfile.Default);
            }
            return this.peerDidDocPresetProfiles[matchingPresetKey];
        });
    }
}
//# sourceMappingURL=StableDIDResolver.js.map