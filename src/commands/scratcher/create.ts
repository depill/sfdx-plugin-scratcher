import {core, flags, SfdxCommand} from '@salesforce/command';
import {AnyJson} from '@salesforce/ts-types';
import * as child from 'child_process';

import * as util from 'util';
const exec = util.promisify(child.exec);
//const { spawn } = require('child_process');
//import spawn from 'child_process';



// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-plugin-scratcher', 'scratcher-create');
declare module SFDXJSONMessage {

    export interface Result {
        columnNumber?: string;
        lineNumber?: string;
        error?: string;
        fullName?: string;
        type?: string;
        filePath?: string;
    }

    export interface Success {
        state?: string;
        fullName?: string;
        type?: string;
        filePath?: string;
    }

    export interface RootObject {
        message?: string;
        status: number;
        exitCode?: number;
        stack?: string;
        name?: string;
        result?: Result[];
        warnings?: any[];
        partialSuccess?: Success[];
        success?: Success[];

    }
    
    interface CreateResultI {
        stdout: string;
        stderr: string;
      }
}

export default class Create extends SfdxCommand {


    public static description = messages.getMessage('commandDescription');

    // Comment this out if your command does not require an org username
    protected static requiresUsername = false;

    // Comment this out if your command does not support a hub org username
    protected static supportsDevhubUsername = true;

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    protected static flagsConfig = {
        // flag with a value (-d, --days=VALUE)
        days: flags.string({char: 'd', description: 'Days for the sandbox to live', default: '14'}),
      };


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
    
    public parseResultTrueIfError (input: SFDXJSONMessage.CreateResultI) {
        let jsonResult: SFDXJSONMessage.RootObject = JSON.parse(input.stdout);
        if (jsonResult.exitCode > 1 || (jsonResult.status > 0 && !jsonResult.exitCode)) {
            console.error(jsonResult);
            return true;
        }
        return false;
    }



    public async run(): Promise<AnyJson> {
        //const project = await this.project.resolve();
        interface IPackageInstall {
            [key: string]: string;
         } 
        
        const options = {
            cwd: process.cwd(),
            env: {  
                    "SFDX_JSON_TO_STDOUT": "true",
                    PATH: process.env.PATH,
                    HOME: process.env.HOME,
                    PROXY: process.env.PROXY,
                    HTTP_PROXY: process.env.HTTP_PROXY,
                    HTTPS_PROXY: process.env.HTTPS_PROXY
            },
            maxBuffer: 100000 * 1024
        }

        const projectJson = await this.project.resolveProjectConfig();
        let packagesToInstall:IPackageInstall = {};
        let definitionFile:string;
        const scratcherFolder = projectJson['plugins']['scratcher'];
        const scratcherPrefix = scratcherFolder['prefix'];
        const scratchNamespace = scratcherFolder['namespace'];
        const packageDirectories: any[] = projectJson['packageDirectories'];
        
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
        
        console.log('Starting to create the SFDX org ');
        const createScratchOrgCommand = `sfdx force:org:create -f ${definitionFile} -w 60 -s -d ${this.flags.days} --json | jq .`;
        const createScratchOrgResult = await exec(createScratchOrgCommand, options);
        if(this.parseResultTrueIfError(createScratchOrgResult))
            return; 
        console.log('Finished creating the SFDX org');

        await this.asyncForEach(Object.keys(packagesToInstall), async (packageName) => {
            const packageId = packagesToInstall[packageName];
            console.log(`Installing package ${packageName}`);
            const installCommand = `sfdx force:package:install --package ${packageId} -w 60 -r --json | jq .`;
            const installResult = await exec(installCommand, options);
            if(this.parseResultTrueIfError(installResult))
                return; 
                
            console.log(`Finshed installing package ${packageName}`);

        });
        
       
        console.log('Push source code');
        const pushCommand = `sfdx force:source:push --json | jq .`;
        const pushResult = <SFDXJSONMessage.CreateResultI> await exec(pushCommand, options);
        if(this.parseResultTrueIfError(pushResult))
            return; 

        console.log('Stopped pushing code');

        console.log('Assigining Admin Permission Set to the running user');
        
        // TODO: Resolve for dependant permission sets to assign them as well.
        const permSetCommand = `sfdx force:user:permset:assign -n ${scratcherPrefix}_${scratchNamespace}_Admin_User --json | jq .`;
        const permSetResult = await exec(permSetCommand, options);
        if(this.parseResultTrueIfError(permSetResult))
            return; 

        console.log('Finished assigining Admin Permission Set to the running user');
        
        return null;
    }
}