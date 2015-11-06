module.exports = {

   entry: "./index.js"

  ,output: {
     path: __dirname + '/dist'
    ,publicPath: '/dist/'
    ,filename: "app.js"
  }

  ,module: {
    loaders: [
        {test: /\.css$/, loader: "style!css"}
    ]
  }

}

