import { NextResponse, NextRequest } from 'next/server';
import { getApps, initializeApp, cert, deleteApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === 'true';

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  const status = {
    env: {
      projectId: projectId || '❌ Missing',
      clientEmail: clientEmail || '❌ Missing',
      privateKeyStatus: privateKey ? '✅ Present' : '❌ Missing',
      privateKeyLength: privateKey ? privateKey.length : 0,
    },
    checks: {
        isEmailValidFormat: clientEmail?.includes('@') && clientEmail?.includes('iam.gserviceaccount.com'),
        privateKeyHasNewlines: privateKey ? privateKey.includes('\n') : false,
        privateKeyHasEscapedNewlines: privateKey ? privateKey.includes('\\n') : false,
    },
    initialization: 'Pending',
    authCheck: 'Pending',
    error: null as any
  };

  try {
    // Force re-initialization
    if (force && getApps().length) {
        await Promise.all(getApps().map(app => deleteApp(app)));
        status.initialization = '♻️ Apps Deleted & Re-initializing';
    }

    // 1. Check Credentials Format
    let formattedKey = privateKey;
    if (formattedKey && formattedKey.includes('\\n')) {
        formattedKey = formattedKey.replace(/\\n/g, '\n');
    }

    // 2. Initialize
    if (!getApps().length) {
       if (!projectId || !clientEmail || !formattedKey) {
           throw new Error('Missing credentials. Check .env.local');
       }
       
       initializeApp({
         credential: cert({
           projectId,
           clientEmail,
           privateKey: formattedKey,
         })
       });
       status.initialization = '✅ Initialized New App';
    } else {
       status.initialization = '✅ Used Existing App';
    }

    // 3. Test Auth (The Real Test)
    const auth = getAuth();
    try {
        await auth.listUsers(1);
        status.authCheck = '✅ Success! Service Account is Valid.';
    } catch (authError: any) {
        status.authCheck = '❌ Failed to list users';
        throw authError;
    }
    
    return NextResponse.json(status, { status: 200 });

  } catch (error: any) {
    console.error('Debug Route Error:', error);
    status.error = {
        message: error.message,
        code: error.code || 'UNKNOWN',
        help: 'Verify FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local'
    };
    
    // Diagnostic tips
    if (status.checks.isEmailValidFormat === false) {
        status.error.tip = "Your FIREBASE_CLIENT_EMAIL doesn't look like a service account email. It should end with 'iam.gserviceaccount.com'.";
    }
    
    return NextResponse.json(status, { status: 500 });
  }
}
