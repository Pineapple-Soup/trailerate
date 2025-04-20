from random import randint
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.utils.websocket import RoomManager

import logging

# Set up logging
logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.INFO)

router = APIRouter()
room_manager = RoomManager()

@router.post("/create-room")
async def create_room():
    """
    Create a new room, generate a unique 4-digit ID, and initialize the room state.
    """
    while True:
        room_id = f"{randint(1000, 9999)}"
        if not await room_manager.room_exists(room_id):
            await room_manager.create_room(room_id)
            logger.info(f"Created room {room_id}")
            return {"room_id": room_id}

@router.websocket("/room")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for players to join a room and receive updates.
    """
    # Accept the WebSocket connection
    await websocket.accept()

    try:
        # Step 1: Receive initial connection message
        init_message = await websocket.receive_json()
        player_name = init_message.get("player_name")
        room_code = init_message.get("room_code")

        # Validate inputs
        if not player_name:
            await websocket.close(code=4001, reason="player_name is required")
            logger.warning("WebSocket closed: player_name is required")
            return

        if not room_code or not await room_manager.room_exists(room_code):
            await websocket.close(code=4000, reason="Invalid room code")
            logger.warning(f"WebSocket closed: Invalid room code {room_code}")
            return

        # Step 2: Connect the player to the room
        await room_manager.connect(websocket, room_code, player_name)
        logger.info(f"Player {player_name} connected to room {room_code}")

        # Step 3: Listen for incoming messages
        while True:
            message = await websocket.receive_json()
            msg_type = message.get("type")
            data = message.get("data")


            if msg_type == "guess":
                guess =  data.get("guess")
                if guess is None:
                    await websocket.close(code=4002, reason="Invalid guess")
                    logger.warning(f"WebSocket closed: Invalid guess from {player_name}")
                    return
                await room_manager.submit_guess(room_code, player_name, guess)
                logger.info(f"Player {player_name} submitted guess {guess} in room {room_code}")

            elif msg_type == "ready":
                await room_manager.mark_player_ready(room_code, player_name)
                logger.info(f"Player {player_name} marked ready in room {room_code}")

            else:
                await room_manager.broadcast(
                    {"type": "broadcast", "data": {"message": f"{player_name} says: {message.get('text', '')}"}},
                    room_code,
                )

    except WebSocketDisconnect:
        # Handle disconnection gracefully
        logger.info(f"Player {player_name} disconnected from room {room_code}")
        await room_manager.disconnect(websocket, room_code)
        await room_manager.broadcast(
            {"type": "broadcast", "data": {"message": f"{player_name} has left the room."}},
            room_code,
        )