# GlamDesk Backend API

Express & MongoDB backend for the **GlamDesk Artist CRM & Atelier Management System**.

## Modular Architecture

The backend follows **Feature-First / Modular Architecture (Vertical Slices)**. All sub-domains of the **Masters** module are self-contained with their own models, controllers, and routes:

```text
glamdesk-be/
├── src/
│   ├── shared/
│   │   ├── config/
│   │   │   └── db.js                        # Mongoose connection & logging
│   │   ├── middleware/
│   │   │   └── errorHandler.js              # Centralized 404 & error handlers
│   │   └── utils/
│   │       └── response.js                  # Standard success & error response helpers
│   ├── modules/
│   │   └── masters/
│   │       ├── services/
│   │       │   ├── service.model.js         # Service & ServiceCategory schemas
│   │       │   ├── service.controller.js    # CRUD logic for services & categories
│   │       │   └── service.routes.js        # /api/masters/services
│   │       ├── venues/
│   │       │   ├── venue.model.js           # Venue & VenueType schemas
│   │       │   ├── venue.controller.js      # CRUD logic for venues & types
│   │       │   └── venue.routes.js          # /api/masters/venues
│   │       └── vendors/
│   │           ├── vendor.model.js          # Vendor & VendorRole schemas
│   │           ├── vendor.controller.js     # CRUD logic for vendors & availability
│   │           └── vendor.routes.js         # /api/masters/vendors
│   ├── seed/
│   │   └── seedMasters.js                   # Seed script with realistic atelier data
│   └── server.js                            # Express app entry point
├── .env
└── package.json
```

---

## Getting Started

### 1. Environment Configuration (`.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/glamdesk
CORS_ORIGIN=http://localhost:5173
```
*(You can also use a free MongoDB Atlas cloud cluster URI in `MONGO_URI`)*.

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Seed Initial Masters Data
To load all default services, categories, venues, venue types, vendors, and roles:
```bash
npm run seed
```

---

## API Endpoints Reference

### Services (`/api/masters/services`)
- `GET /api/masters/services` — List all services (supports `?category=...`, `?search=...`, `?activeOnly=true`)
- `GET /api/masters/services/:id` — Get single service
- `POST /api/masters/services` — Create new service
- `PUT /api/masters/services/:id` — Update service
- `PATCH /api/masters/services/:id/status` — Toggle active/inactive
- `DELETE /api/masters/services/:id` — Delete service
- `GET /api/masters/services/categories` — List service categories
- `POST /api/masters/services/categories` — Create category
- `DELETE /api/masters/services/categories/:id` — Delete category

### Venues (`/api/masters/venues`)
- `GET /api/masters/venues` — List all venues (supports `?venueType=...`, `?search=...`, `?activeOnly=true`)
- `GET /api/masters/venues/:id` — Get single venue
- `POST /api/masters/venues` — Create venue
- `PUT /api/masters/venues/:id` — Update venue
- `PATCH /api/masters/venues/:id/status` — Toggle active/inactive
- `DELETE /api/masters/venues/:id` — Delete venue
- `GET /api/masters/venues/types` — List venue types
- `POST /api/masters/venues/types` — Create venue type
- `DELETE /api/masters/venues/types/:id` — Delete venue type

### Vendors (`/api/masters/vendors`)
- `GET /api/masters/vendors` — List all vendors (supports `?role=...`, `?search=...`, `?activeOnly=true`)
- `GET /api/masters/vendors/:id` — Get vendor profile
- `POST /api/masters/vendors` — Create vendor
- `PUT /api/masters/vendors/:id` — Update vendor profile
- `PATCH /api/masters/vendors/:id/status` — Toggle active/inactive
- `DELETE /api/masters/vendors/:id` — Delete vendor
- `POST /api/masters/vendors/:id/availability` — Add/update leave or blackout date
- `GET /api/masters/vendors/roles` — List vendor roles
- `POST /api/masters/vendors/roles` — Create vendor role
- `DELETE /api/masters/vendors/roles/:id` — Delete vendor role
