const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const invoiceEndpoint = `// Invoice Email Reminder API
const nodemailer = require('nodemailer');

app.post('/api/invoice/send-reminder', async (req, res) => {
  try {
    const { brandName, invoiceDate, toEmails, amount, invoiceNumber } = req.body;
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Sending mock email (SMTP not configured) to:', toEmails);
      return res.json({ 
        success: true, 
        message: 'Mock email terkirim. Konfigurasi SMTP_HOST, SMTP_USER, SMTP_PASS di .env untuk mengirim secara nyata.',
        simulated: true 
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Liva Agency" <no-reply@liva-agency.com>',
      to: toEmails,
      subject: "PEMBERITAHUAN PENAGIHAN INVOICE: " + brandName,
      html: "<div style='font-family: sans-serif; padding: 20px; line-height: 1.5; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;'><h2 style='color: #4f46e5;'>🔔 Reminder Penagihan Invoice</h2><p>Halo Tim Admin PIC,</p><p>Ini adalah pengingat dari sistem otomatis bahwa sebuah invoice telah mencapai tanggal penagihan hari ini.</p><div style='background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;'><strong>Brand / Klien:</strong> " + brandName + "<br/><strong>No. Invoice:</strong> " + (invoiceNumber || 'N/A') + "<br/><strong>Tanggal Tagih:</strong> " + invoiceDate + "<br/><strong>Total Tagihan:</strong> " + (amount ? 'Rp ' + amount.toLocaleString('id-ID') : 'N/A') + "<br/></div><p>Mohon segera memeriksa lampiran atau dashboard sistem dan memproses penagihan ke klien tersebut.</p><br/><p>Terima kasih,<br/><strong>Sistem Liva Agency</strong></p></div>"
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email terkirim:', info.messageId);

    res.json({ success: true, message: 'Email berhasl dikirim.', simulated: false });
  } catch (err: any) {
    console.error('SMTP Error:', err);
    res.status(500).json({ error: 'Gagal mengirim email', details: err.message });
  }
});

// Serve static assets`;

server = server.replace('// Serve static assets', invoiceEndpoint);
fs.writeFileSync('server.ts', server);
