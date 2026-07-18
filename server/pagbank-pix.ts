import axios from "axios";

const PAGBANK_API_URL = process.env.PAGBANK_BASE_URL || "https://sandbox.api.pagseguro.com";
const PAGBANK_TOKEN = process.env.PAGBANK_API_KEY;

interface PixPaymentData {
  amount: number; // em centavos
  description: string;
  userId: string;
  userEmail: string;
  userName: string;
}

export async function createPixPayment(data: PixPaymentData) {
  const response = await axios.post(
    `${PAGBANK_API_URL}/orders`,
    {
      reference_id: `user_${data.userId}_${Date.now()}`,
      customer: {
        name: data.userName,
        email: data.userEmail,
      },
      items: [
        {
          reference_id: "multilingue_subscription",
          name: data.description,
          quantity: 1,
          unit_amount: data.amount,
        },
      ],
      qr_codes: [
        {
          amount: {
            value: data.amount,
          },
          expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
        },
      ],
      notification_urls: [
        `${process.env.VITE_FRONTEND_FORGE_API_URL || "http://localhost:3000"}/api/pagbank/webhook`,
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${PAGBANK_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    qrCode: response.data.qr_codes[0].text, // Código PIX copia e cola
    qrCodeImage: response.data.qr_codes[0].links[0].href, // URL da imagem QR Code
    orderId: response.data.id,
    expiresAt: response.data.qr_codes[0].expiration_date,
  };
}

export async function checkPixPaymentStatus(orderId: string) {
  const response = await axios.get(`${PAGBANK_API_URL}/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${PAGBANK_TOKEN}`,
    },
  });

  return {
    status: response.data.status, // PAID, WAITING, CANCELED
    paidAt: response.data.charges?.[0]?.paid_at,
  };
}
