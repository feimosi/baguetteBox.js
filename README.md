# baguetteBox.js - With Double Click Trigger Option Added
## _Modified by Paper-Folding_

## __[DECALRE]__ This project is forked from <https://github.com/feimosi/baguetteBox.js> and modified to add double click trigger functionality.
## __Documentation goes below:__
## To enable double click trigger function, you just need to:
> ### 1. Add attribute `bagDblClick` for every `<a>` tag that open baguetteBox originally. Example are shown below:
> ### 2. then set `dblTrigger` option to `true` like below:
> ```javascript
> baguetteBox.run('.grid', {
>                dblTrigger: true
>            });
> ```
> ### __[IMPORTANT] Do not apply href to `<a>` tag(or use `href='javascript:void(0)'` instead, if you want to enable single click feature, see 3 below.)__
> ### 3. __[Optional]__ Use step1 and step2 above are able to trigger baguetteBox by double click images. But you may still want to make single click images to do other things, in that case, first you need to add a option `singleClickCallBack` and specify a function to it like below:
> ```javascript
>   baguetteBox.run('.grid', {
>           dblTrigger: true,
>           singleClickCallBack: function (element, someParameters) { doSomething(element, 'Oh you passed me!'); }
>    });
> ```
> ### then difine this `doSomething` function like this:
> ```javascript
>    function doSomething(element, msg) {
>        console.log(element.srcElement.src); // the parameter 'element' here is the source image element which user click, for example, this example here will print the image's src attribute in console when user single clicked it.
>        console.log(msg); // this 'msg' here is defined by you, you can pass anything to it and even add more parameters to the function itself.
>    }
> ```
> ### Keep in mind that if you set `dblTrigger` to `false` which means you are not enable double click trigger feature, set the `singleClickCallBack` will take no effect.
> ### Below I've got a full example for you(ommitted unrelated parts):
> ### __HTML__
> ```html
><div class="grid">
>    <a bagDblClick="img/2-1.jpg">
>        <img src="img/thumbnails/2-1.jpg" alt="First image">
>    </a>
>    <a bagDblClick="img/2-2.jpg">
>        <img src="img/thumbnails/2-2.jpg" alt="Second image">
>    </a>
>    ...
></div>
> ```
> ### __JS__
> ```javascript
>   baguetteBox.run('.grid', {
>           dblTrigger: true,
>           singleClickCallBack: function (element, someParameters) { doSomething(element, 'Oh you passed me!'); }
>    });
>    function doSomething(element, msg) {
>        console.log(element.srcElement.src);
>        console.log(msg);
>    }
> ```
> ### 4. __[Optional]__ If you still want to implement with single click to trigger the baguetteBox, you can choose to use the original developer's version: <https://github.com/feimosi/baguetteBox.js> . Or you can still use my version: __All you need to do is replace `href` attribute to `bagClick` and set `dblTrigger` to `false`__, here is the full example:
> ### __HTML__
> ```html
><div class="grid">
>    <a bagClick="img/2-1.jpg">
>        <img src="img/thumbnails/2-1.jpg" alt="First image">
>    </a>
>    <a bagClick="img/2-2.jpg">
>        <img src="img/thumbnails/2-2.jpg" alt="Second image">
>    </a>
>    ...
></div>
> ```
> ### __JS__
> ```javascript
>   baguetteBox.run('.grid', {
>           dblTrigger: false
>    });
> ```
> ### Trivia
> ### Q: _Why do I abandoned href to trigger?_
> ### A: _Because if href was still applied `<a>` tag, it will do the default behavior that `<a>` tag is always to: like jump to another page, fly to an anchor and so on, no matter user is single clicking or double clicking the `<a>` tag, but you know `<a>` tag can respond to onclick,too, that's why I remove the `href` for every `<a>` tags that will open baguetteBox and used my custom defined attribute(`bagClick` and `dblBagClick` here)._
> ## For a complete example of my modification, see `/demo/doubleClickExample.html` file for detail.