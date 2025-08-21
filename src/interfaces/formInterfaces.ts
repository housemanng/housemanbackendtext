import { Request } from 'express';


export interface CreateFormRequest extends Request {
  body: {
    propertyId: string;
    propertyCode: string;
    title: string;
    cost: number;
    fields: Array<{
      name: string;
      label: string;
      type: 'text' | 'number' | 'select' | 'date' | 'email' | 'tel';
      required?: boolean;
      options?: string[];
      order?: number;
    }>;
  };
  user?: {
    _id: any;
    id?: string;
    type?: any;
    feeAmount?: number;
    isSuperAdmin?: boolean;
    [key: string]: any;
  };
}

export interface GetFormRequest extends Request {
  params: {
    propertyId?: string;
    uvcCode?: string;
    [key: string]: any;
  };
}

export interface AuthRequest extends Request {
  user?: {
    _id: any;
    id?: string;
    type?: any;
    feeAmount?: number;
    isSuperAdmin?: boolean;
    [key: string]: any;
  };
}

export interface GetFormByPropertyCodeRequest extends Request {
  params: {
    propertyCode?: string;
    [key: string]: any;
  };
}

export interface getFormByUVCRequest extends Request {
  params: {
    uvcCode?: string;
    [key: string]: any;
  };
}