let visitCount = 0;
let startTime = Date.now();
let roastElement = null;
let antiExcuseElement = null;
let statsElement = null;
let visitCountElement = null;
let timeElement = null;
let currentImageIndex = 0;
let filmTapeImage1 = null;
let filmTapeImage2 = null;
let imageTransitionInterval = null;
let filmReelBtn = null;
let useAntiExcuseNext = false; // Toggle to alternate APIs
let decorativeElements = []; // Track decorative elements for cleanup
let decorativeUpdateInterval = null; // Interval for updating decorative elements

// List of ALL images from the images folder - will cycle through all
const imageFiles = [
    '01C62905-64D3-46AD-ADE4-2EEAB4247FD5_1_105_c.jpeg',
    '060D538A-A5FE-4AFD-A2F7-C3653AD0304B_1_105_c.jpeg',
    '0FD9D167-0350-474E-939C-ACF9F5378C8B_1_102_o.jpeg',
    '1344830F-CDE1-44E8-BBC1-B68D61B19CE9_1_105_c.jpeg',
    '14A7F28A-15B7-4DF0-998E-D437DA264565_1_105_c.jpeg',
    '1D70FE98-8FE7-4D57-AAF0-C54E6898A6D5_1_105_c.jpeg',
    '2D314F70-5F22-4B59-B9E2-C3AFEEAABD0B_1_105_c.jpeg',
    '3EDB4354-B971-4D88-859A-CC99018EC959_1_105_c.jpeg',
    '4E40D46F-17E7-46B1-BB13-7BE33B4FF0A2_1_105_c.jpeg',
    '56BF349C-3BE9-4FDA-9C8F-E1D9DCD4D327_1_105_c.jpeg',
    '980C8BC0-E9C2-4952-A080-5187D3596A8D_1_105_c.jpeg',
    'BCC77FD1-16DB-4F62-A264-7C4062AA1E55_1_102_o.jpeg',
    'F04801D5-EF91-405D-83AC-89DCE47928D5_1_105_c.jpeg',
    'F5BAAC68-9D2C-499E-A08F-0A7CB4041A48_1_105_c.jpeg',
    'F988FB3B-C18B-4C6B-A2A5-C55EE8840DB7_1_102_o.jpeg'
];

function getImagePath(index) {
    return `images/${imageFiles[index]}`;
}

function getNextImageIndex() {
    currentImageIndex = (currentImageIndex + 1) % imageFiles.length;
    return currentImageIndex;
}

function loadImageToElement(imgElement, imageIndex) {
    const imagePath = getImagePath(imageIndex);
    imgElement.src = imagePath;
    return new Promise((resolve) => {
        if (imgElement.complete) {
            resolve();
        } else {
            imgElement.onload = () => resolve();
            imgElement.onerror = () => resolve(); // Continue even if image fails
        }
    });
}

function transitionToNextImage() {
    const nextIndex = getNextImageIndex();
    const activeImage = filmTapeImage1.classList.contains('active') ? filmTapeImage1 : filmTapeImage2;
    const nextImage = activeImage === filmTapeImage1 ? filmTapeImage2 : filmTapeImage1;
    
    // Load next image
    loadImageToElement(nextImage, nextIndex).then(() => {
        // Fade transition
        activeImage.classList.remove('active');
        nextImage.classList.add('active');
    });
}

function startFilmTapeSlideshow() {
    // Load first two images
    loadImageToElement(filmTapeImage1, 0);
    loadImageToElement(filmTapeImage2, 1);
    currentImageIndex = 1;
    
    // Start automatic transitions every 4 seconds (like movie tape playing)
    imageTransitionInterval = setInterval(transitionToNextImage, 4000);
}

