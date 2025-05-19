#!/bin/sh
set -e

echo "Installing dependencies..."
pip install --no-cache-dir -r requirements.txt

echo "Starting Flask server..."
exec flask run --host=0.0.0.0 --port=$PORT --reload --debug