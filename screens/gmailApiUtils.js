import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GmailService } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  webClientId: 'YOUR_WEB_CLIENT_ID',
});

export const fetchGmailEvents = async () => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (!isSignedIn) {
      await GoogleSignin.signIn();
    }

    const { accessToken } = await GoogleSignin.getTokens();
    const gmailService = new GmailService(accessToken);

    const response = await gmailService.users.messages.list({
      userId: 'me',
      q: 'category:primary',
      maxResults: 50,
    });

    const events = [];
    for (const message of response.messages) {
      const fullMessage = await gmailService.users.messages.get({
        userId: 'me',
        id: message.id,
      });

      const subject = fullMessage.payload.headers.find(
        header => header.name.toLowerCase() === 'subject'
      )?.value;

      const date = extractDateFromEmail(fullMessage);

      if (date) {
        events.push({
          id: message.id,
          title: subject || 'Untitled Event',
          date: date,
        });
      }
    }

    return events;
  } catch (error) {
    console.error('Error fetching Gmail events:', error);
    throw error;
  }
};

const extractDateFromEmail = (email) => {
  // This is a simple date extraction logic. You might need to enhance this
  // based on the structure of the emails you're parsing.
  const dateRegex = /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/;
  const body = email.payload.parts?.[0]?.body?.data || '';
  const decodedBody = atob(body.replace(/-/g, '+').replace(/_/g, '/'));

  const match = decodedBody.match(dateRegex);
  if (match) {
    return new Date(match[3], match[2] - 1, match[1]);
  }

  return null;
};

export const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    console.log('User signed out of Google');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};