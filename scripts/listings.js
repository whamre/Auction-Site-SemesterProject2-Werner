/**
 * Fetches the list of active listings from the API and calls displayListings
 * when the data is received.
 */
function fetchListings() {
    fetch(`${apiUrl}/auction/listings?_bids=true&_active=true`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch listings");
            }
            return response.json();
        })
        .then(data => {
            listingsData = data.data;
            displayListings(listingsData);

        })
        .catch(error => {
            console.error("Error", error);
        });
}

/**
 * Displays the given list of listings in the #listings element.
 * If a sort function is provided, the listings are sorted before being displayed.
 * @param {Listing[]} listings The list of listings to display.
 * @param {Function} [sort] A function to sort the listings. If not provided, the listings
 * are not sorted.
 */
function displayListings(listings, sort = null) {
    const listingsContainer = document.getElementById("listings");
    listingsContainer.innerHTML = '';

    if (sort) {
        listings.sort(sort);
    }

    listings.forEach(listing => {
        if (!listing.media || listing.media.length === 0 || !listing.media[0].url) {
            return;
        }
    
        const listingElement = document.createElement("div");
        listingElement.classList.add("col-md-3", "mb-4");
    
        const highestBidAmount = getHighestBid(listing.bids);
        const fullDescription = listing.description || "";
        const shortDescription = fullDescription.length > 40 ? fullDescription.slice(0, 40) + "..." : fullDescription;
    
        const endsAtDate = new Date(listing.endsAt);
        const now = new Date();
        const timeRemainingMs = endsAtDate - now;
    
        let timeRemainingText;
    
        if (timeRemainingMs <= 0) {
            timeRemainingText = "Auction ended";
        } else {
            const daysRemaining = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
            const hoursRemaining = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutesRemaining = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
            timeRemainingText = `${daysRemaining}d ${hoursRemaining}h ${minutesRemaining}m `;
        }
    
        listingElement.innerHTML = `
        <div class="card">
            <img src="${listing.media[0].url}" class="card-img-top" alt="${listing.media[0].alt || listing.title}">
            <div class="card-body">
                <h5 class="card-title">${listing.title}</h5>
                <p class="card-text" id="desc-${listing.id}">
                    ${shortDescription}
                </p>
                <div id="button-container-${listing.id}"></div>
            </div>
            <div class="card-footer text-center">
                <p class="card-text"><strong>Time Remaining:</strong> ${timeRemainingText}</p>
                <p class="card-text"><strong>Highest Bid:</strong> ${highestBidAmount !== "No bids yet" ? highestBidAmount + " credits" : "No bids yet"}</p>
                <a href="listing.html?id=${listing.id}" class="btn btn-secondary">View Details</a>
            </div>
        </div>
        `;
    
        listingsContainer.appendChild(listingElement);
    
        if (fullDescription.length > 40) {
            const buttonContainer = document.getElementById(`button-container-${listing.id}`);
            const viewMoreButton = document.createElement("button");
            viewMoreButton.classList.add("btn", "btn-link");
            viewMoreButton.textContent = "View More";
            viewMoreButton.dataset.expanded = "false";  // Initialize state
            buttonContainer.appendChild(viewMoreButton);
    
            const descriptionElement = document.getElementById(`desc-${listing.id}`);
    
            viewMoreButton.addEventListener('click', function() {
                if (this.dataset.expanded === "false") {
                    descriptionElement.textContent = fullDescription;
                    this.textContent = "View Less";
                    this.dataset.expanded = "true";
                } else {
                    descriptionElement.textContent = shortDescription;
                    this.textContent = "View More";
                    this.dataset.expanded = "false";
                }
            });
        }
    });
}

fetchListings();