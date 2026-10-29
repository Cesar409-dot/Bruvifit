import { Eye, Pencil, Archive } from 'lucide-react';
import { IconButton } from '../../../components/ui/IconButton.jsx';
import styles from './ClientesTable.module.css';

function getCidadeUf(cliente) {
  if (cliente.endereco && (cliente.endereco.cidade || cliente.endereco.uf)) {
    return { cidade: cliente.endereco.cidade || cliente.cidade || '—', uf: cliente.endereco.uf || cliente.uf || '' };
  }
  return { cidade: cliente.cidade || '—', uf: cliente.uf || '' };
}

export function ClientesTable({ clientes = [] }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <caption className="sr-only">Lista de clientes cadastrados</caption>
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">E-mail</th>
            <th scope="col">Telefone</th>
            <th scope="col">Cidade</th>
            <th scope="col">UF</th>
            <th scope="col">Última compra</th>
            <th scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => {
            const inativo = cliente.status === 'inativo';
            const { cidade, uf } = getCidadeUf(cliente);
            return (
              <tr key={cliente.id} className={inativo ? styles.inativoRow : ''}>
                <td>
                  <div className={styles.nomeCell}>
                    <span className={styles.nome}>{cliente.nome}</span>
                    {inativo ? <span className={styles.selo}>Inativo</span> : null}
                  </div>
                </td>
                <td>{cliente.email}</td>
                <td>{cliente.telefone}</td>
                <td>{cidade}</td>
                <td>{uf}</td>
                <td>{cliente.ultimaCompra ? cliente.ultimaCompra.split('-').reverse().join('/') : '—'}</td>
                <td>
                  <div className={styles.acoes}>
                    <IconButton icon={Eye} label={`Ver perfil de ${cliente.nome}`} to={`/clientes/${cliente.id}`} />
                    <IconButton icon={Pencil} label={`Editar ${cliente.nome}`} to={`/clientes/${cliente.id}/editar`} />
                    <IconButton icon={Archive} label={`Inativar ${cliente.nome}`} to={`/clientes/${cliente.id}?inativar=1`} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
