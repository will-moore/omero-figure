
import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";

import FigureModel from "../models/figure_model";
import { showModal, hideModal } from "./util";


export const FileglancerFilePicker = Backbone.View.extend({

    el: $("#fileglancerFilePickerModal"),

    model: FigureModel,

    subtitle: "Choose file",

    // This will hold the current path in the export dialog, which starts at the user's home dir
    filepath_dirs: [],

    // This will hold the subdirs of the current filepath_dirs, which are shown as options in the export dialog
    // Each is an object with { name: "subdir_name", is_dir: true/false }
    current_subdirs: [],

    // initialize: function () {

    //     var self = this;

        // Here we handle init of the dialog when it's shown...
        // document.getElementById('figureExportDialog').addEventListener('shown.bs.modal', () => {
        //     $("button[type='submit']", self.$el).prop("disabled", true);

        //     self.loadSubDirs().then(subdirs => {
        //         self.current_subdirs = subdirs;
        //         self.render();
        //     });

        //     self.render();
        // });
    // },

    show: function(options) {
        showModal("fileglancerFilePickerModal");

        if (options.title) {
            $(".modal-title", this.$el).text(options.title);
        }

        this.subtitle = options.subtitle || "Choose file";

        // save callback to use on submit
        if (options.success) {
            this.success = options.success;
        }

        let self = this;

        self.loadSubDirs().then(subdirs => {
            self.current_subdirs = subdirs;
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

        this.loadSubDirs().then(subdirs => {
            this.current_subdirs = subdirs;
            this.render();
        });
    },

    handleSubdirClick: function (event) {
        let subdir = event.target.dataset.subdir;
        this.filepath_dirs.push(subdir);

        this.loadSubDirs().then(subdirs => {
            this.current_subdirs = subdirs;
            this.render();
        });
        $("button[type='submit']", this.$el).prop("disabled", false);
    },

    async loadSubDirs() {

        let filepath = this.filepath_dirs.join("/");

        let url = `/api/files/home?subpath=${encodeURI(filepath)}`;
        let fdata = await fetch(url).then(response => response.json()).catch(error => {
            console.error("Error fetching subdirs:", error);
            return { files: [] };
        });

        let subdirs = fdata.files.filter(f => !f.name.startsWith("."))
            .map(f => ({ name: f.name, is_dir: f.is_dir }));

        return subdirs;
    },

    handleSubmit: function (event) {
        event.preventDefault();

        if (this.success) {
            this.success(this.filepath_dirs, this.current_subdirs);
        }
    },

    render: function() {
        var html = `
        <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            <div>${this.subtitle}:</div>
            <button class="btn btn-link pathdir" data-index="-1">
                <i class="bi bi-house"></i>
            </button>/

            ${this.filepath_dirs.map((dir, index) => `
                <button class="btn btn-link pathdir" data-index="${index}">${dir}</button>/`).join("")
            }
        </div>

        <ul class="subdirs">
            ${this.current_subdirs.map(subdir => `
                <li>${subdir.is_dir ?
                    `<button class="btn subdir" data-subdir="${subdir.name}">
                    <i class="bi bi-folder-fill"></i>
                    ${subdir.name}
                    </button>`:
                    `<div style="padding: 3px;"><i class="bi bi-file-earmark"></i> ${subdir.name}</div>`}
                </li>`).join("")}
        </ul>
        
        `;
        
        $('.modal-body', this.$el).html(html);
    }
});

// create single instance:
const FileglancerFilePickerModal = new FileglancerFilePicker();

export default FileglancerFilePickerModal
