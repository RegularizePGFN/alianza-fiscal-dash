/**
 * Formatação de CNPJ/CPF.
 *
 * Sempre reconstrói a máscara a partir dos dígitos, ignorando qualquer
 * pontuação que o cliente tenha digitado. Funciona para qualquer entrada
 * (com ou sem pontos/barra/traço, com espaços etc.).
 *
 * - 14 dígitos -> 00.000.000/0000-00 (CNPJ)
 * - 11 dígitos -> 000.000.000-00 (CPF)
 * - Caso intermediário: aplica a máscara progressivamente conforme o usuário digita.
 */

export function onlyDigits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

export function formatCpf(value: string | null | undefined): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function formatCnpj(value: string | null | undefined): string {
  const d = onlyDigits(value).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

/**
 * Detecta CPF ou CNPJ pelo número de dígitos:
 *  - até 11 dígitos -> máscara de CPF
 *  - 12 ou mais   -> máscara de CNPJ (limitada a 14)
 */
export function formatDocument(value: string | null | undefined): string {
  const d = onlyDigits(value);
  if (d.length === 0) return "";
  if (d.length <= 11) return formatCpf(d);
  return formatCnpj(d);
}
