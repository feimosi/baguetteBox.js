/*!
 * baguetteBox.js
 * @author  feimosi
 * @version 0.1.0
 */

var baguetteBox = function(selector) {
    var leftArrow = '<svg width="45" height="60" xmlns="http://www.w3.org/2000/svg" version="1.1">' +
            '<polyline points="10 30 30 10 50 30" stroke="rgba(255,255,255,0.5)" stroke-width="5"' +
              'stroke-linecap="butt" fill="none" stroke-linejoin="round" transform="translate(0, 60) rotate(-90)"/>' +
            '</svg>',
        rightArrow = '<svg width="45" height="60" xmlns="http://www.w3.org/2000/svg" version="1.1">' +
            '<polyline points="10 30 30 10 50 30" stroke="rgba(255,255,255,0.5)" stroke-width="5"' +
              'stroke-linecap="butt" fill="none" stroke-linejoin="round" transform="translate(45) rotate(90)"/>' +
            '</svg>',
        closeX = '<svg width="45" height="60" xmlns="http://www.w3.org/2000/svg" version="1.1">' +
            '</svg>';
    var overlayID = 'baguetteBoxOverlay';
    var sliderID = 'baguetteBoxSlider';
    var overlay, slider, previousButton, nextButton, closeButton;
    var currentIndex = 0;
    var galleries = document.querySelectorAll(selector);
    var images = document.querySelectorAll(selector + ' a');
    var imagesArray = [];
    init();
    
    [].forEach.call(
        images,
        function (element, index) {
            element.addEventListener('click', function(event) {
                event.preventDefault();
                showOverlay(index);
            }, false);
        }
    );

    function init() {
        overlay = document.getElementById(overlayID);
        // Check if the overlay already exists, if not - create it
        if(!overlay) {
            overlay = document.createElement('div');
            overlay = document.querySelector('body').appendChild(overlay);
            overlay.id = overlayID;
        }
        // Create gallery slider element
        slider = document.createElement('div');
        slider = overlay.appendChild(slider);
        slider.id = sliderID;
        slider.style.left = '0%';
        // Create all necessary buttons
        previousButton = document.createElement('button');
        previousButton.id = 'previousButton';
        previousButton.className = 'baguetteBoxButton';
        previousButton.innerHTML = leftArrow;
        previousButton = overlay.appendChild(previousButton);

        nextButton = document.createElement('button');
        nextButton.id = 'nextButton';
        nextButton.className = 'baguetteBoxButton';
        nextButton.innerHTML = rightArrow;
        nextButton = overlay.appendChild(nextButton);

        closeButton = document.createElement('button');
        closeButton.id = 'closeButton';
        closeButton.innerHTML = closeX;
        closeButton = overlay.appendChild(closeButton);
        closeButton.style.display = 'none';

        /* 
            Assign event listeners 
        */
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

    function showOverlay(index){
        // Return if overlay is already visible
        if(overlay.style.display === 'block')
            return;
        // Prepare and append images containers
        for(var i = 0; i < images.length; i++) {
            imagesArray.push(returnImageElement());
            slider.appendChild(imagesArray[i]);
        }
        // Show proper image and set current index to a new value
        overlay.style.display = 'block';
        currentIndex = index;
        showImage(currentIndex);
        setOffset();
        // Fade in overlay
        setTimeout(function() {
            overlay.className = 'visible';
        }, 10);
    }

    function hideOverlay(){
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
        var imageElement = imagesArray[index];
        imageElement.innerHTML = '<img src="' + images[index].getAttribute('href') + '">';
    }

    function showNextImage() {
        if(currentIndex <= images.length - 2) {
            currentIndex++;
            setOffset();
        }
    }

    function showPreviousImage() {
        if(currentIndex >= 1) {
            currentIndex--;
            setOffset();
        }
    }

    function setOffset() {
        slider.style.left = -currentIndex * 100 + '%';
        preload();
    }

    function preload() {
        if(currentIndex <= images.length - 2)
            showImage(currentIndex + 1);
        if(currentIndex >= 1)
            showImage(currentIndex - 1);
    }

    function returnImageElement() {
        var fullImage = document.createElement('div');
        fullImage.className = 'fullImage';
        return fullImage;
    }
};