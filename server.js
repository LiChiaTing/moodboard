const BoxSDK = require('box-node-sdk').default || require('box-node-sdk');
const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
require('dotenv').config();

const app = express();
app.use(express.json());

const sdk = new BoxSDK({
  clientID: process.env.BOX_CLIENT_ID,
  clientSecret: process.env.BOX_CLIENT_SECRET,
});

let boxClient = null;

async function createSessionFolder(sessionId) {
  let rootFolderId;
  try {
    const root = await boxClient.folders.create('0', 'RoomTransformer');
    rootFolderId = root.id;
  } catch (err) {
    const items = await boxClient.folders.getItems('0');
    const existing = items.entries.find(f => f.name === 'RoomTransformer');
    rootFolderId = existing.id;
  }
  const sessionFolder = await boxClient.folders.create(rootFolderId, `session_${sessionId}`);
  const photosFolder = await boxClient.folders.create(sessionFolder.id, 'photos');
  const outputFolder = await boxClient.folders.create(sessionFolder.id, 'output');
  return {
    sessionFolderId: sessionFolder.id,
    photosFolderId: photosFolder.id,
    outputFolderId: outputFolder.id,
  };
}

app.get('/auth', (req, res) => {
  const authorizeURL = sdk.getAuthorizeURL({
    response_type: 'code',
    redirect_uri: process.env.BOX_REDIRECT_URI,
  });
  res.redirect(authorizeURL);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code received from Box.');
  try {
    const tokenInfo = await sdk.getTokensAuthorizationCodeGrant(code, null);
    boxClient = sdk.getPersistentClient(tokenInfo);
    const user = await boxClient.users.get('me');
    console.log('Connected as:', user.name, user.login);
    res.send(`<h2>Box connected!</h2><p>Logged in as: <strong>${user.name}</strong></p><p>You can close this tab.</p>`);
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(500).send(`Auth failed: ${err.message}`);
  }
});

app.get('/status', (req, res) => {
  res.json({ connected: boxClient !== null });
});

app.get('/test-folder', async (req, res) => {
  try {
    const folders = await createSessionFolder('test123');
    res.json({ success: true, folders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/upload', upload.array('photos', 10), async (req, res) => {
  if (!boxClient) return res.status(401).json({ error: 'Box not connected. Visit /auth first.' });
  const sessionId = req.body.sessionId || `session_${Date.now()}`;
  try {
    const folders = await createSessionFolder(sessionId);
    const uploadedFiles = [];
    for (const file of req.files) {
      const uploaded = await boxClient.files.uploadFile(
        folders.photosFolderId,
        file.originalname,
        file.buffer
      );
      uploadedFiles.push({ fileId: uploaded.entries[0].id, name: file.originalname });
    }
    res.json({ success: true, sessionId, folders, files: uploadedFiles });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/session/:sessionId/moodboard', upload.single('pdf'), async (req, res) => {
  if (!boxClient) return res.status(401).json({ error: 'Box not connected. Visit /auth first.' });
  const { sessionId } = req.params;
  try {
    const rootItems = await boxClient.folders.getItems('0');
    const rootFolder = rootItems.entries.find(f => f.name === 'RoomTransformer');
    const sessionItems = await boxClient.folders.getItems(rootFolder.id);
    const sessionFolder = sessionItems.entries.find(f => f.name === `session_${sessionId}`);
    const subfolders = await boxClient.folders.getItems(sessionFolder.id);
    const outputFolder = subfolders.entries.find(f => f.name === 'output');
    const uploaded = await boxClient.files.uploadFile(
      outputFolder.id,
      `moodboard_${sessionId}.pdf`,
      req.file.buffer
    );
    const fileId = uploaded.entries[0].id;
    const sharedFile = await boxClient.files.update(fileId, {
      shared_link: { access: 'open', permissions: { can_download: true } }
    });
    res.json({
      success: true,
      fileId,
      downloadUrl: sharedFile.shared_link.download_url,
      viewUrl: sharedFile.shared_link.url,
    });
  } catch (err) {
    console.error('Moodboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
  console.log('Visit http://localhost:3000/auth to connect Box');
});