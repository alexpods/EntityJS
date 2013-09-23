var MetaOptionMethods = MetaOption({

    afterApply: function(methods, object) {
        for (var method in methods) {
            this.addMethod(method, object, methods[method]);
        }
    },

    addMethod: function(name, object, method) {
        object[name] = method;
    }

});