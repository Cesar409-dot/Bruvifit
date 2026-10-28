import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLE, STATUS, PERMISSIONS, permissionModules, normalizeEmployee, validateEmployee, toEmployeePayload } from '../src/pages/funcionarios/model/funcionariosModel.js';
import { demoEmployees } from '../src/pages/funcionarios/model/demoData.js';

test('Validação preserva campos obrigatórios e identifica e-mail inválido', () => {
  assert.deepEqual(Object.keys(validateEmployee({ name: '', email: '', role: '' })).sort(), ['email', 'name', 'role']);
  assert.equal(validateEmployee({ name: 'Marina Santos', email: 'semarroba', role: ROLE.MANAGER }).email, 'Informe um e-mail válido.');
  assert.deepEqual(validateEmployee({ name: 'Marina Santos', email: 'marina@bruvifit.com.br', role: ROLE.MANAGER }), {});
});

test('Payload normaliza e-mail e aparas espaços', () => {
  assert.deepEqual(toEmployeePayload({ name: ' Marina Santos ', email: ' MARINA@EXEMPLO.COM ', phone: ' 11 ', address: ' SP ', role: ROLE.MANAGER }), {name:'Marina Santos',email:'marina@exemplo.com', phone:'11',address:'SP',role:ROLE.MANAGER});
});

test('Model traduz nomes alternativos da API para o contrato da view', () => {
  const output = normalizeEmployee({ id: 5, nomeCompleto:'Bruno Lima', email:'bruno@exemplo.com', cargo:'Vendedor', status:'ativo' });
  assert.equal(output.id, '5'); assert.equal(output.role, ROLE.SELLER); assert.equal(output.status, STATUS.ACTIVE);
});

test('Perfis possuem uma tabela para todos os módulos', () => {
  for (const role of Object.values(ROLE)) for (const section of permissionModules) assert.equal(PERMISSIONS[role][section].length, 3);
  assert.deepEqual(PERMISSIONS[ROLE.SELLER].Vendas, ['Sim','Sim','Não']);
});

test('Demonstração tem dois ativos, um convite e um administrador ativo', () => {
  assert.equal(demoEmployees.filter((e) => e.status === STATUS.ACTIVE).length, 2);
  assert.equal(demoEmployees.filter((e) => e.status === STATUS.PENDING).length, 1);
  assert.equal(demoEmployees.filter((e) => e.role === ROLE.ADMIN && e.status === STATUS.ACTIVE).length, 1);
});
