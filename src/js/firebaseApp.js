var signInButton = $('#sign-in-button'),
	// TODO: clarify the use of this.
	currentUserId = ko.observable('');

// TODO: Initiate the app's interactions with the database
function startDatabaseQueries() {
}

function writeUserData(userId, name, email) {
	// TODO: this set function overwrites.
	firebase.database().ref('users/' + userId).set({
		username: name,
		email: email
	}).then(function() {}, function(error) {
		console.log(error),
		alert('An error has occured writing your data into the database.');
	});
}

window.addEventListener('load', function() {
	var signInButton = $('#sign-in-button');

	signInButton.click(function() {
		if (signInButton.text() == 'Sign In') {
			console.log('User clicked to sign in.');
			var provider = new firebase.auth.GoogleAuthProvider();
			firebase.auth().signInWithPopup(provider).then(function() {
				// TODO
			}, function(error) {
				console.log(error);
				alert('A signin error has occured. Please reload the page.');
			});
		} else {
			console.log('User clicked to sign out.');
			firebase.auth().signOut().then(function() {
				// TODO
			}, function(error){
				console.log(error);
				alert('A signout error has occurred. Please reload the page.');
			});
		}
	});

	// Listen for auth state changes
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			writeUserData(user.uid, user.displayName, user.email);
			//startDatabaseQueries();
			var userName = user.displayName;
			console.log('User ' + userName + ' signs in.');
			var firstName = userName.substring(0, userName.indexOf(' '));
			signInButton.text('Sign out ' + firstName);
		} else {
	        // No user is signed in.
	      	console.log('The user signs out.');
			signInButton.text('Sign In');
		}
	});
});

