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

var ViewModel = function() {
    var self = this;
    self.searchInput = ko.observable('');

    self.currentPlaces = ko.computed(function() {
        var searchInput = self.searchInput().toLowerCase();
        var currentPlaces = [];
        for (var i = 0; i < places.length; i++) {
            // the search function is in the test here
            if (places[i].name.toLowerCase().indexOf(searchInput) >= 0) {
                currentPlaces.push(places[i]);
            }
        }
        return currentPlaces;
    });


    // Executed on each marker's click event
    self.setInfoWindow = function(marker) {
        infoWindow.setContent(marker.title);
        infoWindow.open(map, marker);
    };

    self.markers = ko.computed(function() {
        var places = self.currentPlaces();
        var markers = [];
        for (var i = 0; i < places.length; i++) {
            var marker = new google.maps.Marker({
                position: places[i].geocode,
                title: places[i].name
            });
            // TODO: why in here you have to return a function?
            // TODO: why you cannot use this for the marker?
            // TODO: read more about IFFE and scoping, and then think again.
            marker.addListener('click', (function(markerCopy) {
                return function() {self.setInfoWindow(markerCopy);};
            })(marker));
            markers.push(marker);
        }
        return markers;
    });

    self.oldMarkers = ko.observableArray([]);

    // Access oldMarkers array, and assign the array to oldMarkers
    self.markers.subscribe(function(oldMarkers) {
        if (oldMarkers) self.oldMarkers(oldMarkers);
    }, null, 'beforeChange');

};

ko.applyBindings(new ViewModel());