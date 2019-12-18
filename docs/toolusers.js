
//
// Dig the token out of our URL parameters.
//
var urlParams = new URLSearchParams(window.location.search)
var accessToken = urlParams.get('access_token')

console.log(`Our access token is ${accessToken}`)

//
// Create a github object and get a handle on our repository.
//

var gh = new GitHub({
    token: accessToken
     });

var repo = gh.getRepo('lichtenberg','MSET-Tools');

//
// Globals
//
var table = null;
var toolList = [];

//
// Static columns (always present)
//
var staticColumns = [
    {formatter:"rowSelection", titleFormatter:"rowSelection", align:"center", frozen:true,
     headerSort:false, cellClick:function(e, cell){
           cell.getRow().toggleSelect();
           }},
    {title:"Name", field:"name", width:200, editor:"input",frozen:true},
    {title:"Active", field:"active", formatter:"tickCross", editor:true},
    {title:"Mentor", field:"mentor", formatter:"tickCross", editor:true}
];


//
// Generate column info for tabulator given a tool list we got from github
//
function generateColumns(tools)
{
    columns = staticColumns;

    tools.forEach(function(v) {
        e = { title: v.name, field: v.key, formatter:"tickCross", editor:true};
        columns.push(e);
    })

    return columns;
}

//Add row on "Add Row" button click
$("#add-user").click(function(){
        console.log("Adding a row")
            table.addRow({},true);
});

//Delete row on "Delete Row" button click
$("#del-user").click(function(){
        console.log("Deleting a row")
            table.deleteRow(table.getSelectedRows());
});

//Clear table on "Empty the table" button click
$("#undo-changes").click(function(){
        table.clearData();
        loadTableFromGithub();
        console.log("Would reload data here.")
});

//Reset table contents on "Reset the table" button click
$("#commit-changes").click(function(){
        commitToGithub()
});


//
// commit current contents of table to github
//
function commitToGithub()
{

    document.getElementById("commit-changes").disabled = true;
    document.getElementById("commit-changes").innerHTML = "working..."

    var userList = table.getData();

    // Renumber all the users.
    for (idx = 0; idx < userList.length; idx++) {
        userList[idx].id = idx+1;
    }

    // Use the fancy stringify to make merges with git easier.
    var newData = JSON.stringify(userList, null, 2);

    repo.writeFile("master","AuthorizedUsers.txt",newData,"Updated user list from web",function(err,stuff) {
            console.log(err);
            console.log(stuff);
            document.getElementById("commit-changes").disabled = false;
            document.getElementById("commit-changes").innerHTML = "Commit Changes"
        })


}


//
// Retrieve the table info from github
// not used anymore, we do the promise thing
//
function loadTableFromGithub() {

    repo.getContents("master","AuthorizedUsers.txt",true,
                            function(err,stuff) {
                                console.log(stuff);
                                table.setData(stuff);
                            }
        );
}




//
// Mainline code: Retrieve the tool names, then the table of authorizations
//
repo.getContents("master","ToolNames.json",true)
    .then(function(result) {
        table = new Tabulator("#example-table", { columns:generateColumns(result.data) })
        return result;
    })
    .then(function(result) {
        return repo.getContents("master","AuthorizedUsers.txt",true)                                
    })
    .then(function(result) {
        table.setData(result.data);
        return result;
    })
    .catch(function(err) {
        console.log(`Error callback : ${err.message}`);
        return err;
    });



