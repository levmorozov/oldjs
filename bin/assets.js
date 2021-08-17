#!/usr/bin/env node
/*
 * Assets post-processor. Got on input json with paths to css and js files and processes them:
 * for css: autoprefixer + ccso
 * for js: babel + terser
 *
 * Near every file we put gzipped version (for nginx gzip_static use)
 */

const minimist = require('minimist'),
    pkg = require('../package.json'),
    {minify: terserMinify} = require("terser"),
    autoprefixer = require('autoprefixer'),
    csso = require('postcss-csso'),
    fs = require('fs'),
    zlib = require('zlib'),
    {readFile, writeFile} = require('fs').promises,
    curPath = process.cwd();

let postcss = require('postcss');

const terserParams = {
    warnings: true,
    comments: false
};

const argv = minimist(process.argv.slice(2), {
    alias: {
        'browsers': 'c',
        'version': 'V',
        'help': 'h',
    },
    boolean: [
        'no_babel',
        'version',
        'help',
    ],
    string: [
        'browsers',
    ],
})


if (argv.version) {
    version()
} else if (argv.help) {
    usage()
} else {
    main();
}

function version() {
    console.log(pkg.version)
}

function usage() {
    console.log(
        `
  Usage: assets [options] 

  Expect json with css/js array in STDIN 

  Options:
    -b, --browsers           Custom browserlist targets
    --no_babel               Disable usage of Babel
    -V, --version            Output the version number
    -h, --help               Output usage information`
    )
}


/**
 * We use zopfli for compression. With fallback to standart gzip
 */
function gzipCompress(buf) {
    console.log('sd');
    return zlib.gzipSync(buf, {
        level: 8,
        memLevel: 9
    });
}

function detectZopfli() {
    try {
        let zopfli = require('node-zopfli');

        gzipCompress = (buf) => {
            return zopfli.gzipSync(buf, {});
        }
    } catch (er) {
        console.log(er);
        console.warn('Failed to load node-zopfli. Fallback to standart gzip');
    }
}

function printFilename(path) {
    if (path.startsWith(curPath)) {
        path = path.substr(curPath.length);
    }
    process.stdout.write(path + " processed\n");
}

async function writeResult(path, data) {
    return writeFile(path, data)
        .then(() => {
            return writeFile(path + '.gz', gzipCompress(Buffer.from(data)));
        });
}


function processCss(file) {
    return readFile(file, 'utf-8')
        .then(css => postcss.process(css, {from: undefined}))
        .then(result => {
            result.warnings().forEach(function (warn) {
                console.warn(warn.toString());
            });
            return writeResult(file, result.css);
        })
        .then(() => printFilename(file))
        .catch(e => console.warn(e, file));
}

async function babelTransform(data) {
    return new Promise((resolve, reject) => {
        resolve({code: data});
    });
}

async function processJs(file) {
    return readFile(file, 'utf-8')
        .then(babelTransform)
        .then(data => terserMinify(data.code, terserParams))
        .then(data => writeResult(file, data.code))
        .then(() => printFilename(file))
        .catch(e => console.warn(e, file));
}


/**
 *
 * @param {array} css
 * @param {array} js
 * @param {Object} opts
 * @returns {Promise<void>}
 */
async function processAssets(css, js, opts) {
    let targets = opts['targets'] || '';

    postcss = postcss([autoprefixer({
        'overrideBrowserslist': targets
    }), csso({
        comments: false
    })])

    // Sync everything - due to issues with highly limited IO in some clouds
    for (let file of css) {
        await processCss(file);
    }

    if (opts['noBabel'] !== true) {
        let babel = require("@babel/core");


        babelTransform = async function (data) {
            return babel.transformAsync(data, {
                presets: [
                    [
                        "@babel/env",
                        {
                            "targets": targets,
                            "bugfixes": true,
                            "loose": true,
                            "modules": false,
                            "exclude": []
                        }
                    ]
                ],
            });
        }
    }
    for (file of js) {
        await processJs(file);
    }
}

async function main() {
    detectZopfli();

    let data = JSON.parse(fs.readFileSync(0, "utf-8"));

    processAssets(data['css'], data['js'], {
        noBabel: argv['no_babel'],
        targets: argv['browsers']
    })
}
