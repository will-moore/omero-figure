
// var $ = require("jquery");

$(function(){
    console.log("Hello world 7!")

    // keep-alive ping every minute, so that OMERO session doesn't die
    setInterval(function (){
        // TODO: fix URL
        $.get("/webclient/keepalive_ping/");
    }, 60000);
});
