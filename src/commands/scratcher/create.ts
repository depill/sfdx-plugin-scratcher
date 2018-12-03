import {core, SfdxCommand} from '@salesforce/command';
import {AnyJson} from '@salesforce/ts-types';
import * as child from 'child_process';
import * as util from 'util';
const exec = util.promisify(child.exec);


// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-plugin-scratcher', 'scratcher-create');

export default class Create extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');

    // Comment this out if your command does not require an org username
    protected static requiresUsername = false;

    // Comment this out if your command does not support a hub org username
    protected static supportsDevhubUsername = true;

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    public static examples = [
        `$ sfdx scratcher:create
        It will create the scratch orgs, install all of the dependancies, push the source code and assign the permssion of the app
        `,
    ];

    public async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
    }

    public async run(): Promise<AnyJson> {
        //const project = await this.project.resolve();
        interface IPackageInstall {
            [key: string]: string;
         } 


        const projectJson = await this.project.resolveProjectConfig();
        let packagesToInstall:IPackageInstall = {};
        let definitionFile:string;
        const scratcherFolder = projectJson['plugins']['scratcher'];
        const scratcherPrefix = scratcherFolder['prefix'];
        const scratchNamespace = scratcherFolder['namespace'];

        const packageDirectories: any[] = projectJson['packageDirectories'];
        
        
        this.ux.log(packageDirectories.length);
        if(packageDirectories != undefined && packageDirectories.length > 0) {
            for (const packageConfig of packageDirectories) {
                // If this is the default package directory we resolve for dependencies
                if(packageConfig.default) {
                    definitionFile = packageConfig.definitionFile;

                    if(packageConfig.dependencies != undefined && packageConfig.dependencies.length > 0) {
                        for (const dependancy of packageConfig.dependencies) {
                            packagesToInstall[dependancy.package] = projectJson['packageAliases'][dependancy.package];
                        }
                    }
                }
            }
        }
        this.ux.startSpinner('Starting to create the SFDX org ');
        const createScratchOrgCommand = `sfdx force:org:create -f ${definitionFile} -w 60 -s -d 14`;
        const createScratchOrgResult = await exec(createScratchOrgCommand, { maxBuffer: 1000000 * 1024 });
        //this.ux.log(createScratchOrgResult.stdout);
        //this.ux.log(createScratchOrgResult.stderr);

        if (createScratchOrgResult.stderr) {
            this.ux.error(createScratchOrgResult.stderr);
            return;
        }
        this.ux.stopSpinner('Finished creating the SFDX org');

        await this.asyncForEach(Object.keys(packagesToInstall), async (packageName) => {
            const packageId = packagesToInstall[packageName];
            this.ux.startSpinner(`Installing package ${packageName}`);
            const installCommand = `sfdx force:package:install --package ${packageId} -w 60 -r`;
            const installResult = await exec(installCommand, { maxBuffer: 1000000 * 1024 });
            if (installResult.stderr) {
                this.ux.error(`Error on installing packages "${packagesToInstall}"`)
                this.ux.error(installResult.stderr);
                return;
            }
            this.ux.stopSpinner(`Finshed installing package ${packageName}`);

        });
        this.ux.startSpinner('Push source code');
        const pushCommand = `sfdx force:source:push`;
        const pushResult = await exec(pushCommand, { maxBuffer: 1000000 * 1024 });
        if (pushResult.stderr) {
            this.ux.error(pushResult.stderr);
            return;
        }
        this.ux.stopSpinner('Finished pushing source code');

        this.ux.startSpinner('Assigining Admin Permission Set to the running user');
        
        // TODO: Resolve for dependant permission sets to assign them as well.
        const permSetCommand = `sfdx force:user:permset:assign -n ${scratcherPrefix}_${scratchNamespace}_Admin_User`;
        const permSetResult = await exec(permSetCommand, { maxBuffer: 1000000 * 1024 });
        if (permSetResult.stderr) {
            this.ux.error(permSetResult.stderr);
            // This can fail without failing the whole programs return; 
        }
        this.ux.stopSpinner('Finished assigining Admin Permission Set to the running user');

        return null;
    }
}