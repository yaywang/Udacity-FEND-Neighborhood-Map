// TODO: check if a user likes a location on info window opening.
// TODO: link the places observable to dynamically added locations.
// TODO: when you click on a place, the upper-left menu tab becomes transparent.
// TODO: minimize the title on Google StreetView images.
// TODO: add scale to the map.
/* TODO: make a place object and define composeInfoWindowContent and addAsyncData
 */
// TODO: simplify shouter events. Try to do with just three.
// TODO: add whether to display streetview to the place object.

"use strict";

var iconList = {
    workingPlace: {
        url: 'icons/building-24@2x.png'
    },
    bar: {
        url: 'icons/bar-24@2x.png'
    },
    restaurant: {
        url: 'icons/restaurant-24@2x.png'
    },
    grocery: {
        url: 'icons/grocery-24@2x.png'
    }
};

var helpers = {};

// Compose info window contents html from a place object.
helpers.composeInfoWindowContent = function(place) {
    var infoWindowContent = '';

    infoWindowContent += '<div class="infoWindowContent">';
    // TODO: this class is not currently used.
    infoWindowContent += '<div class="infoWindowHeader">';
    // TODO: clarify that this executive order works.
    if (place.fourSquareData && place.fourSquareData.url) {
        infoWindowContent += '<a href="' + place.fourSquareData.url +'">';
        infoWindowContent +=  place.name + '</a>';
    } else {
        infoWindowContent +=  place.name;
    }
    infoWindowContent += '<span class="like-icon"></span>';
    infoWindowContent += '</div>';

    if (place.fourSquareData.error) {
        // Ensure that the Foursquare images and StreetView Images are in the same div.
        infoWindowContent += '<div class="venueImg">';
        infoWindowContent += '<p>' + place.fourSquareData.error + '</p>';
    } else {
        //infoWindowContent += '<div class="fourSquareContents">';
        // Popularity Indicator:
        var checkinsCount = place.fourSquareData.stats.checkinsCount;
        infoWindowContent += '<h5>FourSquare Checkins: ' + checkinsCount + '</h5>';

        infoWindowContent += ' ';
        infoWindowContent += '<h5>' + place.fourSquareData.location.address + '</h5>';

        // If the complete fourSquareData with photos is returned, display the best photo in Bootstrap carousel.
        // Attribution: the code on carousel is based on example from http://getbootstrap.com/javascript/#carousel
        infoWindowContent += '<div id="carousel" class="venueImg carousel slide" data-ride="carousel">';

        var photoNum = 6;
        function venuePhotoUrl(j) {
            var fourSquarePhoto = place.fourSquareData.photos.groups[0].items[j];
            var url = fourSquarePhoto.prefix + '500x300' + fourSquarePhoto.suffix;
            return url;
        }

        infoWindowContent += '<div class="carousel-inner" role="listbox">';
        infoWindowContent += '<div class="item active">';
        infoWindowContent += '<img src="' + venuePhotoUrl(0) + '"></div>';
        for (var j = 1; j < photoNum; j++) {
            infoWindowContent += '<div class="item"><img src="' + venuePhotoUrl(j) + '"></div>';
        }
        infoWindowContent += '</div>';
        infoWindowContent += '<!-- Controls -->';
        infoWindowContent += '<a class="left carousel-control" href="#carousel" ';
        infoWindowContent += 'role="button" data-slide="prev">';
        infoWindowContent += '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>';
        infoWindowContent += '<span class="sr-only">Previous</span></a>';
        infoWindowContent += '<a class="right carousel-control" href="#carousel" role="button" data-slide="next">';
        infoWindowContent += '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>';
        infoWindowContent += '<span class="sr-only">Next</span></a>';

        infoWindowContent += '</div>';

        //infoWindowContent += '</div>';
    }

    /**************  Google StreetView   ***************/
    var streetViewUrl = 'https://www.google.com/maps/embed/v1/streetview?';
    streetViewUrl += 'key=AIzaSyDOVXLsDsl7za9LKMI-TDWbWV1o_pa77VE';
    streetViewUrl += '&location=' + place.geocode.lat + ',' + place.geocode.lng;
    streetViewUrl += '&fov=90&heading=235&pitch=10';
    infoWindowContent += '<iframe width="450" height="250" frameborder="0" style="border:0"';
    infoWindowContent += 'src="' + streetViewUrl;
    infoWindowContent += '" allowfullscreen></iframe>';

    infoWindowContent += '<div class="attribution">';
    infoWindowContent += '<p>Attribution: Venue images are provided through Foursquare.</p></div>';
    infoWindowContent += '</div>';



    infoWindowContent += '</div>';
    return infoWindowContent;
};

