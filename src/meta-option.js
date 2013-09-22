var MetaOption = function(name, applier) {
    if (!Helper.isFunction(applier)) {
        throw new Error('Applier must be a function!');
    }
    this._name    = name;
    this._applier = applier;
}

MetaOption.prototype = {

    apply: function(clazz, meta) {
        if (Helper.isEmpty(meta[this._name])) {
            return clazz;
        }

        this._applier.call(this, clazz, meta[this._name]);

        return clazz;
    },

    getName: function() {
        return this._name;
    },

    getApplier: function() {
        return this._applier;
    }
};