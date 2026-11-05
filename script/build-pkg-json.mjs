import { readFileSync, writeFileSync } from "node:fs";

const pkgOriginal = JSON.parse( readFileSync( "package.json" ) );
const pkg = {
	name: "wet-boew",
	version: pkgOriginal.version,
	description: `${ pkgOriginal.name.toLowerCase() } theme`,
	repository: {
		type: "git",
		url: "git+https://github.com/wet-boew/wet-boew-cdn.git"
	},
	author: "wet-boew-bot",
	license: "MIT",
	bugs: {
		url: `https://github.com/wet-boew/${ pkgOriginal.name.toLowerCase() }/issues`
	},
	homepage: "https://github.com/wet-boew/wet-boew-cdn#readme"
};
writeFileSync( "dist/wet-boew/package.json", JSON.stringify( pkg, null, 2 ) );
