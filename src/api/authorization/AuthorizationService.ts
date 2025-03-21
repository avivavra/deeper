export interface AuthorizationService {
  isAuthorized(): Promise<boolean>;
}
