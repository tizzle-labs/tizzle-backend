# Tizzle Backend API

Backend API for Tizzle - Refundable Staking Ticketing Protocol on Solana.

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Package Manager**: npm
- **Blockchain**: Solana (Helius RPC)
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis
- **Storage**: Cloudflare R2
- **Authentication**: JWT with Solana wallet signature
- **Documentation**: Swagger/OpenAPI

## Features

- ✅ Wallet-based authentication (sign message with Solana wallet)
- ✅ Complete event management (create, update, list, analytics)
- ✅ Registration system with on-chain verification
- ✅ Organization management
- ✅ Badge system for users
- ✅ **Image upload to Cloudflare R2** (avatars, event images, badges)
- ✅ Caching with Redis
- ✅ Multi-token support (SOL, SPL Token, Token-2022)
- ✅ Comprehensive error handling
- ✅ Rate limiting
- ✅ Swagger API documentation

## Prerequisites

- Node.js >= 20
- PostgreSQL >= 15
- Redis >= 7
- Cloudflare R2 account
- Helius API key

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Database Setup

```bash
# Generate migration files (auto-creates rollback)
npm run db:generate

# Run migrations
npm run db:migrate

# Rollback migration (if needed)
npm run db:rollback <migration-name>

# Open Drizzle Studio (optional)
npm run db:studio
```

## Development

```bash
# Start in development mode
npm run start:dev

# Start in debug mode
npm run start:debug
```

## Production

```bash
# Build application
npm run build

# Start production server
npm start:prod
```

## Docker Deployment

```bash
# Build Docker image
docker build -t tizzle-backend .

# Run container
docker run -p 3000:3000 --env-file .env tizzle-backend
```

## API Documentation

Once the server is running, visit:

- Swagger UI: `http://localhost:3000/docs`
- API Base URL: `http://localhost:3000/v1`

## Environment Variables

### Application

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)
- `API_PREFIX`: API prefix (default: v1)
- `APP_URL`: Application URL (e.g., https://dev-api.tizzle.app) - **Required for Swagger in production**

### Solana

- `SOLANA_NETWORK`: Network (devnet/mainnet-beta)
- `SOLANA_RPC_URL`: Helius RPC URL
- `SOLANA_WS_URL`: Helius WebSocket URL
- `PROGRAM_ID`: Tizzle program ID

### Database

- `DATABASE_URL`: PostgreSQL connection string

### Redis

- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `REDIS_PASSWORD`: Redis password (optional)

### JWT

- `JWT_SECRET`: Secret key for JWT
- `JWT_EXPIRES_IN`: Token expiration (default: 7d)

### Cloudflare R2

- `R2_ACCOUNT_ID`: Cloudflare account ID
- `R2_ACCESS_KEY_ID`: R2 access key
- `R2_SECRET_ACCESS_KEY`: R2 secret key
- `R2_BUCKET_NAME`: Bucket name
- `R2_PUBLIC_URL`: Public URL for bucket

## API Endpoints

### Storage

- `POST /v1/storage/upload` - Upload image (generic)
- `POST /v1/storage/upload/avatar` - Upload user avatar
- `POST /v1/storage/upload/organization-avatar` - Upload organization avatar
- `POST /v1/storage/upload/event-image` - Upload event image
- `POST /v1/storage/upload/badge-image` - Upload badge image
- `DELETE /v1/storage/:fileUrl` - Delete file

### Authentication

- `POST /v1/auth/nonce` - Generate nonce for wallet
- `POST /v1/auth/verify` - Verify signature and login
- `GET /v1/auth/me` - Get current user
- `POST /v1/auth/refresh` - Refresh token

### Storage

- `POST /v1/storage/upload` - Upload image (generic)
- `POST /v1/storage/upload/avatar` - Upload user avatar
- `POST /v1/storage/upload/organization-avatar` - Upload org avatar
- `POST /v1/storage/upload/event-image` - Upload event image
- `POST /v1/storage/upload/badge-image` - Upload badge image
- `DELETE /v1/storage/:fileUrl` - Delete file

### Users

- `GET /v1/users/profile` - Get user profile
- `PATCH /v1/users/profile` - Update profile
- `POST /v1/users/avatar` - Upload avatar

### Organizations

- `POST /v1/organizations` - Create organization
- `GET /v1/organizations` - List organizations
- `GET /v1/organizations/:id` - Get organization
- `PATCH /v1/organizations/:id` - Update organization
- `POST /v1/organizations/:id/avatar` - Upload avatar

### Events

- `POST /v1/events` - Create event
- `GET /v1/events` - List events
- `GET /v1/events/:id` - Get event details
- `PATCH /v1/events/:id` - Update event
- `POST /v1/events/:id/image` - Upload event image
- `GET /v1/events/:id/registrations` - Get registrations
- `GET /v1/events/:id/analytics` - Get analytics

### Registrations

- `POST /v1/registrations` - Register for event
- `GET /v1/registrations/:id` - Get registration
- `POST /v1/registrations/:id/checkin` - Check-in attendee

### Badges

- `GET /v1/badges` - List all badges
- `GET /v1/badges/user` - Get user badges
- `GET /v1/badges/:id` - Get badge details

### Analytics

- `GET /v1/analytics/protocol` - Protocol metrics
- `GET /v1/analytics/tvl` - Total value locked

## Authentication Flow

1. **Request Nonce**

   ```bash
   POST /v1/auth/nonce
   {
     "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
   }
   ```

2. **Sign Message** (Frontend)
   - Use wallet adapter to sign the returned message

3. **Verify Signature**

   ```bash
   POST /v1/auth/verify
   {
     "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
     "signature": "base58_encoded_signature",
     "message": "original_message"
   }
   ```

4. **Use Access Token**
   - Include in Authorization header: `Bearer <token>`

## Project Structure

```
src/
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── filters/         # Exception filters
│   ├── guards/          # Auth guards
│   └── interceptors/    # Response interceptors
├── config/              # Configuration
├── database/            # Database setup
│   ├── migrations/      # Migration files
│   └── schema/          # Database schemas
├── modules/             # Feature modules
│   ├── auth/            # Authentication
│   ├── cache/           # Redis cache
│   ├── solana/          # Solana integration
│   └── storage/         # R2 storage
├── app.module.ts        # Root module
└── main.ts              # Application entry
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
