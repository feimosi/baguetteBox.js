/*!
 * baguetteBox.js
 * @author  feimosi
 * @version %%INJECT_VERSION%%
 * @url https://github.com/feimosi/baguetteBox.js
 */

interface BaguetteBoxApi {
    run(selector: string, userOptions?: UserOptions): Gallery[];
    show(index: number, gallery?: Gallery): boolean;
    showNext(): boolean;
    showPrevious(): boolean;
    hide(): void;
    destroy(): void;
}

interface AmdDefine {
    (factory: () => BaguetteBoxApi): void;
    amd?: unknown;
}

interface GalleryItem {
    eventHandler: (event: any) => void;
    imageElement: HTMLAnchorElement;
}

interface SelectorData {
    galleries: Gallery[];
    nodeList: NodeListOf<Element>;
}

interface SupportFlags {
    transforms: boolean;
    svg: boolean;
    passiveEvents: boolean;
}

interface TouchState {
    count: number;
    multitouch: boolean;
    startX: number | null;
    startY: number | null;
}

interface Options {
    captions: boolean | ((this: GalleryItem[], imageElement: HTMLAnchorElement) => string | null | undefined);
    buttons: boolean | 'auto';
    fullScreen: boolean;
    noScrollbars: boolean;
    bodyClass: string | false;
    titleTag: boolean;
    async: boolean;
    preload: number;
    animation: 'slideIn' | 'fadeIn' | false;
    afterShow: (() => void) | null;
    afterHide: (() => void) | null;
    onChange: ((currentIndex: number, total: number) => void) | null;
    overlayBackgroundColor: string;
    closeX: string;
    leftArrow: string;
    rightArrow: string;
    filter: RegExp;
    ignoreClass: string;
}

type UserOptions = Partial<Options>;
type Gallery = GalleryItem[];
type RootContext = typeof globalThis & { baguetteBox?: BaguetteBoxApi };
type StyleWithWebkit = CSSStyleDeclaration & {
    webkitPerspective?: string;
    webkitTransition?: string;
    webkitTransform?: string;
};
type FullscreenOverlay = HTMLDivElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    mozRequestFullScreen?: () => Promise<void> | void;
};
type FullscreenDocument = Document & {
    fullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void> | void;
    mozCancelFullScreen?: () => Promise<void> | void;
};

declare const define: AmdDefine | undefined;

