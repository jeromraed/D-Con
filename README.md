# D-Con

D-Con is a web application built for organizing the **D-Con Conference** — a gathering of priests and servants from different churches' STEAM development centers. The app provides schedule management, venue maps, and admin tools for event organizers.

## Features

- **📅 Event Schedule** — Full day timeline with parallel session support, session details, and real-time task tracking
- **🗺️ Venue Map** — Interactive D-Con map for navigating the event venue
- **👥 User Management** — Admin panel to promote/demote users to admin roles
- **🔐 Authentication** — JWT-based auth with login, registration, and password management
- **✅ Task Tracking** — Mark events as done with progress tracking (admin only)
- **📱 Responsive** — Mobile-friendly design that works on all devices

## Tech Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Frontend | React + Vite + Tailwind CSS    |
| Backend  | Django + Django REST Framework |
| Auth     | JWT (SimpleJWT)                |
| Database | PostgreSQL                     |
| DevOps   | Docker + Docker Compose        |

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Quick Start (Docker)

```bash
# Clone the repo
git clone https://github.com/jeromraed/D-Con.git
cd D-Con

# Start everything
docker compose up --build
```

The app will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

### Default Admin Account

A default admin user is created automatically:

- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ **Change the default password** before deploying to production.

### Manual Setup (Without Docker)

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env

# Run migrations and start server
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend

```bash
cd frontend

# Copy and configure environment
cp .env.example .env

# Install dependencies and start
npm install
npm run dev
```

## Project Structure

```
D-Con/
├── backend/                 # Django REST API
│   ├── competition/         # Main app (models, views, auth)
│   │   ├── auth_views.py    # Login, register, user management
│   │   ├── models.py        # Schedule events, sub-events, scores
│   │   ├── views.py         # API endpoints
│   │   └── urls.py          # Route definitions
│   ├── core/                # Django settings
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # React + Vite
│   ├── public/              # Static assets (logos, map)
│   ├── src/
│   │   ├── context/         # Auth context provider
│   │   ├── pages/           # Page components
│   │   │   ├── Schedule.jsx # Event schedule + task tracking
│   │   │   ├── MapPage.jsx  # Venue map
│   │   │   ├── Login.jsx    # Auth forms
│   │   │   ├── AdminUsers.jsx # User management
│   │   │   └── ...
│   │   ├── services/        # API client (Axios)
│   │   └── App.jsx          # Routing + layout
│   └── Dockerfile
├── docker-compose.yml
└── .gitignore
```

## API Endpoints

| Method | Endpoint                            | Description         | Auth  |
| ------ | ----------------------------------- | ------------------- | ----- |
| POST   | `/api/auth/register/`               | Register new user   | No    |
| POST   | `/api/auth/login/`                  | Login               | No    |
| POST   | `/api/auth/logout/`                 | Logout              | Yes   |
| GET    | `/api/auth/profile/`                | Get user profile    | Yes   |
| POST   | `/api/auth/change-password/`        | Change password     | Yes   |
| GET    | `/api/auth/users/`                  | List all users      | Admin |
| POST   | `/api/auth/users/:id/toggle-admin/` | Toggle admin status | Admin |
| GET    | `/api/schedule/`                    | Get all events      | No    |
| POST   | `/api/schedule/manage/`             | Create event        | Admin |
| PUT    | `/api/schedule/manage/:id/`         | Update event        | Admin |
| DELETE | `/api/schedule/manage/:id/`         | Delete event        | Admin |

## Environment Variables

### Backend (`backend/.env`)

| Variable               | Default                 | Description          |
| ---------------------- | ----------------------- | -------------------- |
| `DEBUG`                | `True`                  | Django debug mode    |
| `SECRET_KEY`           | —                       | Django secret key    |
| `ALLOWED_HOSTS`        | `localhost,127.0.0.1`   | Allowed host headers |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | CORS whitelist       |
| `POSTGRES_DB`          | `dcon`                  | Database name        |
| `POSTGRES_USER`        | `dcon`                  | Database user        |
| `POSTGRES_PASSWORD`    | `dcon_secret`           | Database password    |
| `POSTGRES_HOST`        | `db`                    | Database host        |
| `POSTGRES_PORT`        | `5432`                  | Database port        |

### Frontend (`frontend/.env`)

| Variable       | Default                     | Description     |
| -------------- | --------------------------- | --------------- |
| `VITE_API_URL` | `http://localhost:8000/api` | Backend API URL |

## License

This project is private and intended for D-Con conference use.
