// Recommendations Functions (continued)
// Firebase Configuration
const firebaseConfig = {
   apiKey: "YOUR_API_KEY",
   authDomain: "YOUR_AUTH_DOMAIN",
   projectId: "YOUR_PROJECT_ID",
   storageBucket: "YOUR_STORAGE_BUCKET",
   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
   appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const authSection = document.getElementById('auth-section');
const preferencesSection = document.getElementById('preferences-section');
const recommendationsSection = document.getElementById('recommendations-section');
const profileSection = document.getElementById('profile-section');
const loginContainer = document.getElementById('login-container');
const signupContainer = document.getElementById('signup-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const preferencesForm = document.getElementById('preferences-form');
const recommendationsContainer = document.getElementById('recommendations-container');
const upgradeBtn = document.getElementById('upgrade-btn');
const paymentModal = document.getElementById('payment-modal');
const paymentForm = document.getElementById('payment-form');
const closeModal = document.querySelector('.close-modal');
const loadingOverlay = document.getElementById('loading-overlay');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const navigation = document.getElementById('navigation');
const profilePic = document.getElementById('profile-pic');
const changePicBtn = document.getElementById('change-pic-btn');
const profilePicUpload = document.getElementById('profile-pic-upload');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const memberSince = document.getElementById('member-since');
const subscriptionStatus = document.getElementById('subscription-status');
const currentPlan = document.getElementById('current-plan');
const upgradeContainer = document.getElementById('upgrade-container');
const premiumStatus = document.getElementById('premium-status');

// Global Variables
let currentUser = null;
let isPremium = false;
const SUBSCRIPTION_PRICE = 15; // $15/month

// Last.fm API for music recommendations
const LASTFM_API_KEY = 'YOUR_LASTFM_API_KEY';
const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';

// Navigation Setup
function setupNavigation() {
   navigation.innerHTML = '';
   
   if (currentUser) {
       const navItems = [
           { id: 'nav-recommendations', text: 'Recommendations', section: recommendationsSection },
           { id: 'nav-preferences', text: 'My Preferences', section: preferencesSection },
           { id: 'nav-profile', text: 'Profile', section: profileSection }
       ];
       
       navItems.forEach(item => {
           const link = document.createElement('a');
           link.id = item.id;
           link.href = '#';
           link.textContent = item.text;
           
           link.addEventListener('click', (e) => {
               e.preventDefault();
               hideAllSections();
               item.section.classList.remove('hidden');
               
               // Update active link
               document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
               link.classList.add('active');
           });
           
           navigation.appendChild(link);
       });
       
       // Set initial active link
       document.getElementById('nav-recommendations').classList.add('active');
   }
}

// Utility Functions
function hideAllSections() {
   authSection.classList.add('hidden');
   preferencesSection.classList.add('hidden');
   recommendationsSection.classList.add('hidden');
   profileSection.classList.add('hidden');
}

function showLoading() {
   loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
   loadingOverlay.classList.add('hidden');
}

function showNotification(message, isError = false) {
   notificationText.textContent = message;
   notification.classList.remove('hidden', 'error', 'success');
   
   if (isError) {
       notification.classList.add('error');
   } else {
       notification.classList.add('success');
   }
   
   setTimeout(() => {
       notification.classList.add('hidden');
   }, 3000);
}

function formatDate(timestamp) {
   const date = new Date(timestamp);
   const options = { year: 'numeric', month: 'long', day: 'numeric' };
   return date.toLocaleDateString('en-US', options);
}

// Authentication Functions
function toggleAuthForms() {
   loginContainer.classList.toggle('hidden');
   signupContainer.classList.toggle('hidden');
}

async function handleSignup(e) {
   e.preventDefault();
   
   const name = document.getElementById('signup-name').value;
   const email = document.getElementById('signup-email').value;
   const password = document.getElementById('signup-password').value;
   const confirmPassword = document.getElementById('signup-confirm-password').value;
   
   // Validate password match
   if (password !== confirmPassword) {
       showNotification('Passwords do not match', true);
       return;
   }
   
   showLoading();
   
   try {
       // Create user in Firebase Auth
       const userCredential = await auth.createUserWithEmailAndPassword(email, password);
       
       // Add user details to Firestore
       await db.collection('users').doc(userCredential.user.uid).set({
           name: name,
           email: email,
           createdAt: firebase.firestore.FieldValue.serverTimestamp(),
           isPremium: false,
           profilePicUrl: null
       });
       
       showNotification('Account created successfully!');
   } catch (error) {
       showNotification(`Error: ${error.message}`, true);
       console.error('Signup error:', error);
   } finally {
       hideLoading();
   }
}

async function handleLogin(e) {
   e.preventDefault();
   
   const email = document.getElementById('login-email').value;
   const password = document.getElementById('login-password').value;
   
   showLoading();
   
   try {
       await auth.signInWithEmailAndPassword(email, password);
       showNotification('Logged in successfully!');
   } catch (error) {
       showNotification(`Error: ${error.message}`, true);
       console.error('Login error:', error);
       hideLoading();
   }
}

async function handleLogout() {
   showLoading();
   
   try {
       await auth.signOut();
       showNotification('Logged out successfully!');
   } catch (error) {
       showNotification(`Error: ${error.message}`, true);
       console.error('Logout error:', error);
   } finally {
       hideLoading();
   }
}

// User Preferences Functions
async function handlePreferencesSubmit(e) {
   e.preventDefault();
   
   if (!currentUser) {
       showNotification('You must be logged in to save preferences', true);
       return;
   }
   
   const favoriteGenre = document.getElementById('favorite-genre').value;
   const favoriteArtist = document.getElementById('favorite-artist').value;
   const favoriteSong = document.getElementById('favorite-song').value;
   
   // Get selected moods
   const selectedMoods = Array.from(document.querySelectorAll('input[name="mood"]:checked'))
       .map(checkbox => checkbox.value);
   
   // Get discovery preference
   const discoveryPreference = document.querySelector('input[name="discovery"]:checked')?.value || 'similar-artists';
   
   showLoading();
   
   try {
       // Save preferences to Firestore
       await db.collection('users').doc(currentUser.uid).update({
           preferences: {
               genre: favoriteGenre,
               artist: favoriteArtist,
               song: favoriteSong,
               moods: selectedMoods,
               discoveryPreference: discoveryPreference,
               updatedAt: firebase.firestore.FieldValue.serverTimestamp()
           }
       });
       
       showNotification('Preferences saved!');
       
       // Generate recommendations based on new preferences
       await getRecommendations();
       
       // Switch to recommendations view
       hideAllSections();
       recommendationsSection.classList.remove('hidden');
       document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
       document.getElementById('nav-recommendations').classList.add('active');
   } catch (error) {
       showNotification(`Error: ${error.message}`, true);
       console.error('Save preferences error:', error);
   } finally {
       hideLoading();
   }
}

// Recommendations Function

async function getRecommendations() {
   if (!currentUser) {
       showNotification('You must be logged in to get recommendations', true);
       return;
   }
   
   showLoading();
   
   try {
       // Get user preferences
       const userDoc = await db.collection('users').doc(currentUser.uid).get();
       const userData = userDoc.data();
       
       if (!userData.preferences) {
           // No preferences set yet
           hideLoading();
           recommendationsContainer.innerHTML = `
               <div class="no-recommendations">
                   <p>We need to know more about your music taste to provide recommendations.</p>
                   <button id="go-to-preferences" class="btn">Set Your Preferences</button>
               </div>
           `;
           
           document.getElementById('go-to-preferences').addEventListener('click', () => {
               hideAllSections();
               preferencesSection.classList.remove('hidden');
               document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
               document.getElementById('nav-preferences').classList.add('active');
           });
           
           return;
       }
       
       const { artist, genre } = userData.preferences;
       
       // Get recommendations from Last.fm API
       let recommendationsData = [];
       
       // Try artist-based recommendations first
       if (artist) {
           const artistRecommendations = await fetchSimilarArtists(artist);
           if (artistRecommendations.length > 0) {
               const artistTopTracks = await fetchArtistTopTracks(artistRecommendations[0].name);
               recommendationsData = recommendationsData.concat(artistTopTracks);
           }
       }
       
       // Add genre-based recommendations
       if (genre) {
           const genreTopTracks = await fetchTopTracksByTag(genre);
           recommendationsData = recommendationsData.concat(genreTopTracks);
       }
       
       // Remove duplicates and limit to 12 songs
       const uniqueRecommendations = [...new Map(recommendationsData.map(item => 
           [item.name + item.artist.name, item])).values()];
       const finalRecommendations = uniqueRecommendations.slice(0, 12);
       
       // Update subscription plan display
       updateSubscriptionDisplay(userData.isPremium);
       
       // Display recommendations
       displayRecommendations(finalRecommendations);
       
       // Save recommendations to Firestore for history
       await db.collection('users').doc(currentUser.uid).update({
           lastRecommendations: {
               tracks: finalRecommendations,
               generatedAt: firebase.firestore.FieldValue.serverTimestamp()
           }
       });
   } catch (error) {
       showNotification(`Error getting recommendations: ${error.message}`, true);
       console.error('Get recommendations error:', error);
   } finally {
       hideLoading();
   }
}

async function fetchSimilarArtists(artistName) {
   const params = new URLSearchParams({
       method: 'artist.getSimilar',
       artist: artistName,
       api_key: LASTFM_API_KEY,
       format: 'json',
       limit: 5
   });
   
   try {
       const response = await fetch(`${LASTFM_API_URL}?${params}`);
       const data = await response.json();
       return data.similarartists?.artist || [];
   } catch (error) {
       console.error('Error fetching similar artists:', error);
       return [];
   }
}

async function fetchArtistTopTracks(artistName) {
   const params = new URLSearchParams({
       method: 'artist.getTopTracks',
       artist: artistName,
       api_key: LASTFM_API_KEY,
       format: 'json',
       limit: 5
   });
   
   try {
       const response = await fetch(`${LASTFM_API_URL}?${params}`);
       const data = await response.json();
       return data.toptracks?.track || [];
   } catch (error) {
       console.error('Error fetching artist top tracks:', error);
       return [];
   }
}

async function fetchTopTracksByTag(tag) {
   const params = new URLSearchParams({
       method: 'tag.getTopTracks',
       tag: tag,
       api_key: LASTFM_API_KEY,
       format: 'json',
       limit: 10
   });
   
   try {
       const response = await fetch(`${LASTFM_API_URL}?${params}`);
       const data = await response.json();
       return data.tracks?.track || [];
   } catch (error) {
       console.error('Error fetching tag top tracks:', error);
       return [];
   }
}

function displayRecommendations(tracks) {
   recommendationsContainer.innerHTML = '';
   
   if (tracks.length === 0) {
       recommendationsContainer.innerHTML = '<p>No recommendations found. Try adjusting your preferences.</p>';
       return;
   }
   
   tracks.forEach(track => {
       // Calculate a math operation to generate a unique identifier (using modulo)
       const trackId = Math.abs(hashCode(track.name + track.artist.name)) % 1000000;
       
       // Use different image sizes based on track ID (demonstrating math operations)
       const imageSize = 150 + (trackId % 50); // Size between 150 and 199px
       
       const trackCard = document.createElement('div');
       trackCard.className = 'song-card';
       trackCard.dataset.trackId = trackId;
       
       // Get image URL from track if available, or use a placeholder
       const imageUrl = track.image?.[2]?.['#text'] || `/api/placeholder/${imageSize}/${imageSize}`;
       
       trackCard.innerHTML = `
           <div class="song-image" style="background-image: url('${imageUrl}')"></div>
           <div class="song-details">
               <div class="song-title">${track.name}</div>
               <div class="song-artist">${track.artist.name}</div>
               <div class="song-actions">
                   ${isPremium 
                       ? `<button class="play-btn" data-track="${track.name}" data-artist="${track.artist.name}">
                           Play Song
                          </button>`
                       : `<span class="locked-icon">🔒 Premium Only</span>`
                   }
                   <button class="add-to-favorites" data-track-id="${trackId}">❤️</button>
               </div>
           </div>
       `;
       
       // Add event listeners for premium play button if enabled
       if (isPremium) {
           trackCard.querySelector('.play-btn').addEventListener('click', function() {
               const trackName = this.dataset.track;
               const artistName = this.dataset.artist;
               playSong(trackName, artistName);
           });
       }
       
       // Add event listener for favorite button
       trackCard.querySelector('.add-to-favorites').addEventListener('click', function() {
           const trackIdToSave = this.dataset.trackId;
           toggleFavorite(trackIdToSave, tracks.find(t => 
               Math.abs(hashCode(t.name + t.artist.name)) % 1000000 === parseInt(trackIdToSave)
           ));
       });
       
       recommendationsContainer.appendChild(trackCard);
   });
   
   // Log to console (demonstrating output technique)
   console.log(`Displayed ${tracks.length} music recommendations for user ${currentUser.email}`);
}

function updateSubscriptionDisplay(userIsPremium) {
   isPremium = userIsPremium;
   
   if (isPremium) {
       currentPlan.textContent = 'Premium';
       upgradeContainer.classList.add('hidden');
       premiumStatus.classList.remove('hidden');
   } else {
       currentPlan.textContent = 'Free';
       upgradeContainer.classList.remove('hidden');
       premiumStatus.classList.add('hidden');
   }
   
   // Also update profile section
   subscriptionStatus.textContent = isPremium ? 'Premium' : 'Free';
}

function playSong(trackName, artistName) {
   // In a real application, this would integrate with a music streaming API
   // For demonstration purposes, we'll just show a notification
   showNotification(`Now playing: ${trackName} by ${artistName}`);
}

async function toggleFavorite(trackId, trackData) {
   if (!currentUser) return;
   
   try {
       // Check if already in favorites
       const favoritesRef = db.collection('users').doc(currentUser.uid).collection('favorites');
       const existingDoc = await favoritesRef.where('trackId', '==', trackId).get();
       
       if (existingDoc.empty) {
           // Add to favorites
           await favoritesRef.add({
               trackId: trackId,
               trackData: trackData,
               addedAt: firebase.firestore.FieldValue.serverTimestamp()
           });
           showNotification('Added to favorites!');
       } else {
           // Remove from favorites
           const docToDelete = existingDoc.docs[0];
           await docToDelete.ref.delete();
           showNotification('Removed from favorites');
       }
   } catch (error) {
       showNotification('Error updating favorites', true);
       console.error('Favorites error:', error);
   }
}

// Subscription Functions
function showPaymentModal() {
   paymentModal.classList.remove('hidden');
}

function hidePaymentModal() {
   paymentModal.classList.add('hidden');
}

async function handlePaymentSubmit(e) {
   e.preventDefault();
   
   const cardNumber = document.getElementById('card-number').value;
   const cardExpiry = document.getElementById('card-expiry').value;
   const cardCvc = document.getElementById('card-cvc').value;
   const cardName = document.getElementById('card-name').value;
   
   // Simple validation with if/else structure (demonstrating decision structure)
   if (cardNumber.length < 16) {
       showNotification('Please enter a valid card number', true);
       return;
   } else if (cardExpiry.length < 5) {
       showNotification('Please enter a valid expiration date', true);
       return;
   } else if (cardCvc.length < 3) {
       showNotification('Please enter a valid CVC', true);
       return;
   }
   
   showLoading();
   
   try {
       // In a real app, you would integrate with a payment processor here
       // For this demo, we'll just update the user's subscription status
       
       // Calculate subscription end date (demonstrating math operation)
       const currentDate = new Date();
       const endDate = new Date(currentDate);
       endDate.setMonth(currentDate.getMonth() + 1); // Add 1 month
       
       await db.collection('users').doc(currentUser.uid).update({
           isPremium: true,
           subscription: {
               startDate: firebase.firestore.FieldValue.serverTimestamp(),
               endDate: firebase.firestore.Timestamp.fromDate(endDate),
               plan: 'premium',
               price: SUBSCRIPTION_PRICE
           }
       });
       
       updateSubscriptionDisplay(true);
       hidePaymentModal();
       showNotification('Successfully subscribed to Premium!');
       
       // Refresh recommendations to enable play buttons
       await getRecommendations();
   } catch (error) {
       showNotification(`Payment error: ${error.message}`, true);
       console.error('Payment error:', error);
   } finally {
       hideLoading();
   }
}

// Profile Functions
async function loadUserProfile() {
   if (!currentUser) return;
   
   showLoading();
   
   try {
       const userDoc = await db.collection('users').doc(currentUser.uid).get();
       const userData = userDoc.data();
       
       // Update profile information
       profileName.textContent = userData.name || 'User';
       profileEmail.textContent = userData.email;
       
       // Format and display join date
       const createdAt = userData.createdAt?.toDate() || new Date();
       memberSince.textContent = formatDate(createdAt);
       
       // Update subscription status
       updateSubscriptionDisplay(userData.isPremium || false);
       
       // Update profile picture if available
       if (userData.profilePicUrl) {
           profilePic.src = userData.profilePicUrl;
       }
   } catch (error) {
       console.error('Error loading profile:', error);
   } finally {
       hideLoading();
   }
}

async function handleProfilePicUpload() {
   const file = profilePicUpload.files[0];
   if (!file) return;
   
   showLoading();
   
   try {
       // Create a storage reference
       const storageRef = storage.ref();
       const fileRef = storageRef.child(`profile_pics/${currentUser.uid}`);
       
       // Upload the file
       await fileRef.put(file);
       
       // Get the download URL
       const downloadURL = await fileRef.getDownloadURL();
       
       // Update user profile with new image URL
       await db.collection('users').doc(currentUser.uid).update({
           profilePicUrl: downloadURL
       });
       
       // Update the image in the UI
       profilePic.src = downloadURL;
       
       showNotification('Profile picture updated!');
   } catch (error) {
       showNotification(`Error uploading image: ${error.message}`, true);
       console.error('Profile pic upload error:', error);
   } finally {
       hideLoading();
   }
}

// Utility Functions
function hashCode(str) {
   // Simple hash function to generate numeric ID from string
   let hash = 0;
   for (let i = 0; i < str.length; i++) {
       const char = str.charCodeAt(i);
       hash = ((hash << 5) - hash) + char;
       hash = hash & hash; // Convert to 32bit integer
   }
   return hash;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
   // Auth form toggles
   showSignupLink.addEventListener('click', (e) => {
       e.preventDefault();
       toggleAuthForms();
   });
   
   showLoginLink.addEventListener('click', (e) => {
       e.preventDefault();
       toggleAuthForms();
   });
   
   // Form submissions
   loginForm.addEventListener('submit', handleLogin);
   signupForm.addEventListener('submit', handleSignup);
   preferencesForm.addEventListener('submit', handlePreferencesSubmit);
   paymentForm.addEventListener('submit', handlePaymentSubmit);
   
   // Logout button
   logoutBtn.addEventListener('click', handleLogout);
   
   // Upgrade button
   upgradeBtn.addEventListener('click', showPaymentModal);
   
   // Modal close button
   closeModal.addEventListener('click', hidePaymentModal);
   
   // Profile picture change
   changePicBtn.addEventListener('click', () => {
       profilePicUpload.click();
   });
   
   profilePicUpload.addEventListener('change', handleProfilePicUpload);
   
   // Initialize auth state listener
   auth.onAuthStateChanged(async (user) => {
       hideLoading();
       
       if (user) {
           // User is signed in
           currentUser = user;
           
           // Hide auth section, show app sections
           hideAllSections();
           recommendationsSection.classList.remove('hidden');
           
           // Set up navigation
           setupNavigation();
           
           // Load user profile
           await loadUserProfile();
           
           // Load recommendations
           await getRecommendations();
       } else {
           // User is signed out
           currentUser = null;
           
           // Show auth section, hide app sections
           hideAllSections();
           authSection.classList.remove('hidden');
           loginContainer.classList.remove('hidden');
           signupContainer.classList.add('hidden');
           
           // Clear navigation
           navigation.innerHTML = '';
       }
   });
   
   // Close payment modal when clicking outside
   window.addEventListener('click', (e) => {
       if (e.target === paymentModal) {
           hidePaymentModal();
       }
   });
});

db.collection("usuarios").get().then((querySnapshot) => {
   document.body.innerHTML += "<h2>Conectado a Firebase ✅</h2>";
 
   querySnapshot.forEach((doc) => {
     document.body.innerHTML += `<p>${doc.data().nombre}</p>`;
   });
 });
 