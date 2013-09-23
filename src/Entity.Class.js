var Class = function(data) {
    this.uid = Manager.getNextUid();

    this.init(data);

    return this;
}

Helper.extend(Class, {

    name:   null,
    parent: null,

    create: function(data) {
        return new this(data);
    }
});

Helper.extend(Class.prototype, {

});