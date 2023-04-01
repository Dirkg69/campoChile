
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/dirkg69/clfvgaq9j000x01n3a2sbhkr5', // style URL
	center: campground.geometry.coordinates,
	zoom: 10, // starting zoom
});

map.addControl(
	new MapboxGeocoder({
	accessToken: mapboxgl.accessToken,
	mapboxgl: mapboxgl
	})
	);

map.addControl(new mapboxgl.NavigationControl());

map.addControl(
	new mapboxgl.GeolocateControl({
	positionOptions: {
	enableHighAccuracy: true
	},
	// When active the map will receive updates to the device's location as it changes.
	trackUserLocation: true,
	// Draw an arrow next to the location dot to indicate which direction the device is heading.
	showUserHeading: true
	})
	);
	
new mapboxgl.Marker()
	.setLngLat(campground.geometry.coordinates)
	.setPopup(
		new mapboxgl.Popup({ offset: 25 })
			.setHTML(
			`<h3>${campground.title}</h3>`
		)
	)

	.addTo(map);
