# Authentication API

`POST /api/auth/register` accepts `username`, `email`, and `password`; names must have at least three characters and passwords at least six. A successful response returns a JWT token and public user object.

`POST /api/auth/login` accepts `email` and `password`. Send the returned token as `Authorization: Bearer <token>` for protected routes. `GET /api/auth/me` verifies that token and returns the active user.
