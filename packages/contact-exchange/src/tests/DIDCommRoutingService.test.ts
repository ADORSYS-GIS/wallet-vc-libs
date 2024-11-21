// import { DIDDoc, DIDResolver, Secret, SecretsResolver } from "didcomm-node";
// import { processMediatorOOB } from "../services/DIDCommRoutingService";

import { PeerDIDResolver } from 'did-resolver-lib';

describe('DIDCommRoutingService', () => {
    it('should do the mediator coordination dance from an OOB', async () => {
        // const oob = 'https://mediator.rootsid.cloud?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiNDM3MmIxODctMDk5Zi00MjYxLWFlZTctZjQwZWM5ZTg3Zjg3IiwiZnJvbSI6ImRpZDpwZWVyOjIuRXo2TFNtczU1NVloRnRobjFXVjhjaURCcFptODZoSzl0cDgzV29qSlVteFBHazFoWi5WejZNa21kQmpNeUI0VFM1VWJiUXc1NHN6bTh5dk1NZjFmdEdWMnNRVllBeGFlV2hFLlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCIsImJvZHkiOnsiZ29hbF9jb2RlIjoicmVxdWVzdC1tZWRpYXRlIiwiZ29hbCI6IlJlcXVlc3RNZWRpYXRlIiwibGFiZWwiOiJNZWRpYXRvciIsImFjY2VwdCI6WyJkaWRjb21tL3YyIl19fQ';
        // const didResolver = new MediatorServiceDIDResolver([]);
        // const secretsResolver = new MediatorServiceSecretsResolver([]);

        const aliceDid = ` did:peer:2.Ez6LSms555YhFthn1WV8ciDBpZm86hK9tp83WojJUmxPGk1hZ.Vz6MkmdBjMyB4TS5UbbQw54szm8yvMMf1ftGV2sQVYAxaeWhE.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOiJodHRwczovL21lZGlhdG9yLnJvb3RzaWQuY2xvdWQiLCJhIjpbImRpZGNvbW0vdjIiXX0`;

        const resolver = new PeerDIDResolver();
        const resolved = await resolver.resolve(aliceDid);

        console.log(resolved);

    
        // const response = await processMediatorOOB(oob, didResolver, secretsResolver);
        // console.log('Test Response:', response);
      });
    });

