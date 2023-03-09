# Universal environment based settings module

The module offers an easy to use interface to access validated settings provided via the environment.
The settings are provided template based. The template describes the expected settings and validation methods to guarantee that the property meets the expectations.
After initializing the settings you are guaranteed to receive only expected and validated values from the config.

Features:
- Environment provides the settings
- Template bassed (describes the expected settings)
- Validation functions guarantee that the settings meet the expectation
- Fundamental core settings that are provided without beeing mentioned in the template (version, builddate, environment, loglevel, logtoconsole, development)
- 97% test coverage

## Installation

Install latest version and save it in *package.json*

```sh
npm i --save https://github.com/ESTOS/ucconfig
```