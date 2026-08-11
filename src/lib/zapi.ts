const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const ZAPI_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`;

export async function sendWhatsAppMessage(phone: string, message: string) {
  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
    console.warn("Z-API credentials missing");
    return { error: "Z-API credentials missing" };
  }

  // Format phone to ensure it has the country code (assuming Brazil 55 if length is around 11)
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.length === 11 || formattedPhone.length === 10) {
    formattedPhone = `55${formattedPhone}`;
  }

  try {
    const response = await fetch(ZAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Z-API Error:", errText);
      return { error: "Failed to send WhatsApp message" };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Exception calling Z-API:", error);
    return { error };
  }
}
