import pandas as pd
import sqlite3

# === Load data ===
basics = pd.read_csv("title.basics.tsv.gz", sep="\t", na_values='\\N', compression='gzip')
ratings = pd.read_csv("title.ratings.tsv.gz", sep="\t", na_values='\\N', compression='gzip')

media = basics[basics['titleType'].isin(['movie', 'tvSeries'])]
media = media[media['isAdult'] != 1]
media = media[media['startYear'].notna()]
media = media.merge(ratings, on='tconst')
media = media[media['numVotes'] >= 100]
media = media[media['startYear'] >= 2000]

# === Rename and select useful columns ===
media = media.rename(columns={
    'tconst': 'imdb_id',
    'primaryTitle': 'title',
    'startYear': 'year',
    'titleType': 'type',
    'averageRating': 'imdb_rating'
})[['imdb_id', 'title', 'year', 'type', 'imdb_rating']]

# === Save to SQLite ===
conn = sqlite3.connect("imdb_media.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS media (
  imdb_id TEXT PRIMARY KEY,
  title TEXT,
  year INT,
  type TEXT,
  imdb_rating FLOAT
)
""")

media.to_sql("media", conn, if_exists="replace", index=False)

conn.commit()
conn.close()

print("✅ Database created with", len(media), "entries.")
