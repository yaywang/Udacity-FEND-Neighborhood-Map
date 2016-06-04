// TODO: whether to define another observable or pollute the marker class, an object defined by another app?
// TODO: link the places observable to dynamically added locations.

// var Place = function(name, geocode, apiData) {
//     this.name = name;
//     this.geocode = geocode;
//     this.apiData = apiData;
// }; 

//apiData.fourSquareId ensures perfect match from the fourSquareSearch results. It's optional.
var places = [{
    name: 'the Hive',
    geocode: {
        lat: 13.732065,
        lng: 100.576528
    },
    type: 'workingPlace',
    apiData: {
        fourSquareId: '537c7102498e0dae7372c8dd'
    }
}, {
    name: 'Seenspace 13',
    geocode: {
        lat: 13.733611,
        lng: 100.581482
    },
    type: 'bar',
    apiData: {
        fourSquareId: '4d849d2d5ad3a09392b6d2fd'
    }
}, {
    name: 'Villa Market Sukhumvit 49',
    geocode: {
        lat: 13.732610,
        lng: 100.576364
    },
    type: 'grocery',
    apiData: {
        fourSquareId: '4c00b1dbdf6c0f4730d98b22'
    }
}, {
    name: 'Villa Market J Avenue',
    geocode: {
        lat: 13.734618,
        lng: 100.582011
    },
    type: 'grocery',
    apiData: {
        fourSquareId: '4b8e745ff964a520792333e3'
    }
}, {
    name: 'UFM Fuji Super Branch 4',
    geocode: {
        lat: 13.731103,
        lng: 100.575931
    },
    type: 'grocery',
    apiData: {
        fourSquareId: '4ceb4f19f8653704af28c2c4'
    }
}, {
    name: 'Harvey',
    geocode: {
        lat: 13.732130,
        lng: 100.579386
    },
    type: 'restaurant',
    apiData: {
        fourSquareId: '4ba0d246f964a520f47f37e3'
    }
}, {
    name: 'Bankara Ramen',
    geocode: {
        lat: 13.734810,
        lng: 100.572196
    },
    type: 'restaurant',
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
        zoom: 16,
        mapTypeControl: false,
        styles: paleDownMapTypeArray
    });

    /****************** Trial code to add places dynamically ******************/
   // TODO: !!! This depends on places being an observable !!!
   //
   // // Populate the dynamic model
   //  map.addListener('center_changed', function() {
   //      var newCenter = {
   //          lat: map.getCenter().lat(),
   //          lng: map.getCenter().lng()
   //      };

   //      // API request to acquire new locations
   //      var clientId = 'MYPFF3DXZ5ZG1APSZINGIEYSGIJKNXYLJPLUW25MOMSLT2JZ';
   //      var clientSecret = '5S2U44PXCMR3ZE1GIDPRCRFUA53J42QQ5MTJYPPH3PXLLQKN';

   //      var searchUrl = 'https://api.foursquare.com/v2/venues/explore?'; 
   //      searchUrl += 'll=' + newCenter.lat + ',' + newCenter.lng;
   //      searchUrl += '&query=coffee';
   //      // Here only the last query item is remembered
   //      // searchUrl += '&query=restaurant';
   //      // searchUrl += '&query=coworking';
   //      searchUrl += '&client_id=' + clientId;
   //      searchUrl += '&client_secret=' + clientSecret;
   //      searchUrl += '&v=20151124';
  
   //      // Response data structure:
   //      // data.response.groups[0].items
   //      $.getJSON(searchUrl)
   //          .done(function(data) {
   //              // console.log(data.response.groups[0].items);
   //              data.response.groups[0].items.forEach(function(item) {
   //                  var place = {};
   //                  place.name = item.venue.name;
   //                  place.geocode = {};
   //                  place.geocode.lat = item.venue.location.lat;
   //                  place.geocode.lng = item.venue.location.lng; 
   //                  // This shall be changed later!
   //                  place.type = "bar";
   //                  places.push(place);
   //              })
   //          })
   //          .fail(function(error) {
   //          });
   //  });

    var infoWindow = new google.maps.InfoWindow({
        content: ''
    });

    // Access the checkboxes for controlling the list
    var listCheckBoxes = $("input[name=menu]");

    /* Execute on each marker's click event, add in markers array
     * and bind to click on list elements
     */
    self.setInfoWindow = function(marker) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setAnimation(null);
        }
        marker.setAnimation(google.maps.Animation.BOUNCE);

        // Turn off the checkBox for controlling the list
        /* Once the window width is above 960 px, the list won't overlap with markers
         * Note that this number depends on the zoom level. If it's large
         * then some markers will be too near to the left edge
         */

        /* TODO: if you load in portrait and then flip the ipad to landscape, then
         * the leftmost marker will still be behind the list
         * in iPhone 5, the label would cover an infowindow on the upperleft corner
         */

        if (window.innerWidth < 960) {
            listCheckBoxes.prop('checked', false);
        }

        var infoWindowContent;
        infoWindowContent = '<div class="infoWindowContent">';
        
        infoWindowContent += '<div class="infoWindowHeader">';
        if (marker.fourSquareData.url) { 
            infoWindowContent += '<a href="' + marker.fourSquareData.url +'">';
            infoWindowContent +=  marker.title + '</a>';
        } else {
            infoWindowContent +=  marker.title;
        }
        infoWindowContent += '</div>'

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
        //console.log(marker);
        //console.log(streetViewUrl);
        infoWindowContent += '<iframe width="150" height="150" frameborder="0" style="border:0"';
        infoWindowContent += 'src="' + streetViewUrl;
        infoWindowContent += '" allowfullscreen></iframe>';

        // if the complete fourSquareData, with photos, is returned, display the best photo
        if (marker.fourSquareData.bestPhoto) {
            var photoUrl = marker.fourSquareData.bestPhoto.prefix + '300x300' + marker.fourSquareData.bestPhoto.suffix;
            infoWindowContent += '<div class="venueImg"><img src=' + photoUrl + '>' + '</div>'
        }

        infoWindowContent += '</div>' 


        infoWindow.setContent(infoWindowContent);
        infoWindow.open(map, marker);
    };

    // Make API calls and store the results as the marker's property
    function addAsyncData(marker) {
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

        /* If the Id is available, get the complete venue reponse
         * SOME places have a complete data response now
         * Anyways, there should be checks on if a specific data point, 
         * like photos, is available before using
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
                }
            })
            .fail(function(error) {
                marker.fourSquareData = false;
            });
    }

    // The array of all markers
    var markers = [];

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

    for (var i = 0; i < places.length; i++) {
        var marker = new google.maps.Marker({
            position: places[i].geocode,
            title: places[i].name,
            icon: processedIcons[places[i].type]
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
                // End bouncing after a default length of effect
                setTimeout(function() {
                    markerCopy.setAnimation(null);
                }, 5000)
            };
        })(marker));
        
        // End bouncing if you close the infoWindow before the default length of effect comes to an end
        infoWindow.addListener('closeclick', (function(markerCopy) {
            return function() {
                markerCopy.setAnimation(null);
            }
        })(marker));

        (function(marker) {
            addAsyncData(marker);
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