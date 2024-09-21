const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

const sortByDateButton = document.getElementById('SortByDateButton');
const sortByUpdatedButton = document.getElementById('SortByUpdatedButton');
const HighestBidButton = document.getElementById('HighestBidButton');
const LowestBidButton = document.getElementById('LowestBidButton');
const sortByEndsAtButton = document.getElementById('SortByEndsAtButton');




/**
 * Filters the listings by the given query string and displays the filtered listings.
 * The filter is case-insensitive and matches any part of the title.
 * @param {string} query The query string to filter by.
 */

function searchListings(query) {
    const filteredListings = listingsData.filter(listing => 
        listing.title.toLowerCase().includes(query.toLowerCase())
    );
    displayListings(filteredListings);
}
searchButton.addEventListener('click', function() {
    const query = searchInput.value.trim();
    searchListings(query);
});

searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const query = searchInput.value.trim();
        searchListings(query);
    }
});





HighestBidButton.addEventListener('click', function() {
    sortbyHighestBids();
});

LowestBidButton.addEventListener('click', function() {
    sortbyLowestBids();
});

sortByDateButton.addEventListener('click', function() {
    sortByPublishedDate();
});

sortByUpdatedButton.addEventListener('click', function() {
    sortByUpdatedDate();
});

sortByEndsAtButton.addEventListener('click', function() {
    sortByEndsAt();
});




/** getHighestBid(bids)
 * Finds the highest bid amount from a list of bids.
 * @param {Bid[]} bids A list of bids.
 * @returns {number|string} The highest bid amount, or "No bids yet" if the list is empty.
 */


function getHighestBid(bids) {
    if (!bids || bids.length === 0) return "No bids yet";
    const amounts = bids.map(bid => bid.amount);
    const highest = Math.max(...amounts);
    return highest;
}

/** sortbyHighestBids()
 * Sorts the listings by highest bid in descending order (highest bid first)
 * and displays the sorted list of listings.
 */

function sortbyHighestBids() {
    const filteredListings = listingsData.filter(listing => listing.bids && listing.bids.length > 0);
    const sortedListings = filteredListings.sort((a, b) => {
        const highestBidA = getHighestBid(a.bids);
        const highestBidB = getHighestBid(b.bids);
        
        return highestBidB - highestBidA;
    });

    displayListings(sortedListings);
}

/** getLowestBid(bids)
 * Finds the lowest bid amount from a list of bids.
 * @param {Bid[]} bids A list of bids.
 * @returns {number|string} The lowest bid amount, or "No bids yet" if the list is empty.
 */

function getLowestBid(bids) {
    if (!bids || bids.length === 0) return "No bids yet";
    const amounts = bids.map(bid => bid.amount);
    const lowest = Math.min(...amounts);
    return lowest;
}

/** sortbyLowestBids()
 * Sorts the listings by lowest bid in ascending order (lowest bid first)
 * and displays the sorted list of listings.
 */

function sortbyLowestBids() {
    const filteredListings = listingsData.filter(listing => listing.bids && listing.bids.length > 0);
    const sortedListings = filteredListings.sort((a, b) => {
        const highestBidA = getHighestBid(a.bids);
        const highestBidB = getHighestBid(b.bids);

        return highestBidA - highestBidB;
    });

    displayListings(sortedListings);
}

/** sortByPublishedDate()
 * Sorts the listings by date published in descending order (newest first)
 * and displays the sorted list of listings.
 */

function sortByPublishedDate() {
    const sortedListings = listingsData.sort((a, b) => {
        const dateA = new Date(a.created);
        const dateB = new Date(b.created);

        return dateB - dateA;
    });

    displayListings(sortedListings);
}

/** sortByUpdatedDate()
 * Sorts the listings by last updated date in descending order (newest first)
 * and displays the sorted list of listings.
 */

function sortByUpdatedDate() {
    const sortedListings = listingsData.sort((a, b) => {
        const dateA = new Date(a.updated);
        const dateB = new Date(b.updated);

        return dateB - dateA;
    });

    displayListings(sortedListings);
}

/** sortByEndsAt()
 * Sorts the listings by time remaining in ascending order (shortest time remaining first)
 * and displays the sorted list of listings.
 */

function sortByEndsAt() {
    const sortedListings = listingsData.sort((a, b) => {
        const dateA = new Date(a.endsAt);
        const dateB = new Date(b.endsAt);

        return dateA - dateB;
    });

    displayListings(sortedListings);
}