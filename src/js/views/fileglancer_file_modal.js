
import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";

import FigureModel from "../models/figure_model";
import { showModal, hideModal } from "./util";


export const FileglancerFilePicker = Backbone.View.extend({

    el: $("#fileglancerFilePickerModal"),

    model: FigureModel,

    subtitle: "Choose file",

    allow_files: [".json"], // allowed file extensions (if empty, only directories are shown)

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
        $("button[type='submit']", this.$el).text(options.okbutton || "OK").prop("disabled", true);

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
        event.target.setAttribute("disabled", "true");
        let subdir = event.target.dataset.subdir;
        if (subdir) {
            this.filepath_dirs.push(subdir);

            this.loadSubDirs().then(subdirs => {
                this.current_subdirs = subdirs;
                this.render();
            });
        } else if (this.allow_files.length > 0) {
            let filename = event.target.dataset.filename;
            if (filename) {
                this.filepath_dirs.push(filename);
                this.current_subdirs = [];
                this.render();
            }
        }
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
    <div style="display: flex; flex-direction: column; position: absolute; inset: 0">
        <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px; flex: 0 0 auto;">
            <div style="padding: 10px 10px 0 10px;">${this.subtitle}:</div>
            <button class="btn btn-link pathdir" data-index="-1">
                <i class="bi bi-house"></i>
            </button>/

            ${this.filepath_dirs.map((dir, index) => `
                <button class="btn btn-link pathdir" data-index="${index}">${dir}</button>/`).join("")
            }
        </div>

        <ul class="subdirs" style="flex: 1 1 auto; overflow-y: auto">
            ${this.current_subdirs.map(subdir => `
                <li>${subdir.is_dir ?
                    `<button class="btn subdir" data-subdir="${subdir.name}">
                    <i class="bi bi-folder-fill"></i>
                    ${subdir.name}
                    </button>`:
                    // if we allow files ('allow_files' is set)
                    this.allow_files.some(ext => subdir.name.endsWith(ext)) ? 
                    `<button class="btn subdir" data-filename="${subdir.name}">
                    <i class="bi bi-file-earmark"></i>
                    ${subdir.name}
                    </button>`:

                    `<div style="padding: 3px; opacity: 0.5"><i class="bi bi-file-earmark"></i> ${subdir.name}</div>`}
                </li>`).join("")}
        </ul>
    </div>
        `;
        
        $('.modal-body', this.$el).html(html);
    }
});

// create single instance:
const FileglancerFilePickerModal = new FileglancerFilePicker();

export default FileglancerFilePickerModal
