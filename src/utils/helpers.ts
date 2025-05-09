// Formats a 10-digit US phone number as +1 (XXX) XXX-XXXX, else returns "N/A" or the original value
function formatPhoneNumber(phone: string | number | undefined | null): string {
  if (!phone) return "N/A";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length !== 10) return digits.length === 0 ? "N/A" : String(phone);
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default formatPhoneNumber;
