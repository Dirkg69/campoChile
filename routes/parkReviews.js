const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateParkReview, isLoggedIn, isParkReviewAuthor } = require('../middleware');
const parkReviews = require('../controllers/parkReviews');
const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, validateParkReview, catchAsync(parkReviews.createParkReview));

router.delete('/:parkReviewId', isLoggedIn, isParkReviewAuthor, catchAsync(parkReviews.deleteParkReview));

module.exports = router;