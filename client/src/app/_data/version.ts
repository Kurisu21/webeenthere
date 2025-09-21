export const VERSION = {
  major: 2,
  minor: 1,
  patch: 0,
  build: '2025.09.20',
  codename: 'Dynamic Dashboard',
  releaseDate: 'September 20, 2025'
};

export const getVersionString = () => {
  return `v${VERSION.major}.${VERSION.minor}.${VERSION.patch}`;
};

export const getFullVersion = () => {
  return `${getVersionString()} (${VERSION.build}) - ${VERSION.codename}`;
};

export const getReleaseInfo = () => {
  return {
    version: getVersionString(),
    fullVersion: getFullVersion(),
    releaseDate: VERSION.releaseDate,
    codename: VERSION.codename
  };
};
