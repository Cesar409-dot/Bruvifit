import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLE, STATUS, PERMISSIONS, permissionModules, normalizeEmployee, validateEmployee, toEmployeePayload } from '../src/pages/funcionarios/model/funcionariosModel.js';

const validEmployee = { name: 'Marina Santos', email: 'marina@bruvifit.com.br', cpf: '123.456.789-01', password: 'senha123', role: ROLE.MANAGER };

test('Validação inclui os campos obrigatórios do DTO e identifica e-mail inválido', () => {
  assert.deepEqual(Object.keys(validateEmployee({ name: '', email: '', cpf: '', password: '', role: '' })).sort(), ['cpf', 'email', 'name', 'password', 'role']);
  assert.equal(validateEmployee({ ...validEmployee, email: 'semarroba' }).email, 'Informe um e-mail válido.');
  assert.deepEqual(validateEmployee(validEmployee), {});
});

test('Payload normaliza nome, e-mail e CPF', () => {
  assert.deepEqual(toEmployeePayload({ ...validEmployee, name: ' Marina Santos ', email: ' MARINA@EXEMPLO.COM ' }), {name:'Marina Santos',email:'marina@exemplo.com', cpf:'12345678901', password:'senha123', role:ROLE.MANAGER});
});

test('Model traduz nomes alternativos da API para o contrato da view', () => {
  const output = normalizeEmployee({ id: 5, nomeCompleto:'Bruno Lima', email:'bruno@exemplo.com', cargo:'Vendedor', status:'ativo' });
  assert.equal(output.id, '5'); assert.equal(output.role, ROLE.SELLER); assert.equal(output.status, STATUS.ACTIVE);
});

test('Model usa o campo ativo real do UsuarioResponse', () => {
  assert.equal(normalizeEmployee({ id: 7, nome: 'Teste', cargo: 'GERENTE', ativo: false }).status, STATUS.INACTIVE);
});

test('Perfis possuem uma tabela para todos os módulos', () => {
  for (const role of Object.values(ROLE)) for (const section of permissionModules) assert.equal(PERMISSIONS[role][section].length, 3);
  assert.deepEqual(PERMISSIONS[ROLE.SELLER].Vendas, ['Sim','Sim','Não']);
});
