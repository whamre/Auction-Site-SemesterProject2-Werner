const apiUrl = "https://v2.api.noroff.dev";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginErrorMessageDiv = document.getElementById("login-error-message");

// Login Function

/**
 * Logs in a user with the given email and password.
 * The user data is stored in local storage and an API key is created.
 * @param {string} email The email of the user.
 * @param {string} password The password of the user.
 * @throws {Error} If the request fails or the API returns an error.
 * @returns {Promise<Object>} The user data if the login is successful.
 */
async function login(email, password) {
    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Login failed: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        
        localStorage.setItem('user', JSON.stringify(data));

        createApiKey();
        
        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

/**
 * Creates an API key for the logged in user and stores it in localStorage.
 * The user is redirected to index.html after the API key is created.
 * If the user is not logged in, the function does nothing.
 * @throws {Error} If the request fails or the API returns an error.
 */
async function createApiKey() {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
        const user = JSON.parse(storedUser);
        const accessToken = user.data.accessToken;

        try {
            const response = await fetch('https://v2.api.noroff.dev/auth/create-api-key', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem('apiKey', data.data.key);
                window.location.href = "index.html";
            } else {
                console.error('Error creating API key:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Request failed:', error);
        }
    } else {
        console.error('No user data found in localStorage.');
    }
};



// Register Function

/**
 * Registers a new user with the given data.
 * @param {Object} userData The user data to register with.
 * @property {string} userData.email The email of the user.
 * @property {string} userData.name The name of the user.
 * @property {string} userData.password The password of the user.
 * @throws {Error} If the request fails or the API returns an error.
 * @returns {Promise<Object>} The user data if the registration is successful.
 */

async function register(userData) {
    try {
        const response = await fetch(`${apiUrl}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });
    
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors[0].message || response.statusText); 
        }
    
        return await response.json();
    } catch (error) {
        console.error("Registration error:", error);
        throw error; 
    }
}

// Event handler for HTML Login form

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const data = await login(email, password);

        } catch (error) {
            loginErrorMessageDiv.textContent = "Login failed. Please check your credentials and try again.";
        }
    });
}

// Register requirements.

/**
 * Validates the given email and password for registration.
 * @param {string} email The email to check.
 * @param {string} password The password to check.
 * @returns {string|null} An error message if validation fails, or null if it succeeds.
 */
function validateRegistrationForm(email, password) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@stud\.noroff\.no$/;
    if (!emailRegex.test(email)) {
        return "Only stud.noroff.no emails are allowed to register.";
    }
    if (password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    return null;
}

// Event handler for HTML Register form

if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const errorMessageDiv = document.getElementById("error-message");
        const successMessageDiv = document.getElementById("success-message");

        errorMessageDiv.textContent = '';
        successMessageDiv.textContent = '';

        const validationError = validateRegistrationForm(email, password);
        if (validationError) {
            errorMessageDiv.textContent = validationError;
            return;
        }

        const userData = {
            name: username,
            email: email,
            password: password,
        };

        try {
            const data = await register(userData);
            successMessageDiv.textContent = "Registration successful! Redirecting to login...";
            setTimeout(() => {
                window.location.href = "#";
            }, 2000);
        } catch (error) {
            errorMessageDiv.textContent = error.message || "Registration failed. Please try again.";
        }
    });
}

// Login -- Logout Buttons. 

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const myPageButton = document.getElementById('myPage-button');

    if (user) {
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
        myPageButton.style.display = 'block';
    } else {
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        myPageButton.style.display = 'none';
    }


    logoutButton.addEventListener("click", function() {
        localStorage.removeItem('user');
        localStorage.removeItem('apiKey');
        window.location.href = "login.html";
    });
});

