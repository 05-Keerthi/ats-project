module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }], // for Node
    "@babel/preset-react", // for JSX
    "@babel/preset-typescript", // for TS/TSX
  ],
};
