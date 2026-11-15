function contratoCep(data) {
  if (!data || data.erro === true) {
    throw Object.assign(new Error('CEP não encontrado.'), { code: 'ERR_CEP_NOT_FOUND' });
  }

  const campos = ['logradouro', 'bairro', 'localidade', 'uf'];
  if (!campos.every((campo) => typeof data[campo] === 'string')) {
    throw Object.assign(new Error('Resposta inválida da consulta de CEP.'), { code: 'ERR_CEP_CONTRACT' });
  }

  return data;
}

export async function consultarCep(cep, fetchImpl = fetch) {
  const digits = String(cep || '').replace(/\D/g, '');
  if (!/^\d{8}$/.test(digits)) return null;

  const response = await fetchImpl(`https://viacep.com.br/ws/${digits}/json/`);
  if (!response.ok) throw Object.assign(new Error('Não foi possível consultar o CEP.'), { code: 'ERR_CEP_NETWORK' });
  return contratoCep(await response.json());
}
