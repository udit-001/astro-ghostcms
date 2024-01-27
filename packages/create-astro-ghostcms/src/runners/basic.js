import path from "node:path";
import fse from "fs-extra";
import c from 'picocolors';
import { execa } from "execa";
import * as prompts from "@clack/prompts";
import { exitPrompt, getModulePaths, isPathname,
	normalizePath, wait } from "../lib/utils.js";

/** @param {Context} ctx */
export async function createBasic(ctx) {
	let { args, dryRun, initGitRepo, installDeps } = ctx;

	const spinner = prompts.spinner();
	let cwd = process.cwd();

	// 1. Set up project directory
	const project = await getProjectDetails(args[0], { cwd });
	if (dryRun) {
		await wait(1);
	} else {
		await fse.ensureDir(project.pathname);
	}

	// 2. Create the damned thing
	cwd = project.pathname;
	const relativePath = path.relative(process.cwd(), project.pathname);
	spinner.start(`Creating a new Astro-GhostCMS project in ${relativePath}`);
	if (dryRun) {
		await wait(2000);
	} else {
		await createApp(project.name, project.pathname, {
			onError(error) {
				spinner.stop("Failed to create new project");
				prompts.cancel();
				console.error(error);
				process.exit(1);
			},
		});
	}
	spinner.stop(`New Astro-GhostCMS project '${project.name}' created 🚀`);
	const fCheck = await prompts.group(
		{ 	initGitRepo: () => 
				prompts.confirm({
					message: "Initialize a Git repository?",
					initialValue: false,
			}),
			installDeps: () => 
				prompts.confirm({
					message: "Install dependencies? (Recommended)",
					initialValue: false,
			}),
		},
		{ 	onCancel: () => {
				prompts.cancel(c.red('Operation Cancelled!'));
				process.exit(0);
			}
		}
	);

	initGitRepo = initGitRepo ?? fCheck.initGitRepo;
	// 3. Initialize git repo
	if (initGitRepo) {
		if (dryRun) {
			await wait(1);
		} else {
			await exec("git", ["init"], { cwd });
		}
		prompts.log.success("Initialized Git repository");
	} else {
		prompts.log.info("Skipped Git initialization");
	}

	// 4. Install dependencies
	installDeps = installDeps ?? fCheck.installDeps;
	const pm = ctx.pkgManager ?? "pnpm";
	if (installDeps) {
		spinner.start(`Installing dependencies with ${pm}`);
		if (dryRun) {
			await wait(1);
		} else {
			await installDependencies(pm, { cwd });
		}
		spinner.stop(`Dependencies installed with ${pm}`);
		success()
	} else {
		prompts.log.info("Skipped dependency installation");
		success()
	}

	const { black, bgYellow, yellow, green } = c.createColors(true)
	const i = yellow;
	const nextSteps = `
	If you didnt opt to install Dependencies dont forget to run: \n 
	${i('npm install')} / ${i('pnpm install')} / ${i('yarn install')} inside your project directory! \n 
	\n
	${bgYellow+black("Dont forget to modify your .env file for YOUR ghost install!")} `
	
	function success() {
		prompts.note(nextSteps);
		prompts.outro(green("Deployment Complete!"));
	}
}

/**
 *
 * @param {string} projectName
 * @param {string} projectPathname
 * @param {{ onError: (err: unknown) => any }} opts
 */
async function createApp(projectName, projectPathname, { onError }) {
	const { pathname } = getModulePaths(import.meta.url);
	const templatesDir = path.resolve(pathname, "..", "..", "templates");
	const sharedTemplateDir = path.join(templatesDir, "_shared");
	const basicTemplateDir = path.join(templatesDir, "basic");

	await fse.ensureDir(projectPathname);

	// TODO: Detect if project directory is empty, otherwise we
	// can't create a new project here.
	await fse.copy(basicTemplateDir, projectPathname);

	// Copy misc files from shared
	const filesToCopy = [
		{
			src: path.join(sharedTemplateDir, ".env"),
			dest: path.join(projectPathname, ".env"),
		},
	];
	await Promise.all(
		filesToCopy.map(async ({ src, dest }) => await fse.copy(src, dest))
	);

	/** @type {Array<{ pathname: string; getUpdates: (contents: string) => string }>} */
	const filesToUpdate = [
		{
			pathname: path.join(projectPathname, "package.json"),
			getUpdates: updateProjectName,
		},
	];
	await Promise.all(
		filesToUpdate.map(async ({ pathname, getUpdates }) => {
			const contents = await fse.readFile(pathname, "utf-8");
			const updatedContents = getUpdates(contents);
			await fse.writeFile(pathname, updatedContents, "utf-8");
		})
	);

	/** @param {string} contents */
	function updateProjectName(contents) {
		return contents.replace(/{{PROJECT_NAME}}/g, projectName);
	}
}

/**
 * @param {string|undefined} projectNameInput
 * @param {{ cwd: string }} opts
 */
async function getProjectDetails(projectNameInput, opts) {
	let projectName = projectNameInput;
	if (!projectName) {
		const defaultProjectName = "my-astro-ghost";
		let answer = await prompts.text({
			message: "Where would you like to create your project?",
			placeholder: `.${path.sep}${defaultProjectName}`,
		});
		if (prompts.isCancel(answer)) exitPrompt();

		answer = answer?.trim();
		projectName = answer || defaultProjectName;
	}

	/** @type {string} */
	let pathname;

	if (isPathname(projectName)) {
		const dir = path.resolve(opts.cwd, path.dirname(normalizePath(projectName)));
		projectName = toValidProjectName(path.basename(projectName));
		pathname = path.join(dir, projectName);
	} else {
		projectName = toValidProjectName(projectName);
		pathname = path.resolve(opts.cwd, projectName);
	}

	return {
		name: projectName,
		pathname,
	};
}

/**
 * @param {string} command
 * @param {readonly string[]} args
 * @param {{ cwd: string }} options
 * @returns {Promise<{ code: number | null; signal: NodeJS.Signals | null }>}
 */
async function exec(command, args, options) {
	const installExec = execa(command, ["init"], { ...options, stdio: "ignore" });
	return new Promise((resolve, reject) => {
		installExec.on("error", (error) => reject(error));
		installExec.on("close", (code, signal) => resolve({ code, signal }));
	});
}

/**
 * @param {"npm" | "yarn" | "pnpm"} packageManager
 * @param {{ cwd: string }} opts
 * @returns
 */
async function installDependencies(packageManager, { cwd }) {
	const installExec = execa(packageManager, ["install"], { cwd });
	return new Promise((resolve, reject) => {
		installExec.on("error", (error) => reject(error));
		installExec.on("close", () => resolve());
	});
}

/**
 * @param {string} projectName
 */
function toValidProjectName(projectName) {
	if (isValidProjectName(projectName)) {
		return projectName;
	}
	return projectName
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/^[._]/, "")
		.replace(/[^a-z\d\-~]+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "");
}

/**
 * @param {string} projectName
 */
function isValidProjectName(projectName) {
	return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
		projectName
	);
}

/**
 * @typedef {import("../../types.js").Template} Template
 * @typedef {import("../../types.js").PackageManager} PackageManager
 * @typedef {import("../../types.js").Context} Context
 * @typedef {import("../../types.js").Serializable} Serializable
 */
