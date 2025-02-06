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

export const aliceDidNoDeref = // The mediator's endpoint is directly specified as HTTPS URL
  'did:peer:2.Ez6LSsecNaN6QsJEbozUdkyLz6Yq31ehKNUi1wguWopKeXCXN.Vz6MksGYNRHbQY7cSUE7C4JFrGyc19XZXgyqsYxZt9ijszYtj.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOnsidXJpIjoiaHR0cHM6Ly9tZWRpYXRvci5yb290c2lkLmNsb3VkIiwgInJvdXRpbmdLZXlzIjpbImRpZDpwZWVyOjIuRXo2TFNkWVdieDlQSGY1cGF1cWlTTVhvekNTRHFhblN0N0hyWVlReVk5UW9Cekg1Ui5WejZNa3ZTaHNtTTFZc1BRVHJzWHNSUkU1RzlRY2s5Zm5nTk05RnpOOVdiZGc5dTQ1LlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCJdfX0';

export const aliceDidInvalidMediatorUri = // The mediator's endpoint is an FTP URL :-(
  'did:peer:2.Ez6LSsecNaN6QsJEbozUdkyLz6Yq31ehKNUi1wguWopKeXCXN.Vz6MksGYNRHbQY7cSUE7C4JFrGyc19XZXgyqsYxZt9ijszYtj.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOnsidXJpIjoiZnRwOi8vbWVkaWF0b3Iucm9vdHNpZC5jbG91ZCIsICJyb3V0aW5nS2V5cyI6WyJkaWQ6cGVlcjoyLkV6NkxTZFlXYng5UEhmNXBhdXFpU01Yb3pDU0RxYW5TdDdIcllZUXlZOVFvQnpINVIuVno2TWt2U2hzbU0xWXNQUVRyc1hzUlJFNUc5UWNrOWZuZ05NOUZ6TjlXYmRnOXU0NS5TZXlKcFpDSTZJbTVsZHkxcFpDSXNJblFpT2lKa2JTSXNJbk1pT2lKb2RIUndjem92TDIxbFpHbGhkRzl5TG5KdmIzUnphV1F1WTJ4dmRXUWlMQ0poSWpwYkltUnBaR052YlcwdmRqSWlYWDAiXX19';

export const aliceDidInvalidServiceEndpoint = // A service endpoint is unexpectedly a number
  'did:peer:2.Ez6LSsecNaN6QsJEbozUdkyLz6Yq31ehKNUi1wguWopKeXCXN.Vz6MksGYNRHbQY7cSUE7C4JFrGyc19XZXgyqsYxZt9ijszYtj.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOjEyMzR9';
