const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const ZAPI_CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN;
const ZAPI_BASE_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}`;

function zapiHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ZAPI_CLIENT_TOKEN) headers['Client-Token'] = ZAPI_CLIENT_TOKEN;
  return headers;
}

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
    const response = await fetch(`${ZAPI_BASE_URL}/send-text`, {
      method: 'POST',
      headers: zapiHeaders(),
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

/** Aponta o webhook de mensagens recebidas da Z-API para a URL informada (ex: webhook do n8n). */
export async function setReceivedWebhook(webhookUrl: string) {
  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
    return { error: "Z-API credentials missing" };
  }

  try {
    const response = await fetch(`${ZAPI_BASE_URL}/update-webhook-received`, {
      method: 'PUT',
      headers: zapiHeaders(),
      body: JSON.stringify({ value: webhookUrl }),
    });

    const text = await response.text();
    if (!response.ok) {
      console.error("Z-API webhook config error:", text);
      return { error: text };
    }
    return { data: text };
  } catch (error) {
    console.error("Exception configuring Z-API webhook:", error);
    return { error };
  }
}

export async function getInstanceStatus() {
  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
    return { error: "Z-API credentials missing" };
  }
  try {
    const response = await fetch(`${ZAPI_BASE_URL}/status`, { headers: zapiHeaders() });
    if (!response.ok) {
      return { error: `HTTP ${response.status}` };
    }
    return { data: await response.json() };
  } catch (error) {
    console.error("Exception getting Z-API instance status:", error);
    return { error };
  }
}
