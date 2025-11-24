export function generateInvoiceNo() {
  const ts = Date.now().toString().slice(-6);
  return `INV-${new Date().getFullYear()}-${ts}`;
}

export function generateLicenseNo() {
  const ts = Date.now().toString().slice(-6);
  return `LIC-${new Date().getFullYear()}-${ts}`;
}
