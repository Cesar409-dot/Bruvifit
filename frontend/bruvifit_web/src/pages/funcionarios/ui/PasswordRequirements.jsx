import { Check, Circle } from 'lucide-react';
import { getPasswordRequirements } from '../../../shared/auth/password-policy.js';
import styles from './PasswordRequirements.module.css';

export function PasswordRequirements({ password }) {
  return (
    <div className={styles.requirements} aria-live="polite">
      <strong>Sua senha deve conter:</strong>
      <ul>
        {getPasswordRequirements(password).map((requirement) => (
          <li className={requirement.met ? styles.met : ''} key={requirement.id}>
            {requirement.met
              ? <Check size={15} aria-hidden="true" />
              : <Circle size={13} aria-hidden="true" />}
            <span>{requirement.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
