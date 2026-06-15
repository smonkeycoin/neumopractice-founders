import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function row(label, value) {
  return `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#111827;width:220px;vertical-align:top;">${label}</td>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#334155;white-space:pre-wrap;">${escapeHtml(value || '—')}</td>
    </tr>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const data = req.body || {};

    if (data.company_website) {
      return res.status(200).json({ ok: true });
    }

    const required = ['nombre', 'especialidad', 'ciudad_clinica', 'email'];
    for (const field of required) {
      if (!String(data[field] || '').trim()) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
      }
    }

    const subject = `Nueva entrevista beta NeumoPractice · ${data.nombre || 'Doctor'}`;
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:24px;">
        <div style="max-width:760px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
          <div style="background:#2563EB;color:white;padding:22px 26px;">
            <h1 style="margin:0;font-size:24px;">Nueva respuesta · Entrevista Beta</h1>
            <p style="margin:6px 0 0;color:#dbeafe;">NeumoPractice Programa Fundadores</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            ${row('Nombre', data.nombre)}
            ${row('Especialidad', data.especialidad)}
            ${row('Ciudad / clínica', data.ciudad_clinica)}
            ${row('Pacientes por semana', data.pacientes_semana)}
            ${row('Email', data.email)}
            ${row('WhatsApp', data.whatsapp)}
            ${row('Sistema actual', data.sistema_actual)}
            ${row('Dolores operativos', data.dolores_operativos)}
            ${row('Momento de fricción', data.momento_friccion)}
            ${row('Info en segunda consulta', data.info_segunda_consulta)}
            ${row('Recetas y documentos', data.recetas_documentos)}
            ${row('Equipo y agenda', data.equipo_agenda)}
            ${row('IA clínica', data.ia_clinica)}
            ${row('Decisión de compra', data.decision_compra)}
          </table>
        </div>
      </div>`;

    await resend.emails.send({
      from: process.env.RESEND_FROM || 'NeumoPractice Beta <onboarding@resend.dev>',
      to: process.env.BETA_FORM_TO || 'hola@neuropractice.com',
      replyTo: data.email,
      subject,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo enviar el formulario.' });
  }
}
