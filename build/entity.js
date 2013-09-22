(function(global, undefined) {


var Helper = {
    isEmpty: function(value) {
        return this.isUndefined(value)
            || this.isNull(value)
            || this.isEmptyString(value)
            || this.isEmptyArray(value)
            || this.isEmptyObject(value);
    },
    isNull: function(value) {
        return value === null;
    },
    isUndefined: function(value) {
        return typeof value === 'undefined';
    },
    isNumber: function(value) {
        return typeof value === 'number';
    },
    isString: function(value) {
        return typeof value === 'string';
    },
    isEmptyString: function(value) {
        return this.isString(value) && value === '';
    },
    isBoolean: function(value) {
        return typeof value === 'boolean';
    },
    isDate: function(value) {
        return Object.prototype.toString.apply(value) === '[object Date]';
    },
    isArray: function(value) {
        return Object.prototype.toString.apply(value) === '[object Array]';
    },
    isEmptyArray: function(value) {
        return this.isArray(value) && value.length === 0;
    },
    isObject: function(value) {
        return typeof value === 'object' && !this.isNull(value);
    },
    isEmptyObject: function(value) {
        if (!this.isObject(value)) {
            return false;
        }
        for (var i in value) {
            return false;
        }
        return true;
    },
    isFunction: function(value) {
        return typeof value === 'function';
    },
    inObject: function(proeprty, object) {
        return property in object;
    },
    propertyInObject: function(property, object) {
        return this.inObject(property, object) && !this.isFunction(object[property]);
    },
    extend: function(object, properties) {
        for (var name in properties) {
            object[name] = properties[name];
        }
    },
    toCamelCase: function(name) {
        return name.replace(/(?:_)\w/, function (match) { return match[1].toUpperCase(); });
    }
};
var Manager = {

    _uid:     0,
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
    },

    getNextUid: function() {
        return ++this._uid;
    }
};
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
var Event = {

    PREFIX: 'Entity.',

    BEFORE_CREATE_CLASS: 'CreateClass.{className}.Before',
    AFTER_CREATE_CLASS:  'CreateClass.{className}.After',

    _events: {},

    trigger: function(event, data) {
        var i, ii, name = this.getName(event, data);

        if (!Helper.isEmpty(this._events[name])) {
            for (i = 0, ii = this._events[name].length; i < ii; ++i) {
                this._events[name][i](data);
            }
        }
        return this;
    },

    on: function(event, data, callback) {
        if (Helper.isEmpty(callback)) {
            callback = data;
            data     = undefined;
        }
        if (!Helper.isFunction(callback)) {
            throw new Error('Callback must be function!');
        }
        var name = this.getName(event, data);

        if (Helper.isEmpty(this._events[name])) {
            this._events[name] = [];
        }
        this._events[name].push(callback);

        return this;
    },

    off: function(event, data, callback) {
        if (Helper.isEmpty(callback)) {
            callback = data;
            data     = undefined;
        }
        var name = this.getName(event, data), index;

        if (!Helper.isEmpty(this._events)) {
            if (Helper.isFunction(callback) && -1 !== (index = this._events[name].indexOf(callback))) {
                this._events[name].splice(index,1);
            }
            else {
                delete this._events[name];
            }
        }

        return this;
    },

    getName: function(event, data) {
        if (!event in this) {
            throw new Error('Unsupported entity event "' + event + '"!');
        }

        return this.PREFIX + this[event].replace(/{([a-zA-Z0-9_]+)}/g, function(str, param) {
            if (!param in data) {
                throw new Error('Event data must contain "' + param + '" parameter!');
            }

            return data[param];
        });
    }
};
var Entity = function(name, parent, meta) {

    // If called as constructor - creates new entity
    if (this instanceof Entity) {
        // Actually - "parent" is data
        return Manager.getClass(name).create(parent);
    }
    // If only name is specified - returns entity class
    else if (arguments.length == 1) {
        return Manager.getClass(name);
    }
    // If name and some meta data are specified - creates new entity class and returns it
    else {
        var clazz = ClassBuilder.buildClass(name, parent, meta);
        Manager.addClass(clazz);
        return clazz;
    }
}

Helper.extend(Entity, {
    Manager:      Manager,
    ClassBuilder: ClassBuilder,
    Helper:       Helper,
    Event:        Event,
    MetaOption:   MetaOption
});

    global.Entity = Entity;

})(this);