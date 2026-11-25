import { useEffect, useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx'
import { TextField } from '../../../components/ui/TextField.jsx'
import { PROFILE_DEFAULTS, validatePassword, validateProfile } from '../model/settings-model.js'
import { settingsApi } from '../api/settings-api.js'
import { SettingsTabs } from './SettingsTabs.jsx'
import { SettingsConfirmationDialog } from './SettingsConfirmationDialog.jsx'
import styles from './settings.module.css'
import { formatarDataHora } from '../../../utils/format.js'

const emptyPassword = { atual: '', nova: '', confirmacao: '' }
export function PerfilSegurancaPage() {
  const [profile, setProfile] = useState(PROFILE_DEFAULTS)
  const [savedProfile, setSavedProfile] = useState(PROFILE_DEFAULTS)
  const [sessions, setSessions] = useState([])
  const [profileErrors, setProfileErrors] = useState({})
  const [password, setPassword] = useState(emptyPassword)
  const [passwordError, setPasswordError] = useState('')
  const [visible, setVisible] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [sessionAction, setSessionAction] = useState(null)
  const hasUnsavedChanges = Object.keys(savedProfile).some((field) => profile[field] !== savedProfile[field]) || Object.values(password).some(Boolean)
  const failureText = (error) => error.response?.data?.message || 'Não foi possível concluir a operação. Tente novamente.'

  async function load() {
    try { const [person, active] = await Promise.all([settingsApi.profile(), settingsApi.sessions()]); setProfile(person); setSavedProfile(person); setSessions(active) }
    catch (error) { setFeedback({ tone:'error', title:'Não foi possível carregar a conta', message:failureText(error) }) }
  }
  useEffect(() => { load() }, [])
  function updateProfile(field, value) { setProfile((current) => ({ ...current, [field]: value })); setProfileErrors((current) => ({ ...current, [field]: '' })); setFeedback(null) }
  async function saveProfile(event) {
    event.preventDefault(); const errors=validateProfile(profile); setProfileErrors(errors)
    if (Object.values(errors).some(Boolean)) { setFeedback({tone:'error',title:'Confira os dados do perfil',message:'Corrija os campos indicados antes de salvar.'}); return }
    try { const saved=await settingsApi.saveProfile(profile); setProfile(saved); setSavedProfile(saved); setFeedback({tone:'success',title:'Perfil salvo',message:'Seus dados foram atualizados.'}) }
    catch(error) { setFeedback({tone:'error',title:'Não foi possível salvar o perfil',message:failureText(error)}) }
  }
  async function changePassword(event) {
    event.preventDefault(); const error=validatePassword(password); setPasswordError(error); if(error) return
    try { await settingsApi.changePassword(password); setPassword(emptyPassword); setPasswordError(''); setFeedback({tone:'success',title:'Senha alterada',message:'Entre novamente com a nova senha.'}); setTimeout(() => { window.location.assign('/acesso') }, 900) }
    catch(failure) { setPasswordError(failureText(failure)); setFeedback({tone:'error',title:'Não foi possível alterar a senha',message:failureText(failure)}) }
  }
  function discardChanges(showFeedback=true) { setProfile({...savedProfile}); setProfileErrors({}); setPassword(emptyPassword); setPasswordError(''); setDiscardOpen(false); setFeedback(showFeedback?{tone:'info',title:'Alterações descartadas',message:'O perfil salvo foi restaurado.'}:null) }
  async function finishSessionAction() {
    try { if (sessionAction?.all) await settingsApi.revokeOthers(); else await settingsApi.revokeSession(sessionAction.id); await load(); setFeedback({tone:'success',title:'Sessões atualizadas',message:'A sessão selecionada foi encerrada.'}) }
    catch(error) { setFeedback({tone:'error',title:'Não foi possível encerrar a sessão',message:failureText(error)}) }
    finally { setSessionAction(null) }
  }
  return <main className={styles.page}>
    <PageHeader titulo="Perfil e segurança" subtitulo="Sua conta, senha e dispositivos conectados" acoes={<div className={styles.headerActions}>{hasUnsavedChanges?<span className={styles.unsavedStatus} role="status">Alterações não salvas</span>:null}<Button variant="outline" onClick={()=>discardChanges()}>Cancelar</Button><Button type="submit" form="profile-form">Salvar perfil</Button></div>} />
    <SettingsTabs hasUnsavedChanges={hasUnsavedChanges} onDiscard={()=>discardChanges(false)} />
    {feedback?<StatusPanel variante={feedback.tone==='error'?'erro':feedback.tone==='success'?'sucesso':'info'} tom="verde" titulo={feedback.title}>{feedback.message}</StatusPanel>:null}
    <form id="profile-form" className={styles.formStack} onSubmit={saveProfile}><section className={styles.panel} aria-labelledby="profile-info-title"><h2 id="profile-info-title">Dados pessoais</h2><div className={styles.grid3}>
      <TextField id="profile-name" label="Nome" obrigatorio value={profile.nome} onChange={(e)=>updateProfile('nome',e.target.value)} erro={profileErrors.nome} placeholder="Nome completo" maxLength={45}/>
      <TextField id="profile-email" label="E-mail" obrigatorio type="email" value={profile.email} onChange={(e)=>updateProfile('email',e.target.value)} erro={profileErrors.email} placeholder="nome@empresa.com.br" maxLength={45}/>
      <TextField id="profile-phone" label="Telefone" type="tel" value={profile.telefone} onChange={(e)=>updateProfile('telefone',e.target.value)} erro={profileErrors.telefone} placeholder="(00) 00000-0000" maxLength={20}/>
    </div></section></form>
    <section className={styles.panel} aria-labelledby="change-password-title"><h2 id="change-password-title">Alterar senha</h2><form className={styles.formStack} onSubmit={changePassword}>
      <p className={styles.helper}>A alteração de senha encerra as sessões existentes; será necessário entrar novamente.</p><div className={styles.grid3}>{[['atual','Senha atual'],['nova','Nova senha'],['confirmacao','Confirmar nova senha']].map(([field,label])=>{const Icon=visible[field]?EyeOff:Eye;return <div className={styles.passwordField} key={field}><label htmlFor={`password-${field}`}>{label} <span aria-hidden="true">*</span></label><div className={styles.passwordControl}><input id={`password-${field}`} required type={visible[field]?'text':'password'} value={password[field]} onChange={(e)=>{setPassword((v)=>({...v,[field]:e.target.value}));setPasswordError('');setFeedback(null)}} autoComplete="new-password" placeholder={field==='atual'?'Digite sua senha atual':field==='nova'?'Crie uma nova senha':'Repita a nova senha'} aria-describedby={passwordError?'password-validation-error':'password-requirements'}/><button type="button" aria-label={visible[field]?`Ocultar ${label.toLowerCase()}`:`Mostrar ${label.toLowerCase()}`} onClick={()=>setVisible((v)=>({...v,[field]:!v[field]}))}><Icon size={18}/></button></div></div>})}</div>
      {passwordError?<p id="password-validation-error" className={styles.fieldError} role="alert">{passwordError}</p>:null}<p id="password-requirements" className={styles.helper}>Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo.</p><div><Button type="submit"><LockKeyhole size={17}/> Alterar senha</Button></div>
    </form></section>
    <section className={styles.panel} aria-labelledby="active-sessions-title"><h2 id="active-sessions-title">Sessões ativas</h2><div className={styles.sessionList}>{sessions.map((item)=><div className={`${styles.sessionRow}${item.current?` ${styles.currentSession}`:''}`} key={item.id}><div className={styles.sessionInfo}><strong>{item.current?'Este dispositivo':item.device}</strong><span>{item.device} · Acesso {formatarDataHora(item.createdAt)} · {item.current?'Sessão atual':'Sessão ativa'}</span></div>{item.current?<span className={styles.currentLabel}>Atual</span>:<Button variant="outline" onClick={()=>setSessionAction({id:item.id})}>Encerrar sessão</Button>}</div>)}{sessions.length===0?<p className={styles.noSessions}>Nenhuma sessão ativa encontrada.</p>:null}</div><div className={styles.sessionActions}>{sessions.some(s=>!s.current)?<Button variant="outline" onClick={()=>setSessionAction({all:true})}>Encerrar outras sessões</Button>:null}</div></section>
    <SettingsConfirmationDialog open={discardOpen} title="Descartar alterações?" description="Somente as alterações não salvas desta aba serão perdidas." onCancel={()=>setDiscardOpen(false)} onConfirm={()=>discardChanges()}/>
    <SettingsConfirmationDialog open={Boolean(sessionAction)} title={sessionAction?.all?'Encerrar outras sessões?':'Encerrar sessão?'} description={sessionAction?.all?'Todas as outras sessões serão encerradas; esta sessão será preservada.':'A sessão selecionada será encerrada.'} cancelLabel="Cancelar" confirmLabel="Encerrar" onCancel={()=>setSessionAction(null)} onConfirm={finishSessionAction}/>
  </main>
}
