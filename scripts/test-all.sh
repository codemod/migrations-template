#!/bin/bash

# Test JSSG codemods using Codemod CLI native features
set -e

echo "🧪 Testing JSSG codemods..."

# Find JSSG codemods (those with js-ast-grep in workflow.yaml)
find recipes -name "workflow.yaml" | while read -r workflow; do
    recipe_dir=$(dirname "$workflow")
    recipe_name=$(basename "$recipe_dir")
    
    # Check if it's a JSSG codemod
    if grep -q "js-ast-grep:" "$workflow"; then
        echo ""
        echo "📁 Testing JSSG codemod: $recipe_name..."
        
        # Validate workflow first
        echo "  ✅ Validating workflow..."
        npx codemod@latest workflow validate --workflow "$workflow"
        
        # Run JSSG tests
        echo "  🧪 Running JSSG tests..."
        js_file=$(grep "js_file:" "$workflow" | sed 's/.*js_file:\s*["'\'']*\([^"'\'']*\)["'\'']*.*/\1/' | tr -d ' ')
        language=$(grep "language:" "$workflow" | sed 's/.*language:\s*["'\'']*\([^"'\'']*\)["'\'']*.*/\1/' | tr -d ' ')
        if [ -z "$language" ]; then
            language="typescript"
        fi
        npx codemod@latest jssg test -l "$language" "$recipe_dir/$js_file" "$recipe_dir/tests"
        
        echo "  ✅ $recipe_name tests completed"
    fi
done

echo ""
echo "🎉 All JSSG codemod tests completed successfully!"