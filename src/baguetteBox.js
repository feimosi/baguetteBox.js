/*!
 * baguetteBox.js
 * @author  feimosi
 * @version 0.5.0
 * @url https://github.com/feimosi/baguetteBox.js
 */

var baguetteBox = (function() {
    // Buttons SVG shapes
    var leftArrow = '<svg width="40" height="60" xmlns="http://www.w3.org/2000/svg" version="1.1">' +
            '<polyline points="30 10 10 30 30 50" stroke="rgba(255,255,255,0.5)" stroke-width="4"' +
              'stroke-linecap="butt" fill="none" stroke-linejoin="round">&lt;</polyline>' +
            '</svg>',
        rightArrow = '<svg width="40" height="60" xmlns="http://www.w3.org/2000/svg" version="1.1">' +
            '<polyline points="10 10 30 30 10 50" stroke="rgba(255,255,255,0.5)" stroke-width="4"' +
              'stroke-linecap="butt" fill="none" stroke-linejoin="round">&gt;</polyline>' +
            '</svg>',
        closeX = '<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" version="1.1">' +
            '<g stroke="rgb(160, 160, 160)" stroke-width="4">' +
            '<line x1="5" y1="5" x2="25" y2="25"/>' +
            '<line x1="5" y1="25" x2="25" y2="5"/>' +
            'X</g></svg>';
    var overlayID = 'baguetteBox-overlay';
    var sliderID = 'baguetteBox-slider';
    // Global options and their defaults objects
    var options = {}, defaults = {
        captions: true,
        buttons: 'auto',
        async: false,
        preload: 2,
        animation: 'slideIn'
    };
    // DOM Elements references
    var overlay, slider, previousButton, nextButton, closeButton;
    // Image index inside the slider and currently displayed gallery
    var currentIndex = 0, currentGallery = -1;
    // Touch event start position (for slide gesture)
    var touchStartX;
    // If set to true ignore touch events because animation was already fired
    var touchFlag = false;
    // Array of all used galleries DOM elements
    var galleries = [];
    // 2D array of galleries and images inside them
    var imagesMap = [];
    // Array containing temporary images DOM elements
    var imagesArray = [];

    function run(selector, userOptions) {
        buildOverlay();
        // For each gallery bind a click event to every image inside it
        galleries = document.querySelectorAll(selector);
        [].forEach.call(
            galleries,
            function (galleryElement, galleryIndex) {
                var galleryID = imagesMap.length;
                imagesMap.push(galleryElement.getElementsByTagName('a'));
                imagesMap[galleryID].options = userOptions;
                [].forEach.call(
                    imagesMap[galleryID],
                    function (imageElement, imageIndex) {
                        bind(imageElement, 'click', function(event) {
                            event.preventDefault();
                            prepareOverlay(galleryID);
                            showOverlay(imageIndex);
                        });
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
            previousButton = document.getElementById('previous-button');
            nextButton = document.getElementById('next-button');
            closeButton = document.getElementById('close-button');
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
        previousButton = document.createElement('button');
        previousButton.id = 'previous-button';
        previousButton.innerHTML = leftArrow;
        previousButton = overlay.appendChild(previousButton);

        nextButton = document.createElement('button');
        nextButton.id = 'next-button';
        nextButton.innerHTML = rightArrow;
        nextButton = overlay.appendChild(nextButton);

        closeButton = document.createElement('button');
        closeButton.id = 'close-button';
        closeButton.innerHTML = closeX;
        closeButton = overlay.appendChild(closeButton);

        previousButton.className = nextButton.className = closeButton.className = 'baguetteBox-button';

        bindEvents();
    }

    function bindEvents() {
        // When clicked on the overlay (outside displayed image) close it
        bind(overlay, 'click', function(event) {
            if(event.target && event.target.nodeName !== "IMG")
                hideOverlay();
        });
        // Add event listeners for buttons
        bind(document.getElementById('previous-button'), 'click', function(event) {
            event.stopPropagation();
            showPreviousImage();
        });
        bind(document.getElementById('next-button'), 'click', function(event) {
            event.stopPropagation();
            showNextImage();
        });
        bind(document.getElementById('close-button'), 'click', function(event) {
            event.stopPropagation();
            hideOverlay();
        });
        // Add touch events
        bind(overlay, 'touchstart', function(event) {
            touchStartX = event.changedTouches[0].pageX;
        });
        bind(overlay, 'touchmove', function(event) {
            if(touchFlag)
                return;
            event.preventDefault();
            touch = event.touches[0] || event.changedTouches[0];
            if(touch.pageX - touchStartX > 40) {
                touchFlag = true;
                showPreviousImage();
            }
            else if (touch.pageX - touchStartX < -40) {
                touchFlag = true;
                showNextImage();
            }
        });
        bind(overlay, 'touchend', function(event) {
            touchFlag = false;
        });
        // Activate keyboard shortcuts
        bind(window, 'keydown', function(event) {
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
        });
    }

    function prepareOverlay(galleryIndex) {
        if(currentGallery === galleryIndex)
            return;
        currentGallery = galleryIndex;
        setOptions(imagesMap[galleryIndex].options);
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

    function setOptions(newOptions) {
        if(!newOptions)
            newOptions = {};
        for(var item in defaults) {
            options[item] = defaults[item];
            if(typeof newOptions[item] !== 'undefined')
                options[item] = newOptions[item];
        }
        /* Apply new options */
        // Change transition for proper animation
        if(options.animation === 'fadeIn')
            slider.style.transition = 'opacity .4s ease';
        else
            slider.style.transition = '';
        // Hide or display buttons 
        if(options.buttons === 'auto' && ('ontouchstart' in window || imagesMap[currentGallery].length === 1))
            options.buttons = false;
        previousButton.style.display = nextButton.style.display = options.buttons ? '' : 'none';
    }

    function returnImageContainer() {
        var fullImage = document.createElement('div');
        fullImage.className = 'full-image';
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
        // Prevent IE bug when updating offset and fading in overlay, when diplay: 'none' - transition is not fired
        slider.style.display = 'none';
        updateOffset();
        slider.style.display = '';
        // Fade in overlay
        setTimeout(function() {
            overlay.className = 'visible';
        }, 50);
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
        if(imageContainer.getElementsByTagName('img')[0]) {
            if(callback)
                callback();
            return;
        }
        // Get element reference and optional caption
        imageElement = imagesMap[currentGallery][index];
        imageCaption = imageElement.getAttribute('data-caption');
        // Prepare image container elements
        var figure = document.createElement('figure');
        var image = document.createElement('img');
        var figcaption = document.createElement('figcaption');
        imageContainer.appendChild(figure);
        image.setAttribute('src', imageElement.getAttribute('href'));
        image.onload = function() {
            // Remove loader element
            var spinner = this.parentNode.getElementsByClassName('spinner')[0];
            this.parentNode.removeChild(spinner);
            if(!options.async && callback)
                callback();
        };
        // Add loader element
        figure.innerHTML = '<div class="spinner">' +
            '<div class="double-bounce1"></div>' +
            '<div class="double-bounce2"></div>' +
            '</div>';
        figure.appendChild(image);
        // Insert caption if available
        if(options.captions && imageCaption) {
            figcaption.innerHTML = imageCaption;
            figure.appendChild(figcaption);
        }
        // Run callback
        if(options.async && callback)
            callback();
    }

    function showNextImage() {
        if(currentIndex <= imagesArray.length - 2) {
            currentIndex++;
            updateOffset();
            preloadNext(currentIndex);
        } else {
            slider.className = 'bounce-from-right';
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
            slider.className = 'bounce-from-left';
            setTimeout(function() {
                slider.className = '';
            }, 400);
        }
    }

    function updateOffset() {
        if(options.animation === 'fadeIn') {
            slider.style.opacity = 0;
            setTimeout(function() {
                slider.style.left = -currentIndex * 100 + '%';
                slider.style.opacity = 1;
            }, 400);
        } else {
            slider.style.left = -currentIndex * 100 + '%';
        }
    }

    function preloadNext(index) {
        if(index - currentIndex >= options.preload)
            return;
        loadImage(index + 1, function() { preloadNext(index + 1); });
    }

    function preloadPrev(index) {
        if(currentIndex - index >= options.preload)
            return;
        loadImage(index - 1, function() { preloadPrev(index - 1); });
    }

    function bind(element, event, callback) {
        element.addEventListener(event, callback, false);
    }

    return {
        run: run
    };

})();