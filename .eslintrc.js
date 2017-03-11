module.exports = {
    env: {
        "browser": true
    },
    globals: {
        baguetteBox: true,
        hljs: true
    },
    extends: "eslint:recommended",
    rules: {
        "indent": [
            "error",
            4
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
