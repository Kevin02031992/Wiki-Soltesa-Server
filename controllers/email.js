const nodeoutlook = require('nodejs-nodemailer-outlook')

const template = `<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
<!--100% body table-->
<table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
    style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
    <tr>
        <td>
            <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                align="center" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="height:80px;">&nbsp;</td>
                </tr>
                <tr>
                    <td style="text-align:center;">
                      <a href="https://soltesa.com"  target="_blank">
                        <img width="140" src="https://i.postimg.cc/Cx2HVcFz/image-2023-08-23-T17-46-44-870-Z-removebg-preview.png"  alt="logo">
                      </a>
                    </td>
                </tr>
                <tr>
                    <td style="height:20px;">&nbsp;</td>
                </tr>
                <tr>
                    <td>
                        <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                            style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                            <tr>
                                <td style="height:40px;">&nbsp;</td>
                            </tr>
                            <tr>
                                <td style="padding:0 35px;">
                                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Bienvenido a la Wiki Soltesa</h1>
                                    <span
                                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
            
Hola @@name@@, has recibido el código de acceso temporal a la WIKI Soltesa.                             </p>
           <br>                       
                                                                          <p style="color:orange; font-size:15px;line-height:24px; margin:0;">
            
@@CODE@@                            </p>

                                </td>
                            </tr>
                            <tr>
                                <td style="height:40px;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                <tr>
                    <td style="height:20px;">&nbsp;</td>
                </tr>
                <tr>
                    <td style="text-align:center;">
                        <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.soltesa.com</strong></p>
                    </td>
                </tr>
                <tr>
                    <td style="height:80px;">&nbsp;</td>
                </tr>
            </table>
        </td>
    </tr>
</table>
<!--/100% body table-->
</body>`


exports.sendEmail = (code, name, email) => {

    let tempTemplate = template;
    tempTemplate = tempTemplate.replace("@@name@@", name);
    tempTemplate = tempTemplate.replace("@@CODE@@", code);

    nodeoutlook.sendEmail({
        auth: {
            user: process.env.MAIL_ADDRESS,
            pass: process.env.MAIL_PASSWORD
        },
        from: process.env.MAIL_ADDRESS,
        to: email,
        subject: 'Hola  ' + name +', has recibido el código de acceso de la plataforma WIKI-Soltesa!',
        html:  tempTemplate,
        text: 'Has recibido el código de acceso de la plataforma WIKI-Soltesa',
        attachments: [],
        onError: (e) => {
            console.log(e);
            return false;
        },
        onSuccess: (i) => {
            return true;
        }
    })
};