(function (root: RootContext, factory: () => BaguetteBoxApi) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object' && typeof module === 'object' && module) {
        module.exports = factory();
    } else {
        root.baguetteBox = factory();
    }
}(this as RootContext, function () {
    'use strict';

    // SVG shapes used on the buttons
    var leftArrow = '<svg width="44" height="60">' +
            '<polyline points="30 10 10 30 30 50" stroke="rgba(255,255,255,0.5)" stroke-width="4"' +
              'stroke-linecap="butt" fill="none" stroke-linejoin="round"/>' +
            '</svg>',
        rightArrow = '<svg width="44" height="60">' +
            '<polyline points="14 10 34 30 14 50" stroke="rgba(255,255,255,0.5)" stroke-width="4"' +
              'stroke-linecap="butt" fill="none" stroke-linejoin="round"/>' +
            '</svg>',
        closeX = '<svg width="30" height="30">' +
            '<g stroke="rgb(160,160,160)" stroke-width="4">' +
            '<line x1="5" y1="5" x2="25" y2="25"/>' +
            '<line x1="5" y1="25" x2="25" y2="5"/>' +
            '</g></svg>';
    // Global options and their defaults
    var options = {} as Options,
        defaults: Options = {
            captions: true,
            buttons: 'auto',
            fullScreen: false,
            noScrollbars: false,
            bodyClass: 'baguetteBox-open',
            titleTag: false,
            async: false,
            preload: 2,
            animation: 'slideIn',
            afterShow: null,
            afterHide: null,
            onChange: null,
            overlayBackgroundColor: 'rgba(0,0,0,.8)',
            closeX: closeX,
            leftArrow: leftArrow,
            rightArrow: rightArrow,
            filter: /.+\.(gif|jpe?g|png|webp|avif)/i,
            ignoreClass: ''
        };
    // Object containing information about features compatibility
    var supports: SupportFlags = {
        transforms: false,
        svg: false,
        passiveEvents: false
    };
    // DOM Elements references
    var overlay: HTMLDivElement,
        slider: HTMLDivElement,
        previousButton: HTMLButtonElement,
        nextButton: HTMLButtonElement,
        closeButton: HTMLButtonElement;
    // An array with all images in the current gallery
    var currentGallery: Gallery = [];
    // Current image index inside the slider
    var currentIndex = 0;
    // Visibility of the overlay
    var isOverlayVisible = false;
    // Touch event start position (for slide gesture)
    var touch: TouchState = createTouchState();
    // If set to true ignore touch events because animation was already fired
    var touchFlag = false;
    // Regex pattern to match image files
    var regex = defaults.filter;
    // Object of all used galleries
    var data: Record<string, SelectorData> = {};
    // Array containing temporary images DOM elements
    var imagesElements: HTMLDivElement[] = [];
    // The last focused element before opening the overlay
    var documentLastFocus: HTMLElement | null = null;
    var overlayClickHandler = function(event: any) {
        var target = event.target as Element | null;
        // Close the overlay when user clicks directly on the background
        if (target && typeof (target as HTMLElement).id === 'string' && (target as HTMLElement).id.indexOf('baguette-img') !== -1) {
            hideOverlay();
        }
    };
    var previousButtonClickHandler = function(event: any) {
        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true; // eslint-disable-line no-unused-expressions
        showPreviousImage();
    };
    var nextButtonClickHandler = function(event: any) {
        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true; // eslint-disable-line no-unused-expressions
        showNextImage();
    };
    var closeButtonClickHandler = function(event: any) {
        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true; // eslint-disable-line no-unused-expressions
        hideOverlay();
    };
    var touchstartHandler = function(event: TouchEvent) {
        touch.count++;
        if (touch.count > 1) {
            touch.multitouch = true;
        }
        // Save x and y axis position
        touch.startX = event.changedTouches[0].pageX;
        touch.startY = event.changedTouches[0].pageY;
    };
    var touchmoveHandler = function(event: TouchEvent & { returnValue?: boolean }) {
        // If action was already triggered or multitouch return
        if (touchFlag || touch.multitouch) {
            return;
        }
        event.preventDefault ? event.preventDefault() : event.returnValue = false; // eslint-disable-line no-unused-expressions
        var touchEvent = event.touches[0] || event.changedTouches[0];
        // Move at least 40 pixels to trigger the action
        if (touch.startX !== null && touchEvent.pageX - touch.startX > 40) {
            touchFlag = true;
            showPreviousImage();
        } else if (touch.startX !== null && touchEvent.pageX - touch.startX < -40) {
            touchFlag = true;
            showNextImage();
        // Move 100 pixels up to close the overlay
        } else if (touch.startY !== null && touch.startY - touchEvent.pageY > 100) {
            hideOverlay();
        }
    };
    var touchendHandler = function() {
        touch.count--;
        if (touch.count <= 0) {
            touch.multitouch = false;
        }
        touchFlag = false;
    };
    var contextmenuHandler = function() {
        touchendHandler();
    };

    var trapFocusInsideOverlay = function(event: FocusEvent) {
        var target = event.target as Node | null;
        if (overlay.style.display === 'block' && target && overlay.contains && !overlay.contains(target)) {
            event.stopPropagation();
            initFocus();
        }
    };

    // forEach polyfill for IE8
    // http://stackoverflow.com/a/14827443/1077846
    /* eslint-disable */
    if (![].forEach) {
        Array.prototype.forEach = function(
            callback: (value: any, index: number, array: any[]) => void,
            thisArg?: unknown
        ) {
            for (var i = 0; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }

    // filter polyfill for IE8
    // https://gist.github.com/eliperelman/1031656
    if (![].filter) {
        Array.prototype.filter = function(
            callback: (value: any, index: number, array: any[]) => boolean,
            thisArg?: unknown
        ) {
            var source = this as any[];
            var filtered: any[] = [];
            for (var i = 0; i < source.length; i++) {
                if (callback.call(thisArg, source[i], i, source)) {
                    filtered.push(source[i]);
                }
            }
            return filtered;
        };
    }
    /* eslint-enable */

    function createTouchState(): TouchState {
        return {
            count: 0,
            multitouch: false,
            startX: null,
            startY: null
        };
    }

    // Script entry point
    function run(selector: string, userOptions?: UserOptions): Gallery[] {
        // Fill supports object
        supports.transforms = testTransformsSupport();
        supports.svg = testSvgSupport();
        supports.passiveEvents = testPassiveEventsSupport();

        buildOverlay();
        removeFromCache(selector);
        return bindImageClickListeners(selector, userOptions);
    }

    function bindImageClickListeners(selector: string, userOptions?: UserOptions): Gallery[] {
        // For each gallery bind a click event to every image inside it
        var galleryNodeList = document.querySelectorAll(selector);
        var selectorData: SelectorData = {
            galleries: [],
            nodeList: galleryNodeList
        };
        data[selector] = selectorData;
        regex = userOptions && userOptions.filter ? userOptions.filter : defaults.filter;

        [].forEach.call(galleryNodeList, function(galleryElement: Element) {
            var tagsNodeList: HTMLAnchorElement[] = [];

            // Get nodes from gallery elements or single-element galleries
            if (galleryElement.tagName === 'A') {
                tagsNodeList = [galleryElement as HTMLAnchorElement];
            } else {
                [].forEach.call(galleryElement.getElementsByTagName('a'), function(element: HTMLAnchorElement) {
                    tagsNodeList.push(element);
                });
            }

            // Filter 'a' elements from those not linking to images
            tagsNodeList = tagsNodeList.filter(function(element) {
                var ignoredClass = userOptions && userOptions.ignoreClass;
                if (ignoredClass && element.className.indexOf(ignoredClass) !== -1) {
                    return false;
                }
                return regex.test(element.href);
            });
            if (tagsNodeList.length === 0) {
                return;
            }

            var gallery: Gallery = [];
            [].forEach.call(tagsNodeList, function(imageElement: HTMLAnchorElement, imageIndex: number) {
                var imageElementClickHandler = function(event: any) {
                    event.preventDefault ? event.preventDefault() : event.returnValue = false; // eslint-disable-line no-unused-expressions
                    prepareOverlay(gallery, userOptions);
                    showOverlay(imageIndex);
                };
                var imageItem: GalleryItem = {
                    eventHandler: imageElementClickHandler,
                    imageElement: imageElement
                };
                bind(imageElement, 'click', imageElementClickHandler);
                gallery.push(imageItem);
            });
            selectorData.galleries.push(gallery);
        });

        return selectorData.galleries;
    }

    function clearCachedData() {
        for (var selector in data) {
            if (Object.prototype.hasOwnProperty.call(data, selector)) {
                removeFromCache(selector);
            }
        }
    }

    function removeFromCache(selector: string) {
        if (!Object.prototype.hasOwnProperty.call(data, selector)) {
            return;
        }
        var galleries = data[selector].galleries;
        [].forEach.call(galleries, function(gallery: Gallery) {
            [].forEach.call(gallery, function(imageItem: GalleryItem) {
                unbind(imageItem.imageElement, 'click', imageItem.eventHandler);
            });

            if (currentGallery === gallery) {
                currentGallery = [];
            }
        });

        delete data[selector];
    }

    function buildOverlay() {
        var existingOverlay = getByID<HTMLDivElement>('baguetteBox-overlay');
        // Check if the overlay already exists
        if (existingOverlay) {
            overlay = existingOverlay;
            slider = getByID<HTMLDivElement>('baguetteBox-slider') as HTMLDivElement;
            previousButton = getByID<HTMLButtonElement>('previous-button') as HTMLButtonElement;
            nextButton = getByID<HTMLButtonElement>('next-button') as HTMLButtonElement;
            closeButton = getByID<HTMLButtonElement>('close-button') as HTMLButtonElement;
            return;
        }
        // Create overlay element
        overlay = create('div');
        overlay.setAttribute('role', 'dialog');
        overlay.id = 'baguetteBox-overlay';
        document.body.appendChild(overlay);
        // Create gallery slider element
        slider = create('div');
        slider.id = 'baguetteBox-slider';
        overlay.appendChild(slider);
        // Create all necessary buttons
        previousButton = create('button');
        previousButton.setAttribute('type', 'button');
        previousButton.id = 'previous-button';
        previousButton.setAttribute('aria-label', 'Previous');
        previousButton.innerHTML = supports.svg ? leftArrow : '&lt;';
        overlay.appendChild(previousButton);

        nextButton = create('button');
        nextButton.setAttribute('type', 'button');
        nextButton.id = 'next-button';
        nextButton.setAttribute('aria-label', 'Next');
        nextButton.innerHTML = supports.svg ? rightArrow : '&gt;';
        overlay.appendChild(nextButton);

        closeButton = create('button');
        closeButton.setAttribute('type', 'button');
        closeButton.id = 'close-button';
        closeButton.setAttribute('aria-label', 'Close');
        closeButton.innerHTML = supports.svg ? closeX : '&times;';
        overlay.appendChild(closeButton);

        previousButton.className = nextButton.className = closeButton.className = 'baguetteBox-button';

        bindEvents();
    }

    function keyDownHandler(event: KeyboardEvent) {
        switch (event.keyCode) {
        case 37: // Left arrow
            showPreviousImage();
            break;
        case 39: // Right arrow
            showNextImage();
            break;
        case 27: // Esc
            hideOverlay();
            break;
        case 36: // Home
            showFirstImage(event);
            break;
        case 35: // End
            showLastImage(event);
            break;
        }
    }

    function bindEvents() {
        var passiveEvent = supports.passiveEvents ? { passive: false } : undefined;
        var nonPassiveEvent = supports.passiveEvents ? { passive: true } : undefined;

        bind(overlay, 'click', overlayClickHandler);
        bind(previousButton, 'click', previousButtonClickHandler);
        bind(nextButton, 'click', nextButtonClickHandler);
        bind(closeButton, 'click', closeButtonClickHandler);
        bind(slider, 'contextmenu', contextmenuHandler);
        bind(overlay, 'touchstart', touchstartHandler, nonPassiveEvent);
        bind(overlay, 'touchmove', touchmoveHandler, passiveEvent);
        bind(overlay, 'touchend', touchendHandler);
        bind(document, 'focus', trapFocusInsideOverlay, true);
    }

    function unbindEvents() {
        var passiveEvent = supports.passiveEvents ? { passive: false } : undefined;
        var nonPassiveEvent = supports.passiveEvents ? { passive: true } : undefined;

        unbind(overlay, 'click', overlayClickHandler);
        unbind(previousButton, 'click', previousButtonClickHandler);
        unbind(nextButton, 'click', nextButtonClickHandler);
        unbind(closeButton, 'click', closeButtonClickHandler);
        unbind(slider, 'contextmenu', contextmenuHandler);
        unbind(overlay, 'touchstart', touchstartHandler, nonPassiveEvent);
        unbind(overlay, 'touchmove', touchmoveHandler, passiveEvent);
        unbind(overlay, 'touchend', touchendHandler);
        unbind(document, 'focus', trapFocusInsideOverlay, true);
    }

    function prepareOverlay(gallery: Gallery, userOptions?: UserOptions) {
        // If the same gallery is being opened prevent from loading it once again
        if (currentGallery === gallery) {
            return;
        }
        currentGallery = gallery;
        // Update gallery specific options
        setOptions(userOptions);
        // Empty slider of previous contents (more effective than .innerHTML = "")
        while (slider.firstChild) {
            slider.removeChild(slider.firstChild);
        }
        imagesElements.length = 0;

        var imagesFiguresIds: string[] = [];
        var imagesCaptionsIds: string[] = [];
        // Prepare and append images containers and populate figure and captions IDs arrays
        for (var i = 0, fullImage: HTMLDivElement; i < gallery.length; i++) {
            fullImage = create('div');
            fullImage.className = 'full-image';
            fullImage.id = 'baguette-img-' + i;
            imagesElements.push(fullImage);

            imagesFiguresIds.push('baguetteBox-figure-' + i);
            imagesCaptionsIds.push('baguetteBox-figcaption-' + i);
            slider.appendChild(imagesElements[i]);
        }
        overlay.setAttribute('aria-labelledby', imagesFiguresIds.join(' '));
        overlay.setAttribute('aria-describedby', imagesCaptionsIds.join(' '));
    }

    function setOptions(newOptions?: UserOptions) {
        if (!newOptions) {
            newOptions = {};
        }
        function assignOption<K extends keyof Options>(item: K, source: UserOptions) {
            options[item] = defaults[item];
            if (typeof source[item] !== 'undefined') {
                options[item] = source[item] as Options[K];
            }
        }
        // Fill options object
        (Object.keys(defaults) as Array<keyof Options>).forEach(function(item) {
            assignOption(item, newOptions as UserOptions);
        });
        /* Apply new options */
        // Change transition for proper animation
        var sliderStyle = slider.style as StyleWithWebkit;
        sliderStyle.transition = sliderStyle.webkitTransition = (options.animation === 'fadeIn' ? 'opacity .4s ease' :
            options.animation === 'slideIn' ? '' : 'none');
        // Hide buttons if necessary
        if (options.buttons === 'auto' && ('ontouchstart' in window || currentGallery.length === 1)) {
            options.buttons = false;
        }
        // Set buttons style to hide or display them
        previousButton.style.display = nextButton.style.display = (options.buttons ? '' : 'none');
        // Set custom markup for buttons
        closeButton.innerHTML = options.closeX;
        if (options.buttons) {
            previousButton.innerHTML = options.leftArrow;
            nextButton.innerHTML = options.rightArrow;
        }
        // Set overlay color
        try {
            overlay.style.backgroundColor = options.overlayBackgroundColor;
        } catch (e) {
            // Silence the error and continue
        }
    }

    function showOverlay(chosenImageIndex: number) {
        if (options.noScrollbars) {
            document.documentElement.style.overflowY = 'hidden';
            document.body.style.overflowY = 'scroll';
        }
        if (overlay.style.display === 'block') {
            return;
        }

        bind(document, 'keydown', keyDownHandler);
        currentIndex = chosenImageIndex;
        touch = createTouchState();
        loadImage(currentIndex, function() {
            preloadNext(currentIndex);
            preloadPrev(currentIndex);
        });

        updateOffset();
        overlay.style.display = 'block';
        if (options.fullScreen) {
            enterFullScreen();
        }
        // Fade in overlay
        setTimeout(function() {
            overlay.className = 'visible';
            if (typeof options.bodyClass === 'string' && document.body.classList) {
                document.body.classList.add(options.bodyClass);
            }
            if (options.afterShow) {
                options.afterShow();
            }
        }, 50);
        if (options.onChange) {
            options.onChange(currentIndex, imagesElements.length);
        }
        documentLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        initFocus();
        isOverlayVisible = true;
    }

    function initFocus() {
        if (options.buttons) {
            previousButton.focus();
        } else {
            closeButton.focus();
        }
    }

    function enterFullScreen() {
        var fullScreenOverlay = overlay as FullscreenOverlay;
        if (fullScreenOverlay.requestFullscreen) {
            fullScreenOverlay.requestFullscreen();
        } else if (fullScreenOverlay.webkitRequestFullscreen) {
            fullScreenOverlay.webkitRequestFullscreen();
        } else if (fullScreenOverlay.mozRequestFullScreen) {
            fullScreenOverlay.mozRequestFullScreen();
        }
    }

    function exitFullscreen() {
        var fullScreenDocument = document as FullscreenDocument;
        if (fullScreenDocument.exitFullscreen) {
            fullScreenDocument.exitFullscreen();
        } else if (fullScreenDocument.mozCancelFullScreen) {
            fullScreenDocument.mozCancelFullScreen();
        } else if (fullScreenDocument.webkitExitFullscreen) {
            fullScreenDocument.webkitExitFullscreen();
        }
    }

    function hideOverlay() {
        if (options.noScrollbars) {
            document.documentElement.style.overflowY = 'auto';
            document.body.style.overflowY = 'auto';
        }
        if (overlay.style.display === 'none') {
            return;
        }

        unbind(document, 'keydown', keyDownHandler);
        // Fade out and hide the overlay
        overlay.className = '';
        setTimeout(function() {
            overlay.style.display = 'none';
            if ((document as FullscreenDocument).fullscreenElement) {
                exitFullscreen();
            }
            if (typeof options.bodyClass === 'string' && document.body.classList) {
                document.body.classList.remove(options.bodyClass);
            }
            if (options.afterHide) {
                options.afterHide();
            }
            if (documentLastFocus) {
                documentLastFocus.focus();
            }
            isOverlayVisible = false;
        }, 500);
    }

    function loadImage(index: number, callback?: () => void) {
        var imageContainer = imagesElements[index];
        var galleryItem = currentGallery[index];

        // Return if the index exceeds prepared images in the overlay
        // or if the current gallery has been changed / closed
        if (typeof imageContainer === 'undefined' || typeof galleryItem === 'undefined') {
            return;
        }

        // If image is already loaded run callback and return
        if (imageContainer.getElementsByTagName('img')[0]) {
            if (callback) {
                callback();
            }
            return;
        }

        // Get element reference, optional caption and source path
        var imageElement = galleryItem.imageElement;
        var thumbnailElement = imageElement.getElementsByTagName('img')[0];
        var imageCaption = typeof options.captions === 'function' ?
            options.captions.call(currentGallery, imageElement) :
            imageElement.getAttribute('data-caption') || imageElement.title;
        var imageSrc = getImageSrc(imageElement);

        // Prepare figure element
        var figure = create('figure');
        figure.id = 'baguetteBox-figure-' + index;
        figure.innerHTML = '<div class="baguetteBox-spinner">' +
            '<div class="baguetteBox-double-bounce1"></div>' +
            '<div class="baguetteBox-double-bounce2"></div>' +
            '</div>';
        // Insert caption if available
        if (options.captions && imageCaption) {
            var figcaption = create('figcaption');
            figcaption.id = 'baguetteBox-figcaption-' + index;
            figcaption.innerHTML = imageCaption;
            figure.appendChild(figcaption);
        }
        imageContainer.appendChild(figure);

        // Prepare gallery img element
        var image = create('img');
        image.onload = function() {
            // Remove loader element
            var spinner = figure.querySelector('.baguetteBox-spinner');
            if (spinner && spinner.parentNode === figure) {
                figure.removeChild(spinner);
            }
            if (!options.async && callback) {
                callback();
            }
        };
        image.setAttribute('src', imageSrc);
        image.alt = thumbnailElement ? thumbnailElement.alt || '' : '';
        if (options.titleTag && imageCaption) {
            image.title = imageCaption;
        }
        figure.appendChild(image);

        // Run callback
        if (options.async && callback) {
            callback();
        }
    }

    // Get image source location, mostly used for responsive images
    function getImageSrc(image: HTMLAnchorElement) {
        // Set default image path from href
        var result = image.href;
        // If dataset is supported find the most suitable image
        if (image.dataset) {
            var srcs: Record<string, string> = {};
            // Get all possible image versions depending on the resolution
            for (var item in image.dataset) {
                if (item.substring(0, 3) === 'at-' && !isNaN(parseInt(item.substring(3), 10))) {
                    var candidate = image.dataset[item];
                    if (candidate) {
                        srcs[item.replace('at-', '')] = candidate;
                    }
                }
            }
            // Sort resolutions ascending
            var keys = Object.keys(srcs).sort(function(a, b) {
                return parseInt(a, 10) < parseInt(b, 10) ? -1 : 1;
            });
            // Get real screen resolution
            var width = window.innerWidth * window.devicePixelRatio;
            // Find the first image bigger than or equal to the current width
            var i = 0;
            while (i < keys.length - 1 && parseInt(keys[i], 10) < width) {
                i++;
            }
            if (keys.length > 0) {
                result = srcs[keys[i]] || result;
            }
        }
        return result;
    }

    // Return false at the right end of the gallery
    function showNextImage() {
        return show(currentIndex + 1);
    }

    // Return false at the left end of the gallery
    function showPreviousImage() {
        return show(currentIndex - 1);
    }

    // Return false at the left end of the gallery
    function showFirstImage(event?: Event) {
        if (event) {
            event.preventDefault();
        }
        return show(0);
    }

    // Return false at the right end of the gallery
    function showLastImage(event?: Event) {
        if (event) {
            event.preventDefault();
        }
        return show(currentGallery.length - 1);
    }

    /**
     * Move the gallery to a specific index
     * @param `index` {number} - the position of the image
     * @param `gallery` {array} - gallery which should be opened, if omitted assumes the currently opened one
     * @return {boolean} - true on success or false if the index is invalid
     */
    function show(index: number, gallery?: Gallery) {
        if (!isOverlayVisible) {
            if (!gallery || index < 0 || index >= gallery.length) {
                return false;
            }
            prepareOverlay(gallery, options);
            showOverlay(index);
            return true;
        }
        if (index < 0) {
            if (options.animation) {
                bounceAnimation('left');
            }
            return false;
        }
        if (index >= imagesElements.length) {
            if (options.animation) {
                bounceAnimation('right');
            }
            return false;
        }

        currentIndex = index;
        loadImage(currentIndex, function() {
            preloadNext(currentIndex);
            preloadPrev(currentIndex);
        });
        updateOffset();

        if (options.onChange) {
            options.onChange(currentIndex, imagesElements.length);
        }

        return true;
    }

    /**
     * Triggers the bounce animation
     * @param {('left'|'right')} direction - Direction of the movement
     */
    function bounceAnimation(direction: 'left' | 'right') {
        slider.className = 'bounce-from-' + direction;
        setTimeout(function() {
            slider.className = '';
        }, 400);
    }

    function updateOffset() {
        var isRtl = document.documentElement.getAttribute('dir') === 'rtl';
        var percentage = isRtl ? -100 : 100;
        var offset = -currentIndex * percentage + '%';
        var sliderStyle = slider.style as StyleWithWebkit;

        if (options.animation === 'fadeIn') {
            sliderStyle.opacity = '0';
            setTimeout(function() {
                if (supports.transforms) {
                    sliderStyle.transform = sliderStyle.webkitTransform = 'translate3d(' + offset + ',0,0)';
                } else {
                    sliderStyle.left = offset;
                }
                sliderStyle.opacity = '1';
            }, 400);
        } else if (supports.transforms) {
            sliderStyle.transform = sliderStyle.webkitTransform = 'translate3d(' + offset + ',0,0)';
        } else {
            sliderStyle.left = offset;
        }
    }

    // CSS 3D Transforms test
    function testTransformsSupport() {
        var div = create('div');
        var style = div.style as StyleWithWebkit;
        return typeof style.perspective !== 'undefined' || typeof style.webkitPerspective !== 'undefined';
    }

    // Inline SVG test
    function testSvgSupport() {
        var div = create('div');
        div.innerHTML = '<svg/>';
        var firstChild = div.firstChild as Element | null;
        return (firstChild && firstChild.namespaceURI) === 'http://www.w3.org/2000/svg';
    }

    // Borrowed from https://github.com/seiyria/bootstrap-slider/pull/680/files
    /* eslint-disable getter-return */
    function testPassiveEventsSupport() {
        var passiveEvents = false;
        try {
            var noop = function() {
                return undefined;
            };
            var opts = Object.defineProperty({}, 'passive', {
                get: function() {
                    passiveEvents = true;
                    return true;
                }
            }) as AddEventListenerOptions;
            window.addEventListener('test', noop, opts);
            window.removeEventListener('test', noop, opts);
        } catch (e) { /* Silence the error and continue */ }

        return passiveEvents;
    }
    /* eslint-enable getter-return */

    function preloadNext(index: number) {
        if (index - currentIndex >= options.preload) {
            return;
        }
        loadImage(index + 1, function() {
            preloadNext(index + 1);
        });
    }

    function preloadPrev(index: number) {
        if (currentIndex - index >= options.preload) {
            return;
        }
        loadImage(index - 1, function() {
            preloadPrev(index - 1);
        });
    }

    function bind(element: any, event: string, callback: (event: any) => void, options?: boolean | AddEventListenerOptions) {
        if (element.addEventListener) {
            element.addEventListener(event, callback, options);
        } else {
            // IE8 fallback
            element.attachEvent('on' + event, function(event: any) {
                // `event` and `event.target` are not provided in IE8
                event = event || window.event;
                event.target = event.target || event.srcElement;
                callback(event);
            });
        }
    }

    function unbind(element: any, event: string, callback: (event: any) => void, options?: boolean | AddEventListenerOptions) {
        if (element.removeEventListener) {
            element.removeEventListener(event, callback, options);
        } else {
            // IE8 fallback
            element.detachEvent('on' + event, callback);
        }
    }

    function getByID<T extends HTMLElement>(id: string) {
        return document.getElementById(id) as T | null;
    }

    function create<K extends keyof HTMLElementTagNameMap>(element: K) {
        return document.createElement(element);
    }

    function destroyPlugin() {
        unbindEvents();
        clearCachedData();
        unbind(document, 'keydown', keyDownHandler);
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        data = {};
        currentGallery = [];
        currentIndex = 0;
    }

    return {
        run: run,
        show: show,
        showNext: showNextImage,
        showPrevious: showPreviousImage,
        hide: hideOverlay,
        destroy: destroyPlugin
    };
}));
