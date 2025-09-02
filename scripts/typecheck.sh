#!/bin/bash

# Simple typecheck using standard tsc
set -e

echo "🔍 Running TypeScript typecheck..."

# Check if we have any TypeScript files to check
if find utils -name "*.ts" -type f | grep -q .; then
    echo "  📁 Found TypeScript files in utils/"
    npx tsc --noEmit
    echo "  ✅ TypeScript compilation successful!"
else
    echo "  ℹ️  No TypeScript files found to typecheck"
fi

echo "🎉 Typecheck completed!"