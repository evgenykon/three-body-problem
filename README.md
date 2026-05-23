# Three Body Problem

An interactive web application for exploring the three-body problem in celestial mechanics — from Newton's classical formulation to modern numerical simulations and machine learning approaches.

Built with Nuxt 4, Vue 3, and TypeScript. Features a 2D physics engine with multiple integration methods, a catalog of precalculated periodic orbits, educational content on historical solutions, and full English/Russian localization.

## Features

- **Interactive 2D Simulation** — real-time physics engine with Euler, RK4, and Velocity-Verlet integrators; adjustable gravitational constant, time step, and softening parameter; collision detection, trajectory prediction, and trail visualization
- **Periodic Orbits Catalog** — 10 precalculated orbit families (Figure-8, Butterfly I, Bumblebee, Moth I-III, Goggles, Dragonfly, Yarn, Yin-Yang I) replayed from high-precision offline data
- **Educational Content** — 9 in-depth pages covering Newton's formulation, Euler's restricted solutions, Lagrange points, Poincaré chaos theory, Sundman's series, numerical integration methods, homological classification, and ML-based approaches
- **Interactive Canvas Controls** — body selection, position/velocity picking, zoom, grid overlay with coordinate labels, velocity vectors, mass editing via a side drawer
- **Dark Theme** — custom CSS with CSS variables, no external UI framework
- **i18n** — full English and Russian translations

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Nuxt 4 (Vue 3, TypeScript) |
| Physics | Custom 2D engine (Euler, RK4, Velocity-Verlet) |
| Rendering | HTML5 Canvas |
| Math | KaTeX for LaTeX equations |
| Animations | motion-v |
| Icons | @nuxt/icon (local SVG bundle) |
| Styling | Custom CSS with CSS variables |
| i18n | @nuxtjs/i18n (no-prefix strategy) |
| Package Manager | npm |
| Containerization | Docker Compose |

## Pages

### Main
- `/` — Dashboard with hero banner, info cards, and historical timeline
- `/demo` — UI components showcase with live simulation controls
- `/2d-simple` — Full simulation sandbox with all adjustable parameters

### Solutions (Educational)
- `/solutions/newton` — Newton's Law of Universal Gravitation (1687)
- `/solutions/euler` — Euler's Restricted Three-Body Problem (1760s)
- `/solutions/lagrange` — Lagrange Points L1–L5 (1772)
- `/solutions/poincare` — Chaos Theory and the Butterfly Effect (1890s)
- `/solutions/sundman` — Sundman's Convergent Series (1912)
- `/solutions/numerical` — Numerical Integration Methods (1960s–70s)
- `/solutions/periodic` — Periodic Orbits Catalog (Figure-8, Suvakov family)
- `/solutions/homological` — Shape Space and Homological Classification
- `/solutions/ml` — Machine Learning for Orbit Prediction (2020s)

## Architecture

```
app/
  assets/css/main.css       # Custom CSS (dark theme, utility classes)
  components/
    ThreeBodySimulation.vue  # Main interactive simulation component
    Starfield.vue            # Animated starfield background
    Ui/                      # 28 reusable UI components
  data/
    precalculated.ts         # Auto-generated periodic orbit frame data
  layouts/default.vue        # Navbar + sidebar + content layout
  pages/                     # 12 page components
  simulation/
    Engine.ts                # Physics engine barrel
    modules/
      Body.ts                # Type definitions (Vector2D, Body, SimulationConfig)
      Engine2D.ts            # 2D N-body engine (Euler, RK4, Velocity-Verlet)
      Engine3D.ts            # 3D engine prototype
scripts/
  orbit.js                   # Standalone orbit validation library
  build_presets.mjs          # Precalculated data generator
i18n/
  en.json, ru.json           # Full translations
```

## Development

All operations run inside Docker containers.

```bash
make dev       # Start development server at http://localhost:3000
make down      # Stop containers
make build     # Rebuild containers
make run cmd="npm run test"   # Run commands inside container
```

### Test, Typecheck, Lint

```bash
make run cmd="npx vitest run"          # Run tests
make run cmd="npx nuxi typecheck"      # TypeScript check
make run cmd="npx eslint ."            # Lint
make run cmd="npx prettier --check ."  # Formatting
```

### Static Build (GitHub Pages)

```bash
make generate-gh    # Generate static site to .output/public/
```

Preview locally:

```bash
make run cmd="npx serve .output/public"
```

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys to GitHub Pages on push to `main`.

### Regenerating Precalculated Orbits

```bash
make run cmd="node scripts/build_presets.mjs"
```

This regenerates `app/data/precalculated.ts` using Velocity-Verlet integration with high-precision initial conditions from the literature.

## Precalculated Orbits

Generated offline (G=1, Velocity-Verlet) and replayed at runtime. No live integrators on the periodic orbits page — real-time frame rates cannot maintain orbital stability.

| Preset | Frames | Type | Notes |
|--------|--------|------|-------|
| Figure-8 | 1187 | period-matched | Chenciner-Montgomery, ~0.004 loop dist |
| Butterfly I | 391 | period-matched | Suvakov, ~0.012 loop dist |
| Bumblebee | 3000 | fixed | No clean period |
| Moth I | 932 | period-matched | ~0.005 loop dist |
| Moth II | 1793 | period-matched | ~0.005 loop dist |
| Moth III | 600 | fixed | Unstable beyond 600 |
| Goggles | 655 | period-matched | ~0.009 loop dist |
| Dragonfly | 3000 | fixed | No clean period |
| Yarn | 3470 | period-matched | High precision, ~0.031 loop dist |
| Yin-Yang I | 1084 | period-matched | ~0.025 loop dist |

## License

MIT
