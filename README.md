baguetteBox.js
==============

Simple and easy to use lightbox script.

[Demo page](https://feimosi.github.io/baguetteBox.js/)

![Demo Page screenshot](http://i.imgur.com/uLSDpuW.png)

## Features

* Written in pure JavaScript, no dependencies required
* Multiple-gallery support, allows custom options for each 
* Supports swipe gestures on touch-screen devices
* Modern and minimal look
* Image captions support
* Responsive images
* CSS3 transitions
* SVG buttons, no extra files to download
* Around 2.3KB gzipped

## Installation

### npm

`npm install baguettebox.js`

### Bower

`bower install baguettebox.js`

### Manually

1. Download `baguetteBox.min.css` and `baguetteBox.min.js` files from `dist` folder.
2. Include them somewhere in your document:

  ```html
<link rel="stylesheet" href="css/baguetteBox.min.css">
<script src="js/baguetteBox.min.js" async></script>
  ```

## Usage

### Initialization

Initialize the script by running:
```js
baguetteBox.run('.gallery', {
  // Custom options
});
```
where the first argument is a selector to a gallery (or galleries) containing `a` tags. The HTML code may look like this:
```html
<div class="gallery">
	<a href="img/2-1.jpg" data-caption="Image caption"><img src="img/thumbs/2-1.jpg"></a>
	<a href="img/2-2.jpg"><img src="img/thumbs/2-2.jpg"></a>
  ...
</div>
```

To use captions put `title` or `data-caption` attribute on `a` tag.

### Additional public methods

* `showNext` - switch to the next image
* `showPrevious` - switch to the previous image
* `destroy` - remove the plugin with any event bindings

The first two methods return true on success or false if there's no more images to be loaded.

## Responsive images

To use this feature, simply put `data-at-{width}` attributes on `a` tags with value being a path to the desired image. `{width}` should be the maximum screen width the image can be displayed at. The script chooses the first image with `{width}` greater than or equal to the current screen width for best user experience.
That last `data-at-X` image is used also in the case of a screen larger than X.

Here's an example of what the HTML code can look like:
```html
<a href="img/2-1.jpg" 
  data-at-450="img/thumbs/2-1.jpg" 
  data-at-800="img/small/2-1.jpg" 
  data-at-1366="img/medium/2-1.jpg" 
  data-at-1920="img/big/2-1.jpg">
    <img src="img/thumbs/2-1.jpg">
</a>
```
If you have 1366x768 resolution baguetteBox.js will choose `"img/medium/2-1.jpg"`. If, however, it's 1440x900 it'll choose `"img/big/2-1.jpg"`. Keep `href` attribute as a fallback (link to a bigger image e.g. of HD size) for older browsers.

## Customization

You can pass an object with custom options as a second parameter. The following are available with their corresponding defaults:
```javascript
{
  captions: true,       // true|false|callback(element) - Display image captions
  fullScreen: false,    // true|false - Enable full screen mode
  noScrollbars: false,  // true|false - Hide scrollbars when images are displayed
  titleTag: false,      // true|false - Propage caption to the image title attribute
  buttons: 'auto',      // 'auto'|true|false - Display buttons
  async: false,         // true|false - Load files asynchronously
  preload: 2,           // [number] - How many files should be preloaded from current image
  animation: 'slideIn', // 'slideIn'|'fadeIn'|false - Animation type
  afterShow: null,      // callback - To be run after showing the overlay
  afterHide: null,      // callback - To be run after hiding the overlay
  onChange: null,       // callback(currentIndex, imagesElements.length) - When image changes
  overlayBackgroundColor: 'rgba(0, 0, 0, .8)', // [string] - Background color for the lightbox overlay
  filter: /.+\.(gif|jpe?g|png|webp)/i // RegExp object - pattern to match image files
}
```
* `captions: 'callback'` applies a caption returned by the callback. Invoked in the context of an array of gallery images.
* `buttons: 'auto'` hides buttons on touch-enabled devices or when only one image is displayed.

## Compatibility

* IE 8+
* Chrome
* Firefox 3.6+
* Opera 12+
* Safari 5+
* Sleipnir

## Notes

Feel free to report any bugs!

## Credits

Creation of `baguetteBox.js` was inspired by a great jQuery plugin [touchTouch](https://github.com/martinaglv/touchTouch).

## License

Copyright (c) 2015 [feimosi](https://github.com/feimosi/)

This content is released under the [MIT License](http://opensource.org/licenses/MIT).
