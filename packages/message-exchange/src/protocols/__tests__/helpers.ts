import { EventEmitter } from 'eventemitter3';
import { ServiceResponse } from '@adorsys-gis/status-service';

import {
  DidEventChannel,
  DIDIdentityService,
  DIDMethodName,
  PeerGenerationMethod,
  SecurityService,
} from '@adorsys-gis/multiple-did-identities';

export const waitForEvent = (channel: string) => {
  return new Promise((resolve) => {
    eventBus.once(channel, (data) => resolve(data));
  });
};

export const generateIdentity = async (secretPinNumber: number) => {
  const createEvent = waitForEvent(DidEventChannel.CreateDidIdentity);
  didIdentityService.createDidIdentity(
    DIDMethodName.Peer,
    secretPinNumber,
    PeerGenerationMethod.Method2,
  );

  const data = (await createEvent) as ServiceResponse<{ did: string }>;
  return data.payload.did;
};

export const eventBus = new EventEmitter();
export const securityService = new SecurityService();
export const didIdentityService = new DIDIdentityService(
  eventBus,
  securityService,
);
