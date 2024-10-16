// Updated Types for DIDComm and Out of Band (OOB) Invitations
interface DIDCommMessage {
  serviceId: string;
  id: string;
  type: string;
  from: string;
  to: string[];
  created_time: string;
  body?: unknown;
  attachments?: unknown[];
}

interface OutOfBandInvitation {
  encodedPart: string;
  id: string;
  from: string;
  type: string;
  goal?: string;
  goal_code?: string;
  body: {
    goal_code?: string;
    goal?: string;
    accept?: string[];
  };
  attachments?: Array<unknown>;
}

export { DIDCommMessage, OutOfBandInvitation };
