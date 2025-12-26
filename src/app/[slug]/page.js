"use client";

import Header_Components from "@/components/common_components/Header_components";
import Footer_Components from "@/components/common_components/Footer_components";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

export default function SlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const [content, setContent] = useState(null);
  const [contentType, setContentType] = useState(null); // 'route', 'city', 'airport', or 'blog'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFAQIndex, setOpenFAQIndex] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        
        // First, try to find in routes
        try {
          const routeRes = await fetch(`/api/routes/slug/${slug}`);
          const routeData = await routeRes.json();
          if (routeData.success && routeData.route) {
            setContent(routeData.route);
            setContentType('route');
            setLoading(false);
            return;
          }
        } catch (e) {
          // Continue to next check
        }

        // Try to find in cities
        try {
          const cityRes = await fetch(`/api/cities/slug/${slug}`);
          const cityData = await cityRes.json();
          if (cityData.success && cityData.city) {
            setContent(cityData.city);
            setContentType('city');
            setLoading(false);
            return;
          }
        } catch (e) {
          // Continue to next check
        }

        // Try to find in airports
        try {
          const airportRes = await fetch(`/api/airports/slug/${slug}`);
          const airportData = await airportRes.json();
          if (airportData.success && airportData.airport) {
            setContent(airportData.airport);
            setContentType('airport');
            setLoading(false);
            return;
          }
        } catch (e) {
          // Continue to next check
        }

        // If not found in routes/cities/airports, check if it's a blog
        try {
          const blogRes = await fetch(`/api/blogs/slug/${slug}`);
          const blogData = await blogRes.json();
          if (blogData.success && blogData.blog) {
            // It's a blog, redirect to /blog/slug
            router.push(`/blog/${slug}`);
            return;
          }
        } catch (e) {
          // Not a blog either
        }
        
        // Not found anywhere
        setError("Content not found");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching content:", err);
        setError("Failed to load content");
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug, router]);

  // Wrap tables in scrollable containers for mobile
  useEffect(() => {
    if (!contentRef.current || !content?.blog) return;

    const wrapTables = () => {
      const contentDiv = contentRef.current;
      if (!contentDiv) return;

      const tables = contentDiv.querySelectorAll("table");

      tables.forEach((table) => {
        if (table.parentElement?.classList.contains("table-scroll-wrapper")) {
          return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "table-scroll-wrapper";
        wrapper.style.cssText = `
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          -webkit-overflow-scrolling: touch !important;
          margin: 1.5rem 0 !important;
          position: relative !important;
          display: block !important;
          scrollbar-width: auto !important;
          scrollbar-color: #f97316 #e5e7eb !important;
          -ms-overflow-style: scrollbar !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          padding: 12px 0 !important;
          background: #fafafa !important;
        `;

        const containerWidth = contentDiv.offsetWidth || window.innerWidth;
        const minTableWidth = Math.max(600, containerWidth + 100);

        table.style.minWidth = `${minTableWidth}px`;
        table.style.margin = "0";
        table.style.width = "auto";
        table.style.maxWidth = "none";
        table.style.display = "table";

        const parent = table.parentNode;
        if (parent) {
          parent.insertBefore(wrapper, table);
          wrapper.appendChild(table);
        }
      });
    };

    wrapTables();

    const timeoutId1 = setTimeout(wrapTables, 100);
    const timeoutId2 = setTimeout(wrapTables, 500);

    const observer = new MutationObserver(() => {
      setTimeout(wrapTables, 50);
    });
    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      observer.disconnect();
    };
  }, [content]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Header_Components />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium text-lg">Loading...</p>
          </div>
        </div>
        <Footer_Components />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Header_Components />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Content Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "The content you're looking for doesn't exist."}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>
          </div>
        </div>
        <Footer_Components />
      </div>
    );
  }

  const blog = content.blog;
  const backLink = contentType === 'route' ? '/routes' : contentType === 'city' ? '/cities' : '/airports';
  const backText = contentType === 'route' ? 'Back to Routes' : contentType === 'city' ? 'Back to Cities' : 'Back to Airports';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-x-hidden">
      <Header_Components />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 overflow-x-hidden">
        {/* Back Button */}
        <Link
          href={backLink}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-600 mb-8 transition-colors font-semibold group"
        >
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <ArrowLeft size={18} className="text-blue-600" />
          </div>
          <span>{backText}</span>
        </Link>

        {/* Content Info */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-xl p-6 md:p-8 mb-8 border-2 border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-3">
            {content.name}
          </h1>
          {contentType === 'route' && (
            <p className="text-lg text-gray-700 font-medium">
              {content.from} → {content.to}
            </p>
          )}
          {contentType === 'airport' && (
            <p className="text-lg text-gray-700 font-medium">
              {content.from} → {content.to}
            </p>
          )}
        </div>

        {/* Blog Content */}
        {blog ? (
          <article className="bg-white rounded-2xl shadow-xl overflow-visible md:overflow-hidden border-2 border-blue-100 relative group hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            {blog.image && (
              <div className="w-full rounded-t-2xl overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="object-cover w-full h-auto"
                />
              </div>
            )}

            <div className="p-6 md:p-10 overflow-visible md:overflow-hidden">
              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-4">{blog.title}</h2>

              {/* Meta Information */}
              {blog.createdAt && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  <span>
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {/* Categories & Tags */}
              {(blog.categories && blog.categories.length > 0) || (blog.tags && blog.tags.length > 0) ? (
                <div className="mb-8 pb-6 border-b border-gray-200">
                  {blog.categories && blog.categories.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-gray-700 mr-2">Categories:</span>
                      <div className="inline-flex flex-wrap gap-2 mt-2">
                        {blog.categories.map((category) => (
                          <span
                            key={category._id || category}
                            className="bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium"
                          >
                            {typeof category === "object" ? category.name : category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {blog.tags && blog.tags.length > 0 && (
                    <div>
                      <span className="text-sm font-semibold text-gray-700 mr-2">Tags:</span>
                      <div className="inline-flex flex-wrap gap-2 mt-2">
                        {blog.tags.map((tag) => (
                          <span
                            key={tag._id || tag}
                            className="bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium"
                          >
                            {typeof tag === "object" ? tag.name : tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Description/Content */}
              <div
                ref={contentRef}
                className="prose prose-lg max-w-none text-gray-700 blog-content"
                dangerouslySetInnerHTML={{ __html: blog.description }}
                style={{ overflowX: "visible" }}
              />

              {/* FAQs Section */}
              {blog.faqs && Array.isArray(blog.faqs) && blog.faqs.length > 0 && (
                <div className="mt-12 pt-8 border-t-2 border-blue-100">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {blog.faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="border-2 border-blue-100 rounded-xl overflow-hidden bg-gradient-to-r from-white to-blue-50 shadow-md hover:shadow-xl transition-all duration-300 group/faq"
                      >
                        <button
                          onClick={() => setOpenFAQIndex(openFAQIndex === index ? null : index)}
                          className="w-full px-6 py-4 text-left flex justify-between items-center bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 transition-all duration-300"
                        >
                          <span className="font-semibold text-gray-900 pr-4 group-hover/faq:text-blue-700 transition-colors">{faq.question}</span>
                          <div className="p-1.5 bg-blue-100 rounded-lg group-hover/faq:bg-blue-200 transition-colors">
                            {openFAQIndex === index ? (
                              <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                        {openFAQIndex === index && (
                          <div className="px-6 py-4 bg-white border-t-2 border-blue-100">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        ) : (
          <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-xl p-8 text-center border-2 border-blue-100">
            <p className="text-gray-600 font-medium text-lg">No blog content available.</p>
          </div>
        )}
      </div>

      <Footer_Components />
    </div>
  );
}

