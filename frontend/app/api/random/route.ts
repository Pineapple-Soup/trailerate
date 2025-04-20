// app/api/random/route.ts
import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const YOUTUBE_API_KEY = "AIzaSyCbDWqJ_wwN1QNw3y5xpPGLvGoPG34qz4E"

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

function getRandomMovie() {
    const dbPath = path.resolve(process.cwd(), 'imdb_media.db');
    const db = new Database(dbPath);
  
    const stmt = db.prepare(`
      SELECT imdb_id, title, imdb_rating
      FROM media
      WHERE youtube_url IS NULL
      ORDER BY RANDOM()
      LIMIT 1;
    `);
    const movie = stmt.get();
    db.close();
  
    return movie;
  }

export async function GET() {
  const movie = getRandomMovie();

  if (!movie) {
    return NextResponse.json({ error: 'No uncached movies available' }, { status: 404 });
  }

  const { imdb_id, title, imdb_rating } = movie;

  // fetch a YouTube trailer
  const youtubeUrl = await fetchYouTubeTrailer(title);

  if (!youtubeUrl) {
    return NextResponse.json({ error: 'No trailer found' }, { status: 404 });
  }

  // Save it to the db
  const db = new Database(path.resolve(process.cwd(), 'imdb_media.db'));
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
