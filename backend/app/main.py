from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.game import router as game_router
from app.utils.db_utils import get_random_movie

app = FastAPI()

# CORS Middleware (to allow frontend to communicate with backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(game_router, prefix="/rooms", tags=["Room"])

@app.get("/")
async def root():
    return {"message": "Welcome to Trailerate Backend!"}

@app.get("/random_movie")
async def random_movie():
    """
    Fetch a random movie from the SQLite database and its trailer URL.
    """
    return get_random_movie()