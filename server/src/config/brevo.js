import * as brevo from '@getbrevo/brevo';

/**
 * ตั้งค่า Brevo Transactional Emails API Client
 * ----------------------------------------------------------------
 * ใช้ Official SDK: @getbrevo/brevo
 * ต้องมี BREVO_API_KEY ใน .env (จาก Brevo > SMTP & API > API Keys)
 */
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

export { brevo, apiInstance };
