

var urlParams = new URLSearchParams(window.location.search)

var accessToken = urlParams.get('access_token')

console.log(`Our access token is ${accessToken}`)


var table = new Tabulator("#example-table", {
        //height:"311px",
    columns:[
        {formatter:"rowSelection", titleFormatter:"rowSelection", align:"center", headerSort:false, cellClick:function(e, cell){
           cell.getRow().toggleSelect();
           }},
        {title:"Name", field:"name", width:200, editor:"input"},
        {title:"Active", field:"active", formatter:"tickCross", editor:true},
        {title:"Badge#", field:"badge", editor:"input"},
        {title:"Band Saw", field:"bandsaw",formatter:"tickCross", editor:true},
        {title:"Drill Press", field:"drillpress", formatter:"tickCross",editor:"tickCross"},
        {title:"Miter Saw", field:"mitersaw", formatter:"tickCross",editor:"tickCross"},
        {title:"Lathe", field:"lathe", formatter:"tickCross",editor:"tickCross"},
        {title:"CNC Router", field:"cncrouter", formatter:"tickCross",editor:"tickCross"},
    ],
});


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


function commitToGithub()
{

    document.getElementById("commit-changes").disabled = true;
    document.getElementById("commit-changes").innerHTML = "working..."

    var gh = new GitHub({
        token: accessToken
        });

    var userList = table.getData();

    // Renumber all the users.
    for (idx = 0; idx < userList.length; idx++) {
        userList[idx].id = idx+1;
    }

    var newData = JSON.stringify(userList);


    var lichtenberg = gh.getRepo('lichtenberg','MSET-Tools');

    lichtenberg.writeFile("master","AuthorizedUsers.txt",newData,"Updated user list from web",function(err,stuff) {
            console.log(err);
            console.log(stuff);
            document.getElementById("commit-changes").disabled = false;
            document.getElementById("commit-changes").innerHTML = "Commit Changes"
        })


}

function loadTableFromGithub() {
    var gh = new GitHub({
        token: accessToken
        });


    var lichtenberg = gh.getRepo('lichtenberg','MSET-Tools');
    lichtenberg.getContents("master","AuthorizedUsers.txt",true,
                            function(err,stuff) {
                                console.log(stuff);
                                table.setData(stuff);
                            }
        );
}


loadTableFromGithub();

