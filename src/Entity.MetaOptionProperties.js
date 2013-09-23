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