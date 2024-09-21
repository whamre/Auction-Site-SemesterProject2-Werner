const apiUrl = "https://v2.api.noroff.dev";

const customPromptModal = new bootstrap.Modal(document.getElementById('custom-prompt'));
const deletePromptModal = new bootstrap.Modal(document.getElementById('delete-prompt'));
const editPromptModal = new bootstrap.Modal(document.getElementById('edit-prompt'));

const storedUser = localStorage.getItem('user');
const userString = localStorage.getItem('user');
const user = JSON.parse(userString);
const accessToken = user.data.accessToken;
const apiKey = localStorage.getItem('apiKey');

async function getProfiles() {
    if (apiKey && storedUser) {
        const user = JSON.parse(storedUser);
        const accessToken = user.data.accessToken;

        try {
            const response = await fetch(`${apiUrl}/auction/profiles/${user.data.name}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Noroff-API-Key': apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                populateProfile(data.data);
            } else {
                console.error('Error fetching profiles:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Request failed:', error);
        }
    } else {
        console.error('Missing apiKey or user data in localStorage.');
    }
}

function populateProfile(profileData) {
    document.getElementById('banner').src = profileData.banner.url;
    document.getElementById('banner').alt = profileData.banner.alt || 'User Banner';

    document.getElementById('avatar').src = profileData.avatar.url;
    document.getElementById('avatar').alt = profileData.avatar.alt || 'User Avatar';

    document.getElementById('name').textContent = profileData.name;
    document.getElementById('bio-display').textContent = profileData.bio || 'No Bio Available';
    document.getElementById('credit').textContent = profileData.credits || '0';

    const listingsCount = profileData._count?.listings || 0;

    const listingsContainer = document.getElementById('listings-container');
    listingsContainer.textContent = listingsCount > 0 ? `You have ${listingsCount} listings.` : "No listings available.";

    if (listingsCount > 0) {
        displayMyListings();
    }
}

async function displayMyListings() {
    const listingsContainer = document.getElementById('listings-container');

    if (apiKey && storedUser) {
        const user = JSON.parse(storedUser);
        const accessToken = user.data.accessToken;
        const username = user.data.name;

        try {
            const response = await fetch(`${apiUrl}/auction/profiles/${username}/listings`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Noroff-API-Key': apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Error fetching listings:', response.status, response.statusText);
                showAlert('danger', 'Failed to load listings. Please try again later.');
                return;
            }

            const listings = await response.json();

            if (listings.data && listings.data.length > 0) {
                listingsContainer.innerHTML = '';

                const row = document.createElement('div');
                row.classList.add('row', 'g-4', 'd-flex', 'justify-content-center');

                listings.data.forEach(listing => {
                    const col = document.createElement('div');
                    col.classList.add('col-lg-5', 'col-md-7', 'mb-4');

                    const card = document.createElement('div');
                    card.classList.add('card', 'h-100');

                    if (listing.media && listing.media.length > 0) {
                        const image = document.createElement('img');
                        image.src = listing.media[0].url;
                        image.classList.add('card-img-top', 'img-fluid');
                        image.alt = listing.title || 'Listing Image';
                        card.appendChild(image);
                    } else {
                        console.warn('No media found for listing:', listing.id);
                    }

                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body', 'd-flex', 'flex-column');

                    const title = document.createElement('h5');
                    title.classList.add('card-title');
                    title.textContent = listing.title || 'No Title';
                    cardBody.appendChild(title);

                    const description = document.createElement('p');
                    description.classList.add('card-text', 'flex-grow-1');
                    description.textContent = listing.description || 'No Description';
                    cardBody.appendChild(description);

                    if (listing.endsAt) { 
                        const endsAt = document.createElement('p');
                        endsAt.classList.add('card-text');
                        const endsDate = new Date(listing.endsAt);
                        endsAt.textContent = isNaN(endsDate) ? 'Ends at: N/A' : `Ends at: ${endsDate.toLocaleString()}`;
                        cardBody.appendChild(endsAt);
                    }

                    const viewButton = document.createElement('a');
                    viewButton.href = `listing.html?id=${listing.id}`;
                    viewButton.classList.add('btn', 'btn-primary', 'mt-auto', 'w-50', 'mx-auto');
                    viewButton.textContent = 'View Details';
                    cardBody.appendChild(viewButton);

                    const buttonsContainer = document.createElement('div');
                    buttonsContainer.classList.add('d-flex', 'justify-content-center', 'mt-3', 'gap-4');
                    cardBody.appendChild(buttonsContainer);

                    const editButton = document.createElement('a');
                    editButton.innerHTML = `Edit&nbsp<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil mb-1" viewBox="0 0 16 16">
                      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                      </svg>`;
                    buttonsContainer.appendChild(editButton);

                    editButton.addEventListener('click', function() {
                        openEditModal(listing);
                    });

                    const deleteButton = document.createElement('a');
                    deleteButton.innerHTML = `Delete&nbsp<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash mb-1" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                      </svg>`;
                    buttonsContainer.appendChild(deleteButton);

                    deleteButton.addEventListener('click', function() {
                        const deleteModalButton = document.getElementById('delete-listing');
                        deleteModalButton.dataset.listingId = listing.id;
                        deletePromptModal.show();
                    });

                    card.appendChild(cardBody);
                    col.appendChild(card);
                    row.appendChild(col);
                });

                listingsContainer.appendChild(row);
            } else {
                listingsContainer.innerHTML = `
                    <div class="alert alert-warning" role="alert">
                        No listings available.
                    </div>
                `;
            }
        } catch (error) {
            console.error('Request failed:', error);
            showAlert('danger', 'An error occurred while fetching listings.');
        }
    } else {
        console.error('Missing apiKey or user data in localStorage.');
        showAlert('danger', 'Unauthorized access. Please log in to view your listings.');
    }
}

