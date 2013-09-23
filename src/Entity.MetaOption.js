var MetaOption = function(name, applier) {

    if (this instanceof MetaOption) {
        if (!Helper.isString(name)) {
            applier = name;
            name    = undefined;
        }

        this.name = name;

        if (Helper.isObject(applier)) {
            Helper.extend(this, applier);
        }
        else if (Helper.isFunction(applier)) {
            this.applier = applier;
        }
        else if (!Helper.isUndefined(applier)) {
            throw new Error('Wrong meta option applier type!');
        }
    }
    else {
        return Helper.createClass({
            parent:     MetaOption,
            properties: Helper.isFunction(name) ? { applier: name } : name
        });
    }
}

MetaOption.prototype = {

    apply: function(meta, object) {
        if (Helper.isEmpty(this.name)) {
            throw new Error('You must set name to meta option before calling apply!');
        }
        if (Helper.isEmpty(meta[this.name])) {
            return;
        }

        var args = [meta[this.name], object].concat(Array.prototype.slice.call(arguments,2));
        var applier = this.applier || this.defaultApplier;

        applier.apply(this, args);
    },

    defaultApplier: function() {
        var args = Array.prototype.slice.call(arguments);

        if (!Helper.isUndefined(this.beforeApply)) { this.beforeApply.apply(this, args); }

        this.applyInterface.apply(this, args);
        this.applyMeta.apply(this, args);

        if (!Helper.isUndefined(this.afterApply))  { this.afterApply.apply(this, args);  }
    },

    applyMeta: function(meta, object) {
        for (var property in meta) {
            this.Meta.apply.call(this.Meta, meta[property], object, property);
        }
    },

    applyInterface: function(meta, object) {

        if (Helper.isUndefined(object['___metaInterfaces'])) {
            object['___metaInterfaces'] = [];
        }

        if (-1 === object['___metaInterfaces'].indexOf(this.name)) {
            for (var property in this.Interface) {
                object[property] = this.Interface[property];
            }
            object['___metaInterfaces'].push(this.name);
        }
    },

    Meta: new Meta(),
    Interface: {}
};