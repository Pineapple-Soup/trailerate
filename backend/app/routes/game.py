from fastapi import APIRouter, WebSocket
from uuid import uuid4
from app.utils.websocket import RoomManager

router = APIRouter()
room_manager = RoomManager()

@router.post("/create-room")
async def create_room():
    """
    Create a new room, generate a unique ID, and initialize the room state.
    """
    room_id = str(uuid4())  # Generate a unique room ID
    await room_manager.create_room(room_id)
    return {"room_id": room_id}

@router.websocket("/ws/connect/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """
    WebSocket endpoint for players to join a room and receive updates.
    """
    await room_manager.connect(websocket, room_id)

    try:
        while True:
            data = await websocket.receive_text()
            await room_manager.broadcast(f"Player says: {data}", room_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await room_manager.disconnect(websocket, room_id)