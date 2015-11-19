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

    // Define how markers interact with the DOM elements
    // TODO: those two seems to be on the borderline of being unnecessary
    ko.bindingHandlers.addMarkers = {
        update: function(element, valueAccessor) {
            var markers = ko.unwrap(valueAccessor());
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(map);
            }
        }
    };

    ko.bindingHandlers.deleteMarkers = {
        update: function(element, valueAccessor) {
            var markers = ko.unwrap(valueAccessor());
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
        }
    };

    self.searchInput = ko.observable('');

    self.currentPlaces = ko.computed(function() {
        var searchInput = self.searchInput().toLowerCase();
        var currentPlaces = [];
        for (var i = 0; i < places.length; i++) {
            // the search functionality is in the test
            if (places[i].name.toLowerCase().indexOf(searchInput) >= 0) {
                currentPlaces.push(places[i]);
            }
        }
        return currentPlaces;
    });

    // Executed on each marker's click event
    function setInfoWindow(marker) {
        infoWindow.setContent(marker.title);
        infoWindow.open(map, marker);
    }

    self.markers = ko.computed(function() {
        var places = self.currentPlaces();
        var markers = [];
        for (var i = 0; i < places.length; i++) {
            var marker = new google.maps.Marker({
                position: places[i].geocode,
                title: places[i].name
            });
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
        return markers;
    });

    self.oldMarkers = ko.observableArray([]);

    // Access markers array before any change, and assign the array to oldMarkers
    self.markers.subscribe(function(oldMarkers) {
        if (oldMarkers) self.oldMarkers(oldMarkers);
    }, null, 'beforeChange');
};

// callback on Google Maps loading success
function init() {
    ko.applyBindings(new ViewModel());
}

// callback on Google Maps loading error
function googleError() {
    document.body.innerHTML = "<h2>Sorry Google Maps didn't load. Please check your internet connection.</h2>";
}