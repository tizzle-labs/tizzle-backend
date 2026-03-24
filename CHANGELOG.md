# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Authentication**: Fixed "Invalid signature" error in wallet authentication (2026-03-24)
  - Implemented proper Solana off-chain message signing standard
  - Added `\xffsolana offchain` prefix with message length encoding (16 bytes header + 2 bytes LE length)
  - Changed header encoding from UTF-8 to ASCII (critical fix for signature verification)
  - Updated signature verification to match wallet behavior (Phantom, Solflare, etc.)
  - Reference: https://docs.solanalabs.com/proposals/off-chain-message-signing

### Added

- Comprehensive wallet authentication documentation (`docs/WALLET_AUTHENTICATION.md`)
- Manual signature verification test script (`scripts/test-signature-verification.ts`)
- Integration test for auth service basic functionality

### Changed

- Updated tweetnacl import to use `import * as nacl` for better TypeScript compatibility

### To Be Implemented

- Users module with profile management
- Organizations module with CRUD operations
- Events module with full management
- Registrations module with check-in system
- Badges module with progress tracking
- Analytics module with TVL calculation
- Helius webhook integration
- Unit and E2E tests
- Monitoring and logging system
- CI/CD pipeline

## [0.1.0] - 2024-03-24

### Added

- Initial project setup with NestJS
- TypeScript configuration with strict mode
- ESLint and Prettier setup
- Docker and Docker Compose configuration
- Dockerfile for production deployment

#### Database

- PostgreSQL integration with Drizzle ORM
- Complete database schema:
  - Users table with unique username
  - Organizations table
  - Events table with multi-token support
  - Registrations table
  - Badges table with types and tiers
  - User Badges table with progress tracking
  - Event Analytics table
- Database migration system
- Drizzle Studio integration

#### Authentication

- Wallet-based authentication system
- Solana signature verification with tweetnacl
- Nonce generation and validation
- JWT token management
- Refresh token support
- Auth endpoints:
  - POST /api/v1/auth/nonce
  - POST /api/v1/auth/verify
  - GET /api/v1/auth/me
  - POST /api/v1/auth/refresh

#### Solana Integration

- Solana RPC connection via Helius
- Anchor program initialization
- Multi-token support:
  - Native SOL
  - SPL Token (standard)
  - Token-2022 (extensions)
- PDA derivation helpers
- Account fetching utilities
- Event status calculation
- Transaction verification

#### Storage

- Cloudflare R2 integration
- Organized folder structure:
  - avatars/users/
  - avatars/organizations/
  - images/events/
  - images/badges/
- Auto-delete old files on update
- Presigned URL generation
- File validation

#### Caching

- Redis integration
- Cache service with helpers
- TTL management
- Pattern-based deletion
- Increment operations

#### Security

- JWT authentication guard
- Rate limiting with Throttler
- Input validation with class-validator
- SQL injection prevention
- CORS configuration
- Global exception filter
- Response transformation interceptor

#### Documentation

- Swagger/OpenAPI integration
- Interactive API documentation at /docs
- README.md with overview
- SETUP.md with detailed setup guide
- CONTRIBUTING.md with development guidelines
- PROJECT_SUMMARY.md with complete overview
- CHANGELOG.md (this file)

#### Development Tools

- Setup automation script (scripts/setup.sh)
- Docker Compose for local development
- Hot reload development mode
- Environment configuration templates
- Type definitions for external libraries

### Changed

- N/A (initial release)

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- Implemented wallet signature verification
- Added JWT token authentication
- Configured rate limiting
- Set up input validation
- Enabled CORS with proper configuration

## Release Notes

### Version 0.1.0 - Foundation Release

This is the initial release of Tizzle Backend, establishing the foundation for the refundable staking ticketing protocol on Solana.

**Key Highlights:**

- Complete authentication system with Solana wallet integration
- Robust database schema supporting all core entities
- Multi-token support (SOL, SPL Token, Token-2022)
- Cloudflare R2 storage integration
- Redis caching layer
- Production-ready Docker configuration
- Comprehensive documentation

**What's Working:**

- User authentication via wallet signature
- Database migrations and schema
- Solana program integration
- File storage system
- Caching layer
- API documentation

**What's Next:**

- Implement remaining API endpoints
- Add comprehensive test coverage
- Set up monitoring and logging
- Implement webhook listeners
- Add CI/CD pipeline

---

## Version History

- **0.1.0** (2024-03-24) - Initial foundation release

---

## Upgrade Guide

### From Nothing to 0.1.0

This is the initial release. Follow the setup guide in SETUP.md to get started.

---

## Breaking Changes

None yet (initial release).

---

## Contributors

- Initial implementation by Tizzle Team

---

For more information, see:

- [README.md](README.md) - Project overview
- [SETUP.md](SETUP.md) - Setup instructions
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Complete project summary
