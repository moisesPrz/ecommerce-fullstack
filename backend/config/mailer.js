const nodemailer = require('nodemailer');

// Crea el transporter solo si hay credenciales configuradas
const crearTransporter = () => {
  const { MAILER_HOST, MAILER_PORT, MAILER_USER, MAILER_PASS } = process.env;
  if (!MAILER_HOST || !MAILER_USER || !MAILER_PASS) return null;

  return nodemailer.createTransport({
    host: MAILER_HOST,
    port: parseInt(MAILER_PORT || '587'),
    secure: MAILER_PORT === '465',
    auth: { user: MAILER_USER, pass: MAILER_PASS },
  });
};

const transporter = crearTransporter();
const FROM = process.env.EMAIL_FROM || '"TechMarket" <noreply@techmarket.co>';

// ── Envío genérico ────────────────────────────────────────
const enviarEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.info(`[MAILER] Sin configurar — email no enviado: "${subject}" → ${to}`);
    return { skipped: true };
  }
  return transporter.sendMail({ from: FROM, to, subject, html });
};

// ── Estilos base compartidos ──────────────────────────────
const estilosBase = `
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #F8F9FC; margin: 0; padding: 0; }
  .contenedor { max-width: 580px; margin: 32px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(11,29,58,0.08); }
  .header { background: linear-gradient(135deg, #0B1D3A, #1E3A5F); padding: 32px 32px 24px; text-align: center; }
  .header h1 { color: white; font-size: 24px; margin: 0 0 4px; }
  .header p { color: #93C5FD; font-size: 14px; margin: 0; }
  .gold-line { height: 3px; background: linear-gradient(90deg, #C9A84C, #E8C97A); }
  .cuerpo { padding: 32px; }
  .cuerpo h2 { color: #0B1D3A; font-size: 20px; margin: 0 0 8px; }
  .cuerpo p { color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
  .btn { display: inline-block; background: linear-gradient(135deg, #C9A84C, #E8C97A); color: #0B1D3A; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin: 8px 0 24px; }
  .tabla { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .tabla th { background: #F8F9FC; color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; }
  .tabla td { padding: 12px; font-size: 14px; color: #0B1D3A; border-bottom: 1px solid #F1F5F9; }
  .total-row td { font-weight: 700; background: #F8F9FC; }
  .badge { display: inline-block; background: rgba(201,168,76,0.15); color: #C9A84C; font-weight: 600; font-size: 12px; padding: 4px 12px; border-radius: 99px; border: 1px solid rgba(201,168,76,0.3); }
  .footer { background: #F8F9FC; padding: 20px 32px; text-align: center; }
  .footer p { color: #94A3B8; font-size: 12px; margin: 0; }
`;

