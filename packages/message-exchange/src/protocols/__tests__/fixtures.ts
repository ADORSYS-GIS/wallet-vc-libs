import {
  DIDIdentityService,
  SecurityService,
} from '@adorsys-gis/multiple-did-identities';
import { EventEmitter } from 'eventemitter3';

export const eventBus = new EventEmitter();
export const securityService = new SecurityService();
export const didIdentityService = new DIDIdentityService(
  eventBus,
  securityService,
);

export const waitForEvent = (channel: string) => {
  return new Promise((resolve) => {
    eventBus.once(channel, (data) => resolve(data));
  });
};

export const aliceDid =
  'did:peer:2.Ez6LSo84iMnSj2Pebx5MBxJWcYLgqsNPCXXPTBVH1LrHxP6kZ.Vz6MkrdhV3NGiJ7dauKUc3AfKJqq3H4VWHFiUgpyuQhZDNuUb.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOlt7InVyaSI6ImRpZDpwZWVyOjIuRXo2TFNnckhuUmgyTUJLRnpYNlJSb0VFY0VOQVFqR210NUZiaWtkOW5CZkpzR1hDYy5WejZNa3ZvTm14NEZjVG5IdkZLN1BNTm90Y3J6c1B3NXlaTjdDcHhtOEJUZmFKdGZZLlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCJ9XSwiYSI6WyJkaWRjb21tL3YyIl19';
