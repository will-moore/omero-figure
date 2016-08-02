
//
// Copyright (C) 2016 University of Dundee & Open Microscopy Environment.
// All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//


// Should only ever have a singleton on this
var LutModalView = Backbone.View.extend({

    el: $("#lutModal"),

    template: JST["static/figure/templates/modal_dialogs/lut_modal.html"],

    initialize:function () {
        
    },

    loadLuts: function() {
        var url = WEBGATEWAYINDEX + "luts/";
        var promise = $.getJSON(url);
        return promise;
    },

    events: {
        // "submit .colorpickerForm": "handleColorpicker",
        "click .lutOption": "pickLut",
        "click button[type='submit']": "handleSubmit",
    },

    pickLut: function(event) {
        console.log('pickLut', this, event.target);
        var lutName = $(event.target).attr('data-lutName');
        this.lutName = lutName;
        // this.success(lutName);
    },

    handleSubmit: function(event) {
        if (this.lutName) {
            this.success(this.lutName);
            $("#lutModal").modal('hide');
        }
    },

    show: function(options) {

        $("#lutModal").modal('show');

        // save callback to use on submit
        if (options.success) {
            this.success = options.success;
        }

        this.loadLuts().done(function(data){
            this.luts = data;
            this.render();
        }.bind(this));
    },

    render:function () {
        console.log('render', this.luts);

        var html = this.template(this.luts);

        $('.modal-body', this.el).html(html);
    }
});
