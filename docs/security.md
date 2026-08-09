# Security notes

Passwords are stored with Flask-Bcrypt and protected routes require a JWT. Administrator endpoints perform an additional role check.

Use a new private `JWT_SECRET_KEY` in every production environment. Never commit production credentials, customer data or a permissive wildcard CORS origin.
