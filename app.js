const express = require('express');
var bodyParser = require('body-parser')
const multer = require('multer');
const app = express();

const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');
const reportRoutes = require('./routes/report');
const {v4:uuidv4} = require('uuid');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './files')
    },
    filename: (req, file, cb) => {
        cb(null, 'S' + uuidv4() + file.originalname)
    }
})

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //Esto permite el uso cruzado de data, y el * significa que permitira el llamado desde cualquier origen 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization,skip, Content-Length, X-Requested-With');
    next();
});


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(multer({ storage: fileStorage }).any('files'));



app.use('/post', postRoutes);
app.use('/user', userRoutes);
app.use('/report', reportRoutes);



app.listen(8080);