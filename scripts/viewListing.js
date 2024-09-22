const apiUrl = "https://v2.api.noroff.dev";


/**
 * Extracts a query parameter value from the current URL by name.
 * @param {string} param The name of the parameter to extract.
 * @returns {string|null} The value of the parameter, or null if not found.
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const listingId = getQueryParam('id');

/**
 * Fetches the details of a listing with the given ID from the API.
 * @param {number|string} listingId The ID of the listing to fetch.
 * @throws {Error} If the request fails or the API returns an error.
 */
async function fetchListingDetails(listingId) {
    try {
        const response = await fetch(`${apiUrl}/auction/listings/${listingId}?_bids=true`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch listing details");
        }
        
        const data = await response.json();
        displayListingDetails(data.data);
        bidsPlaced(data.data.bids);
    } catch (error) {
        console.error("Error fetching listing details", error);
    }
}


/**
 * Displays the details of a listing in the page.
 * @param {object} listing The object containing the listing details.
 * @property {string} listing.title The title of the listing.
 * @property {string} listing.description The description of the listing.
 * @property {array} listing.media The media items of the listing.
 * @property {array} [listing.bids] The bids placed on the listing.
 * @property {number} listing.endsAt The timestamp when the listing ends.
 */
function displayListingDetails(listing) {
    const image = document.getElementById("image");
    const title = document.getElementById("title");
    const description = document.getElementById("description");
    const endsAt = document.getElementById("endsAt");
    const currentBid = document.getElementById("currentBid");

    image.src = listing.media[0].url;
    title.innerText = listing.title;
    description.innerText = listing.description;

    if (listing.bids && listing.bids.length > 0) {
    } else {
        currentBid.innerText = 'No bids yet.';
    }

    endsAt.innerText = `Ends at: ${new Date(listing.endsAt).toLocaleString()}`;
}
fetchListingDetails(listingId);

const bidAmountInput = document.getElementById('bidAmount');
const placeBidBtn = document.getElementById('placeBidBtn');
const bidMessage = document.getElementById('bidMessage');

placeBidBtn.addEventListener('click', async function(event) {
    event.preventDefault();

    const bidAmount = bidAmountInput.value.trim();
    const bidValue = parseFloat(bidAmount);

    if (bidAmount && bidValue > 0) {
        try {
            placeBidBtn.disabled = true;
            bidMessage.innerHTML = 'Placing your bid...';
            bidMessage.style.color = 'black';

            await placeBid(bidAmount);

            bidMessage.innerHTML = `Your bid of ${bidValue} credits has been placed successfully!`;
            bidMessage.style.color = 'green';

            fetchListingDetails(listingId);
        } catch (error) {
            bidMessage.innerHTML = `Error placing bid: ${error.message}`;
            bidMessage.style.color = 'red';
        } finally {
            placeBidBtn.disabled = false;
        }
    } else {
        bidMessage.innerHTML = 'Please enter a valid bid amount.';
        bidMessage.style.color = 'red';
    }
});

/**
 * Populates the bid list element with the given bids in reverse chronological order.
 * If the list of bids is not empty, it also highlights the highest bid.
 * @param {Bid[]} bids The list of bids to display.
 */
function bidsPlaced(bids) {
    const bidList = document.getElementById('bidList');

    bids.reverse();

    if (bids.length > 0) {
        const highestBid = bids[0];

        const highestListItem = document.createElement('li');
        highestListItem.classList.add('list-group-item', 'highest-bid');

        const highestBidAmount = document.createElement('h5');
        highestBidAmount.textContent = `Highest Bid Amount: ${highestBid.amount}`;
        highestBidAmount.classList.add('mb-1');

        const highestBidderName = document.createElement('p');
        highestBidderName.textContent = `Bidder: ${highestBid.bidder.name}`;
        highestBidderName.classList.add('mb-0');

        highestListItem.appendChild(highestBidAmount);
        highestListItem.appendChild(highestBidderName);

        bidList.appendChild(highestListItem);

        const restBids = bids.slice(1);

        restBids.forEach(element => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');

            const bidAmount = document.createElement('h5');
            bidAmount.textContent = `Bid Amount: ${element.amount}`;
            bidAmount.classList.add('mb-1');

            const bidderName = document.createElement('p');
            bidderName.textContent = `Bidder: ${element.bidder.name}`;
            bidderName.classList.add('mb-0');

            listItem.appendChild(bidAmount);
            listItem.appendChild(bidderName);

            bidList.appendChild(listItem);
        });
    }
}

/**
 * Places a bid on the listing with the given ID.
 * @param {string} bidAmount The amount of the bid in credits.
 * @throws {Error} If the request fails or the API returns an error.
 */

async function placeBid(bidAmount) {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const token = user ? `Bearer ${user.data.accessToken}` : null;
    const apiKey = localStorage.getItem('apiKey');

    if (!token || !apiKey) {
        throw new Error('You have to be logged in to place a bid.');
    }

    const url = `${apiUrl}/auction/listings/${listingId}/bids`;

    const payload = {
        amount: parseFloat(bidAmount)
    };

    const settings = {
        method: 'POST',
        headers: {
            "Authorization": token,
            "X-Noroff-API-Key": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    };

    try {
        const response = await fetch(url, settings);
        
        if (!response.ok) {
            let errorMessage = 'Failed to place bid.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        setTimeout(() => {
            location.reload();
        }, 1500);
        return data;
    } catch (error) {
        console.error("Error placing bid:", error);
        throw error;
    }
}


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

updateAuthButtons();
