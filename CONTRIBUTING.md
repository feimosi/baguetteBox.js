# Contributing to baguetteBox.js

Please read these guidelines before contributing code.

## Setting up the development environment
- Fork and clone the repository
- `npm install`
- `npm start`
- Demo page with live reload is available at `localhost:3000`
- Core source files live in `src/baguetteBox.ts` and `src/baguetteBox.css`

## Fixing a bug
When fixing a bug please make sure to test it on as many browsers as possible (see: [Compatibility](./README.md#compatibility)). If you are not able to do so, mention that in a PR comment, so other contributors can do it.

## Proposing a change
When implementing a feature please create an issue first explaining your idea and asking whether there's a need for such a feature.
Remember the script's core philosophy is to stay simple and minimal, doing one thing and doing it right.

## Before you open a pull request
- Follow Git best practices (especially use meaningful commit messages).
- Run `npm test` and `npm run test:ui`.
- Describe thoroughly your work in a PR comment.
- Be patient and understanding. It's a side project, done in free time.

Thank you to everyone who has contributed to baguetteBox.js!

## Releasing the next version

This should be done only by core contributors.

Compatible node version: v22

Build the script
```sh
npm run build
npm test
npm run test:ui
git add --update
git commit -m "Build update"
```

Bump the version
```sh
npm run release # or npm run patch
npm install
git add --update
git commit -m "v1.8.0"
```

Push changes
```sh
git push
```

Merge `master` branch
```sh
git checkout master
git merge --ff-only dev
```

Add a tag
```sh
git tag v1.8.0
git push
git push --tags
```

Deploy the new demo page
```sh
npx gulp deploy
cd .publish
git push
cd ..
```

Publish the new version to `npm`
```sh
npm publish
git checkout dev
```

Add a new release on GitHub
https://github.com/feimosi/baguetteBox.js/releases/new
