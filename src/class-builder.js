var ClassBuilder = {

    buildClass: function(name, parent, meta) {
        if (typeof meta == 'undefined') {
            meta   = parent;
            parent = undefined;
        }

        Event.trigger('BEFORE_CREATE_CLASS', { className: name });


        Event.trigger('AFTER_CREATE_CLASS', { className: name });
    }
};