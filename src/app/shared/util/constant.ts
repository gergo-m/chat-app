export enum ErrorMessage {
  FORM_ERROR = 'Please correct the form errors.',
  INVALID_CRED = 'Invalid email or password.',
  AUTH_FAILED = 'Authentication failed. Please try again.',
  UNEXPECTED_ERR = 'An unexpected error occurred.',
  INCORRECT_PASSWORD = 'Incorrect password.'
}

export enum Visibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PASSWORD = 'password'
}

export enum Collection {
  USERS = 'users',
  CHATROOMS = 'chatrooms'
}

export enum ProviderType {
  GOOGLE = 'google',
  GITHUB = 'github',
  INVALID = 'invalid'
}