// ── Templates ─────────────────────────────────────────────
const templates = {

  confirmacionPedido: ({ nombre, pedidoId, total, items = [] }) => ({
    subject: `✅ Pedido #${pedidoId} confirmado — TechMarket`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${estilosBase}</style></head><body>
      <div class="contenedor">
        <div class="header">
          <h1>TechMarket</h1>
          <p>Tu pedido está confirmado</p>
        </div>
        <div class="gold-line"></div>
        <div class="cuerpo">
          <h2>¡Gracias, ${nombre}! 🎉</h2>
          <p>Tu pedido <strong>#${pedidoId}</strong> fue recibido y está siendo procesado. Te notificaremos cuando sea enviado.</p>

          <table class="tabla">
            <thead><tr><th>Producto</th><th>Cant.</th><th>Subtotal</th></tr></thead>
            <tbody>
              ${items.map(i => `
                <tr>
                  <td>${i.nombre}</td>
                  <td>${i.cantidad}</td>
                  <td>$${(i.precio * i.cantidad).toFixed(2)}</td>
                </tr>`).join('')}
              <tr class="total-row">
                <td colspan="2">Total pagado</td>
                <td>$${parseFloat(total).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <p>Puedes ver el estado de tu pedido en cualquier momento desde tu cuenta.</p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} TechMarket · Colombia 🇨🇴</p></div>
      </div>
    </body></html>`,
  }),

  cambioEstadoPedido: ({ nombre, pedidoId, estado }) => {
    const info = {
      procesando: { emoji: '⚙️', titulo: 'Estamos preparando tu pedido', mensaje: 'Tu pedido está siendo procesado por el vendedor. Te avisaremos cuando sea enviado.', color: '#3B82F6' },
      enviado:    { emoji: '🚚', titulo: '¡Tu pedido está en camino!', mensaje: 'Tu pedido ha sido enviado y está en camino hacia ti. Pronto lo recibirás.', color: '#8B5CF6' },
      entregado:  { emoji: '✅', titulo: '¡Pedido entregado!', mensaje: 'Tu pedido fue entregado exitosamente. Esperamos que estés satisfecho con tu compra.', color: '#10B981' },
      cancelado:  { emoji: '❌', titulo: 'Pedido cancelado', mensaje: 'Lamentamos informarte que tu pedido fue cancelado. Si tienes dudas, contáctanos.', color: '#EF4444' },
    };
    const { emoji, titulo, mensaje, color } = info[estado] || { emoji: '📦', titulo: `Estado actualizado: ${estado}`, mensaje: '', color: '#0B1D3A' };
    return {
      subject: `${emoji} Pedido #${pedidoId} — ${titulo} | TechMarket`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${estilosBase}</style></head><body>
        <div class="contenedor">
          <div class="header">
            <h1>TechMarket</h1>
            <p>Actualización de tu pedido</p>
          </div>
          <div class="gold-line"></div>
          <div class="cuerpo">
            <h2>${emoji} Hola, ${nombre}</h2>
            <p>Hay una novedad en tu pedido <strong>#${pedidoId}</strong>:</p>
            <div style="background:${color}10;border-left:4px solid ${color};border-radius:8px;padding:16px 20px;margin:16px 0;">
              <p style="color:${color};font-weight:700;font-size:16px;margin:0 0 6px;">${titulo}</p>
              <p style="color:#64748B;margin:0;font-size:14px;">${mensaje}</p>
            </div>
            <p>Puedes ver el detalle completo de tu pedido en tu cuenta.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/mis-pedidos" class="btn">Ver mis pedidos</a>
            </div>
          </div>
          <div class="footer"><p>© ${new Date().getFullYear()} TechMarket · Colombia 🇨🇴</p></div>
        </div>
      </body></html>`,
    };
  },

  stockBajo: ({ vendedorNombre, productoNombre, stockActual, productoId }) => ({
    subject: `⚠️ Stock bajo: "${productoNombre}" — TechMarket`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${estilosBase}</style></head><body>
      <div class="contenedor">
        <div class="header">
          <h1>TechMarket</h1>
          <p>Alerta de inventario</p>
        </div>
        <div class="gold-line"></div>
        <div class="cuerpo">
          <h2>⚠️ Hola, ${vendedorNombre}</h2>
          <p>Uno de tus productos tiene <strong>stock bajo</strong> y podría agotarse pronto:</p>
          <div style="background:#FEF3C710;border-left:4px solid #F59E0B;border-radius:8px;padding:16px 20px;margin:16px 0;">
            <p style="color:#92400E;font-weight:700;font-size:16px;margin:0 0 4px;">${productoNombre}</p>
            <p style="color:#B45309;margin:0;font-size:22px;font-weight:800;">${stockActual} unidad${stockActual !== 1 ? 'es' : ''} restante${stockActual !== 1 ? 's' : ''}</p>
          </div>
          <p>Te recomendamos reponer el inventario pronto para no perder ventas.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendedor" class="btn">Ir a mi tienda</a>
          </div>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} TechMarket · Colombia 🇨🇴</p></div>
      </div>
    </body></html>`,
  }),

  recuperarPassword: ({ nombre, link, expiraEn = '1 hora' }) => ({
    subject: '🔐 Recupera tu contraseña — TechMarket',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${estilosBase}</style></head><body>
      <div class="contenedor">
        <div class="header">
          <h1>TechMarket</h1>
          <p>Recuperación de contraseña</p>
        </div>
        <div class="gold-line"></div>
        <div class="cuerpo">
          <h2>Hola, ${nombre} 👋</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para continuar:</p>
          <div style="text-align:center">
            <a href="${link}" class="btn">Restablecer contraseña</a>
          </div>
          <p style="font-size:13px;color:#94A3B8">Este enlace expira en <strong>${expiraEn}</strong>. Si no solicitaste este cambio, ignora este correo.</p>
          <p style="font-size:12px;color:#CBD5E1;word-break:break-all">O copia este enlace: ${link}</p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} TechMarket · Colombia 🇨🇴</p></div>
      </div>
    </body></html>`,
  }),

};

module.exports = { enviarEmail, templates };
