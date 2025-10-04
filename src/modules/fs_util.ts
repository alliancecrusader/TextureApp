// import * as fs from 'fs';

export const getFileExtension = (fileName: string) => {
    const extensionRegex = /\.([^.]+)$/;
    const match = fileName.match(extensionRegex);
    
    if (match) {
        return match[match.length - 1].toString();
    } else {
        return "";
    }
}

export const removeFileExtension = (fileName: string, recursive: boolean = true) => {
    const fileNameLen = fileName.length;
    const extensionRegexFull = /(\.([^.]+))+$/;

    if (recursive) {
        let extensionMatch = fileName.match(extensionRegexFull);

        if (extensionMatch) {
            return fileName.slice(undefined, fileNameLen - extensionMatch[0].length)
        } else {
            return fileName;
        }
    } else {
        const extensionLen = getFileExtension(fileName).length;
        return fileName.slice(undefined, fileNameLen - extensionLen);
    }
}