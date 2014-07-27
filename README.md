baguetteBox.js
==============

Simple and easy to use lightbox script.

## Features

* Written in pure JavaScript, no dependencies required
* Modern and minimal look
* Multiple galleries support
* Image captions support
* CSS3 transitions
* SVG buttons, no extra files to download
* Around 1.5KB gzipped

## Usage

1. Download `baguetteBox.min.css` and `baguetteBox.min.js` files from `dist` folder.
2. Include them somewhere in you document:
  ```html
  	<link rel="stylesheet" href="css/baguetteBox.min.css">
  	<script src="js/baguetteBox.min.js"></script>
  ```

3. Initialize the script by running `baguetteBox(selector)`, where the first argument is a selector to gallery containing anchor tags. The HTML code may look like this:

  ```html
  	<div class="baguetteBox gallery">
  		<a href="img/2-1.jpg"><img src="img/thumbs/2-1.jpg"></a>
  		<a href="img/2-2.jpg"><img src="img/thumbs/2-2.jpg"></a>
      ...
  	</div>
  ```
  
4. To use captions, put `data-caption` attribute on `a` tag.

## Customization

You can pass as a second paramater an object with custom options. The following are available with corresponding defaults:
```javascript
{
  captions: true,   // Display image captions
  buttons: true,    // Display buttons
  async: false,     // Preload files asynchronously
  preload: 2        // How many images should be preloaded
}
```
  
## Compatibility

Tested on the following browsers.
- IE9+
- Firefox 3.6 and 32
- Chrome 37 
- Opera 23

What about IE8?
The extra code would take to much space and make the code less readable so I decided to give up on this.

## Notes

Feel free to report any bugs or suggest new features!

## Credits

Creation of `baguetteBox.js` was inspired by great jQuery plugin [touchTouch](https://github.com/martinaglv/touchTouch).
