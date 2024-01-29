const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const passport = require('passport'); //authentication middleware for node js
const LocalStrategy = require('passport-local').Strategy; //handling local user name password authentication inside of our app
const socketio = require('socket.io');

const app = express();
const httpServer = http.createServer(app);

const io = socketio(httpServer);

const port = 3000;
const cors = require('cors');
app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize());

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const jwt = require('jsonwebtoken');

mongoose
  .connect(
    'mongodb+srv://Gomathi:Gomathi%402002@cluster0.qottrhl.mongodb.net/',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => {
    console.log('connected to mongo database');
  })
  .catch(err => {
    console.log('Error ', err);
  });

const User = require('./models/user');
const Message = require('./models/message');
const Call = require('./models/call');

//endpoint for registration of the user
app.post('/register', async (req, res) => {
  const {name, email, password} = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({message: 'Missing required fields'});
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({name, email, password: hashedPassword});
    const savedUser = await newUser.save();
    res
      .status(200)
      .json({message: 'User registered successfully', userId: savedUser._id});
  } catch (error) {
    console.error('Error occurred', error);
    res.status(500).json({message: 'Error when registering the user'});
  }
});

//function to create a token for the user
const createToken = userId => {
  //set the token payload
  const payload = {
    userId: userId,
  };
  //Generate the token with a secret key and expiration time
  const token = jwt.sign(payload, 'Gomathi 2002', {expiresIn: '1h'});
  return token;
};
//endpoint for logging in of that particular user
app.post('/login', async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(400).json({message: 'Email and password are required'});
  }

  try {
    const user = await User.findOne({email});
    console.log('entered password', password);
    console.log('password', user.password);
    console.log('hash', await bcrypt.compare(password, user.password));
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({message: 'Invalid email or password12'});
    }

    const token = createToken(user._id);
    res.status(200).json({token});
  } catch (error) {
    console.error('Error in finding the user', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.get('/users', async (req, res) => {
  try {
    const {callerEmail, calleeEmail} = req.query;
    console.log('emails', callerEmail);
    console.log('emails', calleeEmail);
    // Check if 'emails' is an array
    if (!callerEmail || !calleeEmail) {
      return res
        .status(400)
        .json({message: 'Both callerEmail and calleeEmail are required'});
    }

    const users = await User.find({
      email: {$in: [callerEmail, calleeEmail]},
    });

    console.log('users length', users.length);
    if (users.length >= 2) {
      // Assuming two users are found based on callerEmail and calleeEmail
      const callerUser = await User.findOne({email: callerEmail});
      const calleeUser = await User.findOne({email: calleeEmail});

      if (callerUser && calleeUser) {
        console.log('both are present');
        const callerId = callerUser._id;
        const calleeId = calleeUser._id;
        console.log('caller', callerId);
        console.log('callee', calleeId);

        res.json({
          callerId,
          calleeId,
        });
      } else {
        res.status(404).json({message: 'Users not found'});
      }
    } else {
      res.status(404).json({message: 'Not enough users found'});
    }
  } catch (error) {
    res.status(500).json({error: 'Internal server error'});
  }
});

let answeredCallId;
// When a user initiates a call
app.post('/call', async (req, res) => {
  const {callerId, calleeId} = req.body;
  console.log('callerId', callerId);
  console.log('calleeId', calleeId);

  const newCall = new Call({
    caller: callerId, // Replace with the actual caller's user ID
    callee: calleeId, // Replace with the actual callee's user ID
  });

  try {
    const answeredCall = await newCall.save();
    console.log('callID saved', answeredCall._id);
    answeredCallId = answeredCall._id;
    console.log('calleeId', calleeId);

    res.json({answeredCallId});
  } catch (err) {
    console.error('Error creating call document:', err);
    // Handle the error appropriately
  }
});

io.on('connection', socket => {
  try {
    console.log(`User connected: ${socket.id}`);
    socket.on('login', async userId => {
      socket.on('register-caller', async callerId => {
        // Create and save the socket ID in the database
        console.log('data in register user', callerId);
        try {
          console.log('userId', userId);
          if (userId === callerId) {
            const caller = await User.findOne({_id: callerId});
            if (caller) {
              caller.callerSocketId = socket.id;
              await caller.save();
              console.log('caller unique', caller.callerSocketId);
            }
          } else {
            console.log(`User with ID ${callerId} not found in the database`);
          }
        } catch (error) {
          console.error('Error updating caller socketId:', error);
        }
      });
      socket.on('register-callee', async calleeId => {
        try {
          console.log('userId', userId);
          if (userId === calleeId) {
            const callee = await User.findOne({_id: calleeId});
            callee.calleeSocketId = socket.id;
            await callee.save();
            console.log('callee unique', callee.calleeSocketId);
          } else {
            console.log(`User with ID ${calleeId} not found in the database`);
          }
        } catch (error) {
          console.error('Error updating callee socketId:', error);
        }
      });
    });

    socket.on('caller-join-room', async data => {
      const {callerId, room} = data;
      if (callerId) {
        const roomId = room.toString();
        socket.join(roomId);
        console.log(`Caller  ${callerId} joined room ${roomId}`);
      } else {
        console.log('the user is not found');
      }
    });

    socket.on('callee-join-room', async data => {
      const {calleeId, room} = data;
      if (calleeId) {
        const roomId = room.toString();
        socket.join(roomId);
        console.log(`Callee   ${calleeId} joined room ${roomId}`);
      } else {
        console.log('the user is not found');
      }
    });

    socket.on('incoming call', async data => {
      console.log('data', data);
      const {callId, calleeId, room} = data;
      const roomId = room.toString();
      console.log('room incoming call', room);
      console.log('incoming call calleeId', calleeId);

      const calleeUser = await User.findOne({_id: calleeId});
      console.log('calleeuser', calleeUser);
      if (calleeUser) {
        const calleeSocketId = calleeUser.calleeSocketId;
        console.log('calleeSocketId', calleeSocketId);

        socket.to(calleeSocketId).emit('incoming call', data);
        console.log('call-initiated emitted to callee');
      } else {
        console.log('Socket ID not found for calleeID:', calleeId);
      }
    });

    // Handle SDP offers, answers, and ICE candidates
    socket.on('offer', async data => {
      const {callerId, calleeId, offer} = data;
      const calleeUser = await User.findOne({_id: calleeId});
      if (calleeUser) {
        const calleeSocketId = calleeUser.calleeSocketId;
        console.log('callee socketID to send offer event', calleeSocketId);
        io.to(calleeSocketId).emit('offer', data);
        console.log('offer emitted');
      } else {
        console.log('Recipient socket id not found');
      }

      //socket.broadcast.emit('offer', data);
    });
    socket.on('error', error => {
      console.log('Socket.IO error:', error);
    });

    socket.on('caller-ice-candidate', async data => {
      const {calleeId, callerId} = data;
      const calleeUser = await User.findOne({_id: calleeId});
      //const callerUser = await User.findOne({_id: callerId});
      if (calleeUser) {
        const calleeSocketId = calleeUser.calleeSocketId;
        console.log(
          'callee socketID to send ice candidate event',
          calleeSocketId,
        );
        io.to(calleeSocketId).emit('caller-ice-candidate', data);
        console.log('ice candidate emitted to callee', data);
      } else {
        console.log(
          'Recipient socket id not found for callee in ice candidate',
        );
      }
    });
    socket.on('callee-ice-candidate', async data => {
      const {calleeId, callerId} = data;

      const callerUser = await User.findOne({_id: callerId});

      if (callerUser) {
        const callerSocketId = callerUser.callerSocketId;

        console.log(
          'caller socketID to send ice candidate event',
          callerSocketId,
        );
        io.to(callerSocketId).emit('callee-ice-candidate', data);
        console.log('ice candidate emitted to caller', data);
      } else {
        console.log(
          'Recipient socket id not found for caller in ice candidate',
        );
      }
    });
    socket.on('caller-ready', async calleeId => {
      const calleeUser = await User.findOne({_id: calleeId});
      if (calleeUser) {
        const calleeSocketId = calleeUser.calleeSocketId;
        console.log('caller socketID to send answer event', calleeSocketId);
        io.to(calleeSocketId).emit('caller-ready', calleeId);
        console.log('answer emitted');
      } else {
        console.log('Recipient socket id not found in answer event');
      }
    });
    socket.on('answer', async data => {
      const {callerId, calleeId} = data;
      const calleeUser = await User.findOne({_id: calleeId});
      if (calleeUser && calleeUser.calleeSocketId === socket.id) {
        const callerUser = await User.findOne({_id: callerId});
        console.log('Calleruser', callerUser);

        if (callerUser) {
          const callerSocketId = callerUser.callerSocketId;
          console.log('caller socketID to send answer event', callerSocketId);
          io.to(callerSocketId).emit('answer', data);
          console.log('answer emitted');
        } else {
          console.log('Recipient socket id not found in answer event');
        }
      }
    });

    socket.on('sendMessage', message => {
      console.log(message);
      io.emit('chatMessages', message);
    });
    socket.on('call hangup', async data => {
      const {callerId, calleeId} = data;
      const calleeUser = await User.findOne({_id: calleeId});
      if (calleeUser) {
        const calleeSocketId = calleeUser.calleeSocketId;
        console.log('callee socketID to send answer event', calleeSocketId);
        io.to(calleeSocketId).emit('call hangup', data);
        console.log('hangup emitted');
      } else {
        console.log('Recipient socket id not found');
      }
    });
    socket.on('call decline', async data => {
      const {callerId} = data;
      const callerUser = await User.findOne({_id: callerId});
      if (callerUser) {
        const callerSocketId = callerUser.callerSocketId;
        console.log('callee socketID to send decline event', callerSocketId);
        io.to(callerSocketId).emit('call decline', data);
        console.log('call decline emitted');
      } else {
        console.log('Recipient socket id not found');
      }
    });
    socket.on('disconnect', async () => {
      try {
        console.log('Disconnected socket ID:', socket.id);
        const caller = await User.findOne({callerSocketId: socket.id});
        const callee = await User.findOne({calleeSocketId: socket.id});
        console.log('caller disconnect part', caller);
        console.log('callee disconnect part', callee);
        if (caller) {
          caller.callerSocketId = null; // Reset or handle the socket ID as needed
          await caller.save();
          console.log(`User with ID ${caller._id} disconnected`);
        }
        if (callee) {
          callee.calleeSocketId = null; // Reset or handle the socket ID as needed
          await callee.save();
          console.log(`User with ID ${caller._id} disconnected`);
        }
      } catch (error) {
        console.log('Error handling disconnect:', error);
      }
    });
  } catch (e) {
    console.log('error when connecting');
  }
});

// When the call ends for the caller
const CallId = answeredCallId; // Replace with the actual call ID for the caller
const callEndTime = new Date(); // Replace with the actual end time

async function updateCall() {
  try {
    await Call.findByIdAndUpdate(CallId, {endTime: callEndTime});
    // Caller's call document updated successfully
  } catch (error) {
    console.error('Error updating caller call document:', error);
    // Handle the error appropriately
  }
}
updateCall();
//endpoint to delete the messages!
app.post('/deleteMessages', async (req, res) => {
  try {
    const {messages} = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({message: 'invalid req body!'});
    }

    await Message.deleteMany({_id: {$in: messages}});

    res.json({message: 'Message deleted successfully'});
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Internal Server'});
  }
});
