var ClassBuilder = {

    _metaOptions: {},

    buildClass: function(name, parent, meta) {
        if (typeof meta == 'undefined') {
            meta   = parent;
            parent = undefined;
        }
        Event.trigger('BEFORE_CREATE_CLASS', { className: name });

        var clazz = this.applyMeta(this.createClass(name, parent), meta);

        Event.trigger('AFTER_CREATE_CLASS', { className: name });
        return clazz;
    },

    createClass: function(name, parent) {

        var Clazz = function() { return function (data) { return BaseClass.call(this, data); } };
        Clazz.prototype = Object.create(!Helper.isEmpty(parent) ? parent : null);

        var clazz = new Clazz();
        clazz.prototype = Object.create(!Helper.isEmpty(parent) ? parent.prototype : null);

        clazz.name   = name;
        clazz.parent = parent;

        clazz.prototype.class = clazz;

        return clazz;
    },

    applyMeta: function(clazz, meta) {

        clazz.meta = meta;

        for (var i = 0, ii = this._metaOptions.length; i < ii; ++i) {
            clazz = this._metaOptions[i].apply(clazz, meta);
        }
        return clazz;
    },

    getMetaOptions: function() {
        return this._metaOptions;
    },

    addMetaOption: function(option, applier) {
        if (!(option instanceof MetaOption)) {
            option = new MetaOption(option, applier);
        }
        this._metaOptions[option.getName()] = option;
        return this;
    },

    getMetaOption: function(name) {
        if (!this.hasMetaOption(name)) {
            throw new Error('Meta option "' + name + '" does not exists!');
        }
        return this._metaOptions[name];
    },

    hasMetaOption: function(name) {
        return !Helper.isEmpty(this._metaOptions[name]);
    },

    removeMetaOption: function(name) {
        if (!this.hasMetaOption(name)) {
            throw new Error('Meta option "' + name + '" does not exists!');
        }
        delete this._metaOptions[name];
        return this;
    }
};