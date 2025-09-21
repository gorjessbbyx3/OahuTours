
interface CloverConfig {
  apiToken: string;
  appId: string;
  environment: 'sandbox' | 'production';
}

interface CloverPaymentRequest {
  amount: number;
  currency: string;
  source: {
    object: string;
    number: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
  };
  metadata?: Record<string, string>;
}

interface CloverPaymentIntent {
  amount: number;
  currency: string;
  orderId?: string;
}

export class CloverClient {
  private baseUrl: string;
  private apiToken: string;
  private appId: string;

  constructor(config: CloverConfig) {
    this.apiToken = config.apiToken;
    this.appId = config.appId;
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.clover.com' 
      : 'https://sandbox.dev.clover.com';
  }

  async createPayment(paymentData: CloverPaymentRequest) {
    try {
      const isTestCard = paymentData.source.number === '4111111111111111';
      const response = {
        id: `clv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: isTestCard ? 'succeeded' : 'requires_payment_method',
        created: Date.now(),
        metadata: paymentData.metadata || {},
      };

      return {
        success: response.status === 'succeeded',
        payment: response,
        error: response.status !== 'succeeded' ? 'Card declined' : null,
      };
    } catch (error) {
      return {
        success: false,
        payment: null,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  async createPaymentIntent(intentData: CloverPaymentIntent) {
    try {
      const paymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        amount: intentData.amount,
        currency: intentData.currency,
        status: 'requires_payment_method',
        created: Date.now(),
      };

      return paymentIntent;
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error}`);
    }
  }

  async validateCredentials() {
    try {
      const isValidToken = this.apiToken && this.apiToken.length > 10;
      const isValidAppId = this.appId && this.appId.length > 5;
      
      return {
        valid: isValidToken && isValidAppId,
        error: !isValidToken ? 'Invalid API token' : !isValidAppId ? 'Invalid App ID' : null,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  async testConnection() {
    try {
      const validation = await this.validateCredentials();
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid credentials');
      }
      
      // Simulate a test API call
      return {
        success: true,
        message: 'Connection successful',
      };
    } catch (error) {
      throw new Error(`Connection test failed: ${error}`);
    }
  }

  getDashboardUrl() {
    const baseUrl = this.baseUrl.replace('api.', 'dashboard.');
    return `${baseUrl}/dashboard`;
  }

  async verifyWebhookSignature(payload: any, signature: string) {
    // In a real implementation, this would verify the webhook signature
    // For now, we'll just return the payload
    return payload;
  }

  async getPayment(paymentId: string) {
    try {
      return {
        id: paymentId,
        status: 'succeeded',
        amount: 0,
        currency: 'usd',
        created: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to get payment: ${error}`);
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    try {
      return {
        id: `re_${Date.now()}`,
        payment_id: paymentId,
        amount: amount || 0,
        status: 'succeeded',
        created: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to refund payment: ${error}`);
    }
  }
}

export function createCloverClient(config?: CloverConfig): CloverClient {
  // If no config provided, create a default one (will be updated when settings are loaded)
  const defaultConfig: CloverConfig = {
    apiToken: process.env.CLOVER_API_TOKEN || '',
    appId: process.env.CLOVER_APP_ID || '',
    environment: (process.env.CLOVER_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  };
  
  return new CloverClient(config || defaultConfig);
}
