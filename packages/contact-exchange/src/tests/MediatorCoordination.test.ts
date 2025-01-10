import { processMediatorOOB } from '../services/MediatorCoordination';

describe('DIDCommRoutingService', () => {
  it('should do the mediator coordination dance from an OOB', async () => {

    const oob = 'http://alice-mediator.com/:3000?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiZTE5YzE2OWEtZDRiOS00YWQwLTk4ZDUtOTljZDY4Nzc0NzZiIiwiZnJvbSI6ImRpZDpwZWVyOjIuVno2TWtqYzcySG9LZ2RBUXdrZ1JVeEtNQlRHZHd4WXNDMzdoUWVLd1BucjFOUkdwZS5FejZMU2pHaGE4MUsyb2s2VWV2ZjR0ZUxRNHBOQkgyVzVXVmtYTFBTdUt2VnRkZFZ3LlNleUpwWkNJNklpTmthV1JqYjIxdElpd2ljeUk2ZXlKaElqcGJJbVJwWkdOdmJXMHZkaklpWFN3aWNpSTZXMTBzSW5WeWFTSTZJbWgwZEhBNkx5OWhiR2xqWlMxdFpXUnBZWFJ2Y2k1amIyMHZJbjBzSW5RaU9pSmtiU0o5IiwiYm9keSI6eyJnb2FsX2NvZGUiOiJyZXF1ZXN0LW1lZGlhdGUiLCJnb2FsIjoiUmVxdWVzdCBNZWRpYXRlIiwibGFiZWwiOiJNZWRpYXRvciIsImFjY2VwdCI6WyJkaWRjb21tL3YyIl19fQ'
    await processMediatorOOB(oob);
  });
});
