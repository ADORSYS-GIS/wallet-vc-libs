// Types for DIDComm and Out of Band (OOB) Invitations
interface DIDCommMessage {
  id: string;
  type: string;
  from: string;
  to: string[];
  created_time: string;
  body?: unknown;
  attachments?: unknown[];
}

interface OutOfBandInvitation {
  '@id': string;
  '@type': string;
  '@cid': string;
  label?: string;
  goal?: string;
  goal_code?: string;
  services: Array<string | OutOfBandService>;
  attachments?: Array<unknown>;
}

interface OutOfBandService {
  id: string;
  type: string;
  serviceEndpoint: string;
  recipientKeys: string[];
  routingKeys?: string[];
  accept?: string[];
}

export { DIDCommMessage, OutOfBandInvitation, OutOfBandService };
