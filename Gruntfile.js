"use strict";

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        concat: {
            dev: {
                dest: "build/<%= pkg.title %>.js",
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
        },
        uglify: {
            min: {
                options: {
                    mangle: true,
                    compress: {
                        unused: false
                    },
                    report: 'gzip',
                    sourceMap: 'build/<%= pkg.title %>.min.map',
                    preserveComments: false
                },
                dest: "build/<%= pkg.title %>.min.js",
                src:  "<%= concat.dev.dest %>"
            }
        }
    })

    grunt.registerTask('default', ['concat', 'uglify']);
};