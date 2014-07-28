baguetteBox.js
==============

Simple and easy to use lightbox script.

[Demo page](https://feimosi.github.io/baguetteBox.js/)

## Features

* Written in pure JavaScript, no dependencies required
* Multiple galleries support with custom options each
* Touch-screen devices support with swipe gestures
* Modern and minimal look
* Image captions support
* CSS3 transitions
* SVG buttons, no extra files to download
* Around 1.6KB gzipped

## Usage

1. Download `baguetteBox.min.css` and `baguetteBox.min.js` files from `dist` folder.
2. Include them somewhere in you document:
  ```html
  	<link rel="stylesheet" href="css/baguetteBox.min.css">
  	<script src="js/baguetteBox.min.js"></script>
  ```

3. Initialize the script by running:
  ```js
    baguetteBox.run('.gallery', {
      // Custom options
    });
  ```
  where the first argument is a selector to gallery containing anchor tags. The HTML code may look like this:

  ```html
  	<div class="baguetteBox gallery">
  		<a href="img/2-1.jpg" data-caption="Additional image caption"><img src="img/thumbs/2-1.jpg"></a>
  		<a href="img/2-2.jpg"><img src="img/thumbs/2-2.jpg"></a>
      ...
  	</div>
  ```
  
4. To use captions, put `data-caption` attribute on `a` tag.

## Customization

You can pass as a second paramater an object with custom options. The following are available with corresponding defaults:
```javascript
{
  captions: true,       // true|false - Display image captions
  buttons: 'auto',      // 'auto'|true|false - Display buttons
  async: false,         // true|false - Load files asynchronously
  preload: 2,           // [number] - How many files should be preloaded from current image
  animation: 'slideIn'  // 'slideIn'|'fadeIn' - Animation type
}
```
`buttons: 'auto'` hides buttons on touch-enabled devices and when only one image is displayed.

## Compatibility

* IE9+
* Chrome
* Firefox 3.6+
* Opera 12+

## Notes

Feel free to report any bugs or suggest new features!

## Credits

Creation of `baguetteBox.js` was inspired by great jQuery plugin [touchTouch](https://github.com/martinaglv/touchTouch).

## License

Copyright (c) 2014 [feimosi](https://github.com/feimosi/)

This content is released under the [MIT License](http://opensource.org/licenses/MIT).
