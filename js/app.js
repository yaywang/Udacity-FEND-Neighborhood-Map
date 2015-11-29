var Place = function(name, geocode, apiData) {
    this.name = name;
    this.geocode = geocodep;
    this.apiData = apiData;
};


// Add apiData.fourSquareId to ensure perfect match from the fourSquareSearch results. It's optional.

var places = [{
    name: 'the Hive',
    geocode: {
        lat: 13.732065,
        lng: 100.576528
    },
    apiData: {
        fourSquareId: '537c7102498e0dae7372c8dd'
    }
}, {
    name: 'Seenspace 13',
    geocode: {
        lat: 13.733611,
        lng: 100.581482
    },
    apiData: {
        fourSquareId: '4d849d2d5ad3a09392b6d2fd'
    }
}, {
    name: 'Villa Market Sukhumvit 49',
    geocode: {
        lat: 13.732610,
        lng: 100.576364
    },
    apiData: {
        fourSquareId: '4c00b1dbdf6c0f4730d98b22'
    }
}, {
    name: 'Villa Market J Avenue',
    geocode: {
        lat: 13.734618,
        lng: 100.582011
    },
    apiData: {
        fourSquareId: '4b8e745ff964a520792333e3'
    }
}, {
    name: 'UFM Fuji Super Branch 4',
    geocode: {
        lat: 13.731103,
        lng: 100.575931
    },
    apiData: {
        fourSquareId: '4ceb4f19f8653704af28c2c4'
    }
}, {
    name: 'Harvey',
    geocode: {
        lat: 13.732130,
        lng: 100.579386
    },
    apiData: {
        fourSquareId: '4ba0d246f964a520f47f37e3'
    }
}, {
    name: 'Bankara Ramen',
    geocode: {
        lat: 13.734810,
        lng: 100.572196
    },
    apiData: {
        fourSquareId: '4b701198f964a520cb052de3'
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



    /* Execute on each marker's click event, add in markers array
     * and bind to click on list elements
     */
    self.setInfoWindow = function(marker) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setAnimation(null);
        }
        marker.setAnimation(google.maps.Animation.BOUNCE);

        var infoWindowContent;
        infoWindowContent = '<h3>' + marker.title + '</h3>';
        infoWindowContent += ' ';
        infoWindowContent += '<h5>' + marker.fourSquareData.location.address + '</h5>';
        infoWindow.setContent(infoWindowContent);
        infoWindow.open(map, marker);
    };

    // Make API calls and store the results as the marker's property
    function addAyncData(marker) {
        // Foursquare API call.
        /* The response has some slight chance to contain unwanted locations
         * The success callback adds an extra filter to further lower the chance.
         */
        var clientId = 'MYPFF3DXZ5ZG1APSZINGIEYSGIJKNXYLJPLUW25MOMSLT2JZ';
        var clientSecret = '5S2U44PXCMR3ZE1GIDPRCRFUA53J42QQ5MTJYPPH3PXLLQKN';

        var url = 'https://api.foursquare.com/v2/venues/search?';
        url += 'll=' + marker.geocode.lat + ',' + marker.geocode.lng;
        url += '&query=' + marker.title;
        url += '&intent=match';
        url += '&client_id=' + clientId;
        url += '&client_secret=' + clientSecret;
        url += '&v=20151124';

        $.getJSON(url)
            .done(function(data) {
                marker.fourSquareData = data.response.venues[0];
                for (var i = 0; i < data.response.venues; i++) {
                    if (data.response.venues[i]._id === marker.apiData.fourSquareId) {
                        marker.fourSquareData = data.response.venues[i];
                    }
                }
            })
            .fail(function(error) {
                marker.fourSquareData = false;
            });
    }

    // The array of all markers
    var markers = [];
    for (var i = 0; i < places.length; i++) {
        var marker = new google.maps.Marker({
            position: places[i].geocode,
            title: places[i].name
        });

        marker.geocode = places[i].geocode;

        if (places[i].apiData) {
            marker.apiData = places[i].apiData;
        }

        marker.setMap(map);

        // TODO: why you have to return a function within the function?
        // TODO: why you cannot use this for the marker?
        // TODO: read more about IFFE and scoping, and then think again.
        marker.addListener('click', (function(markerCopy) {
            return function() {
                self.setInfoWindow(markerCopy);
            };
        })(marker));

        marker.addListener('mouseout', (function(markerCopy) {
            return function() {
                markerCopy.setAnimation(null);
            };
        })(marker));


        (function(marker) {
            addAyncData(marker);
        })(marker);

        markers.push(marker);
    }

    // Observables

    self.searchInput = ko.observable('');
    // Search for currentMarkers, also set them visible.
    self.currentMarkers = ko.computed(function() {
        // Close the infowindow as this obervable changes value
        infoWindow.close();

        var searchInput = self.searchInput().toLowerCase();
        var currentMarkers = [];
        for (var i = 0; i < markers.length; i++) {
            // Search in the test now
            if (markers[i].title.toLowerCase().indexOf(searchInput) >= 0) {
                currentMarkers.push(markers[i]);
                markers[i].setVisible(true);
            } else {
                markers[i].setVisible(false);
            }
        }
        return currentMarkers;
    });
};

function init() {
    ko.applyBindings(new ViewModel());
}

function googleError() {
    document.body.innerHTML = "<h2>Sorry Google Maps didn't load. Please check your internet connection.</h2>";
}