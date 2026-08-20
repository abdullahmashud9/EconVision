/**
 * EconVision - Google Apps Script Backend for Member Registration
 * 
 * ============================================================================
 * SETUP INSTRUCTIONS:
 * ============================================================================
 * 1. Open Google Sheets (https://sheets.google.com) and create or open a sheet.
 * 2. In Google Sheets, navigate to: Extensions > Apps Script
 * 3. Delete any code in Code.gs and paste this entire script.
 * 4. Click the "Save" icon (or Ctrl+S).
 * 5. Click "Deploy" (top right) > "New deployment".
 * 6. Under "Select type", choose "Web app".
 * 7. Set configuration:
 *    - Description: "EconVision Registration Endpoint"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (IMPORTANT: allows public form submission)
 * 8. Click "Deploy".
 * 9. Authorize the requested Google permissions.
 * 10. Copy the generated "Web App URL" (starts with https://script.google.com/macros/s/...)
 * 11. Paste that URL into `js/main.js` at `const GOOGLE_SHEET_WEB_APP_URL = "..."`.
 * ============================================================================
 */

function doPost(e) {
  // Use ScriptLock to prevent concurrency collisions from multiple submissions
  var lock = LockService.getScriptLock();
  lock.tryLock(30000); // Wait up to 30 seconds

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // If the spreadsheet is empty, automatically create and style the header row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Full Name",
        "Email",
        "Contact Number",
        "Country",
        "Profession / Role",
        "Institutional Affiliation",
        "Why EconVision"
      ]);

      // Format header row with EconVision Navy and bold white text
      var headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setBackground("#132B3E");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setFontFamily("Arial");
      sheet.setFrozenRows(1);
    }

    // Extract payload from POST body (supports JSON payload, FormData, or URLSearchParams)
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    // Extract fields
    var timestamp = new Date();
    var fullName = data.fullName || data.name || "";
    var email = data.email || "";
    var phone = data.phone || data.contact || "";
    var country = data.country || "";
    var profession = data.profession || "";
    var affiliation = data.affiliation || "";
    var whyEconVision = data.whyEconVision || data.why || "";

    // Append new row to active sheet
    sheet.appendRow([
      timestamp,
      fullName,
      email,
      phone,
      country,
      profession,
      affiliation,
      whyEconVision
    ]);

    // Return CORS-friendly JSON success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Registration recorded successfully",
        row: sheet.getLastRow()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return JSON error response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "active",
      message: "EconVision Google Apps Script Web App is active and ready for registration POST requests."
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
