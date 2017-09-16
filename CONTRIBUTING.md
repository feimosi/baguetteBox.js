# Contributing to baguetteBox.js

Please read these guidelines before contributing code.

## :nut_and_bolt: Setting up the development environment
- Fork and clone the repository
- `npm install`
- `npm start`
- Demo page with live reload is available at `localhost:3000`

## :bug: Fixing a Bug
When fixing a bug please make sure to test it on as many browsers as possible (see: [Compatibility](./README.md#compatibility)). If you are not able to do so, mention that in a PR comment, so other contributors can do it.

## :tada: Proposing a Change
When implementing a feature please create an issue first explaining your idea and asking whether there's need for such a feature.
Remember the script's core philosophy is to stay simple and minimal, doing one thing and doing it right.

## :pencil: Before you open a Pull Request
- Follow Git best practices (especially use meaningful commit messages).
- Describe thoroughly you work in a PR comment.
- Be patient and understanding. It's a side project, done in free time.

Thank you to everyone who has contributed to baguetteBox.js!

## :rocket: Releasing the next version

#### :heavy_exclamation_mark: This should be done only by core contributors :heavy_exclamation_mark:

Build the script
```sh
gulp build
git add --update
git commit -m "Build update"
```

Bump the version
```sh
gulp release # or gulp patch
git add --update
git commit -m "v1.8.0"
```

Push changes
```sh
git push
```

Add a tag
```sh
git tag v1.8.0
git push --tags
```

Deploy the new demo page
```sh
gulp deploy
cd ./publish
git push
```

Publish the new version to `npm`
```sh
npm publish
```
