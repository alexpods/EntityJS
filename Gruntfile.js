"use strict";

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        concat: {
            EntityJs: {
                dest: "build/entity.js",
                src: [
                    "src/.prefix",
                    "src/helper.js",
                    "src/manager.js",
                    "src/class-builder.js",
                    "src/event.js",
                    "src/entity.js",
                    "src/.suffix"
                ]
            }
        }
    })

    grunt.registerTask('default', ['concat']);
};