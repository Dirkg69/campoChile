const ParkReview = require('../models/parkReview');
const Park = require('../models/park');

module.exports.createParkReview = async (req, res) => {
	const park = await Park.findById(req.params.id);
	const parkReview = new ParkReview(req.body.parkReview);
    parkReview.author = req.user._id;
    park.parkReviews.push(parkReview);
	await parkReview.save();
	await park.save();
	req.flash('success', 'Crear nuevo comentario');
	res.redirect(`/parks/${park._id}`);
};

module.exports.deleteParkReview = async (req, res) => {
	const { id, parkReviewId } = req.params;
	await Park.findByIdAndUpdate(id, { $pull: { parkReviews: parkReviewId } });
	await ParkReview.findByIdAndDelete(parkReviewId);
	req.flash('success', 'Comentario eliminado con éxito');
	res.redirect(`/parks/${id}`);
};