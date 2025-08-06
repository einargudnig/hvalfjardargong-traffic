# Tunnel Traffic App

A mobile-first web application for crowdsourced tunnel traffic reporting.

## Features

- Simple tunnel direction selection (North/South)
- Geolocation-verified traffic reporting
- Crowdsourced traffic scoring algorithm
- Mobile-optimized interface
- Anonymous UUID-based user tracking

## Tech Stack

- **Frontend**: Next.js (React) with Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Postgres (Neon serverless Postgres)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Postgres database (we recommend [Neon](https://neon.tech))

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tunnel-traffic-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the `DATABASE_URL` with your Postgres connection string

4. Initialize the database:
   ```bash
   npm run init-db
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Development

### Project Structure

```
tunnel-traffic-app/
├── app/               # Next.js app directory
│   ├── api/           # API routes
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Home page
│   └── globals.css    # Global styles
├── components/        # React components
├── lib/              # Utility functions and libraries
├── public/           # Static assets
└── scripts/          # Database and utility scripts
```

### Database Schema

```sql
-- Tunnels table
CREATE TABLE tunnels (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  north_entrance_coordinates POINT NOT NULL,
  south_entrance_coordinates POINT NOT NULL
);

-- Traffic reports table
CREATE TABLE traffic_reports (
  id UUID PRIMARY KEY,
  tunnel_id UUID REFERENCES tunnels(id),
  direction TEXT NOT NULL CHECK (direction IN ('north', 'south')),
  user_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  geolocation_verified BOOLEAN DEFAULT FALSE,
  coordinates POINT,
  has_traffic BOOLEAN NOT NULL
);
```

## License

MIT
