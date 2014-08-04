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
* Responsive images
* CSS3 transitions
* SVG buttons, no extra files to download
* Around 2KB gzipped

## Installation

### Bower

`bower install baguettebox.js`

### Manually

1. Download `baguetteBox.min.css` and `baguetteBox.min.js` files from `dist` folder.
2. Include them somewhere in you document:

  ```html
<link rel="stylesheet" href="css/baguetteBox.min.css">
<script src="js/baguetteBox.min.js" async></script>
  ```

## Usage

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

## Responsive images

To use this feature, simply put `data-at-{width}` attributes on `a` tags with value being a path to the desired image. `{width}` should be the maximum screen width at which the image can be displayed. The script chooses the first image with `{width}` being bigger or equal to the current screen width for best user experience.

That's how the HTML code can look like:
```html
<a href="img/2-1.jpg" 
  data-at-450="img/thumbs/2-1.jpg" 
  data-at-800="img/small/2-1.jpg" 
  data-at-1366="img/medium/2-1.jpg" 
  data-at-1920="img/big/2-1.jpg">
    <img src="img/thumbs/2-1.jpg">
</a>
```
If you have 1366x768 resolution it'll choose `"img/medium/2-1.jpg"`. If, however, it's 1440x900 it'll choose `"img/big/2-1.jpg"`. Keep `href` attribute as a fallback (link to a bigger image eg. Full HD).

## Customization

You can pass as a second parameter an object with custom options. The following are available with corresponding defaults:
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

* IE8+
* Chrome
* Firefox 3.6+
* Opera 12+

## Notes

Feel free to report any bugs!

## Credits

Creation of `baguetteBox.js` was inspired by great jQuery plugin [touchTouch](https://github.com/martinaglv/touchTouch).

## License

Copyright (c) 2014 [feimosi](https://github.com/feimosi/)

This content is released under the [MIT License](http://opensource.org/licenses/MIT).
