# Nuxtr contributing guide

The goal is to offer the best developer experience for Nuxt developers within VSCode. We're open to any suggestions and ideas that can help us achieve that goal.

One of the main challenges is to keep the extension as lightweight as possible. We want to avoid adding too many features that can be easily achieved with other extensions. We want to avoid turning Nuxtr into an opinionated extension that tries to do everything. Any features we already have that can be labeled as "opinionated" should be optional and should be justified by a good reason why adding it will improve the developer experience.

As part of our roadmap we're exploring the options of building separate extensions that be used on top of Nuxtr VSCode or offering APIs that can be used by other extensions.

## Repo

Nuxtr VSCode contains a typical [VSCode extension structure](https://code.visualstudio.com/api/get-started/extension-anatomy) with [./ui ](./ui) directory that contains the sidebar UI logic.

We're using PNPM, so make sure you have it installed. Here's a [quick guide](https://pnpm.io/installation) on how to install it.

## PRs

### Discuss first

We're always happy to have contributors to the project. Nuxtr is actively developed and we want to avoid wasting time and effort. [Starting a discussion](https://github.com/nuxtrdev/nuxtr-vscode/discussions/new?category=ideas) first will help save time and effort for both maintainers and contributors.

### Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to automate the release process. Please follow the commit conventions to make sure your PRs are included in the next release.
