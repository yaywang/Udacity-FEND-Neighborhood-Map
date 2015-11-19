var places = [{
    name: 'the Hive',
    geocode: {
        lat: 13.732065,
        lng: 100.576528
    }
}, {
    name: 'Seenspace',
    geocode: {
        lat: 13.733611,
        lng: 100.581482
    }
}, {
    name: 'Villa Market Sukhumvit 49',
    geocode: {
        lat: 13.732610,
        lng: 100.576364
    }
}, {
    name: 'Villa Market J Avenue',
    geocode: {
        lat: 13.734618,
        lng: 100.582011
    }
}, {
    name: 'UFM Fuji Super Branch 4',
    geocode: {
        lat: 13.731103,
        lng: 100.575931
    }
}, {
    name: 'Harvey',
    geocode: {
        lat: 13.732130,
        lng: 100.579386
    }
}, {
    name: 'Bankara Ramen',
    geocode: {
        lat: 13.734810,
        lng: 100.572196
    }
}];

var ViewModel = function() {
    var self = this;

    // Instantiate Google Maps objects

    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 13.732065,
            lng: 100.576528
        },
        zoom: 15
    });

    var infoWindow = new google.maps.InfoWindow({
        content: ''
    });

    // Executed on each marker's click event
    function setInfoWindow(marker) {
        infoWindow.setContent(marker.title);
        infoWindow.open(map, marker);
    }

    // The array of all markers
    var markers = [];
    for (var i = 0; i < places.length; i++) {
        var marker = new google.maps.Marker({
            position: places[i].geocode,
            title: places[i].name
        });

        marker.setMap(map)
        // TODO: why you have to return a function within the function?
        // TODO: why you cannot use this for the marker?
        // TODO: read more about IFFE and scoping, and then think again.
        marker.addListener('click', (function(markerCopy) {
            return function() {
                setInfoWindow(markerCopy);
            };
        })(marker));
        markers.push(marker);
    }


    // Observables

    self.searchInput = ko.observable('');
    // For both toggling marker visibiliy and current names in navigation, a convenient hack
    self.currentMarkers = ko.computed(function() {
        var searchInput = self.searchInput().toLowerCase();
        var currentMarkers = [];
        for (var i = 0; i < markers.length; i++) {
            // The search functionality is in the test
            if (markers[i].title.toLowerCase().indexOf(searchInput) >= 0) {
                currentMarkers.push(markers[i]);

                //  Set visibility as a side effect.
                markers[i].setVisible(true);
            } else {
                markers[i].setVisible(false);
            }
        }
        return currentMarkers;
    });
};

// callback on Google Maps loading success
function init() {
    ko.applyBindings(new ViewModel());
}

// callback on Google Maps loading error
function googleError() {
    document.body.innerHTML = "<h2>Sorry Google Maps didn't load. Please check your internet connection.</h2>";
}