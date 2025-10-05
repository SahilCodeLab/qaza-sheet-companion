# Google Sheets Backend Setup Guide

This guide will help you set up the Google Sheets backend for your Namaz & Qaza Tracker app.

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Namaz Tracker Database"
4. Create a sheet named **AllUsersLogs** with the following columns:

| Gmail | Name | Age | Gender | Date | Prayer | Status | Reason | PeriodDay | Timestamp | MissedNamazCount |
|-------|------|-----|--------|------|--------|--------|--------|-----------|-----------|------------------|

## Step 2: Create Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. Copy and paste the following code:

```javascript
// Google Apps Script Backend for Namaz Tracker
const SHEET_NAME = 'AllUsersLogs';

function doGet(e) {
  const action = e.parameter.action;
  const gmail = e.parameter.gmail;
  
  try {
    if (action === 'getUser') {
      return getUserData(gmail);
    } else if (action === 'getUserLogs') {
      return getUserLogs(gmail);
    } else if (action === 'getUserStats') {
      return getUserStats(gmail);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Invalid action' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'createUser') {
      return createUser(data);
    } else if (action === 'logPrayer') {
      return logPrayer(data);
    } else if (action === 'updateQaza') {
      return updateQazaCount(data);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Invalid action' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getUserData(gmail) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === gmail) {
      const user = {
        gmail: data[i][0],
        name: data[i][1],
        age: data[i][2],
        gender: data[i][3]
      };
      return ContentService.createTextOutput(
        JSON.stringify({ user: user })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({ user: null })
  ).setMimeType(ContentService.MimeType.JSON);
}

function createUser(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const newRow = [
    data.gmail,
    data.name,
    data.age,
    data.gender,
    new Date().toISOString().split('T')[0],
    'Initial Setup',
    'new_user',
    '',
    false,
    new Date().toISOString(),
    0
  ];
  
  sheet.appendRow(newRow);
  
  return ContentService.createTextOutput(
    JSON.stringify({ success: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

function logPrayer(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const newRow = [
    data.gmail,
    data.name,
    data.age,
    data.gender,
    data.date,
    data.prayer,
    data.status,
    data.reason || '',
    data.periodDay || false,
    data.timestamp,
    data.missedNamazCount || 0
  ];
  
  sheet.appendRow(newRow);
  
  return ContentService.createTextOutput(
    JSON.stringify({ success: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

function getUserLogs(gmail) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const logs = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === gmail && data[i][5] !== 'Initial Setup') {
      logs.push({
        gmail: data[i][0],
        name: data[i][1],
        age: data[i][2],
        gender: data[i][3],
        date: data[i][4],
        prayer: data[i][5],
        status: data[i][6],
        reason: data[i][7],
        periodDay: data[i][8],
        timestamp: data[i][9],
        missedNamazCount: data[i][10]
      });
    }
  }
  
  // Sort by date, most recent first
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return ContentService.createTextOutput(
    JSON.stringify({ logs: logs })
  ).setMimeType(ContentService.MimeType.JSON);
}

function getUserStats(gmail) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  let totalMissed = 0;
  let completed = 0;
  let periodDays = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === gmail) {
      if (data[i][8] === true || data[i][8] === 'TRUE') {
        periodDays++;
      } else if (data[i][6] === 'missed') {
        totalMissed++;
      } else if (data[i][6] === 'completed') {
        completed++;
      }
      
      // Include stored Qaza count
      if (data[i][10] && data[i][10] > 0) {
        totalMissed += parseInt(data[i][10]);
      }
    }
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({ 
      stats: { 
        totalMissed: totalMissed, 
        completed: completed, 
        periodDays: periodDays 
      } 
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function updateQazaCount(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const newRow = [
    data.gmail,
    '',
    '',
    '',
    new Date().toISOString().split('T')[0],
    'Qaza Calculation',
    'calculated',
    'From Qaza Calculator',
    false,
    new Date().toISOString(),
    data.count
  ];
  
  sheet.appendRow(newRow);
  
  return ContentService.createTextOutput(
    JSON.stringify({ success: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

## Step 3: Deploy Apps Script

1. Click **Deploy > New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Fill in the details:
   - **Description**: "Namaz Tracker API"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
4. Click **Deploy**
5. Copy the **Web app URL** - you'll need this!

## Step 4: Update Frontend

1. Open `src/lib/api.ts` in your code
2. Replace `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` with your actual Web App URL:

```typescript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

## Step 5: Test the Integration

1. Sign up with a test Gmail account
2. Try logging a prayer
3. Check your Google Sheet - you should see the data appear!

## Troubleshooting

### Error: "Script function not found"
- Make sure you saved the Apps Script code
- Redeploy the web app

### Error: "Permission denied"
- Make sure "Who has access" is set to "Anyone"
- Try redeploying

### Data not appearing in sheet
- Check the browser console for errors
- Verify the Apps Script URL is correct
- Make sure the sheet name is exactly "AllUsersLogs"

## Security Notes

- This setup uses Gmail as the unique identifier (no passwords)
- The Apps Script runs under your Google account
- Anyone with the URL can access the API
- For production, consider adding authentication tokens

## Next Steps

Once you have the backend working:
1. Test all features (signup, login, prayer logging, Qaza calculator)
2. Add more users and test data isolation
3. Consider adding email notifications
4. Deploy your frontend to Vercel/Netlify

Need help? Check the [Lovable docs](https://docs.lovable.dev) or join our Discord!
