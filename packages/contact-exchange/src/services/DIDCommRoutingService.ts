import {
  Message,
  DIDResolver,
  SecretsResolver,
  DIDDoc,
  Secret,
} from 'didcomm-node';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { parseOOBInvitation } from './OOBParser';
import { MessageTyp, MessageType } from './DIDCommOOBInvitation';


// Function to process OOB invitation
export async function processMediatorOOB(oob: string, didResolver: DIDResolver, secretsResolver: SecretsResolver) {
  try {
    // Parse and decode OOB
    const oobUrl = oob.split('=')[1];
    const decodedOob = JSON.parse(
      Buffer.from(oobUrl, 'base64url').toString('utf-8'),
    );
    console.log('Decoded OOB:', decodedOob);

    // Create Alice's DID
    const aliceDid = ` did:peer:2.Ez6LSms555YhFthn1WV8ciDBpZm86hK9tp83WojJUmxPGk1hZ.Vz6MkmdBjMyB4TS5UbbQw54szm8yvMMf1ftGV2sQVYAxaeWhE.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOiJodHRwczovL21lZGlhdG9yLnJvb3RzaWQuY2xvdWQiLCJhIjpbImRpZGNvbW0vdjIiXX0`;
    console.log("Alice's DID:", aliceDid);

    //const result: DIDKeyPairMethod2 = await didPeerMethod.generateMethod2();

    // Send Mediation Request
    const mediationRequest = new Message({
      extra_header: [{"return_route": "all"}],
      id: uuidv4(),
      typ: MessageTyp.Didcomm,
      type: MessageType.MediationRequest,
      body: {},
    });

    console.log('other did:', decodedOob.from);

    const packedRequest = await mediationRequest.pack_encrypted(
      decodedOob.from,
      aliceDid,
      null,
      didResolver,
      secretsResolver,
      { forward: false },
    );

    console.log('packedRequest:', packedRequest);


    // Send to mediator
    const mediatorDIDDoc = await didResolver.resolve(decodedOob.from);
    if (!mediatorDIDDoc || !mediatorDIDDoc.service || !mediatorDIDDoc.service[0].serviceEndpoint) {
      throw new Error('Invalid mediator DID or service endpoint');
    }
    const mediatorEndpoint = mediatorDIDDoc.service[0].serviceEndpoint;
    console.log('Mediator Endpoint:', mediatorEndpoint);

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
