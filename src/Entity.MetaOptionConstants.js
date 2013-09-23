var MetaOptionConstants = MetaOption({

    afterApply: function(constants, object) {
        object['__constants'] = {};

        for (var constant in constants) {
            this.addConstant(constant, object, constants[constant]);
        }
    },

    addConstant: function(name, object, constant) {
        object['__constants'][name] = constant;
    },

    Interface: {

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

});