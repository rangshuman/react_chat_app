import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://192.168.0.243:3000"]
    }
});

io.on('connection', (socket) => {
    //  -- when a user connects
    console.log('a user connected')

    // -- saving userid and socketid from client
    socket.on('initiate', async ({ room, username }) => {
        socket.join(room);
        socket.username = username
        socket.room = room
        const sockets = await io.in(room).fetchSockets();
        let trimmedSockets = sockets.map(x => {
            return { socketId: x.id, username: x.username }
        })
        io.to(room).emit("active-users", trimmedSockets);
    })

    // -- send and get messages
    socket.on('send-message', ({ username, room, content }) => {
        io.to(room).emit("get-message", { username, content });
    })

    // -- when a user disconnects
    socket.on('disconnect', async () => {
        console.log("a user disconnected")
        const sockets = await io.in(socket.room).fetchSockets();
        let trimmedSockets = sockets.map(x => {
            return { socketId: x.id, username: x.username }
        })
        io.to(socket.room).emit("active-users", trimmedSockets);
    })
})

httpServer.listen(process.env.PORT, () => {
    console.log("Socket server started successfully")
});
