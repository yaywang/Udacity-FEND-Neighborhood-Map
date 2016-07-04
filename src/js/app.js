// TODO: currentLoc variable for the one opened on info window.
// TODO: checking if a user likes a location on info window opening.
// TODO: link the places observable to dynamically added locations.
// TODO: when you click on a place, the upper-right menu tab becomes transparent.
// TODO: minimize the title on Google StreetView images.
// TODO: prevent Google Maps from displaying clickable markers on its own.
// TODO: add scale to the map
// TODO: after clicking on a list item, the list should close
// TODO: there must be some markers even before sign-in.
// TODO: the ViewModel should actually take in places as an argument.
// TODO: rename icon-heart to like-icon.

"use strict"

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
        //origin: new google.maps.Point(0, 0),
    }
};

function composeInfoWindowContent(place) {
    var infoWindowContent;
    infoWindowContent = '<div class="infoWindowContent">';

    infoWindowContent += '<div class="infoWindowHeader">';
    if (place.fourSquareData.url) {
        infoWindowContent += '<a href="' + place.fourSquareData.url +'">';
        infoWindowContent +=  place.name + '</a>';
    } else {
        infoWindowContent +=  place.name;
    }
    infoWindowContent += '<span class="icon-heart"></span>';
    infoWindowContent += '</div>';

    // Popularity Indicator:
    var checkinsCount = place.fourSquareData.stats.checkinsCount;
    infoWindowContent += '<h5>FourSquare Checkins: ' + checkinsCount + '</h5>';

    infoWindowContent += ' ';
    infoWindowContent += '<h5>' + place.fourSquareData.location.address + '</h5>';

    /*************  Google StreetView   **************/
    var streetViewUrl = 'https://www.google.com/maps/embed/v1/streetview?';
    streetViewUrl += 'key=AIzaSyDOVXLsDsl7za9LKMI-TDWbWV1o_pa77VE';
    streetViewUrl += '&location=' + place.geocode.lat + ',' + place.geocode.lng;
    streetViewUrl += '&fov=90&heading=235&pitch=10';
    infoWindowContent += '<iframe width="150" height="150" frameborder="0" style="border:0"';
    infoWindowContent += 'src="' + streetViewUrl;
    infoWindowContent += '" allowfullscreen></iframe>';

    // if the complete fourSquareData, the version with photos, is returned, display the best photo
    infoWindowContent += '<div class="venueImg">';
    for (var i = 0; i < 6; i+=2) {
        var photoEntry1 = place.fourSquareData.photos.groups[0].items[i];
        var photoEntry2 = place.fourSquareData.photos.groups[0].items[i + 1];
        if (photoEntry1 && photoEntry2) {
            // make sure there're always two pictures on a single row.
            [photoEntry1, photoEntry2].forEach(function(photoEntry) {
                var photoUrl = photoEntry.prefix + '100x100' + photoEntry.suffix;
                infoWindowContent += '<img src=' + photoUrl + '>';
            });
        }
    }
    infoWindowContent += '</div>';

    infoWindowContent += '</div>';
    return infoWindowContent;
}

// Make API calls and store the results as the place's property
// The callback takes a place as an argument
function addAsyncData(place, marker, callback) {
    /****************** Foursquare API call. ******************/
    var clientId = 'MYPFF3DXZ5ZG1APSZINGIEYSGIJKNXYLJPLUW25MOMSLT2JZ';
    var clientSecret = '5S2U44PXCMR3ZE1GIDPRCRFUA53J42QQ5MTJYPPH3PXLLQKN';

    // TODO: suppose neither the fourSquareID nor the geocode is in the the model...
    /* TODO: Ensure the returned locations are what you really like
     * TODO: make the process to decide the icons more efficient
     */
    var searchUrl = 'https://api.foursquare.com/v2/venues/search?';
    searchUrl += 'll=' + place.geocode.lat + ',' + place.geocode.lng;
    searchUrl += '&query=' + place.name;
    searchUrl += '&limit=2';
    searchUrl += '&client_id=' + clientId;
    searchUrl += '&client_secret=' + clientSecret;
    searchUrl += '&v=20151124';

    /* If the Id is available, get the complete venue reponse.
     * Always check if a specific data point is available before using
     */
    if (place.apiData.fourSquareId) {
        searchUrl = 'https://api.foursquare.com/v2/venues/';
        searchUrl += place.apiData.fourSquareId + '?';
        searchUrl += '&client_id=' + clientId;
        searchUrl += '&client_secret=' + clientSecret;
        searchUrl += '&v=20151124';
    }

    $.getJSON(searchUrl)
        .done(function(data) {
            console.log(data);
            place.fourSquareData = data.response.venue[0] || data.response.venue;
            for (var i = 0; i < data.response.venues; i++) {
                if (data.response.venues[i]._id === place.apiData.fourSquareId) {
                    place.fourSquareData = data.response.venues[i];
                }
            }
            callback(place, marker);
        })
        .fail(function(error) {
            place.fourSquareData = false;
        });
}

