import smtplib
from email.mime.text import MIMEText

from flask import jsonify


def send_email(receiver_email, subject, message):
    sender_email = 'hamzathdeveloper@gmail.com'
    sender_password = 'hswv kvkt ofaw mjkr'
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()  # Upgrade to secure connection
        server.login(sender_email, sender_password)

        msg = MIMEText(message)
        msg['Subject'] = subject
        msg['From'] = sender_email
        msg['To'] = receiver_email

        server.sendmail(sender_email, receiver_email, msg.as_string())
        print("Email sent successfully!")
        return jsonify(
            {'message': 'Registration successful. Please check your email for the verification code.'}), 201
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'error': 'Error sending email'}), 500
    finally:
        if server:
            server.quit()
