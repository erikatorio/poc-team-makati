
// Report array initialization and notification functions

var notif = false;
var reports = [];
var categories = [];
var groups = [];
var loaded = false;

window.addEventListener("load", async () => {
    let isloaded = false;
    await getReports();
    await showNotif();
    await reportDetails()

  await db
    .collection('reports')
    .orderBy('created', 'desc')
    .onSnapshot(async function(querySnapshot) {
      if (isloaded) {
        querySnapshot.docChanges().forEach(async function(change) {
          if (change.type === 'added') {  
            showNotif()
            $('#reportCount').text(reports.length);
            notifyReport(querySnapshot.docs[0]);
          }
        });
      } else {
        isloaded = true;
      }
    });

});


function notifyReport(report) {
    PNotify.info({
        title: "New Report",
        text:
            "Username: " +
            report.data().username +
            " Category: " +
            report.data().category +
            " Group: " +
            report.data().group +
            " " +
            report
                .data()
                .created.toDate()
                .toLocaleString(),
        delay: 3000,
        modules: {
            Buttons: {
                closer: true,
                closerHover: true,
                sticker: false
            },
            Desktop: {
                desktop: true,
                fallback: true,
                icon: null
            },
            Mobile: {
                swipeDismiss: true,
                styling: true
            }
        }
    });
}

async function getReports() {
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

async function showNotif() {
    await getReports();
    let options = { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };


    let cat = {};
    let group = {};
    let cCtr = {};
    let gCtr = {};
    let ctr = 0;

    reports.forEach(function (report) {
        if (report.read === false) {
            notif = true;
            if (ctr === 0) {
                $('#notifItem').html('<div class="px-4 py-0"><hr class="m-2 mb-3"></div>');
            }
            ctr += 1;
            $('#notifDropdown').html('<i class="material-icons text-danger">notifications_active</i><span class="badge badge-pill badge-danger p-1">' + ctr + '</span>')
            $('#notifItem').append('<div class="dropdown-item py-0"><div><p class="p-0 text-danger m-0">New category "' + report.category + '" incident was reported.</p><p class="row text-danger p-0 m-0 justify-content-between"> (' + report.created.toDate().toLocaleString("en-US", options) + ')<a class="ml-auto py-0" href="#" onClick= selectReport(' + report.id + ')>more details...</a></p></div><hr class="mt-1"></div>')
        }
    });
    if (ctr === 0) {
      $('#notifDropdown').html('<i class="fas fa-bell"></i>');
      $('#notifItem').html(
        '<div class="dropdown-item py-0"><hr><div class="row"><p class="col-12 m-0 text-success p-0">All reports are read.</p></div><hr></div>'
      );
    }

}

async function selectReport(reportID) {
    reports.forEach(async function (report) {
        if (report.id === reportID) {
            await db.collection("reports").where('id', '==', report.id).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    db.collection("reports").doc(doc.id).update({
                        read: true
                    });
                });
            });
            loadReportDetails(report).then(() => {
                $('#reportDetails').modal('show');
            }).then(()=>{
                showNotif()
            })
        }
    })
}

async function loadReportDetails(reportSelected) {
    $("#reportTitle").html("<h1>" + reportSelected.username + "<h1><h3> " + reportSelected.created.toDate().toLocaleString("en-PH") + "</h3>");
    $("#sgroup").text("Group: " + reportSelected.group);
    $("#scategory").text("Category: " + reportSelected.category);
    $("#sdateInfo").text("Occurence: " + reportSelected.datInfo);
    $("#sotherDetails").text("Other Details: " + reportSelected.otherDetails);
    $("#spersonInfo").text("Subject: " + reportSelected.personInfo);
    if (reportSelected.attachFile === "") {
        $("#sattachment").html('Link to attachment: No attachment');
    } else {
        $("#sattachment").html('Link to attachment: <a target=_blank href= ' + reportSelected.attachFile + '>Link</a>');
    }
}

async function reportDetails() {
    $('body').append('<div class= "modal fade" id = "reportDetails" tabindex = "-1" role = "dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" > ' +
        '<div class= "modal-dialog modal-dialog-centered" role = "document" > ' +
        '<div class= "modal-content" > ' +
        '<div class= "modal-header" > ' +
        '<h5 class="modal-title" id="reportTitle"></h5> ' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"> ' +
        '<span aria-hidden="true">&times;</span> ' +
        '</button> ' +
        '</div> ' +
        ' <div class="modal-body"> ' +
        ' <ul class="list-unstyled"> ' +
        ' <li id="sgroup">Group: </li> ' +
        ' <li id="scategory">Category: </li> ' +
        ' <li id="sdateInfo" data-toggle="tooltip" data-placement="top" title="Relative to the Report Date">  Occurence: </li> ' +
        ' <li id="sotherDetails">Other Details: </li> ' +
        ' <li id="spersonInfo">Subject: </li> ' +
        ' <li id="sattachment">Link to attachment: </li> ' +
        ' </ul> ' +
        ' </div> ' +
        ' <div class="modal-footer"> ' +
        ' <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> ' +
        ' </div> ' +
        ' </div> ' +
        ' </div> ' +
        ' </div > '
    )
}