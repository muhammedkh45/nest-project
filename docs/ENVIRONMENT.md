## Environment Variables

This project expects environment variables to configure database connections, secrets, and external services.

Create a `.env` based on `.env.example`. Example variables (customize to your setup):

```
# App
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=3600s

# Database (example: Postgres)
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=app_user
DB_PASS=secure_password
DB_NAME=app_db

# AWS (if using S3)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET=your-bucket

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=mail@example.com
SMTP_PASS=strong_password

```

Add other variables your deployment or local setup requires. Keep secrets out of source control.
