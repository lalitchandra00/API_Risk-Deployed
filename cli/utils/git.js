import { spawnSync } from "child_process";
import { logError } from "./logger.js";

function runGit(args, cwd) {
    const result = spawnSync("git", args, {
        cwd,
        stdio: "pipe",
        encoding: "utf8"
    });

    if (result.error) {
        throw result.error;
    }

    return result;
}

export function ensureGitRepo(cwd) {
    const result = runGit(["rev-parse", "--is-inside-work-tree"], cwd);
    if (result.status !== 0 || !String(result.stdout).trim().includes("true")) {
        logError("Not a Git repository. Run this inside a Git repo.");
        process.exit(1);
    }
}

export function getGitRoot(cwd) {
    const result = runGit(["rev-parse", "--show-toplevel"], cwd);
    if (result.status !== 0) {
        logError("Failed to resolve Git root.");
        process.exit(1);
    }
    return String(result.stdout).trim();
}

export function getStagedFiles(cwd) {
    const result = runGit(["diff", "--cached", "--name-only"], cwd);
    if (result.status !== 0) {
        logError("Failed to read staged files.");
        process.exit(1);
    }

    return String(result.stdout)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}
