# Contributing to CarbonWise

First off, thank you for considering contributing to CarbonWise! We appreciate your support in making carbon tracking more accessible and action-oriented.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Use welcoming and inclusive language.
- Be respectful of differing viewpoints and experiences.
- Gracefully accept constructive criticism.
- Focus on what is best for the community.

## Local Development Workflow

1. **Prerequisites**: Ensure you have Node.js 18+ and a MongoDB instance (or Atlas account) ready.
2. **Clone the Repo**:
   ```bash
   git clone https://github.com/your-username/carbonwise.git
   cd carbonwise
   ```
3. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
4. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
5. **Run Dev Server**:
   ```bash
   npm run dev
   ```

## Development Guidelines

- **TypeScript**: Ensure all code is strongly typed. Avoid using `any` unless absolutely necessary.
- **Component Design**: Build components as pure Server Components where possible. Mark interactive components with `"use client"`.
- **Styling**: Use Tailwind CSS variables defined in `src/app/globals.css`. Ensure layouts are responsive across mobile, tablet, and desktop viewports.
- **Calculations**: Any modifications to emission factors must correspond to standard sources and be updated in `src/lib/calculations.ts`.

## Submitting Pull Requests

1. Create a descriptive feature branch: `git checkout -b feature/amazing-feature`.
2. Commit your changes with clear, structured messages: `git commit -m "feat: add water footprint tracker"`.
3. Verify the build passes locally: `npm run build`.
4. Push to your branch and open a Pull Request against the `main` branch.
