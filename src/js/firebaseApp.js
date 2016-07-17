var signInButton = document.getElementById('sign-in-button'),
	currentUserId = ko.observable('');

// TODO: Initiate the app's interactions with the database
function startDatabaseQueries() {
}

function writeUserData(userId, name, email) {
	firebase.database().ref('users/' + userId).set({
		username: name,
		email: email
	});
}

window.addEventListener('load', function() {
	signInButton.addEventListener('click', function() {
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider);
	});

	// Listen for auth state changes
	// TODO: write the sign-out process
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			currentUserId(user.uid);
			writeUserData(user.uid, user.displayName, user.email);
			startDatabaseQueries();
		}
	})
});