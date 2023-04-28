const express = require('express');
const router = express.Router();
const parks = require('../controllers/parks');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isParkAuthor, validatePark } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
	.get(catchAsync(parks.index))
	.post(
		isLoggedIn,
		upload.array('image'),
		validatePark,
		catchAsync(parks.createPark),
	);

router.get('/newPark', isLoggedIn, parks.renderNewForm);

router.route('/:id')
		.get(catchAsync(parks.showPark))
		.put(
			isLoggedIn,
			isParkAuthor,
			upload.array('image'),
			validatePark,
			catchAsync(parks.updatePark),
		)
		.delete(isLoggedIn, isParkAuthor, catchAsync(parks.deletePark));

router.get('/:id/editPark', isLoggedIn, isParkAuthor, catchAsync(parks.renderEditForm));

module.exports = router;