// Initialize
function init() {
    roastElement = document.getElementById('roast');
    antiExcuseElement = document.getElementById('antiExcuse');
    statsElement = document.getElementById('stats');
    visitCountElement = document.getElementById('visit-count');
    timeElement = document.getElementById('time-on-page');
    
    // Initialize timecode display
    if (timeElement) {
        timeElement.textContent = '00:00:00';
    }
    filmTapeImage1 = document.getElementById('filmTapeImage1');
    filmTapeImage2 = document.getElementById('filmTapeImage2');
    
    // Load visit count
    const storedCount = localStorage.getItem('visitCount');
    visitCount = storedCount ? parseInt(storedCount) : 0;
    visitCount++;
    localStorage.setItem('visitCount', visitCount);
    
    // Visit count is now hidden - just showing REC indicator
    if (visitCountElement) {
        visitCountElement.textContent = '';
    }
    
    // Start background film tape slideshow
    startFilmTapeSlideshow();
    
    // Set up film reel button
    filmReelBtn = document.getElementById('newRoastBtn');
    if (filmReelBtn) {
        filmReelBtn.addEventListener('click', showRandomRoast);
        // Keyboard accessibility
        filmReelBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showRandomRoast();
            }
        });
    }
    
    // Show initial roast (after button setup)
    if (roastElement && antiExcuseElement) {
        showRandomRoast().catch(error => {
            console.error('Error showing initial roast:', error);
            // Show fallback content if everything fails
            if (roastElement) {
                roastElement.textContent = "Something went wrong, but you're still here procrastinating.";
                roastElement.style.opacity = '1';
            }
        });
    }
    
    // Update time on page
    updateTimeOnPage();
    setInterval(updateTimeOnPage, 1000);
}

async function fetchContent() {
    try {
        // Alternate between roast API and anti-excuse API
        const useAntiExcuse = useAntiExcuseNext;
        useAntiExcuseNext = !useAntiExcuseNext; // Toggle for next time
        
        const endpoint = useAntiExcuse ? '/api/anti-excuse' : '/api/roast';
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (useAntiExcuse) {
            // When using anti-excuse API, only return the anti-excuse (not the roast)
            return {
                roast: null,
                antiExcuse: data.antiExcuse || "Failed to generate anti-excuse. Try again."
            };
        } else {
            return {
                roast: data.roast || "Failed to generate roast. Try again.",
                antiExcuse: null
            };
        }
    } catch (error) {
        console.error('Error fetching content:', error);
        // Return fallback content that will definitely display
        return {
            roast: "The server is down, but you're still here procrastinating.",
            antiExcuse: null
        };
    }
}

