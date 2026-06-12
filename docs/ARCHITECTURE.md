# Architecture

## Frontend

React, TypeScript, Tailwind CSS, CodeMirror, Recharts, and lucide-react.

Main screens:

- Authentication
- Student dashboard
- Question bank
- Coding room
- Mock tests
- Analytics
- Leaderboard
- Admin panel

## Backend

Node.js and Express expose REST APIs for authentication, practice questions, code execution, submissions, analytics, leaderboards, and admin management.

## Database

PostgreSQL stores users, questions, test cases, submissions, mock tests, attempts, and certificates. The schema lives in `db/schema.sql`.

## Code Execution

Production uses Docker containers:

```text
student code -> API -> temporary file -> docker run --network none --memory 128m --cpus .5 -> stdout/stderr
```

Local development can use `EXECUTION_MODE=local` for convenience.
