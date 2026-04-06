export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  nickname?: string;
  cpf?: string;
  companyName?: string;
  phone: string;
  observation?: string;
  creditLimit?: number;
  createdAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export type CustomerFormData = Pick<Customer, 'firstName' | 'lastName' | 'nickname' | 'cpf' | 'companyName' | 'phone' | 'observation' | 'creditLimit'>;
