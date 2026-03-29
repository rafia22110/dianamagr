import { createClient } from '@insforge/sdk';

const API = 'https://ane7v4ce.us-east.insforge.app';
const KEY = 'ik_bf44df2031c6d8808e0d4cff27b52575'; // Anon key

async function registerDoeJoe() {
    console.log('🚀 Registering Doe Joe via API...');
    try {
        const insforge = createClient({ baseUrl: API, anonKey: KEY });
        const { data, error } = await insforge.database.from("subscribers").insert([
            {
                name: "דו ג'ו",
                email: "joe.doe@example.com",
                phone: "0501234567",
                subscribed_at: new Date().toISOString()
            }
        ]);

        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Success! Doe Joe registered.');
        }
    } catch (e) {
        console.error('Exception:', e.message);
    }
}

registerDoeJoe();
