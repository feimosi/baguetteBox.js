/*!
 * baguetteBox.js
 * @author  feimosi
 * @version 0.7.0
 * @url https://github.com/feimosi/baguetteBox.js
 */

var baguetteBox = (function() {
    // SVG shapes used in buttons
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
    // Main ID names
    var overlayID = 'baguetteBox-overlay';
    var sliderID = 'baguetteBox-slider';
    // Global options and their defaults
    var options = {}, defaults = {
        captions: true,
        buttons: 'auto',
        async: false,
        preload: 2,
        animation: 'slideIn'
    };
    // DOM Elements references
    var overlay, slider, previousButton, nextButton, closeButton;
    // Current image index inside the slider and displayed gallery index
    var currentIndex = 0, currentGallery = -1;
    // Touch event start position (for slide gesture)
    var touchStartX;
    // If set to true ignore touch events because animation was already fired
    var touchFlag = false;
    // Array of all used galleries (DOM elements)
    var galleries = [];
    // 2D array of galleries and images inside them
    var imagesMap = [];
    // Array containing temporary images DOM elements
    var imagesArray = [];

    // forEach polyfill for IE8
    if(!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, thisArg) {
            var len = this.length;
            for(var i = 0; i < len; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }

    // Script entry point
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
                            /*jshint -W030 */
                            event.preventDefault ? event.preventDefault() : event.returnValue = false;
                            prepareOverlay(galleryID);
                            showOverlay(imageIndex);
                        });
                    }
                );
            }
        );
        defaults.transforms = testTransformsSupport();
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
        overlay.id = overlayID;
        document.getElementsByTagName('body')[0].appendChild(overlay);
        // Create gallery slider element
        slider = document.createElement('div');
        slider.id = sliderID;
        overlay.appendChild(slider);
        // Create all necessary buttons
        previousButton = document.createElement('button');
        previousButton.id = 'previous-button';
        previousButton.innerHTML = leftArrow;
        overlay.appendChild(previousButton);

        nextButton = document.createElement('button');
        nextButton.id = 'next-button';
        nextButton.innerHTML = rightArrow;
        overlay.appendChild(nextButton);

        closeButton = document.createElement('button');
        closeButton.id = 'close-button';
        closeButton.innerHTML = closeX;
        overlay.appendChild(closeButton);

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
            /*jshint -W030 */
            event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
            showPreviousImage();
        });
        bind(document.getElementById('next-button'), 'click', function(event) {
            /*jshint -W030 */
            event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
            showNextImage();
        });
        bind(document.getElementById('close-button'), 'click', function(event) {
            /*jshint -W030 */
            event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
            hideOverlay();
        });
        // Add touch events
        bind(overlay, 'touchstart', function(event) {
            // Save x axis position
            touchStartX = event.changedTouches[0].pageX;
        });
        bind(overlay, 'touchmove', function(event) {
            if(touchFlag)
                return;
            /*jshint -W030 */
            event.preventDefault ? event.preventDefault() : event.returnValue = false;
            touch = event.touches[0] || event.changedTouches[0];
            if(touch.pageX - touchStartX > 40) {
                touchFlag = true;
                showPreviousImage();
            } else if (touch.pageX - touchStartX < -40) {
                touchFlag = true;
                showNextImage();
            }
        });
        bind(overlay, 'touchend', function(event) {
            touchFlag = false;
        });
        // Activate keyboard shortcuts
        bind(document, 'keydown', function(event) {
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
        // If the same gallery is being opened prevent from loading it once again
        if(currentGallery === galleryIndex)
            return;
        currentGallery = galleryIndex;
        // Update gallery specific options
        setOptions(imagesMap[galleryIndex].options);
        // Empty slider of previous contents (more effective than .innerHTML = "")
        while(slider.firstChild)
            slider.removeChild(slider.firstChild);
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
        slider.style.transition = slider.style.webkitTransition = options.animation === 'fadeIn' ? 'opacity .4s ease' : '';
        // Hide buttons if necessary
        if(options.buttons === 'auto' && ('ontouchstart' in window || imagesMap[currentGallery].length === 1))
            options.buttons = false;
        // Set buttons style to hide or display them
        previousButton.style.display = nextButton.style.display = options.buttons ? '' : 'none';
    }

    // Return DOM element for image container <div class="full-image">...</div>
    function returnImageContainer() {
        var fullImage = document.createElement('div');
        fullImage.className = 'full-image';
        return fullImage;
    }

    function showOverlay(index) {
        // Return if overlay is already visible
        if(overlay.style.display === 'block')
            return;
        // Set current index to a new value and show proper image
        currentIndex = index;
        loadImage(currentIndex, function() {
            preloadNext(currentIndex);
            preloadPrev(currentIndex);
        });
        updateOffset();
        overlay.style.display = 'block';
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
        // Get element reference, optional caption and source path
        imageElement = imagesMap[currentGallery][index];
        imageCaption = imageElement.getAttribute('data-caption') || imageElement.title;
        imageSrc = getImageSrc(imageElement);
        // Prepare image container elements
        var figure = document.createElement('figure');
        var image = document.createElement('img');
        var figcaption = document.createElement('figcaption');
        imageContainer.appendChild(figure);
        // Add loader element
        figure.innerHTML = '<div class="spinner">' +
            '<div class="double-bounce1"></div>' +
            '<div class="double-bounce2"></div>' +
            '</div>';
        // Set callback function when image loads
        image.onload = function() {
            // Remove loader element
            var spinner = this.parentNode.querySelector('.spinner');
            this.parentNode.removeChild(spinner);
            if(!options.async && callback)
                callback();
        };
        image.setAttribute('src', imageSrc);
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

    function getImageSrc(image) {
        // Set dafult image path from href
        var result = imageElement.getAttribute('href');
        // If dataset is supported find the most suitable image
        if(image.dataset) {
            var srcs = [];
            // Get all possible image versions depending on the resolution 
            for(var item in image.dataset) {
                if(item.substring(0, 3) === 'at-' && !isNaN(item.substring(3)))
                    srcs[item.replace('at-', '')] = image.dataset[item];
            }
            // Sort resolutions ascending
            keys = Object.keys(srcs).sort(function(a, b) {
                return parseInt(a) < parseInt(b) ? -1 : 1;
            });
            // Get real screen resolution 
            var width = window.innerWidth * window.devicePixelRatio;
            // Find first image bigger than or equal to the current width
            for(var i = 0; i < keys.length; i++) {
                if(keys[i] >= width) {
                    result = srcs[keys[i]];    
                    break;
                }
                result = srcs[keys[i]];
            }
        }
        return result;
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
        var offset = -currentIndex * 100 + '%';
        if(options.animation === 'fadeIn') {
            slider.style.opacity = 0;
            setTimeout(function() {
                /*jshint -W030 */
                options.transforms ?
                    slider.style.transform = slider.style.webkitTransform = 'translate3d(' + offset + ',0,0)'
                    : slider.style.left = offset;
                slider.style.opacity = 1;
            }, 400);
        } else {
            /*jshint -W030 */
            options.transforms ?
                slider.style.transform = slider.style.webkitTransform = 'translate3d(' + offset + ',0,0)'
                : slider.style.left = offset;
        }
    }

    function testTransformsSupport() {
        var div = document.createElement('div'),
            support = false;
        support = typeof div.style.perspective !== 'undefined' || typeof div.style.webkitPerspective !== 'undefined';
        return support;
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
        if(element.addEventListener)
            element.addEventListener(event, callback, false);
        else
            element.attachEvent('on' + event, callback);
    }

    return {
        run: run
    };

})();