/*!
 * baguetteBox.js
 * @author  feimosi
 * @version 0.3.0
 */

var baguetteBox = function(selector, userOptions) {
    // Buttons SVG shapes
    var leftArrow = '<svg width="45" height="60" xmlns="http://www.w3.org/2000/svg" version="1.1">' +
            '<polyline points="10 30 30 10 50 30" stroke="rgba(255,255,255,0.5)" stroke-width="5"' +
              'stroke-linecap="butt" fill="none" stroke-linejoin="round" transform="translate(0, 60) rotate(-90)"/>' +
            '</svg>',
        rightArrow = '<svg width="45" height="60" xmlns="http://www.w3.org/2000/svg" version="1.1">' +
            '<polyline points="10 30 30 10 50 30" stroke="rgba(255,255,255,0.5)" stroke-width="5"' +
              'stroke-linecap="butt" fill="none" stroke-linejoin="round" transform="translate(45) rotate(90)"/>' +
            '</svg>',
        closeX = '<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" version="1.1">' +
            '<g stroke="rgb(187, 187, 187)" stroke-width="4">' +
            '<line x1="5" y1="5" x2="25" y2="25"/>' +
            '<line x1="5" y1="25" x2="25" y2="5"/>' +
            '</g></svg>';
    var overlayID = 'baguetteBoxOverlay';
    var sliderID = 'baguetteBoxSlider';
    var options = {
        captions: true,
        preload: 2,
        buttons: true
    };
    // Update options object
    for(var item in userOptions) {
        if(options.hasOwnProperty(item))
            options[item] = userOptions[item];
    }
    // DOM Elements references
    var overlay, slider, previousButton, nextButton, closeButton;
    // Image index inside the slider
    var currentIndex = 0, currentGallery = -1;
    // Array of all active galleries
    var galleries = document.querySelectorAll(selector);
    // Map of galleries images
    var imagesMap = {};
    // Array containing temporary images elements
    var imagesArray = [];

    init();

    function init() {
        buildOverlay();
        // For each gallery bind a click event to every image inside it
        [].forEach.call(
            galleries,
            function (galleryElement, galleryIndex) {
                galleryElement.dataset.baguetteBoxId = galleryIndex;
                imagesMap[galleryIndex] = galleryElement.getElementsByTagName('a');
                [].forEach.call(
                    imagesMap[galleryIndex],
                    function (imageElement, imageIndex) {
                        imageElement.addEventListener('click', function(event) {
                            event.preventDefault();
                            prepareOverlay(galleryIndex);
                            showOverlay(imageIndex);
                        }, false);
                    }
                );
            }
        );
    }

    function buildOverlay() {
        overlay = document.getElementById(overlayID);
        // Check if the overlay already exists
        if(overlay) {
            slider = document.getElementById(sliderID);
            previousButton = document.getElementById('previousButton');
            nextButton = document.getElementById('nextButton');
            closeButton = document.getElementById('closeButton');
            return;
        }
        // Create overlay element
        overlay = document.createElement('div');
        overlay = document.getElementsByTagName('body')[0].appendChild(overlay);
        overlay.id = overlayID;
        // Create gallery slider element
        slider = document.createElement('div');
        slider = overlay.appendChild(slider);
        slider.id = sliderID;
        slider.style.left = '0%';
        // Create all necessary buttons
        if(options.buttons) {
            previousButton = document.createElement('button');
            previousButton.id = 'previousButton';
            previousButton.innerHTML = leftArrow;
            previousButton = overlay.appendChild(previousButton);

            nextButton = document.createElement('button');
            nextButton.id = 'nextButton';
            nextButton.innerHTML = rightArrow;
            nextButton = overlay.appendChild(nextButton);

            closeButton = document.createElement('button');
            closeButton.id = 'closeButton';
            closeButton.innerHTML = closeX;
            closeButton = overlay.appendChild(closeButton);

            previousButton.className = nextButton.className = closeButton.className = 'baguetteBoxButton';
        }

        bindEvents();
    }

    function bindEvents() {
        // When clicked on the overlay (outside displayed image) close it
        overlay.addEventListener('click', function(event) {
            if(event.target && event.target.nodeName !== "IMG")
                hideOverlay();
        }, false);
        // Add event listeners for next / previous buttons
        if(options.buttons) {
            document.getElementById('previousButton').addEventListener('click', function(event) {
                event.stopPropagation();
                showPreviousImage();
            }, false);
            document.getElementById('nextButton').addEventListener('click', function(event) {
                event.stopPropagation();
                showNextImage();
            }, false);
        }
        // Activate keyboard shortcuts
        window.addEventListener('keydown', function(event) {
            switch(event.keyCode) {
                case 37: // Left arrow
                    showPreviousImage();
                    break;
                case 39: // Right arrow
                    showNextImage();
                    break;
                case 27: // Esc
                    hideOverlay();
                    break;
            }
        }, false);
    }

    function prepareOverlay(galleryIndex) {
        if(currentGallery === galleryIndex)
            return;
        currentGallery = galleryIndex;
        // Empty slider of previous contents
        while(slider.firstChild) {
            slider.removeChild(slider.firstChild);
        }
        imagesArray.length = 0;
        // Prepare and append images containers
        for(var i = 0; i < imagesMap[galleryIndex].length; i++) {
            imagesArray.push(returnImageContainer());
            slider.appendChild(imagesArray[i]);
        }
    }

    function returnImageContainer() {
        var fullImage = document.createElement('div');
        fullImage.className = 'fullImage';
        return fullImage;
    }

    function showOverlay(index) {
        // Return if overlay is already visible
        if(overlay.style.display === 'block')
            return;
        // Show proper image and set current index to a new value
        overlay.style.display = 'block';
        currentIndex = index;
        loadImage(currentIndex, function() {
            preloadNext(currentIndex);
            preloadPrev(currentIndex);
        });
        updateOffset();
        // Fade in overlay
        setTimeout(function() {
            overlay.className = 'visible';
        }, 100);
    }

    function hideOverlay() {
        // Return if overlay is already hidden
        if(overlay.style.display === 'none')
            return;
        // Fade out and hide the overlay
        overlay.className = '';
        setTimeout(function() {
            overlay.style.display = 'none';
        }, 500);
    }

    function loadImage(index, callback) {
        var imageContainer = imagesArray[index];
        // If index is invalid return
        if(typeof imageContainer === 'undefined')
            return;
        // If image is already loaded run callback and return
        if(typeof imageContainer.getElementsByTagName('img')[0] !== 'undefined') {
            callback();
            return;
        }
        imageElement = imagesMap[currentGallery][index];
        imageCaption = imageElement.dataset.caption;
        imageCaption = typeof imageCaption !== 'undefined' ? '<figcaption>' + imageCaption + '</figcaption>' : '';
        // Prepare image container elements
        var figure = document.createElement('figure');
        var image = document.createElement('img');
        var figcaption = document.createElement('figcaption');
        imageContainer.appendChild(figure);
        image.setAttribute('src', imageElement.getAttribute('href'));
        image.onload = function() {
            callback();
        };
        figure.appendChild(image);
        if(options.captions) {
            figcaption.innerHTML = imageCaption;
            figure.appendChild(figcaption);
        }
    }

    function showNextImage() {
        if(currentIndex <= imagesArray.length - 2) {
            currentIndex++;
            updateOffset();
            preloadNext(currentIndex);
        } else {
            slider.className = 'bounceFromRight';
            setTimeout(function() {
                slider.className = '';
            }, 400);
        }
    }

    function showPreviousImage() {
        if(currentIndex >= 1) {
            currentIndex--;
            updateOffset();
            preloadPrev(currentIndex);
        } else {
            slider.className = 'bounceFromLeft';
            setTimeout(function() {
                slider.className = '';
            }, 400);
        }
    }

    function updateOffset() {
        slider.style.left = -currentIndex * 100 + '%';
    }

    function preloadNext(index) {
        if(Math.abs(currentIndex - index) >= options.preload)
            return;
        loadImage(index + 1, function() { preloadNext(index + 1); });
    }

    function preloadPrev(index) {
        if(Math.abs(currentIndex - index) >= options.preload)
            return;
        loadImage(index - 1, function() { preloadPrev(index - 1); });
    }
};