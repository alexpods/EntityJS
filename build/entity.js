;(function(global, undefined) {


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
    isScalar: function(value) {
        return this.isString(value) || this.isNumber() || this.isBoolean(value);
    },
    isCompound: function(value) {
        return this.isArray(value) || this.isObject(value);
    },
    extend: function(object, properties) {
        if (!this.isEmpty(properties)) {
            for (var name in properties) {
                object[name] = properties[name];
            }
        }
        return object;
    },
    toCamelCase: function(name) {
        return name.replace(/(?:_)\w/, function (match) { return match[1].toUpperCase(); });
    },

    createClass: function(constructor, parent, properties) {
        if (this.isUndefined(body)) {
            properties   = parent;
            parent = null;
        }

        var Clazz = function() { return constructor || (parent && function (data) { parent.call(this, data); }) || function() {} };
        Clazz.prototype = Object.create(!Helper.isEmpty(parent) ? parent : null);

        var clazz = new Clazz();
        clazz.prototype = this.extend(Object.create(!Helper.isEmpty(parent) ? parent.prototype : null), properties);

        return clazz;
    }
};
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
var MetaOptionConstants = Helper.createClass({ parent: MetaOption, prototype: {

    applier: function(constants, object) {
        for (var constant in constants) {
            this.addConstant(constant, object, constants[constant]);
        }
    },

    addConstant: function(name, object, constant) {
        if (!object.hasOwnProperty('__constants')) {
            object['__constants'] = {};
        }
        object['__constants'][name] = constant;
    },

    Interface: {

        __constants: {},

        const: function(name) {
            return this.__getConstant(name);
        },

        __getConstant: function(name, constants) {
            if (Helper.isUndefined(constants)) {
                constants = this.__getConstants();
            }

            if (!Helper.isUndefined(name)) {
                if (Helper.isUndefined(constants[name])) {
                    throw new Error('Constant "' + name + '" does not defined!');
                }
                constants = constants[name];

                if (Helper.isCompound(constants)) {
                    var self = this, callback = function(name) {
                        return self.__getConstant(name, constants)
                    }
                    return callback;
                }
            }

            return constants;
        },

        __getConstants: function() {
            var constants = {}, parent = this;

            while (parent) {
                if (parent.hasOwnProperty('__constants')) {
                    for (var constant in parent['__constants']) {
                        if (!Helper.inObject(constant, constants)) {
                            constants[constant] = parent['__constants'][constant];
                        }
                    }
                }
                parent = parent.parent;
            }
            return constants;
        }
    }

}});
var MetaOptionMethods = Helper.createClass({ parent: MetaOption, prototype: {

    applier: function(methods, object) {
        for (var method in methods) {
            this.addMethod(method, object, methods[method]);
        }
    },

    addMethod: function(name, object, method) {
        object[name] = method;
    }

}});
var MetaOptionProperties = Helper.createClass({ parent: MetaOption, prototype: {

    Interface: {
        __setters: {},
        __getters: {},

        init: function(data) {
            this.__setData(data);
        },

        __setData: function(data) {
            for (var property in data) {
                if (!this.__hasProperty(property)) {
                    continue;
                }
                this.__setProperty(property, data[property]);
            }
            return this;
        },

        __getProperty: function(property) {
            property = Helper.toCamelCase(property);

            if (!this.__hasProperty(property)) {
                throw new Error('Can\'t get! Property "' + property + '" does not exists in entity "' + this.class.name + '"!');
            }

            var value = this['_' + property], getters = this.__getGetters(property);

            for (var name in getters) {
                value = getters[name].call(this, value);
            }

            return value;
        },

        __setProperty: function(property, value) {
            property = Helper.toCamelCase(property);

            if (!this.__hasProperty(property)) {
                throw new Error('Can\'t set! Property "' + property + '" does not exists in entity "' + this.class.name + '"!');
            }

            var setters = this.__getSetters(property);

            for (var name in setters) {
                value = setters[name].call(this, value);
            }

            return this;
        },

        __hasProperty: function(property) {
            property = Helper.toCamelCase(property);

            return Helper.propertyInObject('_' + property, this);
        },

        __isProperty: function(property, value) {
            return !Helper.isUndefined(value) ? value == this.__getProperty(property) : Boolean(this.__getProperty(property));
        },

        __isEmptyProperty: function(property) {
            return Helper.isEmpty(this.__getProperty(property));
        },

        __addSetter: function(property, weight, callback) {
            if (Helper.isUndefined(callback)) {
                callback = weight;
                weight   = 0;
            }
            if (!Helper.isFunction(callback)) {
                throw new Error('Set callback must be a function!');
            }
            if (!this.hasOwnProperty('__setters')) {
                this.__setters = {};
            }
            if (Helper.isUndefined(this.__setters[property])) {
                this.__setters[property] = [];
            }
            this.__setters[property].push([weight, callback]);

            return this;
        },

        __getSetters: function(property) {
            var setters, allSetters = {}, parent = this;

            while (parent) {
                if (parent.hasOwnProperty('__setters')) {
                    for (var property in parent.__setters) {
                        if (!Helper.inObject(property, allSetters)) {
                            allSetters[property] = parent.__setters[property];
                        }
                    }
                }

                parent = parent.parent;
            }

            if (!Helper.isUndefined(property)) {
                setters = [];
                if (!Helper.isEmpty(allSetters[property])) {

                    allSetters[property].sort(function(s1, s2) {
                        return s2[0] - s1[0];
                    });

                    for (var i = 0, ii = allSetters[property].length; i < ii; ++i) {
                        setters.push(allSetters[property][i][1]);
                    }
                }
            }
            else {
                setters =  allSetters;
            }

            return setters;
        },

        __addGetter: function(property, weight, callback) {
            if (Helper.isUndefined(callback)) {
                callback = weight;
                weight   = 0;
            }
            if (!Helper.isFunction(callback)) {
                throw new Error('Get callback must be a function!');
            }
            if (!this.hasOwnProperty('__getters')) {
                this.__getters = {};
            }
            if (Helper.isUndefined(this.__getters[property])) {
                this.__getters[property] = [];
            }
            this.__getters[property].push([weight, callback]);

            return this;
        },

        __getGetters: function(property) {
            var getters, allGetters = {}, parent = this;

            while (parent) {
                if (parent.hasOwnProperty('__getters')) {
                    for (var property in parent.__getters) {
                        if (!Helper.inObject(property, allGetters)) {
                            allGetters[property] = parent.__getters[property];
                        }
                    }
                }

                parent = parent.parent;
            }

            if (!Helper.isUndefined(property)) {
                getters = [];
                if (!Helper.isEmpty(allGetters[property])) {

                    allGetters[property].sort(function(s1, s2) {
                        return s2[0] - s1[0];
                    });

                    for (var i = 0, ii = allGetters[property].length; i < ii; ++i) {
                        getters.push(allGetters[property][i][1]);
                    }
                }
            }
            else {
                getters = allGetters;
            }
            return getters;
        }
    },

    Meta: new Meta({

        type: {

            apply: function(type, object, property) {
                if (!Helper.isArray(type)) {
                    type = [type, {}];
                }
                if (!Helper.inObject(type, this.TYPES)) {
                    throw new Error('Unsopported property type "' + type + '"!');
                }

                var typer = this.TYPES[type[0]];

                object.__addSetter(property, function(value) {
                    return typer.call(object, value, type[1]);
                });
            },

            TYPES: {
                boolean: function(value) {
                    return Boolean(value);
                },
                number: function(value, params) {
                    value = Number(value);
                    if (!Helper.isUndefined(params['min']) && value < params['min']) {
                        throw new Error('Value "' + value + '" must not be less then "' + params['min'] + '"!');
                    }
                    if (!Helper.isUndefined(params['max']) && value > params['max']) {
                        throw new Error('Value "' + value + '" must not be greater then "' + params['max'] + '"!');
                    }
                    return value;
                },
                string: function(value, params) {
                    value = String(value);
                    if (!Helper.isUndefined(params['pattern']) && !params['pattern'].test(value)) {
                        throw new Error('Value "' + value + '" does not match pattern "' + params['pattern'] + '"!');
                    }
                    return value;
                },
                datetime: function(value) {
                    if (!(value instanceof Date)) {
                        value = new Date(Date.parse(value));
                    }
                    return value;
                },
                array: function(value, params) {
                    return Helper.isString(value) ? value.split(params['delimiter'] || ',') : [].concat(value);
                }
            }
        },

        default: function(defaultValue, object, property) {
            if (Helper.isFunction(defaultValue)) {
                defaultValue = defaultValue();
            }
            object['_' + property] = defaultValue;
        },

        methods: {

            apply: function(methods, object, property) {
                if (!Helper.isArray(methods)) {
                    methods = [methods];
                }

                for (var i = 0, ii = methods.length; i < ii; ++i) {
                    this.addMethod(methods[i], object, property);
                }
            },
            addMethod:  function(name, object, property) {
                var method = this.createMethod(name, property);
                object[method.name] = method.body;
            },

            createMethod: function(name, property) {
                if (Helper.inObject(name, this.METHOD_CREATORS)) {
                    throw new Error('Unsupported method "' + name + '"!');
                }
                return this.METHOD_CREATORS[name](property);
            },

            METHOD_CREATORS: {
                get: function(property) {
                    return {
                        name:   'get' + property[0].toUpperCase() + property.slice(1),
                        body: function() {
                            return this.__getProperty(property);
                        }
                    }
                },
                set: function(property) {
                    return {
                        name:   'set' + property[0].toUpperCase() + property.slice(1),
                        body: function(value) {
                            return this.__setProperty(property, value);
                        }
                    }
                },
                is: function(property) {
                    return {
                        name: (0 !== property.indexOf('is') ? 'is' : '') + property[0].toUpperCase() + property.slice(1),
                        body: function(value) {
                            return this.__isProperty(property, value);
                        }
                    }
                },
                isEmpty: function(property) {
                    return {
                        name: (0 !== property.indexOf('isEmpty') ? 'isEmpty' : '') + property[0].toUpperCase() + property.slice(1),
                        body: function() {
                            return this.__isEmptyProperty(property);
                        }
                    }
                }
            }
        },

        converters: function(converters, object, property) {

            object.__addSetter(property, 1000, function(value) {
                for (var name in converters) {
                    value = converters[name].call(this, value);
                }
                return value;
            })
        },

        constraints: function(constraints, object, property) {

            object.__addSetter(property, function(value) {
                for (var name in constratins) {
                    if (!constraints[name].call(this, value)) {
                        throw new Error('Constraint "' + name + '" was failed!');
                    }
                }
                return value;
            })
        }
    })
}});
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
var Class = function(data) {
    this.uid = Manager.getNextUid();

    this.init(data);

    return this;
}

Helper.extend(Class, {

    name:   null,
    parent: null,

    create: function(data) {
        return new this(data);
    }
});

Helper.extend(Class.prototype, {

});
var ClassBuilder = {

    buildClass: function(name, parent, meta) {
        if (typeof meta == 'undefined') {
            meta   = parent;
            parent = undefined;
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
            name:   name,
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
            this.applyInterface(meta, clazz.prototype);
            this.applyMeta(meta, clazz.prototype);
        }),
        class_methods:      new MetaOptionMethods(),
        methods:            new MetaOptionMethods(function(meta, clazz) {
            this.applyInterface(meta, clazz.prototype);
            this.applyMeta(meta, clazz.prototype);
        })
    })
};

    Helper.extend(Entity, {
        Helper:       Helper,
        Manager:      Manager,
        Class:        Class,
        ClassBuilder: ClassBuilder,
        Event:        Event,
        Meta:         Meta,
        MetaOption:   MetaOption,

        MetaOptionConstants:  MetaOptionConstants,
        MetaOptionMethods:    MetaOptionMethods,
        MetaOptionProperties: MetaOptionProperties
    });

    global.Entity = Entity;

})(this);