onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href="admin-login.html";

return;

}

const adminRef=doc(db,"admins",user.uid);

const adminSnap=await getDoc(adminRef);

if(!adminSnap.exists()){

await signOut(auth);

window.location.href="admin-login.html";

return;

}

});      import {
doc,
getDoc,
updateDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

(() => {
    'use strict';

    // --- DOM References ---
    const form = document.getElementById('adminLoginForm');
    if (!form) {
        console.error('Admin login form not found.');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Ensure status element exists (creates it if missing)
    let status = document.getElementById('loginStatus');
    if (!status) {
        status = document.createElement('p');
        status.id = 'loginStatus';
        status.style.marginTop = '1rem';
        status.style.fontSize = '0.9rem';
        status.style.textAlign = 'center';
        form.appendChild(status);
    }

    const originalBtnText = submitBtn?.textContent || 'Login';

    // --- User-Friendly Error Mapping ---
    const getErrorMessage = (code) => {
        const messages = {
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/user-disabled': 'This account has been disabled. Contact support.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
        };
        return messages[code] || 'An unexpected error occurred. Please try again.';
    };

    // --- UI Helpers ---
    const setLoading = (isLoading) => {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'Authenticating...' : originalBtnText;
        status.textContent = '';
        status.style.color = ''; // Reset color
    };

    const showError = (message) => {
        status.style.color = '#e74c3c';
        status.textContent = message;
    };

    // --- Login Handler ---
    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);

        const email = emailInput?.value?.trim() || '';
        const password = passwordInput?.value || '';

        // Client-side validation
        if (!email || !password) {
            showError('Please enter both email and password.');
            setLoading(false);
            return;
        }

        try {
            // 1. Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Verify admin status in Firestore
            const adminRef = doc(db, 'admins', user.uid);
            const adminSnap = await getDoc(adminRef);

            if (!adminSnap.exists()) {
                // 3. Deny access and sign out immediately
                await signOut(auth);                showError('Access denied. You are not authorized to access this portal.');
                setLoading(false);
                return;
            } 
             const adminData = adminSnap.data();

if (!adminData.active) {

    await signOut(auth);

    showError("Your administrator account has been disabled.");

    setLoading(false);

    return;

}

if (adminData.role !== "super_admin") {

    await signOut(auth);

    showError("You don't have permission to access this dashboard.");

    setLoading(false);

    return;

}                              const adminData = adminSnap.data();

            if (!adminData.active) {

    await signOut(auth);

    showError("Your administrator account has been disabled.");

    setLoading(false);

    return;

}
            // 4. Redirect on successful verification
             await updateDoc(adminRef, {

    lastLogin: serverTimestamp()

});                            window.location.href = 'admin-dashboard.html';

        } catch (error) {
            // Handle Firebase errors gracefully
            const friendlyMessage = getErrorMessage(error.code);
            showError(friendlyMessage);
            setLoading(false);
        }
    };

    // --- Attach Listener ---
    form.addEventListener('submit', handleLogin);
})();