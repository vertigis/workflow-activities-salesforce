module.exports = {
    extends: [
        require.resolve("@vertigis/workflow-sdk/config/.eslintrc"),
        "plugin:eslint-comments/recommended"
    ],
    parserOptions: {
        tsconfigRootDir: __dirname,
    },
    rules: {
        "eslint-comments/no-unused-disable": "error"
    },
};
