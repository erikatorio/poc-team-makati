var tempReports = [];

window.addEventListener("load", async () => {
    let isloaded = false;
    await getGroupsAndCategories();
    tempReports = reports;
    console.log(reports);
    populateReportTable();
});

async function populateReportTable(){
    $('#table-container').html("");

    let head =
        "<h2 id='header-title'> Reports Management <small class='text-muted'>View and update report status</small></h2>" +
        "<table id='example' class='table'>" +
        "<thead>" +
        "<tr id='flat-row'>" +
        "<th scope='col' class='table-header th-sm'>#</th>" +
        "<th scope='col' class='table-header th-sm'>Category</th>" +
        "<th scope='col' class='table-header th-sm'>Department</th>" +
        "<th scope='col' class='table-header th-sm'>Date</th>" +
        "<th scope='col' class='table-header th-sm'>Submitted By</th>" +
        "<th scope='col' class='table-header th-sm'>Status</th>" +
        "<th class='table-header th-sm'>Action</th>" +
        "</tr>" +
        "</thead>";

    let body = "<tbody>";

    tempReports.forEach(function(report){
        var category = "";
        switch(report.category){
            case "0":
                category = "Physical Harassment";
                break;
            case "1":
                category = "Personal Harassment";
                break;
            case "2":
                category = "Discriminatory Harassment";
                break;
            case "3":
                category = "Psychological Harassment";
                break;
            case "4":
                category = "Cyberbullying";
                break;
            case "5":
                category = "Sexual Harassment";
                break;
            case "6":
                category = "3rd Party Harassment";
                break;
            case "7":
                category = "Others";
                break;
        }

        let date = new Date(report.created["seconds"] * 1000);
        body += 
            "<tr id='flat-row'>" + 
            "<th scope='row' class='table-id'>" + report.id + "</th>" +
            "<td class='table-content'>" + category + "</td>" +
            "<td class='table-content'>" + report.group + "</td>" +
            "<td class='table-content'>" + date + "</td>" +
            "<td class='table-content'>" +  + "</td>";
        
        if(report.status == "pending"){
            body += "<td class='table-content text-warning'>Pending</td>";
        } else if(report.status == "verified"){
            body += "<td class='table-content text-primary'>Verified</td>";
        } else if(report.status == "completed"){
            body += "<td class='table-content text-success'>Completed</td>";
        } else if(report.status == "rejected"){
            body += "<td class='table-content text-danger'>Rejected</td>";
        } else if(report.status == "hidden"){
            body += "<td class='table-content'>Hidden</td>";
        }

        body += 
            "<td><button class='btn btn-row' data-toggle='modal' data-target='#reportID1'><i class='fa fa-eye' aria-hidden='true'></i></button></td>" +
            "</tr>";
    });

    $('#table-container').append(head + body + "</tbody></table>");
    $('#example').DataTable();
}