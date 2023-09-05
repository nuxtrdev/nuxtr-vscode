import * as vscode from 'vscode';
type TsconfigPaths = Record<string, string[]>;

export function parseTsconfigPaths(tsconfigPaths: TsconfigPaths): {} {
    const parsedTsconfigPaths: TsconfigPaths = {};

    for (const key in tsconfigPaths) {
        if (!key.startsWith('#')) {
            const values = tsconfigPaths[key].filter(value => !value.startsWith('#'));

            const normalizedKey = key.replace(/(\/\*)?$/, '');

            const processedValues = values.map(value => {
                if (value === '..' || value === '../') {
                    value = './';
                } else if (value.startsWith('../')) {
                    value = `./${value.slice(3)}`;
                }

                return value.endsWith('/*') ? value.replace('/*', '') : value;
            });

            parsedTsconfigPaths[normalizedKey] = [processedValues[0]];
        }
    }

    return parsedTsconfigPaths;
}