module.exports = function(fileInfo, api, options) {
  
	//transform unqualified web-pack style imports like: import {foo} from "bar" 
	//into fully valid es6 syntax such as: import {foo} from "./bar.js"
	
	const fileLocation = fileInfo.path;
	//console.log(__dirname);
	//console.log(fileLocation);
	
	const fs = require("fs");
	const path = require('path');
	//console.log(absFileLoc);
	
	const j = api.jscodeshift;
	var root = j(fileInfo.source);
	
	//const webPackResolver = require("eslint-import-resolver-webpack");
	const { resolve } = require("eslint-import-resolver-node");
	var success = true;
	
	
	
	//find export all declarations
	root.find(j.ExportAllDeclaration).forEach(function(astNode){
		resolveImportExportPath(astNode, fileLocation, path, fs, resolve);
	});
	
	//find named export declarations
	root.find(j.ExportNamedDeclaration).forEach(function(astNode){
		if(astNode.value.source != null)
		{
			resolveImportExportPath(astNode, fileLocation, path, fs, resolve);
		}
	});
	
	//find the import declarations
	root.find(j.ImportDeclaration).forEach(function(astNode){
		resolveImportExportPath(astNode, fileLocation, path, fs, resolve);
	});
 
	if(!success){
		return;
	}
  
	return root.toSource();
};


function resolveImportExportPath(astNode, fileLocation, path, fs, resolve) {

	var absFileLoc = path.dirname(path.resolve(fileLocation)); 
	//console.log(absFileLoc);

	var importLocToResolve = astNode.value.source.value;
	//console.log(importLocToResolve);
		
	var pathToTest = path.join(absFileLoc, importLocToResolve);
	//console.log("Path to test for resolution: " + pathToTest);
	//console.log(fileLocation);
	
	const resolution = resolve(importLocToResolve, fileLocation, {/*config*/});
	const absoluteResolution = resolution.path;
	//console.log(absoluteResolution);
	
	//if path already can be resolved to on disk, then it is good to go
	const pathResolvesOkay = fs.existsSync(pathToTest) && absoluteResolution === pathToTest;
	if (!pathResolvesOkay) {
		
		//console.log("Path did not resolve to a real file: " + pathToTest);
	
		if(resolution.found) {
			var relativePath = path.relative(absFileLoc, absoluteResolution);
			//convert from windows back-slashes if we are on windows
			var pathSegments = relativePath.split(path.sep);
			relativePath = path.posix.join(...pathSegments);
			
			//check if we including a file that is our directory or descendant directory
			var sameOrSubdirectory = absoluteResolution.startsWith(absFileLoc);
			if(sameOrSubdirectory) {
				relativePath = './' + relativePath;
			}
			
			//process.stdout.write(".");
			//console.log(fileLocation + " had its import: " + importLocToResolve + " resolved to: " + relativePath); 
			
			astNode.value.source.value = relativePath;
			
		}
		else {
			console.log("Could not resolve path: " + importLocToResolve + " in file: " + absFileLoc);
			success = false;
		}
		
	}
	else{
		//console.log("import all good: " + fileLocation + " || " + importLocToResolve);
	}

}
