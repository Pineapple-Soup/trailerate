import asyncio
from collections import defaultdict
from app.utils.db_utils import get_random_movie


class RoomManager:
    def __init__(self):
        self.rooms = {}  # Stores room states
        self.connections = defaultdict(list)  # Stores WebSocket connections per room
        self.mock_movie_data = {
            "title": "Inception",
            "year": 2010,
            "director": "Christopher Nolan",
            "actors": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
            "trailer_url": "https://www.youtube.com/watch?v=YoHD9XEInc0",
            "score": 85
        }

    async def room_exists(self, room_code: str) -> bool:
        """Check if a room with the given code exists."""
        return room_code in self.rooms

    async def create_room(self, room_code: str):
        """Initialize a new room."""
        self.rooms[room_code] = {
            "rounds": 5,  # Total rounds in the game
            "current_round": 0,  # Start at round 1
            "players": {},  # Players and their scores
            "guesses": [],  # Guesses for the current round
            "ready_players": set(),  # Players who clicked "Ready"
        }

    async def connect(self, websocket, room_code: str, username: str):
        """Add a WebSocket connection to the specified room."""
        if room_code not in self.rooms:
            await websocket.close(code=4000, reason="Room does not exist")
            return

        # Add player to room state and initialize their score
        self.rooms[room_code]["players"][username] = 0
        self.connections[room_code].append(websocket)
        room = self.rooms[room_code]


        # Notify all players that a new player has joinesd
        all_players = [{"player_name": player, "status": "ready" if player in room["ready_players"] else "not_ready"} for player in room["players"].keys()]
        await self.broadcast(
            {"type": "user_join", "data": {"user": username, "message": f"{username} has joined room {room_code}!", "connected_users": all_players}},
            room_code,
        )

    async def disconnect(self, websocket, room_code: str):
        """Remove a WebSocket connection from the specified room."""
        if room_code in self.connections:
            self.connections[room_code].remove(websocket)
            if not self.connections[room_code]:
                del self.connections[room_code]

    async def broadcast(self, message: dict, room_code: str):
        """Broadcast a message to all connected clients in the specified room."""
        if room_code in self.connections:
            for connection in self.connections[room_code]:
                await connection.send_json(message)

    async def submit_guess(self, room_code: str, player_name: str, guess: float):
        """Submit a player's guess for the current round."""
        room = self.rooms[room_code]
        room["guesses"].append({"player": player_name, "guess": guess})
        await self.broadcast(
            {"type": "broadcast", "data": {"message": f"{player_name} guessed {guess}."}},
            room_code,
        )

        # Check if all players have submitted guesses
        if len(room["guesses"]) == len(room["players"]):
            await self.end_round(room_code)

    async def end_round(self, room_code: str):
        """End the current round and calculate scores."""
        room = self.rooms[room_code]
        correct_score = room["current_movie"]["imdb_rating"]
        scores = []

        for guess in room["guesses"]:
            player_name = guess["player"]
            guess_value = guess["guess"]
            this_score = 100 - abs(correct_score - guess_value)
            room["players"][player_name] += this_score
            scores.append({
                "player": player_name,
                "guess": guess_value,
                "increment": this_score,
                "total_score": room["players"][player_name] # AFTER incrementing
            })
        
        room["players"] = {player: total_score for player, total_score in room["players"].items() if total_score > 0}
        # Sort scores in descending order
        scores.sort(key=lambda x: x["total_score"], reverse=True)

        # Broadcast results
        await self.broadcast(
            {
                "type": "round_end",
                "data": {
                    "message": "Round ended!",
                    "correct_score": correct_score,
                    "scores": room["players"],
                },
            },
            room_code,
        )

        # Reset ready players for the next round
        room["ready_players"] = set()
        room["guesses"] = []

        await self.start_next_round(room_code)

    async def mark_player_ready(self, room_code: str, player_name: str):
        """Mark a player as ready for the next round."""
        room = self.rooms[room_code]
        room["ready_players"].add(player_name)

        # await self.broadcast(
        #     {"type": "user_ready", "data": {"message": f"{player_name} is ready for the next round!", "ready_players": list(room["ready_players"])}},
        #     room_code,
        # )

        all_players = [{"player_name": player, "status": "ready" if player in room["ready_players"] else "not_ready"} for player in room["players"].keys()]

        await self.broadcast(
            {"type": "user_ready", "data": {"user": player_name, "message": f"{player_name} is ready for the next round!", "players": all_players}},
            room_code
        )


        # Check if all players are ready
        if len(room["ready_players"]) == len(room["players"]):
            room["ready_players"] = set() # reset everyone to unready
            await self.start_next_round(room_code)

    async def start_next_round(self, room_code: str):
        """Start the next round."""
        room = self.rooms[room_code]
        if room["current_round"] >= room["rounds"]:
            await self.broadcast(
                 {"type": "game_end", "data": {"message": "Game over! Final scores will be displayed.", "final_scores": room["players"]} },
                room_code,
            )
            return
        
        # Fetch a random movie
        try:
            movie_data = get_random_movie()
        except ValueError as e:
            await self.broadcast(
                {"type": "error", "data": {"message": str(e)}},
                room_code,
            )
            return

        await self.broadcast(
            {"type": "countdown", "data": {"message": "Next round starts in 5 seconds..."}},
            room_code,
        )

        # Wait for 5 seconds
        await asyncio.sleep(5)

        # Start the next round
        room["current_movie"] = movie_data
        room["current_round"] += 1
        room["guesses"] = []  # Reset guesses for the new round

        # Broadcast start of next round
        await self.broadcast(
            {"type": "round_start", "data": {"round": room["current_round"], "movie_data": movie_data}},
            room_code,
        )