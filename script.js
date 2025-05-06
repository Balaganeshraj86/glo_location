const stores = [
    {name:"Glomark Wattala", id: "store-wattala", lat:6.98918, lon:79.89167, link:"https://pickme-app-sl.onelink.me/Fore/dnioisdm"},
    {name:"Glomark Kandy", id: "store-kandy", lat:7.2906, lon:80.6336, link:"https://pickme-app-sl.onelink.me/Fore/zqrsl2gt"},
    {name:"Glomark Kandana", id: "store-kandana", lat:7.045868, lon:79.887901, link:"https://pickme-app-sl.onelink.me/Fore/05mrj3b8"},
    {name:"Glomark Thalawathugoda", id: "store-thalawathugoda", lat:6.872978, lon:79.94135, link:"https://pickme-app-sl.onelink.me/Fore/oid1ckdn"},
    {name:"Glomark Negombo", id: "store-negombo", lat:7.2083, lon:79.8358, link:"https://pickme-app-sl.onelink.me/Fore/ebhcbuwq"},
    {name:"Glomark Kurunegala", id: "store-kurunegala", lat:7.4839, lon:80.3683, link:"https://pickme-app-sl.onelink.me/Fore/wtnte2nz"},
    {name:"Glomark Kottawa", id: "store-kottawa", lat:6.843014, lon:79.965531, link:"https://pickme-app-sl.onelink.me/Fore/8plnm8n4"},
    {name:"Glomark Mount Lavinia", id: "store-mtlavinia", lat:6.83565, lon:79.86574, link:"https://pickme-app-sl.onelink.me/Fore/u4aoucpq"},
    {name:"Glomark Nawala", id: "store-nawala", lat:6.89778, lon:79.88531, link:"https://pickme-app-sl.onelink.me/Fore/1jzq2q5z"}
];

const MAX_DISTANCE = 5; // Maximum radius in kilometers
let nearbyStores = [];
let nearestStore = null;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Check location on page load
window.addEventListener('load', checkLocation);

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Force refresh the location check to ensure accurate results
function refreshLocation() {
    window.location.reload();
}

function checkLocation() {
    const loader = document.getElementById('loader');
    const locationMessage = document.getElementById('location-message');
    loader.style.display = 'flex';
    locationMessage.style.display = 'block';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            
            nearbyStores = [];
            let minDist = Infinity;
            
            // Find all stores within radius and the nearest one
            for (let store of stores) {
                let dist = getDistance(userLat, userLon, store.lat, store.lon);
                
                // Check if within radius
                if (dist <= MAX_DISTANCE) {
                    nearbyStores.push({
                        name: store.name,
                        id: store.id,
                        distance: dist,
                        link: store.link
                    });
                }
                
                // Check if nearest
                if (dist < minDist) {
                    minDist = dist;
                    nearestStore = {
                        name: store.name,
                        id: store.id,
                        distance: dist,
                        link: store.link
                    };
                }
            }
            
            loader.style.display = 'none';
            
            // Prepare UI based on location results
            if (nearbyStores.length > 0) {
                document.getElementById('location-status').innerHTML = 
                    `Found <span class="highlight-text">${nearbyStores.length}</span> stores within 5km of your location`;
            } else if (nearestStore) {
                document.getElementById('location-status').innerHTML = 
                    `Nearest store is <span class="highlight-text">${nearestStore.name}</span> (${nearestStore.distance.toFixed(1)}km away)`;
            } else {
                document.getElementById('location-status').innerHTML = 
                    `Could not find nearby stores. Please select manually.`;
            }
            
            // Highlight stores and show popup
            highlightStores();
            
            // Auto-select nearest store on mobile
            if (isMobile && nearestStore && nearestStore.distance <= MAX_DISTANCE) {
                // Show nearest store indicator and wait a bit longer before redirecting
                const nearestStoreMsg = document.createElement('div');
                nearestStoreMsg.style.position = 'fixed';
                nearestStoreMsg.style.bottom = '20px';
                nearestStoreMsg.style.left = '0';
                nearestStoreMsg.style.right = '0';
                nearestStoreMsg.style.backgroundColor = '#00FF7F';
                nearestStoreMsg.style.color = '#001F3F';
                nearestStoreMsg.style.padding = '15px';
                nearestStoreMsg.style.textAlign = 'center';
                nearestStoreMsg.style.fontWeight = 'bold';
                nearestStoreMsg.style.zIndex = '9999';
                nearestStoreMsg.style.borderRadius = '10px';
                nearestStoreMsg.style.margin = '0 20px';
                nearestStoreMsg.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
                
                nearestStoreMsg.innerHTML = `
                    Redirecting to <strong>${nearestStore.name}</strong> in 3 seconds<br>
                    <span style="font-size:14px">Your nearest store (${nearestStore.distance.toFixed(1)}km away)</span>
                `;
                document.body.appendChild(nearestStoreMsg);
                
                // Short delay to allow UI to update first
                setTimeout(() => {
                    redirectToStore(nearestStore.link);
                }, 3000);
            } else {
                // Show popup with stores
                if (nearbyStores.length > 0) {
                    showNearbyStoresPopup();
                }
            }
            
        }, function(error) {
            loader.style.display = 'none';
            locationMessage.style.display = 'none';
            console.log("Location access denied or error:", error);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    } else {
        loader.style.display = 'none';
        locationMessage.style.display = 'none';
        console.log("Geolocation is not supported by this browser.");
    }
}

