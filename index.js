const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const router = require('./routes');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);  //le pasa variables al paquete
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');

require('dotenv').config({path: 'variables.env'});

//instancia express
const app = express();

//habilita body parser, para ver los req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//validacion de campos con express validator
app.use(expressValidator());

//habilitar handlebars como view
app.engine('handlebars',
    exphbs({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')
    })
);

//motor de plantillas
app.set('view engine', 'handlebars');

//static files
app.use(express.static(path.join(__dirname, 'public')));

//guardar la sesion para no tener que autenticarnos continuo en la bd
app.use(cookieParser());

//sesion de conexion mongo
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

//inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//Alertas y flash messages
app.use(flash());

//crear nuestro middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});

//llamado de rutas
app.use('/', router());

//404 pagina no existente
app.use((req, res, next) => {
    next(createError(404, 'No encontrado'))
});

//Administracion de los errores
app.use((error, req, res) => {
    res.locals.mensaje = error.message;
    const status = error.status  || 500;
    res.locals.status = status;
    res.status(status);

    res.render('error');
});

//Dejar que heroku asigne el puerto
const host = '0.0.0.0';
const port = process.env.PORT;


app.listen(port,host, () => {
    console.log('El servidor esta funcioando');
});

//escucha al puerto
//app.listen(process.env.PUERTO);


//llamada del correo
//require('./handlers/email');

