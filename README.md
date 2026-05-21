# TaskFlow

A task management REST API built with **Node.js**, **Express**, and **TypeScript**.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Scripts](#scripts)
- [Contributing](#contributing)

---

## Features

- RESTful API for task management (create, read, update, delete)
- Built with TypeScript for type safety and better developer experience
- Express.js for fast, minimalist routing
- Input validation and error handling middleware
- Environment-based configuration
- Structured logging
- Interactive API docs via Swagger UI

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher (or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/))
- [TypeScript](https://www.typescriptlang.org/) v5 or higher

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MamitianaAntonio/taskflow.git
cd taskflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development mode

```bash
npm run dev
```

The server will start at `http://localhost:3000` by default.

### 4. Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
taskflow/
├── src/
│   ├── config/         # App configuration and env loader
│   ├── controllers/    # Route handler logic
│   ├── middleware/     # Express middleware (auth, validation, errors)
│   ├── models/         # Data models / interfaces
│   ├── routes/         # Express route definitions
│   ├── services/       # Business logic layer
│   ├── utils/          # Utility functions and helpers
│   └── index.ts        # App entry point
├── tests/              # Unit and integration tests
├── dist/               # Compiled JavaScript output (generated)
├── .env.example        # Example environment variables
├── tsconfig.json       # TypeScript configuration
├── package.json
└── README.md
```

---

## API Documentation

This project uses **Swagger UI** for interactive API documentation.

Once the server is running, visit:

```
http://localhost:3000/api-docs
```

You can explore and test all available endpoints directly from the browser.

---

## Scripts

| Command           | Description                                        |
|-------------------|----------------------------------------------------|
| `npm run dev`     | Start development server with hot reload (ts-node-dev) |
| `npm run build`   | Compile TypeScript to `dist/`                      |
| `npm start`       | Run compiled production build                      |
| `npm test`        | Run tests                                          |
| `npm run lint`    | Lint source files with ESLint                      |
| `npm run format`  | Format code with Prettier                          |

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a pull request

Please make sure your code passes linting and tests before submitting.