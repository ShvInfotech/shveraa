import { initializeApp, cert  } from 'firebase-admin'

const serviceAccount = JSON.parse(process.env.FIERBASESDK)

const firebaseadmin = initializeApp({
    credential: cert(serviceAccount)
});


export default firebaseadmin;