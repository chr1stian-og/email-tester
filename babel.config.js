module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      "@babel/preset-env",
      {
        targets: {
          ie: "11",
        },
        useBuiltIns: "usage",
        corejs: "3",
      },
    ],
    "@babel/preset-react",
  ];

  return {
    presets,
  };
};
