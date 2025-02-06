import type { ServiceResponse} from '../ServiceResponse';
import { ServiceResponseStatus } from '../ServiceResponse';

describe('ServiceResponse', () => {
  it('should create a success response', () => {
    const response: ServiceResponse<string> = {
      status: ServiceResponseStatus.Success,
      payload: 'Data retrieved successfully',
    };
    expect(response.status).toBe(ServiceResponseStatus.Success);
    expect(response.payload).toBe('Data retrieved successfully');
  });

  it('should create an error response', () => {
    const response: ServiceResponse<string> = {
      status: ServiceResponseStatus.Error,
      payload: 'An error occurred',
    };
    expect(response.status).toBe(ServiceResponseStatus.Error);
    expect(response.payload).toBe('An error occurred');
  });
});
