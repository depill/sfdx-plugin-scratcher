// Forked from shane-sfdx-plugins

import { flags, SfdxCommand } from '@salesforce/command';
import fs = require('fs-extra');

export default class Bump extends SfdxCommand {

  public static description = 'bump the major/minor version number in the packageDirectory';

  public static examples = [
`sfdx scratcher:bump -m
// bump the minor version up by one (and set patch to 0)
`,
`sfdx scratcher:bump -M
// bump the major version up by one (and set minor/patch to 0)
`,
`sfdx scratcher:bump -p
// bump the patch version up by one
`

  ];

  protected static flagsConfig = {
    major: flags.boolean({ char: 'M', description: 'Bump the major version by 1, sets minor,build to 0', exclusive: ['minor', 'patch']}),
    minor: flags.boolean({ char: 'm', description: 'Bump the minor version by 1', exclusive: ['major', 'patch'] }),
    patch: flags.boolean({ char: 'p', description: 'Bump the patch version by 1', exclusive: ['major', 'minor'] }),
    target: flags.string({ char: 't', default: 'force-app', description: 'name of your package directory (defaults to force-app)' })
  };

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;
  protected static requiresDevhubUsername = false;

  public async run(): Promise<any> { // tslint:disable-line:no-any
    const projectFile = await this.project.retrieveSfdxProjectJson(false);

    const project = JSON.parse(fs.readFileSync(projectFile.getPath(), 'UTF-8'));

    const targetDirIndex = project.packageDirectories.findIndex( i => {
      return i.path === this.flags.target;
    });

    if ((targetDirIndex < 0 )) {
      this.ux.error(`found nothing in packageDirectories matching path ${this.flags.path}`);
    }

    const versionNumber = project.packageDirectories[targetDirIndex].versionNumber.split('.');

    if (this.flags.major) {
      versionNumber[0] = parseInt(versionNumber[0], 10) + 1;
      versionNumber[1] = 0;
      versionNumber[2] = 0;
    } else if (this.flags.minor) {
      versionNumber[1] = parseInt(versionNumber[1], 10) + 1;
      versionNumber[2] = 0;
    } else if (this.flags.patch) {
      versionNumber[2] = parseInt(versionNumber[2], 10) + 1;
    }

    project.packageDirectories[targetDirIndex].versionNumber = versionNumber.join('.');
    project.packageDirectories[targetDirIndex].versionName = "ver v" + versionNumber.slice(0, -2).join('.');

    await fs.writeFile(projectFile.getPath(), JSON.stringify(project, null, 2));

    this.ux.log(`Updated sfdx-project.json for ${this.flags.target} to ${project.packageDirectories[targetDirIndex].versionNumber}`);
    }
  }