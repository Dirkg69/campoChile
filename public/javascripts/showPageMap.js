
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'map', 
	style: 'mapbox://styles/dirkg69/clfvgaq9j000x01n3a2sbhkr5', // style URL
	center: campground.geometry.coordinates,
	zoom: 10, 
});

map.addControl(
	new MapboxGeocoder({
	accessToken: mapboxgl.accessToken,
	mapboxgl: mapboxgl,
	placeholder: 'Buscar Lugares en Chile',
	countries: 'cl'
}));

map.addControl(new mapboxgl.NavigationControl());

map.addControl(
	new mapboxgl.GeolocateControl({
	positionOptions: { enableHighAccuracy: true	},
	trackUserLocation: true,
	showUserHeading: true
}));
	
new mapboxgl.Marker()
	.setLngLat(campground.geometry.coordinates)
	.setPopup(
		new mapboxgl.Popup({ offset: 25 })
			.setHTML(
			`<h3>${campground.title}</h3>`
		)
	)

	.addTo(map);
