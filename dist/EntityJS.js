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

Entity.Meta = new Meta();
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
        return typeof value === 'object' && !this.isNull(value) && !this.isArray(value);
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
    inObject: function(property, object) {
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

    createClass: function(params) {

        var clazz = params.class
            || params.parent
                &&
                function () {
                    params.parent.apply(this, Array.prototype.slice.call(arguments));
                }
            || function() {}


        Helper.extend(clazz, params.parent);

        clazz.prototype = this.extend(Object.create(!Helper.isEmpty(params.parent) ? params.parent.prototype : {}), params.properties);

        return clazz;
    }
};
var Manager = {

    _uid:     0,
    _classes: {},

    addClass: function(clazz) {
        this._classes[clazz.NAME] = clazz;
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
}

Helper.extend(Class, {

    NAME:   null,
    parent: null,

    create: function(data) {
        return new this(data);
    }
});

Helper.extend(Class.prototype, {

    class: Class
    
});
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
var ConstantsInitProcessor = function(object, constants) {
    object['__constants'] = {};

    for (var constant in constants) {
        object['__constants'][constant] = constants[constant];
    }
}
var ConstantsInterfaceProcessor = new Meta.Processor.Interface({

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

            if (Helper.isObject(constants)) {
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

})
var ConstantsProcessor = new Meta.Processor.Chain({

    init:      ConstantsInitProcessor,
    interface: ConstantsInterfaceProcessor

})
var MethodsProcessor = function(object, methods) {

    for (var method in methods) {
        if (typeof methods[method] !== 'function') {
            throw new Error('Method "' + method + '" must be a function!');
        }
        object[method] = methods[method]
    }
}
var PropertiesInitProcessor = function(object, meta) {

    for (var property in meta) {
        object['_' + property] = undefined;
    }
}
var PropertiesInterfaceProcessor = new Meta.Processor.Interface({

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

        this['_' + property] = value;

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
        if (Helper.isUndefined(this.__setters[property])) {
            this.__setters[property] = [];
        }
        this.__setters[property].push([weight, callback]);

        return this;
    },

    __getSetters: function(property) {
        var setters, allSetters = {}, parent = this.class.prototype;

        while (parent) {
            if (parent.hasOwnProperty('__setters')) {
                for (var prop in parent.__setters) {
                    if (!Helper.inObject(prop, allSetters)) {
                        allSetters[prop] = parent.__setters[prop];
                    }
                }
            }

            parent = parent.class.parent ? parent.class.parent.prototype : null;
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
        if (Helper.isUndefined(this.__getters[property])) {
            this.__getters[property] = [];
        }
        this.__getters[property].push([weight, callback]);

        return this;
    },

    __getGetters: function(property) {
        var getters, allGetters = {}, parent = this.class.prototype;

        while (parent) {
            if (parent.hasOwnProperty('__getters')) {
                for (var prop in parent.__getters) {
                    if (!Helper.inObject(prop, allGetters)) {
                        allGetters[prop] = parent.__getters[prop];
                    }
                }
            }

            parent = parent.class.parent ? parent.class.parent.prototype : null;
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
})
var PropertiesMetaProcessor = {

    process: function(object, properties) {
        for (var property in properties) {
            this.Meta.process(object, properties[property], property)
        }
    },

    Meta: new Meta({

        type: {
            process: function(object, type, option, property) {
                if (!Helper.isArray(type)) {
                    type = [type, {}];
                }
                if (!Helper.inObject(type[0], this.TYPES)) {
                    throw new Error('Unsupported property type "' + type[0] + '"!');
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

        default: function(object, defaultValue, option, property) {
            if (Helper.isFunction(defaultValue)) {
                defaultValue = defaultValue();
            }
            object['_' + property] = defaultValue;
        },

        methods: {

            process: function(object, methods, option, property) {
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
                if (!Helper.inObject(name, this.METHOD_CREATORS)) {
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

        converters: function(object, converters, option, property) {

            object.__addSetter(property, 1000, function(value) {
                for (var name in converters) {
                    value = converters[name].call(this, value);
                }
                return value;
            })
        },

        constraints: function(object, constraints, option, property) {

            object.__addSetter(property, function(value) {
                for (var name in constraints) {
                    if (!constraints[name].call(this, value)) {
                        throw new Error('Constraint "' + name + '" was failed!');
                    }
                }
                return value;
            })
        }
    })
}
var PropertiesProcessor = new Meta.Processor.Chain({

    init:      PropertiesInitProcessor,
    interface: PropertiesInterfaceProcessor,
    meta:      PropertiesMetaProcessor

})

    Helper.extend(Entity, {
        Helper:       Helper,
        Manager:      Manager,
        Class:        Class,
        ClassBuilder: ClassBuilder,
        Event:        Event
    })

    Entity.Meta.Class = new Meta({
        constants:        ConstantsProcessor,
        class_properties: PropertiesProcessor,
        class_methods:    MethodsProcessor
    })

    Entity.Meta.Object = new Meta({
        properties:       PropertiesProcessor,
        methods:          MethodsProcessor
    })

    global.Entity = Entity;

})(this);