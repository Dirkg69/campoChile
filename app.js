
require('dotenv').config();

const morgan = require('morgan');
const express = require('express');
const smws = require('smws');
const cookieParser = require('cookie-parser'),
const bodyParser = require('body-parser'),
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const parkReviewRoutes = require('./routes/parkReviews');
const parkRoutes = require('./routes/parks');
const dbUrl = process.env.DB_URL;
const MongoDBStore = require('connect-mongo');


mongoose.connect(dbUrl)

const db = mongoose.connection;
const app = express();
db.once('open', () => {console.log('Database connected');});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

smws.config({
    languages: ['en','es','fr','de'],
    defaultLang: 'es',
	origin: 'https://www.camp-o-chile.cl'
});

const secret = process.env.SECRET;
const store = MongoDBStore.create({
	mongoUrl: dbUrl,
	secret,
	touchAfter: 24 * 60 * 60,
});
store.on('error', function (e) {
	console.log('Session Store Error', e);
});
const sessionConfig = {
	store,
	name: 'session',
	secret,
	resave: true,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		secure: 'auto',
		maxAge: 3600000,
	},
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());
app.use(helmet.crossOriginEmbedderPolicy({ policy: "credentialless" }));
const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://api.tiles.mapbox.com/',
	'https://api.mapbox.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net',
	'https://pagead2.googlesyndication.com/',
	'https://www.googletagmanager.com/',
    'https://www.google-analytics.com/',
	'https://partner.googleadservices.com/',
	'https://adservice.google.cl/',
	'https://adservice.google.com/',
	'https://tpc.googlesyndication.com/',
	'https://googleads.g.doubleclick.net',
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://api.mapbox.com/',
	'https://api.tiles.mapbox.com/',
	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/',
];
const connectSrcUrls = [
	'https://api.mapbox.com/',
	'https://a.tiles.mapbox.com/',
	'https://b.tiles.mapbox.com/',
	'https://events.mapbox.com/',
	'https://pagead2.googlesyndication.com/',
	'https://csi.gstatic.com/',
	'https://googleads.g.doubleclick.net',
];
const fontSrcUrls = [
	'https://fonts.googleapis.com/',
	'https://fonts.gstatic.com/',
];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ['https://googleads.g.doubleclick.net/','https://www.google.com/','https://tpc.googlesyndication.com/'],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/dq47zodnm/',
				'https://images.unsplash.com/',
				'https://pagead2.googlesyndication.com/',
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	}),
);

app.use(passport.initialize());
app.use(passport.session());
passport.use (new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/parks', parkRoutes);
app.use('/parks/:id/parkreviews', parkReviewRoutes);


app.post('/:lang/language', (req,res)=>{
    smws.switcher(req,res);
});

app.get('/', function (req, res) {
    smws.run(req, res, {
        page: 'home'
    });
});

app.get('/:lang', function (req, res) {
    smws.run(req, res, {
        page: 'home'
    });
});

app.get(smws.split('/:lang/:category'), function (req, res) {
    smws.run(req,res,{
        page: 'category',
        useParams: ['lang', 'category']
    });
});

app.get('/', (_req, res) => {
	res.render('home');
});

app.get('/about', (_req, res) => {
	res.render('about');
});

app.all('*', (_req, _res, next) => {
	next(new ExpressError('¡Página no encontrada!', 404));
});

app.use((err, _req, res, _next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = '¡Oh no, algo salió mal!';
	res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3010;

app.listen(port, () => {
	console.log(`Serving on port ${port}`);
});
