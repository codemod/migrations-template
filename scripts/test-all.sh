#!/bin/bash

# Test all codemods using Codemod CLI native features where possible
set -e

echo "🧪 Testing all codemods..."

# Find all workflow.yaml files in recipes
find recipes -name "workflow.yaml" | while read -r workflow; do
    recipe_dir=$(dirname "$workflow")
    recipe_name=$(basename "$recipe_dir")
    
    echo ""
    echo "📁 Testing $recipe_name..."
    
    # Always validate workflow first
    echo "  ✅ Validating workflow..."
    npx codemod@latest workflow validate --workflow "$workflow"
    
    # Check if it's a JSSG codemod
    if grep -q "js-ast-grep:" "$workflow"; then
        echo "  🧪 Running JSSG tests..."
        js_file=$(grep "js_file:" "$workflow" | sed 's/.*js_file:\s*["'\'']*\([^"'\'']*\)["'\'']*.*/\1/' | tr -d ' ')
        language=$(grep "language:" "$workflow" | sed 's/.*language:\s*["'\'']*\([^"'\'']*\)["'\'']*.*/\1/' | tr -d ' ')
        if [ -z "$language" ]; then
            language="typescript"
        fi
        npx codemod@latest jssg test -l "$language" "$recipe_dir/$js_file" "$recipe_dir/tests"
    else
        # For AST-grep and shell codemods, test by comparing input/expected files
        echo "  🧪 Running non-native tests..."
        
        # Check for input/expected test files
        if [ -d "$recipe_dir/tests/input" ] && [ -d "$recipe_dir/tests/expected" ]; then
            for input_file in "$recipe_dir/tests/input"/*; do
                if [ -f "$input_file" ]; then
                    filename=$(basename "$input_file")
                    expected_file="$recipe_dir/tests/expected/$filename"
                    
                    if [ ! -f "$expected_file" ]; then
                        echo "  ❌ Missing expected file for $filename"
                        exit 1
                    fi
                    
                    # Compare input with expected
                    if ! diff -u "$input_file" "$expected_file" > /dev/null; then
                        echo "  ❌ Test failed for $filename"
                        echo "  --- Diff ---"
                        diff -u "$input_file" "$expected_file" || true
                        exit 1
                    else
                        echo "  ✅ Test passed for $filename"
                    fi
                fi
            done
        elif [ -d "$recipe_dir/tests/fixtures" ]; then
            input_file="$recipe_dir/tests/fixtures/input.js"
            expected_file="$recipe_dir/tests/fixtures/expected.js"
            
            if [ ! -f "$expected_file" ]; then
                echo "  ❌ Missing expected.js"
                exit 1
            fi
            
            # Compare input with expected
            if ! diff -u "$input_file" "$expected_file" > /dev/null; then
                echo "  ❌ Test failed"
                echo "  --- Diff ---"
                diff -u "$input_file" "$expected_file" || true
                exit 1
            else
                echo "  ✅ Test passed"
            fi
        else
            echo "  ⚠️  No tests found"
        fi
    fi
    
    echo "  ✅ $recipe_name tests completed"
done

echo ""
echo "🎉 All tests completed successfully!"