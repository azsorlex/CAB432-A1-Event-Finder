function getEvents(subAddress) {
  fetch(`/eventful/events/${subAddress}`)
    .then((res) => res.json())
    .then((events) => {
      renderEvents(events);
      // Re-enable the page
      mapcover.style.display = "none";
    })
    .catch((error) => console.log(error));

  // Disable the page by having another div show up on top of it
  const mapcover = document.getElementById("mapcover");
  mapcover.style.display = "flex";
}

function renderEvents(events) {
  const eventsList = document.getElementById('events');

  // Remove all prior event listings
  while (eventsList.hasChildNodes()) {
    eventsList.removeChild(eventsList.lastChild);
  }
  // Clear previous markers
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];

  events.forEach(event => {
    // Add a marker for the event to the map
    const marker = new google.maps.Marker({
      map,
      position: { lat: parseFloat(event.latitude), lng: parseFloat(event.longitude) },
      title: event.title
    });
    markers.push(marker);

    // Create the div and add all of the attributes to it
    const eventListing = document.createElement('div');
    eventListing.setAttribute('class', 'event');

    try {
      eventListing.innerHTML =
        `<div><h3>${event.title}</h3>` +
        `<h6>Categories: ${neatCategories(event.categories.category, 'name')}</h6></div>`;

      // Parse the links list into HTML
      let links = '';
      if (event.links !== null) {
        let addedLinks = [];
        event.links.link.forEach(link => {
          if (!addedLinks.includes(link.description)) {
            links += `<a href=${link.url} target="_blank">${link.description}</a><br>`;
            addedLinks.push(link.description);
          }
        });
      }
      links += `<a href=${event.url} target="_blank">Eventful listing</a><br>`;

      // Create an Info Window that appears when the event or marker is clicked on
      const stop_time = event.stop_time !== null ? `<p>End: ${event.stop_time}</p>` : "";
      const infowindow = new google.maps.InfoWindow({
        content:
          `<h2>${event.title}</h2>` +
          `<p>Start: ${event.start_time}</p>` +
          `${stop_time}` +
          `<p>${event.description !== null ? event.description : "There is no description for this event."}</p>` +
          `<p>Price: ${event.price !== null ? event.price : "No pricing information available."}</p><br>` +
          links +
          `<a href="#" onclick="javascript:getEvents('${marker.getPosition()}/${neatCategories(event.categories.category, 'id')}/${event.title}')">Similar events in the area</a>`
      });

      function openInfoWindow() {
        try {
          currentInfoWindow.close();
        } catch (e) { }
        currentInfoWindow = infowindow;
        infowindow.open(map, marker);
      }
      marker.addListener('click', openInfoWindow);
      eventListing.addEventListener('click', openInfoWindow);

    } catch (e) {
      eventListing.innerHTML = '<h3>No events found in this area.</h3>'
    }

    // Add the event to the list
    eventsList.appendChild(eventListing);
  });
}

// Converts an event's categories list into either a human-readable or API-readable format
function neatCategories(categories, property) {
  let categoryNames = [];
  categories.forEach(category => {
    categoryNames.push(category[property]);
  });
  categoryNames = categoryNames.join();
  return (property === 'name') ? categoryNames.replace(/,/g, ', ') : categoryNames;
}