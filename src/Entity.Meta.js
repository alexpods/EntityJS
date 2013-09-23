var Meta = function(options) {
    this._options = {};

    if (Helper.isArray(options)) {
        for (var i = 0, ii = options.length; i < ii; ++i) {
            this.addOption(options[i])
        }
    }
    else if (Helper.isObject(options)) {
        for (var option in options) {
            this.addOption(option, options[option]);
        }
    }
    else {
        throw new Error('Wrong meta options argument type!');
    }
}

Meta.prototype = {

    apply: function() {
        for (var name in this._options) {
            this._options[name].apply.apply(this._options[name], Array.slice.call(arguments));
        }
    },

    getOptions: function() {
        return this._options;
    },

    addOption: function(option, applier) {
        if (applier instanceof MetaOption) {
            applier.name = option;
            option = applier;
        }
        if (!(option instanceof MetaOption)) {
            if (Helper.isArray(option)) {
                option = new MetaOption(option[0], option[1]);
            }
            else if (!Helper.isUndefined(applier)) {
                option = new MetaOption(option, applier);
            }
            else {
                throw new Error('Wrong meta option argument type!');
            }
        }
        this._options[option.getName()] = option;
        return this;
    },

    getOption: function(name) {
        if (!this.hasMetaOption(name)) {
            throw new Error('Meta option "' + name + '" does not exists!');
        }
        return this._options[name];
    },

    hasOption: function(name) {
        return !Helper.isEmpty(this._options[name]);
    },

    removeOption: function(name) {
        if (!this.hasMetaOption(name)) {
            throw new Error('Meta option "' + name + '" does not exists!');
        }
        delete this._options[name];
        return this;
    }
};