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

function initMap() {
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

    // map.addListener('center_changed', function() {
    //     console.log(map.getCenter().lat(), map.getCenter().lng());
    // })

    $('#recenterMap').click(function() {
        map.setCenter(new google.maps.LatLng(mapCenter.lat, mapCenter.lng));
    });
}

function buildInfoWindow(marker) { 
    var infoWindowContent;
    infoWindowContent = '<div class="infoWindowContent">';
    
    infoWindowContent += '<div class="infoWindowHeader">';
    if (marker.fourSquareData.url) { 
        infoWindowContent += '<a href="' + marker.fourSquareData.url +'">';
        infoWindowContent +=  marker.title + '</a>';
    } else {
        infoWindowContent +=  marker.title;
    }
    infoWindowContent += '<span class="icon-heart"></span>' ;
    infoWindowContent += '</div>';

    // Popularity Indicator:
    var checkinsCount = marker.fourSquareData.stats.checkinsCount;
    infoWindowContent += '<h5>FourSquare Checkins: ' + checkinsCount + '</h5>';

    infoWindowContent += ' ';
    infoWindowContent += '<h5>' + marker.fourSquareData.location.address + '</h5>';
    
    /*************  Google StreetView   **************/
    var streetViewUrl = 'https://www.google.com/maps/embed/v1/streetview?';
    streetViewUrl += 'key=AIzaSyDOVXLsDsl7za9LKMI-TDWbWV1o_pa77VE';
    streetViewUrl += '&location=' + marker.geocode.lat + ',' + marker.geocode.lng;
    streetViewUrl += '&fov=90&heading=235&pitch=10';
    infoWindowContent += '<iframe width="150" height="150" frameborder="0" style="border:0"';
    infoWindowContent += 'src="' + streetViewUrl;
    infoWindowContent += '" allowfullscreen></iframe>';

    // if the complete fourSquareData, the version with photos, is returned, display the best photo
    infoWindowContent += '<div class="venueImg">'
    for (var i = 0; i < 6; i+=2) {
        var photoEntry1 = marker.fourSquareData.photos.groups[0].items[i];
        var photoEntry2 = marker.fourSquareData.photos.groups[0].items[i + 1];
        if (photoEntry1 && photoEntry2) {
            // make sure there're always two pictures on a single row.
            [photoEntry1, photoEntry2].forEach(function(photoEntry) {
                var photoUrl = photoEntry.prefix + '100x100' + photoEntry.suffix;
                infoWindowContent += '<img src=' + photoUrl + '>';
            })
        }
    }
    infoWindowContent += '</div>';

    infoWindowContent += '</div>' 

    infoWindow.setContent(infoWindowContent);
    infoWindow.open(map, marker);

    // heart icon click event
    $('.icon-heart').click(function(marker) {
        console.log('User clicks the like button');
        likeALocation(marker)
    }(marker));
}

/* TODO: move currentLoc or the currentMarker to global namespace, and write onlick event into
 * the html, or this does not work.
 */
function likeALocation(marker) {
    var heartIcon = $('.icon-heart');
    if (heartIcon.css('color') == '606060') {
        // Cancel like status
    } else {
        console.log('Icon-heart color: ' + heartIcon.css('color'));
        console.log('liked');
        heartIcon.css('color', '606060');                
        // TODO: restructure markers/places computed arrays, so the places could be easily matched
        likedPlacesRef().push(marker.getTitle());
    }
}

