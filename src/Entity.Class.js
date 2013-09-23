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