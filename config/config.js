const fetch = require("node-fetch");
const Store = require("electron-store");
const got = require("got");
const store = new Store();
const fs = require("fs");
//
// const serverconfig=fs.readFileSync("config/server-config.json").toString().trim();
(function () {
  var utils = {};
  var data = null;
  var config = null;
  var DappServer = null;
  utils.init = function (callback) {
    got("https://storage.googleapis.com/wandx-desktop-wallet/config.json").then(
      function (response) {
        //console.log(response);
        // console.log("response",JSON.parse(response.body).desktopConfig)
        DappServer = JSON.parse(response.body).desktopConfig;
        // DappServer=JSON.parse(serverconfig).desktopConfig
        //console.log("daap", DappServer);

        callback(DappServer);
      }
    );
  };
  utils.getConfig = function (callback) {
    got("https://storage.googleapis.com/wandx-desktop-wallet/config.json").then(
      function (response) {
        config = JSON.parse(response.body).desktopConfig;
        //  config = JSON.parse(serverconfig).desktopConfig;
        //console.log(response.body);
        callback(config);
      }
    );
  };
  utils.getUpdateData = function (callback) {
    got("https://gitlab.com/api/v4/projects/7628403/repository/tags", {
      headers: {
        "PRIVATE-TOKEN": "d4zLXj2BasyrcyerDEiy",
        "Content-Type": "application/json",
      },
    }).then(function (response) {
      data = response.body;
      callback(data);
    });
  };
  utils.getData = function () {
    return DappServer.DappServer;
  };
  utils.getTag = function () {
    return data;
  };
  module.exports = utils;
})();
