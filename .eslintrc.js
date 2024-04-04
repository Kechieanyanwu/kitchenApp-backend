module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es2021': true
    },  
    'extends': 'eslint:recommended',
    'overrides': [
        {
            'env': {
                'node': true
            },
            'files': [
                '.eslintrc.{js,cjs}'
            ],
            'parserOptions': {
                'sourceType': 'script'
            }
        }
    ],
    'parserOptions': {
        'ecmaVersion': 'latest'
    },
    'rules': {
        // 4 spaces for indentation
        'indent': ['warn', 4],
        // single quotes for strings
        'quotes': ['error', 'single'],
        //space between keys of an object
        'key-spacing': ['error', { beforeColon: false, afterColon: true }],
        // space at the start and end of objects
        'object-curly-spacing': ['error', 'always'],
        //require semi-colons at the end
        semi: ['error', 'always'],
        // enforce spacing before and after semicolons
        'semi-spacing': ['error', { before: false, after: true }],
    }
};