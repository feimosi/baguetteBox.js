# baguetteBox.js - With Double Click Trigger Option Added
## _Modified by Paper-Folding_

## __[DECALRE]__ This project is forked from <https://github.com/feimosi/baguetteBox.js> and modified to add double click trigger functionality.
## __Documentation goes below:__
## To enable double click trigger function, you just need to:
> ### 1. Add attribute `bagDblClick` for every `<a>` tag that open baguetteBox originally.
> ### 2. then set `dblTrigger` option to `true` like below:
> ```javascript
> baguetteBox.run('.grid', {
>                dblTrigger: true
>            });
> ```
> ### __[IMPORTANT] Do not apply href to `<a>` tag(or use `href='javascript:void(0)'` instead, if you want to enable single click feature, see step 3 below.)__
> ### 3. __[Optional]__ Use step1 and step2 above are able to trigger baguetteBox by double clicking images. But you may still want to make single click images to do other things, in that case, first you need to add an option `singleClickCallBack` and specify a function to it like below:
> ```javascript
>   baguetteBox.run('.grid', {
>           dblTrigger: true,
>           singleClickCallBack: function (element, someParameters) { doSomething(element, 'Oh you pressed me!'); }
>    });
> ```
> ### then define this `doSomething` function like this:
> ```javascript
>    function doSomething(element, msg) {
>        console.log(element.srcElement.src); // the parameter 'element' here is the source image element which user click, for example, this example here will print the image's src attribute in console when user single clicked it.
>        console.log(msg); // this 'msg' here is defined by you, you can pass anything to it and even add more parameters to the function itself.
>    }
> ```
> ### Keep in mind that if you set `dblTrigger` to `false` which means you are not enable double click trigger feature, set the `singleClickCallBack` will take no effect.
> ### __[Tip]__ You can define the timeout value that differentiates a double click and a single click by setting `doubleClickJudgeTimeout` option. If two successive clicks on an image has a time defference less than its value, it will be regraded as a double click, otherwise its a single click. This option's values is metered by milliseconds.
> ### Below I've got a full example (ommitted unrelated parts):
> ### __HTML__
> ```html
><div class="grid">
>    <a href="javascript:void(0)" dblHref="img/2-1.jpg">
>        <img src="img/thumbnails/2-1.jpg" alt="First image">
>    </a>
>    <a href="javascript:void(0)" dblHref="img/2-2.jpg">
>        <img src="img/thumbnails/2-2.jpg" alt="Second image">
>    </a>
>    ...
></div>
> ```
> ### __JS__
> ```javascript
>   baguetteBox.run('.grid', {
>           dblTrigger: true,
>           singleClickCallBack: function (element, someParameters) { doSomething(element, 'Oh you pressed me!'); }
>    });
>
>    function doSomething(element, msg) {
>        console.log(element.srcElement.src);
>        console.log(msg);
>    }
> ```
> ### 4. __[Optional]__ If you still want to implement with single click to trigger the baguetteBox, just do what the original developers said in their version.(You do not need to set `dblTrigger`, by default its value is `false`) I still offer an example here which you will see in the original developers' version.
> ### __HTML__
> ```html
><div class="grid">
>    <a href="img/2-1.jpg">
>        <img src="img/thumbnails/2-1.jpg" alt="First image">
>    </a>
>    <a href="img/2-2.jpg">
>        <img src="img/thumbnails/2-2.jpg" alt="Second image">
>    </a>
>    ...
></div>
> ```
> ### __JS__
> ```javascript
>   baguetteBox.run('.grid', {});
> ```
>
## Trivia
> ### Q: _Why do I abandoned href to trigger double click?_
> ### A: _Because if href was still applied to `<a>` tag, it will still trigger its default behaviors(like jump to another page, fly to an anchor and so on) every time even if user double clicked it. But you know `<a>` tag can respond to click event, too, that's why I recommend to remove the `href` for every `<a>` tags that will open baguetteBox by double clicking._
> ### __[Tip]__: Do not use `dblHref` and `href` at the same time when you enabled double trigger feature, if you insist to use `href`, set its value to `javascript:void(0)`.
> ## For a complete example of my modification, see this [double click demo file](/demo/doubleClickExample.html) for detail.
