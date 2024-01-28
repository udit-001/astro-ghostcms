import arg from "arg";
import * as p from "@clack/prompts";
import c from 'picocolors';
import { exitPrompt, isPackageManager, getVersion } from "./lib/utils.js";
import { createBasic } from "./runners/basic.js";
import { createStarterKit } from "./runners/starterkit.js";

const pkgVer = await getVersion()

export async function main() {
	const exit = () => process.exit(0);
	process.on("SIGINT", exit);
	process.on("SIGTERM", exit);

	console.clear();

	const argv = process.argv.slice(2).filter((arg) => arg !== "--");

	const flags = arg(
		{
			"--help": Boolean,
			"--install": Boolean,
			"--git": Boolean,
			"--dry": Boolean,
			"--pkg-manager": String,
			"-h": "--help",
			"-i": "--install",
			"-g": "--git",
			"-p": "--pkg-manager",
		},
		{ argv, permissive: true }
	);
	const {
		"--help": help,
		"--install": installDeps,
		"--git": initGitRepo,
		"--dry": dryRun,
		"--pkg-manager": pkgManager,
	} = flags;

	// 0. Show help text and bail
	if (help) {
		console.log(getHelp());
		return;
	}

	// 1. Say hello!
	p.intro(c.bgMagenta(c.black(` ${c.bold("Astro-GhostCMS Create Utility - By MatthiesenXYZ")} ${c.underline(`( ${pkgVer} )`)} ${c.italic(dryRun ? "[Dry Run] ":" ")}`)))

	const gettingStarted = `${c.white(c.bold('Want to Initiate a git repo at the same time as deploying your project?'))} \n - ${c.white(`Use ${c.yellow('--git')} at the end of the command`)} \n ${c.white(c.bold(`Using a package manager other than ${c.cyan(c.bold('pnpm'))}?`))} \n - ${c.white(`Use ${c.yellow('--pkg-manager npm')} or ${c.yellow('--pkg-manager yarn')}.`)}`

	p.note(gettingStarted)

	// 2. Get template to set up
	let [template, ...args] = flags._;
	if (template && !isValidTemplate(template)) {
		p.log.warning(c.red(`"${template}" isn't a valid template`));
		template = null;
	}
	if (!template) {
		const answer = await p.select({
			message: `${c.cyan('Which template would you like to use?')}`,
			options: [
				{ 
					value: "basic", 
					label: `${c.magenta('Basic')} - ${c.cyan(c.italic('Integration w/ Default Theme'))}` 
				},
				{
					value: "starterkit",
					label: `${c.magenta('Starter Kit')} - ${c.cyan(c.italic('Integration in API-Only Mode with customizable theme'))}`
				}
			],
			initialValue: "basic",
		});
		if (p.isCancel(answer)) exitPrompt();
		template = answer;
	}

	// 2. Construct context to pass to template functions
	/** @type {Context} */
	const ctx = {
		dryRun,
		installDeps,
		initGitRepo,
		pkgManager: isPackageManager(pkgManager) ? pkgManager : null,
		args,
	};

	// 3. Call template functions
	switch (template) {
		case "basic":
			await createBasic(ctx).catch(console.error);
			break;
		case "starterkit":
			await createStarterKit(ctx).catch(console.error);
			break;
		default:
			throw new Error(c.red(`Unknown template: ${template}`));
	}

	// 4. Huzzah!
	p.outro(c.reset(`Problems? ${c.underline(c.cyan('https://github.com/MatthiesenXYZ/astro-ghostcms/issues'))}`));
}

function getHelp() {
	return `${c.yellow('Need Help? Check the Docs!')} ${c.underline(c.cyan('https://astro-ghostcms.xyz/docs'))}`;
}

/**
 * @param {string|null|undefined} template
 * @returns {template is Template}
 */
function isValidTemplate(template) {
	return ["basic","starterkit"].includes(template);
}

/**
 * @typedef {import("../types").Template} Template
 * @typedef {import("../types").PackageManager} PackageManager
 * @typedef {import("../types").Context} Context
 */
