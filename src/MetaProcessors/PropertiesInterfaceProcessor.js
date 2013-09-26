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