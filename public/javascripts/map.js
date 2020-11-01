let map;
let currentInfoWindow;
let markers = [];

function initMap() {
  const myLatlng = { lat: 0, lng: 0 };

  map = new google.maps.Map(
    document.getElementById('map'), { zoom: 3, center: myLatlng });

  // Create the initial InfoWindow and then close it after 10 seconds.
  const infoWindow = new google.maps.InfoWindow(
    { content: 'Click this map to get nearby events!', position: myLatlng });
  infoWindow.open(map);

  // Configure the click listener.
  map.addListener('click', function (mapsMouseEvent) {
    infoWindow.close();
    // Retrieve events based on the location and render them to the page.
    getEvents(mapsMouseEvent.latLng);
  });
}