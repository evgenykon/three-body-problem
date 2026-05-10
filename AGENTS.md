# Agent Rules

## npm Usage Restriction
Do not use npm commands directly without Docker. All npm operations must be performed within the Docker container using docker-compose or docker commands.

Example:
- Instead of: `npm install`
- Use: `docker-compose run --rm 3body npm install`

This ensures consistent environments and prevents local machine pollution.