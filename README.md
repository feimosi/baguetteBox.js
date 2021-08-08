<h1 align="center">baguetteBox.js</h1>

### This project is forked from <https://github.com/feimosi/baguetteBox.js>
### This project is modified original version and trigger baguetteBox with double click only.
### To enable double click trigger function, just add attribute `dblHref` for every `<a>` tag that open baguetteBox originally. Example are shown below:

## Feimosi's original single click trigger version example:
```angular2html
<div class="gallery">
    <a href="img/2-1.jpg" data-caption="Image caption">
        <img src="img/thumbnails/2-1.jpg" alt="First image">
    </a>
    <a href="img/2-2.jpg">
        <img src="img/thumbnails/2-2.jpg" alt="Second image">
    </a>
    ...
</div>
```
## My modified double click trigger version example:
```angular2html
<div class="gallery">
    <a href="#" dblHref="img/2-1.jpg" data-caption="Image caption">
        <img src="img/thumbnails/2-1.jpg" alt="First image">
    </a>
    <a href="#" dblHref="img/2-2.jpg">
        <img src="img/thumbnails/2-2.jpg" alt="Second image">
    </a>
    ...
</div>
```
