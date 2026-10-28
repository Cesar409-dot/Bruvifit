import { useState } from 'react';
import { useNavigate } from '../model/navigation.js';
import { Alert, Button, Field, PageHeader } from './components/UI.jsx';
import { EmptyState } from './components/Feedback.jsx';
import Icon from './components/Icons.jsx';
import styles from './Estados.module.css';

/** Galeria de estados independentes do protótipo para revisão visual e QA. */
export default function Estados() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('ana@bruvifit.com.br');
  const [retrying, setRetrying] = useState(false);
  return <>
    <PageHeader title="Funcionários — Estados de interface" description="Variantes estáticas para revisão visual · etapas e destinos identificados em cada painel" actions={<Button variant="secondary" onClick={() => navigate('/funcionarios')}>Voltar à equipe</Button>} />
    <div className={styles.panels}>
      <section className={styles.panel}>
        <div className={styles.tag}><span><Icon name="inbox"/></span><div><strong>VAZIO</strong><small>Funcionários · Convites</small></div></div>
        <EmptyState />
        <p className={styles.destination}>Destino: Funcionários → Cadastro e convite</p>
      </section>
      <section className={`${styles.panel} ${styles.panelError}`}>
        <div className={styles.tag}><span className={styles.errorIcon}><Icon name="alert"/></span><div><strong>ERRO</strong><small>Funcionários · Enviar convite</small></div></div>
        <h2>E-mail já cadastrado</h2><p>O convite não foi enviado. Este e-mail pertence a outro funcionário.</p>
        <div className={styles.dummy}><label>Nome / cargo</label><div>Marina Santos · Gerente de loja</div></div>
        <Field name="email-error-demo" label="E-mail" value={email} onChange={setEmail} error="Informe um e-mail único para Marina."/>
        <Alert tone="error" title="Como recuperar">Perfil Gerente e telefone foram mantidos. Nenhum convite duplicado foi enviado.</Alert>
        <Button onClick={() => navigate('/funcionarios/novo')}>Corrigir e-mail</Button>
        <p className={styles.destination}>Destino: Funcionários → Cadastro / E-mail</p>
      </section>
      <section className={styles.panel}>
        <div className={styles.tag}><span><Icon name="check"/></span><div><strong>SUCESSO</strong><small>Funcionários · Convite</small></div></div>
        <h2>Convite enviado</h2><p>Marina Santos receberá um link para criar sua senha em marina@bruvifit.com.br.</p>
        <Alert tone="success" title="Registro da operação">Cargo: Gerente de loja · Perfil: Gerente · Status: Convite pendente. O acesso será liberado após a aceitação.</Alert>
        <Button onClick={() => navigate('/funcionarios')}>Ver equipe</Button>
        <p className={styles.destination}>Destino: Funcionários → Listagem</p>
      </section>
    </div>
    <Alert title="Em falha de rede">Mantenha os dados preenchidos e ofereça Tentar novamente na mesma etapa. Antes de reenviar uma confirmação, consulte o registro da operação para não duplicar ajustes, vendas, lançamentos ou convites.</Alert>
    <Button variant="secondary" onClick={() => setRetrying((value) => !value)}>Tentar novamente</Button>
    {retrying && <Alert title="Exemplo de recuperação">Os dados do formulário permanecem preenchidos. Em um fluxo real, este botão repetirá a operação após confirmar que ela não foi registrada.</Alert>}
  </>;
}