// Make API calls and store the results as the place object's property.
// The callback takes a place as an argument
helpers.addAsyncData = function(place, callback) {
    /*************** Foursquare API call. ***************/
    var clientId = 'MYPFF3DXZ5ZG1APSZINGIEYSGIJKNXYLJPLUW25MOMSLT2JZ',
        clientSecret = '5S2U44PXCMR3ZE1GIDPRCRFUA53J42QQ5MTJYPPH3PXLLQKN',
        searchUrl;

    // TODO: suppose neither the fourSquareID nor the geocode is in the the model...
    /* TODO: Ensure the returned locations are what you really like.
     */
    searchUrl += 'https://api.foursquare.com/v2/venues/search?';
    searchUrl += 'll=' + place.geocode.lat + ',' + place.geocode.lng;
    searchUrl += '&query=' + place.name;
    searchUrl += '&limit=2';

    if (place.apiData.fourSquareId) {
        /* If the Id is available, get the complete venue reponse.
         * So always check if a specific data point is available before using.
         */
        searchUrl = 'https://api.foursquare.com/v2/venues/';
        searchUrl += place.apiData.fourSquareId + '?';
    }
    searchUrl += '&client_id=' + clientId;
    searchUrl += '&client_secret=' + clientSecret;
    searchUrl += '&v=20151124';

    $.getJSON(searchUrl)
        .done(function(data) {
            if (data.response.venue) {
                place.fourSquareData = data.response.venue;
            } else {
                for (var i = 0; i < data.response.venues; i++) {
                    if (data.response.venues[i]._id === place.apiData.fourSquareId) {
                        place.fourSquareData = data.response.venues[i];
                    }
                }
            }
        })
        .fail(function(error) {
            place.fourSquareData = {};
            // Error message is stored here.
            place.fourSquareData.error = "Foursquare API wasn't able to load.";
            console.log('Error message logged!');
        })
        .always(function() {
            callback(place);
        });
};

var shouter = new ko.subscribable();

