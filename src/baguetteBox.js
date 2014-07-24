/*!
 * baguetteBox.js
 * @author  feimosi
 * @version 0.2.1
 */

var baguetteBox = function(selector) {
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
                imagesMap[galleryIndex] = galleryElement.querySelectorAll('a');
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
        // Check if the overlay already exists, if yes return
        if(overlay)
           return;
        overlay = document.createElement('div');
        overlay = document.querySelector('body').appendChild(overlay);
        overlay.id = overlayID;
        // Create gallery slider element
        slider = document.createElement('div');
        slider = overlay.appendChild(slider);
        slider.id = sliderID;
        slider.style.left = '0%';
        // Create all necessary buttons
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

        bindEvents();
    }

    function bindEvents() {
        // When clicked on the overlay (outside displayed image) close it
        overlay.addEventListener('click', function(event) {
            if(event.target && event.target.nodeName !== "IMG")
                hideOverlay();
        }, false);
        // Add event listeners for next / previous buttons
        document.querySelector('#previousButton').addEventListener('click', function(event) {
            event.stopPropagation();
            showPreviousImage();
        }, false);
        document.querySelector('#nextButton').addEventListener('click', function(event) {
            event.stopPropagation();
            showNextImage();
        }, false);
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
        while (slider.firstChild) {
            slider.removeChild(slider.firstChild);
        }
        imagesArray = [];
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
        showImage(currentIndex);
        updateOffset();
        // Fade in overlay
        setTimeout(function() {
            overlay.className = 'visible';
        }, 10);
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

    function showImage(index) {
        if(index > imagesArray.length - 1)
            return;
        var imageContainer = imagesArray[index];
        imageElement = imagesMap[currentGallery][index];
        imageCaption = imageElement.dataset.caption;
        imageCaption = typeof imageCaption !== 'undefined' ? '<figcaption>' + imageCaption + '</figcaption>' : '';
        imageContainer.innerHTML = '<figure><img src="' + imageElement.getAttribute('href') + '">' + imageCaption + '</figure>';
    }

    function showNextImage() {
        if(currentIndex <= imagesArray.length - 2) {
            currentIndex++;
            updateOffset();
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
        } else {
            slider.className = 'bounceFromLeft';
            setTimeout(function() {
                slider.className = '';
            }, 400);
        }
    }

    function updateOffset() {
        slider.style.left = -currentIndex * 100 + '%';
        preload();
    }

    function preload() {
        if(currentIndex <= imagesArray.length - 2)
            showImage(currentIndex + 1);
        if(currentIndex >= 1)
            showImage(currentIndex - 1);
    }
};