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