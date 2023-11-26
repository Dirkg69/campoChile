/** @format */

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'parkscluster-map',
	style: 'mapbox://styles/dirkg69/clggvqtkh006501lbmpta5azm?optimize=true',
	center: [-71.97773260204097, -39.27093708735973],
	zoom: 2,
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
	}),
	'top-right',
);

map.on('load', () => {
	map.loadImage('/images/parkIcon.png', (error, image) => {
		if (error) console.log(error);
		map.addImage('parkIcon', image);

		map.addSource('parks', {
			type: 'geojson',
			data: parks,
			cluster: true,
			clusterMaxZoom: 14, // Max zoom to cluster points on
			clusterRadius: 25, // Radius of each cluster when clustering points (defaults to 50)
		});

		map.addLayer({
			id: 'clusters',
			type: 'circle',
			source: 'parks',
			filter: ['has', 'point_count'],
			paint: {
				'circle-color': [
					'step',
					['get', 'point_count'],
					'#077924',
					10,
					'#15a949',
					30,
					'#74da4f',
				],
				'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 30, 25],
			},
		});

		map.addLayer({
			id: 'cluster-count',
			type: 'symbol',
			source: 'parks',
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
			source: 'parks',
			filter: ['!', ['has', 'point_count']],
			layout: {
				'icon-image': 'parkIcon',
				'icon-size': 0.075,
			},
		});
	});

	map.on('click', 'clusters', function (e) {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['clusters'],
		});
		const clusterId = features[0].properties.cluster_id;
		map
			.getSource('parks')
			.getClusterExpansionZoom(clusterId, function (err, zoom) {
				if (err) return;

				map.easeTo({
					center: features[0].geometry.coordinates,
					zoom: zoom,
				});
			});
	});

	const popup = new mapboxgl.Popup({
		closeButton: true,
		closeOnClick: true,
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
		}, '20000');
	});
});
