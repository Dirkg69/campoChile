
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'map', 
	style: 'mapbox://styles/dirkg69/clggvqtkh006501lbmpta5azm', // style URL
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
	.setLngLat(park.geometry.coordinates)
	.setPopup(new mapboxgl.Popup({ offset: 25 })
	.setHTML(`<h6>${park.title}</h6>`)
	)
	.addTo(map);
