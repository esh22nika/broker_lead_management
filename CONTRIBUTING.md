# Contributing to BLMS

## Branch Naming Rules

| Branch                    | Purpose                                                          | Protected |
| ------------------------- | ---------------------------------------------------------------- | --------- |
| main                      | Production-ready, release-tagged code only                       | Yes       |
| develop                   | Integration branch, all features merge here first                | Yes       |
| feature/short-description | One branch per user story or task, e.g. feature/create-lead-form | No        |
| release/version           | Release stabilization, e.g. release/v0.1.0                       | No        |
| hotfix/short-description  | Urgent fix branched from main                                    | No        |

Rules:

- Branch from develop for all feature work. Branch from main only for hotfixes.
- No direct pushes to main or develop. All changes land through a pull request.
- Delete feature branches after merge.

## Branch Protection (set on GitHub, for both main and develop)

- Require a pull request before merging
- Require at least 1 approving review
- Require status checks to pass before merging (once Jenkins is connected)
- Require branches to be up to date before merging
- No force pushes, no branch deletion

## Commit Message Convention

Format: type(optional scope): short summary

Types: feat, fix, docs, chore, refactor, test, ci

Examples:
feat(backend): add Lead entity and repository
fix(frontend): correct status filter on leads list
docs: update README with local setup steps
chore: add .gitignore for Java and Node

## Pull Request Process

1. Create a feature branch off develop.
2. Commit incrementally with meaningful messages.
3. Push the branch and open a PR into develop.
4. Address review comments.
5. Merge once approved and, from Week 10 onward, once the Jenkins pipeline is green.
6. Delete the branch after merge.
