let visitCount = 0;
let startTime = Date.now();
let roastElement = null;
let statsElement = null;
let visitCountElement = null;
let timeElement = null;

// Initialize
function init() {
    roastElement = document.getElementById('roast');
    statsElement = document.getElementById('stats');
    visitCountElement = document.getElementById('visit-count');
    timeElement = document.getElementById('time-on-page');
    
    // Load visit count
    const storedCount = localStorage.getItem('visitCount');
    visitCount = storedCount ? parseInt(storedCount) : 0;
    visitCount++;
    localStorage.setItem('visitCount', visitCount);
    
    // Display visit count
    if (visitCount > 1) {
        visitCountElement.textContent = `Visit #${visitCount} - Still here?`;
    } else {
        visitCountElement.textContent = '';
    }
    
    // Show initial roast
    showRandomRoast();
    
    // Set up button
    document.getElementById('newRoastBtn').addEventListener('click', showRandomRoast);
    
    // Update time on page
    updateTimeOnPage();
    setInterval(updateTimeOnPage, 1000);
}

async function fetchRoast() {
    try {
        const response = await fetch('/api/roast');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.roast || "Failed to generate roast. Try again.";
    } catch (error) {
        console.error('Error fetching roast:', error);
        return "The server is down, but you're still here procrastinating.";
    }
}

async function showRandomRoast() {
    // Fade out current roast
    if (roastElement.textContent !== 'Loading your reality check...') {
        roastElement.classList.add('fade-out');
        
        setTimeout(async () => {
            // Show loading state
            roastElement.textContent = 'Generating your reality check...';
            roastElement.classList.remove('fade-out');
            roastElement.style.animation = 'none';
            setTimeout(() => {
                roastElement.style.animation = '';
            }, 10);
            
            // Fetch new roast
            const newRoast = await fetchRoast();
            roastElement.textContent = newRoast;
            
            // Trigger fade-in animation
            roastElement.style.animation = 'none';
            setTimeout(() => {
                roastElement.style.animation = '';
            }, 10);
        }, 400);
    } else {
        // First load
        roastElement.textContent = 'Generating your reality check...';
        const newRoast = await fetchRoast();
        roastElement.textContent = newRoast;
    }
}

function updateTimeOnPage() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    if (minutes > 0 || seconds > 30) {
        timeElement.textContent = `${minutes}m ${seconds}s wasted`;
    } else {
        timeElement.textContent = '';
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

