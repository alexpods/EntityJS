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

        this.processMeta(clazz, meta);

        Event.trigger('AFTER_CREATE_CLASS', { className: name });

        return clazz;
    },

    createClass: function(name, parent) {

        var parent = parent || Class;

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

    processMeta: function(clazz, meta) {
        Entity.Meta.Class.process(clazz, meta);
        Entity.Meta.Object.process(clazz.prototype, meta);
    }
};