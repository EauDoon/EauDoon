import { readJson } from './catalog.mjs';

// The regular expression that semver.org suggests for SemVer 2.0.0: no leading
// zeros, no "v" prefix, a non-empty prerelease and build metadata.
export const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

// package.json is the only version source. It is read through readJson, so it
// gets the same size, encoding and duplicate-member guards as a catalog.
export function packageVersion(path = new URL('../package.json', import.meta.url)) {
  const { version } = readJson(path) ?? {};
  if (typeof version !== 'string' || !SEMVER.test(version)) throw new Error('Invalid package version');
  return version;
}
