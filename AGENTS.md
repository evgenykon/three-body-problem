# Three Body Problem Project

This is a Nuxt 4 application built with Vue 3 and TypeScript. The project implements a solution for simulating the three-body problem in physics.

## Project Structure

- **app/**: Contains the root App.vue component
- **app/assets/**: Static assets including SCSS stylesheets
- **app/components/**: Vue components organized by feature
- **app/components/Ui/**: Reusable UI components (Alert, AlertDialog, Avatar, Badge, Button, etc.)
- **app/composables/**: Composables for logic reuse (useCarousel)
- **app/utils/**: Utility functions and helpers (color-picker, translucent, tw-helper)
- **layouts/**: Vue layout components (currently empty)
- **pages/**: Vue page components (currently empty)
- **public/**: Static files served directly
- **docker-compose.yml**: Docker configuration for development
- **docker-compose.dev.yml**: Docker configuration for development
- **Dockerfile**: Container image definition
- **Dockerfile.dev**: Development container image definition
- **tailwind.config.js**: Tailwind CSS configuration
- **ui-thing.config.ts**: UI Thing library configuration

## Key Dependencies

- **nuxt^4.4.2**: Framework for Vue.js applications
- **vue^3.5.30**: Reactive UI library
- **vue-router^4.6.4**: Vue Router for navigation
- **axios^1.14.0**: HTTP client
- **markdown-it^14.1.1**: Markdown parsing
- **katex^0.16.38**: Mathematical formula rendering
- **lucide-vue-next^1.0.0**: Icon library
- **ui-thing^0.2.8**: UI component library
- **@nuxtjs/tailwindcss^6.14.0**: CSS framework
- **@nuxt/eslint^1.15.2**: Linting integration

## Development Dependencies

- **@nuxt/test-utils^4.0.0**: Nuxt testing utilities
- **@types/katex^0.16.8**: TypeScript definitions for KaTeX
- **@types/markdown-it^14.1.2**: TypeScript definitions for markdown-it
- **@vue/test-utils^2.4.6**: Vue Test Utils
- **eslint^9.39.4**: JavaScript/TypeScript linter
- **eslint-config-prettier^10.1.8**: ESLint configuration for Prettier
- **happy-dom^20.8.3**: DOM environment for testing
- **sass^1.98.0**: CSS preprocessor
- **typescript^5.9.3**: TypeScript compiler
- **vitest^4.0.18**: Vite-based test runner

## Development

All npm operations must be performed within the Docker container using docker-compose or docker commands.

Example:

- Instead of: `npm install`
- Use: `docker-compose run --rm 3body yarn install`

This ensures consistent environments and prevents local machine pollution.

## Development Workflow

- Do not use git commands at all
- Use make commands if available (see Makefile)
- If no appropriate make command exists, create one in the Makefile
- All development work should be done through the provided make commands

Available make commands:

- `make build`: Build the Docker containers
- `make dev`: Start the development environment
- `make down`: Stop and remove containers
- `make run`: Run a shell in the development container
