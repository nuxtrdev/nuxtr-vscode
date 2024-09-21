import _ from 'lodash';

export default {
    install (app) {
        const componentFiles = import.meta.globEager('./components/Icon/*.vue');

        for (const [path, m] of Object.entries(componentFiles)) {
            const componentName = _.upperFirst(
                _.camelCase(
                    path
                        .split('/')
                        .pop()
                        .replace(/\.\w+$/, ''),
                ),
            );

            app.component(`Icon${componentName}`, m.default);
        }
    },
};
