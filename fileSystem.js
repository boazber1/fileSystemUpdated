
/**
 * Created by Boaz on 24/01/2017.
 */
const readlineSync = require('readline-sync');
const colors = require('colors');
const fs = require('fs');

var exit = false;//global variable to control the exit command
var uniqueID = 0;// will hold the id of the current folder
var path = 'root';
var trackUniqueId = 6;


var menu = [//user menu
    ' Print current folder.',
    ' Change(go back or forward) ',
    ' Create file or folder',
    ' Open file',
    ' Delete file',
    ' Export storage to file',
    ' Import storage from file',
    ' Exit(suit yourself out from the program)'
];

/*file structure  : {id : 'unique id', parent: parent_id , name :'fileName', type: ' directory or file',
 subFiles(if needed): [], content(in txt files) : }
 */


var storage = [
    {
        id: 0,
        parent: 0,
        name: 'root',
        type: 'directory',
        subFiles:[
            {
                id: 1,
                parent: 0,
                name: 'sub1',
                type: 'directory',
                subFiles: [
                    {
                        id: 4,
                        parent: 1,
                        name: 'file.txt1',
                        type: 'file',
                        content: 'i\'m file.txt1'
                    },
                    {
                        id: 5,
                        parent: 1,
                        name: 'sub7',
                        type: 'directory',
                        subFiles: []

                    },

                ]

            },
            {
                id: 2,
                parent: 0,
                name: 'sub2',
                type: 'directory',
                subFiles :[

                ]

            },

            {
                id: 3,
                parent: 0,
                name: 'file1.txt',
                type :'file',
                content: 'i\'m file.txt1...'

            },
        ]


    }
];
var root = storage[0];// will hold our array of files from the root point
console.log(colors.green(path + ">") );


while(!exit){
    console.log("\n" +colors.red("MENU :") );
    printMenu();
}


function printMenu(){
    var userMenuInput = readlineSync.keyInSelect(menu, colors.magenta('Chose your menu option:'));
    userMenuInput++;

    switch (userMenuInput){//calling functions according to user menu input
        case 1 :
            console.log(trackUniqueId);
            printRootSorted();
            break;
        case 2 :
            changeDirectory();

            break;
        case 3 :
            createNewFile();
            break;
        case 4 :
            showFileContent();
            break;
        case 5 :
            deleteFile();
            break;
        case 6 :
            exportFileSystemToFile();
            break;
        case 7:
            importFileSystemFromFile();
            break;
        case 8:
            exitProgram();
            break;

        default:


    }
}
/**** User functions ****/

function printRootSorted(){
    console.log(colors.green(path + ">"));
    var folder = currentFolder(root, uniqueID);
    var foldersArray = [];
    var filesArray = [];
    if(folder.type === 'directory') {
        for (var i = 0; i < folder.subFiles.length; i++) {
            if (folder.subFiles[i].type === 'file') {
                filesArray.push(folder.subFiles[i].name);
            } else {
                foldersArray.push(folder.subFiles[i].name);
            }
            foldersArray.sort();
            filesArray.sort();
        }
    } else {
        filesArray.push(folder.subFiles[i].name);
    }
    for(var j = 0; j < foldersArray.length; j++){
        console.log(colors.blue("  " + foldersArray[j]));
    }
    for(var k = 0; k < filesArray.length; k++){
        console.log(colors.yellow("    " + filesArray[k]));
    }
}

function changeDirectory(){
    var toGo = readlineSync.question(colors.magenta("To move forward type [folder name], to move backward type [..] "));
    var folder;
    if(toGo === '..'){
        folder = myFather(root, uniqueID);
        if (folder !== undefined) {
            uniqueID = folder.id;
            path = path.substr(0, (path.length - folder.name.length));
            console.log(colors.green(path));
        }
    } else {
        folder = currentFolder(root, uniqueID);
        if (folderIsExist(folder, toGo)){
            for (var i = 0; i < folder.subFiles.length; i++){
                if (folder.subFiles[i].name === toGo){
                    uniqueID = folder.subFiles[i].id;
                }
            }
            path += "\\" + toGo;
        } else {
            console.log(colors.red("ERROR : no directory called: " + toGo +" under " + folder.name + " directory"));
        }
    }


}

function createNewFile() {
    var whatToCreate = readlineSync.question(colors.magenta("to create file type'file', to create folder type'folder': "));
    var name = '';
    var content = '';
    var folder = currentFolder(root,uniqueID);
    while ((whatToCreate !== 'file' && whatToCreate !== 'folder') ){
        whatToCreate = readlineSync.question(colors.magenta("you should type file or folder in order to create one of them: "));
    }
    if(whatToCreate === 'file'){
        name = readlineSync.question(colors.magenta("Please name the file you want to create: "));
        if(!name.includes('.')){
            console.log(colors.red("ERROR: file name pattern is [fileName.fileType] e.g - file4.txt "));
        } else if(fileIsExist(folder, name)){
            console.log(colors.red("ERROR: " + name +" is already exist under " + folder.name + " folder"));
        } else {
            content = readlineSync.question(colors.magenta("To add content to the file type it now, to live it empty type the Enter button: "));
            folder.subFiles.push({id: trackUniqueId ,parent: folder.id, name: name, type: 'file', content: content});
            trackUniqueId ++;
            console.log(colors.magenta(name + " was created"));
        }
    } else if (whatToCreate === 'folder'){
        name = readlineSync.question(colors.magenta("Please name the folder you want to create: "));
        if(name.includes('.')){
            console.log(colors.red("ERROR: folder name can't contain '.'"));
        } else if (fileIsExist(folder, name)){
            console.log(colors.red("ERROR: " + name +" is already exist under " + folder.name + " folder"));
        } else {
            folder.subFiles.push({id: trackUniqueId , parent: folder.id, name: name, type: 'directory', subFiles: []});
            trackUniqueId ++;
            console.log(colors.magenta(name + " was created"));
        }
    }


}

