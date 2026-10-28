import { ROLE, STATUS } from './funcionariosModel.js';

export const demoCurrentUser = { id: '1', name: 'Ana Costa', email: 'ana@bruvifit.com.br', role: ROLE.ADMIN };
export const demoEmployees = [
  { id: '1', name: 'Ana Costa', email: 'ana@bruvifit.com.br', phone: '', address: '', role: ROLE.ADMIN, status: STATUS.ACTIVE },
  { id: '2', name: 'Bruno Lima', email: 'bruno@bruvifit.com.br', phone: '', address: '', role: ROLE.SELLER, status: STATUS.ACTIVE },
  { id: '3', name: 'Marina Santos', email: 'marina@bruvifit.com.br', phone: '(11) 98888-7777', address: 'São Paulo / SP', role: ROLE.MANAGER, status: STATUS.PENDING },
];
