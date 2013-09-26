var PropertiesInitProcessor = function(object, meta) {

    for (var property in meta) {
        object['_' + property] = undefined;
    }
}