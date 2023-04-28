const mongoose = require('mongoose');
const ParkReview = require('./parkReview');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	filename: String,
});

ImageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const parkSchema = new Schema({
	title: String,
	images: [ImageSchema],
	geometry: {
     type: {
       type: String, 
       enum: ['Point'], 
       required: true
    },
     coordinates: {
       type: [Number],
       required: true
    }
  },
	price: String,
	description: String,
	location: String,
	premium: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	parkReviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'parkReview',
		},
	],
	
}, opts);

parkSchema.virtual('properties.popUpMarkup').get(function () {
	return `<strong><a href="/parks/${this._id}">${this.title}</a></strong>`
});

parkSchema.post('findOneAndDelete', async function (doc) {
	if (doc) {
		await ParkReview.deleteMany({
			_id: {
				$in: doc.parkReviews,
			},
		});
	}
});

module.exports = mongoose.model('park', parkSchema);
