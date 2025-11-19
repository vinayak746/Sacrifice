# ♟️ Sacrifice - Multiplayer Chess

A real-time multiplayer chess game built with Node.js, Express, Socket.IO, and Chess.js. Play chess online with friends or spectate ongoing games!

🔗 **Live Demo:** [sacrifice-vinny.onrender.com](https://sacrifice-vinny.onrender.com)

## ✨ Features

- 🎮 **Real-time Multiplayer** - Play chess with anyone, anywhere in the world
- 👥 **Player Roles** - Automatic assignment of White and Black players
- 👁️ **Spectator Mode** - Watch ongoing games as a spectator
- 📱 **Mobile Support** - Fully responsive design for mobile devices
- ♟️ **Legal Moves Highlighting** - Visual indicators for valid moves
- 🔄 **Game Reset** - Players can reset the game at any time
- ⏱️ **Auto-Reset on Inactivity** - Games automatically reset after 10 minutes of inactivity
- 🔌 **Reconnection Handling** - Spectators are promoted to players when someone disconnects
- 📊 **Live Connection Count** - See how many people are connected

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vinayak746/Sacrifice.git
cd Sacrifice
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Real-time Communication:** Socket.IO
- **Chess Logic:** Chess.js
- **Frontend:** EJS, HTML5, CSS3, JavaScript
- **Server:** HTTP Server

## 📦 Dependencies

```json
{
  "chess.js": "^1.4.0",
  "ejs": "^3.1.10",
  "express": "^5.1.0",
  "socket.io": "^4.8.1"
}
```

## 🎯 How It Works

1. **First Connection** - The first player to connect is assigned White pieces
2. **Second Connection** - The second player is assigned Black pieces
3. **Additional Connections** - All subsequent users join as spectators
4. **Player Disconnect** - When a player leaves, the first spectator is promoted to player
5. **Making Moves** - Click on a piece to see legal moves, then click the destination square
6. **Turn-Based Play** - Players can only move pieces on their turn

## 📁 Project Structure

```
Sacrifice/
├── app.js                 # Main server file with Socket.IO logic
├── package.json           # Project dependencies
├── public/
│   └── js/               # Client-side JavaScript files
├── views/                # EJS templates
└── README.md            # Project documentation
```

## 🎮 Game Features

### Player Management
- Automatic role assignment (White, Black, Spectator)
- Dynamic promotion of spectators when players disconnect
- Turn validation to prevent out-of-turn moves

### Chess Rules
- All standard chess rules implemented via Chess.js
- Legal move validation
- Check and checkmate detection
- Castling, en passant, and pawn promotion support

### Session Management
- 10-minute inactivity timeout
- Automatic game reset on timeout
- Connection count tracking
- Last activity timestamp monitoring

## 🔧 Configuration

The server runs on port 3000 by default. To use a custom port, set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## 🌐 Deployment

This project is deployed on Render. To deploy your own instance:

1. Fork this repository
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Render will automatically detect the build and start commands
5. Your chess game will be live!

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] Player authentication and profiles
- [ ] Game history and move replay
- [ ] Chat functionality
- [ ] Timer/Clock for timed matches
- [ ] ELO rating system
- [ ] Private rooms with game codes
- [ ] Move notation display
- [ ] Sound effects

## 📄 License

This project is licensed under the [MIT License](LICENSE).
## 👨‍💻 Author

**Vinayak**
- GitHub: [@vinayak746](https://github.com/vinayak746)

## 🙏 Acknowledgments

- [Chess.js](https://github.com/jhlywa/chess.js) - Chess move generation and validation
- [Socket.IO](https://socket.io/) - Real-time bidirectional event-based communication
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework for Node.js

---

**Enjoy playing chess! ♟️**
