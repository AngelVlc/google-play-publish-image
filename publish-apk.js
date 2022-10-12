const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const fs = require('fs');

const aabPath = process.argv[2];
const packageName = process.argv[3];
const google_credentials_path = process.env.GOOGLE_APPLICATION_CREDENTIALS;

function checkArguments() {
  if (aabPath === undefined) {
    console.error('Missing argument with the apk path')
    process.exit(1);
  }

  if (!fs.existsSync(aabPath)) {
    console.error(`aab file '${aabPath}' doesn't exist`)
    process.exit(1);
  }

  if (packageName === undefined) {
    console.error('Missing argument with the app identifier')
    process.exit(1);
  }
}

function checkEnvironment() {
  if (google_credentials_path === undefined) {
    console.error("Missing environment variable 'GOOGLE_APPLICATION_CREDENTIALS'")
    process.exit(1);
  }

  if (!fs.existsSync(google_credentials_path)) {
    console.error(`Google api credentials file '${google_credentials_path}' doesn't exist`)
    process.exit(1);
  }
}

async function main() {
  // auth
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/androidpublisher'
  });

  // get the publisher
  const publisher = google.androidpublisher({
    version: 'v3',
    auth,
    params: {
      packageName
    }
  });

  // edit insert
  const insertResult = await publisher.edits.insert({
    packageName: packageName
  });
  const editId = insertResult.data.id;

  // upload apk
  const uploadApkResult = await publisher.edits.bundles.upload({
    packageName: packageName,
    editId: editId,
    media: {
      mimeType: 'application/octet-stream',
      body: fs.createReadStream(aabPath)
    }
  });

  if (
    uploadApkResult.data.versionCode === undefined ||
    uploadApkResult.data.versionCode === null
  ) {
    console.error('Bundle versionCode cannot be undefined or null')
    process.exit(1);
  }
  console.log('Apk uploaded:', uploadApkResult.data);

  // track update
  await publisher.edits.tracks.update({
    packageName: packageName,
    editId: editId,
    track: 'production',
    resource:   {
      track: 'production',
      releases: [
        {
          versionCodes: [
            uploadApkResult.data.versionCode
          ],
          releaseNotes: [
            {
              language: "es-ES",
              text: "Nueva versión"
            }
          ],
          status: "completed"
        }
      ]
    }
  });

  // edit commit
  const commitResult = await publisher.edits.commit({
    packageName: packageName,
    editId: editId,
    changesNotSentForReview: false
  });
  console.log('Result:', commitResult);
}

checkArguments();
checkEnvironment();

main().catch((error) => {
  console.error(error);
  process.exit(1);
});