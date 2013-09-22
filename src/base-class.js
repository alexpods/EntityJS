var BaseClass = function(data) {
    this.uid = Manager.getNextUid();

    this.init(data);

    return this;
}

Helper.extend(BaseClass, {

    create: function(data) {
        return new this(data);
    }

});

Helper.extend(BaseClass.prototype, {

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

        var getter = 'get' + property[0].toUpperCase() + property.slice(1);

        if (Helper.isFunction(this[getter])) {
            return this[getter]()
        }
        else if (Helper.propertyInObject('_' + property, this)) {
            return this['_' + property];
        }
        else if (Helper.propertyInObject(property, this)) {
            return this[property];
        }
        else {
            throw new Error('Can\'t get! Property "' + property + '" does not exists in entity "' + this.class.name + '"!');
        }
    },

    __setProperty: function(property, value) {
        property = Helper.toCamelCase(property);

        var setter = 'set' + property[0].toUpperCase() + property.slice(1);

        if (Helper.isFunction(this[setter])) {
            this[setter](value);
        }
        else if (Helper.propertyInObject('_' + property, this)) {
            this['_' + property] = value;
        }
        else if (Helper.propertyInObject(property, this)) {
            this[property] = value;
        }
        else {
            throw new Error('Can\'t set! Property "' + property + '" does not exists in entity "' + this.class.name + '"!');
        }

        return this;
    },

    __hasProperty: function(property) {
        property = Helper.toCamelCase(property);

        return Helper.propertyInObject('_' + property, this) || Helper.propertyInObject(property, this);
    },

    __isProperty: function(property, value) {
        return !Helper.isUndefined(value) ? value == this.__getProperty(property) : !!(this.__getProperty(property));
    }
});