var ClassBuilder = {

    buildClass: function(name, parent, meta) {
        if (Helper.isUndefined(meta)) {
            meta   = parent;
            parent = undefined;
        }
        if (Helper.isString(parent)) {
            parent = Manager.getClass(parent);
        }
        Event.trigger('BEFORE_CREATE_CLASS', { className: name });

        var clazz = this.createClass(name, parent);

        this.applyMeta(meta, clazz);

        Event.trigger('AFTER_CREATE_CLASS', { className: name });

        return clazz;
    },

    createClass: function(name, parent) {

        var clazz = Helper.createClass({
            parent: parent || Class
        });

        Helper.extend(clazz, {
            NAME:   name,
            parent: parent
        });

        Helper.extend(clazz.prototype, {
            class: clazz
        });

        return clazz;
    },

    applyMeta: function(meta, clazz) {
        return this.Meta.apply(meta, clazz);
    },

    Meta: new Meta({
        constants:          new MetaOptionConstants(),
        class_properties:   new MetaOptionProperties(),
        properties:         new MetaOptionProperties(function(meta, clazz) {
            this.defaultApplier(meta, clazz.prototype);
        }),
        class_methods:      new MetaOptionMethods(),
        methods:            new MetaOptionMethods(function(meta, clazz) {
            this.defaultApplier(meta, clazz.prototype);
        })
    })
};