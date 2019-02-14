
import Backbone from 'backbone';
import PanelModel from './PanelModel';

// ------------------------ Panel Collection -------------------------
const PanelList = Backbone.Collection.extend({
    model: PanelModel,

    getSelected: function() {
        var s = this.filter(function(panel){
            return panel.get('selected');
        });
        return new PanelList(s);
    },

    getAverage: function(attr) {
        return this.getSum(attr) / this.length;
    },

    getAverageWH: function() {
        var sumWH = this.reduce(function(memo, m){
            return memo + (m.get('width')/ m.get('height'));
        }, 0);
        return sumWH / this.length;
    },

    getSum: function(attr) {
        return this.reduce(function(memo, m){
            return memo + (m.get(attr) || 0);
        }, 0);
    },

    getMax: function(attr) {
        return this.reduce(function(memo, m){ return Math.max(memo, m.get(attr)); }, 0);
    },

    getMin: function(attr) {
        return this.reduce(function(memo, m){ return Math.min(memo, m.get(attr)); }, Infinity);
    },

    allTrue: function(attr) {
        return this.reduce(function(memo, m){
            return (memo && m.get(attr));
        }, true);
    },

    // check if all panels have the same value for named attribute
    allEqual: function(attr) {
        var vals = this.pluck(attr);
        return _.max(vals) === _.min(vals);
    },

    // Return the value of named attribute IF it's the same for all panels, otherwise undefined
    getIfEqual: function(attr) {
        var vals = this.pluck(attr);
        if (_.max(vals) === _.min(vals)) {
            return _.max(vals);
        }
    },

    getDeltaTIfEqual: function() {
        var vals = this.map(function(m){ return m.getDeltaT() });
        if (_.max(vals) === _.min(vals)) {
            return _.max(vals);
        }
    },

    createLabelsFromTags: function(options) {
        // Loads Tags for selected images and creates labels
        var image_ids = this.map(function(s){return s.get('imageId')})
        image_ids = "image=" + image_ids.join("&image=");
        // TODO: Use /api/ when annotations is supported
        var url = WEBINDEX_URL + "api/annotations/?type=tag&limit=1000&" + image_ids;
        $.getJSON(url, function(data){
            // Map {iid: {id: 'tag'}, {id: 'names'}}
            var imageTags = data.annotations.reduce(function(prev, t){
                var iid = t.link.parent.id;
                if (!prev[iid]) {
                    prev[iid] = {};
                }
                prev[iid][t.id] = t.textValue;
                return prev;
            }, {});
            // Apply tags to panels
            this.forEach(function(p){
                var iid = p.get('imageId');
                var labels = _.values(imageTags[iid]).map(function(text){
                    return {
                        'text': text,
                        'size': options.size,
                        'position': options.position,
                        'color': options.color
                    }
                });

                p.add_labels(labels);
            });
        }.bind(this));
    }
});

export default PanelList
