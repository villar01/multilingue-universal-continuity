/**
 * PagBank PIX Integration
 * Documentação: https://developer.pagbank.com.br/reference/criar-pedido-pedido-com-qr-code
 */

interface PagBankConfig {
  apiKey: string;
  baseUrl: string;
}

interface CreatePixOrderParams {
  referenceId: string;
  customerName: string;
  customerEmail: string;
  customerTaxId: string; // CPF
  customerPhone: string;
  amount: number; // em centavos (ex: 2990 = R$ 29,90)
  description: string;
  notificationUrl?: string;
}

interface PixOrderResponse {
  id: string;
  referenceId: string;
  status: string;
  qrCodes: Array<{
    id: string;
    text: string; // PIX Copia e Cola
    links: Array<{
      rel: string;
      href: string;
      media: string;
    }>;
  }>;
}

export class PagBankService {
  private config: PagBankConfig;

  constructor() {
    this.config = {
      apiKey: process.env.PAGBANK_API_KEY || '',
      baseUrl: process.env.PAGBANK_BASE_URL || 'https://sandbox.api.pagseguro.com'
    };
  }

  /**
   * Criar pedido com QR Code PIX
   */
  async createPixOrder(params: CreatePixOrderParams): Promise<PixOrderResponse> {
    const {
      referenceId,
      customerName,
      customerEmail,
      customerTaxId,
      customerPhone,
      amount,
      description,
      notificationUrl
    } = params;

    const payload = {
      reference_id: referenceId,
      customer: {
        name: customerName,
        email: customerEmail,
        tax_id: customerTaxId,
        phones: [
          {
            country: "55",
            area: customerPhone.substring(0, 2),
            number: customerPhone.substring(2),
            type: "MOBILE"
          }
        ]
      },
      items: [
        {
          name: description,
          quantity: 1,
          unit_amount: amount
        }
      ],
      qr_codes: [
        {
          amount: {
            value: amount
          },
          expiration_date: this.getExpirationDate(24) // 24 horas
        }
      ],
      notification_urls: notificationUrl ? [notificationUrl] : []
    };

    const response = await fetch(`${this.config.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PagBank API Error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    
    return {
      id: data.id,
      referenceId: data.reference_id,
      status: data.status,
      qrCodes: data.qr_codes.map((qr: any) => ({
        id: qr.id,
        text: qr.text,
        links: qr.links
      }))
    };
  }

  /**
   * Consultar status do pedido
   */
  async getOrderStatus(orderId: string): Promise<{ status: string; paid: boolean }> {
    const response = await fetch(`${this.config.baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get order status');
    }

    const data = await response.json();
    
    return {
      status: data.status,
      paid: data.charges?.[0]?.status === 'PAID'
    };
  }

  /**
   * Verificar webhook do PagBank
   */
  verifyWebhook(notificationCode: string): Promise<any> {
    // TODO: Implementar verificação de webhook
    return Promise.resolve({});
  }

  /**
   * Gerar data de expiração (ISO 8601)
   */
  private getExpirationDate(hours: number): string {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date.toISOString();
  }
}

// Singleton instance
export const pagBankService = new PagBankService();
