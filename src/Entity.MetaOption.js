var MetaOption = function(name, applier) {
    if (!Helper.isString(name)) {
        applier = name;
        name    = undefined;
    }
    this.name    = name;
    this.applier = applier;
}

MetaOption.prototype = {

    apply: function(meta, object) {
        if (Helper.isEmpty(this.name)) {
            throw new Error('You must set name to meta option before calling apply!');
        }
        if (Helper.isEmpty(meta[this.name])) {
            return;
        }

        var args = [meta[this.name], object].concat(Array.slice.call(arguments,2));

        Helper.isObject(this.applier)
            ? this.applier.apply.apply(this.applier, args)
            : this.applier.apply(this, args);
    },

    applier: function(meta, object) {
        var args = [meta[this.name], object].concat(Array.slice.call(arguments,2));

        this.applyInterface.apply(this, args);
        this.applyMeta.apply(this, args);
    },

    applyMeta: function(meta, object) {
        for (var property in meta) {
            this.Meta.apply.apply(this, [meta[property]].concat(Array.slice.call(arguments,1)));
        }
    },

    applyInterface: function(meta, object) {

        if (Helper.isUndefined(object['___metaInterfaces'])) {
            object['___metaInterfaces'] = [];
        }

        if (-1 === object['___metaInterfaces'][this.name]) {
            for (var property in this.Interface) {
                object[property] = this.Interface[property];
            }
            object['___metaInterfaces'].push(this.name);
        }
    },

    Meta: new Meta(),
    Interface: {}
};