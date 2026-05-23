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

## Tests, Typechecking & Lint

All via `make run`:

```bash
make run cmd="npx vitest run"        # Run tests
make run cmd="npx nuxi typecheck"    # TypeScript typecheck
make run cmd="npx eslint ."          # Lint check
make run cmd="npx prettier --check ." # Formatting check
```

## Development Workflow

- Do not use git commands
- Use make commands if available
- All development through docker-compose

## Precalculated Periodic Orbits

Precalculated frame data is in `app/data/precalculated.ts` (auto-generated, DO NOT edit manually).

Current presets (G=1, velocity-verlet):

| Preset | Frames | Type | dt / sampleEvery | Notes |
|--------|--------|------|------------------|-------|
| `fig8` | 1187 | period-matched | 0.0001 / 160 | Chenciner-Montgomery figure-8, exact ICs, loop dist ~0.004 |
| `butterfly1` | 391 | period-matched | 0.0001 / 160 | Suvakov Butterfly I (high precision ICs), loop dist ~0.012 |
| `bumblebee` | 3000 | fixed frames | 0.0001 / 160 | Suvakov Bumblebee, no clean period |
| `moth1` | 932 | period-matched | 0.0001 / 160 | Suvakov Moth I, loop dist ~0.005 |
| `moth2` | 1793 | period-matched | 0.0001 / 160 | Suvakov Moth II, loop dist ~0.005 |
| `moth3` | 600 | fixed frames | 0.0001 / 160 | Suvakov Moth III, unstable beyond 600 frames |
| `goggles` | 655 | period-matched | 0.0001 / 160 | Suvakov Goggles, loop dist ~0.009 |
| `dragonfly` | 3000 | fixed frames | 0.0001 / 160 | Suvakov Dragonfly, no clean period |
| `yarn` | 3470 | period-matched | **0.00001 / 1600** | Suvakov Yarn (high precision ICs, Li & Liao 2014), loop dist ~0.031 |
| `yinyang1` | 1084 | period-matched | 0.0001 / 160 | Suvakov Yin-Yang I, loop dist ~0.025 |

**Auto-fallback logic**: `build_presets.mjs` tries period matching first. If dist > 0.05, falls back to fixed frames trying [3000, 2000, 1000, 600] (first stable count wins). If none work, uses period with poor closure.

To regenerate all presets:

```bash
make run cmd="node scripts/build_presets.mjs"
```

Adding a new preset:
1. Add orbit config in `scripts/build_presets.mjs` (bodies array + G value)
2. Run the build script
3. Import the new preset in `app/pages/solutions/periodic.vue`
4. Add labels to the preset options list in `app/pages/solutions/periodic.vue` (or just use direct names like 'Moth I')

The catalog page (`/solutions/periodic`) uses ONLY `precalculated` integration method. DO NOT add `integrationMethod` selector, DO NOT add live integrators (euler, rk4, velocity-verlet) to this page. Live integrators cannot maintain stability at real-time frame rates — this is a hard constraint.

## Orbit Validation for AI Agents

`scripts/orbit.js` — self-contained validation library (no app imports), can run directly via Node.js:

```js
import { validateOrbit, makeSuvakovBodies, SUV_ORBITS, findPeriod } from './scripts/orbit.js'

// Validate known orbit
const bodies = makeSuvakovBodies(0.30689, 0.12551)
const result = validateOrbit({ bodies, G: 1, dt: 0.0001, softening: 0 }, 100, 160)
// result = { ok: true/false, message: '...', minDist: ..., energyDriftPpm: ... }

// Find orbital period
const period = findPeriod({ bodies, G: 1 }, 2000, 160)
// returns frame count at which all bodies return to initial state, or -1

// All 9 Suvakov family initial conditions
const orbit = SUV_ORBITS.butterfly1 // { vx: 0.30689, vy: 0.12551, name: 'Butterfly I' }
```

To test orbits are valid:

```bash
make run cmd="node scripts/test_validation.mjs"
```

Rules for generating new precalculated data:
- Always use G=1 for Suvakov/figure-8 type orbits
- Use `dt=0.0001`, `softening=0`, `velocity-verlet` 
- Exception: Yarn requires `dt=0.00001`, `sampleEvery=1600` (high-precision ICs from Li & Liao 2014)
- Validate with at least 100 frames output (160 substeps each)
- Energy drift must be < 1 ppm for a valid orbit
- If collision occurs before 100 frames, initial conditions are invalid

To test Yarn orbit specifically:
```bash
make run cmd="node scripts/test_yarn.mjs"
```