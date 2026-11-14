# StudySpot

A web app for finding study spaces at the University of Waterloo. Students rate each space on quietness, WiFi, outlets and seating, and everyone else can filter and rank spaces using those ratings.

## Features

- **Search and filters.** Search by name or building, and filter to spaces with an average rating of 4 or more for the things you need.
- **Best match ranking.** Set how much quietness, WiFi, outlets and seating matter to you. Each space gets a score from 0 to 100, calculated as a weighted average of its review averages.
- **List and map views.** Every result is shown on a Google Map, and clicking a pin links to that space.
- **Shareable results.** Search, filters, ranking weights and view are kept in the URL.
- **Spot pages.** Rating breakdown, photos, reviews, a location map and a link to directions.
- **Accounts.** Email and password sign-in with Supabase Auth. Signed-in users can write one review per space, edit or delete it, and upload photos.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) with React and TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) for Postgres, authentication and file storage
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Lucide](https://lucide.dev) icons

## How it works

Pages are server components that read from Supabase. The home page loads every spot along with its review ratings, then summarizes them into per-category averages (`lib/ratings.ts`). Searching, filtering and ranking happen in the browser, so results update instantly without another request.

The match score maps each category average from the 1 to 5 scale onto 0 to 1, multiplies it by the weight you chose (Ignore = 0, Low = 1, Medium = 2, High = 3), and divides by the total weight. Spaces with no reviews have no score and are listed last.

Writes (reviews and photos) go straight from the browser to Supabase. Row level security policies make sure people can only change their own reviews and photos.

## Project structure

```
app/
  page.tsx                 Home page: loads spots and rating summaries
  SpotExplorer.tsx         Search, filters, ranking, list and map views
  auth/                    Sign-in and sign-up
  study-spots/[id]/        Spot page, reviews and photo upload
components/                Header, map, rating bars and shared styles
lib/                       Supabase client, rating logic and types
supabase/schema.sql        Tables, constraints and access policies
```

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project and run `supabase/schema.sql` in its SQL editor.

3. Copy `.env.example` to `.env.local` and fill in your Supabase URL, publishable key and Google Maps API key. The Maps key needs the Maps JavaScript API enabled.

4. Start the development server:

   ```bash
   npm run dev
   ```

   The app runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm run start` | Serve the production build   |
| `npm run lint`  | Run ESLint                   |
