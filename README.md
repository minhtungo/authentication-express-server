## Features
- Email/Password authentication
- Google OAuth integration
- JWT-based authentication with refresh tokens
- Email verification
- Password reset
- Two-factor authentication support

## 🚀 Tech Stack

- **[Node.js](https://nodejs.org/)** 
- **[Express.js](https://expressjs.com/)**

- **[TypeScript](https://www.typescriptlang.org/)** 
- **[PostgreSQL](https://www.postgresql.org/)** 

- **[Passport.js](http://www.passportjs.org/)** - Authentication middleware
- **[Argon2](https://github.com/ranisalt/node-argon2)** - Password hashing

- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM
- **[Zod](https://zod.dev/)** - Schema validation

- **[Nodemailer](https://nodemailer.com/)** - Email sending
- **[React Email](https://react.email/)** - Email templates

- **[OpenAPI/Swagger](https://swagger.io/)** - API documentation
- **[Zod-to-OpenAPI](https://github.com/asteasolutions/zod-to-openapi)** - Schema to OpenAPI conversion

### Development & Testing
- **[Vitest](https://vitest.dev/)** - Testing framework
- **[Biome](https://biomejs.dev/)** - Linter and formatter
- **[pino](https://getpino.io/)** - Logging
- **[Husky](https://typicode.github.io/husky/)** - Git hooks

## Structure 

src/
├── config/ # Configuration files and environment setup
├── db/ # Database schemas and migrations
├── docs/ # OpenAPI/Swagger documentation
├── middlewares/ # Express middlewares
├── modules/ # Feature modules (auth, health-check, etc.)
├── services/ # Business logic and external services
│ ├── email/ # Email service and templates
│ └── strategies/ # Passport authentication strategies
└── utils/ # Utility functions and helpers

## Credits
[express-typescript-boilerplate](https://github.com/edwinhern/express-typescript-2024)
