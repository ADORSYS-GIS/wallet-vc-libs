import { processMediatorOOB } from '../services/MediatorCoordination';

describe('DIDCommRoutingService', () => {
  it('should do the mediator coordination dance from an OOB', async () => {
    const oob =
      'https://mediator.socious.io?_oob=eyJpZCI6IjFkNjc5NzBlLTNjOGMtNDAxNy05M2VkLTY5ODVhZGQ5MWM1YyIsInR5cGUiOiJodHRwczovL2RpZGNvbW0ub3JnL291dC1vZi1iYW5kLzIuMC9pbnZpdGF0aW9uIiwiZnJvbSI6ImRpZDpwZWVyOjIuRXo2TFNrcDkyV2JRUThzQW5mSGJ5cGZVWHVUNkM3OHpWUnBOc0F6cFE3SE5rdHRpMy5WejZNa2pUTkRLbkV2Y3gyRXl0Zkw4QmVadmRHVWZFMTUzU2JlNFU3MjlNMnhkSDVILlNleUowSWpvaVpHMGlMQ0p6SWpwN0luVnlhU0k2SW1oMGRIQnpPaTh2YldWa2FXRjBiM0l1YzI5amFXOTFjeTVwYnlJc0ltRWlPbHNpWkdsa1kyOXRiUzkyTWlKZGZYMC5TZXlKMElqb2laRzBpTENKeklqcDdJblZ5YVNJNkluZHpjem92TDIxbFpHbGhkRzl5TG5OdlkybHZkWE11YVc4dmQzTWlMQ0poSWpwYkltUnBaR052YlcwdmRqSWlYWDE5IiwiYm9keSI6eyJnb2FsX2NvZGUiOiJyZXF1ZXN0LW1lZGlhdGUiLCJnb2FsIjoiUmVxdWVzdE1lZGlhdGUiLCJhY2NlcHQiOlsiZGlkY29tbS92MiJdfSwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1wbGFpbitqc29uIn0';
    const result = await processMediatorOOB(oob);
    console.log(result);
  }, 10000);
});
