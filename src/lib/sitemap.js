import connectDB from "../app/lib/db";
import BLOG from "../app/models/blog";

export async function generateSitemap() {
    try {
        await connectDB();

        // Get all published blogs
        const blogs = await BLOG.find({ status: "published" })
            .select("slug updatedAt createdAt image")
            .sort({ updatedAt: -1 });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gujarat.taxi";
        const currentDate = new Date().toISOString();

        // Start building XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

        // Add homepage
        xml += `  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

        // Add blogs page
        xml += `  <url>
    <loc>${baseUrl}/blogs</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

        // Add each blog post
        blogs.forEach((blog) => {
            const lastmod = blog.updatedAt 
                ? new Date(blog.updatedAt).toISOString()
                : blog.createdAt 
                ? new Date(blog.createdAt).toISOString()
                : currentDate;

            xml += `  <url>
    <loc>${baseUrl}/blogs/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;

            // Add image if exists
            if (blog.image) {
                xml += `
    <image:image>
      <image:loc>${blog.image}</image:loc>
    </image:image>`;
            }

            xml += `
  </url>
`;
        });

        xml += `</urlset>`;

        return xml;
    } catch (error) {
        console.error("Error generating sitemap:", error);
        throw error;
    }
}

















