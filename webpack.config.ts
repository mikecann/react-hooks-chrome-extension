import { Configuration, DefinePlugin } from "webpack";

const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv == "production";

const config: Configuration = {
  entry: {
    background: "./src/scripts/background/index.tsx",
    settings: "./src/scripts/settings/index.tsx",
    contentScript: "./src/scripts/contentScript/index.tsx",
    browserAction: "./src/scripts/browserAction/index.tsx"
  },
  output: {
    filename: "[name]-bundle.js",
    path: __dirname + "/dist"
  },

  mode: isProd ? "production" : "development",

  devtool: isProd ? undefined : "source-map",

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  },

  plugins: [
    // new LiveReloadPlugin(),
    // new CheckerPlugin(),
    new DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(nodeEnv)
      }
    })
  ]
};

export default config;
