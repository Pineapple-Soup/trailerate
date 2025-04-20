# import sqlite3
# import random

# conn = sqlite3.connect("imdb_media.db")
# cursor = conn.cursor()

# cursor.execute("""
# SELECT title, year, imdb_rating, type
# FROM media
# WHERE year > 2000 AND imdb_rating IS NOT NULL
# ORDER BY RANDOM()
# LIMIT 1;
# """)

# movie = cursor.fetchone()
# print(f"{movie[0]} ({movie[1]}) - Rating: {movie[2]} [{movie[3]}]")
from googleapiclient.discovery import build
import sqlite3

YOUTUBE_API_KEY = "REPLACE WITH KEY"

def search_trailer(title):
    query = f"{title} trailer"

    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    request = youtube.search().list(
        q=query,
        part='snippet',
        type='video',
        maxResults=1
    )
    response = request.execute()

    if response['items']:
        video_id = response['items'][0]['id']['videoId']
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        return video_url
    else:
        return None

# === Connect to DB ===
conn = sqlite3.connect("imdb_media.db")
cursor = conn.cursor()

# === Add youtube_url column if it doesn't exist ===
try:
    cursor.execute("ALTER TABLE media ADD COLUMN youtube_url TEXT;")
    conn.commit()
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        pass  # already added
    else:
        raise e

# === Query a random movie ===
cursor.execute("""
SELECT imdb_id, title, year, imdb_rating, type, youtube_url
FROM media
ORDER BY RANDOM()
LIMIT 1;
""")

movie = cursor.fetchone()
imdb_id, title, year, rating, media_type, youtube_url = movie

print(f"{title} ({year}) - Rating: {rating} [{media_type}]")

# === Check for cached trailer ===
if youtube_url:
    print("Using cached trailer:", youtube_url)
else:
    print("Searching trailer for:", title)
    trailer_url = search_trailer(title)
    print("Fetched trailer:", trailer_url)

    if trailer_url:
        # Save trailer URL in database
        cursor.execute("""
            UPDATE media
            SET youtube_url = ?
            WHERE imdb_id = ?;
        """, (trailer_url, imdb_id))
        conn.commit()

conn.close()
