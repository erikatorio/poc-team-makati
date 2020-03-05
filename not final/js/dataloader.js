//graph declarations
var graph = null; //3D
var barGraph = null; //2D Barchart
var pieChart = null; //Pie Chart
var myChart = null; //Trend Chart

var data = null;
var reports = [];
var notif = false;
var categoriesCount = [];
var groupsCount = [];
var categories = [];
var groups = [];
var colors = [];
var pieColors = [];
var csvData = [];
var users = [];
var logs = [];
var reportSelected = {};
var maxZvalue = 0;
var loaded = false;

var byGroupCount = [];
var byCategoryCount = [];
var maxCategoryCount = 0;
var maxGroupCount = 0;

function clearValues() {
    categoriesCount = [];
    groupsCount = [];
    categories = [];
    groups = [];
    reports = [];
    groupsCount = [];
    colors = [];
    pieColors = [];
    notif = false;
    return;
}

//Array initializations
function initializeCounts() {
    for (let i = 0; i < categories.length; i++) {
        categoriesCount[i] = 0;
    }

    for (let i = 0; i < groups.length; i++) {
        groupsCount[i] = 0;
    }
}

function initArray() {
    for (let i = 0; i < groups.length; i++) {
        byGroupCount[i] = [];
    }

    for (let i = 0; i < categories.length; i++) {
        byCategoryCount[i] = [];
    }

    for (let i = 0; i < categories.length; i++) {
        for (let j = 0; j < groups.length; j++) {
            byCategoryCount[i][j] = 0;
        }
    }

    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            byGroupCount[i][j] = 0;
        }
    }
}

function findMax() {
    for (let i = 0; i < categories.length; i++) {
        for (let j = 0; j < groups.length; j++) {
            if (maxCategoryCount < byCategoryCount[i][j]) {
                maxCategoryCount = byCategoryCount[i][j];
            }
        }
    }

    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            if (maxGroupCount < byGroupCount[i][j]) {
                maxGroupCount = byGroupCount[i][j];
            }
        }
    }
}

function byCategory() {
    for (let i = 0; i < reports.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            for (let k = 0; k < groups.length; k++) {
                if ((reports[i].category == categories[j] || reports[i].category == j.toString()) && (reports[i].group == k + 1 || reports[i].group == groups[k])){
                    byCategoryCount[j][k] += 1;
                }
            }
        }
    }
}

function byGroup(){
    for(let i=0; i<reports.length; i++){
        for(let j=0; j<groups.length; j++){
            for(let k=0; k<categories.length; k++){
                if((reports[i].category == categories[k] || reports[i].category == k.toString()) && (reports[i].group == j + 1 || reports[i].group == groups[j])){
                    byGroupCount[j][k] += 1;
                }
            }
        }
    }
}

function getCategoryGroupCounts(){
    for (let i = 0; i < reports.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            if (reports[i].category == categories[j] || reports[i].category == j.toString()) {
                categoriesCount[j] += 1;
            }
        }

        for (let k = 0; k < groups.length; k++) {
            if (reports[i].group - 1 == k || reports[i].group == groups[k]) {
                groupsCount[k] += 1;
            }
        }
    }


}

function generateColors(sortBy) {
    colors = [];
    let sortLength = sortBy == 1 ? categories.length : groups.length;

    for (let i = 0; i < sortLength; i++) {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        stringColor = "rgba(" + r + "," + g + "," + b;
        colors[i] = stringColor + ",0.5)";
        pieColors[i] = stringColor + ",0.4)";
    }
}

async function getGroupsAndCategories() {
    clearValues();
    let locCat = [];
    let locReps = [];
    let locGrps = [];
    await db
        .collection("reports")
        .orderBy("created", "desc")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locReps.push(doc.data());
            });
        });
    
    await db
        .collection("categories")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locCat.push(doc.data().name);
            });
        });

    await db
        .collection("groups")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locGrps.push(doc.data().name);
            });
        });

    reports = locReps;
    categories = locCat;
    groups = locGrps;
}

function getData(x, y) {
    let count = 0;
    for (let i = 0; i < reports.length; i++) {
      if ((reports[i].category == categories[x] || reports[i].category == x.toString()) && (reports[i].group == y + 1 || reports[i].group == groups[y]))
        count += 1;
    }
    return count;
}

async function getCategoriesData() {
    await db
        .collection("categories")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                categories.push(doc.data());
            });
        });
}

async function getUsersData() {
    await db
        .collection("users")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                users.push(doc.data());
            });
        });
}

async function getLogs(){
    await getUsersData();
    await db
        .collection("logs")
        .orderBy("timeStamp", "desc")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                logs.push(doc.data());
            });
        });
}