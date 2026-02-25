export interface ExternalDeposit {
  id: number;
  userId: number;
  paymentId: string;
  status: string;
  fiatAmount: string;
  crypto: string;
  payAmount?: string;
  paidAmount?: string;
  address?: string;
  meta?: any;
  user?: {
    id: number;
    memberId: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface DownlineDepositResponse {
  data: ExternalDeposit[];
  total: number;
  page: number;
  pageSize: number;
}
