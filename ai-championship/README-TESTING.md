# Production-Ready Testing Setup

## Overview
This testing setup uses **real Firebase services** with emulators for production-like testing without mocking.

## Test Structure
```
test/
├── app/           # Authentication integration tests
├── api/           # API route integration tests  
├── components/    # Component integration tests
├── firebase/      # Firebase rules validation
└── utils/         # Test utilities
```

## Setup & Running Tests

### 1. Install Dependencies
```bash
npm install --save-dev @firebase/rules-unit-testing @testing-library/react @testing-library/jest-dom node-mocks-http
```

### 2. Start Firebase Emulators
```bash
npm run test:emulators
```

### 3. Run Tests
```bash
# All tests
npm test

# Integration tests only
npm run test:integration

# Unit tests only  
npm run test:unit

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Categories

### Authentication Tests (`test/app/auth.test.ts`)
- Real Firebase Auth operations
- User registration/login flows
- Firestore document creation
- Error handling

### API Integration Tests (`test/api/*.test.ts`)
- Real API route testing
- Request/response validation
- Error scenarios

### Component Integration Tests (`test/components/*.test.tsx`)
- Real Firebase interactions
- Form submissions
- User workflows

### Security Rules Tests (`test/firebase/firebase.rules.test.ts`)
- Firestore security rules validation
- Permission testing
- Access control verification

## Environment Configuration

### Test Environment (`.env.test`)
- Uses Firebase emulators
- Test-specific configuration
- Isolated from production

### Firebase Emulators
- Auth: `localhost:9099`
- Firestore: `localhost:8080`
- Storage: `localhost:9199`

## Best Practices

1. **No Mocking**: Tests use real Firebase services via emulators
2. **Cleanup**: Automatic cleanup of test data after each test
3. **Isolation**: Each test runs in isolation
4. **Real Workflows**: Tests mirror production user flows
5. **Security**: Rules testing ensures proper access control

## Running in CI/CD

```yaml
# GitHub Actions example
- name: Start Firebase Emulators
  run: firebase emulators:start --only auth,firestore,storage &
  
- name: Run Tests
  run: npm test
```

## Debugging Tests

1. Check emulator logs: `firebase emulators:start --debug`
2. Use `console.log` in tests for debugging
3. Check Firebase emulator UI: `http://localhost:4000`