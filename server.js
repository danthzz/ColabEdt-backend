const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const Document = require('./models/Docs');
const User = require('./models/User');
const userRoute = require('./routes/auth');
const docRoute = require('./routes/Docs')

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ["https://colabedit.netlify.app", "https://colabedt-backend.onrender.com"],
    methods: ['GET', 'POST', 'PUT'],
    credentials: true,
  },
});

app.use(cors({
    origin: ["https://colabedit.netlify.app", "https://colabedt-backend.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }));

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => console.log(err));

app.use('/api/users', userRoute);
app.use('/api/docs', docRoute);
app.get('/', (req,res) =>{
    return res.json("hello world!")
});

let document = new Document();
let users = [];
let lastSavedVersion = 1;

io.on('connection', (socket) => {

    socket.on('join-document', ({ documentId, username, token }) => {
        socket.join(documentId);
      
        users = users.filter(user => user.username !== username);
      
        const newUser = { username, color: '#' + Math.floor(Math.random() * 16777215).toString(16), id: socket.id };
        users.push(newUser);
      
        socket.emit('load-document', { content: document.content, users });
      
        io.to(documentId).emit('user-list', users);
        

        socket.on('send-changes', (data) => {
            console.log('Alterações recebidas do cliente:', data.content);
            document.content = data.content;
            socket.broadcast.to(documentId).emit('receive-changes', data.content);
        });

        socket.on('save-document', async (data) => {
          if (data.version !== lastSavedVersion) {
              try {
                  document.content = data.content;
                  await document.save();
                  lastSavedVersion = data.version;
                  socket.emit('save-success');
              } catch (error) {
                  console.error('Erro ao salvar documento:', error);
                  socket.emit('save-error', error);
              }
          } else {
              console.log('Documento já está salvo.');
          }
      });

        socket.on('logout', () => {
            users = users.filter(user => user.username !== username);
            io.to(documentId).emit('user-list', users);
            socket.disconnect();
        });
    });

  
    socket.on('disconnect', () => {
        users = users.filter(user => user.id !== socket.id);
        io.emit('user-list', users);
    });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
