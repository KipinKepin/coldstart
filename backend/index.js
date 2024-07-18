import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from "dotenv";
import SequelizeStore from 'connect-session-sequelize'

// 
import bodyParser from 'body-parser'

// Routes
import UserRoute from './routes/UserRoute.js';
import PreferenceRoute from './routes/PreferenceRoute.js';
import AuthRoute from './routes/AuthRoute.js';

// Database
import db from './config/Database.js';

import fs from 'fs'
import path from 'path'
import multer from 'multer'

dotenv.config();
// db.sync()
const app = express();
app.use(bodyParser.json());

const sessionStore = SequelizeStore(session.Store)

const store = new sessionStore({
    db: db
})

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: 'auto'
    }
}));

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));

const setUser = (req, res, next) => {
    if (req.session.userId) {
        req.userId = req.session.userId;
        next();
    } else {
        res.status(401).json({ msg: "Unauthorized" });
    }
};

const upload = multer();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(UserRoute);
app.use(PreferenceRoute);
app.use(AuthRoute)
app.use(setUser)
app.post('/preferences', upload.none(),)
// store.sync()
app.post('/preferences', upload.none(), (req, res) => {
    const { age, fitnessLevel, exerciseFrequency, exerciseDuration, balanceDiet, motivation } = req.body;
    console.log('Received Data:', req.body)
    // Path to your dataset_TA.csv file
    const csvFilePath = path.join(__dirname, 'public', 'datas', 'dataset_TA.csv');

    // Format the new row
    const newRow = `${age},${fitnessLevel},${exerciseFrequency},${exerciseDuration},${balanceDiet},${motivation}\n`;

    // Append the new row to the CSV file
    fs.appendFile(csvFilePath, newRow, (err) => {
        if (err) {
            console.error('Error writing to CSV file:', err);
            return res.status(500).json({ msg: 'Failed to add preference' });
        }
        res.status(200).json({ msg: 'Preference added successfully' });
    });
});

app.listen(process.env.APP_PORT, () => {
    console.log(`Server up and running on port ${process.env.APP_PORT}`);
});
