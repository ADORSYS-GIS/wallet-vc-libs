import {
  Message,
  DIDResolver,
  SecretsResolver,
  DIDDoc,
  Secret,
  SecretType,
} from 'didcomm-node';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { parseOOBInvitation } from './OOBParser';
import { MessageTyp, MessageType } from './DIDCommOOBInvitation';
import { DIDKeyPairMethod2 } from '@adorsys-gis/multiple-did-identities/dist/src/did-methods/IDidMethod';
import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/dist/src/did-methods/DidPeerMethod';
import { PeerDIDResolver } from 'did-resolver-lib';

class DidcommSecretsResolver implements SecretsResolver {
  knownSecrets: Secret[];

  constructor(knownSecrets: Secret[]) {
    this.knownSecrets = knownSecrets;
  }

  async get_secret(secretId: string): Promise<Secret | null> {
    return this.knownSecrets.find((secret) => secret.id === secretId) || null;
  }

  async find_secrets(secretIds: string[]): Promise<string[]> {
    return secretIds.filter((id) =>
      this.knownSecrets.find((secret) => secret.id === id),
    );
  }
}

function createSecretsResolver(knownSecrets: Secret[]): DidcommSecretsResolver {
  return new DidcommSecretsResolver(knownSecrets);
}

// Function to process OOB invitation
export async function processMediatorOOB(oob: string) {
  try {
    // Step 1 - Parse and decode OOB
    const oobUrl = oob.split('=')[1];
    const decodedOob = JSON.parse(
      Buffer.from(oobUrl, 'base64url').toString('utf-8'),
    );
    console.log('Decoded OOB:', decodedOob);
    const didTo = decodedOob.from;
    console.log('DID To:', didTo);

    // Step 2 - Create did
    const didPeerMethod = new DidPeerMethod();
    const didPeer: DIDKeyPairMethod2 = await didPeerMethod.generateMethod2();
    console.log('result:', JSON.stringify(didPeer, null, 2));

    // Step 3 - Prepare Mediation Request
    const mediationRequest = new Message({
      extra_header: [{ return_route: 'all' }],
      id: uuidv4(),
      typ: MessageTyp.Didcomm,
      type: MessageType.MediationRequest,
      body: {},
    });

    console.log('mediationRequest:', mediationRequest.as_value());

    // Step 4 - Pack mediation request
    const resolver = new PeerDIDResolver();

    const knownSecrets: Secret[] = [];
    didPeer.didDocument?.verificationMethod?.forEach((method) => {
      const privateKeyJwk =
        method.id === '#key-1'
          ? didPeer.privateKeyV
          : method.id === '#key-2'
            ? didPeer.privateKeyE
            : undefined;

      if (privateKeyJwk) {
        knownSecrets.push({
          id: `${didPeer.did}${method.id}`,
          type: method.type as SecretType,
          privateKeyJwk,
        });
      }
    });

    // Use the knownSecrets array with the secrets resolver
    const secretsResolver = createSecretsResolver(knownSecrets);

    console.log('Secrets Resolver:', JSON.stringify(secretsResolver, null, 2));

    const packedRequest = await mediationRequest.pack_encrypted(
      didTo,
      didPeer.did,
      didPeer.did,
      resolver,
      secretsResolver,
      { forward: false },
    );

    console.log('packedRequest:', packedRequest);

    // // Send to mediator
    // const mediatorDIDDoc = await didResolver.resolve(decodedOob.from);
    // if (!mediatorDIDDoc || !mediatorDIDDoc.service || !mediatorDIDDoc.service[0].serviceEndpoint) {
    //   throw new Error('Invalid mediator DID or service endpoint');
    // }
    // const mediatorEndpoint = mediatorDIDDoc.service[0].serviceEndpoint;
    // console.log('Mediator Endpoint:', mediatorEndpoint);

    //   const response = await axios.post(mediatorEndpoint, packedRequest.packed_msg, {
    //     headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
    //   });

    //   // Unpack Mediator Response
    //   const mediatorResponse = await Message.unpack(
    //     response.data,
    //     didResolver,
    //     secretsResolver,
    //     {},
    //   );

    //   const mediatorRoutingKey = mediatorResponse.body.routing_did;
    //   const mediatorNewDID = mediatorResponse.from_prior?.sub;
    //   console.log('Mediator Routing Key:', mediatorRoutingKey);
    //   console.log('Mediator New DID:', mediatorNewDID);

    //   // Keylist Update
    //   const aliceDIDForBob = `did:peer:${uuidv4()}`;
    //   const keylistUpdate = new Message({
    //     typ: '',
    //     id: uuidv4(),
    //     type: 'https://didcomm.org/coordinate-mediation/2.0/keylist-update',
    //     from: aliceDid,
    //     to: [mediatorNewDID],
    //     body: {
    //       updates: [
    //         {
    //           recipient_did: aliceDIDForBob,
    //           action: 'add',
    //         },
    //       ],
    //     },
    //   });

    //   const packedKeylistUpdate = await keylistUpdate.pack_encrypted(
    //     mediatorNewDID,
    //     aliceDid,
    //     null,
    //     didResolver,
    //     secretsResolver,
    //     { forward: false },
    //   );

    //   const keylistResponse = await axios.post(mediatorEndpoint, packedKeylistUpdate.packed_msg, {
    //     headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
    //   });

    //   const unpackedKeylistResponse = await Message.unpack(
    //     keylistResponse.data,
    //     didResolver,
    //     secretsResolver,
    //     {},
    //   );

    //   console.log('Keylist Update Response:', unpackedKeylistResponse);
    //   return unpackedKeylistResponse;
  } catch (error) {
    console.error('Error processing OOB:', error);
    throw error;
  }
}
