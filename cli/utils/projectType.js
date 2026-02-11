import fs from "fs";
import path from "path";

export function detectProjectType(rootDir) {
  const hasFile = (fileName) => fs.existsSync(path.join(rootDir, fileName));

  if (hasFile("package.json")) {
    return "Node";
  }

  if (hasFile("requirements.txt") || hasFile("pyproject.toml")) {
    return "Python";
  }

  if (hasFile("pom.xml") || hasFile("build.gradle")) {
    return "Java";
  }

  return "Unknown";
}