async function editListing(listingId) {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const mediaUrl = document.getElementById('media-url').value.trim();


    const body = {
        title,
        description,
        media: [
            {
                url: mediaUrl
            }
        ]
    };

    try {
        const response = await fetch(`${apiUrl}/auction/listings/${listingId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Noroff-API-Key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Listing updated successfully:', data);
            showAlert('success', 'Listing updated successfully.');
            location.reload();
        } else {
            console.error('Error updating listing:', response.status, response.statusText);
            showAlert('danger', 'Failed to update listing. Please try again.');
        }
    } catch (error) {
        console.error('Request failed:', error);
        showAlert('danger', 'An error occurred while updating the listing.');
    }
}

function openEditModal(listing) {
    document.getElementById('title').value = listing.title || '';
    document.getElementById('description').value = listing.description || '';
    document.getElementById('media-url').value = listing.media && listing.media[0] ? listing.media[0].url : '';

    document.getElementById('update-listing').dataset.listingId = listing.id;

    editPromptModal.show();
}


document.getElementById('update-listing').addEventListener('click', function () {
    const listingId = this.dataset.listingId;
    editListing(listingId);
});

document.getElementById('delete-listing').addEventListener('click', async function() {
    const listingId = this.dataset.listingId;

    if (listingId) {
        await deleteListing(listingId);
        deletePromptModal.hide();
    } else {
        console.error('Listing ID not found for deletion');
    }
});

async function deleteListing(listingId) {
    try {
        const response = await fetch(`${apiUrl}/auction/listings/${listingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Noroff-API-Key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to delete listing: ${errorData.message || response.statusText}`);
        }

        if (response.status === 204) {
            location.reload();
        } else {
            const data = await response.json();
            location.reload();
        }
    } catch (error) {
        console.error('Request failed:', error);
    }
}

function showAlert(type, message) {
    const listingsContainer = document.getElementById('listings-container');
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert', `alert-${type}`, 'mt-3');
    alertDiv.setAttribute('role', 'alert');
    alertDiv.textContent = message;

    const existingAlerts = listingsContainer.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    listingsContainer.appendChild(alertDiv);
}

document.addEventListener("DOMContentLoaded", () => {
    updateAuthButtons();
    getProfiles();

    const logoutButton = document.getElementById('logout-button');

    logoutButton.addEventListener("click", function() {
        localStorage.removeItem('user');
        localStorage.removeItem('apiKey');
        window.location.href = "login.html";
    });

    const avatar = document.getElementById('avatar');
    avatar.addEventListener('click', function() {
        customPromptModal.show();
    });

    const updateProfileButton = document.getElementById('update-profile');
    updateProfileButton.addEventListener('click', function() {
        const bannerUrl = document.getElementById('banner-url').value.trim();
        const avatarUrl = document.getElementById('avatar-url').value.trim();
        const bio = document.getElementById('bio-text').value.trim();

        if (!bio) {
            alert('Bio cannot be empty.');
            return;
        }

        updateProfile(bio, avatarUrl, bannerUrl);
    });
});

function updateAuthButtons() {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
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
}

async function updateProfile(bio, avatarUrl, bannerUrl) {
    const userString = localStorage.getItem('user');
    if (!userString) {
        console.error('User data not found in localStorage.');
        showAlert('danger', 'Unauthorized access. Please log in to update your profile.');
        return;
    }

    const user = JSON.parse(userString);
    const accessToken = user.data.accessToken;
    const apiKey = localStorage.getItem('apiKey');
    const username = user.data.name;

    const url = `https://v2.api.noroff.dev/auction/profiles/${username}`;

    const body = {
        bio: bio,
        avatar: {
            url: avatarUrl,
            alt: ""
        },
        banner: {
            url: bannerUrl,
            alt: ""
        }
    };

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "X-Noroff-API-Key": apiKey,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const responseData = await response.json();
            showAlert('success', 'Profile updated successfully.');
            populateProfile(responseData.data);
            customPromptModal.hide();
        } else {
            console.error("Error updating profile:", response.status, response.statusText);
            showAlert('danger', 'Failed to update profile. Please try again.');
        }
    } catch (error) {
        console.error("Network error:", error);
        showAlert('danger', 'A network error occurred. Please try again.');
    }
}


