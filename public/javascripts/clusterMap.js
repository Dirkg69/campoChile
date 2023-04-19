
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'cluster-map',
	style: 'mapbox://styles/dirkg69/clggvqtkh006501lbmpta5azm',
	center: [-71.97773260204097, -39.27093708735973],
	zoom: 3,
});

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
	placeholder: 'Buscar Lugares en Chile',
	countries: 'cl', 
});

map.addControl(geocoder, 'top-right');

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');

map.addControl(
	new mapboxgl.GeolocateControl({
	positionOptions: { enableHighAccuracy: true },
	trackUserLocation: true,
	showUserHeading: true,
}), 'top-right'
);

map.on('load', () => {	
	
	map.loadImage('/images/tentIcon.png', (error,image) => {
		if (error) console.log(error);		 	
		map.addImage('tentIcon', image);

	map.addSource('campgrounds', {
		type: 'geojson',
		data: campgrounds,
		cluster: true,
		clusterMaxZoom: 14, // Max zoom to cluster points on
		clusterRadius: 25, // Radius of each cluster when clustering points (defaults to 50)
	});

	map.addLayer({
		id: 'clusters',
		type: 'circle',
		source: 'campgrounds',
		filter: ['has', 'point_count'],
		paint: {
			'circle-color': ['step', ['get', 'point_count'], '#00BCD4', 10, '#2196F3', 30, '#3F51B5'],
			'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 30, 25],
		},
	});

	map.addLayer({
		id: 'cluster-count',
		type: 'symbol',
		source: 'campgrounds',
		filter: ['has', 'point_count'],
		layout: {
			'text-field': '{point_count_abbreviated}',
			'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
			'text-size': 12,
		},
	});
	

	map.addLayer({
		id: 'unclustered-point',
		type: 'symbol',
		source: 'campgrounds',
		filter: ['!', ['has', 'point_count']],
		layout: {
			'icon-image': 'tentIcon',
			'icon-size': .025,
		  },
	   });		
	});

	map.on('click', 'clusters', function (e) {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['clusters'],
		});
		const clusterId = features[0].properties.cluster_id;
		map.getSource('campgrounds').getClusterExpansionZoom(clusterId, function (err, zoom) {
			if (err) return;

			map.easeTo({
				center: features[0].geometry.coordinates,
				zoom: zoom,
			});
		});
	});

	const popup = new mapboxgl.Popup({
		closeButton: true,
		closeOnClick: true
	});

	map.on('click', 'unclustered-point', function (e) {
		const { popUpMarkup } = e.features[0].properties;
		const coordinates = e.features[0].geometry.coordinates.slice();
	while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}
	popup.setLngLat(coordinates).setHTML(popUpMarkup).addTo(map);
	});

	map.on('mouseenter', 'clusters', function () {
		map.getCanvas().style.cursor = 'pointer';
	});

	map.on('mouseleave', 'clusters', function () {
		map.getCanvas().style.cursor = '';
	});

	map.on('mouseenter', 'unclustered-point', function (e) {
		const { popUpMarkup } = e.features[0].properties;
		const coordinates = e.features[0].geometry.coordinates.slice();
	while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}
    popup.setLngLat(coordinates).setHTML(popUpMarkup).addTo(map);
    });

	map.on('mouseleave', 'unclustered-point', function () {
		setTimeout(() => {
			popup.remove();
		  }, "20000")
	});
});
