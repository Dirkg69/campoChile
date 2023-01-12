const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:28015/yelp-camp', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;

		const camp = new Campground({
			author: '63b372b4a925f694e5abfd3b',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			description: 'nothing here for now but that will change soon',
			price,
			geometry: {
				type: 'Point',
				coordinates: [-113.1331, 47.0202],
			},
			images: [
				{
					url: 'https://res.cloudinary.com/dq47zodnm/image/upload/v1672974430/YelpCamp/koi4z60xxrjttqjxvnoa.jpg',
					filename: 'YelpCamp/koi4z60xxrjttqjxvnoa',
				},
			],
		});

		await camp.save();
	}
};
seedDB().then(() => {
	mongoose.connection.close();
});
