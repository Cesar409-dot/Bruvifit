import { Inbox, CircleAlert, CircleCheck } from 'lucide-react';
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { TextField } from '../../../components/ui/TextField.jsx';
import styles from './EstadosClientes.module.css';
import { Link } from 'react-router-dom';

export function EstadoVazio() {
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
      <h2 className={styles.h2}>Nenhum cliente cadastrado</h2>
      <p className={styles.texto}>Adicione seus clientes para manter contatos e acompanhar o histórico de vendas.</p>
      <StatusPanel variante="info" tom="rosa" titulo="Próximo passo">
        Nome e telefone são obrigatórios. O CPF é opcional.
      </StatusPanel>
      <div className={styles.botoes}>
        <Link to="/clientes/novo">
          <Button variant="primary">Cadastrar cliente</Button>
        </Link>
        <Button variant="outline">Limpar filtros</Button>
      </div>
      <p className={styles.rodape}>Destino: Clientes → Cadastro</p>
    </div>
  );
}

export function EstadoErroForm() {
  return (
    <div className={styles.cardInner}>
      <div className={styles.headerRow}>
        <div className={styles.iconTileErro}>
          <CircleAlert size={20} aria-hidden="true" />
        </div>
        <div>
          <p className={styles.overlineErro}>ERRO · rota: Clientes · Salvar edição</p>
        </div>
      </div>
      <h2 className={styles.h2}>Confira o e-mail</h2>
      <p className={styles.texto}>O cliente não foi salvo. Corrija o campo indicado; os demais dados foram mantidos.</p>
      <div className={styles.campoDemo}>
        <TextField id="demo-nome" label="Nome completo" value="João Silva" readOnly />
      </div>
      <div className={styles.campoDemo}>
        <TextField
          id="demo-email"
          label="E-mail"
          value="joao@email"
          erro="Informe um e-mail completo, como joao@email.com."
          readOnly
        />
      </div>
      <StatusPanel variante="erro" titulo="Como recuperar">
        Telefone (11) 99999-9999 e endereço de São Paulo / SP preservados. CPF continua opcional.
      </StatusPanel>
      <div className={styles.botoes}>
        <Button variant="primary">Corrigir e-mail</Button>
      </div>
      <p className={styles.rodape}>Destino: Clientes → Cadastro / E-mail</p>
    </div>
  );
}

export function EstadoSucesso() {
  return (
    <div className={styles.cardInner}>
      <div className={styles.headerRow}>
        <div className={styles.iconTile}>
          <CircleCheck size={20} aria-hidden="true" />
        </div>
        <div>
          <p className={styles.overline}>SUCESSO · rota: Clientes · Cadastro e edição</p>
        </div>
      </div>
      <h2 className={styles.h2}>Cliente salvo</h2>
      <p className={styles.texto}>Os dados de João Silva foram salvos e estão disponíveis para uso em novas vendas.</p>
      <StatusPanel variante="sucesso" titulo="Registro da operação">
        joao@email.com · (11) 99999-9999 · São Paulo / SP · Ativo. Histórico de vendas preservado.
      </StatusPanel>
      <div className={styles.botoes}>
        <Link to="/clientes/1">
          <Button variant="primary">Ver perfil do cliente</Button>
        </Link>
      </div>
      <p className={styles.rodape}>Destino: Clientes → Perfil de João Silva</p>
    </div>
  );
}
