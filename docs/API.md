# API Documentation

This file is a place to keep API endpoint summaries and examples. If this project uses `@nestjs/swagger`, you can generate a live OpenAPI UI by enabling the swagger module in `main.ts` and visiting the configured path (commonly `/api` or `/docs`).

Suggested sections to fill in:

- Authentication
  - `POST /auth/login` — authenticate user, returns JWT
  - `POST /auth/register` — register a new user

- Users
  - `GET /users` — list users (admin)
  - `GET /users/:id` — get profile

- Brands / Products
  - `GET /brands` — list brands
  - `POST /brands` — create brand (admin)

Add request/response examples, validations, and error codes here.
