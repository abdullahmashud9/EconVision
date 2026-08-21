/**
 * EconVision - Unified Google Apps Script Backend
 * Handles both Member Registrations (join.html) & Academic Inquiries (contact.html)
 * 
 * ============================================================================
 * STEP-BY-STEP SETUP INSTRUCTIONS:
 * ============================================================================
 * 1. Open Google Sheets (https://sheets.google.com) and create a new spreadsheet.
 *    - Name it: "EconVision Portal Database"
 * 2. In the top menu, click: Extensions > Apps Script
 * 3. Delete all code in the editor (Code.gs) and paste this ENTIRE script.
 * 4. Click the "Save" icon (💾) or press Ctrl+S.
 * 5. In the top right, click "Deploy" > "New deployment".
 * 6. Click the gear icon (⚙️) next to "Select type" and choose "Web app".
 * 7. Configure deployment settings:
 *    - Description: "EconVision Registrations & Inquiries API"
 *    - Execute as: "Me (your Google account)"
 *    - Who has access: "Anyone" (⚠️ IMPORTANT: Allows website form submissions)
 * 8. Click "Deploy".
 * 9. Click "Authorize access" and log in with your Google account.
 *    - If Google shows "Google hasn't verified this app", click "Advanced" > "Go to Untitled project (unsafe)" > "Allow".
 * 10. Copy the generated "Web app URL" (starts with https://script.google.com/macros/s/...)
 * 11. Open `js/main.js` on line 151 and set:
 *     const GOOGLE_SHEET_WEB_APP_URL = "YOUR_COPIED_URL_HERE";
 * ============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000); // Wait up to 30 seconds to prevent concurrent write collisions

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Parse payload from POST request
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

    var timestamp = new Date();
    var submissionType = data.type || (data.inquiryType || data.message ? "inquiry" : "registration");

    // ========================================================================
    // CASE A: Academic Inquiry Submission (from contact.html)
    // ========================================================================
    if (submissionType === "inquiry") {
      var inquirySheet = ss.getSheetByName("Inquiries");
      if (!inquirySheet) {
        inquirySheet = ss.insertSheet("Inquiries");
      }

      // Initialize headers if sheet is empty
      if (inquirySheet.getLastRow() === 0) {
        inquirySheet.appendRow([
          "Timestamp",
          "Full Name",
          "Institutional Affiliation",
          "Email Address",
          "Inquiry Type",
          "Message Content"
        ]);

        var inqHeader = inquirySheet.getRange(1, 1, 1, 6);
        inqHeader.setBackground("#6EA35D"); // EconVision Green
        inqHeader.setFontColor("#FFFFFF");
        inqHeader.setFontWeight("bold");
        inqHeader.setFontFamily("Arial");
        inquirySheet.setFrozenRows(1);
      }

      var inqName = data.fullName || data.name || "";
      var inqAffiliation = data.affiliation || "";
      var inqEmail = data.email || "";
      var inqType = data.inquiryType || "General";
      var inqMessage = data.message || "";

      inquirySheet.appendRow([
        timestamp,
        inqName,
        inqAffiliation,
        inqEmail,
        inqType,
        inqMessage
      ]);

      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          type: "inquiry",
          message: "Academic inquiry recorded successfully in Google Sheets",
          row: inquirySheet.getLastRow()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ========================================================================
    // CASE B: Member Registration Submission (from join.html)
    // ========================================================================
    var regSheet = ss.getSheetByName("Registrations");
    if (!regSheet) {
      regSheet = ss.insertSheet("Registrations");
    }

    // Initialize headers if sheet is empty
    if (regSheet.getLastRow() === 0) {
      regSheet.appendRow([
        "Timestamp",
        "Full Name",
        "Email",
        "Contact Number",
        "Country",
        "Profession / Role",
        "Institutional Affiliation",
        "Why EconVision"
      ]);

      var regHeader = regSheet.getRange(1, 1, 1, 8);
      regHeader.setBackground("#132B3E"); // EconVision Navy
      regHeader.setFontColor("#FFFFFF");
      regHeader.setFontWeight("bold");
      regHeader.setFontFamily("Arial");
      regSheet.setFrozenRows(1);
    }

    var fullName = data.fullName || data.name || "";
    var email = data.email || "";
    var phone = data.phone || data.contact || "";
    var country = data.country || "";
    var profession = data.profession || "";
    var affiliation = data.affiliation || "";
    var whyEconVision = data.whyEconVision || data.why || "";

    regSheet.appendRow([
      timestamp,
      fullName,
      email,
      phone,
      country,
      profession,
      affiliation,
      whyEconVision
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "registration",
        message: "Membership registration recorded successfully in Google Sheets",
        row: regSheet.getLastRow()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
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
      message: "EconVision Google Apps Script Web App is active and ready to receive Registration and Inquiry submissions."
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
