import asyncio
from collections import defaultdict

class RoomManager:
    def __init__(self):
        self.rooms = defaultdict(dict)  # Stores room states
        self.connections = defaultdict(list)  # Stores WebSocket connections per room

    async def create_room(self, room_id: str):
        """
        Initialize a new room with 5 rounds and an empty player list.
        """
        self.rooms[room_id] = {
            "rounds": 5,  # Total rounds in the game
            "current_round": 1,  # Start at round 1
            "players": {},  # Players and their scores
            "guesses": [],  # Guesses for the current round
        }

    async def connect(self, websocket, room_id: str):
        """
        Add a WebSocket connection to the specified room.
        """
        if room_id not in self.rooms:
            await websocket.close(code=4000, reason="Room does not exist")
            return

        self.connections[room_id].append(websocket)
        await websocket.accept()

        # Notify all players that a new player has joined
        await self.broadcast(f"A new player has joined room {room_id}!", room_id)

    async def disconnect(self, websocket, room_id: str):
        """
        Remove a WebSocket connection from the specified room.
        """
        if room_id in self.connections:
            self.connections[room_id].remove(websocket)
            if not self.connections[room_id]:
                del self.connections[room_id]

    async def broadcast(self, message: str, room_id: str):
        """
        Broadcast a message to all connected clients in the specified room.
        """
        if room_id in self.connections:
            for connection in self.connections[room_id]:
                await connection.send_text(message)

    async def start_round(self, room_id: str):
        """
        Start a new round in the specified room.
        """
        room = self.rooms[room_id]
        if room["current_round"] > room["rounds"]:
            await self.broadcast("Game over! Final scores will be displayed.", room_id)
            return

        await self.broadcast(f"Starting round {room['current_round']}!", room_id)
        room["current_round"] += 1
        room["guesses"] = []  # Reset guesses for the new round

    async def submit_guess(self, room_id: str, player_name: str, guess: float):
        """
        Submit a player's guess for the current round.
        """
        room = self.rooms[room_id]
        room["guesses"].append({"player": player_name, "guess": guess})
        await self.broadcast(f"{player_name} guessed {guess}.", room_id)

        # Check if all players have submitted guesses
        if len(room["guesses"]) == len(room["players"]):
            await self.end_round(room_id)

    async def end_round(self, room_id: str):
        """
        End the current round and calculate scores.
        """
        room = self.rooms[room_id]
        correct_score = 7.5  # Example IMDb score (replace with actual score logic)
        for guess in room["guesses"]:
            player_name = guess["player"]
            guess_value = guess["guess"]
            score = max(0, 100 - abs(correct_score - guess_value) * 10)
            room["players"][player_name] = room["players"].get(player_name, 0) + score

        await self.broadcast(f"Round ended! Correct score was {correct_score}.", room_id)
        await self.start_round(room_id)