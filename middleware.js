const { campgroundSchema, reviewSchema, parkSchema, parkReviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
const Park = require('./models/park');
const ParkReview = require('./models/parkReview');

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash('error', '¡Debes iniciar sesión primero!');
		return res.redirect('/login');
	}
	next();
};

module.exports.validateCampground = (req, _res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	console.log(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

module.exports.validatePark = (req, _res, next) => {
	const { error } = parkSchema.validate(req.body);
	console.log(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground.author.equals(req.user._id)) {
		req.flash('error', '¡No tienes permiso para hacer eso!');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

module.exports.isParkAuthor = async (req, res, next) => {
	const { id } = req.params;
	const park = await Park.findById(id);
	if (!park.author.equals(req.user._id)) {
		req.flash('error', '¡No tienes permiso para hacer eso!');
		return res.redirect(`/parks/${id}`);
	}
	next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		req.flash('error', '¡No tienes permiso para hacer eso!');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

module.exports.isParkReviewAuthor = async (req, res, next) => {
	const { id, parkReviewId } = req.params;
	const parkReview = await ParkReview.findById(parkReviewId);
	if (!parkReview.author.equals(req.user._id)) {
		req.flash('error', '¡No tienes permiso para hacer eso!');
		return res.redirect(`/parks/${id}`);
	}
	next();
};

module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	const { id } = req.params;
	if (error) {
		req.flash('error', '¡Seleccione una calificación de estrellas por favor!');
		return res.redirect(`/campgrounds/${id}`);
		// const msg = error.details.map((el) => el.message).join(',');
		// throw new ExpressError(400);
	} else {
		next();
	}
};

module.exports.validateParkReview = (req, res, next) => {
	const { error } = parkReviewSchema.validate(req.body);
	const { id } = req.params;
	if (error) {
		req.flash('error', '¡Seleccione una calificación de estrellas por favor!');
		return res.redirect(`/parks/${id}`);
		
	} else {
		next();
	}
};

module.exports.checkReturnTo = (req, res, next) => {
	if (req.session.returnTo) {
		res.locals.returnTo=req.session.returnTo;
}
	next();
};

