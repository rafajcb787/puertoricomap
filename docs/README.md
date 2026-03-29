# Puerto Rico Family Road Trip Platform

This project converts `Roadtripeado_Maps_Guia_PR.docx` into reusable JSON data and exposes a modern, mobile-friendly trip planner UI.

## Data model (`data/places.json`)
Each place includes:
- `name`
- `category`
- `region`
- `municipio`
- `access`
- `contact`
- `familyFriendly`
- `coordinates` (nullable for future geocoding)

## Planner filters
The planner can build road trips by:
- category
- region
- municipio
- easy/difficult access
- one-day vs weekend suggestion
- short/medium/long drive preference by region

## Future mapping/geocoding readiness
Coordinates are intentionally nullable when the source guide does not include exact lat/lng. Region + municipio are stored to support future geocoding pipelines.
