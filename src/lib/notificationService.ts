/**
 * Notification Service powered by Whapi.cloud for WhatsApp alerts
 */

export interface SendWhatsAppAlertResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface SendTravelAlertOptions {
  phoneNumber: string;
  message: string;
  channel?: "whatsapp" | "sms" | "both";
}

export interface SendTravelAlertResult {
  success: boolean;
  whatsapp?: SendWhatsAppAlertResult;
  error?: string;
}

/**
 * Standardize phone number for Whapi.cloud (digits only, e.g. 918879808016)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  let digitsOnly = String(phone).replace(/\D/g, "");
  // Indian 10-digit number -> add 91 country code
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }
  // 11 digits starting with 0 -> strip leading 0 and add 91
  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    return `91${digitsOnly.slice(1)}`;
  }
  return digitsOnly;
}

/**
 * Send WhatsApp notification using Whapi.cloud API
 * @param phone Destination phone number (e.g. 918879808016)
 * @param message Text message content
 */
export async function sendWhatsAppAlert(
  phone: string,
  message: string
): Promise<SendWhatsAppAlertResult> {
  const token = process.env.WHAPI_TOKEN;
  if (!token) {
    const errorMsg = "WHAPI_TOKEN is not configured in environment variables.";
    console.error(`[notificationService] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const cleanPhone = formatPhoneNumber(phone);
  const endpoint = "https://gate.whapi.cloud/messages/text";
  const payload = {
    to: cleanPhone,
    body: message,
  };

  try {
    console.log(`[notificationService] Sending Whapi WhatsApp alert to ${cleanPhone}...`);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawData = await res.json().catch(() => null);
    console.log("[notificationService] Raw Whapi response:", JSON.stringify(rawData, null, 2));

    if (!res.ok) {
      return {
        success: false,
        error: rawData?.message || `HTTP ${res.status} ${res.statusText}`,
        data: rawData,
      };
    }

    return {
      success: true,
      data: rawData,
    };
  } catch (err: any) {
    console.error("[notificationService] Error calling Whapi API:", err?.message || err);
    return {
      success: false,
      error: err?.message || String(err),
    };
  }
}

/**
 * Send travel alert notifications (standardized on Whapi.cloud WhatsApp)
 */
export async function sendTravelAlert({
  phoneNumber,
  message,
  channel = "whatsapp",
}: SendTravelAlertOptions): Promise<SendTravelAlertResult> {
  const result: SendTravelAlertResult = { success: false };

  if (!phoneNumber || !phoneNumber.trim()) {
    result.error = "Phone number is required";
    return result;
  }

  if (!message || !message.trim()) {
    result.error = "Alert message body cannot be empty";
    return result;
  }

  if (channel === "whatsapp" || channel === "both") {
    const waRes = await sendWhatsAppAlert(phoneNumber, message);
    result.whatsapp = waRes;
    result.success = waRes.success;
  }

  return result;
}
