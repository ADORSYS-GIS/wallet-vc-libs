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

export const aliceDid =
  'did:peer:2.Ez6LSsecNaN6QsJEbozUdkyLz6Yq31ehKNUi1wguWopKeXCXN.Vz6MksGYNRHbQY7cSUE7C4JFrGyc19XZXgyqsYxZt9ijszYtj.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOlt7InVyaSI6ImRpZDpwZWVyOjIuRXo2TFNkWVdieDlQSGY1cGF1cWlTTVhvekNTRHFhblN0N0hyWVlReVk5UW9Cekg1Ui5WejZNa3ZTaHNtTTFZc1BRVHJzWHNSUkU1RzlRY2s5Zm5nTk05RnpOOVdiZGc5dTQ1LlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCJ9XSwiYSI6WyJkaWRjb21tL3YyIl19';
