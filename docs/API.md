# API Documentation

Base URL: `http://localhost:4000/api`

## Authentication

- `POST /auth/register` creates a student account.
- `POST /auth/login` returns a JWT and user profile.
- `POST /auth/forgot-password` returns a reset-flow placeholder response.
- `GET /profile` returns the current user and submission stats.

All protected routes require:

```http
Authorization: Bearer <jwt>
```

## Questions

- `GET /questions` supports `search`, `topic`, `difficulty`, and `category`.
- `GET /questions/random` returns one random practice problem.
- `GET /questions/:id` returns the problem statement and public test cases.

## Code Execution

- `POST /run`

```json
{
  "sourceCode": "print(input())",
  "input": "hello\n"
}
```

- `POST /submit`

```json
{
  "questionId": "uuid",
  "sourceCode": "a,b=map(int,input().split())\nprint(a+b)"
}
```

The submit endpoint runs all public and hidden test cases, calculates score, stores the submission, and returns pass/fail results.

## Analytics And Tests

- `GET /analytics`
- `GET /leaderboard?scope=global`
- `GET /leaderboard?scope=college`
- `GET /mock-tests`

## Admin

Admin routes require a JWT with `role: admin`.

- `GET /admin/questions`
- `POST /admin/questions`
- `DELETE /admin/questions/:id`
- `GET /admin/export`
