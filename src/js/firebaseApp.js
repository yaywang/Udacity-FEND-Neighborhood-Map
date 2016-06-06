var signInButton = document.getElementById('sign-in-button');

window.addEventListener('load', function() {
	signInButton.addEventListener('click', function() {
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider);
	});
})