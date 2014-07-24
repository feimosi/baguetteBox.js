baguetteBox.js
==============

Simple and easy to use lightbox script.

## Features

* Written in pure JavaScript, no dependencies like jQuery required
* Modern and minimal look
* Multiple galleries support
* Image captions support
* CSS3 transitions
* SVG buttons, no extra files to download

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
  
## Notes

It's still a work in progress and the script works well only on modern browsers.
Feel free to report any bugs or suggest new features!