var ViewModel = function() {
    var self = this;

    // Instantiate Google Maps objects
    var mapCenter = {
            lat: 13.7323776648197,
            lng: 100.57712881481939
    };

    var map = new google.maps.Map(document.getElementById('map'), {
        center: mapCenter,
        zoom: 17,
        mapTypeControl: false,
        styles: paleDownMapTypeArray
    });

    var infoWindow = new google.maps.InfoWindow({
        content: ''
    });

    function bounceMarker(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1000);
    }

    self.setoffInfoWindow = function(place, marker) {
            console.log('Set off info window.');

            (function (placeCopy, markerCopy) {
                    return function() {
                    var infoWindowContent = composeInfoWindowContent(placeCopy);
                    infoWindow.setContent(infoWindowContent);
                    infoWindow.open(map, markerCopy);

                    // End bouncing if you close the infoWindow before the default effect period comes to an end
                    // TODO: why you have to return a function within the function?
                    // TODO: why you cannot use this for the marker?
                    // TODO: read more about IFFE and scoping, and then think again.
                    infoWindow.addListener('closeclick', (function(markerCopyCopy) {
                        return function() {
                            markerCopyCopy.setAnimation(null);
                        }
                    })(markerCopy));
                }
            })(place, marker);
    };

    // map.addListener('center_changed', function() {
    //     console.log(map.getCenter().lat(), map.getCenter().lng());
    // })

    // TODO: also reset the zoom level
    $('#recenterMap').click(function() {
        map.setCenter(new google.maps.LatLng(mapCenter.lat, mapCenter.lng));
    });

    // Firebase references for the entire Knockout app
    var placesRef = firebase.database().ref('places/');
    var likedPlacesRef = ko.computed(function() {
        var uid = currentUserId();
        return firebase.database().ref('users/' + uid + '/likedPlaces')
    });

    // Retrieve places from the Firebase database
    var places = ko.observableArray([]);
    placesRef.on('value', function(snapshot) {
        places(snapshot.val());
    });

    var likedPlaces = ko.observableArray([]);
    likedPlacesRef().once('value', function(snapshot) {
        likedPlaces(snapshot.val());
    });

    function like(place) {
        var heartIcon = $('.icon-heart');
        if (heartIcon.css('color') == '606060') {
            // TODO: Cancel like status
        } else {
            console.log('Icon-heart color: ' + heartIcon.css('color'));
            console.log('liked');
            heartIcon.css('color', '606060');
            // TODO: restructure markers/places computed arrays, so the places could be easily matched
            likedPlacesRef().push(marker.getTitle());
        }
    }

    function setoffMarker(place, iconList) {
        // Icons for different types of markers
        var iconList = iconList;

        // Ensure all the icons have the right sizes
        var processedIconList = {};
        for (var type in iconList) {
            // TODO: see how to use continue
            if (!iconList.hasOwnProperty(type)) continue;
            processedIconList[type] = new google.maps.MarkerImage(iconList[type].url, null, null, null, new google.maps.Size(36, 36));
        }

        var marker = new google.maps.Marker({
            position: place.geocode,
            title: place.name,
            icon: processedIconList[place.type]
        });

        // marker.addListener('click', function(markerCopy) {
        //     return function() {
        //         // setOff Info Window
        //         self.setInfoWindow(markerCopy)
        // }}(marker));

        marker.setMap(map);

        return marker;
    }

    self.searchQuery = ko.observable('');

    self.searchedPlaces = ko.computed(function() {
        // Close the infowindow whenever user searches new places
        infoWindow.close();

        if (currentMarkers) {
            currentMarkers().forEach(function(marker) {
                marker.setVisible(false);
            });
        }

        var searchedPlaces = [];
        places().forEach(function(place) {
            if (place.name.toLowerCase().indexOf(self.searchQuery()) >= 0) {
                place.marker = setoffMarker(place, iconList);
                searchedPlaces.push(place);
            }
        })
        console.log(places());
        console.log('Searched Places: ' + searchedPlaces);
        return searchedPlaces;
    });

    var currentMarkers = ko.computed(function() {
        var currentMarkers = [];
        if (self.searchedPlaces) {
            self.searchedPlaces().forEach(function(place) {
                var newMarker = setoffMarker(place, iconList);
                currentMarkers.push(newMarker);
           });
        }
        console.log('Current markers: ', currentMarkers);
        return currentMarkers
    });

    var clickedPlace = ko.observable('');

    self.onPlaceClicked = function(place) {
        var clickedPlaceCopy = clickedPlace();

        currentMarkers().forEach(function(marker) {
            marker.setAnimation(null);
        });
        addAsyncData(place, clickedPlaceCopy, self.setoffInfoWindow);
    };

    var clickedMarker = ko.computed(function() {
        currentMarkers().forEach(function(marker) {
            var place = clickedPlace();
            if (marker.getTitle() == place.name) {
               // Do all the API calls and add the returned data to the marker object itself.
               // (function(placeCopy, markerCopy, setoffInfoWindowCopy) {
               //     addAsyncData(placeCopy, markerCopy, setoffInfoWindow);
               // })(place, marker, self.setoffInfoWindow);
                addAsyncData(place, marker, self.setoffInfoWindow);

                return marker;
            }
        });
    })
};

function init() {
    ko.applyBindings(new ViewModel());
}

function googleError() {
    document.body.innerHTML = "<h2>Sorry Google Maps didn't load. Please check your internet connection.</h2>";
}