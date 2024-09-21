const userString = localStorage.getItem('user');
const user = JSON.parse(userString);

const token = `Bearer ${user.data.accessToken}`;
const apiKey = localStorage.getItem('apiKey');

const submitMessage = document.getElementById('submitMessage');

document.getElementById('create-listing-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const mediaUrl = document.getElementById('mediaUrl').value;
  const description = document.getElementById('description').value;
  const endsAt = document.getElementById('endsAt').value;

  const body = {
    title: title,
    description: description,
    tags: ["string"],
    media: [
      {
        url: mediaUrl,
        alt: `Picture of ${title}`
      }
    ],
    endsAt: endsAt
  };

  try {
    const response = await fetch('https://v2.api.noroff.dev/auction/listings', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'X-Noroff-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to create listing');
    }

    const data = await response.json();
    submitMessage.innerHTML = 'Listing created successfully!';
    setTimeout(() => {
        window.location.href = 'profile.html';
      }, "2000");
  } catch (error) {
    console.error('Error:', error);
    submitMessage.innerHTML = 'Failed to create listing';
  }
});

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
    if (window.location.pathname === '/profile.html') {
        myPageButton.style.display = 'none';
    }


    logoutButton.addEventListener("click", function() {
        localStorage.removeItem('user');
        localStorage.removeItem('apiKey');
        window.location.href = "login.html";
    });
});