// Make API calls and store the results as the marker's property
// The callbackl has to take a marker as an argument
function addAsyncData(marker, callback) {
    /****************** Foursquare API call. ******************/
    /* The response has some slight chance to contain unwanted locations
     * The success callback adds an extra filter to further lower the chance.
     */
    var clientId = 'MYPFF3DXZ5ZG1APSZINGIEYSGIJKNXYLJPLUW25MOMSLT2JZ';
    var clientSecret = '5S2U44PXCMR3ZE1GIDPRCRFUA53J42QQ5MTJYPPH3PXLLQKN';

    // var url = 'https://api.foursquare.com/v2/venues/search?';
    // url += 'll=' + marker.geocode.lat + ',' + marker.geocode.lng;
    // url += '&query=' + marker.title;
    // url += '&intent=match';
    // url += '&client_id=' + clientId;
    // url += '&client_secret=' + clientSecret;
    // url += '&v=20151124';

    // Now the intent is the default option, checkin.
    // TODO: suppose neither the fourSquareID nor the geocode is in the the model...
    /* TODO: this is tricky because you have to think how you are going to ensure 
     * all the returned locations are what you really like
     * and the returned categories could decide the icons
     */
    var searchUrl = 'https://api.foursquare.com/v2/venues/search?'; 
    searchUrl += 'll=' + map.getCenter().lat() + ',' + map.getCenter().lng();
    searchUrl += '&query=' + marker.title;
    searchUrl += '&limit=2';
    searchUrl += '&client_id=' + clientId;
    searchUrl += '&client_secret=' + clientSecret;
    searchUrl += '&v=20151124';

    /* If the Id is available, get the complete venue reponse. In any event,
     * there should be checks on if a specific data point, like photos, 
     * is available before using
     */
    if (marker.apiData.fourSquareId) {
        searchUrl = 'https://api.foursquare.com/v2/venues/';
        searchUrl += marker.apiData.fourSquareId + '?';
        searchUrl += '&client_id=' + clientId;
        searchUrl += '&client_secret=' + clientSecret;
        searchUrl += '&v=20151124';
    }

    $.getJSON(searchUrl)
        .done(function(data) {
            console.log(data);
            marker.fourSquareData = data.response.venue[0] || data.response.venue;
            for (var i = 0; i < data.response.venues; i++) {
                if (data.response.venues[i]._id === marker.apiData.fourSquareId) {
                    marker.fourSquareData = data.response.venues[i];
                }
            };
            callback(marker);
        })
        .fail(function(error) {
            marker.fourSquareData = false;
        });
}

var ViewModel = function() {
    initMap();
    var self = this;

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

    var infoWindow = new google.maps.InfoWindow({
        content: ''
    });

    /* Execute on each marker's click event, add in markers array
     * and bind to click event on list elements
     */
    self.setInfoWindow = function(marker) {
        for (var i = 0; i < markers().length; i++) {
            markers()[i].setAnimation(null);
        }

        // Set off marker bouncing.
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1000);

        // End bouncing if you close the infoWindow before the default effect period comes to an end
        // TODO: why you have to return a function within the function?
        // TODO: why you cannot use this for the marker?
        // TODO: read more about IFFE and scoping, and then think again.
        infoWindow.addListener('closeclick', (function(markerCopy) {
            return function() {
                markerCopy.setAnimation(null);
            }
        })(marker));

        // Do all the API calls and add the returned data to the marker object itself.
        (function(marker) {
            addAsyncData(marker, buildInfoWindow);
        })(marker);
    };

    /* TODO: Merge markers with places. It's like keeping two copies of 
     * the model. Or, this computed observable could contain all the info
     * that's dynamically included in the map. 
     */
    /* The array of all markers, made computed observable to respond to
     * changes in places observable array
     */
    var markers = ko.computed(function() {
        // Icons for different types of markers
        var icons = {
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

        // Ensure all the icons have the right sizes
        var processedIcons = {};
        for (var type in icons) {
            if (!icons.hasOwnProperty(type)) continue;

            processedIcons[type] = new google.maps.MarkerImage(icons[type].url, null, null, null, new google.maps.Size(36, 36));
        }

        var markers = [];
        for (var i = 0; i < places().length; i++) {
            var marker = new google.maps.Marker({
                position: places()[i].geocode,
                title: places()[i].name,
                icon: processedIcons[places()[i].type]
            });

            marker.geocode = places()[i].geocode;
            if (places()[i].apiData) {
                marker.apiData = places()[i].apiData;
            }

            marker.addListener('click', function(markerCopy) {
                return function() {
                    self.setInfoWindow(markerCopy)
            }}(marker));

            marker.setMap(map);

            markers.push(marker);
        }
        return markers;
    })

    // Search for currentMarkers, and set them visible in the meantime.
    self.searchInput = ko.observable('');
    /* This is computed from the markers computed observable for convenience in 
     * setting the markers visible or invisible.
     */   
    self.currentMarkers = ko.computed(function() {
        // Close the infowindow as this obervable changes value
        infoWindow.close();

        var searchInput = self.searchInput().toLowerCase();
        var currentMarkers = [];
        for (var i = 0; i < markers().length; i++) {
            // Search algorithm
            if (markers()[i].title.toLowerCase().indexOf(searchInput) >= 0) {
                currentMarkers.push(markers()[i]);
                markers()[i].setVisible(true);
            } else {
                markers()[i].setVisible(false);
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