const { createClient } = require('@insforge/sdk');

async function createAdminUser() {
  const client = createClient({
    baseUrl: 'https://ane7v4ce.us-east.insforge.app',
    anonKey: 'ik_bf44df2031c6d8808e0d4cff27b52575'
  });

  console.log('--- מנסה ליצור משתמש אדמין חדש ---');
  
  try {
    const { data, error } = await client.auth.signUp({
      email: 'admin@diana.co.il',
      password: 'Diana2026!',
      options: {
        data: {
          full_name: 'דיאנה רחמני',
          role: 'admin'
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ המשתמש כבר רשום במערכת! נסה לאפס סיסמה או לוודא שהקלדת נכון.');
      } else {
        console.error('❌ שגיאה ברישום המשתמש:', error.message);
      }
    } else {
      console.log('🎉 הצלחה! משתמש האדמין נוצר בהצלחה.');
      console.log('אימייל: admin@diana.co.il');
      console.log('סיסמה: Diana2026!');
    }
  } catch (err) {
    console.error('❌ תקלה בלתי צפויה:', err.message);
  }
}

createAdminUser();
