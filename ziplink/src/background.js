console.log('Background script loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  if (message.type === 'SHORTEN_URL') {
    shortenUrl(message.url)
      .then(data => {
        console.log('Success:', data);
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('Error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

async function shortenUrl(url) {
  try {
    const response = await fetch('https://web-ashen-psi.vercel.app/api/ziplink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error('Failed to shorten URL');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error shortening URL:', error);
    throw error;
  }
}