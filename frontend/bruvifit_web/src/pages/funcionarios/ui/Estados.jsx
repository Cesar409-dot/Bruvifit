import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { EmptyState } from '../../../components/ui/StateView.jsx';
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx';
import { TextField } from '../../../components/ui/TextField.jsx';
import { AlertTriangle, Check, Inbox } from 'lucide-react';
import styles from './Estados.module.css';

/** Galeria de estados independentes do protótipo para revisão visual e QA. */
export default function Estados() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('ana@bruvifit.com.br');
  const [retrying, setRetrying] = useState(false);
  return <>
    <PageHeader titulo="Funcionários — Estados de interface" subtitulo="Variantes estáticas para revisão visual · etapas e destinos identificados em cada painel" acoes={<Button variant="outline" onClick={() => navigate('/funcionarios')}>Voltar à equipe</Button>} />
    <div className={styles.panels}>
      <section className={styles.panel}>
        <div className={styles.tag}><span><Inbox aria-hidden="true"/></span><div><strong>VAZIO</strong><small>Funcionários · Convites</small></div></div>
        <EmptyState />
        <p className={styles.destination}>Destino: Funcionários → Cadastro e convite</p>
      </section>
      <section className={`${styles.panel} ${styles.panelError}`}>
        <div className={styles.tag}><span className={styles.errorIcon}><AlertTriangle aria-hidden="true"/></span><div><strong>ERRO</strong><small>Funcionários · Enviar convite</small></div></div>
        <h2>E-mail já cadastrado</h2><p>O convite não foi enviado. Este e-mail pertence a outro funcionário.</p>
        <div className={styles.dummy}><label>Nome / cargo</label><div>Marina Santos · Gerente de loja</div></div>
        <TextField id="email-error-demo" label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} erro="Informe um e-mail único para Marina." />
        <StatusPanel variante="erro" titulo="Como recuperar">Perfil Gerente e telefone foram mantidos. Nenhum convite duplicado foi enviado.</StatusPanel>
        <Button onClick={() => navigate('/funcionarios/novo')}>Corrigir e-mail</Button>
        <p className={styles.destination}>Destino: Funcionários → Cadastro / E-mail</p>
      </section>
      <section className={styles.panel}>
        <div className={styles.tag}><span><Check aria-hidden="true"/></span><div><strong>SUCESSO</strong><small>Funcionários · Convite</small></div></div>
        <h2>Convite enviado</h2><p>Marina Santos receberá um link para criar sua senha em marina@bruvifit.com.br.</p>
        <StatusPanel variante="sucesso" titulo="Registro da operação">Cargo: Gerente de loja · Perfil: Gerente · Status: Convite pendente. O acesso será liberado após a aceitação.</StatusPanel>
        <Button onClick={() => navigate('/funcionarios')}>Ver equipe</Button>
        <p className={styles.destination}>Destino: Funcionários → Listagem</p>
      </section>
    </div>
    <StatusPanel titulo="Em falha de rede">Mantenha os dados preenchidos e ofereça Tentar novamente na mesma etapa. Antes de reenviar uma confirmação, consulte o registro da operação para não duplicar ajustes, vendas, lançamentos ou convites.</StatusPanel>
    <Button variant="outline" onClick={() => setRetrying((value) => !value)}>Tentar novamente</Button>
    {retrying && <StatusPanel titulo="Exemplo de recuperação">Os dados do formulário permanecem preenchidos. Em um fluxo real, este botão repetirá a operação após confirmar que ela não foi registrada.</StatusPanel>}
  </>;
}
