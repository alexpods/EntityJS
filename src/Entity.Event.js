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