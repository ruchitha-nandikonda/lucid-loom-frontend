# Gmail App Password Setup Guide

This guide will help you set up a Gmail App Password for sending OTP emails in Lucid Loom.

## Step-by-Step Instructions

### Step 1: Enable 2-Step Verification

1. Go to your [Google Account](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "How you sign in to Google", find **2-Step Verification**
4. If it's not enabled, click **Get started** and follow the prompts
5. You'll need to verify your phone number and set up 2-step verification

**Note:** App Passwords can only be created if 2-Step Verification is enabled.

### Step 2: Generate App Password

1. Still in the **Security** section of your Google Account
2. Scroll down to find **2-Step Verification** (you should see it's now "On")
3. Click on **2-Step Verification** to expand it
4. Scroll down and look for **App passwords** (you may need to search for it)
5. Click on **App passwords**
6. You may be asked to sign in again for security

### Step 3: Create the App Password

1. In the "App passwords" page, you'll see a dropdown for "Select app"
2. Choose **Mail** from the dropdown
3. In the "Select device" dropdown, choose **Other (Custom name)**
4. Type a name like "Lucid Loom" or "Dream App"
5. Click **Generate**
6. Google will display a 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 4: Copy the App Password

1. **Important:** Copy the entire 16-character password (including spaces, or remove spaces - both work)
2. This password will only be shown once, so make sure to copy it immediately
3. You can also click the copy icon if available

### Step 5: Configure Your .env File

1. Open your `.env` file in the `dream-backend/` directory
2. Add or update these lines:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=Lucid Loom
```

3. Replace:
   - `your_email@gmail.com` with your actual Gmail address
   - `abcdefghijklmnop` with the 16-character app password you just generated (you can remove spaces)

### Step 6: Test the Configuration

1. Restart your backend server
2. Try registering a new user
3. Check your email inbox for the OTP code
4. If you see errors in the backend logs, double-check:
   - The app password is correct (no extra spaces)
   - Your email address is correct
   - 2-Step Verification is enabled

## Quick Reference

**Direct Links:**
- [Google Account Security](https://myaccount.google.com/security)
- [App Passwords Page](https://myaccount.google.com/apppasswords)

**Common Issues:**

1. **"App passwords" option not showing:**
   - Make sure 2-Step Verification is enabled first
   - Try refreshing the page
   - Make sure you're using a personal Google account (not a Workspace account with admin restrictions)

2. **"Sign in with app password" error:**
   - Double-check the app password is correct
   - Make sure there are no extra spaces
   - Regenerate the app password if needed

3. **Email not sending:**
   - Check backend logs for error messages
   - Verify SMTP settings in .env file
   - Test with a different email provider if Gmail doesn't work

## Alternative: Using Other Email Providers

If you prefer not to use Gmail, you can use other email providers:

### Outlook/Hotmail:
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASSWORD=your_password
```

### Yahoo:
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASSWORD=your_app_password
```

### SendGrid (Recommended for Production):
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

## Security Best Practices

1. **Never commit your .env file** to version control
2. **Use different app passwords** for different applications
3. **Revoke app passwords** if you suspect they're compromised
4. **For production**, consider using a dedicated email service like SendGrid or Mailgun

## Need Help?

If you're still having issues:
1. Check the backend logs: `docker-compose logs backend` or check your terminal
2. Verify all environment variables are set correctly
3. Test the email configuration with a simple Python script
4. Check Google Account activity to see if login attempts are being blocked

