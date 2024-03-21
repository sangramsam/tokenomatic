const config = require('../config/config');
const semver = require('semver');
const shell = require('electron').shell;
const package = require('../package');
window.onload = function () {
  var flag=0;
  var loader = document.getElementById("loader");
  var content = document.getElementById("content");
  config.getUpdateData(function (res) {
    var data = JSON.parse(res);
    console.log("called", data )
    for (var i = 0; i < data.length; i++) {
      if (semver.gt(data[i].name.split("v")[1],package.version)) {
        console.log("called", data[i].name)
        flag=1;
        loader.style.display="none";
        content.style.display="block";
        var para = document.createElement("p");
        var node = document.createTextNode("New Wandx Desktop Wallet Version available");
        para.appendChild(node);
        var element = document.getElementById("div1");
        element.appendChild(para);
        var download = document.getElementById("download");
        download.style.display = "block";
        break;
      }
    }
    if(flag===0){
      loader.style.display="none";
      content.style.display="block";
      var para1 = document.createElement("p");
      var node1 = document.createTextNode("No Update Found.");
      para1.appendChild(node1);
      var element1 = document.getElementById("div1");
      element1.appendChild(para1);
    }

  });
  document.getElementById("download").addEventListener('click',function (ev) {
    ev.preventDefault();
    shell.openExternal("https://www.wandx.co");
  });
};