function showFileContent(){
    var file = readlineSync.question(colors.magenta("Which file content would you like to display? "));
    var folder = currentFolder(root, uniqueID);
    if (!file.includes('.')){
        console.log(colors.red("ERROR: file name pattern is [fileName.fileType]"));
    } else if(!fileIsExist(folder, file)) {
        console.log(colors.red("ERROR: " + file +" is not exist under " + folder.name + " folder"));
    } else {
        for(var i = 0; i < folder.subFiles.length; i++){
            if (folder.subFiles[i].name === file){
                if(folder.subFiles[i].name.length === 0){
                    console.log(colors.magenta(file + " is empty"))
                } else {
                    console.log(colors.magenta("file content : ") + folder.subFiles[i].content);
                }
            }
        }
    }
}

function deleteFile(){
    var fileToDelete = readlineSync.question(colors.magenta("Which file you like to delete? "));
    var folder = currentFolder(root, uniqueID);
    for (var i = 0; i < folder.subFiles.length; i++){
        if (folder.subFiles[i].name === fileToDelete){
            folder.subFiles.splice(i, 1);
            console.log(colors.magenta(fileToDelete + " was deleted from " + folder.name));
        } else {
            console.log(colors.magenta("No file called " + fileToDelete + " under " + folder.name));
        }
    }
}

function exportFileSystemToFile(){
    var arr = [];
    treeToLinearArray(root, arr);
    bubbleSort(arr);
    linearArrayToFile('externalArrayFile.txt',arr);
    console.log(colors.magenta(" File system was successfully exported"));
}

function importFileSystemFromFile(){
    var arr = getLinearArrayFromFile('externalArrayFile.txt');
    bubbleSort(arr);
    root = arr[0];
    storage[0] = root;
    path = 'root';
    uniqueID = 0;
    updateTrackId(root);
    console.log(colors.magenta(" File system was successfully imported"));
}



function exitProgram() {// exit the program safely using the process object
    var exitProgram = readlineSync.question(colors.magenta("Are you sure you want to exit? (y / n)"));
    if(exitProgram.toLowerCase() === 'y'){
        exit = true;
        process.exit();
    } else if(exitProgram.toLowerCase() === 'n' ){
        printMenu();
    } else {
        console.log(colors.magenta("Your answer should contain y or n"));
        printMenu();
    }
}

/*** intermediate functions ***/

function currentFolder (currentLocation, currId){
    var result = undefined;
    if (currentLocation.id === currId){
        return currentLocation;
    } else if(currentLocation.type === 'directory') {
        for (var i = 0; i < currentLocation.subFiles.length; i++){
            if (currentLocation.subFiles[i].id === currId){
                return currentLocation.subFiles[i]
            } else {
                result = currentFolder(currentLocation.subFiles[i], currId);
                if(result !== undefined){
                    return result;
                }
            }
        }
    }

}

function myFather(currentLocation, currId) {
    var result = undefined;
    if(currId === 0){
        console.log(colors.red("You are in the root folder, no where to go back"));
        return undefined;
    } else {
        for (var i = 0; i < currentLocation.subFiles.length; i++){
            if (currentLocation.subFiles[i].id === currId){
                return currentLocation;
            } else if (currentLocation.subFiles[i].type === 'directory') {
                result = myFather(currentLocation.subFiles[i], currId);
                if (result !== undefined){
                    return result;
                }
            }
        }
    }
}


function folderIsExist(folder , folderInFolder) {


    for (var i = 0; i < folder.subFiles.length; i++){
        if (folder.subFiles[i].name === folderInFolder && folder.subFiles[i].type === 'directory'){
            return true;
        }
    }
    return false;
}

function fileIsExist(folder , fileInFolder) {


    for (var i = 0; i < folder.subFiles.length; i++){
        if (folder.subFiles[i].name === fileInFolder && folder.subFiles[i].type === 'file'){
            return true;
        }
    }
    return false;
}

function treeToLinearArray(currentFolder, arr){
    arr.push(currentFolder);
    if (currentFolder.type === 'directory') {
        for (var i = 0; i < currentFolder.subFiles.length; i++) {
            treeToLinearArray(currentFolder.subFiles[i], arr);
        }
    }
}



function bubbleSort(arr) {
    var swapped;
    do {
        swapped = false;
        for (var i=0; i < arr.length-1; i++) {
            if (arr[i].id > arr[i+1].id) {
                var temp = arr[i];
                arr[i] = arr[i+1];
                arr[i+1] = temp;
                swapped = true;
            }
        }
    } while (swapped);
}



function linearArrayToFile(fileNameWriteTo, linearArray){
    const fs = require('fs');
    fs.writeFileSync(__dirname +"/"+ fileNameWriteTo, JSON.stringify(linearArray));
}


function getLinearArrayFromFile(fileNameReadFrom){
    const fs = require('fs');
    try{
        var linearArray = fs.readFileSync(__dirname +"/"+ fileNameReadFrom).toString();
        if (linearArray !== ''){
            linearArray = JSON.parse(linearArray);
        } else {
            console.log("\'"+fileNameReadFrom+"\' is empty");
        }
    } catch (e){
        console.log(colors.bgRed("Error!!!!!"));
        linearArray = 0;
    }
    return linearArray;
}

function updateTrackId(file){
    if (file.id >= trackUniqueId){
        trackUniqueId = file.id+1;
    }
    if (file.type === 'directory'){
        for (var i=0; i<file.subFiles.length; i++){
            updateTrackId(file.subFiles[i]);
        }
    }
}