function highlightStores() {
    // Reset all buttons first
    for (let store of stores) {
        const element = document.getElementById(store.id);
        if (element) {
            element.querySelector('button').classList.remove('nearby-store');
            element.querySelector('button').classList.remove('nearest-store');
        }
    }
    
    // Highlight nearby stores first
    for (let store of nearbyStores) {
        const element = document.getElementById(store.id);
        if (element) {
            element.querySelector('button').classList.add('nearby-store');
        }
    }
    
    // Special highlight for the nearest store (must be done after nearby stores to ensure it takes precedence)
    if (nearestStore) {
        const element = document.getElementById(nearestStore.id);
        if (element) {
            // Remove the nearby-store class to avoid any conflicts
            element.querySelector('button').classList.remove('nearby-store');
            // Add the nearest-store class
            element.querySelector('button').classList.add('nearest-store');
            
            // For mobile, make sure it's visible by scrolling to it
            if (isMobile) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        }
    }
    
    // Update nearby stores count badge
    const countBadge = document.getElementById('nearby-stores-count');
    if (nearbyStores.length > 0) {
        countBadge.textContent = nearbyStores.length;
        countBadge.style.display = 'flex';
        countBadge.onclick = showNearbyStoresPopup;
    } else {
        countBadge.style.display = 'none';
    }
}

function showNearbyStoresPopup() {
    const popup = document.getElementById('nearby-popup');
    const storesList = document.getElementById('nearby-stores-list');
    
    // Clear previous list
    storesList.innerHTML = '';
    
    // Sort by distance
    nearbyStores.sort((a, b) => a.distance - b.distance);
    
    // Populate list
    for (let store of nearbyStores) {
        const li = document.createElement('li');
        if (nearestStore && store.id === nearestStore.id) {
            li.classList.add('nearest');
        }
        
        li.innerHTML = `
            <div>${store.name}</div>
            <div class="popup-distance">${store.distance.toFixed(1)} km away${nearestStore && store.id === nearestStore.id ? ' · Nearest Store' : ''}</div>
        `;
        li.onclick = function() {
            redirectToStore(store.link);
        };
        li.style.cursor = 'pointer';
        storesList.appendChild(li);
    }
    
    popup.style.display = 'block';
}

function redirectToStore(link) {
    // Try to open in PickMe app first on mobile devices
    const userAgent = navigator.userAgent || navigator.vendor;
    if (/android/i.test(userAgent)) {
        try {
            window.location.href = 'intent://pickme.lk/#Intent;scheme=https;package=com.pickme.driver;end;';
            // Fallback to web link after a short timeout
            setTimeout(function() {
                window.location.href = link;
            }, 1000);
        } catch(e) {
            window.location.href = link;
        }
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
        try {
            window.location.href = 'pickme://';
            // Fallback to web link after a short timeout
            setTimeout(function() {
                window.location.href = link;
            }, 1000);
        } catch(e) {
            window.location.href = link;
        }
    } else {
        window.location.href = link;
    }
}

function closePopup() {
    document.getElementById('nearby-popup').style.display = 'none';
}
