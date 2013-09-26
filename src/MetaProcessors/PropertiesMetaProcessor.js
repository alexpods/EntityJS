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