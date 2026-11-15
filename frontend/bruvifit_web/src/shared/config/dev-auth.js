const bypassValue = String(import.meta.env?.VITE_DEV_BYPASS_AUTH || '').toLowerCase();

export const devAuthBypass = import.meta.env?.DEV === true && bypassValue === 'true';
