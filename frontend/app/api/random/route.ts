// app/api/random/route.ts
import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const YOUTUBE_API_KEY = "REPLACE WITH KEY"

async function fetchYouTubeTrailer(title: string): Promise<string | null> {
  const query = encodeURIComponent(`${title} trailer`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${query}&key=${YOUTUBE_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.items && data.items.length > 0) {
    const videoId = data.items[0].id.videoId;
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  return null;
}

export async function GET() {
  const dbPath = path.resolve(process.cwd(), 'imdb_media.db');
  const db = new Database(dbPath);

  // 1. Get a random movie that doesn't have a cached YouTube URL
  const stmt = db.prepare(`
    SELECT imdb_id, title, imdb_rating
    FROM media
    WHERE youtube_url IS NULL
    ORDER BY RANDOM()
    LIMIT 1;
  `);

  const movie = stmt.get();

  if (!movie) {
    return NextResponse.json({ error: 'No uncached movies available' }, { status: 404 });
  }

  const { imdb_id, title, imdb_rating } = movie;

  // 2. Try to fetch a YouTube trailer
  const youtubeUrl = await fetchYouTubeTrailer(title);

  if (!youtubeUrl) {
    return NextResponse.json({ error: 'No trailer found' }, { status: 404 });
  }

  // 3. Save it to the DB
  const update = db.prepare(`
    UPDATE media
    SET youtube_url = ?
    WHERE imdb_id = ?;
  `);
  update.run(youtubeUrl, imdb_id);

  db.close();

  return NextResponse.json({
    title,
    imdb_rating,
    youtube_url: youtubeUrl,
  });
}
