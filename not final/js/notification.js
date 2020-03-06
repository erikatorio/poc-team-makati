window.addEventListener("load", async () => {
    await reportSummary();

    await db
        .collection('reports')
        .orderBy('created', 'desc')
        .onSnapshot(async function (querySnapshot) {
            if (isloaded) {
                querySnapshot.docChanges().forEach(async function (change) {
                    if (change.type === 'added') {
                        await showNotif();
                    }
                });
            } else {
                isloaded = true;
            }
        });

});

// ----- Notifications -----

async function showNotif() {
    await getGroupsAndCategories();

    let options = { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };

    let ctr = 0;

    reports.forEach(async function (report) {
        if (report.read === false) {
            notif = true;
            if (ctr === 0) {
                $('#notifItem').html('<div class="px-4 py-0"><hr class="m-2 mb-3"></div>');
            }

            ctr += 1;

            if (ctr > 99) {
                $('#notifDropdown').html('<i class="material-icons text-danger">notifications_active</i><span id="notif_badge" class="badge badge-pill badge-danger p-1">99+</span>');
            } else {
                $('#notifDropdown').html('<i class="material-icons text-danger">notifications_active</i><span id="notif_badge" class="badge badge-pill badge-danger p-1">' + ctr + '</span>');
            }

            $('#indiv_notifs').append('<div class="toast-body-notif"><p class="p-0 m-0">' + categories[report.category] + '" incident was reported.</p><p class="row text-info p-0 m-0 justify-content-between"> (' + report.created.toDate().toLocaleString("en-US", options) + ')</p></div>');
            //<a class="ml-auto py-0" href="#" onClick= selectReport(' + report.id + ')>more details...</a>
        }
    });

    if (ctr === 0) {
        //$('#notifDropdown').html('<i class="fa fa-bell fa-fw mr-3 nav_icon"></i>');
        $('#notif-toast').append('<div class="toast-body">新レポートがありません。</div>');
    }
}

var isPaneOpen = false;
async function showNotifs() {
    if (!isPaneOpen) {
        await appendNotifPane();
        await showNotif();
        $('#notif-toast').toast('show');
        $('#notifDropdown').html('<i class="fa fa-bell fa-fw mr-3 nav_icon"></i>');
        isPaneOpen = true;
    } else {
        $('#notif-toast').toast('hide');
        await removeNotifPane();
    }
}

async function appendNotifPane() {
    $('#notif-cont').html('<div class="notifications-container"><div id="notif-toast" class="toast" role="alert" data-autohide="false" aria-live="assertive" aria-atomic="true"><div id="notif-header" class="toast-header"><img src="./img/flower.png" class="rounded mr-2" alt="..."><strong class="mr-auto">Notifications</strong><button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close" onclick="removeNotifPane()"><span aria-hidden="true">&times;</span></button></div><div id="indiv_notifs"></div></div></div>');
}

async function removeNotifPane() {
    reports.forEach(async function (report) {
        if (report.read === false) {
            await selectReport(report.id);
        }
    });
    isPaneOpen = false;
    $('.notifications-container').remove();
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
        }
    })
}