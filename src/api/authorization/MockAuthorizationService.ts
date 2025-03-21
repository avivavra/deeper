import { AuthorizationService } from './AuthorizationService';

export class MockAuthorizationService implements AuthorizationService {
  async isAuthorized(): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 1000)); // Mock delay
  }
}
