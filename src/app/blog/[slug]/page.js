"use client"

import Header_Components from "@/components/common_components/Header_components"
import Footer_Components from "@/components/common_components/Footer_components"
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import Head from "next/head"
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/schema"

export default function BlogPostPage() {
    const params = useParams()
    const slug = params?.slug
    const [blog, setBlog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [openFAQIndex, setOpenFAQIndex] = useState(null)
    const contentRef = useRef(null)

    // Add canonical URL, meta tags, and JSON-LD schema
    useEffect(() => {
        if (!blog) return;

        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const canonicalUrl = blog.canonicalUrl || `${baseUrl}/blog/${blog.slug}`;

        // Remove existing canonical link if any
        const existingCanonical = document.querySelector('link[rel="canonical"]');
        if (existingCanonical) {
            existingCanonical.remove();
        }

        // Add canonical link
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = canonicalUrl;
        document.head.appendChild(link);

        // Remove existing schema scripts
        const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
        existingSchemas.forEach(schema => schema.remove());

        // Generate and add Article schema
        try {
            const articleSchema = generateArticleSchema(blog);
            const articleScript = document.createElement('script');
            articleScript.type = 'application/ld+json';
            articleScript.text = JSON.stringify(articleSchema);
            articleScript.id = 'article-schema';
            document.head.appendChild(articleScript);
        } catch (error) {
            console.error("Error generating article schema:", error);
        }

        // Generate and add FAQ schema if FAQs exist
        if (blog.faqs && Array.isArray(blog.faqs) && blog.faqs.length > 0) {
            try {
                const faqSchema = generateFAQSchema(blog.faqs);
                if (faqSchema) {
                    const faqScript = document.createElement('script');
                    faqScript.type = 'application/ld+json';
                    faqScript.text = JSON.stringify(faqSchema);
                    faqScript.id = 'faq-schema';
                    document.head.appendChild(faqScript);
                }
            } catch (error) {
                console.error("Error generating FAQ schema:", error);
            }
        }

        // Generate and add Breadcrumb schema
        try {
            const breadcrumbItems = [
                { name: "Home", url: baseUrl },
                { name: "Blogs", url: `${baseUrl}/blog` },
                { name: blog.title, url: canonicalUrl },
            ];
            const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);
            if (breadcrumbSchema) {
                const breadcrumbScript = document.createElement('script');
                breadcrumbScript.type = 'application/ld+json';
                breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
                breadcrumbScript.id = 'breadcrumb-schema';
                document.head.appendChild(breadcrumbScript);
            }
        } catch (error) {
            console.error("Error generating breadcrumb schema:", error);
        }

        return () => {
            const canonical = document.querySelector('link[rel="canonical"]');
            if (canonical) {
                canonical.remove();
            }
            const schemas = document.querySelectorAll('script[type="application/ld+json"]');
            schemas.forEach(schema => schema.remove());
        };
    }, [blog, slug]);

    useEffect(() => {
        const fetchBlog = async () => {
            if (!slug) return

            try {
                setLoading(true)
                const res = await fetch(`/api/blogs/slug/${slug}`)
                const data = await res.json()

                if (data.success && data.blog) {
                    setBlog(data.blog)
                } else {
                    setError("Blog not found")
                }
            } catch (err) {
                console.error("Error fetching blog:", err)
                setError("Failed to load blog")
            } finally {
                setLoading(false)
            }
        }

        fetchBlog()
    }, [slug])

    // Wrap tables in scrollable containers for mobile
    useEffect(() => {
        if (!contentRef.current || !blog) return

        const wrapTables = () => {
            const contentDiv = contentRef.current
            if (!contentDiv) return

            const tables = contentDiv.querySelectorAll('table')

            tables.forEach((table) => {
                // Check if table is already wrapped
                if (table.parentElement?.classList.contains('table-scroll-wrapper')) {
                    return
                }

                // Create wrapper div with inline styles to ensure it works
                const wrapper = document.createElement('div')
                wrapper.className = 'table-scroll-wrapper'

                // Add inline styles as fallback - ensure scrolling works
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
                `

                // Ensure table has min-width that's larger than container to force scrolling
                const containerWidth = contentDiv.offsetWidth || window.innerWidth
                const minTableWidth = Math.max(600, containerWidth + 100) // At least 100px wider than container

                table.style.minWidth = `${minTableWidth}px`
                table.style.margin = '0'
                table.style.width = 'auto'
                table.style.maxWidth = 'none'
                table.style.display = 'table'

                // Wrap the table
                const parent = table.parentNode
                if (parent) {
                    parent.insertBefore(wrapper, table)
                    wrapper.appendChild(table)
                }
            })
        }

        // Try immediately
        wrapTables()

        // Also try after delays to catch dynamically loaded content
        const timeoutId1 = setTimeout(wrapTables, 100)
        const timeoutId2 = setTimeout(wrapTables, 500)

        // Use MutationObserver to catch any tables added later
        const observer = new MutationObserver(() => {
            setTimeout(wrapTables, 50)
        })
        if (contentRef.current) {
            observer.observe(contentRef.current, {
                childList: true,
                subtree: true
            })
        }

        return () => {
            clearTimeout(timeoutId1)
            clearTimeout(timeoutId2)
            observer.disconnect()
        }
    }, [blog])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <Header_Components />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                        <p className="text-gray-600 font-medium text-lg">Loading blog post...</p>
                    </div>
                </div>
                <Footer_Components />
            </div>
        )
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <Header_Components />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
                        <p className="text-gray-600 mb-6">{error || "The blog post you're looking for doesn't exist."}</p>
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <ArrowLeft size={18} />
                            Back to Blogs
                        </Link>
                    </div>
                </div>
                <Footer_Components />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-x-hidden">
            <Header_Components />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 overflow-x-hidden">
                {/* Back Button */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-600 mb-8 transition-colors font-semibold group"
                >
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <ArrowLeft size={18} className="text-blue-600" />
                    </div>
                    <span>Back to Blogs</span>
                </Link>

                {/* Blog Content */}
                <article className="bg-white rounded-2xl shadow-xl border border-blue-600 overflow-hidden">

                    {/* TOP SECTION */}
                    <div className="md:flex md:items-stretch relative">
                        {/* Image */}
                        {blog.image && (
                            <div className="md:w-1/2 w-full overflow-hidden">
                                <img
                                    src={blog.image}
                                    alt={blog.title}
                                    className="w-full h-[320px] md:h-full object-cover"
                                />
                            </div>
                        )}

                        {/* EXPERIENCE PANEL */}
                        <div className="md:w-1/2 w-full p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
                            <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                                {/* Gujarat Beyond Roads */} {blog.title}
                            </h2>
                            {/* <p>{blog.createdAt}</p> */}
                            {blog.createdAt && (
                            <p className="text-sm text-gray-500 mb-6">
                                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        )}

                            <p className="text-gray-600 text-lg mb-6">
                                Not just a journey — an experience of comfort, culture & local travel.
                            </p>

                            {/* ICON GRID */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {[
                                    "Comfort Ride",
                                    "Local Drivers",
                                    "Flexible Timing",
                                    "Trusted Service"
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="bg-white rounded-xl px-4 py-3 shadow-md text-sm font-semibold text-gray-800"
                                    >
                                        ✔ {item}
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <button className="w-fit px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:scale-105 transition">
                                Book Taxi Now
                            </button>
                        </div>
                    </div>

                    <div className="p-6 md:p-10">
                        {/* Title */}
                        {/* <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {blog.title}
                        </h1> */}

                        {/* Meta */}
                        {/* {blog.createdAt && (
                            <p className="text-sm text-gray-500 mb-6">
                                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        )} */}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {blog.tags?.map((tag) => (
                                <span
                                    key={tag._id || tag}
                                    className="bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium"
                                >
                                    {typeof tag === "object" ? tag.name : tag}
                                </span>
                            ))}
                        </div>

                        {/* MAIN DESCRIPTION */}
                        <div
                            ref={contentRef}
                            className="prose prose-lg max-w-none text-gray-700 blog-content"
                            dangerouslySetInnerHTML={{ __html: blog.description }}
                        />
                    </div>

                </article>
            </div>

            <Footer_Components />
        </div>
    )
}

