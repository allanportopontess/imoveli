// ============================================
// ADAPTADOR DE E-MAIL
// ============================================
// Sem RESEND_API_KEY ou SENDGRID_API_KEY configurada, o "envio" cai em modo
// simulado: o código de confirmação aparece no console do servidor e (só em
// desenvolvimento) na resposta da API, pra você conseguir testar o fluxo
// completo sem precisar de conta em provedor nenhum ainda.
//
// Quando estiver pronto pra e-mail de verdade, basta colocar a chave no .env
// — nenhum outro código precisa mudar, porque tudo no server.js chama só
// enviarEmail(), nunca a API do provedor diretamente.

async function enviarViaResend({ to, subject, html }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'IMOVELI <onboarding@resend.dev>',
      to: [to],
      subject,
      html
    })
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend retornou ${response.status}: ${body}`);
  }
}

async function enviarViaSendgrid({ to, subject, html }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: process.env.EMAIL_FROM || 'onboarding@imoveli.com.br' },
      subject,
      content: [{ type: 'text/html', value: html }]
    })
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SendGrid retornou ${response.status}: ${body}`);
  }
}

async function enviarEmail({ to, subject, html, textoSimulado }) {
  if (process.env.RESEND_API_KEY) {
    await enviarViaResend({ to, subject, html });
    return { modo: 'resend' };
  }
  if (process.env.SENDGRID_API_KEY) {
    await enviarViaSendgrid({ to, subject, html });
    return { modo: 'sendgrid' };
  }

  // Modo simulado — nenhuma chave configurada ainda
  console.log('\n📧 [EMAIL SIMULADO — nenhum provedor configurado]');
  console.log(`   Para: ${to}`);
  console.log(`   Assunto: ${subject}`);
  console.log(`   ${textoSimulado || html}`);
  console.log('   (configure RESEND_API_KEY ou SENDGRID_API_KEY no .env para enviar de verdade)\n');
  return { modo: 'simulado' };
}

module.exports = { enviarEmail };
