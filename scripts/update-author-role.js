import mongoose from "mongoose";
import Role from "../src/app/models/role.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables from .env.local or .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

function loadEnv() {
  try {
    const envFiles = [".env.local", ".env"];
    for (const envFile of envFiles) {
      const envPath = join(rootDir, envFile);
      try {
        const envContent = readFileSync(envPath, "utf-8");
        envContent.split("\n").forEach((line) => {
          const match = line.match(/^([^=:#]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        });
        break;
      } catch (e) {
        // File doesn't exist, continue
      }
    }
  } catch (error) {
    console.error("Error loading .env file:", error);
  }
}

loadEnv();

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("❌ MONGO_URL not found in environment variables");
  process.exit(1);
}

async function updateAuthorRole() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Find Author role
    const authorRole = await Role.findOne({ slug: "author" });

    if (!authorRole) {
      console.log("❌ Author role not found");
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log("📝 Updating Author role permissions...");

    // Update Author role to match Editor permissions
    authorRole.permissions = {
      canCreateBlog: true,
      canEditBlog: true,
      canDeleteBlog: true,
      canPublishBlog: true,
      canCreateUser: false,
      canEditUser: false,
      canDeleteUser: false,
      canAssignRole: false,
      canManageCategories: true,
      canManageTags: true,
      canManageMedia: true,
      canManageRoutes: true,
      canManageCities: true,
      canManageAirports: true,
      canManageSEO: false,
      canViewBookings: true,
      canManageBookings: false,
      canManageSettings: false,
      canViewAuditLogs: false,
    };

    authorRole.description = "Content creation and editing (same as Editor)";
    await authorRole.save();

    console.log("\n✅ Author role updated successfully!");
    console.log("   New permissions:");
    console.log("   - Can Create Blog: ✓");
    console.log("   - Can Edit Blog: ✓");
    console.log("   - Can Delete Blog: ✓");
    console.log("   - Can Publish Blog: ✓");
    console.log("   - Can Manage Categories: ✓");
    console.log("   - Can Manage Tags: ✓");
    console.log("   - Can Manage Routes: ✓");
    console.log("   - Can Manage Cities: ✓");
    console.log("   - Can Manage Airports: ✓");
    console.log("   - Can View Bookings: ✓");

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateAuthorRole();