var Map = function() {
    var self = this;

    // Instantiate Google Maps objects.
    var mapCenter = {
            lat: 13.7323776648197,
            lng: 100.57712881481939
    };

    var mapOptions = {
        center: mapCenter,
        zoom: 17,
        mapTypeControl: false,
        styles: paperMapStyle
    };

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    var infoWindow = new google.maps.InfoWindow({
        content: ''
    });

    $('#recenterMap').click(function() {
        map.setOptions(mapOptions);
    });

    window.setTimeout(function() {
        $('.recenterMap').css('display', 'inherit');
    }, 1000);

    var Marker = function(place) {
        var self = this;
        var processedIconList = {};
        for (var type in iconList) {
            // TODO: see how to use continue.
            if (!iconList.hasOwnProperty(type)) continue;
            processedIconList[type] = new google.maps.MarkerImage(iconList[type].url, null, null, null, new google.maps.Size(36, 36));
        }

        var marker = new google.maps.Marker({
            position: place.geocode,
            title: place.name,
            icon: processedIconList[place.type]
        });

        marker.addListener('click', self.onClick(place));

        self.googleMarker = marker;
        self.id = place.apiData.fourSquareId;
        /* Test the case if fourSquareData has been stored in the Firebase
         * and that it is not an error message.
         * This prepares for the functionality to push FourSquare API results
         * to Firebase.
         */
        if (place.fourSquareData && !place.fourSquareData.error) {
            self.infoWindowContent = helpers.composeInfoWindowContent(place);
        }
    };

    Marker.prototype.onClick = function(place) {
        return function() {
            shouter.notifySubscribers(place, 'newPlaceClickedViaMarker');
        };
    };

    Marker.prototype.bounce = function() {
        var marker = this.googleMarker;
        marker.setAnimation(google.maps.Animation.BOUNCE);
        // All animations last for 1000ms by default.
        window.setTimeout(function() {
            marker.setAnimation(null);
        }, 1000);
    };

    Marker.prototype.openInfoWindow = function() {
        var self = this;
        infoWindow.setContent(self.infoWindowContent);
        infoWindow.open(map, self.googleMarker);
        // Looks like a necessary circualar reference.
        function onInfowindowCloseClick() {
            // Handle the case where the user clicks to close while the marker is still bouncing.
            window.setTimeout(self.googleMarker.setAnimation(null), 150);
            shouter.notifySubscribers('', 'infoWindowClosed');
        }
        infoWindow.addListener('closeclick', onInfowindowCloseClick);
    };

    // Storage for all the markers being displayed on screen.
    var markersOnScreen = {};

    shouter.subscribe(function(newPlaces) {
        // Close the info window if the user forgets to.
        infoWindow.close();

        if (Object.keys(markersOnScreen).length === 0 && markersOnScreen.constructor === Object) {
            for (var marker in markersOnScreen) {
                marker.googleMarker.setVisible(false);
            }
        }

        var newMarkers = {};
        newPlaces.forEach(function(place) {
            var newMarker = new Marker(place);
            newMarker.googleMarker.setMap(map);
            newMarkers[place.apiData.fourSquareId] = newMarker;
        });

        markersOnScreen = newMarkers;
    }, self, 'newPlacesOnScreen');

    shouter.subscribe(function(newPlace) {
        for (var marker in markersOnScreen) {
            markersOnScreen[marker].googleMarker.setAnimation(null);
        }

        // TODO: find out about mutability problems.
        var clickedMarker = markersOnScreen[newPlace.apiData.fourSquareId];
        clickedMarker.infoWindowContent = helpers.composeInfoWindowContent(newPlace);
        clickedMarker.openInfoWindow();
        clickedMarker.bounce();
    }, self, 'newPlaceClicked');
};

// The VM currently for everything that doesn't use Google Maps API.
var AppVM = function() {
    var self = this;
    // Access DOM
    var buttons = $('.menu-toggle-button, #sign-in-button');
    // Defined in ui.js: var menuCheckBoxes = $("input[name=menu]");

    var placesRef = firebase.database().ref('places/');
    // Dynamically retrieve places from the Firebase database.
    var places = ko.observableArray([]);

    placesRef.on('value', function(snapshot) {
        places(snapshot.val());
    }, function(error) {
        console.log(error);
        alert('Firebase places data could not be fetched.');
    });

    self.searchQuery = ko.observable('');

    self.placesOnScreen = ko.computed(function() {
        return places().filter(function(place) {
            return place.name.toLowerCase().indexOf(self.searchQuery()) >= 0;
        });
    });

    self.placesOnScreen.subscribe(function(newPlaces) {
        shouter.notifySubscribers(newPlaces, 'newPlacesOnScreen');
    });

    // The place that's just been clicked.
    self.clickedPlace = ko.observable('');

    self.clickedPlace.subscribe(function(newPlace) {
        // Notify the place object with async data added once this observable is updated.
        function notifyNewPlace(newPlace) {
            shouter.notifySubscribers(newPlace, 'newPlaceClicked');
        }
        helpers.addAsyncData(newPlace, notifyNewPlace);
    });

    self.onPlaceClicked = function(place) {
        self.clickedPlace(place);
        window.setTimeout(function() {
            // Hide the menu.
            menuCheckBoxes.prop('checked', false);
            buttons.css('opacity', 0.7);
        }, 200);
    };

    shouter.subscribe(function(newPlace) {
        self.onPlaceClicked(newPlace);
    }, self, 'newPlaceClickedViaMarker');

    shouter.subscribe(function() {
        window.setTimeout(function() {
            buttons.css('opacity', 'inherit');
        }, 100);
    }, self, 'infoWindowClosed');
};

function init() {
    new Map();
    ko.applyBindings(new AppVM());
}

function googleError() {
    document.body.innerHTML = "<h2>Sorry Google Maps didn't load. Please check your internet connection.</h2>";
}