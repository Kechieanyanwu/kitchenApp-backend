/* eslint-disable no-undef */

//is it okay to login and have a session, and afterwards, while verifying with JWT, to have no session and be stateless?
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const cors = require('cors');
app.use(cors());

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('../database/models');

const categoriesRouter = require('./routes/categoriesRouter'); 
const checklistRouter = require('./routes/checklistRouter');
const inventoryRouter = require('./routes/inventoryRouter'); 
const userRouter = require('./routes/userRouter');

const isAuth = require('../utilities/auth/authMiddleware');

const passport = require('passport');
const issueToken = require('../utilities/auth/issueJWT');
require('../config/passport');


const sessionStore = new SequelizeStore({
    db: sequelize,
});

sessionStore.sync( { force: false } ); 

app.use(session({
    secret: process.env.SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
});



// categoriesRouter.use(isJWTAuth);
// checklistRouter.use(isJWTAuth);
// inventoryRouter.use(isJWTAuth);

app.use('/categories', categoriesRouter);
app.use('/checklist', checklistRouter);
app.use('/inventory', inventoryRouter);
app.use('/user', userRouter);


// app.post("/login", passport.authenticate("local", { failureRedirect: '/login-failure', successRedirect: 'login-success' }), (req, res) => { could use only failureRedirect
app.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure' }), (req, res) => {
    // const tokenObject = issueToken(req.user);
    const tokenObject = issueToken(req.user.dataValues.id);
    const expiry = new Date(tokenObject.expires * 1000);
    console.log('Post route token: ', tokenObject, 'Expiry: ', expiry);

    res.status(200);    
    res.cookie('auth_token', tokenObject.token, { expires: expiry, httpOnly: true, secure: true });
    res.redirect('/login-success');
});

app.get('/login', async (req, res) => {
    res.status(200).send(
        `<form action="/login" method="post">
            <label for="email">Email:</label><br>    
            <input type="email" id="email" name="email"></input><br>
            <label for="password">Password:</label><br>    
            <input type="password" id="password" name="password"></input><br>
            <input type="submit" value="Submit"></input>
        </form>`      
    
    );
});

app.get('/protected-route', isAuth, (req, res) => {
    res.send(`
            <h1>You made it to the route.</h1><br>
            <a href="/logout">Logout</a>`);
});


// app.get('/protected-route', passport.authenticate('jwt', { session: false }), (req, res) => {
//     res.send(`
//             <h1>You made it to the route.</h1><br>
//             <a href="/logout">Logout</a>`);
// });

app.get('/login-success', (req, res) => {
    res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
});

app.get('/login-failure', (req, res) => {
    res.send('You entered the wrong email or password.');
});




app.get('/', (req, res) => {
    res.status(200).send('<h1>Hello World</h1>');
});

app.get('/logout', (req, res) => {
    req.logout(()=>console.log('logged out'));
    res.redirect('/protected-route');
});



const server = app.listen(PORT, () => { 
    console.log(`Kitchen App is listening on port ${PORT}`);
});


module.exports = {
    app,
    server,
};