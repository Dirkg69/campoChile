const Park = require('../models/park');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');


module.exports.index = async (_req, res) => {
	const parks = await Park.find({});
	res.render('parks/parkIndex', {parks});
};

module.exports.renderNewForm = (_req, res) => {
	res.render('parks/newPark');
};

module.exports.createPark = async (req, res) => {
	  const geoData = await geocoder.forwardGeocode({
			query: req.body.park.location,
			limit: 1
	   }).send();
	   	const park = new Park(req.body.park);
	    park.geometry = geoData.body.features[0].geometry;
		park.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
		park.author = req.user._id;
		await park.save();
		req.flash('success', '¡Hizo con éxito un nuevo parque!');
		res.redirect(`/parks/${park._id}`);
};



module.exports.showPark = async (req, res) => {
	const park = await Park.findById(req.params.id).populate({
			path: 'parkReviews',
			populate: {
				path: 'author',
			},
		})
		.populate('author');
	if (!park) {
		req.flash('error', '¡No puedo encontrar ese parque!');
		return res.redirect('/parks');
	}
	res.render('parks/showPark', { park });
};

module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const park = await Park.findById(id);
	if (!park) {
		req.flash('error', '¡No puedo encontrar ese parque!');
		return res.redirect('/parks');
	}
	res.render('parks/editPark', { park });
};

module.exports.updatePark = async (req, res) => {
	const geoData = await geocoder.forwardGeocode({
			query: req.body.park.location,
			limit: 1,
		})
		.send();
	const { id } = req.params;
	const park = await Park.findByIdAndUpdate(id, { ...req.body.park });
	const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	park.images.push(...imgs);
	park.geometry = geoData.body.features[0].geometry;
	await park.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await park.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
	}
	req.flash('success', '¡Parque actualizado con éxito!');
	res.redirect(`/parks/${park._id}`);
};

module.exports.deletePark = async (req, res) => {
	const { id } = req.params;
	await Park.findByIdAndDelete(id);
	req.flash('success', 'Parque eliminado con éxito');
	res.redirect('/parks');
};
