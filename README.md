# Executive GeoLand System (MVP)

Executive GeoLand System is a lightweight GIS web MVP that lets teams register land properties, draw parcel boundaries, and highlight high-priority unbuilt areas for infrastructure planning.

## Features

- Property registration with owner details, phone number, and optional document name
- Polygon drawing and boundary editing on a Leaflet map for parcel boundaries
- Map view with color-coded parcels, filters, and high-priority labeling for unbuilt properties
- Decision support on the map and in property details, including recommendation text and area summary
- Four-page structure: Dashboard, Add Property, Map View, Property Details
- Local storage persistence (no authentication or backend required)

## Run locally

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`

## Notes

- Data is stored in the browser using local storage.
- Sample properties are seeded on first load if storage is empty (Khartoum, Sudan).
- This is a hackathon MVP focused on clarity and fast iteration.
