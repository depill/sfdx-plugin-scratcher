sfdx-plugin-scratcher
=====================

Scratcher is a helper plugin to facilitate the creation of Scratch orgs which use Package2

[![Version](https://img.shields.io/npm/v/sfdx-plugin-scratcher.svg)](https://npmjs.org/package/sfdx-plugin-scratcher)
[![CircleCI](https://circleci.com/gh/depill/sfdx-plugin-scratcher/tree/master.svg?style=shield)](https://circleci.com/gh/depill/sfdx-plugin-scratcher/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/depill/sfdx-plugin-scratcher?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sfdx-plugin-scratcher/branch/master)
[![Codecov](https://codecov.io/gh/depill/sfdx-plugin-scratcher/branch/master/graph/badge.svg)](https://codecov.io/gh/depill/sfdx-plugin-scratcher)
[![Greenkeeper](https://badges.greenkeeper.io/depill/sfdx-plugin-scratcher.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/depill/sfdx-plugin-scratcher/badge.svg)](https://snyk.io/test/github/depill/sfdx-plugin-scratcher)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-plugin-scratcher.svg)](https://npmjs.org/package/sfdx-plugin-scratcher)
[![License](https://img.shields.io/npm/l/sfdx-plugin-scratcher.svg)](https://github.com/depill/sfdx-plugin-scratcher/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g sfdx-plugin-scratcher
$ sfdx-plugin-scratcher COMMAND
running command...
$ sfdx-plugin-scratcher (-v|--version|version)
sfdx-plugin-scratcher/0.0.1 darwin-x64 node-v8.9.4
$ sfdx-plugin-scratcher --help [COMMAND]
USAGE
  $ sfdx-plugin-scratcher COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx-plugin-scratcher scratcher:bump`](#sfdx-plugin-scratcher-scratcherbump)
* [`sfdx-plugin-scratcher scratcher:create`](#sfdx-plugin-scratcher-scratchercreate)

## `sfdx-plugin-scratcher scratcher:bump`

bump the major/minor version number in the packageDirectory

```
USAGE
  $ sfdx-plugin-scratcher scratcher:bump

OPTIONS
  -M, --major                                      Bump the major version by 1, sets minor,build to 0
  -m, --minor                                      Bump the minor version by 1
  -p, --patch                                      Bump the patch version by 1

  -t, --target=target                              [default: force-app] name of your package directory (defaults to
                                                   force-app)

  -v, --targetdevhubusername=targetdevhubusername  username or alias for the dev hub org; overrides default dev hub org

  --apiversion=apiversion                          override the api version used for api requests made by this command

  --json                                           format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)   logging level for this command invocation

EXAMPLES
  sfdx scratcher:bump -m
  // bump the minor version up by one (and set patch to 0)

  sfdx scratcher:bump -M
  // bump the major version up by one (and set minor/patch to 0)

  sfdx scratcher:bump -p
  // bump the patch version up by one
```

_See code: [src/commands/scratcher/bump.ts](https://github.com/depill/sfdx-plugin-scratcher/blob/v0.0.1/src/commands/scratcher/bump.ts)_

## `sfdx-plugin-scratcher scratcher:create`

Create a scratch org, install deps & pushes code

```
USAGE
  $ sfdx-plugin-scratcher scratcher:create

OPTIONS
  -d, --days=days                                  [default: 14] Days for the sandbox to live
  -v, --targetdevhubusername=targetdevhubusername  username or alias for the dev hub org; overrides default dev hub org
  --apiversion=apiversion                          override the api version used for api requests made by this command
  --json                                           format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)   logging level for this command invocation

EXAMPLE
  $ sfdx scratcher:create
           It will create the scratch orgs, install all of the dependancies, push the source code and assign the 
  permssion of the app
```

_See code: [src/commands/scratcher/create.ts](https://github.com/depill/sfdx-plugin-scratcher/blob/v0.0.1/src/commands/scratcher/create.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
