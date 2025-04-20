import pandas as pd
import sqlite3  # or switch to psycopg2 / SQLAlchemy for PostgreSQL

# === Load data ===
basics = pd.read_csv("title.basics.tsv.gz", sep="\t", na_values='\\N', compression='gzip')
ratings = pd.read_csv("title.ratings.tsv.gz", sep="\t", na_values='\\N', compression='gzip')

# === Filter ===
# Keep only movies and TV series
media = basics[basics['titleType'].isin(['movie', 'tvSeries'])]

# Exclude adult content
media = media[media['isAdult'] != 1]

# Drop rows with missing startYear
media = media[media['startYear'].notna()]

# Merge with ratings
media = media.merge(ratings, on='tconst')

# Rename and select useful columns
media = media.rename(columns={
    'tconst': 'imdb_id',
    'primaryTitle': 'title',
    'startYear': 'year',
    'titleType': 'type',
    'averageRating': 'imdb_rating'
})[['imdb_id', 'title', 'year', 'type', 'imdb_rating']]

# === Save to database ===
conn = sqlite3.connect("imdb_media.db")  # Use psycopg2.connect(...) for PostgreSQL
cursor = conn.cursor()

# Move cursor.execute AFTER you define cursor
cursor.execute("""
CREATE TABLE IF NOT EXISTS media (
  imdb_id TEXT PRIMARY KEY,
  title TEXT,
  year INT,
  type TEXT,
  imdb_rating FLOAT
)
""")

# Insert into DB
media.to_sql("media", conn, if_exists="replace", index=False)

conn.commit()
conn.close()

print("✅ Database created with", len(media), "entries.")
