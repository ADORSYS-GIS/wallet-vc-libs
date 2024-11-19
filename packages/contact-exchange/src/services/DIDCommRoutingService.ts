import {
  Message,
  DIDResolver,
  SecretsResolver,
  DIDDoc,
  Secret,
} from 'didcomm-node';
import { v4 as uuidv4 } from 'uuid';
import { MessageTyp, MessageType } from './DIDCommOOBInvitation';
import axios from 'axios';
import { validEncodedUrl } from '../tests/OOBTestFixtures';
import { parseOOBInvitation } from './OOBParser';

// Mock DID Resolver
class MediatorServiceDIDResolver implements DIDResolver {
  knownDids: DIDDoc[];

  constructor(knownDids: DIDDoc[]) {
    this.knownDids = knownDids;
  }

  async resolve(did: string): Promise<DIDDoc | null> {
    return this.knownDids.find((ddoc) => ddoc.id === did) || null;
  }
}

class MediatorServiceSecretsResolver implements SecretsResolver {
  knownSecrets: Secret[];

  constructor(knownSecrets: Secret[]) {
    this.knownSecrets = knownSecrets;
  }

  async get_secret(secretId: string): Promise<Secret | null> {
    return this.knownSecrets.find((secret) => secret.id === secretId) || null;
  }

  async find_secrets(secretIds: string[]): Promise<string[]> {
    return secretIds.filter((id) =>
      this.knownSecrets.some((secret) => secret.id === id),
    );
  }
}

export async function processMediatorOOB(oob: string){
  const invitation = parseOOBInvitation(oob);
  console.log(invitation);
  return true;
}

// This function retrieves the Out-of-Band (OOB) URL from the Mediator.
export async function getOutOfBandInvitation() {
  try {
    const response = await axios.get(
      `${MessageType.RoutingAccept}/${validEncodedUrl}`,
    );
    const oobUrl = response.data;
    console.log('OOB URL:', oobUrl);
    return oobUrl;
  } catch (error) {
    console.error('Error fetching OOB invitation:', error);
    throw error;
  }
}

// This function sends a Mediation Request to the Mediator
export async function requestMediation(
  senderDid: string,
  mediatorDid: string,
  secretsResolver: SecretsResolver,
  didResolver: DIDResolver,
): Promise<string> {
  try {
    const response = await axios.get(
      `${MessageType.RoutingAccept}/${validEncodedUrl}`,
    );
    if (!response.data) {
      throw new Error('OOB invitation not found');
    }
    const oobUrl = response.data;
    console.log('OOB URL:', oobUrl);

    const messageBody = {
      type: MessageType.MediationRequest,
      from: senderDid,
    };

    const routedMessage = new Message({
      id: uuidv4(),
      typ: MessageTyp.Didcomm,
      type: MessageType.MediationRequest,
      from: senderDid,
      to: [mediatorDid],
      created_time: Math.floor(Date.now() / 1000),
      body: messageBody,
    });

    const [encryptedMsg] = await routedMessage.pack_encrypted(
      mediatorDid,
      senderDid,
      senderDid,
      didResolver,
      secretsResolver,
      {
        forward: false,
      },
    );

    return encryptedMsg;
  } catch (error) {
    console.error('Error requesting mediation:', error);
    throw error;
  }
}

// This function sends the mediation request.
export async function sendToMediator(encryptedMsg: string) {
  try {
    const response = await axios.post(`${MessageType.MediationMediate}`, {
      message: encryptedMsg,
    });
    console.log('Sent to mediator:', response.data);
  } catch (error) {
    console.error('Error sending to mediator:', error);
    throw error;
  }
}

// This function handles the Mediation Response
export async function handleMediationResponse(
  encryptedMsg: string,
  didResolver: DIDResolver,
  secretsResolver: SecretsResolver,
): Promise<void> {
  try {
    const [unpackedMsg] = await Message.unpack(
      encryptedMsg,
      didResolver,
      secretsResolver,
      {},
    );

    const messageBody = unpackedMsg.as_value();
    if (messageBody.type === MessageType.MediationResponse) {
      if (messageBody.from === messageBody.to) {
        console.log(
          `Received self-mediation response: ${JSON.stringify(messageBody)}`,
        );
        return;
      }
      console.log(
        `Received mediation response: ${JSON.stringify(messageBody)}`,
      );
    }
  } catch (error) {
    console.error('Error handling mediation response:', error);
    throw error;
  }
}

// This function handles the Keylist Update
export async function handleKeylistUpdate(
  senderDid: string,
  mediatorDid: string,
  secretsResolver: SecretsResolver,
  didResolver: DIDResolver,
  keyId: string,
): Promise<string> {
  try {
    const messageBody = {
      id: uuidv4(),
      type: MessageType.KeylistUpdate,
      from: senderDid,
      to: [mediatorDid],
      created_time: Math.floor(Date.now() / 1000),
      body: {
        type: MessageType.KeylistUpdate,
        from: senderDid,
        keyId: keyId,
      },
    };

    const keyListUpdateMessage = new Message({
      id: uuidv4(),
      typ: MessageTyp.Didcomm,
      type: MessageType.KeylistUpdate,
      from: senderDid,
      to: [mediatorDid],
      created_time: Math.floor(Date.now() / 1000),
      body: messageBody,
    });

    const [encryptedMsg] = await keyListUpdateMessage.pack_encrypted(
      mediatorDid,
      senderDid,
      senderDid,
      didResolver,
      secretsResolver,
      {
        forward: false,
      },
    );

    console.log(encryptedMsg);
    return encryptedMsg;
  } catch (error) {
    console.error('Error handling keylist update:', error);
    throw error;
  }
}

export { MediatorServiceDIDResolver, MediatorServiceSecretsResolver };
