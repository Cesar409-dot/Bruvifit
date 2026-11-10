import { validarNome, validarTelefone, validarEmail, validarCep } from '../../../utils/validators.js';

export const filtrosIniciais = { pesquisar: '', estado: '', dataInicial: '', dataFinal: '' };
export const clienteVazio = { nome: '', email: '', telefone: '', cpf: '', cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', enderecoId: null };

export function normalizarCliente(cliente, endereco) {
  const e = endereco ?? cliente;
  return { ...cliente, status: cliente.ativo ? 'ativo' : 'inativo', uf: e.estado || '', cidade: e.cidade || '',
    endereco: { id: endereco?.id, cep: e.cep || '', logradouro: e.rua || e.logradouro || '', numero: e.numero || '', complemento: e.complemento || '', bairro: e.bairro || '', cidade: e.cidade || '', uf: e.estado || '' } };
}

export function dadosFormulario(cliente) {
  return { ...clienteVazio, nome: cliente.nome || '', email: cliente.email || '', telefone: cliente.telefone || '',
    ...cliente.endereco, enderecoId: cliente.endereco?.id ?? null };
}

export function temEndereco(values) {
  return ['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf'].some((key) => values[key]?.trim());
}

export function validarCliente(values) {
  const errors = {};
  const checks = { nome: validarNome(values.nome), telefone: validarTelefone(values.telefone),
    email: !values.email?.trim() ? 'Informe o e-mail.' : validarEmail(values.email) };
  for (const [key, message] of Object.entries(checks)) if (message) errors[key] = message;
  for (const key of ['nome', 'email']) if (values[key]?.trim().length > 45) errors[key] = 'Use no máximo 45 caracteres.';
  if (temEndereco(values)) {
    if (!values.cep?.trim()) errors.cep = 'Informe o CEP.';
    else if (validarCep(values.cep)) errors.cep = validarCep(values.cep);
    for (const key of ['bairro', 'cidade']) if (values[key]?.trim().length < 2 || !values[key]?.trim()) errors[key] = 'Informe ao menos 2 caracteres.';
    if (!values.numero?.trim() || values.numero.trim().length > 20) errors.numero = 'Informe o número com até 20 caracteres.';
    if (!/^[A-Z]{2}$/.test(values.uf || '')) errors.uf = 'Selecione a UF.';
    for (const key of ['complemento', 'bairro', 'cidade']) if (values[key]?.trim().length > 45) errors[key] = 'Use no máximo 45 caracteres.';
    if (values.logradouro?.trim().length > 200) errors.logradouro = 'Use no máximo 200 caracteres.';
  }
  return errors;
}

export function dataFiltro(value) {
  if (!value) return '';
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const date = new Date(`${iso}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso ? iso : null;
}

export function validarFiltros(filtros) {
  const inicio = dataFiltro(filtros.dataInicial), fim = dataFiltro(filtros.dataFinal);
  if (inicio === null || fim === null) return 'Informe datas válidas em DD/MM/AAAA.';
  if (inicio && fim && inicio > fim) return 'A data final deve ser igual ou posterior à inicial.';
  return '';
}

const texto = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function filtrarClientes(clientes, filtros) {
  const busca = texto(filtros.pesquisar.trim());
  const inicio = dataFiltro(filtros.dataInicial), fim = dataFiltro(filtros.dataFinal);
  return clientes.filter((c) => (!busca || [c.nome, c.email, c.telefone, c.cidade].some((value) => texto(value).includes(busca)))
    && (!filtros.estado || c.uf === filtros.estado)
    && (!inicio || (c.ultimaCompra && c.ultimaCompra >= inicio))
    && (!fim || (c.ultimaCompra && c.ultimaCompra <= fim)))
    .sort((a, b) => (b.ultimaCompra || '').localeCompare(a.ultimaCompra || '') || a.nome.localeCompare(b.nome));
}

export function paginarClientes(clientes, pagina, tamanho) {
  const totalPaginas = Math.max(1, Math.ceil(clientes.length / tamanho));
  const atual = Math.min(Math.max(1, pagina), totalPaginas);
  return { pagina: atual, totalPaginas, registros: clientes.slice((atual - 1) * tamanho, atual * tamanho) };
}

export function erroClientes(error, acao = 'carregar os clientes') {
  const status = error.response?.status;
  if (status === 401) return 'Sessão expirada. Faça login novamente.';
  if (status === 403) return 'Você não tem permissão para realizar esta ação.';
  if (status === 404) return 'Cliente não encontrado ou removido. Atualize a listagem.';
  if (status === 409) return acao === 'excluir o cliente'
    ? (typeof error.response.data?.message === 'string' && error.response.data.message.trim()
      ? error.response.data.message
      : 'Não é possível excluir este cliente: existem pedidos ou outros registros vinculados. Nenhum histórico foi apagado.')
    : error.response.data?.message || 'Já existe um cliente com esses dados.';
  if (status === 400) return 'Confira os campos informados e tente novamente.';
  if (status >= 500) return 'O servidor não conseguiu concluir a operação. Tente novamente.';
  return error.code === 'ERR_CLIENTES_CONTRACT' ? error.message : `Não foi possível ${acao}. Verifique a conexão e tente novamente.`;
}
