#!/bin/bash

# Create a temporary directory for everything
TEMP_DIR="./temp-test"
PACK_DIR="$TEMP_DIR"

# Clean up any existing temp directory
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

echo "Setting up test environment in: $TEMP_DIR"
echo "================================"

# Step 1: Copy examples (following GitHub workflow line 184)
echo "Copying examples..."
rsync -rv --exclude=node_modules ./examples "$TEMP_DIR"
echo "✅ Examples copied"

echo ""
echo "Packing packages..."
echo "================================"

# Function to pack a package
pack_package() {
  local dir=$1
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    echo "Packing $dir"
    local abs_pack_dir=$(realpath "$PACK_DIR")
    pnpm pack --pack-destination "$abs_pack_dir" -C "$dir"
    if [ $? -eq 0 ]; then
      echo "✅ Successfully packed $dir"
    else
      echo "❌ Failed to pack $dir"
    fi
  else
    echo "⚠️  Skipping $dir, no package.json found"
  fi
}

# Step 2: Pack packages (following GitHub workflow lines 186-194)
for dir in packages/*; do
  if [ -d "$dir" ] && [ -f "$dir/package.json" ] && [[ ! "$dir" =~ autotool ]]; then
    pack_package "$dir"
  fi
done

# Step 3: Pack provider packages (following GitHub workflow lines 197-204)
for dir in packages/providers/* packages/providers/storage/* packages/workflow; do
  pack_package "$dir"
done

echo ""
echo "Installing packages..."
echo "================================"

# Step 4: Install packages (following GitHub workflow lines 206-207)
cd "$TEMP_DIR/examples"
echo "Installing packed packages with npm..."
npm add ../*.tgz

if [ $? -eq 0 ]; then
  echo "✅ All packages installed successfully!"
  
  echo ""
  echo "Running Type Check..."
  echo "================================"
  
  # Step 5: Run type check (following GitHub workflow lines 209-210)
  npx tsc --project ./tsconfig.json
  
  if [ $? -eq 0 ]; then
    echo "✅ Type check passed!"
  else
    echo "❌ Type check failed"
  fi
  
else
  echo "❌ Failed to install packages"
fi

echo ""
echo "Test environment ready at: $TEMP_DIR/examples"
echo "You can now:"
echo "  cd $TEMP_DIR/examples"
echo "  npx tsx <path-to-example>.ts"


---

@llamaindex/core
- parse/safe-parse dynamic schemas from user (can be zod schema v3 or zod schema v4)
- convert zod schema to json schema

@llamaindex/zod-to-json-schema
- the original zod-to-json-schema requires zod 3.24 as peer dependency, therefore it doesn't work if user install zod 4.x in their project
- this package fork from zod-to-json-schema and make zod-to-json-schema can also use zod 4.x as peer dependency
- note that, zod-to-json-schema only support convert zod schema v3 to json schema (for zod schema v4, use navite z4.toJSONSchema)




import * as zod3 from "zod/v3";
import * as zod4 from "zod/v4";

const s1 = tool({
  name: "sumNumbers",
  description: "Use this function to sum two numbers",
  parameters: zod3.object({
    a: zod3.number().describe("The first number"),
    b: zod3.number().describe("The second number"),
  }),
  execute: ({ a, b }) => `${a * 2 + b}`,
});
s1.call({ a: 1, b: 2 });

const s2 = tool({
  name: "sumNumbers",
  description: "Use this function to sum two numbers",
  parameters: zod4.object({
    a: zod4.number().describe("The first number"),
    b: zod4.number().describe("The second number"),
  }),
  execute: ({ a, b }) => `${a * 2 + b}`,
});
s2.call({ a: 1, b: 2 });

const s3 = tool((input) => input.a * 2 + input.b, {
  name: "sum",
  description: "sum two numbers",
  parameters: zod3.object({ a: zod3.number(), b: zod3.number() }), // v3
});
s3.call({ a: 1, b: 2 });

const s4 = tool((input) => input.a * 2 + input.b, {
  name: "sum",
  description: "sum two numbers",
  parameters: zod4.object({ a: zod4.number(), b: zod4.number() }), // v3
});
s4.call({ a: 1, b: 2 });



 WARN  Issues with peer dependencies found
apps/next
├─┬ @number-flow/react 0.3.5
│ └── ✕ unmet peer react-dom@^18: found 19.1.0
└─┬ tree-sitter-typescript 0.23.2
  ├── ✕ unmet peer tree-sitter@^0.21.0: found 0.22.4
  └─┬ tree-sitter-javascript 0.23.1
    └── ✕ unmet peer tree-sitter@^0.21.1: found 0.22.4

e2e/examples/nextjs-agent
└─┬ ai 4.3.17
  ├── ✕ unmet peer zod@^3.23.8: found 4.1.5
  ├─┬ @ai-sdk/provider-utils 2.2.8
  │ └── ✕ unmet peer zod@^3.23.8: found 4.1.5
  └─┬ @ai-sdk/react 1.2.12
    ├── ✕ unmet peer zod@^3.23.8: found 4.1.5
    └─┬ @ai-sdk/ui-utils 1.2.11
      ├── ✕ unmet peer zod@^3.23.8: found 4.1.5
      └─┬ zod-to-json-schema 3.24.6
        └── ✕ unmet peer zod@^3.24.1: found 4.1.5

e2e/examples/waku-query-engine
└─┬ waku 0.22.2
  ├── ✕ unmet peer react@~19.1.0: found 19.0.0