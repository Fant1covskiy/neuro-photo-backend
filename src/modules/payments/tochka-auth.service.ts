import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { tochkaConfig } from '../../config/tochka.config';

@Injectable()
export class TochkaAuthService {
  private clientToken: string = '';
  private clientTokenExpiry: number = 0;

  private hybridToken: string = '';
  private hybridTokenExpiry: number = 0;

  private async getClientToken(): Promise<string> {
    if (this.clientToken && Date.now() < this.clientTokenExpiry) return this.clientToken;

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', tochkaConfig.clientId);
      params.append('client_secret', tochkaConfig.clientSecret);
      params.append('scope', 'accounts balances customers statements sbp payments acquiring');

      const { data } = await axios.post('https://enter.tochka.com/connect/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      this.clientToken = data.access_token;
      this.clientTokenExpiry = Date.now() + (Number(data.expires_in ?? 86400) - 60) * 1000;
      return this.clientToken;
    } catch (e: any) {
      throw new BadRequestException(
        `Tochka client_credentials failed: ${e?.response?.data?.error_description || e?.response?.data?.error || e.message}`,
      );
    }
  }

  async getHybridToken(): Promise<string> {
    if (this.hybridToken && Date.now() < this.hybridTokenExpiry) return this.hybridToken;

    const clientToken = await this.getClientToken();

    try {
      const params = new URLSearchParams();
      params.append('access_token', clientToken);

      const { data } = await axios.post('https://enter.tochka.com/connect/introspect', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (typeof data !== 'string' || !data.startsWith('eyJ')) {
        throw new BadRequestException(`Tochka introspect returned unexpected payload`);
      }

      this.hybridToken = data;
      this.hybridTokenExpiry = Date.now() + (86400 - 60) * 1000;
      return this.hybridToken;
    } catch (e: any) {
      throw new BadRequestException(
        `Tochka introspect failed: ${e?.response?.data?.message || e?.response?.data?.error || e.message}`,
      );
    }
  }
}
