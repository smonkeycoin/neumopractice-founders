import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function clean(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("\n", "<br>");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const body = req.body || {};
    const doctorName = clean(body.doctor_name);
    const specialty = clean(body.specialty);
    const city = clean(body.city);
    const patientsWeek = clean(body.patients_week);
    const preferredSlot = clean(body.preferred_slot);

    if (!doctorName) {
      return res.status(400).json({ error: "Falta el nombre del doctor." });
    }

    if (!preferredSlot) {
      return res.status(400).json({ error: "Falta seleccionar día y horario de entrevista." });
    }

    const subject = `Nueva entrevista beta NeumoPractice: ${doctorName}`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111827">
        <h1 style="color:#2563EB">Nueva respuesta beta NeumoPractice</h1>

        <h2>Datos básicos</h2>
        <p><strong>Doctor(a):</strong> ${escapeHtml(doctorName)}</p>
        <p><strong>Especialidad:</strong> ${escapeHtml(specialty)}</p>
        <p><strong>Ciudad / clínica:</strong> ${escapeHtml(city)}</p>
        <p><strong>Pacientes por semana:</strong> ${escapeHtml(patientsWeek)}</p>
        <p><strong>Horario preferido de entrevista:</strong> ${escapeHtml(preferredSlot)}</p>

        <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0">

        <h2>Respuestas</h2>
        <p><strong>1. Sistema actual</strong><br>${escapeHtml(body.q1)}</p>
        <p><strong>2. Tareas que más tiempo quitan</strong><br>${escapeHtml(body.q2)}</p>
        <p><strong>3. Momento donde el sistema estorba</strong><br>${escapeHtml(body.q3)}</p>
        <p><strong>4. Información necesaria en segunda consulta</strong><br>${escapeHtml(body.q4)}</p>
        <p><strong>5. Recetas y documentos</strong><br>${escapeHtml(body.q5)}</p>
        <p><strong>6. Equipo y operación diaria</strong><br>${escapeHtml(body.q6)}</p>
        <p><strong>7. Uso aceptable de IA clínica</strong><br>${escapeHtml(body.q7)}</p>
        <p><strong>8. Condición para pagar/adoptar</strong><br>${escapeHtml(body.q8)}</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM || "NeumoPractice Beta <onboarding@resend.dev>",
      to: process.env.BETA_FORM_TO || "hola@neuropractice.com",
      subject,
      html
    });
console.log("RESEND RESULT:", JSON.stringify(result));
    return res.status(200).json({ ok: true, id: result?.data?.id || null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "No se pudo enviar el formulario." });
  }
}
