
import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";

import FigureModel from "../models/figure_model";

// import {
//     figureConfirmDialog,
//     hideModal,
//     getJsonWithCredentials
// } from "./util";

export const FigureExportModalView = Backbone.View.extend({

    el: $("#figureExportDialog"),

    model: FigureModel,

    // This will hold the current path in the export dialog, which starts at the user's home dir
    filepath_dirs: [],

    // This will hold the subdirs of the current filepath_dirs, which are shown as options in the export dialog
    current_subdirs: [],

    initialize: function () {

        var self = this;

        // Here we handle init of the dialog when it's shown...
        document.getElementById('figureExportDialog').addEventListener('shown.bs.modal', () => {
            console.log("FigureExportModalView shown... (export options will go here)");

            self.loadSubDirs(self.current_subdirs.join("/")).then(subdirs => {
                self.current_subdirs = subdirs;
                self.render();
            });

            self.render();
        });
    },

    events: {
        "click button.subdir": "handleSubdirClick",
        "click button[type='submit']": "handleSubmit",
        "click button.pathdir": "handlePathDirClick",
    },

    handlePathDirClick: function (event) {
        let index = parseInt(event.target.dataset.index);
        this.filepath_dirs = this.filepath_dirs.slice(0, index + 1);

        this.loadSubDirs(this.filepath_dirs.join("/")).then(subdirs => {
            this.current_subdirs = subdirs;
            this.render();
        });
    },

    handleSubdirClick: function (event) {
        let subdir = event.target.dataset.subdir;
        this.filepath_dirs.push(subdir);

        this.loadSubDirs(this.filepath_dirs.join("/")).then(subdirs => {
            this.current_subdirs = subdirs;
            this.render();
        });
    },

    async loadSubDirs(filepath) {

        let url = `/api/files/home?subpath=${encodeURI(filepath)}`;
        let fdata = await fetch(url).then(response => response.json());

        let subdirNames = fdata.files.map(f => f.name)
            .filter(name => !name.startsWith("."));

        return subdirNames;
    },

    handleSubmit: function (event) {
        event.preventDefault();

        console.log("Export figure... (not implemented yet)");
    },

    render: function() {
        var html = `
        <p style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Path:
            ${this.filepath_dirs.map((dir, index) => `
                <button class="btn btn-link pathdir data" data-index="${index}">${dir}</button> / `).join("")
            }
        </p>

        <ul class="subdirs">
            ${this.current_subdirs.map(subdir => `
                <li>
                    <button class="btn subdir" data-subdir="${subdir}">
                    <i class="bi bi-folder"></i>
                    ${subdir}
                    </button>
                </li>`).join("")}
        </ul>
        
        `;
        
        $('.modal-body', this.$el).html(html);
    }
});
