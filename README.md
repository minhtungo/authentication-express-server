# Express TypeScript Boilerplate

## Features
- Email/Password authentication
- Google OAuth integration
- JWT-based authentication with refresh tokens
- Email verification
- Password reset
- Two-factor authentication support
- File upload with S3/MinIO
- AI chat functionality
- OpenAPI documentation

## 🚀 Tech Stack

### Backend Framework
- **[Node.js](https://nodejs.org/)** 
- **[Express.js](https://expressjs.com/)**
- **[TypeScript](https://www.typescriptlang.org/)** 

### Database & Caching
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Redis](https://redis.io/)** - Caching and session management
- **[Drizzle ORM](https://orm.drizzle.team/)** - Database ORM

### Authentication
- **[Passport.js](http://www.passportjs.org/)** - Authentication middleware
- **[Argon2](https://github.com/ranisalt/node-argon2)** - Secure password hashing
- **[JWT](https://jwt.io/)** - Token-based authentication

### File Storage
- **[AWS S3](https://aws.amazon.com/s3/)/[MinIO](https://min.io/)** - Object storage
- **[Multer](https://github.com/expressjs/multer)** - File upload middleware

### Validation & Documentation
- **[Zod](https://zod.dev/)** - Schema validation
- **[OpenAPI/Swagger](https://swagger.io/)** - API documentation
- **[Zod-to-OpenAPI](https://github.com/asteasolutions/zod-to-openapi)** - Schema to OpenAPI conversion

### Communication
- **[Nodemailer](https://nodemailer.com/)** - Email sending
- **[React Email](https://react.email/)** - Email templates

### AI Integration
- **[OpenAI](https://openai.com/)** - AI services for chat functionality

### Development & Testing
- **[Vitest](https://vitest.dev/)** - Testing framework
- **[Biome](https://biomejs.dev/)** - Linter and formatter
- **[pino](https://getpino.io/)** - Logging
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[Docker](https://www.docker.com/)** & **[Docker Compose](https://docs.docker.com/compose/)** - Containerization

## 📁 Project Structure 

- `/src`
  - `/config` - Configuration files and environment setup
    - `appConfig.ts` - Application configuration
    - `env.ts` - Environment variables validation
  - `/db` - Database schemas and migrations
    - `/schemas` - Database table definitions and validation
  - `/docs` - OpenAPI/Swagger documentation
  - `/lib` - Shared library code
  - `/middlewares` - Express middlewares
  - `/modules` - Feature modules
    - `/auth` - Authentication functionality
    - `/chat` - Chat and AI functionality
    - `/healthCheck` - Health check endpoints
    - `/upload` - File upload functionality
    - `/user` - User management
  - `/services` - Business logic and external services
    - `/strategies` - Passport.js authentication strategies
  - `/utils` - Utility functions and helpers

## Credits
[express-typescript-boilerplate](https://github.com/edwinhern/express-typescript-2024)
