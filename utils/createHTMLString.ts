import { Guest, MY_NAME, PLACE_DINNER, PLACE_PARTY, WEB_URL_PRODUCTION } from '@/config';

export function createHTMLString(guest: Guest): string {
  const invitationUrl = `${WEB_URL_PRODUCTION}/#/inv/${guest.email}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Estás invitado a la fiesta de ${MY_NAME}!</title>
        <style>
            body { margin: 0; padding: 0; font-family: sans-serif; background-color: #0f172a; color: #e2e8f0; }
            table { border-collapse: collapse; width: 100%; }
            td { padding: 0; }
            img { border: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 8px; overflow: hidden; }
            .header { background-color: #334155; padding: 20px; text-align: center; }
            .header img { max-width: 100px; height: auto; }
            .content { padding: 30px; text-align: center; }
            .title { color: #f87171; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .greeting { color: #93c5fd; font-size: 18px; margin-bottom: 20px; }
            .event-details { background-color: #334155; padding: 15px; border-radius: 4px; margin-bottom: 15px; text-align: left; }
            .event-details p { margin: 5px 0; color: #f1f5f9; font-size: 16px; }
            .event-title { font-weight: bold; color: #fbbf24; font-size: 18px; }
            .button-container { text-align: center; margin-top: 30px; }
            .button { display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; font-weight: bold; padding: 8px 14px; border-radius: 9999px; transition: background-color 0.3s ease; margin: 0 3px 8px 3px; font-size: 13px; min-width: 120px; }
            .button:hover { background-color: #b91c1c; }
            .event-buttons { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; margin-top: 10px; }
            @media (max-width: 600px) {
              .event-buttons { flex-direction: column; align-items: stretch; gap: 6px; }
              .button { width: 100%; min-width: 0; margin: 0 0 6px 0; }
            }
            .footer { background-color: #334155; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px; }
            .icon-rounded { border-radius: 20px; box-shadow: 0 2px 12px #0006; }
        </style>
    </head>
    <body>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="padding: 20px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="container">
                        <tr>
                            <td class="header">
                                <img src="${WEB_URL_PRODUCTION}/img/maskable_icon_x192.png" alt="Icono de la fiesta" class="icon-rounded">
                            </td>
                        </tr>
                        <tr>
                            <td class="content">
                                <h1 class="title">¡Estás invitado a la fiesta de ${MY_NAME}!</h1>
                                <p class="greeting">¡Hola ${guest.name} ${guest.lastname}!</p>
                                <p style="color: #e2e8f0; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                                    ¡Prepárate para celebrar mi cumpleaños a lo grande! 🎉
                                    Te espero para compartir un momento especial.
                                </p>

                                ${
                                  guest.diner
                                    ? `
                                <div class="event-details">
                                    <p class="event-title">Cena:</p>
                                    <p>${PLACE_DINNER.name} - ${PLACE_DINNER.schedule}</p>
                                    <div class="event-buttons">
                                        <a href="${PLACE_DINNER.instagramLink}" class="button" target="_blank" rel="noopener noreferrer">${PLACE_DINNER.instagramButtonText}</a>
                                        <a href="${PLACE_DINNER.mapsLink}" class="button" target="_blank" rel="noopener noreferrer">${PLACE_DINNER.mapButtonText}</a>
                                    </div>
                                </div>
                                `
                                    : ''
                                }

                                ${
                                  guest.party
                                    ? `
                                <div class="event-details">
                                    <p class="event-title">Fiesta:</p>
                                    <p>${PLACE_PARTY.name} - ${PLACE_PARTY.schedule}</p>
                                    <div class="event-buttons">
                                        <a href="${PLACE_PARTY.instagramLink}" class="button" target="_blank" rel="noopener noreferrer">${PLACE_PARTY.instagramButtonText}</a>
                                        <a href="${PLACE_PARTY.mapsLink}" class="button" target="_blank" rel="noopener noreferrer">${PLACE_PARTY.mapButtonText}</a>
                                    </div>
                                </div>
                                `
                                    : ''
                                }

                                <div class="button-container">
                                    <a href="${invitationUrl}" class="button">Ver invitación</a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="footer">
                                <p>&copy; ${new Date().getFullYear()} Alfonso Party. Todos los derechos reservados.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
}
