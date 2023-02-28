const User = require('../models/user');

module.exports.renderRegister = (_req, res) => {
	res.render('users/register');
};

module.exports.register = async (req, res, next) => {
	try {
		const { email, username, password } = req.body;
		const user = new User({ email, username });
		const registeredUser = await User.register(user, password);
		req.login(registeredUser, (err) => {
			if (err) return next(err);
			req.flash('success', 'Bienvenido a Campo-o-Chile');
			res.redirect('/campgrounds');
		});
	} catch (e) {
		req.flash('error', e.message);
		res.redirect('register');
	}
};

module.exports.renderLogin = (req, res) => {
	if (req.query.returnTo) {
        req.session.returnTo = req.query.returnTo;
	}
	res.render('users/login');
};

module.exports.login = (req, res) => {
	req.flash('success', 'Bienvenido a Campo-o-Chile');
	const redirectUrl = res.locals.returnTo || '/campgrounds';
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'Adiós');
	res.redirect('/campgrounds');
	
};
