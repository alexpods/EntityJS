var Manager = {

    _classes: {},

    addClass: function(clazz) {
        this._classes[clazz.__name__] = clazz;
        return this;
    },

    removeClass: function(name) {
        if (!this.hasClass(name)) {
            throw new Error('Class "' + name + '" does not exists in entity manager!');
        }
        delete this._classes[name];
        return this;
    },

    hasClass: function(name) {
        return this._classes.hasOwnProperty(name);
    },

    getClass: function(name) {
        if (!this.hasClass(name)) {
            throw new Error('Class "' + name + '" does not exists in entity manager!');
        }
        return this._classes[name];
    }
};