async function showRandomRoast() {
    const isLoading = (roastElement.textContent === '' && antiExcuseElement.textContent === '') ||
                     filmReelBtn?.classList.contains('loading');
    
    // Cinematic fade out
    if (!isLoading) {
        // Clean up decorative elements
        decorativeElements.forEach(el => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        decorativeElements = [];
        
        // Clear update interval
        if (decorativeUpdateInterval) {
            clearInterval(decorativeUpdateInterval);
            decorativeUpdateInterval = null;
        }
        
        // Fade out current content
        roastElement.classList.add('fade-out');
        if (antiExcuseElement.textContent) {
            antiExcuseElement.classList.add('fade-out');
        }
        
        // Add film reel transition effect
        document.body.style.filter = 'brightness(0.2)';
        
        setTimeout(async () => {
            // Clear content
            roastElement.textContent = '';
            roastElement.classList.remove('fade-out');
            antiExcuseElement.textContent = '';
            antiExcuseElement.classList.remove('fade-out');
            roastElement.style.animation = 'none';
            antiExcuseElement.style.animation = 'none';
            
            // Show loading state on film reel
            if (filmReelBtn) {
                filmReelBtn.classList.add('loading');
            }
            
            // Restore brightness
            document.body.style.filter = '';
            
            setTimeout(() => {
                roastElement.style.animation = '';
                antiExcuseElement.style.animation = '';
            }, 10);
            
            // Fetch new content
            const content = await fetchContent();
            
            // Remove loading state from film reel
            if (filmReelBtn) {
                filmReelBtn.classList.remove('loading');
            }
            
            // Add cinematic delay before reveal
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Show only one message at a time
            if (content.antiExcuse) {
                roastElement.textContent = '';
                roastElement.style.opacity = '0';
                antiExcuseElement.textContent = content.antiExcuse;
                antiExcuseElement.style.opacity = '0';
                // Add subtle film jitter
                antiExcuseElement.classList.add('playing');
                setTimeout(() => antiExcuseElement.classList.remove('playing'), 2000);
            } else {
                roastElement.textContent = content.roast;
                roastElement.style.opacity = '0';
                antiExcuseElement.textContent = '';
                antiExcuseElement.style.opacity = '0';
                // Add subtle film jitter
                roastElement.classList.add('playing');
                setTimeout(() => roastElement.classList.remove('playing'), 2000);
            }
            
            // Trigger cinematic reveal animation
            roastElement.style.animation = 'none';
            antiExcuseElement.style.animation = 'none';
            // Force reflow to reset animation
            void roastElement.offsetHeight;
            void antiExcuseElement.offsetHeight;
            // Reapply animation to trigger reveal
            setTimeout(() => {
                roastElement.style.animation = '';
                roastElement.style.opacity = '';
                antiExcuseElement.style.animation = '';
                antiExcuseElement.style.opacity = '';
            }, 10);
            
            // Fallback: ensure content is visible after animation delay (0.5s) + animation duration (1.2s) = ~1.7s
            setTimeout(() => {
                if (roastElement.textContent && getComputedStyle(roastElement).opacity === '0') {
                    roastElement.style.opacity = '1';
                }
                if (antiExcuseElement.textContent && getComputedStyle(antiExcuseElement).opacity === '0') {
                    antiExcuseElement.style.opacity = '1';
                }
                
                // Create decorative elements after text is visible
                const activeElement = content.antiExcuse ? antiExcuseElement : roastElement;
                if (activeElement.textContent) {
                    setTimeout(() => {
                        createDecorativeElements(activeElement);
                    }, 100);
                }
            }, 2000);
        }, 600);
    } else {
        // First load - cinematic entrance
        roastElement.textContent = '';
        antiExcuseElement.textContent = '';
        
        // Show loading state on film reel
        if (filmReelBtn) {
            filmReelBtn.classList.add('loading');
        }
        
        // Fade in from black
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 1s ease-in';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
        
        const content = await fetchContent();
        
        // Add cinematic delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Remove loading state from film reel
        if (filmReelBtn) {
            filmReelBtn.classList.remove('loading');
        }
        
        // Show only one message at a time
        if (content.antiExcuse) {
            roastElement.textContent = '';
            roastElement.style.opacity = '0';
            antiExcuseElement.textContent = content.antiExcuse;
            antiExcuseElement.style.opacity = '0';
            antiExcuseElement.classList.add('playing');
            setTimeout(() => antiExcuseElement.classList.remove('playing'), 2000);
        } else {
            roastElement.textContent = content.roast;
            roastElement.style.opacity = '0';
            antiExcuseElement.textContent = '';
            antiExcuseElement.style.opacity = '0';
            roastElement.classList.add('playing');
            setTimeout(() => roastElement.classList.remove('playing'), 2000);
        }
        
        // Ensure animation triggers
        void roastElement.offsetHeight;
        void antiExcuseElement.offsetHeight;
        
        // Fallback: ensure content is visible after animation delay (0.5s) + animation duration (1.2s) = ~1.7s
        setTimeout(() => {
            if (roastElement.textContent && getComputedStyle(roastElement).opacity === '0') {
                roastElement.style.opacity = '1';
            }
            if (antiExcuseElement.textContent && getComputedStyle(antiExcuseElement).opacity === '0') {
                antiExcuseElement.style.opacity = '1';
            }
            
            // Create decorative elements after text is visible
            const activeElement = content.antiExcuse ? antiExcuseElement : roastElement;
            if (activeElement.textContent) {
                setTimeout(() => {
                    createDecorativeElements(activeElement);
                }, 100);
            }
        }, 2000);
    }
}

function updateTimeOnPage() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    // Format like camera timecode: HH:MM:SS
    if (timeElement) {
        timeElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// Create scrapbook-style decorative elements around text
function createDecorativeElements(targetElement) {
    // Clean up old decorative elements
    decorativeElements.forEach(el => {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });
    decorativeElements = [];
    
    // Clear any existing update interval
    if (decorativeUpdateInterval) {
        clearInterval(decorativeUpdateInterval);
        decorativeUpdateInterval = null;
    }
    
    if (!targetElement || !targetElement.textContent.trim()) {
        return;
    }
    
    const rect = targetElement.getBoundingClientRect();
    const container = targetElement.parentElement; // roast-container
    const containerRect = container.getBoundingClientRect();
    
    // Calculate relative position within container
    const relativeTop = rect.top - containerRect.top;
    const relativeLeft = rect.left - containerRect.left;
    const relativeWidth = rect.width;
    const relativeHeight = rect.height;
    
    // Number of decorative elements (random between 5-10)
    const numElements = Math.floor(Math.random() * 6) + 5;
    const colors = ['yellow', 'pink', 'blue', 'green'];
    const types = ['highlighter', 'circle', 'line', 'wave', 'dots'];
    
    for (let i = 0; i < numElements; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const element = document.createElement('div');
        element.className = `decorative-element decorative-${type}`;
        
        // Random position around the text - spread evenly with some randomness
        const baseAngle = (Math.PI * 2 * i) / numElements;
        const angle = baseAngle + (Math.random() - 0.5) * 0.8; // ±0.4 radians variation
        const distance = Math.random() * 80 + 30; // 30-110px from text edge
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;
        
        // Position relative to text
        let left, top, width, height;
        
        switch (type) {
            case 'highlighter':
                width = Math.random() * 80 + 60; // 60-140px
                height = 8;
                left = relativeLeft + relativeWidth / 2 + offsetX - width / 2;
                top = relativeTop + relativeHeight / 2 + offsetY;
                break;
                
            case 'circle':
                width = height = Math.random() * 40 + 30; // 30-70px
                left = relativeLeft + relativeWidth / 2 + offsetX - width / 2;
                top = relativeTop + relativeHeight / 2 + offsetY - height / 2;
                element.classList.add(color);
                break;
                
            case 'line':
                const lineLength = Math.random() * 100 + 50; // 50-150px
                const lineAngle = Math.random() * Math.PI * 2;
                width = Math.abs(Math.cos(lineAngle)) * lineLength + Math.abs(Math.sin(lineAngle)) * 2;
                height = Math.abs(Math.sin(lineAngle)) * lineLength + Math.abs(Math.cos(lineAngle)) * 2;
                left = relativeLeft + relativeWidth / 2 + offsetX - width / 2;
                top = relativeTop + relativeHeight / 2 + offsetY - height / 2;
                element.style.transform = `rotate(${lineAngle * 180 / Math.PI}deg)`;
                break;
                
            case 'wave':
                width = Math.random() * 100 + 60; // 60-160px
                height = 2;
                left = relativeLeft + relativeWidth / 2 + offsetX - width / 2;
                top = relativeTop + relativeHeight / 2 + offsetY;
                break;
                
            case 'dots':
                width = height = Math.random() * 50 + 40; // 40-90px
                left = relativeLeft + relativeWidth / 2 + offsetX - width / 2;
                top = relativeTop + relativeHeight / 2 + offsetY - height / 2;
                element.classList.add(color);
                break;
        }
        
        // Store initial position for relative movement
        element.dataset.initialLeft = left;
        element.dataset.initialTop = top;
        element.dataset.centerX = relativeLeft + relativeWidth / 2;
        element.dataset.centerY = relativeTop + relativeHeight / 2;
        
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        
        // Choose a random movement animation pattern
        const movementPatterns = [
            'floatOrbit1', 'floatOrbit2', 'floatOrbit3',
            'wanderPath1', 'wanderPath2',
            'spiralFloat', 'figureEight', 'pulseFloat'
        ];
        const pattern = movementPatterns[Math.floor(Math.random() * movementPatterns.length)];
        
        // Random animation duration (6-15 seconds for organic feel)
        const duration = 6 + Math.random() * 9;
        
        // Random animation delay for variety
        const animationDelay = Math.random() * 2;
        
        // Build combined animation string with movement + effects
        let animationParts = [`${pattern} ${duration}s ease-in-out infinite`];
        let delayParts = [`${animationDelay}s`];
        
        // Add pulsing effect randomly
        const hasPulse = Math.random() > 0.5;
        if (hasPulse) {
            const pulseDuration = 2 + Math.random() * 2;
            animationParts.push(`decorativePulse ${pulseDuration}s ease-in-out infinite`);
            delayParts.push(`${Math.random() * 1}s`);
        }
        
        // Add breathing effect randomly
        const hasBreathe = Math.random() > 0.6;
        if (hasBreathe) {
            const breatheDuration = 3 + Math.random() * 2;
            animationParts.push(`breathe ${breatheDuration}s ease-in-out infinite`);
            delayParts.push(`${Math.random() * 1}s`);
        }
        
        // Apply combined animations
        element.style.animation = animationParts.join(', ');
        element.style.animationDelay = delayParts.join(', ');
        
        // Store pattern for potential updates
        element.dataset.pattern = pattern;
        
        container.appendChild(element);
        decorativeElements.push(element);
    }
    
    // Start periodic updates to make elements feel more alive
    startDecorativeUpdates(targetElement);
}

// Periodically update decorative elements to make them feel alive
function startDecorativeUpdates(targetElement) {
    if (!targetElement || decorativeElements.length === 0) return;
    
    decorativeUpdateInterval = setInterval(() => {
        if (decorativeElements.length === 0) {
            clearInterval(decorativeUpdateInterval);
            decorativeUpdateInterval = null;
            return;
        }
        
        // Randomly change some elements' animation speeds or patterns
        decorativeElements.forEach((element, index) => {
            if (Math.random() > 0.7) { // 30% chance to update each element
                const movementPatterns = [
                    'floatOrbit1', 'floatOrbit2', 'floatOrbit3',
                    'wanderPath1', 'wanderPath2',
                    'spiralFloat', 'figureEight', 'pulseFloat'
                ];
                const newPattern = movementPatterns[Math.floor(Math.random() * movementPatterns.length)];
                const duration = 6 + Math.random() * 9;
                
                // Preserve existing pulse/breathing animations when changing movement pattern
                const currentAnimation = element.style.animation || '';
                const animationParts = [`${newPattern} ${duration}s ease-in-out infinite`];
                
                // Extract and preserve pulse animation if it exists
                if (currentAnimation.includes('decorativePulse')) {
                    const pulseMatch = currentAnimation.match(/decorativePulse\s+[\d.]+s\s+ease-in-out\s+infinite/);
                    if (pulseMatch) {
                        animationParts.push(pulseMatch[0]);
                    }
                }
                
                // Extract and preserve breathing animation if it exists
                if (currentAnimation.includes('breathe')) {
                    const breatheMatch = currentAnimation.match(/breathe\s+[\d.]+s\s+ease-in-out\s+infinite/);
                    if (breatheMatch) {
                        animationParts.push(breatheMatch[0]);
                    }
                }
                
                // Apply updated animation
                element.style.animation = animationParts.join(', ');
                element.dataset.pattern = newPattern;
            }
        });
    }, 3000 + Math.random() * 2000); // Update every 3-5 seconds
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

