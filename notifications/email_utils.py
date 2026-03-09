from django.core.mail import send_mail
from django.conf import settings


def send_email(subject, message, recipient_list):
    """
    Generic email sender utility
    """

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print("Email Error:", e)
        return False