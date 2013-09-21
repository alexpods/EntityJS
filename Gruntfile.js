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
                    "src/manager.js",
                    "src/.suffix"
                ]
            }
        }
    })

    grunt.registerTask('default', ['concat']);
};