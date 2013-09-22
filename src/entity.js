var Entity = function(name, parent, meta) {

    // If called as constructor - creates new entity
    if (this instanceof Entity) {
        // Actually - "parent" is data
        return Manager.getClass(name).create(parent);
    }
    // If only name is specified - returns entity class
    else if (arguments.length == 1) {
        return Manager.getClass(name);
    }
    // If name and some meta data are specified - creates new entity class and returns it
    else {
        var clazz = ClassBuilder.buildClass(name, parent, meta);
        Manager.addClass(clazz);
        return clazz;
    }
}

Helper.extend(Entity, {
    Manager:      Manager,
    ClassBuilder: ClassBuilder,
    Helper:       Helper,
    Event:        Event
})