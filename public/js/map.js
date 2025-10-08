mapboxgl.accessToken = mapToken; 

// Parse listing if needed
const listingData = typeof listingObj === "string" ? JSON.parse(listingObj) : listingObj;

const map = new mapboxgl.Map({
    container: 'map', // id of the div
    style: 'mapbox://styles/mapbox/streets-v12',
    center: listingData.geometry ? listingData.geometry.coordinates : [0, 0], // [lon, lat]
    zoom: 10
});

if(listingData.geometry) {
    new mapboxgl.Marker()
        .setLngLat(listingData.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<h6>${listingData.title}</h6>`)
        )
        .addTo(map);
}
