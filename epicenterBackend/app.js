import express from 'express';
import cors from 'cors';

import { PORT } from './config/env.js';

import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import incidentRouter from './routes/incident.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import notificationRouter from './routes/notification.routes.js';
import connectToDatabase from './database/mongodb.js';
import errorMiddlware ,{notFound} from './middlewares/error.middleware.js';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';

const app = express();

const allowedOrigins = [
    'https://epicenter-beryl.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4000',
];

app.use(cors({
    origin:function(origin,callback){
        console.log('CORS ORIGIN:',origin);

        if(!origin) return callback(null,true);
        if(allowedOrigins.indexOf(origin)===-1){
            const msg = 'The CORS policy for this site does not'+
            'allow access from the specified Origin.';
            return callback(new Error(msg),false);
        }
        return callback(null,true);
    },
    credentials:true
}));


app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.use(arcjetMiddleware);

app.use("/api/v1/auth",authRouter);
app.use("/api/v1/incident",incidentRouter);
app.use("/api/v1/dashboard",dashboardRouter);
app.use("/api/v1/notification",notificationRouter);

app.get('/',(req,res)=>{
    res.send("Welcome to EPICENTER BACKEND");
})

app.use(notFound);
app.use(errorMiddlware);

app.listen(PORT,async()=>{
    console.log(`EPICENTER backend is working on PORT:${PORT}`);

    await connectToDatabase();
})