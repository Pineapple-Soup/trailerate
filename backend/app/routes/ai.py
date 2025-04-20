from fastapi import APIRouter
from app.services.ai import predict_rating

router = APIRouter()

@router.post("/predict-rating")
async def predict_movie_rating(trailer_id: str):
    # prediction = predict_rating(trailer_id)
    return {"predicted_rating": 5}