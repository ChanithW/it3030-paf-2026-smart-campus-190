# Smart Campus Operations Hub

Production-inspired full-stack university campus management platform for **IT3030 PAF Assignment 2026** at the **SLIIT Faculty of Computing**.

---

## Project Overview

Smart Campus Operations Hub centralizes core campus operations into a single web platform:

- Facility and asset catalogue management
- Booking lifecycle management
- Incident ticketing with attachments and comments
- Real-time-style notification handling
- User and role management with **Google OAuth 2.0 authentication**

---

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.5.x
- Spring Data JPA
- Spring Security
- OAuth2 Client
- PostgreSQL 17
- Lombok
- Springdoc OpenAPI 2.8.6
- Maven

### Frontend
- React 18
- Vite
- TailwindCSS v3
- Axios
- React Router v6
- qrcode.react

### DevOps
- GitHub Actions CI/CD
- Git

---

## Setup Instructions

### 1) Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 17

### 2) Clone the Repository
```bash
git clone <your-repository-url>
cd <your-repository-folder>
```

### 3) Create Database
Create a PostgreSQL database named:

```sql
CREATE DATABASE smart_campus;
```

### 4) Configure Backend Environment
Create `api/.env`:

```env
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 5) Configure Google OAuth 2.0
Set up OAuth credentials at `https://console.cloud.google.com` and add redirect URI:

`http://localhost:8080/login/oauth2/code/google`

### 6) Run Backend
```bash
cd api
.\mvnw spring-boot:run
```

- Backend URL: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui`

### 7) Run Frontend
```bash
cd client
npm install
npm run dev
```

- Frontend URL: `http://localhost:5173`

---

## Team Contributions & API Endpoints

### Member 1 — Facilities & Assets Catalogue
- `GET /api/resources` — Get all resources with filters
- `GET /api/resources/{id}` — Get resource by ID
- `POST /api/resources` — Create new resource (**ADMIN**)
- `PUT /api/resources/{id}` — Update resource (**ADMIN**)
- `DELETE /api/resources/{id}` — Delete resource (**ADMIN**)

### Member 2 — Booking Management
- `GET /api/bookings` — Get all bookings (**ADMIN**)
- `GET /api/bookings/{id}` — Get booking by ID
- `GET /api/bookings/my` — Get current user bookings
- `POST /api/bookings` — Create new booking
- `PUT /api/bookings/{id}` — Update booking
- `PATCH /api/bookings/{id}/status` — Approve or reject booking (**ADMIN**)
- `PATCH /api/bookings/{id}/cancel` — Cancel booking
- `DELETE /api/bookings/{id}` — Delete booking (**ADMIN**)

### Member 3 — Incident Ticketing
- `GET /api/tickets` — Get all tickets (**ADMIN, TECHNICIAN**)
- `GET /api/tickets/{id}` — Get ticket by ID
- `GET /api/tickets/my` — Get current user tickets
- `POST /api/tickets/with-attachments` — Create ticket with images
- `PUT /api/tickets/{id}` — Update ticket
- `PATCH /api/tickets/{id}/status` — Update ticket status (**ADMIN, TECHNICIAN**)
- `DELETE /api/tickets/{id}` — Delete ticket (**ADMIN**)
- `GET /api/tickets/{id}/comments` — Get ticket comments
- `POST /api/tickets/{id}/comments` — Add comment
- `DELETE /api/tickets/comments/{id}` — Delete comment

### Member 4 — Notifications, Role Management, OAuth
- `GET /api/notifications` — Get all notifications
- `GET /api/notifications/unread` — Get unread notifications
- `PATCH /api/notifications/{id}/read` — Mark notification as read
- `PATCH /api/notifications/read-all` — Mark all notifications as read
- `DELETE /api/notifications/{id}` — Delete notification
- `GET /api/auth/me` — Get current user
- `GET /api/auth/users` — Get all users (**ADMIN**)
- `GET /api/auth/users/technicians` — Get all technicians
- `PATCH /api/auth/users/{id}/role` — Update user role (**ADMIN**)
- `PATCH /api/auth/users/preferences` — Update notification preferences
- `GET /api/analytics/summary` — Get analytics data (**ADMIN**)

---

## Features

### Module A — Resource Catalogue
- Manage resources by type, capacity, location, availability, and status
- Search and filter support

### Module B — Booking Workflow
- Booking states: `PENDING` → `APPROVED` / `REJECTED` / `CANCELLED`
- Conflict detection and capacity validation
- QR code generation and verification screen

### Module C — Incident Ticketing
- Submit tickets with up to 3 image attachments
- Workflow: `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` / `REJECTED`
- Technician assignment and comment system

### Module D — Notifications
- Booking and ticket notifications
- Unread badge, mark as read, mark all as read, delete
- Filter by type and manage notification preferences with toggles

### Module E — Authentication & Access Control
- Google OAuth 2.0 login
- Role model: `USER`, `ADMIN`, `TECHNICIAN`
- Protected routes, session timeout warning
- Profile page and first-time login welcome banner

### Innovation Highlights
- Admin analytics dashboard with booking and ticket statistics
- Top resources and peak booking hours insights
- QR code check-in verification
- Personalized notification preferences
- User profile with last login time

---

## Project Structure

```text
.
├── api/
│   └── src/main/java/.../
│       ├── config
│       ├── controller
│       ├── dto
│       ├── enums
│       ├── exception
│       ├── model
│       ├── repository
│       └── service
├── client/
│   └── src/
│       ├── api
│       ├── assets
│       ├── components
│       ├── constants
│       ├── context
│       └── pages
└── .github/
	└── workflows/
		└── build.yml
```

---

## Security Notes

- Do **not** commit `.env` files.
- Store Google OAuth credentials in environment variables.
- Enforce authentication on all API endpoints.
- Apply strict role-based access control for protected operations.

---

## API Documentation

Swagger/OpenAPI UI is available when the backend is running:

`http://localhost:8080/swagger-ui`

