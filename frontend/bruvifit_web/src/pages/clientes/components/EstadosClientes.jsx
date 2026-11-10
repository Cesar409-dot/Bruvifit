import { Inbox, CircleAlert, CircleCheck } from 'lucide-react';
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import styles from './EstadosClientes.module.css';
import { Link } from 'react-router-dom';

export function EstadoVazio({ filtrado = false, onLimpar }) {
  return (
    <div className={styles.cardInner}>
      <div className={styles.headerRow}>
        <div className={styles.iconTile}>
          <Inbox size={20} aria-hidden="true" />
        </div>
        <div>
          <p className={styles.overline}>VAZIO · rota: Clientes · Listagem</p>
        </div>
      </div>
      <h2 className={styles.h2}>{filtrado ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</h2>
      <p className={styles.texto}>{filtrado ? 'Altere ou limpe os filtros para consultar outros clientes.' : 'Adicione seus clientes para manter contatos e acompanhar o histórico de vendas.'}</p>
      <StatusPanel variante="info" tom="rosa" titulo="Próximo passo">
        Nome, e-mail e telefone são obrigatórios. CPF não é disponibilizado pela API.
      </StatusPanel>
      <div className={styles.botoes}>
        <Link to="/clientes/novo">
          <Button variant="primary">Cadastrar cliente</Button>
        </Link>
        <Button variant="outline" disabled={!onLimpar} onClick={onLimpar}>Limpar filtros</Button>
      </div>
      <p className={styles.rodape}>Destino: Clientes → Cadastro</p>
    </div>
  );
}

export function EstadoErroForm({ erro, onTentar }) {
  return (
    <div className={styles.cardInner}>
      <div className={styles.headerRow}>
        <div className={styles.iconTileErro}>
          <CircleAlert size={20} aria-hidden="true" />
        </div>
        <div>
          <p className={styles.overlineErro}>CONSULTA · rota: Clientes</p>
        </div>
      </div>
      <h2 className={styles.h2}>{erro ? 'Confira a conexão' : 'Consulta sem erros'}</h2>
      <p className={styles.texto}>{erro || 'A consulta atual não apresentou falhas.'}</p>
      <StatusPanel variante={erro ? 'erro' : 'info'} titulo="Atualizar dados">
        A consulta utiliza os clientes cadastrados no sistema.
      </StatusPanel>
      <div className={styles.botoes}>
        <Button variant="primary" onClick={onTentar}>Consultar novamente</Button>
      </div>
      <p className={styles.rodape}>Destino: Clientes → Cadastro / E-mail</p>
    </div>
  );
}

export function EstadoSucesso({ cliente }) {
  return (
    <div className={styles.cardInner}>
      <div className={styles.headerRow}>
        <div className={styles.iconTile}>
          <CircleCheck size={20} aria-hidden="true" />
        </div>
        <div>
          <p className={styles.overline}>CADASTRO · rota: Clientes · Perfil</p>
        </div>
      </div>
      <h2 className={styles.h2}>{cliente ? 'Cliente cadastrado' : 'Nenhum cliente carregado'}</h2>
      <p className={styles.texto}>{cliente ? `Os dados de ${cliente.nome} estão disponíveis para consulta.` : 'Cadastre um cliente para consultar seus dados.'}</p>
      <StatusPanel variante={cliente ? 'sucesso' : 'info'} titulo="Dados da consulta">
        {cliente ? `${cliente.email} · ${cliente.telefone} · ${cliente.status}` : 'Aguardando cadastro de clientes.'}
      </StatusPanel>
      <div className={styles.botoes}>
        <Link to={cliente ? `/clientes/${cliente.id}` : '/clientes/novo'}>
          <Button variant="primary">Ver perfil do cliente</Button>
        </Link>
      </div>
      <p className={styles.rodape}>Destino: Clientes → Perfil de João Silva</p>
    </div>
  );
}
