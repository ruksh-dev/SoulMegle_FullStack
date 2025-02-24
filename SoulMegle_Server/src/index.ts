import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import path from 'path'
import passport from 'passport'
import googleStrategy from './utils/googleStrategy'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import cors from 'cors'
import { AllRoutes } from './routes'
import errorHandler from './middlewares/errorHandler'
import checkAuth from './middlewares/checkAuth'
import handleSocketEvents from './middlewares/handleSocketEvents/index'
import { addUserSocketId,removeUserSocketId, getUserSocketId } from './services/redisService'
import {addToMatchMakingQueue} from './services/redisQueue'
import {addUserEmbedding, removeUserEmbedding} from './services/redisService'
dotenv.config({path: path.resolve(__dirname, '../.env')})
const PORT=process.env.PORT
const app=express()
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://192.168.1.2:5173', 'https://192.168.1.2:5173', 'http://localhost:5173', 'https://localhost:5173','https://test-soulmegle.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ["my-custom-header"]
  },
  transports: ["polling", "websocket"]
})
app.use(cors({
  origin: ['http://192.168.1.2:5173', 'https://192.168.1.2:5173', 'http://localhost:5173', 'https://localhost:5173','https://test-soulmegle.vercel.app'],
  credentials: true,
  allowedHeaders: ["my-custom-header"]
}));

app.use(express.json())
app.use(cookieParser());
const sessionMiddleware=session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
  proxy: true,
  cookie: {
    secure: true,
    sameSite: 'none'
  },
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());
io.engine.use(passport.initialize());
io.engine.use(passport.session());
googleStrategy();
io.engine.use(checkAuth)
export const SocketIoInstance=io;
app.use(AllRoutes)
app.use(errorHandler)
handleSocketEvents();


server.listen(Number(PORT),()=>console.log('server running on port: ',PORT))