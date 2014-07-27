/*!
 * baguetteBox.js
 * @author  feimosi
 * @version 0.4.0
 * @url https://github.com/feimosi/baguetteBox.js
 */

var baguetteBox = function(selector, userOptions) {
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
    var overlayID = 'baguetteBoxOverlay';
    var sliderID = 'baguetteBoxSlider';
    var options = {
        captions: true,
        buttons: true,
        async: false,
        preload: 2
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
    // Touch event start position (for slide gesture)
    var touchStartX;
    // If set to true ignore touch events because animation was already fired
    var touchFlag = false;
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
                galleryElement.setAttribute('data-baguetteBoxId', galleryIndex);
                imagesMap[galleryIndex] = galleryElement.getElementsByTagName('a');
                [].forEach.call(
                    imagesMap[galleryIndex],
                    function (imageElement, imageIndex) {
                        bind(imageElement, 'click', function(event) {
                            event.preventDefault();
                            prepareOverlay(galleryIndex);
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
        bind(overlay, 'click', function(event) {
            if(event.target && event.target.nodeName !== "IMG")
                hideOverlay();
        });
        // Add event listeners for buttons
        if(options.buttons) {
            bind(document.getElementById('previousButton'), 'click', function(event) {
                event.stopPropagation();
                showPreviousImage();
            });
            bind(document.getElementById('nextButton'), 'click', function(event) {
                event.stopPropagation();
                showNextImage();
            });
            bind(document.getElementById('closeButton'), 'click', function(event) {
                event.stopPropagation();
                hideOverlay();
            });
        }
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
        imageCaption = imageElement.getAttribute('data-caption');
        // Prepare image container elements
        var figure = document.createElement('figure');
        var image = document.createElement('img');
        var figcaption = document.createElement('figcaption');
        imageContainer.appendChild(figure);
        image.setAttribute('src', imageElement.getAttribute('href'));
        image.onload = function() {
            var spinner = this.parentNode.getElementsByClassName('spinner')[0];
            this.parentNode.removeChild(spinner);
            if(!options.async)
                callback();
        };
        figure.innerHTML = '<div class="spinner">' +
          '<div class="double-bounce1"></div>' +
          '<div class="double-bounce2"></div>' +
        '</div>';
        figure.appendChild(image);
        if(options.captions && imageCaption) {
            figcaption.innerHTML = imageCaption;
            figure.appendChild(figcaption);
        }
        if(options.async)
            callback();
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

    function bind(element, event, callback) {
        if(element.addEventListener)
          element.addEventListener(event, callback, false);
        else if (element.attachEvent)
          element.attachEvent('on' + event, callback);
    }
};