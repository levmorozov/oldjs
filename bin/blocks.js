#!/usr/bin/env node

const path = require('node:path');
const fs = require('node:fs');
const proc = require('process');


function process(rules) {
    for(const blocksPath in rules) {
        console.log(`\n${blocksPath}\n`);
        processRules(rules[blocksPath], blocksPath);
    }
}

function processRules(rules, blockPath) {
    const outPath = path.resolve(blockPath) + '/';

    for(const blockName in rules) {

        let localPath = blockName.split('_').join('/');

        if(typeof rules[blockName] === 'string') {
            rules[blockName] = [rules[blockName]];
        }

        processRule(blockName, outPath + localPath, rules[blockName])
    }
}

const fileIO = {
    read: (filename) => {
        return fs.readFileSync(resolveFilePath(filename), 'utf8');
    }
}

function processRule(blockName, blockPath, rules) {
    let filesByTypes = {'js':[], 'css': []};
    let assets = [];

    proc.stdout.write(blockName);

    for(const file of rules) {
        if(typeof file !== 'string') { // ['type', callback()]
            if(file.length !== 2) {
                console.error("\nMust be a mistake: ${file}" +
                    "\n\nProbably you forgot to wrap function in an array and specify the type. e.g., ['css', () => {}]:\n");
                continue;
            }
            filesByTypes[file[0]].push(file[1]);
            continue;
        }
        let ext = path.extname(file).slice(1);
        if(filesByTypes[ext]) {
            filesByTypes[ext].push(file);
        } else {
            assets.push(file);
        }
    }

    for(let type in filesByTypes) {
        const resultFilePath = blockPath + '/' + blockName + '.' + type;
        if(filesByTypes[type].length) {
            fs.writeFileSync(resultFilePath, mergeFiles(filesByTypes[type], type));
            proc.stdout.write(', ' + type);
        } else {
            fs.existsSync(resultFilePath) && fs.unlinkSync(resultFilePath);
        }
    }

    for(let asset of assets) {
        const assetsDir = blockPath + '/assets';
        if(!fs.existsSync(assetsDir)) {
            fs.mkdir(assetsDir);
        }
        fs.copyFileSync(resolveFilePath(asset), assetsDir + '/' + path.basename(asset));
    }

    if(assets.length) {
        proc.stdout.write(', assets');
    }

    proc.stdout.write('\n');
}

function mergeFiles(files, type) {
    let result = '';
    if(type === 'js') {
        result = "//noinspection\n";
    }
    for(let file of files) {
        if(typeof file !== 'string') {
            result += file(fileIO);
        } else {
            result += fs.readFileSync(resolveFilePath(file), 'utf8');
        }
    }
    return result;
}

function resolveFilePath(path) {
    return rootPath + '/node_modules/' + path
}


const rootPath = proc.env.INIT_CWD;//pnpApi.getPackageInformation(pnpApi.topLevel).packageLocation;

if(fs.existsSync(rootPath + '/blocks.js')) {
    const {blocks} = require(rootPath + '/blocks.js');
    process(blocks);
}