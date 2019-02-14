
import FigureModel from './js/models/FigureModel'

$(function(){
    // keep-alive ping every minute, so that OMERO session doesn't die
    setInterval(function (){
        // TODO: fix URL
        $.get("/webclient/keepalive_ping/");
    }, 60000);

    const figureModel = new FigureModel();

});
