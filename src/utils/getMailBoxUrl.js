module.exports = function getMailboxUrl(email) {
    let domain = email.split('@')[1].toLowerCase();
    const urls = {
        "gmail.com": "https://mail.google.com/mail/u/0/#inbox",
        "yahoo.com": "https://mail.yahoo.com",
        "outlook.com": "https://outlook.live.com/mail/inbox",
        "hotmail.com": "https://outlook.live.com/mail/inbox",
        "icloud.com": "https://www.icloud.com/mail",
        "zoho.com": "https://mail.zoho.com"
    };
    return urls[domain] || "#";
}