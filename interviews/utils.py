import uuid


def generate_meeting_link():

    meeting_id = uuid.uuid4().hex[:10]

    return f"https://meet.google.com/{meeting_id}"