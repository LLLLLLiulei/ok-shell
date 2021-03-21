module.exports = function (api) {
  if (api && api.cache) {
    api.cache(true)
  }
  const babelrc = {
    comments: false,
    env: {
      main: {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: 10,
              },
            },
          ],
        ],
      },
      renderer: {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: ['chrome >= 54'],
              },
              modules: false,
            },
          ],
        ],
      },
      web: {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: ['chrome >= 45'],
              },
              modules: false,
            },
          ],
        ],
      },
    },
    plugins: [
      // 'transform-vue-jsx',
      '@vue/babel-plugin-jsx',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
    ],
  }
  if (process.env.BABEL_ENV) {
    console.log('process.env.BABEL_ENV ', process.env.BABEL_ENV)
    return {
      presets: babelrc.env[process.env.BABEL_ENV].presets,
      plugins: babelrc.plugins,
    }
  } else {
    throw new Error('没有配置 process.env.BABEL_ENV')
  }
}
