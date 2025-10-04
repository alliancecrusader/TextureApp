import * as SFSTypes from "../types/sfs"

interface IBlueprint extends SFSTypes.Blueprint {}

class Blueprint implements IBlueprint {
    parts: SFSTypes.Part[];
    miscInfo: SFSTypes.MiscInfo;
    dependencyInfo: SFSTypes.DependencyInfo;

    constructor (originalBpJson: SFSTypes.BlueprintJSON) {
        
    }
}