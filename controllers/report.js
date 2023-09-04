//Required package
var pdf = require("pdf-creator-node");
const dbpgMysql = require('../util/database-mysql');
var fs = require("fs");


// Read HTML Template
const reportTemplate = fs.readFileSync('./resources/report_template.html').toString();

var options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    header: {
        height: "45mm",
        contents: '<div style="text-align: center;">  <h1>Registro de ingresos </h1> </div>'
    },
    footer: {
        height: "28mm",
        contents: {
            first: 'Primera página',
            2: 'Second page', // Any page number is working. 1-based index
            default: '<span style="color: #444;">{{page}}</span>', // fallback value
            last: 'Last Page'
        }
    }
};

exports.generateReport = (req, res, next) => {

    let startDate = new Date(req.body.startDate);
    let endDate = new Date(req.body.endDate);

    var date = 'output';

    dbpgMysql.query( `SELECT action.description as action, user_name as user, date FROM action_log 
        JOIN action on action_log.action = action.cod
        JOIN user on action_log.user = user.user_cod 
        WHERE date between ('${startDate.toUTCString()}') and ('${endDate.toUTCString()}')  ORDER BY date DESC `
    ).then((result) => {
        var document = {
            html: reportTemplate,
            data: {
                users: result[0],
            },
            path: "./files/" + date + ".pdf",
            type: "",
        };

        
    pdf.create(document, options).then(() => {
        res.download("./files/" + date + ".pdf", 'report.pdf', () => {
            fs.unlinkSync("./files/" + date + ".pdf");
        });

    }).catch((error) => {
        console.error(error);
    });
    }).catch(err => {
        console.log(err);
    });

   

}