const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const Usuario = require('./models/usuario');
const controladorUsuario = require('./controllers/usuario');
const passportConfig = require('./config/passport')
const bodyParser = require('body-parser');
const passport = require('passport');
var phpExpress = require('php-express')();
usuarioGlobal = new Usuario();
const MONGO_URL = 'mongodb+srv://atlasAdmin:Soyirene2.@cluster0-sjwqe.mongodb.net/picCloud?retryWrites=true&w=majority';
const app = express();
const request = require('request')
var host = process.env.ADDRESS || 'localhost';
var port = process.env.PORT || '3001';
var llenarPerfil = require('./views/js/llenarDatos')
const cookie = require('cookie');

app.set('views', './views');
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');
app.use('/html', express.static(__dirname + '/views/html'));
app.use('/css', express.static(__dirname + '/views/css'));
app.use('/js', express.static(__dirname + '/views/js'));
app.use('/img', express.static(__dirname + '/views/img'));

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) return err;
    console.log(`Conexion establecida`);
})

app.use(session({
    secret: `ESTO ES SECRETO`,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
        url: MONGO_URL,
        autoReconnect: true
    })
}))

app.all(/.+\.php$/, phpExpress.router);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Logueado
//inicio
app.get('/:email')

//perfil
app.post(`/perfil/:email`, controladorUsuario.postLogin);
app.get('/perfil/:email', passportConfig.estaAutenticado, (req, res) => {
    llenarPerfil.crearUsuario(req.user)
    res.render('./php/perfil')
    res.cookie('nombre', req.user.nombre, {path: `/perfil`, expires: new Date(Date.now() + 10000), httpOnly: true })
    res.cookie('email', req.user.email, {path: `/perfil`, expires: new Date(Date.now() + 10000), httpOnly: true })
    res.cookie('edad', req.user.edad, {path: `/perfil`, expires: new Date(Date.now() + 10000), httpOnly: true })
})

//fotos

//contacto

//logOut
app.get('/logout', passportConfig.estaAutenticado, controladorUsuario.logout, (req, res) => {
    res.render('./index.php');
});


//No logueado
//  inicio
app.get(`/`, (req, res) => {
    req.session.cuenta = req.session.cuenta ? req.session.cuenta + 1 : 1;
    //res.send(`Hola, has visitado esta pagina: ${req.session.cuenta} veces. `);
    res.render('./index')
})
//  login
app.get('/login', (req, res) => {
    res.render('./php/login')
});
app.post('/loged', controladorUsuario.postLogin, (req, res)=>{
    res.redirect(307, `http://${host}:${port}` + '/perfil/' + req.user.nombre)
});
app.get('/loged',passportConfig.estaAutenticado, (req, res) => {
    res.redirect(`http://${host}:${port}` + '/perfil/' + req.user.nombre)
})

//  registrarse
app.post('/signedup', controladorUsuario.postSignup);
app.post('/signup', controladorUsuario.postSignup);

//  contacto



server = app.listen(3001, function () {
    console.log(`Escuchando en el puerto http://${host}:${port}`);
});
