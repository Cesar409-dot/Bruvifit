import test from 'node:test';
import assert from 'node:assert/strict';
import { createReportExport, formatReportDate, initialReportFilters, reportTypes } from '../src/pages/relatorios/model/reports-model.js';

test('defines the four report types from the reports module', () => {
  assert.deepEqual(reportTypes.map(({ type }) => type), ['Vendas', 'Estoque', 'Financeiro', 'Produtos']);
});

test('formats report dates using Brazilian locale', () => {
  assert.equal(formatReportDate('2026-01-10'), '10/01/2026');
});

test('creates CSV export using semicolon delimiter and report rows', () => {
  const file = createReportExport({ format: 'CSV', filters: initialReportFilters });
  assert.equal(file.extension, 'csv');
  assert.match(file.contents, /Venda \/ data;Cliente;Produto/);
  assert.match(file.contents, /João Silva/);
});

test('does not label a text preview as a real PDF', () => {
  const file = createReportExport({ format: 'PDF', filters: initialReportFilters });
  assert.equal(file.extension, 'txt');
  assert.match(file.contents, /DADOS DEMONSTRATIVOS/);
});
