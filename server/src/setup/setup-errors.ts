export class InvalidAdminSetupError extends Error {
  constructor() {
    super('Invalid Admin Setup');
    this.name = 'InvalidAdminSetupError';
  }
}
