#!/bin/bash
# Don't use set -e here, we want to handle errors gracefully

echo "Waiting for PostgreSQL..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 0.1
done
echo "PostgreSQL started"

echo "Running migrations..."
# Check for migration conflicts first
if python manage.py migrate --noinput 2>&1 | grep -q "Conflicting migrations detected"; then
    echo "Migration conflicts detected. Attempting to merge..."
    if python manage.py makemigrations --merge --noinput; then
        echo "Migration merge completed"
    else
        echo "Warning: Could not auto-merge migrations. Manual intervention may be required."
    fi
fi

# Run migrations (skip iam_db if configured but not accessible)
# Only migrate the default database to avoid connection errors with external IAM database
if python manage.py migrate --noinput --database=default; then
    echo "Migrations completed successfully"
else
    echo "Error: Migrations failed"
    echo "Attempting to show migration status..."
    python manage.py showmigrations
    exit 1
fi

echo "Collecting static files..."
# Create staticfiles directory if it doesn't exist
mkdir -p /app/staticfiles

# Collect static files (non-critical, continue if it fails)
if python manage.py collectstatic --noinput --clear 2>&1; then
    echo "Static files collected successfully"
else
    echo "Warning: collectstatic had issues, but continuing..."
    # Ensure directory exists even if collectstatic failed
    mkdir -p /app/staticfiles
fi

echo "Starting server..."
exec "$@"