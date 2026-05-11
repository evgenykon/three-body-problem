# Three Body Problem Project

This is a Nuxt 4 application built with Vue 3 and TypeScript. The project implements a solution for simulating the three-body problem in physics.

## Project Structure

- **app/**: Contains the root App.vue, pages, layouts, components
- **app/assets/css/main.css**: Custom CSS styles (dark theme, no Tailwind)
- **app/components/**: Vue components
- **app/components/Ui/**: Reusable UI components
- **app/components/Starfield.vue**: Animated star background component
- **app/layouts/default.vue**: Main layout with navbar and sidebar
- **app/pages/**: Vue page components
- **app/simulation/**: Physics simulation engine
- **app/simulation/Engine.ts**: Three-body physics engine class
- **public/**: Static files served directly
- **docker-compose.dev.yml**: Docker configuration for development

## Key Dependencies

- **nuxt^4.4.4**: Framework for Vue.js applications
- **vue^3.5.x**: Reactive UI library
- **vue-router^5.0.x**: Vue Router for navigation
- **motion-v^2.x**: Animation library

## CSS Approach

The project uses custom CSS (not Tailwind) due to Tailwind v4 + Nuxt 4 compatibility issues.

- All styles in `app/assets/css/main.css`
- Dark theme with CSS variables
- Scoped styles in components

## UI Components

Created custom UI components in `app/components/Ui/`:

| Component | Description |
|-----------|-------------|
| `Button.vue` | Button with variants: default, destructive, outline, secondary, ghost, link, active, outlined |
| `Input.vue` | Text input with v-model support |
| `Select.vue` | Dropdown select component |
| `Checkbox.vue` | Checkbox with label |
| `CheckboxGroup.vue` | Group of checkboxes |
| `RadioButton.vue` | Radio button with label |
| `RadioGroup.vue` | Group of radio buttons |
| `InputGroup.vue` | Input with pre/post attachments |
| `Label.vue` | Form label |
| `Header.vue` | H1-H6 headers |
| `Navbar.vue` | Navigation bar |
| `Container.vue` | Responsive container |
| `Card.vue` | Card container |
| `CardHeader.vue` | Card header |
| `CardTitle.vue` | Card title |
| `CardDescription.vue` | Card description |
| `CardContent.vue` | Card body |
| `CardFooter.vue` | Card footer |
| `Tabs.vue` | Tab navigation |
| `Table.vue` | Data table with striped rows |
| `Hero.vue` | Hero banner component |
| `HeroSpace.vue` | Hero with starfield background |

## Pages

- `/` - Home page with hero banner
- `/demo` - UI components demo page
- `/2d-simple` - 2D simple simulation page

## Simulation Engine

Located in `simulation/Engine.ts`:

- `Engine` class - Main physics simulation
- `Body` interface - Celestial body with position, velocity, mass, radius, color
- `createDefaultBodies()` - Creates 3 bodies in stable orbit
- Features: gravitational forces, position/velocity updates, trail tracking, energy calculation

## Development

All operations must be performed within Docker container:

```bash
make dev     # Start development environment
make down    # Stop containers
make build   # Build containers
```

Access the app at `http://localhost:3000`

## Development Workflow

- Do not use git commands
- Use make commands if available
- All development through docker-compose