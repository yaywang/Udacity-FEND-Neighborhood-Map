// TODO: incorporate this into app.js
// // Like a place
// var likedPlacesRef = ko.computed(function() {
//     var uid = currentUserId();
//     return firebase.database().ref('users/' + uid + '/likedPlaces')
// });

// var likedPlaces = ko.observableArray([]);
// likedPlacesRef().once('value', function(snapshot) {
//     likedPlaces(snapshot.val());
// });

// function like(place) {
//     var heartIcon = $('.icon-heart');
//     if (heartIcon.css('color') == '606060') {
//         // TODO: Cancel like status
//     } else {
//         console.log('Icon-heart color: ' + heartIcon.css('color'));
//         console.log('liked');
//         heartIcon.css('color', '606060');
//         // TODO: restructure markers/places computed arrays, so the places could be easily matched
//         likedPlacesRef().push(marker.getTitle());
//     }
// }

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