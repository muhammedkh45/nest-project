## Installation & Setup

This file contains expanded setup instructions for the NestJS e-commerce project.

1. Prerequisites

- Node.js 18+ and npm (or pnpm/yarn)
- A running database instance (Postgres, MySQL, MongoDB, etc.)

2. Install

```powershell
npm install
```

3. Environment

Copy and edit environment variables:

```powershell
copy .env.example .env
# edit .env with database credentials, jwt secrets, aws keys, etc.
```

4. Development

```powershell
npm run start:dev
```

5. Build & Run

```powershell
npm run build
npm run start:prod
```

6. Tests

```powershell
npm run test
npm run test:watch
```

Notes:

- If you use Docker, consider creating a `docker-compose.yml` to run the DB and the app.
- On Windows, use PowerShell commands shown above and ensure file permissions are correct for any uploads.
