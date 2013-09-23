"use strict";

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        concat: {
            EntityJS: {
                dest: "build/entity.js",
                src: [
                    "src/.prefix",
                     
                    "src/Entity.js",
                    "src/Entity.Helper.js",

                    "src/Entity.Meta.js",
                    "src/Entity.MetaOption.js",
                    "src/Entity.MetaOptionConstants.js",
                    "src/Entity.MetaOptionMethods.js",
                    "src/Entity.MetaOptionProperties.js",

                    "src/Entity.Manager.js",
                    "src/Entity.Event.js",
                    "src/Entity.Class.js",
                    "src/Entity.ClassBuilder.js",

                    "src/.suffix"
                ]
            }
        }
    })

    grunt.registerTask('default', ['concat']);
};