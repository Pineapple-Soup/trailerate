import sqlite3
import random
import os
from googleapiclient.discovery import build
from dotenv import load_dotenv


load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def search_trailer(title):
    """
    Search for the official trailer of a movie on YouTube.
    """
    query = f"{title} official trailer"
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

def get_random_movie():
    """
    Fetch a random movie from the SQLite database and its trailer URL.
    If the trailer URL is not cached, fetch it from YouTube and update the database.
    """
    conn = sqlite3.connect("imdb_media.db")
    cursor = conn.cursor()

    # Ensure the youtube_url column exists
    try:
        cursor.execute("ALTER TABLE media ADD COLUMN youtube_url TEXT;")
        conn.commit()
    except sqlite3.OperationalError as e:
        if "duplicate column name" not in str(e):
            raise e

    # Query a random movie
    cursor.execute("""
    SELECT imdb_id, title, year, imdb_rating, type, youtube_url
    FROM media
    WHERE year > 2000 AND imdb_rating IS NOT NULL
    ORDER BY RANDOM()
    LIMIT 1;
    """)

    movie = cursor.fetchone()
    if not movie:
        conn.close()
        raise ValueError("No movies found in the database.")

    imdb_id, title, year, rating, media_type, youtube_url = movie

    # Check if trailer URL is cached
    if not youtube_url:
        print(f"Searching trailer for: {title}")
        trailer_url = search_trailer(title)
        if trailer_url:
            print(f"Fetched trailer: {trailer_url}")
            cursor.execute("""
                UPDATE media
                SET youtube_url = ?
                WHERE imdb_id = ?;
            """, (trailer_url, imdb_id))
            conn.commit()
            youtube_url = trailer_url

    conn.close()

    return {
        "title": title,
        "year": year,
        "rating": rating,
        "type": media_type,
        "trailer_url": youtube_url
    }