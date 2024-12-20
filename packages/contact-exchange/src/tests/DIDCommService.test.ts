import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';
import { processMediatorOOB } from '../services/DIDCommService';
import axios from 'axios';
jest.mock('axios');

describe('DIDCommRoutingService', () => {
  beforeEach(() => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { success: true } });
  });

  it('should process a valid OOB invitation for mediator coordination', async () => {
    const oob =
      'https://mediator.rootsid.cloud?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiNDM3MmIxODctMDk5Zi00MjYxLWFlZTctZjQwZWM5ZTg3Zjg3IiwiZnJvbSI6ImRpZDpwZWVyOjIuRXo2TFNtczU1NVloRnRobjFXVjhjaURCcFptODZoSzl0cDgzV29qSlVteFBHazFoWi5WejZNa21kQmpNeUI0VFM1VWJiUXc1NHN6bTh5dk1NZjFmdEdWMnNRVllBeGFlV2hFLlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCIsImJvZHkiOnsiZ29hbF9jb2RlIjoicmVxdWVzdC1tZWRpYXRlIiwiZ29hbCI6IlJlcXVlc3RNZWRpYXRlIiwibGFiZWwiOiJNZWRpYXRvciIsImFjY2VwdCI6WyJkaWRjb21tL3YyIl19LCJzZXJ2aWNlRW5kcG9pbnQiOiJodHRwczovL21lZGlhdG9yLnJvb3RzaWRjbG91ZC5jb20ifQ';

    (axios.post as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: { success: true },
    });
    (axios.post as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: { success: true },
    });

    const mediatorResponse = await processMediatorOOB(oob);

    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(mediatorResponse).toEqual({ success: true });
  });

  it.each([
    ['Invalid OOB format', 'invalid_oob_string'],
    ['Missing _oob query parameter', 'https://mediator.rootsid.cloud'],
    [
      'Missing _oob in query string',
      'https://mediator.rootsid.cloud?missing_oob_parameter',
    ],
    [
      'Improperly formatted base64',
      'https://mediator.rootsid.cloud?_oob=invalid_base64',
    ],
    [
      'Invalid JSON in base64',
      'https://mediator.rootsid.cloud?_oob=eyJmb28iOiJ9}',
    ],
    [
      'Empty DID from OOB payload',
      'https://mediator.rootsid.cloud?_oob=eyJmcm9tIjoiIn0',
    ],
  ])('should throw an error for %s', async (_, oob) => {
    await expect(processMediatorOOB(oob)).rejects.toThrow();
  });

  it('should throw an error for invalid DID generation', async () => {
    jest
      .spyOn(DidPeerMethod.prototype, 'generateMethod2')
      .mockRejectedValueOnce(new Error('Invalid DID generation'));
    const oob =
      'https://mediator.rootsid.cloud?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiNDM3MmIxODctMDk5Zi00MjYxLWFlZTctZjQwZWM5ZTg3Zjg3IiwiZnJvbSI6ImRpZDpwZWVyOjIuRXo2TFNtczU1NVloRnRobjFXVjhjaURCcFptODZoSzl0cDgzV29qSlVteFBHazFoWi5WejZNa21kQmpNeUI0VFM1VWJiUXc1NHN6bTh5dk1NZjFmdEdWMnNRVllBeGFlV2hFLlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd2N6b3ZMMjFsWkdsaGRHOXlMbkp2YjNSemFXUXVZMnh2ZFdRaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCIsImJvZHkiOnsiZ29hbF9jb2RlIjoicmVxdWVzdC1tZWRpYXRlIiwiZ29hbCI6IlJlcXVlc3RNZWRpYXRlIiwibGFiZWwiOiJNZWRpYXRvciJ9fQ';
    await expect(processMediatorOOB(oob)).rejects.toThrow(
      'Invalid DID generation',
    );
  });
});
