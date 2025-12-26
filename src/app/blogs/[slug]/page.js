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
            <div className="min-h-screen bg-gray-50">
                <Header_Components />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <p className="text-gray-600">Loading blog post...</p>
                    </div>
                </div>
                <Footer_Components />
            </div>
        )
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header_Components />
                <div className="max-w-7xl bottom-2  mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
                        <p className="text-gray-600 mb-6">{error || "The blog post you're looking for doesn't exist."}</p>
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
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
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
            <Header_Components />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden">
                {/* Back Button */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Blogs
                </Link>

                {/* Blog Content */}
                <article className="bg-white rounded-lg shadow-lg overflow-visible md:overflow-hidden">
                    <div className="pl-8 w-full border-2 flex justify-center items-center bg-blue-200">
                     {blog.image ? (
                        <img
                            src={blog.image}
                            alt={blog.title}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full  "
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            No Image
                        </div>
                    )}
                    </div>
                   

                    <div className="p-4 md:p-8 pt-4 overflow-visible md:overflow-hidden">
                        {/* Title */}
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {blog.title}
                        </h1>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                            {blog.createdAt && (
                                <span>
                                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}
                                </span>
                            )}
                        </div>

                        {/* Categories & Tags */}
                        {(blog.categories && blog.categories.length > 0) || (blog.tags && blog.tags.length > 0) ? (
                            <div className="mb-6 pb-4 border-b border-gray-200">
                                {blog.categories && blog.categories.length > 0 && (
                                    <div className="mb-3">
                                        <span className="text-sm font-semibold text-gray-700 mr-2">Categories:</span>
                                        <div className="inline-flex flex-wrap gap-2 mt-1">
                                            {blog.categories.map((category) => (
                                                <span
                                                    key={category._id || category}
                                                    className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium"
                                                >
                                                    {typeof category === 'object' ? category.name : category}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {blog.tags && blog.tags.length > 0 && (
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700 mr-2">Tags:</span>
                                        <div className="inline-flex flex-wrap gap-2 mt-1">
                                            {blog.tags.map((tag) => (
                                                <span
                                                    key={tag._id || tag}
                                                    className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium"
                                                >
                                                    {typeof tag === 'object' ? tag.name : tag}
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
                            style={{ overflowX: 'visible' }}
                        />

                        {/* FAQs Section */}
                        {blog.faqs && Array.isArray(blog.faqs) && blog.faqs.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-gray-200">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                                <div className="space-y-4">
                                    {blog.faqs.map((faq, index) => (
                                        <div
                                            key={index}
                                            className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <button
                                                onClick={() => setOpenFAQIndex(openFAQIndex === index ? null : index)}
                                                className="w-full px-6 py-4 text-left flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                            >
                                                <span className="font-semibold text-gray-900 pr-4">
                                                    {faq.question}
                                                </span>
                                                {openFAQIndex === index ? (
                                                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                )}
                                            </button>
                                            {openFAQIndex === index && (
                                                <div className="px-6 py-4 bg-white border-t border-gray-200">
                                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </article>
            </div>

            <Footer_Components />
        </div>
    )
}





